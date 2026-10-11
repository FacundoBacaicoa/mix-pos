"use client"

import { Button } from "@/components/ui/button"

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-4xl tracking-tight">No pudimos cargar esta página</h1>
      <p className="mt-3 text-muted-foreground">El lote no respondió. Podés reintentar.</p>
      <Button type="button" className="mt-6 h-11" onClick={() => reset()}>
        Reintentar
      </Button>
    </div>
  )
}
