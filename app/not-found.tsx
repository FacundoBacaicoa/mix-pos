import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default function RootNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-4xl tracking-tight">No está en este lote</h1>
      <p className="mt-3 text-muted-foreground">
        Esa página no existe. Los mixes que sí están a la venta están en la tienda.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6 h-11" })}>
        Ir a la tienda
      </Link>
    </div>
  )
}
