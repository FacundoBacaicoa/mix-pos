"use client"

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"

const STORAGE_KEY = "semilla-carrito"
const listeners = new Set<() => void>()

type AddResult =
  | { ok: true; quantity: number; capped: boolean; message: string }
  | { ok: false; message: string }

type CartContextValue = {
  items: CartItem[]
  ready: boolean
  count: number
  addItem: (slug: string, quantity: number, stock: number) => AddResult
  setQuantity: (slug: string, quantity: number) => void
  removeItem: (slug: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false
  const item = value as CartItem
  return (
    typeof item.slug === "string" &&
    item.slug.length > 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 99
  )
}

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]"
  } catch {
    return "[]"
  }
}

function parseCart(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartItem)
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    return
  }
  emit()
}

function subscribeClient() {
  return () => {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(subscribeClient, () => true, () => false)
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]")
  const items = useMemo(() => (isClient ? parseCart(raw) : []), [isClient, raw])

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      ready: isClient,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem(slug, quantity, stock) {
        if (stock <= 0 || quantity < 1) {
          return { ok: false, message: "No hay stock de este mix." }
        }
        const current = parseCart(readRaw())
        const existing = current.find((item) => item.slug === slug)?.quantity ?? 0
        const nextQty = Math.min(stock, existing + quantity)
        writeCart([
          ...current.filter((item) => item.slug !== slug),
          { slug, quantity: nextQty },
        ])
        const capped = nextQty < existing + quantity
        return {
          ok: true,
          quantity: nextQty,
          capped,
          message: capped
            ? `Solo quedan ${stock} bolsas. Dejamos ${nextQty} en el carrito.`
            : "Quedó en el carrito.",
        }
      },
      setQuantity(slug, quantity) {
        const current = parseCart(readRaw())
        if (quantity < 1) {
          writeCart(current.filter((item) => item.slug !== slug))
          return
        }
        writeCart(
          current.map((item) =>
            item.slug === slug ? { ...item, quantity: Math.min(quantity, 99) } : item,
          ),
        )
      },
      removeItem(slug) {
        writeCart(parseCart(readRaw()).filter((item) => item.slug !== slug))
      },
      clear() {
        writeCart([])
      },
    }
  }, [isClient, items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart tiene que usarse dentro de CartProvider")
  }
  return context
}
