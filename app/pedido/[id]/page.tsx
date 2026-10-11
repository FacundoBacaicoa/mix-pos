import Link from "next/link"
import { Suspense } from "react"
import { PageShell } from "@/components/page-shell"
import { buttonVariants } from "@/components/ui/button"
import { formatPrice } from "@/lib/money"
import { getOrder } from "@/lib/store"
import type { Order } from "@/lib/types"

export const metadata = {
  title: "Pedido",
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso))
}

function MissingOrder() {
  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-4xl tracking-tight">No encontramos ese pedido</h1>
      <p className="mt-3 text-muted-foreground">
        Si acabás de pagar, el comprobante tiene el número que empieza con SM-.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6 h-11" })}>
        Volver a la tienda
      </Link>
    </div>
  )
}

function Receipt({ order }: { order: Order }) {
  return (
    <div className="max-w-xl">
      <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">Pagado</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">{order.id}</h1>
      <p className="mt-3 text-muted-foreground">{formatWhen(order.createdAt)}</p>
      <p className="mt-4 text-pretty">
        Reservamos estas bolsas. El stock de la tienda ya se actualizó. Tarjeta terminada en{" "}
        {order.last4}.
      </p>
      <ul className="mt-8 divide-y divide-border">
        {order.items.map((item) => (
          <li key={item.slug} className="flex items-start justify-between gap-4 py-3">
            <span>
              <span className="block font-medium">{item.name}</span>
              <span className="text-sm text-muted-foreground">
                {item.quantity} × {item.weightLabel} · {formatPrice(item.unitPrice)}
              </span>
            </span>
            <span className="tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center justify-between text-lg">
        <span>Total</span>
        <span className="font-medium tabular-nums">{formatPrice(order.total)}</span>
      </p>
      <div className="mt-8 text-sm">
        <p className="font-medium">Entrega</p>
        <p className="mt-1">{order.customer.name}</p>
        <p>{order.customer.address}</p>
        <p>{order.customer.city}</p>
        <p className="mt-2 text-muted-foreground">
          {order.customer.email} · {order.customer.phone}
        </p>
      </div>
      <Link href="/" className={buttonVariants({ className: "mt-8 h-11" })}>
        Volver a la tienda
      </Link>
    </div>
  )
}

async function OrderSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) return <MissingOrder />
  return <Receipt order={order} />
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <PageShell>
      <Suspense fallback={<p className="text-muted-foreground">Buscando el pedido…</p>}>
        <OrderSection params={params} />
      </Suspense>
    </PageShell>
  )
}
