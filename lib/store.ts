import { randomBytes } from "node:crypto"
import { connection } from "next/server"
import { getDb } from "@/lib/db"
import { attemptCheckout } from "@/lib/checkout"
import { pigmentFor, slugify, type ProductDraft } from "@/lib/fields"
import type { CardInput, Customer, MixStock, Order, PlaceOrderResult } from "@/lib/types"

type ProductRow = {
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

type OrderRow = {
  id: string
  created_at: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  total: number
  last4: string
}

type ItemRow = {
  slug: string
  name: string
  weight_label: string
  quantity: number
  unit_price: number
}

const PRODUCT_COLUMNS = `slug, name, weight_label, price, summary, description, ingredients, allergens, stock, pigment, image_file`

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
    `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY sort_order, name`,
  )
  return result.rows.map(toMix)
}

export async function getProduct(slug: string): Promise<MixStock | null> {
  await connection()
  const db = await getDb()
  const result = await db.query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE slug = $1`,
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

export async function getOrder(id: string): Promise<Order | null> {
  await connection()
  const db = await getDb()
  const orders = await db.query<OrderRow>("SELECT * FROM orders WHERE id = $1", [id])
  const order = orders.rows[0]
  if (!order) return null
  const items = await db.query<ItemRow>(
    "SELECT slug, name, weight_label, quantity, unit_price FROM order_items WHERE order_id = $1 ORDER BY position",
    [id],
  )
  return {
    id: order.id,
    createdAt: order.created_at,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.customer_address,
      city: order.customer_city,
    },
    items: items.rows.map((item) => ({
      slug: item.slug,
      name: item.name,
      weightLabel: item.weight_label,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
    total: order.total,
    last4: order.last4,
  }
}

function createOrderId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(4)
  let id = "SM-"
  for (const byte of bytes) id += alphabet[byte % alphabet.length]
  return id
}

export async function checkoutAndSave(input: {
  items: { slug: string; quantity: number }[]
  customer: Customer
  card: CardInput
}): Promise<PlaceOrderResult> {
  await connection()
  const db = await getDb()
  return db.transaction(async (tx) => {
    const products = await tx.query<ProductRow>(`SELECT ${PRODUCT_COLUMNS} FROM products`)
    const taken = await tx.query<{ id: string }>("SELECT id FROM orders")
    const used = new Set(taken.rows.map((row) => row.id))
    let orderId = createOrderId()
    while (used.has(orderId)) orderId = createOrderId()

    const result = attemptCheckout({
      products: products.rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        weightLabel: row.weight_label,
        price: row.price,
        stock: row.stock,
      })),
      items: input.items,
      customer: input.customer,
      card: input.card,
      now: new Date(),
      orderId,
    })
    if (!result.ok) return result

    const now = result.order.createdAt
    for (const [slug, stock] of Object.entries(result.stock)) {
      await tx.query("UPDATE products SET stock = $1, updated_at = $2 WHERE slug = $3", [
        stock,
        now,
        slug,
      ])
    }
    await tx.query(
      `INSERT INTO orders (
         id, created_at, customer_name, customer_email, customer_phone, customer_address, customer_city, total, last4
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        result.order.id,
        now,
        result.order.customer.name,
        result.order.customer.email,
        result.order.customer.phone,
        result.order.customer.address,
        result.order.customer.city,
        result.order.total,
        result.order.last4,
      ],
    )
    for (const [position, item] of result.order.items.entries()) {
      await tx.query(
        `INSERT INTO order_items (order_id, position, slug, name, weight_label, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [result.order.id, position, item.slug, item.name, item.weightLabel, item.quantity, item.unitPrice],
      )
    }
    return { ok: true as const, order: result.order }
  })
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
