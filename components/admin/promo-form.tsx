"use client"

import { useActionState, useState, type ReactNode } from "react"
import { savePromo, type PromoFormState } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initial: PromoFormState = {}

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

export function PromoForm() {
  const [state, action, pending] = useActionState(savePromo, initial)
  const [preview, setPreview] = useState<string | null>(null)
  const errors = state.fieldErrors

  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.message ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Field id="promo-image" label="Imagen" error={errors?.image}>
        <input
          id="promo-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
          aria-invalid={Boolean(errors?.image)}
          onChange={(event) => {
            const file = event.target.files?.[0]
            setPreview(file ? URL.createObjectURL(file) : null)
          }}
        />
      </Field>
      <p className="text-sm text-muted-foreground">
        JPG, PNG o WebP, hasta 4 MB. La foto se recorta para ocupar todo el ancho del carrusel.
      </p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Vista previa de la promo" className="aspect-[2.35/1] w-full rounded-xl object-cover" />
      ) : null}
      <Field id="promo-title" label="Texto sobre la imagen, opcional" error={errors?.title}>
        <Input id="promo-title" name="title" maxLength={80} className="h-11" aria-invalid={Boolean(errors?.title)} />
      </Field>
      <Field id="promo-href" label="Enlace, opcional" error={errors?.href}>
        <Input
          id="promo-href"
          name="href"
          placeholder="/producto/energia"
          className="h-11"
          aria-invalid={Boolean(errors?.href)}
        />
      </Field>
      <p className="text-sm text-muted-foreground">
        Si completás el enlace, al tocar la imagen se abre esa página. Usá una dirección de la tienda, como /producto/energia, o una que empiece con https://.
      </p>
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? "Publicando…" : "Publicar en el carrusel"}
      </Button>
    </form>
  )
}
