import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BuyBox } from "@/components/buy-box"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMix, mixes } from "@/lib/catalog"
import { getMixes } from "@/lib/store"

export function generateStaticParams() {
  return mixes.map((mix) => ({ slug: mix.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const mix = getMix(slug)
  if (!mix) return { title: "Mix" }
  return { title: mix.name, description: mix.summary }
}

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mix = getMix(slug)
  if (!mix) notFound()
  const available = await getMixes()
  const current = available.find((item) => item.slug === slug) ?? { ...mix, stock: 0 }

  return (
    <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <article>
        <div className="h-2 w-24 rounded-full" style={{ backgroundColor: mix.pigment }} />
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
          <BuyBox product={current} />
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
