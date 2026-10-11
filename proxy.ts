import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_COOKIE, readSession } from "@/lib/auth/session"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith("/admin")) return NextResponse.next()

  const session = readSession(request.cookies.get(ADMIN_COOKIE)?.value)
  const login = new URL("/admin/login", request.url)

  if (pathname === "/admin/login") {
    if (session) return NextResponse.redirect(new URL("/admin", request.url))
    return NextResponse.next()
  }

  if (!session) return NextResponse.redirect(login)
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
