import Link from "next/link"
import { ProductPhoto } from "@/components/product/product-photo"
import { StockBadge } from "@/components/product/stock-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/format/money"
import type { MixStock } from "@/lib/types"

export function ProductCard({ mix }: { mix: MixStock }) {
  return (
    <Link
      href={`/producto/${mix.slug}`}
      className="block h-full rounded-xl focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:ring-foreground/20">
        <ProductPhoto imageFile={mix.imageFile} pigment={mix.pigment} />
        <CardHeader className="pt-5">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            {mix.weightLabel}
          </p>
          <CardTitle className="font-serif text-2xl leading-tight">{mix.name}</CardTitle>
          <p className="text-sm text-pretty text-muted-foreground">{mix.summary}</p>
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-3 pb-5">
          <p className="text-lg font-medium tabular-nums">{formatPrice(mix.price)}</p>
          <StockBadge stock={mix.stock} />
        </CardContent>
      </Card>
    </Link>
  )
}
