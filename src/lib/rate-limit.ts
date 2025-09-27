type Bucket = { count: number; reset: number }
const buckets = new Map<string, Bucket>()

export function checkRateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || b.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true }
  }
  if (b.count >= max) {
    return { ok: false, retryAfterMs: Math.max(0, b.reset - now) }
  }
  b.count += 1
  return { ok: true }
}
