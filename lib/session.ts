import { createHmac, timingSafeEqual } from "node:crypto"

export const ADMIN_COOKIE = "semilla_admin"
const MAX_AGE_MS = 12 * 60 * 60 * 1000

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_MS / 1000,
}

function secret(): string | null {
  const value = process.env.SESSION_SECRET
  if (value && value.length >= 16) return value
  if (process.env.NODE_ENV === "production") return null
  return "semilla-dev-session-key"
}

export function createSessionToken(username: string, now = Date.now()): string | null {
  const key = secret()
  if (!key) return null
  const body = Buffer.from(JSON.stringify({ u: username, exp: now + MAX_AGE_MS })).toString("base64url")
  const sig = createHmac("sha256", key).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function readSession(token: string | undefined, now?: number): { username: string } | null {
  if (!token) return null
  const clock = now ?? Date.now()
  const key = secret()
  if (!key) return null
  const dot = token.lastIndexOf(".")
  if (dot <= 0) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = createHmac("sha256", key).update(body).digest("base64url")
  const actual = Buffer.from(sig)
  const wanted = Buffer.from(expected)
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) return null
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      u?: unknown
      exp?: unknown
    }
    if (typeof parsed.u !== "string" || parsed.u.length === 0) return null
    if (typeof parsed.exp !== "number" || parsed.exp < clock) return null
    return { username: parsed.u }
  } catch {
    return null
  }
}
