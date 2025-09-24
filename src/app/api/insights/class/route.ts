'use server'

import { NextRequest, NextResponse } from 'next/server'
import { fetchClassProgress, type TimeRange } from '@/lib/api/stats'
import { openai, isOpenAIAvailable } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
  try {
    const { classId, range } = (await request.json().catch(() => ({}))) as { classId?: string; range?: TimeRange }
    if (!classId) {
      return NextResponse.json({ error: 'classId krävs' }, { status: 400 })
    }

    const progress = await fetchClassProgress(classId, range || '30d')
    const rows = progress.data || []

    const bySubject = new Map<string, { sum: number; n: number }>()
    rows.forEach((r) => {
      const key = (r.subject as string) || 'Okänt'
      const cur = bySubject.get(key) || { sum: 0, n: 0 }
      cur.sum += Number(r.correct_rate || 0)
      cur.n += 1
      bySubject.set(key, cur)
    })

    const subjectAvg = Array.from(bySubject.entries()).map(([k, v]) => ({ subject: k, avg: v.n ? v.sum / v.n : 0 }))
    const weakest = subjectAvg.sort((a, b) => a.avg - b.avg).slice(0, 5)
    const sources = rows
      .filter((r) => Number(r.correct_rate) <= 60)
      .slice(0, 10)
      .map((r) => ({ subject: (r.subject as string) || 'Okänt', weekStart: r.week_start, correctRate: Number(r.correct_rate), reason: 'Låg korrekt‑andel i klass' }))

    if (!isOpenAIAvailable) {
      return NextResponse.json({
        summary: 'Demo‑läge: Klassens fokusområden genererade heuristiskt.',
        classInsights: weakest.map((w) => `Behov av repetition i ${w.subject}`),
        studentStrategies: ['Gruppera efter behov', 'Kort repetition i början av lektionen'],
        focusSkills: weakest.map((w) => ({ key: w.subject, reason: 'Låg medelprocent' })),
        strengths: subjectAvg.filter((s) => s.avg >= 75).map((s) => s.subject),
        sources,
      })
    }

    const prompt = {
      role: 'system' as const,
      content:
        'Du är en lärares assistent. Analysera klassens utveckling och ge rekommendationer. Svara strikt i JSON: summary, classInsights[], studentStrategies[], focusSkills[{key,reason}], strengths[], sources[].',
    }

    const userMsg = { role: 'user' as const, content: JSON.stringify({ progress: rows, weakest, sources }) }

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [prompt, userMsg],
      response_format: { type: 'json_object' },
    })

    const text = resp.choices?.[0]?.message?.content || '{}'
    const json = JSON.parse(text)
    return NextResponse.json(json)
  } catch (error) {
    console.error('class insights error', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
