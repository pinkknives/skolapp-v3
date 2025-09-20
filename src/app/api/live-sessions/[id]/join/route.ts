import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

/**
 * POST /api/live-sessions/[id]/join
 * Join a live quiz session
 * Body: { displayName: string, userId?: string }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params
    const supabase = supabaseServer()

    const body = await request.json()
    const { displayName, userId } = body

    if (!displayName) {
      return NextResponse.json(
        { error: 'Visningsnamn krävs' },
        { status: 400 }
      )
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, pin, status, org_id, class_id, quiz_id, current_index')
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

    // Check if session is still joinable
    if (session.status === 'ENDED') {
      return NextResponse.json(
        { error: 'Denna session har avslutats' },
        { status: 400 }
      )
    }

    // If userId is provided, verify user exists and add as authenticated participant
    if (userId) {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        return NextResponse.json(
          { error: 'Användare hittades inte' },
          { status: 404 }
        )
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('quiz_session_participants')
        .select('user_id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single()

      if (existingParticipant) {
        return NextResponse.json(
          { error: 'Du har redan gått med i denna session' },
          { status: 400 }
        )
      }

      // Add as participant
      const { error: participantError } = await supabase
        .from('quiz_session_participants')
        .insert({
          session_id: sessionId,
          user_id: userId,
          display_name: displayName,
          role: 'student'
        })

      if (participantError) {
        console.error('Error adding participant:', participantError)
        return NextResponse.json(
          { error: 'Kunde inte gå med i sessionen' },
          { status: 500 }
        )
      }
    } else {
      // For now, require authentication (guest mode can be added later)
      return NextResponse.json(
        { error: 'Autentisering krävs för att gå med i sessionen' },
        { status: 401 }
      )
    }

    // Get current participant count
    const { count: participantCount } = await supabase
      .from('quiz_session_participants')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('role', 'student')

    // Broadcast join event to other participants
    const channel = supabase.channel(`live:session:${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'participant_joined',
      payload: {
        sessionId,
        displayName,
        participantCount: participantCount || 0
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        pin: session.pin,
        status: session.status,
        currentIndex: session.current_index,
        quizTitle: quiz.title,
        totalQuestions: quiz.questions?.length || 0
      },
      participant: {
        displayName,
        role: 'student',
        joinedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error joining live quiz session:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}