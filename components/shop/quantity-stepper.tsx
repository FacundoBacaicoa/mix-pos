"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
}: {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Cantidad">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Quitar una bolsa"
      >
        <Minus />
      </Button>
      <span className="w-8 text-center text-base tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Sumar una bolsa"
      >
        <Plus />
      </Button>
    </div>
  )
}
