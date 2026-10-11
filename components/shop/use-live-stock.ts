"use client"

import { useEffect, useState } from "react"

export function useLiveStock(initial: Record<string, number>) {
  const [stock, setStock] = useState(initial)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch("/api/stock", { cache: "no-store" })
        if (!response.ok || cancelled) return
        const data = (await response.json()) as { stock?: Record<string, number> }
        if (!cancelled && data.stock) {
          setStock((current) => ({ ...current, ...data.stock }))
        }
      } catch {
        // Si la red falla, queda el stock que ya mostró el servidor.
      }
    }

    void load()

    function onVisible() {
      if (document.visibilityState === "visible") void load()
    }

    window.addEventListener("focus", onVisible)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      window.removeEventListener("focus", onVisible)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return stock
}
