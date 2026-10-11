export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-lg text-foreground">Semilla</p>
          <p className="mt-1 max-w-md">
            Mixes armados en lote chico. El stock de la tienda es el que está listo para salir.
          </p>
        </div>
        <p className="max-w-xs">
          El pago es de demostración: confirma el pedido y descuenta bolsas, sin cargo real.
        </p>
      </div>
    </footer>
  )
}
