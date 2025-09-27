/*
  scripts/health/perf-load.ts
  Synthetic load for AR1: measures p95 for teacher session creation and student answer.
  Usage:
    BASE_URL=http://localhost:3000 tsx scripts/health/perf-load.ts
*/

import { createClient } from '@supabase/supabase-js'

function getEnv(name: string, fallback?: string): string {
  const v = process.env[name]
  if (v) return v
  if (fallback !== undefined) return fallback
  throw new Error(`Missing env: ${name}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedData(supabase: any) {
  const teacherId = 'mock-user-id'

  // Create minimal quiz with one question
  const quizId = `quiz_${Date.now()}`
  const questions = [{ id: 'q1', title: 'Testfråga', type: 'multiple-choice', options: [{ id: 'A', isCorrect: true }] }]
  await supabase.from('quizzes').insert({ id: quizId, title: 'Perf Test', questions, owner_id: teacherId }).throwOnError()

  // Create class owned by teacher
  const classId = `class_${Date.now()}`
  await supabase.from('classes').insert({ id: classId, name: 'Perf Klass', owner_id: teacherId }).throwOnError()

  // Create a live session for answer tests
  const sessionId = `session_${Date.now()}`
  await supabase.from('sessions').insert({
    id: sessionId,
    quiz_id: quizId,
    teacher_id: teacherId,
    class_id: classId,
    mode: 'sync',
    status: 'live',
    state: 'running',
    current_index: 0,
    allow_responses: true,
    code: `P${Math.random().toString(36).slice(2, 6)}`,
  }).throwOnError()

  return { quizId, classId, sessionId, questionId: 'q1' }
}

async function timeRequest(url: string, init: RequestInit): Promise<number> {
  const t0 = performance.now()
  const res = await fetch(url, init)
  // Read body to completion to avoid socket reuse issues
  try { await res.text() } catch {}
  const t1 = performance.now()
  return t1 - t0
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const rank = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(rank)
  const upper = Math.ceil(rank)
  const weight = rank - lower
  return lower === upper ? sorted[lower] : sorted[lower] * (1 - weight) + sorted[upper] * weight
}

async function run() {
  const baseUrl = getEnv('BASE_URL', 'http://localhost:3000')
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const { quizId, classId, sessionId, questionId } = await seedData(supabase)

  const levels = [25, 100, 200] // 500 might be too heavy in local dev

  const results: Record<string, { level: number; durations: number[]; p95: number }> = {}

  // Teacher create session
  for (const level of levels) {
    const bodies = Array.from({ length: level }, () => ({ classId, quizId, mode: 'sync' }))
    const reqs = bodies.map(body => timeRequest(`${baseUrl}/api/quiz-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }))
    const durations = await Promise.all(reqs)
    results[`create_${level}`] = { level, durations, p95: percentile(durations, 95) }
  }

  // Student answer
  for (const level of levels) {
    const bodies = Array.from({ length: level }, () => ({ questionId, answer: 'A' }))
    const reqs = bodies.map(body => timeRequest(`${baseUrl}/api/quiz-sessions/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }))
    const durations = await Promise.all(reqs)
    results[`answer_${level}`] = { level, durations, p95: percentile(durations, 95) }
  }

  const report = {
    at: new Date().toISOString(),
    baseUrl,
    quizId,
    classId,
    sessionId,
    summary: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { level: v.level, p95: v.p95 }])),
    raw: results,
  }

  console.log(JSON.stringify(report, null, 2))
}

run().catch((e) => {
  console.error('perf-load failed', e)
  process.exit(1)
})
