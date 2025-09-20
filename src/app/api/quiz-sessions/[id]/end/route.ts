import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * POST /api/quiz-sessions/:id/end
 * End a quiz session
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

    if (session.status === 'ended') {
      return NextResponse.json(
        { error: 'Sessionen är redan avslutad' },
        { status: 400 }
      )
    }

    // Update session to ended state
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'ended',
        state: 'ended',
        ended_at: new Date().toISOString(),
        allow_responses: false,
        updated_at: new Date().toISOString()
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

    // Log session event
    await supabase
      .from('session_events')
      .insert({
        session_id: sessionId,
        type: 'end',
        payload: { ended_at: updatedSession.ended_at },
        created_by: user.id
      })

    // Get final summary for response
    const { data: participantCount } = await supabase
      .from('session_participants')
      .select('id', { count: 'exact' })
      .eq('session_id', sessionId)

    const { data: responseCount } = await supabase
      .from('session_answers')
      .select('id', { count: 'exact' })
      .eq('session_id', sessionId)

    // Publish realtime event to notify all participants
    const channel = supabase.channel(`session:${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'session_ended',
      payload: {
        endedAt: updatedSession.ended_at,
        message: 'Sessionen har avslutats av läraren'
      }
    })

    // Trigger final aggregate refresh
    await supabase.rpc('refresh_session_aggregates', { p_session_id: sessionId })

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        endedAt: updatedSession.ended_at,
        summary: {
          totalParticipants: participantCount?.count || 0,
          totalResponses: responseCount?.count || 0
        }
      }
    })

  } catch (error) {
    console.error('Error ending session:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}