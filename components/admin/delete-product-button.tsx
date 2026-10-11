"use client"

import { Button } from "@/components/ui/button"

export function DeleteProductButton({
  action,
  name,
}: {
  action: () => Promise<void>
  name: string
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`¿Sacar ${name} de la tienda?`)) event.preventDefault()
      }}
    >
      <Button type="submit" variant="destructive" className="h-11">
        Sacar de la tienda
      </Button>
    </form>
  )
}
