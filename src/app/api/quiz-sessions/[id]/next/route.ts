import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * POST /api/quiz-sessions/:id/next
 * Advance to the next question in a sync session
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params

    // Verify teacher authentication
    const user = await requireTeacher()
    const supabase = supabaseServer()

    // Get session and verify ownership
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        quizzes!inner(questions)
      `)
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
    }

    if (session.mode !== 'sync') {
      return NextResponse.json(
        { error: 'Nästa fråga är endast tillgängligt för synkroniserade sessioner' },
        { status: 400 }
      )
    }

    if (session.status !== 'live') {
      return NextResponse.json(
        { error: 'Sessionen måste vara aktiv för att gå till nästa fråga' },
        { status: 400 }
      )
    }

    const questions = Array.isArray(session.quizzes) ? session.quizzes[0]?.questions : session.quizzes?.questions
    const currentIndex = session.current_index || 0
    const nextIndex = currentIndex + 1

    if (nextIndex >= questions.length) {
      return NextResponse.json(
        { error: 'Inga fler frågor kvar' },
        { status: 400 }
      )
    }

    // Update session to next question
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        current_index: nextIndex,
        allow_responses: true, // Auto-unlock responses for new question
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating session:', updateError)
      return NextResponse.json(
        { error: 'Kunde inte gå till nästa fråga' },
        { status: 500 }
      )
    }

    // Log session event
    await supabase
      .from('session_events')
      .insert({
        session_id: sessionId,
        type: 'next',
        payload: { 
          previous_index: currentIndex,
          new_index: nextIndex,
          question_title: questions[nextIndex]?.title || `Fråga ${nextIndex + 1}`
        },
        created_by: user.id
      })

    // Publish realtime event
    const channel = supabase.channel(`session:${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'active_question_changed',
      payload: {
        questionIndex: nextIndex,
        question: questions[nextIndex],
        allowResponses: true
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        currentIndex: nextIndex,
        allowResponses: true,
        totalQuestions: questions.length
      }
    })

  } catch (error) {
    console.error('Error advancing to next question:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}