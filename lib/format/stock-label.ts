export function stockLabel(stock: number): string {
  if (stock <= 0) return "Agotado"
  if (stock === 1) return "Queda 1 bolsa"
  if (stock <= 3) return `Quedan ${stock} bolsas`
  return `${stock} bolsas`
}
