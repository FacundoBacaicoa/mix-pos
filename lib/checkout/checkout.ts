import type {
  CardInput,
  CheckoutResult,
  Customer,
  FieldErrors,
  ProductSnapshot,
} from "../types"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function digits(value: string): string {
  return value.replace(/\D/g, "")
}

function luhnOk(value: string): boolean {
  if (!/^\d{15,16}$/.test(value)) return false
  let sum = 0
  let alternate = false
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let n = value.charCodeAt(index) - 48
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}

function expiryEnd(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/)
  if (!match) return null
  const month = Number(match[1])
  if (month < 1 || month > 12) return null
  const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2])
  return new Date(Date.UTC(year, month, 1))
}

function collectFieldErrors(customer: Customer, card: CardInput, now: Date): FieldErrors {
  const fieldErrors: FieldErrors = {}
  const name = customer.name.trim()
  const email = customer.email.trim()
  const phone = customer.phone.trim()
  const address = customer.address.trim()
  const city = customer.city.trim()
  const cardName = card.name.trim()
  const pan = digits(card.number)
  const cvc = digits(card.cvc)

  if (name.length < 2 || name.length > 80) {
    fieldErrors.name = "Escribí el nombre de quien recibe."
  }
  if (!EMAIL.test(email) || email.length > 120) {
    fieldErrors.email = "El email no es válido."
  }
  if (digits(phone).length < 8 || phone.length > 30) {
    fieldErrors.phone = "El teléfono necesita al menos 8 números."
  }
  if (address.length < 6 || address.length > 160) {
    fieldErrors.address = "Falta la calle y el número."
  }
  if (city.length < 2 || city.length > 80) {
    fieldErrors.city = "Falta la ciudad."
  }
  if (pan.length === 0) {
    fieldErrors.cardNumber = "Falta el número de tarjeta."
  } else if (!luhnOk(pan)) {
    fieldErrors.cardNumber = "El número de tarjeta no es válido."
  }
  const expiry = expiryEnd(card.expiry)
  if (!expiry || now.getTime() >= expiry.getTime()) {
    fieldErrors.expiry = "La tarjeta está vencida o la fecha no se entiende."
  }
  if (cvc.length < 3 || cvc.length > 4) {
    fieldErrors.cvc = "El código de seguridad tiene 3 o 4 números."
  }
  if (cardName.length < 2 || cardName.length > 80) {
    fieldErrors.cardName = "Falta el nombre en la tarjeta."
  }

  return fieldErrors
}

export function attemptCheckout(input: {
  products: ProductSnapshot[]
  items: { slug: string; quantity: number }[]
  customer: Customer
  card: CardInput
  now: Date
  orderId: string
}): CheckoutResult {
  if (input.items.length === 0) {
    return { ok: false, code: "empty", message: "El carrito está vacío." }
  }

  if (
    input.items.length > 30 ||
    input.items.some(
      (item) =>
        typeof item.slug !== "string" ||
        item.slug.length === 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99,
    )
  ) {
    return {
      ok: false,
      code: "validation",
      message: "Revisá las cantidades del carrito.",
      fieldErrors: { items: "Las cantidades tienen que ser enteras, entre 1 y 99." },
    }
  }

  const fieldErrors = collectFieldErrors(input.customer, input.card, input.now)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "validation",
      message: "Revisá los datos marcados.",
      fieldErrors,
    }
  }

  const bySlug = new Map(input.products.map((product) => [product.slug, product]))
  const merged = new Map<string, number>()
  for (const item of input.items) {
    merged.set(item.slug, (merged.get(item.slug) ?? 0) + item.quantity)
  }

  const problems: string[] = []
  for (const [slug, quantity] of merged) {
    const product = bySlug.get(slug)
    if (!product) {
      problems.push("Hay un mix en el carrito que ya no está a la venta.")
      continue
    }
    if (quantity > product.stock) {
      problems.push(
        product.stock <= 0
          ? `${product.name} está agotado.`
          : `${product.name}: pediste ${quantity} y quedan ${product.stock}.`,
      )
    }
  }
  if (problems.length > 0) {
    return { ok: false, code: "stock", message: problems.join(" ") }
  }

  const pan = digits(input.card.number)
  if (pan.endsWith("0002")) {
    return {
      ok: false,
      code: "payment",
      message: "El banco rechazó la tarjeta. No se creó el pedido y el stock sigue igual.",
    }
  }

  const stock = Object.fromEntries(input.products.map((product) => [product.slug, product.stock]))
  const items = [...merged.entries()].map(([slug, quantity]) => {
    const product = bySlug.get(slug)!
    stock[slug] = product.stock - quantity
    return {
      slug: product.slug,
      name: product.name,
      weightLabel: product.weightLabel,
      quantity,
      unitPrice: product.price,
    }
  })
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  return {
    ok: true,
    stock,
    order: {
      id: input.orderId,
      createdAt: input.now.toISOString(),
      customer: {
        name: input.customer.name.trim(),
        email: input.customer.email.trim(),
        phone: input.customer.phone.trim(),
        address: input.customer.address.trim(),
        city: input.customer.city.trim(),
      },
      items,
      total,
      last4: pan.slice(-4),
    },
  }
}
