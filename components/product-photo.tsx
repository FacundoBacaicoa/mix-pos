import Image from "next/image"

export function ProductPhoto({
  imageFile,
  pigment,
  className,
}: {
  imageFile: string | null
  pigment: string
  className?: string
}) {
  return (
    <div className={className ?? "relative aspect-[4/3] overflow-hidden bg-muted"}>
      {imageFile ? (
        <Image
          src={`/api/media/${imageFile}`}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 360px, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full" style={{ backgroundColor: pigment }} />
      )}
    </div>
  )
}
