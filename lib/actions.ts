"use server"

import { revalidatePath } from "next/cache"
import { mixes } from "@/lib/catalog"
import { checkoutAndSave } from "@/lib/store"
import type { CardInput, Customer, PlaceOrderResult } from "@/lib/types"

export async function placeOrder(input: {
  items: { slug: string; quantity: number }[]
  customer: Customer
  card: CardInput
}): Promise<PlaceOrderResult> {
  const result = await checkoutAndSave(input)
  if (result.ok) {
    revalidatePath("/")
    revalidatePath("/carrito")
    revalidatePath("/pagar")
    for (const mix of mixes) revalidatePath(`/producto/${mix.slug}`)
  }
  return result
}
