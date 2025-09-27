import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { withApiMetric } from '@/lib/observability'

// Rate limiting map - in production this should use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 10000 // 10 seconds
const RATE_LIMIT_MAX = 5 // Max 5 requests per window

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

/**
 * POST /api/quiz-sessions/:id/answer
 * Submit a student answer for the current question
 * Body: { questionId: string, answer: string | string[], userId?: string }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id')
  return (await withApiMetric('quiz-sessions.answer', 'POST', correlationId, async () => {
  try {
    const { id: sessionId } = await context.params
    const supabase = supabaseServer()

    const body = await request.json()
    const { questionId, answer, userId } = body

    if (!questionId || answer === undefined) {
      const res = NextResponse.json(
        { error: 'Fråge-ID och svar krävs' },
        { status: 400 }
      )
      return { result: res, status: 400 }
    }

    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = userId ? `user:${userId}` : `ip:${clientIp}`
    
    if (!checkRateLimit(rateLimitKey)) {
      const res = NextResponse.json(
        { error: 'Du svarar för snabbt. Vänta ett ögonblick.' },
        { status: 429 }
      )
      return { result: res, status: 429 }
    }

    // Get session and verify it's active and accepting responses
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        quizzes!inner(questions)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      const res = NextResponse.json(
        { error: 'Session hittades inte' },
        { status: 404 }
      )
      return { result: res, status: 404 }
    }

    if (session.status !== 'live') {
      const res = NextResponse.json(
        { error: 'Sessionen är inte aktiv' },
        { status: 400 }
      )
      return { result: res, status: 400 }
    }

    if (!session.allow_responses) {
      const res = NextResponse.json(
        { error: 'Svar är för närvarande låsta' },
        { status: 400 }
      )
      return { result: res, status: 400 }
    }

    // For sync sessions, verify the question is the current active question
    if (session.mode === 'sync') {
      const questions = Array.isArray(session.quizzes) ? session.quizzes[0]?.questions : session.quizzes?.questions
      const currentQuestion = questions?.[session.current_index]
      
      if (!currentQuestion || currentQuestion.id !== questionId) {
        const res = NextResponse.json(
          { error: 'Detta är inte den aktiva frågan' },
          { status: 400 }
        )
        return { result: res, status: 400 }
      }
    }

    // Verify participant is in session (for authenticated users)
    if (userId) {
      const { data: participant } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .or(`student_id.eq.${userId},student_profile_id.eq.${userId}`)
        .single()

      if (!participant) {
        const res = NextResponse.json(
          { error: 'Du är inte registrerad som deltagare i denna session' },
          { status: 403 }
        )
        return { result: res, status: 403 }
      }
    }

    // Check if answer already exists (prevent duplicate answers)
    const { data: existingAnswer } = await supabase
      .from('session_answers')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .eq('student_profile_id', userId || null)
      .single()

    if (existingAnswer) {
      const res = NextResponse.json(
        { error: 'Du har redan svarat på denna fråga' },
        { status: 400 }
      )
      return { result: res, status: 400 }
    }

    // Determine if answer is correct (for auto-grading)
    const questions = Array.isArray(session.quizzes) ? session.quizzes[0]?.questions : session.quizzes?.questions
    const question = questions?.find((q: { id: string }) => q.id === questionId)
    let isCorrect = false

    if (question) {
      if (question.type === 'multiple-choice') {
        const selectedOptions = Array.isArray(answer) ? answer : [answer]
        const correctOptions = question.options?.filter((opt: { isCorrect: boolean }) => opt.isCorrect).map((opt: { id: string }) => opt.id) || []
        isCorrect = selectedOptions.length === correctOptions.length && 
                   selectedOptions.every((id: string) => correctOptions.includes(id))
      } else if (question.type === 'free-text') {
        const studentAnswer = (answer as string).toLowerCase().trim()
        const expectedAnswer = question.expectedAnswer?.toLowerCase().trim()
        isCorrect = expectedAnswer ? studentAnswer === expectedAnswer : false
      }
    }

    // Insert the answer with GDPR compliance
    // In Korttidsläge: student_profile_id = null
    // In Långtidsläge: student_profile_id = userId
    const { data: sessionAnswer, error: answerError } = await supabase
      .from('session_answers')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        student_profile_id: userId || null, // GDPR: null for anonymous mode
        answer: typeof answer === 'string' ? { text: answer } : { selectedOptions: answer },
        is_correct: isCorrect,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (answerError) {
      console.error('Error saving answer:', answerError)
      const res = NextResponse.json(
        { error: 'Kunde inte spara svar' },
        { status: 500 }
      )
      return { result: res, status: 500 }
    }

    // Also store detailed attempt item for analytics (long-term)
    try {
      const admin = supabaseServer()
      // Optional: timeSpentSeconds can be provided by client; default null
      const timeSpentSeconds = typeof body.timeSpentSeconds === 'number' ? body.timeSpentSeconds : null

      await admin
        .from('attempt_items')
        .insert({
          session_id: sessionId,
          user_id: userId || sessionAnswer.student_profile_id || null,
          question_id: questionId,
          question_index: session.current_index ?? 0,
          answer: typeof answer === 'string' ? { text: answer } : { selectedOptions: answer },
          is_correct: isCorrect,
          score: isCorrect ? 1 : 0,
          time_spent_seconds: timeSpentSeconds,
          answered_at: sessionAnswer.submitted_at,
          attempt_no: 1
        })
    } catch (e) {
      console.warn('attempt_items insert failed (non-fatal):', e)
    }

    // Publish realtime event for live response updates
    const channel = supabase.channel(`session:${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'responses_updated',
      payload: {
        questionId,
        totalResponses: 1, // This would be calculated properly in a real implementation
        newResponse: {
          isCorrect,
          timestamp: sessionAnswer.submitted_at
        }
      }
    })

    // Trigger aggregate refresh (async)
    supabase
      .from('session_answers')
      .select('count(*)')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .then(() => {
        // This would trigger the materialized view refresh
      })

    const res = NextResponse.json({
      success: true,
      answer: {
        id: sessionAnswer.id,
        isCorrect,
        submittedAt: sessionAnswer.submitted_at
      }
    })
    return { result: res, status: 200 }

  } catch (error) {
    console.error('Error submitting answer:', error)
    const res = NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
    return { result: res, status: 500 }
  }
  })).result
}