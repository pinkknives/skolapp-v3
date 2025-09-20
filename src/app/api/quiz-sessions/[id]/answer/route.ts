import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

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
  try {
    const { id: sessionId } = await context.params
    const supabase = supabaseServer()

    const body = await request.json()
    const { questionId, answer, userId } = body

    if (!questionId || answer === undefined) {
      return NextResponse.json(
        { error: 'Fråge-ID och svar krävs' },
        { status: 400 }
      )
    }

    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = userId ? `user:${userId}` : `ip:${clientIp}`
    
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Du svarar för snabbt. Vänta ett ögonblick.' },
        { status: 429 }
      )
    }

    // Get session and verify it's active and accepting responses
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        quizzes(questions)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte' },
        { status: 404 }
      )
    }

    if (session.status !== 'live') {
      return NextResponse.json(
        { error: 'Sessionen är inte aktiv' },
        { status: 400 }
      )
    }

    if (!session.allow_responses) {
      return NextResponse.json(
        { error: 'Svar är för närvarande låsta' },
        { status: 400 }
      )
    }

    // For sync sessions, verify the question is the current active question
    if (session.mode === 'sync') {
      const questions = session.quizzes?.questions || []
      const currentQuestion = questions[session.current_index]
      
      if (!currentQuestion || currentQuestion.id !== questionId) {
        return NextResponse.json(
          { error: 'Detta är inte den aktiva frågan' },
          { status: 400 }
        )
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
        return NextResponse.json(
          { error: 'Du är inte registrerad som deltagare i denna session' },
          { status: 403 }
        )
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
      return NextResponse.json(
        { error: 'Du har redan svarat på denna fråga' },
        { status: 400 }
      )
    }

    // Determine if answer is correct (for auto-grading)
    const questions = session.quizzes?.questions || []
    const question = questions.find((q: any) => q.id === questionId)
    let isCorrect = false

    if (question) {
      if (question.type === 'multiple-choice') {
        const selectedOptions = Array.isArray(answer) ? answer : [answer]
        const correctOptions = question.options?.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id) || []
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
      return NextResponse.json(
        { error: 'Kunde inte spara svar' },
        { status: 500 }
      )
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

    return NextResponse.json({
      success: true,
      answer: {
        id: sessionAnswer.id,
        isCorrect,
        submittedAt: sessionAnswer.submitted_at
      }
    })

  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}