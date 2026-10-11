import { getStockMap } from "@/lib/store"

export async function GET() {
  const stock = await getStockMap()
  return Response.json({ stock }, { headers: { "Cache-Control": "no-store" } })
}
