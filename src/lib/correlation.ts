import { headers } from 'next/headers'

export function getCorrelationId(): string {
  try {
    const h = headers()
    // in Next.js app router, headers() returns a ReadonlyHeaders (sync)
    // but some types may imply a thenable; to be safe, cast to unknown
    const id = (h as unknown as { get: (key: string) => string | null }).get('x-correlation-id')
    if (id) return id
  } catch {}
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}


