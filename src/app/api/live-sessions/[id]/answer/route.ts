import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

/**
 * POST /api/live-sessions/[id]/answer
 * Submit student answer for live quiz question
 * Body: { questionId: string, answer: string, userId: string }
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

    if (!questionId || answer === undefined || !userId) {
      return NextResponse.json(
        { error: 'Fråge-ID, svar och användar-ID krävs' },
        { status: 400 }
      )
    }

    // Verify session is active
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, status, current_index')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte' },
        { status: 404 }
      )
    }

    if (session.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Sessionen är inte aktiv för svar' },
        { status: 400 }
      )
    }

    // Verify user is participant
    const { data: participant, error: participantError } = await supabase
      .from('quiz_session_participants')
      .select('user_id, role')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Du är inte deltagare i denna session' },
        { status: 403 }
      )
    }

    if (participant.role !== 'student') {
      return NextResponse.json(
        { error: 'Endast elever kan skicka svar' },
        { status: 403 }
      )
    }

    // Check if answer already exists (prevent duplicate answers)
    const { data: existingAnswer } = await supabase
      .from('quiz_answers')
      .select('session_id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .eq('user_id', userId)
      .single()

    if (existingAnswer) {
      return NextResponse.json(
        { error: 'Du har redan svarat på denna fråga' },
        { status: 400 }
      )
    }

    // Submit the answer
    const { data: submittedAnswer, error: answerError } = await supabase
      .from('quiz_answers')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        user_id: userId,
        answer: String(answer)
      })
      .select()
      .single()

    if (answerError) {
      console.error('Error submitting answer:', answerError)
      return NextResponse.json(
        { error: 'Kunde inte skicka svaret' },
        { status: 500 }
      )
    }

    // Get total participants and answered count for this question
    const { count: totalParticipants } = await supabase
      .from('quiz_session_participants')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('role', 'student')

    const { count: answeredCount } = await supabase
      .from('quiz_answers')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('question_id', questionId)

    // Broadcast answer progress to teacher
    const channel = supabase.channel(`live:session:${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'answer:submitted',
      payload: {
        sessionId,
        questionId,
        totalParticipants: totalParticipants || 0,
        answeredCount: answeredCount || 0,
        userId,
        answeredAt: submittedAnswer.submitted_at
      }
    })

    return NextResponse.json({
      success: true,
      answer: {
        id: submittedAnswer.session_id,
        questionId: submittedAnswer.question_id,
        answer: submittedAnswer.answer,
        isCorrect: submittedAnswer.is_correct,
        submittedAt: submittedAnswer.submitted_at
      },
      progress: {
        totalParticipants: totalParticipants || 0,
        answeredCount: answeredCount || 0
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