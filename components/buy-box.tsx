"use client"

import Link from "next/link"
import { useState } from "react"
import { QuantityStepper } from "@/components/quantity-stepper"
import { StockBadge } from "@/components/stock-badge"
import { useCart } from "@/components/cart-provider"
import { useLiveStock } from "@/components/use-live-stock"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/money"
import type { MixStock } from "@/lib/types"

export function BuyBox({ product }: { product: MixStock }) {
  const live = useLiveStock({ [product.slug]: product.stock })
  const stock = live[product.slug] ?? product.stock
  const { addItem } = useCart()
  const [requested, setRequested] = useState(1)
  const [notice, setNotice] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const quantity = stock > 0 ? Math.min(requested, stock) : 1

  function onAdd() {
    const result = addItem(product.slug, quantity, stock)
    setNotice(result.message)
    setAdded(result.ok)
  }

  const line = formatPrice(product.price * (stock > 0 ? quantity : 0))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-medium tabular-nums">{formatPrice(product.price)}</p>
        <StockBadge stock={stock} />
      </div>
      {stock > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <QuantityStepper value={quantity} max={stock} onChange={setRequested} />
            <p className="text-sm text-muted-foreground tabular-nums">
              {line} por {quantity} {quantity === 1 ? "bolsa" : "bolsas"}
            </p>
          </div>
          <Button type="button" className="h-11 w-full" onClick={onAdd}>
            Agregar al carrito
          </Button>
        </>
      ) : (
        <Button type="button" className="h-11 w-full" disabled>
          Agotado en este lote
        </Button>
      )}
      {notice ? (
        <p role="status" className="text-sm text-foreground">
          {notice}{" "}
          {added ? (
            <Link href="/carrito" className="underline underline-offset-4">
              Ver carrito
            </Link>
          ) : null}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          El stock se descuenta cuando el pago queda confirmado.
        </p>
      )}
    </div>
  )
}
