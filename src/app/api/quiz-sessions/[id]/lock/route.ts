import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * POST /api/quiz-sessions/:id/lock
 * Lock or unlock responses for a session
 * Body: { allow: boolean }
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

    const body = await request.json()
    const { allow } = body

    if (typeof allow !== 'boolean') {
      return NextResponse.json(
        { error: 'allow måste vara true eller false' },
        { status: 400 }
      )
    }

    // Get session and verify ownership
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
    }

    if (session.status !== 'live') {
      return NextResponse.json(
        { error: 'Sessionen måste vara aktiv för att låsa/låsa upp svar' },
        { status: 400 }
      )
    }

    // Update session response state
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        allow_responses: allow,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating session response state:', updateError)
      return NextResponse.json(
        { error: 'Kunde inte uppdatera svarsstatus' },
        { status: 500 }
      )
    }

    // Log session event
    await supabase
      .from('session_events')
      .insert({
        session_id: sessionId,
        type: allow ? 'unlock' : 'lock',
        payload: { allow_responses: allow },
        created_by: user.id
      })

    // Publish realtime event
    const channel = supabase.channel(`session:${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'locked_state_changed',
      payload: {
        allowResponses: allow,
        message: allow ? 'Svar är nu öppna' : 'Svar är nu låsta'
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        allowResponses: allow
      }
    })

  } catch (error) {
    console.error('Error updating session lock state:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}