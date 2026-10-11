"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import type { PromoSlide } from "@/lib/types"

function SlideVisual({ slide }: { slide: PromoSlide }) {
  return (
    <>
      <Image
        src={`/api/media/${slide.imageFile}`}
        alt={slide.title ? "" : "Promo de Semilla"}
        fill
        unoptimized
        sizes="(min-width: 1152px) 1152px, 100vw"
        className="object-cover"
      />
      {slide.title ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-4 pt-16 pb-12 sm:px-8 sm:pb-14">
          <p className="max-w-xl font-serif text-3xl tracking-tight text-balance text-white sm:text-5xl">
            {slide.title}
          </p>
        </div>
      ) : null}
    </>
  )
}

function SlideFrame({ slide, active }: { slide: PromoSlide; active: boolean }) {
  const className = "relative block h-full w-full"
  let body: ReactNode
  if (!slide.href) {
    body = (
      <div className={className}>
        <SlideVisual slide={slide} />
      </div>
    )
  } else if (slide.href.startsWith("/")) {
    body = (
      <Link href={slide.href} tabIndex={active ? 0 : -1} className={className}>
        <SlideVisual slide={slide} />
      </Link>
    )
  } else {
    body = (
      <a
        href={slide.href}
        target="_blank"
        rel="noreferrer"
        tabIndex={active ? 0 : -1}
        className={className}
      >
        <SlideVisual slide={slide} />
      </a>
    )
  }

  return (
    <div className="h-full w-full" aria-hidden={!active} inert={!active}>
      {body}
    </div>
  )
}

export function PromoCarousel({ slides }: { slides: PromoSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const current = count === 0 ? 0 : ((index % count) + count) % count

  useEffect(() => {
    if (paused || count < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(() => {
      setIndex((value) => value + 1)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [paused, count])

  if (count === 0) return null

  const slide = slides[current]
  function go(next: number) {
    setIndex(next)
  }

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promos y novedades"
      className="relative overflow-hidden rounded-xl bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
      onPointerUp={(event) => {
        if (count < 2) return
        const start = Number(event.currentTarget.dataset.startX ?? "")
        if (!Number.isFinite(start)) return
        const delta = event.clientX - start
        if (delta > 48) go(current - 1)
        if (delta < -48) go(current + 1)
        delete event.currentTarget.dataset.startX
      }}
      onPointerDown={(event) => {
        if (event.target instanceof Element && event.target.closest("button, a")) return
        event.currentTarget.dataset.startX = String(event.clientX)
      }}
    >
      <p className="sr-only" aria-live="polite">
        {slide?.title || `Imagen ${current + 1} de ${count}`}
      </p>
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[2.35/1]">
        {slides.map((item, itemIndex) => (
          <div
            key={item.id}
            className="absolute inset-0 motion-safe:transition-transform motion-safe:duration-500"
            style={{ transform: `translateX(${(itemIndex - current) * 100}%)` }}
          >
            <SlideFrame slide={item} active={itemIndex === current} />
          </div>
        ))}
      </div>
      {count > 1 ? (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm"
            aria-label="Promo anterior"
            onClick={() => go(current - 1)}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm"
            aria-label="Promo siguiente"
            onClick={() => go(current + 1)}
          >
            <ChevronRight />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {slides.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Ir a la promo ${itemIndex + 1}`}
                aria-current={itemIndex === current ? "true" : undefined}
                className={
                  itemIndex === current
                    ? "h-2 w-6 rounded-full bg-white"
                    : "size-2 rounded-full bg-white/70"
                }
                onClick={() => go(itemIndex)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
