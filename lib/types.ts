export type Customer = {
  name: string
  email: string
  phone: string
  address: string
  city: string
}

export type CardInput = {
  number: string
  expiry: string
  cvc: string
  name: string
}

export type ProductSnapshot = {
  slug: string
  name: string
  weightLabel: string
  price: number
  stock: number
}

export type OrderItem = {
  slug: string
  name: string
  weightLabel: string
  quantity: number
  unitPrice: number
}

export type Order = {
  id: string
  createdAt: string
  customer: Customer
  items: OrderItem[]
  total: number
  last4: string
}

export type FieldErrors = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "address"
    | "city"
    | "cardNumber"
    | "expiry"
    | "cvc"
    | "cardName"
    | "items",
    string
  >
>

export type CheckoutFailure = {
  ok: false
  code: "validation" | "stock" | "payment" | "empty"
  message: string
  fieldErrors?: FieldErrors
}

export type CheckoutResult =
  | {
      ok: true
      order: Order
      stock: Record<string, number>
    }
  | CheckoutFailure

export type PlaceOrderResult = { ok: true; order: Order } | CheckoutFailure

export type Mix = {
  slug: string
  name: string
  weightLabel: string
  price: number
  summary: string
  description: string
  ingredients: string[]
  allergens: string[]
  initialStock: number
  pigment: string
}

export type MixStock = Mix & { stock: number }

export type CartItem = {
  slug: string
  quantity: number
}
