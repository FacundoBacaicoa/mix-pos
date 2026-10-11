import type { ReactNode } from "react"
import { CartProvider } from "@/components/shop/cart-provider"
import { SiteFooter } from "@/components/shop/site-footer"
import { SiteHeader } from "@/components/shop/site-header"

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </CartProvider>
  )
}
