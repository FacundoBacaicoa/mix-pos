import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export function EmptyCart() {
  return (
    <div className="mx-auto max-w-lg py-6">
      <h1 className="font-serif text-4xl tracking-tight text-balance">El carrito está vacío</h1>
      <p className="mt-3 text-muted-foreground text-pretty">
        Todavía no hay mixes. En la tienda se ve cuántas bolsas quedan de cada uno.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6 h-11" })}>
        Ver mixes
      </Link>
    </div>
  )
}
