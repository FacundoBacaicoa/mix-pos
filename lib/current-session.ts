import { cookies, headers } from "next/headers"
import { connection } from "next/server"
import { ADMIN_COOKIE, readSession } from "@/lib/session"

function tokenFrom(cookieHeader: string | null, fromJar: string | undefined): string | undefined {
  if (fromJar) return fromJar
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (name === ADMIN_COOKIE) return decodeURIComponent(rest.join("="))
  }
  return undefined
}

export async function getSession(): Promise<{ username: string } | null> {
  const jar = await cookies()
  const headerList = await headers()
  const token = tokenFrom(headerList.get("cookie"), jar.get(ADMIN_COOKIE)?.value)
  if (!token) return null
  await connection()
  return readSession(token)
}
