import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { DeleteProductButton } from "@/components/admin/delete-product-button"
import { ProductForm } from "@/components/admin/product-form"
import { deleteProduct } from "@/lib/admin/actions"
import { getProduct } from "@/lib/db/products"

export const metadata = {
  title: "Editar mix",
}

async function Editor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        Volver a los mixes
      </Link>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{product.name}</h1>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
      <div className="mt-10 border-t border-border pt-6">
        <DeleteProductButton action={deleteProduct.bind(null, product.slug)} name={product.name} />
      </div>
    </div>
  )
}

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Abriendo el mix…</p>}>
      <Editor params={params} />
    </Suspense>
  )
}
