import { randomBytes } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { connection } from "next/server"
import { mixes } from "@/lib/catalog"
import { attemptCheckout } from "@/lib/checkout"
import type { CardInput, Customer, MixStock, Order, PlaceOrderResult } from "@/lib/types"

type Persisted = {
  stock: Record<string, number>
  orders: Order[]
}

function storeFile(): string {
  // Fuera del repo: un JSON dentro del proyecto reinicia `next dev` en cada venta.
  const dir = process.env.SEMILLA_DATA_DIR || "/tmp"
  return path.join(dir, "semilla-store.json")
}

let queue: Promise<void> = Promise.resolve()

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function seedStock(): Record<string, number> {
  return Object.fromEntries(mixes.map((mix) => [mix.slug, mix.initialStock]))
}

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") return false
  const order = value as Order
  return typeof order.id === "string" && Array.isArray(order.items)
}

function normalize(raw: unknown): Persisted {
  const record = raw && typeof raw === "object" ? (raw as Partial<Persisted>) : {}
  const incoming =
    record.stock && typeof record.stock === "object" ? record.stock : {}
  const stock = seedStock()
  for (const mix of mixes) {
    const value = incoming[mix.slug]
    if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
      stock[mix.slug] = value
    }
  }
  const orders = Array.isArray(record.orders) ? record.orders.filter(isOrder) : []
  return { stock, orders }
}

async function write(data: Persisted): Promise<void> {
  const file = storeFile()
  await mkdir(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(data))
  await rename(tmp, file)
}

async function read(): Promise<Persisted> {
  try {
    const raw = await readFile(storeFile(), "utf8")
    return normalize(JSON.parse(raw) as unknown)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    const initial = { stock: seedStock(), orders: [] as Order[] }
    await write(initial)
    return initial
  }
}

function withStock(stock: Record<string, number>): MixStock[] {
  return mixes.map((mix) => ({ ...mix, stock: stock[mix.slug] ?? 0 }))
}

export async function getMixes(): Promise<MixStock[]> {
  await connection()
  return withLock(async () => withStock((await read()).stock))
}

export async function getStockMap(): Promise<Record<string, number>> {
  await connection()
  return withLock(async () => ({ ...(await read()).stock }))
}

export async function getOrder(id: string): Promise<Order | null> {
  await connection()
  return withLock(async () => (await read()).orders.find((order) => order.id === id) ?? null)
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
  return withLock(async () => {
    const data = await read()
    const taken = new Set(data.orders.map((order) => order.id))
    let orderId = createOrderId()
    while (taken.has(orderId)) orderId = createOrderId()

    const result = attemptCheckout({
      products: mixes.map((mix) => ({
        slug: mix.slug,
        name: mix.name,
        weightLabel: mix.weightLabel,
        price: mix.price,
        stock: data.stock[mix.slug] ?? 0,
      })),
      items: input.items,
      customer: input.customer,
      card: input.card,
      now: new Date(),
      orderId,
    })

    if (!result.ok) return result

    data.stock = result.stock
    data.orders.unshift(result.order)
    await write(data)
    return { ok: true, order: result.order }
  })
}
