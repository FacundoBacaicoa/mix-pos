const PIGMENTS = [
  "#c4654a",
  "#7d3c5a",
  "#3f6b4a",
  "#8a6a3b",
  "#a68452",
  "#4a342c",
  "#c4893a",
  "#d08a2c",
]

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export function pigmentFor(slug: string): string {
  let hash = 0
  for (const char of slug) hash = (hash + char.charCodeAt(0)) % PIGMENTS.length
  return PIGMENTS[hash] ?? PIGMENTS[0]
}

export function parsePesos(value: string): number | null {
  const digits = value.replace(/\D/g, "")
  if (!digits) return null
  const amount = Number(digits)
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000_000) return null
  return amount
}

export function parseStock(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const stock = Number(trimmed)
  if (stock > 9999) return null
  return stock
}

export function parseLines(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export type ProductDraft = {
  name: string
  weightLabel: string
  price: number
  summary: string
  description: string
  ingredients: string[]
  allergens: string[]
  stock: number
}

export type ProductField = keyof ProductDraft | "image"

export function readProductDraft(input: {
  name: string
  weightLabel: string
  price: string
  summary: string
  description: string
  ingredients: string
  allergens: string
  stock: string
}): { draft?: ProductDraft; fieldErrors: Partial<Record<ProductField, string>> } {
  const fieldErrors: Partial<Record<ProductField, string>> = {}
  const name = input.name.trim()
  const weightLabel = input.weightLabel.trim()
  const summary = input.summary.trim()
  const description = input.description.trim()
  const ingredients = parseLines(input.ingredients)
  const allergens = parseLines(input.allergens)
  const price = parsePesos(input.price)
  const stock = parseStock(input.stock)

  if (name.length < 2 || name.length > 80) fieldErrors.name = "El nombre tiene que tener entre 2 y 80 caracteres."
  if (weightLabel.length < 1 || weightLabel.length > 40) fieldErrors.weightLabel = "Indicá el peso, por ejemplo 250 g."
  if (price === null) fieldErrors.price = "El precio va en pesos, sin centavos."
  if (summary.length < 2 || summary.length > 180) fieldErrors.summary = "El resumen tiene que tener entre 2 y 180 caracteres."
  if (description.length < 2 || description.length > 2000) {
    fieldErrors.description = "La descripción tiene que tener entre 2 y 2000 caracteres."
  }
  if (ingredients.length < 1 || ingredients.length > 40 || ingredients.some((line) => line.length > 80)) {
    fieldErrors.ingredients = "Escribí al menos un ingrediente, uno por línea."
  }
  if (allergens.length < 1 || allergens.length > 20 || allergens.some((line) => line.length > 80)) {
    fieldErrors.allergens = "Escribí al menos un alérgeno, uno por línea."
  }
  if (stock === null) fieldErrors.stock = "El stock es un número entero entre 0 y 9999."

  if (
    price === null ||
    stock === null ||
    Object.keys(fieldErrors).length > 0
  ) {
    return { fieldErrors }
  }

  return {
    fieldErrors,
    draft: { name, weightLabel, price, summary, description, ingredients, allergens, stock },
  }
}
