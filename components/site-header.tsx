"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"

export function SiteHeader() {
  const { count, ready } = useCart()
  const bags = ready ? count : 0
  const label =
    bags === 1 ? "Carrito, 1 bolsa" : `Carrito, ${bags} bolsas`

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/" className="min-w-0">
          <span className="block font-serif text-2xl leading-none tracking-tight">Semilla</span>
          <span className="mt-1 block text-xs text-primary-foreground/75">
            Mixes del lote de hoy
          </span>
        </Link>
        <Link
          href="/carrito"
          aria-label={label}
          className={buttonVariants({
            variant: "secondary",
            className: "h-10 shrink-0 px-3",
          })}
        >
          Carrito
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
            {bags}
          </span>
        </Link>
      </div>
    </header>
  )
}
