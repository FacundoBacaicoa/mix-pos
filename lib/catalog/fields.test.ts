import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { parsePesos, parseStock, readProductDraft, slugify } from "./fields.ts"

describe("slugify", () => {
  it("pasa un nombre en castellano a la dirección del mix", () => {
    assert.equal(slugify("Mix Cítrico"), "mix-citrico")
    assert.equal(slugify("  Sin azúcar  "), "sin-azucar")
  })
})

describe("precios y stock", () => {
  it("acepta pesos con punto de miles", () => {
    assert.equal(parsePesos("8.900"), 8900)
    assert.equal(parsePesos("8900"), 8900)
    assert.equal(parsePesos(""), null)
  })

  it("acepta stock entero y rechaza decimales", () => {
    assert.equal(parseStock("0"), 0)
    assert.equal(parseStock("12"), 12)
    assert.equal(parseStock("1.5"), null)
  })
})

describe("readProductDraft", () => {
  it("arma el mix cuando los campos cierran", () => {
    const result = readProductDraft({
      name: "Mix Nuevo",
      weightLabel: "250 g",
      price: "4500",
      summary: "Almendra y cacao.",
      description: "Un mix corto para probar la carga.",
      ingredients: "Almendra\nCacao",
      allergens: "Frutos secos",
      stock: "4",
    })
    assert.equal(result.draft?.price, 4500)
    assert.deepEqual(result.draft?.ingredients, ["Almendra", "Cacao"])
    assert.equal(Object.keys(result.fieldErrors).length, 0)
  })
})
