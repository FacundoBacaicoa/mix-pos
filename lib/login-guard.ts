const WINDOW_MS = 60_000
const LIMIT = 5

const attempts = new Map<string, { count: number; lockedUntil: number }>()

export function loginBlocked(key: string, now = Date.now()): boolean {
  const entry = attempts.get(key)
  if (!entry) return false
  if (entry.lockedUntil > now) return true
  if (entry.lockedUntil !== 0 && entry.lockedUntil <= now) attempts.delete(key)
  return false
}

export function registerLoginFailure(key: string, now = Date.now()): void {
  const entry = attempts.get(key)
  const count = entry && entry.lockedUntil <= now ? entry.count + 1 : 1
  attempts.set(key, {
    count,
    lockedUntil: count >= LIMIT ? now + WINDOW_MS : 0,
  })
}

export function clearLoginFailures(key: string): void {
  attempts.delete(key)
}
