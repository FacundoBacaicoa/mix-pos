import { Suspense } from "react"
import { CartView } from "@/components/cart-view"
import { PageShell } from "@/components/page-shell"
import { getMixes } from "@/lib/store"

export const metadata = {
  title: "Carrito",
}

async function CartSection() {
  const products = await getMixes()
  return <CartView products={products} />
}

export default function CartPage() {
  return (
    <PageShell>
      <Suspense fallback={<p className="text-muted-foreground">Abriendo el carrito…</p>}>
        <CartSection />
      </Suspense>
    </PageShell>
  )
}
