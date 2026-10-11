import { connection } from "next/server"
import { mediaType, readImage } from "@/lib/media"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  await connection()
  const { file } = await params
  const type = mediaType(file)
  const bytes = type ? await readImage(file) : null
  if (!type || !bytes) return new Response("No está", { status: 404 })
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400",
    },
  })
}
