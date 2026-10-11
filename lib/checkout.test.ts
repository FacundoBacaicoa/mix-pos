import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { attemptCheckout } from "./checkout.ts"
import type { CardInput, Customer, ProductSnapshot } from "./types.ts"

const now = new Date("2026-10-11T15:00:00.000Z")

const products: ProductSnapshot[] = [
  { slug: "energia", name: "Mix Energía", weightLabel: "250 g", price: 8900, stock: 18 },
  { slug: "cacao", name: "Mix Cacao amargo", weightLabel: "250 g", price: 9100, stock: 2 },
  { slug: "sendero", name: "Mix Sendero", weightLabel: "300 g", price: 7800, stock: 0 },
]

const customer: Customer = {
  name: "Ana Pérez",
  email: "ana@correo.com",
  phone: "11 5555 0101",
  address: "Av. Córdoba 4120",
  city: "Buenos Aires",
}

const card: CardInput = {
  number: "4242 4242 4242 4242",
  expiry: "10/28",
  cvc: "123",
  name: "Ana Perez",
}

function pay(overrides: Partial<Parameters<typeof attemptCheckout>[0]> = {}) {
  return attemptCheckout({
    products,
    items: [{ slug: "energia", quantity: 2 }],
    customer,
    card,
    now,
    orderId: "SM-TEST",
    ...overrides,
  })
}

describe("attemptCheckout", () => {
  it("confirma el pedido y descuenta solo lo comprado", () => {
    const before = products.map((product) => product.stock)
    const result = pay({
      items: [
        { slug: "energia", quantity: 2 },
        { slug: "cacao", quantity: 1 },
      ],
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.order.id, "SM-TEST")
    assert.equal(result.order.total, 8900 * 2 + 9100)
    assert.equal(result.order.last4, "4242")
    assert.equal(result.stock.energia, 16)
    assert.equal(result.stock.cacao, 1)
    assert.equal(result.stock.sendero, 0)
    assert.deepEqual(
      products.map((product) => product.stock),
      before,
    )
  })

  it("suma cantidades repetidas del mismo mix", () => {
    const result = pay({
      items: [
        { slug: "cacao", quantity: 1 },
        { slug: "cacao", quantity: 1 },
      ],
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.order.items[0]?.quantity, 2)
    assert.equal(result.stock.cacao, 0)
  })

  it("rechaza la tarjeta de prueba sin tocar el stock", () => {
    const result = pay({
      card: { ...card, number: "4000 0000 0000 0002" },
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, "payment")
    assert.match(result.message, /rechazó/)
  })

  it("avisa cuando no alcanza el stock", () => {
    const result = pay({ items: [{ slug: "cacao", quantity: 3 }] })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, "stock")
    assert.match(result.message, /quedan 2/)
  })

  it("no vende un mix agotado", () => {
    const result = pay({ items: [{ slug: "sendero", quantity: 1 }] })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, "stock")
    assert.match(result.message, /agotado/)
  })

  it("prioriza el error de stock antes que el rechazo del banco", () => {
    const result = pay({
      items: [{ slug: "sendero", quantity: 1 }],
      card: { ...card, number: "4000000000000002" },
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, "stock")
  })

  it("exige un carrito con cantidades enteras", () => {
    const empty = pay({ items: [] })
    assert.equal(empty.ok, false)
    if (!empty.ok) assert.equal(empty.code, "empty")

    const fractional = pay({ items: [{ slug: "energia", quantity: 1.5 }] })
    assert.equal(fractional.ok, false)
    if (!fractional.ok) assert.equal(fractional.code, "validation")
  })

  it("marca los datos de pago inválidos", () => {
    const result = pay({
      customer: { ...customer, email: "ana" },
      card: { ...card, number: "4242", expiry: "09/26", cvc: "12" },
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, "validation")
    assert.equal(result.fieldErrors?.email, "El email no es válido.")
    assert.equal(result.fieldErrors?.cardNumber, "El número de tarjeta no es válido.")
    assert.match(result.fieldErrors?.expiry ?? "", /vencida/)
    assert.match(result.fieldErrors?.cvc ?? "", /3 o 4/)
  })

  it("acepta el mes en curso y rechaza el mes anterior", () => {
    const current = pay({ card: { ...card, expiry: "10/26" } })
    assert.equal(current.ok, true)
    const previous = pay({ card: { ...card, expiry: "09/26" } })
    assert.equal(previous.ok, false)
    if (!previous.ok) assert.equal(previous.fieldErrors?.expiry !== undefined, true)
  })

  it("no vende un mix que no está en el catálogo", () => {
    const result = pay({ items: [{ slug: "fantasma", quantity: 1 }] })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, "stock")
  })
})
