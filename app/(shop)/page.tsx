import { Suspense } from "react"
import { CatalogFallback } from "@/components/shop/catalog-fallback"
import { CatalogGrid } from "@/components/shop/catalog-grid"
import { PageShell } from "@/components/shop/page-shell"
import { getMixes } from "@/lib/db/products"

export const metadata = {
  title: { absolute: "Semilla — mixes saludables" },
}

async function CatalogSection() {
  const products = await getMixes()
  return <CatalogGrid products={products} />
}

export default function HomePage() {
  return (
    <PageShell>
      <section className="max-w-2xl">
        <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
          Taller de mixes
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-balance sm:text-6xl">
          Lo que hay hoy, en bolsa.
        </h1>
        <p className="mt-4 text-lg text-pretty text-muted-foreground">
          Frutos secos, semillas y fruta deshidratada, armados en lote chico. El número de
          cada ficha es el stock listo para salir.
        </p>
      </section>
      <div className="mt-10">
        <Suspense fallback={<CatalogFallback />}>
          <CatalogSection />
        </Suspense>
      </div>
    </PageShell>
  )
}
