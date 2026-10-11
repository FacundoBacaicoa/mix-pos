import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { readPromoDraft } from "./draft.ts"

describe("readPromoDraft", () => {
  it("acepta una promo solo con imagen, sin texto ni enlace", () => {
    const result = readPromoDraft({ title: "  ", href: "" })
    assert.deepEqual(result.draft, { title: "", href: null })
  })

  it("acepta un enlace interno y uno https", () => {
    const internal = readPromoDraft({ title: "Lote nuevo", href: "/producto/energia" })
    assert.equal(internal.draft?.href, "/producto/energia")
    const external = readPromoDraft({ title: "", href: "https://semilla.example/novedad" })
    assert.equal(external.draft?.href, "https://semilla.example/novedad")
  })

  it("rechaza enlaces que no son una página de la tienda ni https", () => {
    for (const href of ["javascript:alert(1)", "http://ejemplo.com", "//ejemplo.com", "energia"]) {
      const result = readPromoDraft({ title: "", href })
      assert.equal(result.draft, undefined)
      assert.match(result.fieldErrors.href ?? "", /https/)
    }
  })

  it("limita el texto que se lee sobre la foto", () => {
    const result = readPromoDraft({ title: "a".repeat(81), href: "" })
    assert.equal(result.draft, undefined)
    assert.match(result.fieldErrors.title ?? "", /80/)
  })
})
