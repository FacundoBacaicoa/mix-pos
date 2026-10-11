"use client"

import { Button } from "@/components/ui/button"
import { PageShell } from "@/components/page-shell"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageShell>
      <div className="max-w-lg">
        <h1 className="font-serif text-4xl tracking-tight">No pudimos cargar esta página</h1>
        <p className="mt-3 text-muted-foreground">
          El lote no respondió. Podés reintentar sin perder el carrito.
        </p>
        <Button type="button" className="mt-6 h-11" onClick={() => reset()}>
          Reintentar
        </Button>
      </div>
    </PageShell>
  )
}
