import { mkdir } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { PGlite } from "@electric-sql/pglite"
import { mixes } from "@/lib/catalog/seed"
import { hashPassword, ownerCredentials } from "@/lib/auth/password"

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  username text PRIMARY KEY,
  password_hash text NOT NULL,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  slug text PRIMARY KEY,
  name text NOT NULL,
  weight_label text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  summary text NOT NULL,
  description text NOT NULL,
  ingredients text NOT NULL,
  allergens text NOT NULL,
  stock integer NOT NULL CHECK (stock >= 0),
  pigment text NOT NULL,
  image_file text,
  sort_order integer NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  created_at text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  customer_city text NOT NULL,
  total integer NOT NULL,
  last4 text NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  order_id text NOT NULL REFERENCES orders (id),
  position integer NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  weight_label text NOT NULL,
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  PRIMARY KEY (order_id, position)
);
`

export function semillaDir(): string {
  return process.env.SEMILLA_DATA_DIR || path.join(os.tmpdir(), "semilla")
}

export function mediaDir(): string {
  return path.join(semillaDir(), "media")
}

const globalForDb = globalThis as unknown as { semillaDb?: Promise<PGlite> }

export function getDb(): Promise<PGlite> {
  if (!globalForDb.semillaDb) globalForDb.semillaDb = openDb()
  return globalForDb.semillaDb.then((db) => {
    if (!db.closed) return db
    globalForDb.semillaDb = openDb()
    return globalForDb.semillaDb
  })
}

async function openDb(): Promise<PGlite> {
  const dir = path.join(semillaDir(), "pg")
  await mkdir(dir, { recursive: true })
  await mkdir(mediaDir(), { recursive: true })
  const db = new PGlite(dir)
  await db.waitReady
  await db.exec(SCHEMA)
  await seed(db)
  await db.syncToFs()
  return db
}

async function seed(db: PGlite): Promise<void> {
  const creds = ownerCredentials()
  const now = new Date().toISOString()
  if (creds) {
    const passwordHash = await hashPassword(creds.password)
    await db.transaction(async (tx) => {
      await tx.query("DELETE FROM users WHERE username <> $1", [creds.username])
      await tx.query(
        `INSERT INTO users (username, password_hash, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [creds.username, passwordHash, now],
      )
    })
  }

  const existing = await db.query<{ slug: string }>("SELECT slug FROM products LIMIT 1")
  if (existing.rows.length > 0) return

  await db.transaction(async (tx) => {
    for (const [index, mix] of mixes.entries()) {
      await tx.query(
        `INSERT INTO products (
           slug, name, weight_label, price, summary, description, ingredients, allergens,
           stock, pigment, image_file, sort_order, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, $11, $12, $12)`,
        [
          mix.slug,
          mix.name,
          mix.weightLabel,
          mix.price,
          mix.summary,
          mix.description,
          JSON.stringify(mix.ingredients),
          JSON.stringify(mix.allergens),
          mix.initialStock,
          mix.pigment,
          index,
          now,
        ],
      )
    }
  })
}
