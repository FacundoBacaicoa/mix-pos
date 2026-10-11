import { randomBytes } from "node:crypto"
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { mediaDir } from "@/lib/db/client"

const MAX_BYTES = 4 * 1024 * 1024

export function isMediaName(name: string): boolean {
  return /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(name)
}

export function mediaType(name: string): string | null {
  if (!isMediaName(name)) return null
  if (name.endsWith(".png")) return "image/png"
  if (name.endsWith(".webp")) return "image/webp"
  return "image/jpeg"
}

function sniff(bytes: Buffer): "jpg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg"
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png"
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp"
  }
  return null
}

export async function saveImage(
  file: File,
): Promise<{ ok: true; name: string } | { ok: false; message: string }> {
  if (file.size === 0) return { ok: false, message: "La foto está vacía." }
  if (file.size > MAX_BYTES) return { ok: false, message: "La foto tiene que pesar menos de 4 MB." }
  const bytes = Buffer.from(await file.arrayBuffer())
  const ext = sniff(bytes)
  if (!ext) return { ok: false, message: "La foto tiene que ser JPG, PNG o WebP." }
  const name = `${randomBytes(16).toString("hex")}.${ext}`
  const dir = mediaDir()
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), bytes)
  return { ok: true, name }
}

export async function removeImage(name: string | null): Promise<void> {
  if (!name || !isMediaName(name)) return
  try {
    await unlink(path.join(mediaDir(), name))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
}

export async function readImage(name: string): Promise<Buffer | null> {
  if (!isMediaName(name)) return null
  try {
    return await readFile(path.join(mediaDir(), name))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}
