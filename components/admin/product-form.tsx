"use client"

import { useActionState, useState, type ReactNode } from "react"
import { saveProduct, type ProductFormState } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { MixStock } from "@/lib/types"

const initial: ProductFormState = {}

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

export function ProductForm({ product }: { product?: MixStock }) {
  const [state, action, pending] = useActionState(saveProduct, initial)
  const [preview, setPreview] = useState<string | null>(null)
  const errors = state.fieldErrors

  return (
    <form action={action} className="grid gap-5" noValidate>
      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}
      {state.message ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Field id="name" label="Nombre" error={errors?.name}>
        <Input id="name" name="name" defaultValue={product?.name} className="h-11" aria-invalid={Boolean(errors?.name)} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="weightLabel" label="Peso" error={errors?.weightLabel}>
          <Input id="weightLabel" name="weightLabel" defaultValue={product?.weightLabel} placeholder="250 g" className="h-11" aria-invalid={Boolean(errors?.weightLabel)} />
        </Field>
        <Field id="price" label="Precio en pesos" error={errors?.price}>
          <Input id="price" name="price" inputMode="numeric" defaultValue={product ? String(product.price) : ""} placeholder="8900" className="h-11" aria-invalid={Boolean(errors?.price)} />
        </Field>
      </div>
      <Field id="summary" label="Resumen" error={errors?.summary}>
        <Input id="summary" name="summary" defaultValue={product?.summary} className="h-11" aria-invalid={Boolean(errors?.summary)} />
      </Field>
      <Field id="description" label="Descripción" error={errors?.description}>
        <Textarea id="description" name="description" defaultValue={product?.description} aria-invalid={Boolean(errors?.description)} />
      </Field>
      <Field id="ingredients" label="Ingredientes, uno por línea" error={errors?.ingredients}>
        <Textarea id="ingredients" name="ingredients" defaultValue={product?.ingredients.join("\n")} aria-invalid={Boolean(errors?.ingredients)} />
      </Field>
      <Field id="allergens" label="Alérgenos, uno por línea" error={errors?.allergens}>
        <Textarea id="allergens" name="allergens" defaultValue={product?.allergens.join("\n")} aria-invalid={Boolean(errors?.allergens)} />
      </Field>
      <Field id="stock" label="Bolsas en stock" error={errors?.stock}>
        <Input id="stock" name="stock" inputMode="numeric" defaultValue={product ? String(product.stock) : "0"} className="h-11" aria-invalid={Boolean(errors?.stock)} />
      </Field>
      <Field id="image" label="Foto" error={errors?.image}>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
          aria-invalid={Boolean(errors?.image)}
          onChange={(event) => {
            const file = event.target.files?.[0]
            setPreview(file ? URL.createObjectURL(file) : null)
          }}
        />
      </Field>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Vista previa de la foto" className="aspect-[4/3] w-full max-w-sm rounded-xl object-cover" />
      ) : product?.imageFile ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/media/${product.imageFile}`} alt="" className="aspect-[4/3] w-full max-w-sm rounded-xl object-cover" />
      ) : (
        <p className="text-sm text-muted-foreground">Si no subís una foto, la ficha usa un color plano.</p>
      )}
      {product ? (
        <p className="text-sm text-muted-foreground">En la tienda queda en /producto/{product.slug}.</p>
      ) : null}
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? "Guardando…" : "Guardar mix"}
      </Button>
    </form>
  )
}
