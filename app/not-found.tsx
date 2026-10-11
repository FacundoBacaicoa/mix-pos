import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <PageShell>
      <div className="max-w-lg">
        <h1 className="font-serif text-4xl tracking-tight">No está en este lote</h1>
        <p className="mt-3 text-muted-foreground">
          Esa página no existe. Los mixes que sí están a la venta están en la tienda.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6 h-11" })}>
          Ir a la tienda
        </Link>
      </div>
    </PageShell>
  )
}
