import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * GET /api/sessions/:id/results/overview
 * Get aggregated overview data for a session's results
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessions-ID krävs' },
        { status: 400 }
      )
    }

    // Verify teacher authentication and session ownership
    const user = await requireTeacher()
    const supabase = supabaseServer()

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, teacher_id, mode, due_at, reveal_policy, max_attempts')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
    }

    // Get basic session statistics
    const { data: stats, error: statsError } = await supabase.rpc('get_session_overview_stats', {
      p_session_id: sessionId
    })

    if (statsError) {
      console.error('Error getting session stats:', statsError)
      // Fallback to direct queries if RPC doesn't exist yet
      const queries = await Promise.all([
        // Total participants
        supabase
          .from('session_participants')
          .select('id', { count: 'exact' })
          .eq('session_id', sessionId),

        // Submitted attempts
        supabase
          .from('session_progress')
          .select('id', { count: 'exact' })
          .eq('session_id', sessionId)
          .in('status', ['submitted', 'late']),

        // Average score from attempt_items
        supabase
          .from('attempt_items')
          .select('score')
          .eq('session_id', sessionId),

        // Participation rate (users with at least one attempt)
        supabase
          .from('attempt_items')
          .select('user_id')
          .eq('session_id', sessionId)
          .then(result => {
            if (result.error) return { data: [], error: result.error }
            const uniqueUsers = new Set(result.data?.map(item => item.user_id) || [])
            return { data: Array.from(uniqueUsers), error: null }
          })
      ])

      const [participantsResult, submittedResult, scoresResult, activeUsersResult] = queries

      if (participantsResult.error || submittedResult.error || scoresResult.error) {
        return NextResponse.json(
          { error: 'Ett fel uppstod vid hämtning av statistik' },
          { status: 500 }
        )
      }

      const totalParticipants = participantsResult.count || 0
      const submittedCount = submittedResult.count || 0
      const scores = scoresResult.data || []
      const activeUsers = activeUsersResult.data || []

      const avgScore = scores.length > 0 
        ? scores.reduce((sum, item) => sum + (item.score || 0), 0) / scores.length 
        : 0

      const participationRate = totalParticipants > 0 
        ? (activeUsers.length / totalParticipants) * 100 
        : 0

      const completionRate = totalParticipants > 0 
        ? (submittedCount / totalParticipants) * 100 
        : 0

      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          totalParticipants,
          submittedCount,
          avgScore: Math.round(avgScore * 100) / 100,
          participationRate: Math.round(participationRate * 10) / 10,
          completionRate: Math.round(completionRate * 10) / 10,
          mode: session.mode,
          dueAt: session.due_at,
          revealPolicy: session.reveal_policy,
          maxAttempts: session.max_attempts,
          isPastDeadline: session.due_at ? new Date() > new Date(session.due_at) : false
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        ...stats,
        mode: session.mode,
        dueAt: session.due_at,
        revealPolicy: session.reveal_policy,
        maxAttempts: session.max_attempts,
        isPastDeadline: session.due_at ? new Date() > new Date(session.due_at) : false
      }
    })

  } catch (error) {
    console.error('Session overview error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av sessionsöversikt' },
      { status: 500 }
    )
  }
}