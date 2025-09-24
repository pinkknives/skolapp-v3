'use server'

import { NextRequest, NextResponse } from 'next/server'
import { fetchStudentProgress, type TimeRange } from '@/lib/api/stats'
import { openai, isOpenAIAvailable } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
  try {
    const { studentId, range } = (await request.json().catch(() => ({}))) as { studentId?: string; range?: TimeRange }
    if (!studentId) {
      return NextResponse.json({ error: 'studentId krävs' }, { status: 400 })
    }

    const progress = await fetchStudentProgress(studentId, range || '30d')

    // Build simple heuristics for sources/explainability
    const rows = progress.data || []
    const lowSpots = [...rows]
      .filter((r) => Number(r.correct_rate) <= 60)
      .sort((a, b) => Number(a.correct_rate) - Number(b.correct_rate))
      .slice(0, 5)
      .map((r) => ({
        type: 'low_correct_rate',
        subject: (r.subject as string) || 'Okänt',
        weekStart: r.week_start,
        correctRate: Number(r.correct_rate),
        reason: `Korrekt‑andel ${Number(r.correct_rate)}% i ${(r.subject as string) || 'okänt'} vecka ${r.week_start}`,
      }))

    // Aggregate by subject for strengths/focus
    const bySubject = new Map<string, { sum: number; n: number }>()
    rows.forEach((r) => {
      const key = (r.subject as string) || 'Okänt'
      const cur = bySubject.get(key) || { sum: 0, n: 0 }
      cur.sum += Number(r.correct_rate || 0)
      cur.n += 1
      bySubject.set(key, cur)
    })
    const subjectAvg = Array.from(bySubject.entries()).map(([k, v]) => ({ subject: k, avg: v.n ? v.sum / v.n : 0 }))
    const strengths = subjectAvg.filter((s) => s.avg >= 75).map((s) => s.subject).slice(0, 5)
    const focusSkills = subjectAvg.filter((s) => s.avg < 65).map((s) => ({ key: s.subject, reason: 'Låg medelprocent senaste perioden' })).slice(0, 5)

    if (!isOpenAIAvailable) {
      return NextResponse.json({
        summary: 'Demo‑läge: Heuristisk sammanfattning baserad på senaste veckorna.',
        classInsights: [],
        studentStrategies: ['Repetera områden med <65% i medel', 'Planera korta övningar 10–15 min/dag'],
        focusSkills,
        strengths,
        sources: lowSpots,
      })
    }

    const prompt = {
      role: 'system' as const,
      content:
        'Du är en lärares assistent. Analysera elevens utveckling och ge rekommendationer. Svara strikt i JSON. Fält: summary (string), studentStrategies (string[]), focusSkills ({key,reason}[]), strengths (string[]), sources (array av objekt med reason, subject, weekStart, correctRate).',
    }

    const userMsg = {
      role: 'user' as const,
      content: JSON.stringify({ progress: rows, strengths, focusSkills, lowSpots }),
    }

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [prompt, userMsg],
      response_format: { type: 'json_object' },
    })

    const text = resp.choices?.[0]?.message?.content || '{}'
    const json = JSON.parse(text)
    return NextResponse.json(json)
  } catch (error) {
    console.error('student insights error', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
