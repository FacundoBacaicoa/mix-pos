"use server"

import { revalidatePath } from "next/cache"
import { checkoutAndSave } from "@/lib/db/orders"
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
    revalidatePath("/admin")
    for (const item of result.order.items) revalidatePath(`/producto/${item.slug}`)
  }
  return result
}
