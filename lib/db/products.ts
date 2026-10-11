import { connection } from "next/server"
import { pigmentFor, slugify, type ProductDraft } from "@/lib/catalog/fields"
import { getDb } from "@/lib/db/client"
import type { MixStock } from "@/lib/types"

export type ProductRow = {
  slug: string
  name: string
  weight_label: string
  price: number
  summary: string
  description: string
  ingredients: string
  allergens: string
  stock: number
  pigment: string
  image_file: string | null
}

export const productColumns = `slug, name, weight_label, price, summary, description, ingredients, allergens, stock, pigment, image_file`

function asList(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

function toMix(row: ProductRow): MixStock {
  return {
    slug: row.slug,
    name: row.name,
    weightLabel: row.weight_label,
    price: row.price,
    summary: row.summary,
    description: row.description,
    ingredients: asList(row.ingredients),
    allergens: asList(row.allergens),
    initialStock: row.stock,
    pigment: row.pigment,
    stock: row.stock,
    imageFile: row.image_file,
  }
}

export async function getMixes(): Promise<MixStock[]> {
  await connection()
  const db = await getDb()
  const result = await db.query<ProductRow>(
    `SELECT ${productColumns} FROM products ORDER BY sort_order, name`,
  )
  return result.rows.map(toMix)
}

export async function getProduct(slug: string): Promise<MixStock | null> {
  await connection()
  const db = await getDb()
  const result = await db.query<ProductRow>(
    `SELECT ${productColumns} FROM products WHERE slug = $1`,
    [slug],
  )
  const row = result.rows[0]
  return row ? toMix(row) : null
}

export async function getStockMap(): Promise<Record<string, number>> {
  await connection()
  const db = await getDb()
  const result = await db.query<{ slug: string; stock: number }>("SELECT slug, stock FROM products")
  return Object.fromEntries(result.rows.map((row) => [row.slug, row.stock]))
}

export async function insertProduct(draft: ProductDraft, imageFile: string | null): Promise<string> {
  const db = await getDb()
  const base = slugify(draft.name).slice(0, 54)
  if (!base) throw new Error("slug vacío")
  let slug = base
  let suffix = 2
  while ((await db.query("SELECT slug FROM products WHERE slug = $1", [slug])).rows.length > 0) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  const now = new Date().toISOString()
  const order = await db.query<{ next: number }>(
    "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM products",
  )
  await db.query(
    `INSERT INTO products (
       slug, name, weight_label, price, summary, description, ingredients, allergens,
       stock, pigment, image_file, sort_order, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)`,
    [
      slug,
      draft.name,
      draft.weightLabel,
      draft.price,
      draft.summary,
      draft.description,
      JSON.stringify(draft.ingredients),
      JSON.stringify(draft.allergens),
      draft.stock,
      pigmentFor(slug),
      imageFile,
      Number(order.rows[0]?.next ?? 0),
      now,
    ],
  )
  return slug
}

export async function updateProduct(
  slug: string,
  draft: ProductDraft,
  imageFile: string | null | undefined,
): Promise<string | null> {
  const db = await getDb()
  const current = await db.query<{ image_file: string | null }>(
    "SELECT image_file FROM products WHERE slug = $1",
    [slug],
  )
  const row = current.rows[0]
  if (!row) return null
  const nextImage = imageFile === undefined ? row.image_file : imageFile
  await db.query(
    `UPDATE products SET
       name = $2,
       weight_label = $3,
       price = $4,
       summary = $5,
       description = $6,
       ingredients = $7,
       allergens = $8,
       stock = $9,
       image_file = $10,
       updated_at = $11
     WHERE slug = $1`,
    [
      slug,
      draft.name,
      draft.weightLabel,
      draft.price,
      draft.summary,
      draft.description,
      JSON.stringify(draft.ingredients),
      JSON.stringify(draft.allergens),
      draft.stock,
      nextImage,
      new Date().toISOString(),
    ],
  )
  return row.image_file
}

export async function deleteProductRow(slug: string): Promise<string | null> {
  const db = await getDb()
  const current = await db.query<{ image_file: string | null }>(
    "SELECT image_file FROM products WHERE slug = $1",
    [slug],
  )
  await db.query("DELETE FROM products WHERE slug = $1", [slug])
  return current.rows[0]?.image_file ?? null
}
