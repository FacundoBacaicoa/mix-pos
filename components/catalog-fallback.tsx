export function CatalogFallback() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}
