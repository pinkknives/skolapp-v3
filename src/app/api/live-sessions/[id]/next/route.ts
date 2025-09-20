import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * POST /api/live-sessions/[id]/next
 * Advance to next question in live quiz session
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireTeacher()
    const { id: sessionId } = await context.params
    const supabase = supabaseServer()

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, status, created_by, org_id, current_index, settings, quiz_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte' },
        { status: 404 }
      )
    }

    // Get quiz details separately
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, questions')
      .eq('id', session.quiz_id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz hittades inte' },
        { status: 404 }
      )
    }

    // Check permission
    const hasPermission = session.created_by === user.id

    if (!hasPermission) {
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', session.org_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!orgMember || !['owner', 'admin'].includes(orgMember.role)) {
        return NextResponse.json(
          { error: 'Du har inte behörighet att styra denna session' },
          { status: 403 }
        )
      }
    }

    // Check if session is active
    if (session.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Session måste vara aktiv för att gå vidare' },
        { status: 400 }
      )
    }

    const questions = quiz.questions || []
    const nextIndex = session.current_index + 1

    // Check if we've reached the end
    if (nextIndex >= questions.length) {
      // End the session
      const { data: updatedSession, error: updateError } = await supabase
        .from('quiz_sessions')
        .update({
          status: 'ENDED',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (updateError) {
        console.error('Error ending session:', updateError)
        return NextResponse.json(
          { error: 'Kunde inte avsluta sessionen' },
          { status: 500 }
        )
      }

      // Broadcast session end
      const channel = supabase.channel(`live:session:${sessionId}`)
      await channel.send({
        type: 'broadcast',
        event: 'session:end',
        payload: {
          sessionId,
          status: 'ENDED',
          endedAt: updatedSession.ended_at
        }
      })

      return NextResponse.json({
        success: true,
        session: {
          id: updatedSession.id,
          status: updatedSession.status,
          currentIndex: updatedSession.current_index,
          endedAt: updatedSession.ended_at
        },
        finished: true
      })
    }

    // Advance to next question
    const { data: updatedSession, error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        current_index: nextIndex
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error advancing question:', updateError)
      return NextResponse.json(
        { error: 'Kunde inte gå till nästa fråga' },
        { status: 500 }
      )
    }

    const currentQuestion = questions[nextIndex]

    // Broadcast new question to all participants
    const channel = supabase.channel(`live:session:${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'question:show',
      payload: {
        sessionId,
        questionIndex: nextIndex,
        questionId: currentQuestion?.id,
        timeLimit: session.settings?.timePerQuestion || 30,
        startedAt: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        currentIndex: updatedSession.current_index
      },
      question: {
        index: nextIndex,
        id: currentQuestion?.id,
        title: currentQuestion?.title,
        type: currentQuestion?.type,
        timeLimit: session.settings?.timePerQuestion || 30
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