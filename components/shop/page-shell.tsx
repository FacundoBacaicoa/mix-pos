import type { ReactNode } from "react"
import { cn } from "cn"

export function PageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:py-12", className)}>
      {children}
    </div>
  )
}
