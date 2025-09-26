"use client"

import React from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Distribution } from '@/components/charts/Distribution'
import { BarBySubject } from '@/components/charts/BarBySubject'
import type { TimeRange } from '@/lib/api/stats'
import { AIInsightsPanel, type InsightsData } from '@/components/analytics/AIInsightsPanel'

export default function ClassPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const classId = params.id

  const [range, setRange] = React.useState<TimeRange>((searchParams.get('range') as TimeRange) || '30d')
  const [name, setName] = React.useState<string>('')
  const [distribution, setDistribution] = React.useState<{ label: string; count: number }[]>([])
  const [bySubject, setBySubject] = React.useState<{ subject: string; value: number }[]>([])
  const [topBottom, setTopBottom] = React.useState<{ student_id: string; attempts: number; avg_score: number }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [insights, setInsights] = React.useState<InsightsData | null>(null)
  const [insightsLoading, setInsightsLoading] = React.useState(false)
  const [pushEnabled, setPushEnabled] = React.useState<boolean>(false)
  const [updatingPush, setUpdatingPush] = React.useState<boolean>(false)

  React.useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('range', range)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [range, router, searchParams])

  React.useEffect(() => {
    let aborted = false
    async function run() {
      setLoading(true)
      try {
        const [classRes, statsRes] = await Promise.all([
          fetch(`/api/classes/${classId}`, { cache: 'no-store' }),
          fetch('/api/demo/stats', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId, range, limit: 5 })
          })
        ])
        const cls = await classRes.json()
        const stats = await statsRes.json()
        if (aborted) return
        setName(cls?.name || 'Klass')
        setPushEnabled(!!cls?.push_notifications_enabled)
        // Subject aggregation
        const bySub = new Map<string, { sum: number; n: number }>()
        ;(stats?.class?.data || []).forEach((r: { subject?: string | null; correct_rate: number }) => {
          const key = r.subject || 'Okänt'
          const cur = bySub.get(key) || { sum: 0, n: 0 }
          cur.sum += Number(r.correct_rate || 0)
          cur.n += 1
          bySub.set(key, cur)
        })
        setBySubject(Array.from(bySub.entries()).map(([subject, { sum, n }]) => ({ subject, value: Math.round(sum / Math.max(1, n)) })))
        // Distribution (bucket correct_rate to ranges)
        const buckets = [0,0,0,0,0]
        ;(stats?.class?.data || []).forEach((r: { correct_rate: number }) => {
          const v = Number(r.correct_rate || 0)
          const idx = v <= 20 ? 0 : v <= 40 ? 1 : v <= 60 ? 2 : v <= 80 ? 3 : 4
          buckets[idx]++
        })
        setDistribution([
          { label: '0-20', count: buckets[0] },
          { label: '21-40', count: buckets[1] },
          { label: '41-60', count: buckets[2] },
          { label: '61-80', count: buckets[3] },
          { label: '81-100', count: buckets[4] },
        ])
        setTopBottom((stats?.topBottom?.data || []) as typeof topBottom)

        // AI insights
        setInsightsLoading(true)
        try {
          const ir = await fetch('/api/insights/class', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classId, range }) })
          const ij = await ir.json()
          setInsights(ij)
        } catch {
          setInsights(null)
        } finally {
          setInsightsLoading(false)
        }
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    run()
    return () => { aborted = true }
  }, [classId, range])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Typography variant="h3" className="font-semibold">{name}</Typography>
          <Typography variant="body2" className="text-neutral-600">Klassvy</Typography>
        </div>
        <div className="flex items-center gap-2">
          <select className="border rounded px-2 py-1" value={range} onChange={(e) => setRange(e.target.value as TimeRange)}>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
            <option value="term">termin</option>
            <option value="year">år</option>
          </select>
          <Button variant="outline" onClick={() => location.reload()}>Uppdatera</Button>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={async (e) => {
                const next = e.target.checked
                setUpdatingPush(true)
                try {
                  const resp = await fetch(`/api/classes/${classId}/push`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: next })
                  })
                  if (resp.ok) setPushEnabled(next)
                } finally {
                  setUpdatingPush(false)
                }
              }}
              className="h-4 w-4 text-primary-600"
            />
            <span className="text-sm">{updatingPush ? 'Uppdaterar…' : (pushEnabled ? 'Push på' : 'Push av')}</span>
          </label>
          <Button
            onClick={async () => {
              const source = prompt('Källa elev-ID (uuid) att slå ihop?')
              const target = prompt('Mål elev-ID (uuid)?')
              if (!source || !target) return
              await fetch('/api/merge-requests', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceStudentId: source, targetStudentId: target, reason: 'Lärarinitierad' })
              })
            }}
          >Begär sammanslagning</Button>
          <Button
            onClick={async () => {
              const res = await fetch('/api/reports/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scope: 'class', id: classId, ttl: 3600 }) })
              const json = await res.json()
              if (json?.url) await navigator.clipboard.writeText(json.url)
            }}
          >Dela rapport</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarBySubject data={bySubject} title="Per ämne (medel korrekt %)" />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Topp / Botten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && topBottom.length === 0 ? (
                <Typography variant="body2">Laddar…</Typography>
              ) : topBottom.length === 0 ? (
                <Typography variant="body2">Ingen data.</Typography>
              ) : (
                topBottom.map((s) => (
                  <div key={s.student_id} className="flex items-center justify-between">
                    <span className="font-mono text-xs">{s.student_id.slice(0,8)}</span>
                    <span className="text-neutral-600 text-xs">{s.attempts} försök</span>
                    <span className="font-semibold">{s.avg_score}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fördelning</CardTitle>
        </CardHeader>
        <CardContent>
          <Distribution data={distribution} />
        </CardContent>
      </Card>

      <AIInsightsPanel data={insights} loading={insightsLoading} />
    </div>
  )
}
