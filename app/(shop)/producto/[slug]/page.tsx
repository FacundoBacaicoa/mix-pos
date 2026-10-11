import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BuyBox } from "@/components/buy-box"
import { PageShell } from "@/components/page-shell"
import { ProductPhoto } from "@/components/product-photo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProduct } from "@/lib/store"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const mix = await getProduct(slug)
  if (!mix) return { title: "Mix" }
  return { title: mix.name, description: mix.summary }
}

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mix = await getProduct(slug)
  if (!mix) notFound()

  return (
    <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <article>
        <ProductPhoto
          imageFile={mix.imageFile}
          pigment={mix.pigment}
          className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
        />
        <p className="mt-6 text-sm tracking-[0.16em] text-muted-foreground uppercase">
          {mix.weightLabel}
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-balance sm:text-5xl">
          {mix.name}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-pretty">{mix.description}</p>
        <h2 className="mt-8 font-serif text-2xl">Qué lleva</h2>
        <ul className="mt-3 grid gap-1 text-sm">
          {mix.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Alérgenos: {mix.allergens.join(", ").toLowerCase()}.
        </p>
      </article>
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Llevar este mix</CardTitle>
        </CardHeader>
        <CardContent>
          <BuyBox product={mix} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <PageShell>
      <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        Volver a la tienda
      </Link>
      <Suspense fallback={<p className="mt-8 text-muted-foreground">Buscando este mix en el lote…</p>}>
        <ProductDetail params={params} />
      </Suspense>
    </PageShell>
  )
}
