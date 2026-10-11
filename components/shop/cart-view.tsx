"use client"

import Link from "next/link"
import { useMemo } from "react"
import { EmptyCart } from "@/components/shop/empty-cart"
import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { StockBadge } from "@/components/product/stock-badge"
import { useCart } from "@/components/shop/cart-provider"
import { useLiveStock } from "@/components/shop/use-live-stock"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/format/money"
import type { MixStock } from "@/lib/types"

export function CartView({ products }: { products: MixStock[] }) {
  const { items, ready, setQuantity, removeItem } = useCart()
  const initial = useMemo(
    () => Object.fromEntries(products.map((product) => [product.slug, product.stock])),
    [products],
  )
  const live = useLiveStock(initial)

  if (!ready) {
    return <p className="text-muted-foreground">Abriendo el carrito…</p>
  }

  if (items.length === 0) return <EmptyCart />

  const lines = items.map((item) => {
    const product = products.find((candidate) => candidate.slug === item.slug)
    const stock = product ? (live[product.slug] ?? product.stock) : 0
    return { item, product, stock }
  })
  const total = lines.reduce(
    (sum, line) => sum + (line.product ? line.product.price * line.item.quantity : 0),
    0,
  )
  const problems = lines.flatMap((line) => {
    if (!line.product) return ["Hay un mix en el carrito que ya no está a la venta."]
    if (line.stock <= 0) return [`${line.product.name} está agotado. Sacalo del carrito para seguir.`]
    if (line.item.quantity > line.stock) {
      return [`${line.product.name}: pediste ${line.item.quantity} y quedan ${line.stock}.`]
    }
    return []
  })

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Carrito</h1>
        <ul className="mt-6 divide-y divide-border">
          {lines.map((line) => (
            <li key={line.item.slug} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1.5 size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: line.product?.pigment ?? "#8a6a3b" }}
                    aria-hidden
                  />
                  <div>
                    {line.product ? (
                      <Link href={`/producto/${line.product.slug}`} className="font-serif text-2xl">
                        {line.product.name}
                      </Link>
                    ) : (
                      <p className="font-serif text-2xl">Mix no disponible</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {line.product
                        ? `${line.product.weightLabel} · ${formatPrice(line.product.price)}`
                        : "Ya no está en el lote."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                {line.product ? <StockBadge stock={line.stock} /> : null}
                {line.product && line.stock > 0 ? (
                  <QuantityStepper
                    value={line.item.quantity}
                    max={line.stock}
                    onChange={(quantity) => setQuantity(line.item.slug, quantity)}
                  />
                ) : null}
                <p className="min-w-24 text-right font-medium tabular-nums">
                  {line.product ? formatPrice(line.product.price * line.item.quantity) : "—"}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeItem(line.item.slug)}
                >
                  Quitar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit rounded-xl bg-card p-5 ring-1 ring-foreground/10 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl">Resumen</h2>
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-base">
          <span>Total</span>
          <span className="font-medium tabular-nums">{formatPrice(total)}</span>
        </div>
        {problems.length > 0 ? (
          <div role="alert" className="mt-4 text-sm text-destructive">
            {problems.map((problem) => (
              <p key={problem}>{problem}</p>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            El total se confirma en el pago, con el stock de ese momento.
          </p>
        )}
        {problems.length === 0 ? (
          <Link
            href="/pagar"
            className={buttonVariants({ className: "mt-5 h-11 w-full" })}
          >
            Ir a pagar
          </Link>
        ) : (
          <Button type="button" className="mt-5 h-11 w-full" disabled>
            Ir a pagar
          </Button>
        )}
      </aside>
    </div>
  )
}
