import Link from "next/link"
import { Suspense } from "react"
import { PromoForm } from "@/components/admin/promo-form"
import { RemovePromoButton } from "@/components/admin/remove-promo-button"
import { Button } from "@/components/ui/button"
import { deletePromo, movePromo } from "@/lib/admin/actions"
import { getPromos, MAX_PROMOS } from "@/lib/db/promos"

export const metadata = {
  title: "Promos",
}

function notice(guardado?: string, eliminado?: string) {
  if (guardado === "1") return "La promo quedó en el carrusel."
  if (eliminado === "1") return "La promo salió del carrusel."
  return null
}

async function PromoDesk({
  searchParams,
}: {
  searchParams: Promise<{ guardado?: string; eliminado?: string }>
}) {
  const query = await searchParams
  const promos = await getPromos()
  const message = notice(query.guardado, query.eliminado)

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section>
        <h1 className="font-serif text-4xl tracking-tight">Promos</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Estas imágenes reemplazan el texto de arriba del catálogo. Se muestran en el orden de la lista, de a una.
        </p>
        {message ? (
          <p role="status" className="mt-6 rounded-lg bg-secondary px-3 py-2 text-sm">
            {message}
          </p>
        ) : null}
        <div className="mt-8">
          {promos.length >= MAX_PROMOS ? (
            <p className="text-sm text-muted-foreground">
              El carrusel ya tiene {MAX_PROMOS} imágenes. Sacá una para publicar otra.
            </p>
          ) : (
            <PromoForm />
          )}
        </div>
      </section>
      <section>
        <h2 className="font-serif text-2xl">En el carrusel</h2>
        {promos.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Todavía no hay promos. Hasta que publiques una, la tienda abre directo en el catálogo.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {promos.map((promo, index) => (
              <li key={promo.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/media/${promo.imageFile}`}
                  alt=""
                  className="aspect-[2.35/1] w-full rounded-xl object-cover sm:w-44"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{promo.title || "Sin texto"}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {promo.href || "Sin enlace"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {index > 0 ? (
                    <form action={movePromo.bind(null, promo.id, "up")}>
                      <Button type="submit" variant="outline" className="h-11">
                        Subir
                      </Button>
                    </form>
                  ) : null}
                  {index < promos.length - 1 ? (
                    <form action={movePromo.bind(null, promo.id, "down")}>
                      <Button type="submit" variant="outline" className="h-11">
                        Bajar
                      </Button>
                    </form>
                  ) : null}
                  <RemovePromoButton action={deletePromo.bind(null, promo.id)} label={promo.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin" className="mt-6 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline">
          Volver a los mixes
        </Link>
      </section>
    </div>
  )
}

export default function PromosPage({
  searchParams,
}: {
  searchParams: Promise<{ guardado?: string; eliminado?: string }>
}) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando las promos…</p>}>
      <PromoDesk searchParams={searchParams} />
    </Suspense>
  )
}
