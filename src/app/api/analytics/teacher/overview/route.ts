'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


function getISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
  return { year: date.getUTCFullYear(), week }
}

export async function GET(request: NextRequest) {
  try {
    // Lazily create client to avoid build-time errors when env is absent
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'local_service_key'
    )
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Du måste vara inloggad' }, { status: 401 })
    }

    const teacherId = session.user.id

    const { searchParams } = new URL(request.url)
    const weeks = Math.max(1, Math.min(52, parseInt(searchParams.get('weeks') || '10', 10)))

    const since = new Date()
    since.setDate(since.getDate() - weeks * 7)
    const sinceISO = since.toISOString()

    // Fetch teacher's quiz sessions
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('quiz_sessions')
      .select('id, created_at')
      .eq('owner_id', teacherId)
      .gte('created_at', sinceISO)

    if (sessionsError) {
      return NextResponse.json({ error: 'Kunde inte hämta sessioner' }, { status: 500 })
    }

    const sessionIds = (sessions || []).map(s => s.id)
    if (sessionIds.length === 0) {
      return NextResponse.json({ points: [], totalResponses: 0, avgCorrectRate: 0, weeks })
    }

    const { data: answers, error: answersError } = await supabaseAdmin
      .from('attempt_items')
      .select('is_correct, answered_at, session_id')
      .in('session_id', sessionIds)
      .gte('answered_at', sinceISO)

    if (answersError) {
      return NextResponse.json({ error: 'Kunde inte hämta svar' }, { status: 500 })
    }

    type Bucket = { correct: number; total: number }
    const buckets = new Map<string, Bucket>()

    let totalCorrect = 0
    let total = 0

    for (const a of answers || []) {
      const date = new Date(a.answered_at as string)
      const { year, week } = getISOWeek(date)
      const key = `${year}-W${String(week).padStart(2, '0')}`
      if (!buckets.has(key)) {
        buckets.set(key, { correct: 0, total: 0 })
      }
      const b = buckets.get(key)!
      b.total += 1
      if (a.is_correct) b.correct += 1
      total += 1
      if (a.is_correct) totalCorrect += 1
    }

    const points: { name: string; value: number }[] = []

    const now = new Date()
    for (let i = weeks - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const { year, week } = getISOWeek(d)
      const key = `${year}-W${String(week).padStart(2, '0')}`
      const bucket = buckets.get(key)
      const rate = bucket && bucket.total > 0 ? Math.round((bucket.correct / bucket.total) * 100) : 0
      points.push({ name: `V. ${String(week).padStart(2, '0')}`, value: rate })
    }

    const avgCorrectRate = total > 0 ? Math.round((totalCorrect / total) * 100) : 0

    return NextResponse.json({ points, totalResponses: total, avgCorrectRate, weeks })
  } catch (error) {
    console.error('Analytics error', error)
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 })
  }
}
