import { randomBytes } from "node:crypto"
import { connection } from "next/server"
import { attemptCheckout } from "@/lib/checkout/checkout"
import { getDb } from "@/lib/db/client"
import { productColumns, type ProductRow } from "@/lib/db/products"
import type { CardInput, Customer, Order, PlaceOrderResult } from "@/lib/types"

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

function createOrderId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(4)
  let id = "SM-"
  for (const byte of bytes) id += alphabet[byte % alphabet.length]
  return id
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

export async function checkoutAndSave(input: {
  items: { slug: string; quantity: number }[]
  customer: Customer
  card: CardInput
}): Promise<PlaceOrderResult> {
  await connection()
  const db = await getDb()
  return db.transaction(async (tx) => {
    const products = await tx.query<ProductRow>(`SELECT ${productColumns} FROM products`)
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
