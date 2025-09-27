import { supabaseServer } from '@/lib/supabase-server'
import type { NextResponse } from 'next/server'

export type ApiMetric = {
  route: string
  method: string
  status: number
  durationMs: number
  correlationId?: string | null
}

export async function recordApiMetric(metric: ApiMetric): Promise<void> {
  try {
    const client = supabaseServer()
    await client.from('api_metrics').insert({
      route: metric.route,
      method: metric.method,
      status: metric.status,
      duration_ms: Math.max(0, Math.round(metric.durationMs)),
      correlation_id: metric.correlationId ?? null,
    })
  } catch (error) {
    // Non-fatal: metrics must never break the request flow
    console.warn('[observability] failed to record metric', error)
  }
}

export async function withApiMetric(
  route: string,
  method: string,
  correlationId: string | null,
  fn: () => Promise<{ result: NextResponse; status: number }>
): Promise<{ result: NextResponse; status: number; durationMs: number }> {
  const start = performance.now()
  try {
    const { result, status } = await fn()
    const durationMs = performance.now() - start
    await recordApiMetric({ route, method, status, durationMs, correlationId })
    return { result, status, durationMs }
  } catch (e) {
    const durationMs = performance.now() - start
    // On unhandled error, record as 500
    await recordApiMetric({ route, method, status: 500, durationMs, correlationId })
    throw e
  }
}
