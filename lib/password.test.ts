import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { hashPassword, verifyPassword } from "./password.ts"

describe("verifyPassword", () => {
  it("acepta la clave correcta y rechaza otra", async () => {
    const stored = await hashPassword("semilla-dev")
    assert.equal(await verifyPassword("semilla-dev", stored), true)
    assert.equal(await verifyPassword("otra-clave", stored), false)
    assert.equal(await verifyPassword("semilla-dev", "texto"), false)
  })
})
