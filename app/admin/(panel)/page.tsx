import Link from "next/link"
import { Suspense } from "react"
import { ProductPhoto } from "@/components/product/product-photo"
import { StockBadge } from "@/components/product/stock-badge"
import { buttonVariants } from "@/components/ui/button"
import { formatPrice } from "@/lib/format/money"
import { getMixes } from "@/lib/db/products"

export const metadata = {
  title: "Mixes",
}

function notice(guardado?: string, eliminado?: string) {
  if (guardado === "1") return "El mix quedó guardado."
  if (eliminado === "1") return "El mix salió de la tienda."
  return null
}

async function MixList({
  searchParams,
}: {
  searchParams: Promise<{ guardado?: string; eliminado?: string }>
}) {
  const query = await searchParams
  const products = await getMixes()
  const message = notice(query.guardado, query.eliminado)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Mixes</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Lo que guardás acá es lo que ve el cliente: nombre, precio, stock y foto.
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className={buttonVariants({ className: "h-11" })}>
          Nuevo mix
        </Link>
      </div>
      {message ? (
        <p role="status" className="mt-6 rounded-lg bg-secondary px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}
      {products.length === 0 ? (
        <p className="mt-10 text-muted-foreground">Todavía no hay mixes cargados.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {products.map((product) => (
            <li key={product.slug} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
              <ProductPhoto
                imageFile={product.imageFile}
                pigment={product.pigment}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted sm:w-36"
              />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-2xl">{product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.weightLabel} · {formatPrice(product.price)}
                </p>
                <div className="mt-2">
                  <StockBadge stock={product.stock} />
                </div>
              </div>
              <Link
                href={`/admin/productos/${product.slug}`}
                className={buttonVariants({ variant: "outline", className: "h-11" })}
              >
                Editar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ guardado?: string; eliminado?: string }>
}) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando los mixes…</p>}>
      <MixList searchParams={searchParams} />
    </Suspense>
  )
}
