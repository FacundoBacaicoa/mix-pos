import { randomBytes } from "node:crypto"
import { connection } from "next/server"
import { getDb } from "@/lib/db/client"
import type { PromoSlide } from "@/lib/types"

export const MAX_PROMOS = 12

type PromoRow = {
  id: string
  image_file: string
  title: string
  href: string | null
}

function toSlide(row: PromoRow): PromoSlide {
  return {
    id: row.id,
    imageFile: row.image_file,
    title: row.title,
    href: row.href,
  }
}

export async function getPromos(): Promise<PromoSlide[]> {
  await connection()
  const db = await getDb()
  const result = await db.query<PromoRow>(
    "SELECT id, image_file, title, href FROM promos ORDER BY position, created_at",
  )
  return result.rows.map(toSlide)
}

export async function countPromos(): Promise<number> {
  const db = await getDb()
  const result = await db.query<{ count: string | number }>("SELECT COUNT(*) AS count FROM promos")
  return Number(result.rows[0]?.count ?? 0)
}

export async function insertPromo(input: {
  imageFile: string
  title: string
  href: string | null
}): Promise<string> {
  const db = await getDb()
  const id = randomBytes(6).toString("hex")
  const now = new Date().toISOString()
  await db.query(
    `INSERT INTO promos (id, image_file, title, href, position, created_at)
     VALUES (
       $1, $2, $3, $4,
       (SELECT COALESCE(MAX(position), -1) + 1 FROM promos),
       $5
     )`,
    [id, input.imageFile, input.title, input.href, now],
  )
  return id
}

export async function deletePromoRow(id: string): Promise<string | null> {
  const db = await getDb()
  const result = await db.query<{ image_file: string }>(
    "DELETE FROM promos WHERE id = $1 RETURNING image_file",
    [id],
  )
  return result.rows[0]?.image_file ?? null
}

export async function shiftPromo(id: string, direction: "up" | "down"): Promise<void> {
  const db = await getDb()
  const rows = await db.query<{ id: string }>(
    "SELECT id FROM promos ORDER BY position, created_at",
  )
  const order = rows.rows.map((row) => row.id)
  const index = order.indexOf(id)
  const swapWith = direction === "up" ? index - 1 : index + 1
  if (index < 0 || swapWith < 0 || swapWith >= order.length) return
  const current = order[index]
  const other = order[swapWith]
  if (!current || !other) return
  order[index] = other
  order[swapWith] = current
  await db.transaction(async (tx) => {
    for (const [position, promoId] of order.entries()) {
      await tx.query("UPDATE promos SET position = $2 WHERE id = $1", [promoId, position])
    }
  })
}
