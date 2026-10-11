import { Suspense } from "react"
import { CatalogFallback } from "@/components/shop/catalog-fallback"
import { CatalogGrid } from "@/components/shop/catalog-grid"
import { PageShell } from "@/components/shop/page-shell"
import { PromoCarousel } from "@/components/shop/promo-carousel"
import { getMixes } from "@/lib/db/products"
import { getPromos } from "@/lib/db/promos"

export const metadata = {
  title: { absolute: "Semilla — mixes saludables" },
}

async function CatalogSection() {
  const products = await getMixes()
  return <CatalogGrid products={products} />
}

async function PromoSection() {
  const slides = await getPromos()
  return <PromoCarousel slides={slides} />
}

export default function HomePage() {
  return (
    <PageShell>
      <h1 className="sr-only">Semilla, mixes del lote de hoy</h1>
      <div className="grid gap-8 sm:gap-10">
        <Suspense fallback={null}>
          <PromoSection />
        </Suspense>
        <Suspense fallback={<CatalogFallback />}>
          <CatalogSection />
        </Suspense>
      </div>
    </PageShell>
  )
}
