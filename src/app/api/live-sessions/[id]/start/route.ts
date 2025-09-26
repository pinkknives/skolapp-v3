import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'
import { sendPushToAll } from '@/lib/push'

/**
 * POST /api/live-sessions/[id]/start
 * Start a live quiz session
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireTeacher()
    const { id: sessionId } = await context.params
    const supabase = supabaseServer()

    // Verify session exists and user has permission
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, status, created_by, org_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte' },
        { status: 404 }
      )
    }

    // Check permission
    const hasPermission = session.created_by === user.id

    if (!hasPermission) {
      // Check org membership for permission
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', session.org_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!orgMember || !['owner', 'admin'].includes(orgMember.role)) {
        return NextResponse.json(
          { error: 'Du har inte behörighet att starta denna session' },
          { status: 403 }
        )
      }
    }

    // Check if session is in correct state to start
    if (session.status !== 'LOBBY') {
      return NextResponse.json(
        { error: 'Session kan endast startas från lobby-läge' },
        { status: 400 }
      )
    }

    // Update session to ACTIVE status
    const { data: updatedSession, error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        status: 'ACTIVE',
        started_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error starting session:', updateError)
      return NextResponse.json(
        { error: 'Kunde inte starta sessionen' },
        { status: 500 }
      )
    }

    // Broadcast session start to all participants
    const channel = supabase.channel(`live:session:${sessionId}`)
    await channel.send({
      type: 'broadcast',
      event: 'session:start',
      payload: {
        sessionId,
        status: 'ACTIVE',
        currentIndex: updatedSession.current_index,
        startedAt: updatedSession.started_at
      }
    })

    // Fire push notification (guarded by env)
    await sendPushToAll({
      headings: 'Quiz startar',
      contents: 'Din lärare har startat ett live‑quiz – gå med nu!',
      url: `${request.nextUrl.origin}/live/join`
    })

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        currentIndex: updatedSession.current_index,
        startedAt: updatedSession.started_at
      }
    })

  } catch (error) {
    console.error('Error starting live quiz session:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}