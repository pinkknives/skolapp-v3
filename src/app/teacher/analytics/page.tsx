"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AreaScoreChart, AreaScorePoint } from '@/components/analytics/AreaScoreChart'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { SkillsHeatmap } from '@/components/analytics/SkillsHeatmap'
import { TopWeakSkills } from '@/components/analytics/TopWeakSkills'
import Link from 'next/link'

export default function TeacherAnalyticsPage() {
  const [data, setData] = React.useState<AreaScorePoint[]>([])
  const [avg, setAvg] = React.useState<number>(0)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  const [weeks, setWeeks] = React.useState<string[]>([])
  const [skills, setSkills] = React.useState<{ id: string; key?: string; name?: string; subject?: string }[]>([])
  const [heatmap, setHeatmap] = React.useState<{ week: string; values: { skillId: string; rate: number }[] }[]>([])
  const [topWeak, setTopWeak] = React.useState<{ skillId: string; attempts: number; rate: number; meta?: { id: string; key?: string; name?: string; subject?: string } }[]>([])

  const [consentRate, setConsentRate] = React.useState<number>(0)
  const [feedbackRatio, setFeedbackRatio] = React.useState<number>(0)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, skillsRes, metricsRes] = await Promise.all([
        fetch('/api/analytics/teacher/overview?weeks=10'),
        fetch('/api/analytics/teacher/skills?weeks=10'),
        fetch('/api/ai/metrics')
      ])

      if (!overviewRes.ok) throw new Error('Kunde inte hämta övergripande analysdata')
      if (!skillsRes.ok) throw new Error('Kunde inte hämta kompetensdata')

      const overview = await overviewRes.json()
      const skillsJson = await skillsRes.json()

      setData(overview.points || [])
      setAvg(overview.avgCorrectRate || 0)

      setWeeks(skillsJson.weeks || [])
      setSkills(skillsJson.skills || [])
      setHeatmap(skillsJson.heatmap || [])
      setTopWeak(skillsJson.topWeak || [])

      if (metricsRes.ok) {
        const metrics = await metricsRes.json()
        setConsentRate(Number((metrics.consentRate || 0) * 100))
        setFeedbackRatio(Number((metrics.feedbackRatio || 0) * 100))
      }
    } catch (_error) {
      setError('Ingen analysdata hittades. Visa exempeldata?')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const loadSample = () => {
    const sample: AreaScorePoint[] = [
      { name: 'V. 01', value: 62 },
      { name: 'V. 02', value: 64 },
      { name: 'V. 03', value: 67 },
      { name: 'V. 04', value: 66 },
      { name: 'V. 05', value: 70 },
      { name: 'V. 06', value: 72 },
      { name: 'V. 07', value: 74 },
      { name: 'V. 08', value: 73 },
      { name: 'V. 09', value: 75 },
      { name: 'V. 10', value: 78 },
    ]
    setData(sample)
    setAvg(70)
    setWeeks(['2025-01-06','2025-01-13','2025-01-20'])
    setSkills([{ id: 's1', name: 'Bråk' }, { id: 's2', name: 'Procent' }])
    setHeatmap([
      { week: '2025-01-06', values: [{ skillId: 's1', rate: 40 }, { skillId: 's2', rate: 60 }] },
      { week: '2025-01-13', values: [{ skillId: 's1', rate: 55 }, { skillId: 's2', rate: 65 }] },
      { week: '2025-01-20', values: [{ skillId: 's1', rate: 70 }, { skillId: 's2', rate: 72 }] },
    ])
    setTopWeak([
      { skillId: 's1', attempts: 34, rate: 55, meta: { id: 's1', name: 'Bråk' } },
    ])
    setConsentRate(42)
    setFeedbackRatio(67)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Typography variant="h3" className="font-semibold">Analys & Utveckling</Typography>
          <Typography variant="body2" className="text-neutral-600 dark:text-neutral-300">Översikt av elevernas utveckling över tid samt kompetensluckor.</Typography>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchData}>Uppdatera</Button>
          <Button size="sm" onClick={loadSample}>Exempeldata</Button>
        </div>
      </div>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent>
          <Typography variant="body2" className="text-neutral-700 dark:text-neutral-300">
            Så använder vi datan: endast aggregerad klassnivå visas här. Ingen PII sparas i AI‑träningsdata.
            Läs mer i <Link href="/integritet" className="underline hover:no-underline">Integritet</Link> och
            {' '}<Link href="/villkor" className="underline hover:no-underline">Villkor</Link>.
          </Typography>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Samtyckesgrad</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="h2">{Math.round(consentRate)}%</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Feedback (👍 / totalt)</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="h2">{Math.round(feedbackRatio)}%</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Senaste 30 dagar (träning)</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2">Se detaljer i export och AI‑panel.</Typography>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Veckovis korrekt‑andel
            {loading ? null : (
              <span className="ml-2 text-sm font-normal text-neutral-500">(Snitt: {avg}%)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Typography variant="body2">Laddar…</Typography>
          ) : error ? (
            <Typography variant="body2" className="text-amber-600 dark:text-amber-400">{error}</Typography>
          ) : data.length === 0 ? (
            <Typography variant="body2">Ingen data att visa.</Typography>
          ) : (
            <AreaScoreChart data={data} label="Korrekt %" height={320} />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkillsHeatmap weeks={weeks} skills={skills} heatmap={heatmap} />
        </div>
        <div>
          <TopWeakSkills items={topWeak} />
        </div>
      </div>
    </div>
  )
}
