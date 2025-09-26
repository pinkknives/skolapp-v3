import { NextRequest, NextResponse } from 'next/server'
import { SkolverketServiceClient } from '@/services/skolverket/client'

// Simple in-memory cache (per serverless instance)
const CACHE_TTL_MS = 60_000
let cache: { etag?: string | null; data?: unknown; expiresAt?: number } = {}

export async function GET(_req: NextRequest) {
  const client = new SkolverketServiceClient()
  const health = await client.health()

  // Return 503 if not healthy
  if (!health.ok) {
    // Fallback: serve last known good subjects if present
    if (cache.data) {
      return NextResponse.json(
        {
          ok: false,
          fallback: true,
          message: 'Uppdatering pågår',
          subjects: cache.data,
        },
        { status: 200 }
      )
    }
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  // Read-through cache for subjects
  const now = Date.now()
  const stillValid = cache.expiresAt && cache.expiresAt > now

  if (stillValid) {
    return NextResponse.json({ ok: true, version: health.version, cacheHit: true, latencyMs: health.latencyMs, subjects: cache.data || [] }, { status: 200 })
  }

  const { data, etag, status } = await client.getSubjects(cache.etag || undefined)

  if (status === 304) {
    // Extend cache TTL
    cache.expiresAt = now + CACHE_TTL_MS
    return NextResponse.json({ ok: true, version: health.version, cacheHit: true, latencyMs: health.latencyMs, subjects: cache.data || [] }, { status: 200 })
  }

  // On 200, store new cache
  if (status === 200 && Array.isArray(data)) {
    cache = { etag: etag || null, data, expiresAt: now + CACHE_TTL_MS }
    return NextResponse.json({ ok: true, version: health.version, cacheHit: false, latencyMs: health.latencyMs, subjects: data }, { status: 200 })
  }

  // If unexpected, fallback to last cache
  if (cache.data) {
    return NextResponse.json(
      {
        ok: true,
        version: health.version,
        fallback: true,
        message: 'Uppdatering pågår',
        subjects: cache.data,
      },
      { status: 200 }
    )
  }

  return NextResponse.json({ ok: false }, { status: 503 })
}


