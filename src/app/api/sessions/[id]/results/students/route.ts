import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * GET /api/sessions/:id/results/students
 * Get per-student results data for a session
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
      .select('id, teacher_id, mode, due_at, reveal_policy')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
    }

    // Try to use materialized view first, fallback to direct queries
    const { data: studentResults, error: viewError } = await supabase
      .from('session_user_best')
      .select('*')
      .eq('session_id', sessionId)
      .order('best_score', { ascending: false })

    if (!viewError && studentResults) {
      return NextResponse.json({
        success: true,
        data: studentResults.map(result => ({
          sessionId: result.session_id,
          userId: result.user_id,
          displayName: result.display_name || 'Okänd elev',
          studentId: result.student_id,
          bestScore: result.best_score || 0,
          questionsAttempted: result.questions_attempted || 0,
          lastActivityAt: result.last_activity_at,
          totalAttempts: result.total_attempts || 0,
          avgTimePerQuestion: result.avg_time_per_question || null,
          status: result.status || 'not_started'
        }))
      })
    }

    // Fallback to direct queries if materialized view doesn't exist
    console.warn('Materialized view session_user_best not available, using fallback queries')

    // Get all participants for this session
    const { data: participants, error: participantsError } = await supabase
      .from('session_participants')
      .select('session_id, student_id, display_name')
      .eq('session_id', sessionId)

    if (participantsError) {
      return NextResponse.json(
        { error: 'Ett fel uppstod vid hämtning av deltagare' },
        { status: 500 }
      )
    }

    // Get progress data
    const { data: progressData, error: progressError } = await supabase
      .from('session_progress')
      .select('session_id, user_id, status, started_at, submitted_at, current_attempt')
      .eq('session_id', sessionId)

    if (progressError) {
      console.error('Error fetching progress:', progressError)
    }

    // Get attempt items for scoring
    const { data: attemptItems, error: itemsError } = await supabase
      .from('attempt_items')
      .select('session_id, user_id, score, answered_at, time_spent_seconds, attempt_no')
      .eq('session_id', sessionId)

    if (itemsError) {
      console.error('Error fetching attempt items:', itemsError)
    }

    // Combine data
    const studentResultsMap = new Map()

    // Initialize with participants
    participants?.forEach(participant => {
      const userId = participant.student_id
      if (userId) {
        studentResultsMap.set(userId, {
          sessionId,
          userId,
          displayName: participant.display_name || 'Okänd elev',
          studentId: participant.student_id,
          bestScore: 0,
          questionsAttempted: 0,
          lastActivityAt: null,
          totalAttempts: 0,
          avgTimePerQuestion: null,
          status: 'not_started'
        })
      }
    })

    // Add progress status
    progressData?.forEach(progress => {
      const existing = studentResultsMap.get(progress.user_id)
      if (existing) {
        existing.status = progress.status
        existing.lastActivityAt = progress.submitted_at || progress.started_at
        existing.totalAttempts = progress.current_attempt || 0
      }
    })

    // Calculate scores from attempt items
    const scoresByUser = new Map()
    const timesByUser = new Map()
    
    attemptItems?.forEach(item => {
      if (!scoresByUser.has(item.user_id)) {
        scoresByUser.set(item.user_id, [])
        timesByUser.set(item.user_id, [])
      }
      scoresByUser.get(item.user_id).push(item.score || 0)
      if (item.time_spent_seconds) {
        timesByUser.get(item.user_id).push(item.time_spent_seconds)
      }
      
      // Update last activity
      const existing = studentResultsMap.get(item.user_id)
      if (existing) {
        existing.questionsAttempted = scoresByUser.get(item.user_id).length
        if (!existing.lastActivityAt || new Date(item.answered_at) > new Date(existing.lastActivityAt)) {
          existing.lastActivityAt = item.answered_at
        }
      }
    })

    // Calculate totals
    scoresByUser.forEach((scores, userId) => {
      const existing = studentResultsMap.get(userId)
      if (existing) {
        existing.bestScore = scores.reduce((sum, score) => sum + score, 0)
        const times = timesByUser.get(userId) || []
        existing.avgTimePerQuestion = times.length > 0 
          ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length)
          : null
      }
    })

    const results = Array.from(studentResultsMap.values())
      .sort((a, b) => b.bestScore - a.bestScore)

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Students results error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av elevresultat' },
      { status: 500 }
    )
  }
}