import { Suspense } from "react"
import { CheckoutForm } from "@/components/shop/checkout-form"
import { PageShell } from "@/components/shop/page-shell"
import { getMixes } from "@/lib/db/products"

export const metadata = {
  title: "Pago",
}

async function CheckoutSection() {
  const products = await getMixes()
  return <CheckoutForm products={products} />
}

export default function CheckoutPage() {
  return (
    <PageShell>
      <Suspense fallback={<p className="text-muted-foreground">Preparando el pago…</p>}>
        <CheckoutSection />
      </Suspense>
    </PageShell>
  )
}
