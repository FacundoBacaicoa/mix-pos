import Link from "next/link"
import { ProductForm } from "@/components/admin/product-form"

export const metadata = {
  title: "Nuevo mix",
}

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        Volver a los mixes
      </Link>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">Nuevo mix</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Completá la ficha y, si tenés la foto de la bolsa, subila desde este equipo.
      </p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  )
}
