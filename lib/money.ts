export function formatPrice(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `$ ${formatted}`
}
