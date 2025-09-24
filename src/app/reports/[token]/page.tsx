"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { verifyShareToken, type SharePayload } from '@/lib/tokens'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { LineProgress } from '@/components/charts/LineProgress'
import { BarBySubject } from '@/components/charts/BarBySubject'
import { Distribution } from '@/components/charts/Distribution'

export default function SharedReportPage() {
  const params = useParams<{ token: string }>()
  const token = params.token

  const [valid, setValid] = React.useState(false)
  const [title, setTitle] = React.useState('Rapport')
  const [line, setLine] = React.useState<{ name: string; value: number }[]>([])
  const [bySubject, setBySubject] = React.useState<{ subject: string; value: number }[]>([])
  const [distribution, setDistribution] = React.useState<{ label: string; count: number }[]>([])

  React.useEffect(() => {
    const payload = verifyShareToken(token)
    if (!payload) {
      setValid(false)
      return
    }
    setValid(true)
    async function run(p: SharePayload) {
      const range = '30d'
      if (p.scope === 'student') {
        setTitle('Rapport: Elev')
        const [studentRes, statsRes] = await Promise.all([
          fetch(`/api/students/${p.id}`, { cache: 'no-store' }),
          fetch('/api/demo/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: p.id, range }) })
        ])
        const student = await studentRes.json()
        const stats = await statsRes.json()
        setTitle(`Rapport: ${student?.name || 'Elev'}`)
        const weekly = (stats?.student?.data || []) as Array<{ week_start: string; correct_rate: number; subject?: string | null }>
        setLine(weekly.map(r => ({ name: r.week_start.slice(5), value: Number(r.correct_rate || 0) })))
        const bySub = new Map<string, { sum: number; n: number }>()
        weekly.forEach((r) => {
          const key = r.subject || 'Okänt'
          const cur = bySub.get(key) || { sum: 0, n: 0 }
          cur.sum += Number(r.correct_rate || 0)
          cur.n += 1
          bySub.set(key, cur)
        })
        setBySubject(Array.from(bySub.entries()).map(([subject, { sum, n }]) => ({ subject, value: Math.round(sum / Math.max(1, n)) })))
      } else if (p.scope === 'class') {
        setTitle('Rapport: Klass')
        const [classRes, statsRes] = await Promise.all([
          fetch(`/api/classes/${p.id}`, { cache: 'no-store' }),
          fetch('/api/demo/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classId: p.id, range, limit: 5 }) })
        ])
        const cls = await classRes.json()
        const stats = await statsRes.json()
        setTitle(`Rapport: ${cls?.name || 'Klass'}`)
        const rows = (stats?.class?.data || []) as Array<{ correct_rate: number; subject?: string | null }>
        const bySub = new Map<string, { sum: number; n: number }>()
        rows.forEach((r) => {
          const key = r.subject || 'Okänt'
          const cur = bySub.get(key) || { sum: 0, n: 0 }
          cur.sum += Number(r.correct_rate || 0)
          cur.n += 1
          bySub.set(key, cur)
        })
        setBySubject(Array.from(bySub.entries()).map(([subject, { sum, n }]) => ({ subject, value: Math.round(sum / Math.max(1, n)) })))
        const buckets = [0,0,0,0,0]
        rows.forEach((r) => {
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
      }
    }
    run(payload)
  }, [token])

  const containerRef = React.useRef<HTMLDivElement | null>(null)

  function exportPNG() {
    const node = containerRef.current
    if (!node) return
    const width = node.offsetWidth
    const height = node.offsetHeight
    const cloned = node.cloneNode(true) as HTMLElement
    // Wrap cloned HTML into SVG foreignObject
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<foreignObject width="100%" height="100%">` +
      `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;">${cloned.outerHTML}</div>` +
      `</foreignObject></svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background') || '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const png = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = png
      a.download = 'rapport.png'
      a.click()
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }

  if (!valid) {
    return (
      <div className="container mx-auto p-6">
        <Typography variant="h4" className="font-semibold">Ogiltig eller utgången länk</Typography>
        <Typography variant="body2" className="text-neutral-600">Be den som delade länken att skapa en ny.</Typography>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h3" className="font-semibold">{title}</Typography>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 border rounded" onClick={() => window.print()}>Exportera PDF</button>
          <button className="px-3 py-2 border rounded" onClick={exportPNG}>Exportera PNG</button>
        </div>
      </div>

      {line.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Utveckling över tid</CardTitle>
          </CardHeader>
          <CardContent>
            <LineProgress data={line} />
          </CardContent>
        </Card>
      )}

      {bySubject.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Per ämne</CardTitle>
          </CardHeader>
          <CardContent>
            <BarBySubject data={bySubject} />
          </CardContent>
        </Card>
      )}

      {distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fördelning</CardTitle>
          </CardHeader>
          <CardContent>
            <Distribution data={distribution} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
