"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import { readProductDraft, type ProductField } from "@/lib/fields"
import { clearLoginFailures, loginBlocked, registerLoginFailure } from "@/lib/login-guard"
import { removeImage, saveImage } from "@/lib/media"
import { hashPassword, verifyPassword } from "@/lib/password"
import { ADMIN_COOKIE, createSessionToken, readSession, sessionCookieOptions } from "@/lib/session"
import { deleteProductRow, insertProduct, updateProduct } from "@/lib/store"

export type LoginState = { message?: string }

export type ProductFormState = {
  message?: string
  fieldErrors?: Partial<Record<ProductField, string>>
}

let dummyHash: Promise<string> | null = null

function placeholderHash() {
  dummyHash ??= hashPassword("not-the-owner")
  return dummyHash
}

function clientKey(ip: string): string {
  return ip.slice(0, 80)
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const headerList = await headers()
  const ip = clientKey(headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local")
  if (loginBlocked(ip)) {
    return { message: "Demasiados intentos. Esperá un minuto e intentá de nuevo." }
  }

  const db = await getDb()
  const found = await db.query<{ username: string; password_hash: string }>(
    "SELECT username, password_hash FROM users WHERE username = $1",
    [username],
  )
  const row = found.rows[0]
  if (!row) {
    const anyUser = await db.query("SELECT username FROM users LIMIT 1")
    if (anyUser.rows.length === 0) {
      return { message: "Falta configurar la cuenta del dueño. Definí ADMIN_PASSWORD y reiniciá." }
    }
    await verifyPassword(password, await placeholderHash())
    registerLoginFailure(ip)
    return { message: "Esos datos no coinciden." }
  }

  const ok = await verifyPassword(password, row.password_hash)
  if (!ok) {
    registerLoginFailure(ip)
    return { message: "Esos datos no coinciden." }
  }

  clearLoginFailures(ip)
  const token = createSessionToken(row.username)
  if (!token) return { message: "Falta SESSION_SECRET para abrir la sesión." }
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, token, sessionCookieOptions)
  redirect("/admin")
}

export async function logoutAction() {
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 })
  redirect("/admin/login")
}

async function requireUser() {
  const jar = await cookies()
  const headerList = await headers()
  const fromHeader = headerList
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1)
  const fromJar = jar.get(ADMIN_COOKIE)?.value
  const headerToken = fromHeader ? decodeURIComponent(fromHeader) : undefined
  const session = readSession(fromJar) ?? readSession(headerToken)
  if (!session) redirect("/admin/login")
  return session
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "")
}

function refreshShop(slug: string) {
  revalidatePath("/")
  revalidatePath("/carrito")
  revalidatePath("/pagar")
  revalidatePath("/admin")
  revalidatePath(`/producto/${slug}`)
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireUser()
  const parsed = readProductDraft({
    name: text(formData, "name"),
    weightLabel: text(formData, "weightLabel"),
    price: text(formData, "price"),
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    ingredients: text(formData, "ingredients"),
    allergens: text(formData, "allergens"),
    stock: text(formData, "stock"),
  })
  const image = formData.get("image")
  let imageError: string | undefined
  let savedName: string | undefined
  if (image instanceof File && image.size > 0) {
    const saved = await saveImage(image)
    if (!saved.ok) imageError = saved.message
    else savedName = saved.name
  }

  if (!parsed.draft || imageError) {
    if (savedName) await removeImage(savedName)
    return {
      message: "Revisá los datos marcados.",
      fieldErrors: { ...parsed.fieldErrors, ...(imageError ? { image: imageError } : {}) },
    }
  }

  const slug = text(formData, "slug").trim()
  if (slug) {
    const previousImage = await updateProduct(slug, parsed.draft, savedName ?? undefined)
    if (previousImage === null) {
      if (savedName) await removeImage(savedName)
      return { message: "Ese mix ya no está en la tienda." }
    }
    if (savedName && previousImage && previousImage !== savedName) await removeImage(previousImage)
    refreshShop(slug)
    redirect("/admin?guardado=1")
  }

  const created = await insertProduct(parsed.draft, savedName ?? null)
  refreshShop(created)
  redirect("/admin?guardado=1")
}

export async function deleteProduct(slug: string) {
  await requireUser()
  const image = await deleteProductRow(slug)
  await removeImage(image)
  refreshShop(slug)
  redirect("/admin?eliminado=1")
}
