import { Suspense } from "react"
import { CheckoutForm } from "@/components/checkout-form"
import { PageShell } from "@/components/page-shell"
import { getMixes } from "@/lib/store"

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
