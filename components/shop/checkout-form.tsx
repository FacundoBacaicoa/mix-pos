"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import { EmptyCart } from "@/components/shop/empty-cart"
import { useCart } from "@/components/shop/cart-provider"
import { useLiveStock } from "@/components/shop/use-live-stock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { placeOrder } from "@/lib/checkout/actions"
import { formatPrice } from "@/lib/format/money"
import type { CheckoutFailure, MixStock } from "@/lib/types"

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

export function CheckoutForm({ products }: { products: MixStock[] }) {
  const router = useRouter()
  const { items, ready, clear } = useCart()
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<CheckoutFailure | null>(null)
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const initial = useMemo(
    () => Object.fromEntries(products.map((product) => [product.slug, product.stock])),
    [products],
  )
  const live = useLiveStock(initial)
  const errors = failure?.fieldErrors

  if (!ready) {
    return <p className="text-muted-foreground">Preparando el pago…</p>
  }

  if (items.length === 0) return <EmptyCart />

  const lines = items.map((item) => {
    const product = products.find((candidate) => candidate.slug === item.slug)
    const stock = product ? (live[product.slug] ?? product.stock) : 0
    return { item, product, stock }
  })
  const total = lines.reduce(
    (sum, line) => sum + (line.product ? line.product.price * line.item.quantity : 0),
    0,
  )
  const blocked = lines.some(
    (line) => !line.product || line.item.quantity > line.stock,
  )

  function onCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    const parts = digits.match(/.{1,4}/g) ?? []
    setCardNumber(parts.join(" "))
  }

  function onExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4)
    setExpiry(digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || blocked) return
    const form = new FormData(event.currentTarget)
    const text = (key: string) => String(form.get(key) ?? "")
    setFailure(null)
    setPending(true)
    void placeOrder({
      items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
      customer: {
        name: text("name"),
        email: text("email"),
        phone: text("phone"),
        address: text("address"),
        city: text("city"),
      },
      card: {
        number: cardNumber,
        expiry,
        cvc,
        name: text("cardName"),
      },
    })
      .then((result) => {
        if (!result.ok) {
          setFailure(result)
          setPending(false)
          return
        }
        clear()
        router.push(`/pedido/${result.order.id}`)
      })
      .catch(() => {
        setFailure({
          ok: false,
          code: "payment",
          message: "No pudimos confirmar el pago. El stock no se modificó.",
        })
        setPending(false)
      })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form id="pago" onSubmit={onSubmit} className="order-2 grid gap-6 lg:order-1" noValidate>
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Pago</h1>
          <p className="mt-3 max-w-xl text-sm text-pretty text-muted-foreground">
            Pago de prueba: no se hace ningún cargo. Una tarjeta válida confirma el pedido y
            descuenta el stock. Para ver un rechazo, usá 4000 0000 0000 0002. Para un pago
            aceptado, 4242 4242 4242 4242.
          </p>
        </div>
        {failure ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {failure.message}
          </div>
        ) : null}
        <fieldset disabled={pending} className="grid gap-4 border-0 p-0">
          <legend className="mb-1 font-serif text-2xl">Entrega</legend>
          <Field id="name" label="Nombre" error={errors?.name}>
            <Input id="name" name="name" autoComplete="name" className="h-10" aria-invalid={Boolean(errors?.name)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="email" label="Email" error={errors?.email}>
              <Input id="email" name="email" type="email" autoComplete="email" className="h-10" aria-invalid={Boolean(errors?.email)} />
            </Field>
            <Field id="phone" label="Teléfono" error={errors?.phone}>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" className="h-10" aria-invalid={Boolean(errors?.phone)} />
            </Field>
          </div>
          <Field id="address" label="Dirección" error={errors?.address}>
            <Input id="address" name="address" autoComplete="street-address" placeholder="Calle, número, piso" className="h-10" aria-invalid={Boolean(errors?.address)} />
          </Field>
          <Field id="city" label="Ciudad" error={errors?.city}>
            <Input id="city" name="city" autoComplete="address-level2" className="h-10" aria-invalid={Boolean(errors?.city)} />
          </Field>
        </fieldset>
        <fieldset disabled={pending} className="grid gap-4 border-0 p-0">
          <legend className="mb-1 font-serif text-2xl">Tarjeta</legend>
          <Field id="cardName" label="Nombre en la tarjeta" error={errors?.cardName}>
            <Input id="cardName" name="cardName" autoComplete="cc-name" className="h-10" aria-invalid={Boolean(errors?.cardName)} />
          </Field>
          <Field id="cardNumber" label="Número" error={errors?.cardNumber}>
            <Input
              id="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              className="h-10"
              value={cardNumber}
              onChange={(event) => onCardNumber(event.target.value)}
              aria-invalid={Boolean(errors?.cardNumber)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="expiry" label="Vencimiento" error={errors?.expiry}>
              <Input
                id="expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                className="h-10"
                value={expiry}
                onChange={(event) => onExpiry(event.target.value)}
                aria-invalid={Boolean(errors?.expiry)}
              />
            </Field>
            <Field id="cvc" label="Código" error={errors?.cvc}>
              <Input
                id="cvc"
                inputMode="numeric"
                autoComplete="cc-csc"
                className="h-10"
                value={cvc}
                onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                aria-invalid={Boolean(errors?.cvc)}
              />
            </Field>
          </div>
        </fieldset>
        <Button type="submit" className="h-11 w-full lg:hidden" disabled={pending || blocked}>
          {pending ? "Confirmando pago…" : `Pagar ${formatPrice(total)}`}
        </Button>
        <p className="text-sm text-muted-foreground lg:hidden">
          <Link href="/carrito" className="underline underline-offset-4">
            Volver al carrito
          </Link>
        </p>
      </form>
      <aside className="order-1 h-fit rounded-xl bg-card p-5 ring-1 ring-foreground/10 lg:sticky lg:top-24 lg:order-2">
        <h2 className="font-serif text-2xl">Tu pedido</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((line) => (
            <li key={line.item.slug} className="flex items-start justify-between gap-3">
              <span>
                {line.product?.name ?? "Mix no disponible"}
                <span className="mt-0.5 block text-muted-foreground">
                  {line.item.quantity} × {line.product?.weightLabel ?? ""}
                  {line.product && line.item.quantity > line.stock
                    ? ` · quedan ${line.stock}`
                    : ""}
                </span>
              </span>
              <span className="tabular-nums">
                {line.product ? formatPrice(line.product.price * line.item.quantity) : "—"}
              </span>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <span>Total</span>
          <span className="text-lg font-medium tabular-nums">{formatPrice(total)}</span>
        </div>
        {blocked ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            Ajustá el carrito: hay mixes sin stock suficiente.
          </p>
        ) : null}
        <Button
          type="submit"
          form="pago"
          className="mt-5 hidden h-11 w-full lg:inline-flex"
          disabled={pending || blocked}
        >
          {pending ? "Confirmando pago…" : `Pagar ${formatPrice(total)}`}
        </Button>
        <Link
          href="/carrito"
          className="mt-3 hidden text-sm text-muted-foreground underline underline-offset-4 lg:inline"
        >
          Volver al carrito
        </Link>
      </aside>
    </div>
  )
}
