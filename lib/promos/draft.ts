export type PromoDraft = {
  title: string
  href: string | null
}

export type PromoField = "title" | "href" | "image"

const TITLE_MAX = 80
const HREF_MAX = 300

export function readPromoDraft(input: { title: string; href: string }): {
  draft?: PromoDraft
  fieldErrors: Partial<Record<PromoField, string>>
} {
  const fieldErrors: Partial<Record<PromoField, string>> = {}
  const title = input.title.trim()
  const hrefRaw = input.href.trim()

  if (title.length > TITLE_MAX) {
    fieldErrors.title = "El texto puede tener hasta 80 caracteres."
  }

  let href: string | null = null
  if (hrefRaw) {
    const internal =
      hrefRaw.startsWith("/") &&
      !hrefRaw.startsWith("//") &&
      !hrefRaw.includes("\\") &&
      !/\s/.test(hrefRaw)
    const external = hrefRaw.startsWith("https://") && !/\s/.test(hrefRaw)
    if ((!internal && !external) || hrefRaw.length > HREF_MAX) {
      fieldErrors.href = "El enlace tiene que empezar con / o con https://."
    } else {
      href = hrefRaw
    }
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }
  return { fieldErrors, draft: { title, href } }
}
