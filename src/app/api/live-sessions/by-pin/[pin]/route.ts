import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

/**
 * GET /api/live-sessions/by-pin/[pin]
 * Lookup a live quiz session by PIN
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pin: string }> }
) {
  try {
    const { pin } = await context.params
    const supabase = supabaseServer()

    if (!pin || pin.length !== 6) {
      return NextResponse.json(
        { error: 'Ogiltig PIN-format' },
        { status: 400 }
      )
    }

    // Find session by PIN
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, pin, status, org_id, class_id, quiz_id, current_index')
      .eq('pin', pin.toUpperCase())
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Ingen session hittades med denna PIN' },
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

    // Check if session is still joinable
    if (session.status === 'ENDED') {
      return NextResponse.json(
        { error: 'Denna session har avslutats' },
        { status: 400 }
      )
    }

    // Get participant count
    const { count: participantCount } = await supabase
      .from('quiz_session_participants')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)
      .eq('role', 'student')

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        pin: session.pin,
        status: session.status,
        currentIndex: session.current_index,
        quizTitle: quiz.title || 'Quiz',
        totalQuestions: quiz.questions?.length || 0,
        participantCount: participantCount || 0
      }
    })

  } catch (error) {
    console.error('Error looking up session by PIN:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}