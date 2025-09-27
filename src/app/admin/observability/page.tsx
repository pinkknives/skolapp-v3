import React from 'react'

async function fetchSlo(hours: number) {
  const res = await fetch(`/api/analytics/slo?hours=${hours}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Kunde inte hämta SLO-data')
  return res.json() as Promise<{
    windowHours: number
    total: number
    availability: number
    errorRate: number
    p95: number
    byRoute: Record<string, { count: number; errors: number; p95: number }>
  }>
}

export default async function ObservabilityPage() {
  const [slo24, slo168] = await Promise.all([fetchSlo(24), fetchSlo(168)])

  const formatPct = (v: number) => `${(v * 100).toFixed(2)}%`
  const formatMs = (v: number) => `${Math.round(v)} ms`

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Observability & SLO</h1>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">Tillgänglighet (24h)</div>
          <div className="text-2xl font-bold" aria-label="Tillgänglighet 24 timmar">{formatPct(slo24.availability)}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">p95 svarstid (24h)</div>
          <div className="text-2xl font-bold" aria-label="p95 24 timmar">{formatMs(slo24.p95)}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">Felfrekvens (24h)</div>
          <div className="text-2xl font-bold" aria-label="Felfrekvens 24 timmar">{formatPct(slo24.errorRate)}</div>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="text-lg font-medium mb-2">Nedbrytning per route (24h)</h2>
        <div role="table" className="w-full text-sm">
          <div role="row" className="grid grid-cols-4 font-medium border-b py-2">
            <div>Route</div>
            <div className="text-right">Antal</div>
            <div className="text-right">Felfrekvens</div>
            <div className="text-right">p95</div>
          </div>
          {Object.entries(slo24.byRoute).map(([route, m]) => (
            <div key={route} role="row" className="grid grid-cols-4 border-b py-2">
              <div className="truncate" title={route}>{route}</div>
              <div className="text-right">{m.count}</div>
              <div className="text-right">{formatPct(m.count ? m.errors / m.count : 0)}</div>
              <div className="text-right">{formatMs(m.p95)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">Tillgänglighet (7 dagar)</div>
          <div className="text-2xl font-bold" aria-label="Tillgänglighet 7 dagar">{formatPct(slo168.availability)}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">p95 svarstid (7 dagar)</div>
          <div className="text-2xl font-bold" aria-label="p95 7 dagar">{formatMs(slo168.p95)}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">Felfrekvens (7 dagar)</div>
          <div className="text-2xl font-bold" aria-label="Felfrekvens 7 dagar">{formatPct(slo168.errorRate)}</div>
        </div>
      </section>

      <p className="text-xs text-neutral-500">All data är anonymiserad och aggregerad. Inga personuppgifter lagras i denna vy.</p>
    </div>
  )
}
