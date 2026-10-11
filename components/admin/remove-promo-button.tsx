"use client"

import { Button } from "@/components/ui/button"

export function RemovePromoButton({
  action,
  label,
}: {
  action: () => Promise<void>
  label: string
}) {
  const name = label || "esta imagen"
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`¿Sacar ${name} del carrusel?`)) event.preventDefault()
      }}
    >
      <Button type="submit" variant="destructive" className="h-11">
        Sacar
      </Button>
    </form>
  )
}
