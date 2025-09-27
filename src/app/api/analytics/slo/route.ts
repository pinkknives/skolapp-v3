'use server'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const rank = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(rank)
  const upper = Math.ceil(rank)
  const weight = rank - lower
  if (lower === upper) return sorted[lower]
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const hours = Math.max(1, Math.min(720, Number(url.searchParams.get('hours') || 24)))
    const routeFilter = url.searchParams.get('route') || null

    const client = supabaseServer()
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    let query = client
      .from('api_metrics')
      .select('created_at, route, status, duration_ms')
      .gte('created_at', since)

    if (routeFilter) {
      query = query.eq('route', routeFilter)
    }

    const { data, error } = await query.limit(50000)
    if (error) throw error

    const total = data?.length || 0
    const errors = (data || []).filter((r) => (r.status || 0) >= 500).length
    const availability = total > 0 ? (total - errors) / total : 1
    const errorRate = total > 0 ? errors / total : 0

    const durations = (data || []).map((r) => (r.duration_ms as number) || 0)
    const p95 = percentile(durations, 95)

    // Group by route for breakdown
    const byRoute: Record<string, { count: number; errors: number; p95: number }> = {}
    for (const row of data || []) {
      const key = (row.route as string) || 'unknown'
      if (!byRoute[key]) byRoute[key] = { count: 0, errors: 0, p95: 0 }
      byRoute[key].count++
      if ((row.status as number) >= 500) byRoute[key].errors++
    }
    // compute p95 per route
    const routeDurations: Record<string, number[]> = {}
    for (const row of data || []) {
      const key = (row.route as string) || 'unknown'
      if (!routeDurations[key]) routeDurations[key] = []
      routeDurations[key].push((row.duration_ms as number) || 0)
    }
    for (const key of Object.keys(byRoute)) {
      byRoute[key].p95 = percentile(routeDurations[key] || [], 95)
    }

    const res = NextResponse.json({
      windowHours: hours,
      total,
      availability,
      errorRate,
      p95,
      byRoute
    })
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60')
    return res
  } catch (error) {
    console.error('slo api error', error)
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 })
  }
}
