import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createSessionToken, readSession } from "./session.ts"

describe("readSession", () => {
  it("lee una sesión vigente y rechaza una vencida o alterada", () => {
    const now = Date.parse("2026-10-11T12:00:00.000Z")
    const token = createSessionToken("dueno", now)
    assert.ok(token)
    assert.deepEqual(readSession(token, now + 1000), { username: "dueno" })
    assert.equal(readSession(token, now + 13 * 60 * 60 * 1000), null)
    assert.equal(readSession(`${token}x`, now + 1000), null)
    assert.equal(readSession(undefined, now), null)
  })
})
