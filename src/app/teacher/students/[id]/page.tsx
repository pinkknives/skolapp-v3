"use client"

import React from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { LineProgress } from '@/components/charts/LineProgress'
import { BarBySubject } from '@/components/charts/BarBySubject'
import type { TimeRange } from '@/lib/api/stats'
import { AIInsightsPanel, type InsightsData } from '@/components/analytics/AIInsightsPanel'

export default function StudentPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const studentId = params.id

  const [range, setRange] = React.useState<TimeRange>((searchParams.get('range') as TimeRange) || '30d')
  const [name, setName] = React.useState<string>('')
  const [line, setLine] = React.useState<{ name: string; value: number }[]>([])
  const [bySubject, setBySubject] = React.useState<{ subject: string; value: number }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [insights, setInsights] = React.useState<InsightsData | null>(null)
  const [insightsLoading, setInsightsLoading] = React.useState(false)

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
        const [studentRes, progressRes] = await Promise.all([
          fetch(`/api/students/${studentId}`, { cache: 'no-store' }),
          fetch('/api/demo/stats', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, range })
          })
        ])
        const student = await studentRes.json()
        const stats = await progressRes.json()
        if (aborted) return
        setName(student?.name || 'Elev')
        // Map weekly progress to chart points
        const weekly = (stats?.student?.data || []) as Array<{ week_start: string; correct_rate: number }>
        setLine(weekly.map(r => ({ name: r.week_start.slice(5), value: Number(r.correct_rate || 0) })))
        // Aggregate by subject
        const bySub = new Map<string, { sum: number; n: number }>()
        ;(stats?.student?.data || []).forEach((r: { subject?: string | null; correct_rate: number }) => {
          const key = r.subject || 'Okänt'
          const cur = bySub.get(key) || { sum: 0, n: 0 }
          cur.sum += Number(r.correct_rate || 0)
          cur.n += 1
          bySub.set(key, cur)
        })
        setBySubject(Array.from(bySub.entries()).map(([subject, { sum, n }]) => ({ subject, value: Math.round(sum / Math.max(1, n)) })))

        // Fetch AI insights
        setInsightsLoading(true)
        try {
          const ir = await fetch('/api/insights/student', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, range }) })
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
  }, [studentId, range])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Typography variant="h3" className="font-semibold">{name}</Typography>
          <Typography variant="body2" className="text-neutral-600">Elevvy</Typography>
        </div>
        <div className="flex items-center gap-2">
          <select className="border rounded px-2 py-1" value={range} onChange={(e) => setRange(e.target.value as TimeRange)}>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
            <option value="term">termin</option>
            <option value="year">år</option>
          </select>
          <Button variant="outline" onClick={() => location.reload()}>Uppdatera</Button>
          <Button
            onClick={async () => {
              const res = await fetch('/api/reports/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scope: 'student', id: studentId, ttl: 3600 }) })
              const json = await res.json()
              if (json?.url) await navigator.clipboard.writeText(json.url)
            }}
          >Dela rapport</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utveckling över tid</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && line.length === 0 ? (
            <Typography variant="body2">Laddar…</Typography>
          ) : line.length === 0 ? (
            <Typography variant="body2">Ingen data.</Typography>
          ) : (
            <LineProgress data={line} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per ämne</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && bySubject.length === 0 ? (
            <Typography variant="body2">Laddar…</Typography>
          ) : bySubject.length === 0 ? (
            <Typography variant="body2">Ingen data.</Typography>
          ) : (
            <BarBySubject data={bySubject} />
          )}
        </CardContent>
      </Card>

      <AIInsightsPanel data={insights} loading={insightsLoading} />
    </div>
  )
}
