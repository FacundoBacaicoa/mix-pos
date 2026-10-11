import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

export function ownerCredentials(): { username: string; password: string } | null {
  const username = (process.env.ADMIN_USERNAME || "dueno").trim()
  const password =
    process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "semilla-dev")
  if (!username || !password) return null
  return { username, password }
}

export function devLoginHint(): { username: string; password: string } | null {
  if (process.env.NODE_ENV === "production") return null
  if (process.env.ADMIN_PASSWORD) return null
  const creds = ownerCredentials()
  return creds
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = (await scryptAsync(password, salt, 32)) as Buffer
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split(":")
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, "hex")
  const expected = Buffer.from(hashHex, "hex")
  const hash = (await scryptAsync(password, salt, expected.length)) as Buffer
  if (hash.length !== expected.length) return false
  return timingSafeEqual(hash, expected)
}
