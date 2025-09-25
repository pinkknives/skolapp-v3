import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'local_service_key'
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Du måste vara inloggad' }, { status: 401 })
    }

    const teacherId = session.user.id
    const { searchParams } = new URL(request.url)
    const weeks = Math.max(1, Math.min(26, parseInt(searchParams.get('weeks') || '10', 10)))

    // Find teacher's students (participants in teacher's sessions in window)
    const since = new Date()
    since.setDate(since.getDate() - weeks * 7)

    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('teacher_id', teacherId)
      .gte('started_at', since.toISOString())

    if (sessionsError) {
      return NextResponse.json({ error: 'Kunde inte hämta sessioner' }, { status: 500 })
    }

    const sessionIds = (sessions || []).map(s => s.id)
    if (sessionIds.length === 0) {
      return NextResponse.json({ weeks, heatmap: [], skills: [], topWeak: [] })
    }

    // Get distinct students from participants
    const { data: participants } = await supabaseAdmin
      .from('session_participants')
      .select('student_id')
      .in('session_id', sessionIds)
      .not('student_id', 'is', null)

    const studentIds = Array.from(new Set((participants || []).map(p => p.student_id))) as string[]

    if (studentIds.length === 0) {
      return NextResponse.json({ weeks, heatmap: [], skills: [], topWeak: [] })
    }

    // Pull weekly performance for these students from student_skill_weekly
    const { data: perf, error: perfError } = await supabaseAdmin
      .from('student_skill_weekly')
      .select('user_id, skill_id, week_start, attempts, correct, correct_rate')
      .in('user_id', studentIds)
      .gte('week_start', since.toISOString())

    if (perfError) {
      return NextResponse.json({ error: 'Kunde inte hämta kompetensdata' }, { status: 500 })
    }

    // Fetch skill metadata
    const skillIds = Array.from(new Set((perf || []).map(p => p.skill_id))) as string[]
    const { data: skills } = skillIds.length > 0
      ? await supabaseAdmin.from('skills').select('id, key, name, subject').in('id', skillIds)
      : { data: [] as { id: string; key?: string; name?: string; subject?: string }[] }

    const skillMap = new Map(skills?.map(s => [s.id, s]) || [])

    // Build heatmap: for each week, aggregate class average per skill
    const buckets = new Map<string, { attempts: number; correct: number }>()
    const weeksSet = new Set<string>()

    for (const row of perf || []) {
      const weekKey = new Date(row.week_start).toISOString().slice(0, 10)
      weeksSet.add(weekKey)
      const key = `${weekKey}:${row.skill_id}`
      if (!buckets.has(key)) buckets.set(key, { attempts: 0, correct: 0 })
      const b = buckets.get(key)!
      b.attempts += Number(row.attempts || 0)
      b.correct += Number(row.correct || 0)
    }

    const orderedWeeks = Array.from(weeksSet).sort()
    const skillsOrdered = (skills || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    const heatmap = orderedWeeks.map(week => ({
      week,
      values: skillsOrdered.map(s => {
        const b = buckets.get(`${week}:${s.id}`)
        const rate = b && b.attempts > 0 ? Math.round((b.correct / b.attempts) * 100) : 0
        return { skillId: s.id, rate }
      })
    }))

    // Compute top-N weakest (lowest avg rate, with min attempts)
    const aggregatePerSkill = new Map<string, { attempts: number; correct: number }>()
    for (const [key, val] of buckets) {
      const skillId = key.split(':')[1]
      const agg = aggregatePerSkill.get(skillId) || { attempts: 0, correct: 0 }
      agg.attempts += val.attempts
      agg.correct += val.correct
      aggregatePerSkill.set(skillId, agg)
    }

    const minAttempts = 10
    const topWeak = Array.from(aggregatePerSkill.entries())
      .map(([skillId, agg]) => ({
        skillId,
        attempts: agg.attempts,
        rate: agg.attempts > 0 ? Math.round((agg.correct / agg.attempts) * 100) : 0,
        meta: skillMap.get(skillId)
      }))
      .filter(x => x.attempts >= minAttempts)
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 5)

    return NextResponse.json({ weeks: orderedWeeks, skills: skillsOrdered, heatmap, topWeak })
  } catch (error) {
    console.error('teacher skills api error', error)
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 })
  }
}
