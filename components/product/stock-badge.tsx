import { Badge } from "@/components/ui/badge"
import { stockLabel } from "@/lib/format/stock-label"

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge variant="destructive">Agotado</Badge>
  if (stock <= 3) return <Badge variant="outline">{stockLabel(stock)}</Badge>
  return <Badge variant="secondary">{stockLabel(stock)}</Badge>
}
