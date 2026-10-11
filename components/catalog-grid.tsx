"use client"

import { useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { useLiveStock } from "@/components/use-live-stock"
import type { MixStock } from "@/lib/types"

export function CatalogGrid({ products }: { products: MixStock[] }) {
  const initial = useMemo(
    () => Object.fromEntries(products.map((product) => [product.slug, product.stock])),
    [products],
  )
  const live = useLiveStock(initial)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          mix={{ ...product, stock: live[product.slug] ?? product.stock }}
        />
      ))}
    </div>
  )
}
