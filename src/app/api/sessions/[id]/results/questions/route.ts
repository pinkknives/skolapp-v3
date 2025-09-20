import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * GET /api/sessions/:id/results/questions
 * Get per-question analysis for a session
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params
    const url = new URL(request.url)
    const sortBy = url.searchParams.get('sortBy') || 'question_index'
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'

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
      .select('id, teacher_id, mode, due_at, reveal_policy, quiz_id')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
    }

    // Get quiz questions for reference
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        id, 
        title,
        questions(id, title, type, points)
      `)
      .eq('id', session.quiz_id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz hittades inte' },
        { status: 404 }
      )
    }

    // Try to use materialized view first
    const { data: questionStats, error: viewError } = await supabase
      .from('session_question_stats')
      .select('*')
      .eq('session_id', sessionId)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    if (!viewError && questionStats) {
      // Enrich with quiz question data
      const enrichedStats = questionStats.map(stat => {
        const question = quiz.questions?.[stat.question_index]
        return {
          sessionId: stat.session_id,
          questionId: stat.question_id,
          questionIndex: stat.question_index,
          questionTitle: question?.title || `Fråga ${stat.question_index + 1}`,
          questionType: question?.type || 'unknown',
          questionPoints: question?.points || 1,
          totalAttempts: stat.total_attempts || 0,
          correctCount: stat.correct_count || 0,
          correctRate: stat.correct_rate || 0,
          avgScore: stat.avg_score || 0,
          avgTimeSeconds: stat.avg_time_seconds || null
        }
      })

      return NextResponse.json({
        success: true,
        data: enrichedStats
      })
    }

    // Fallback to direct queries
    console.warn('Materialized view session_question_stats not available, using fallback queries')

    // Get attempt items for this session
    const { data: attemptItems, error: itemsError } = await supabase
      .from('attempt_items')
      .select('question_id, question_index, is_correct, score, time_spent_seconds')
      .eq('session_id', sessionId)

    if (itemsError) {
      return NextResponse.json(
        { error: 'Ett fel uppstod vid hämtning av frågedata' },
        { status: 500 }
      )
    }

    // Calculate statistics per question
    const questionStatsMap = new Map()

    attemptItems?.forEach(item => {
      const key = `${item.question_id}_${item.question_index}`
      if (!questionStatsMap.has(key)) {
        questionStatsMap.set(key, {
          questionId: item.question_id,
          questionIndex: item.question_index,
          attempts: [],
          scores: [],
          times: []
        })
      }

      const stats = questionStatsMap.get(key)
      stats.attempts.push(item)
      stats.scores.push(item.score || 0)
      if (item.time_spent_seconds) {
        stats.times.push(item.time_spent_seconds)
      }
    })

    // Calculate final statistics
    const results = Array.from(questionStatsMap.values()).map(stats => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const question = (quiz.questions as any[])?.[stats.questionIndex as number]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const correctCount = (stats.attempts as any[]).filter((attempt: any) => attempt.is_correct).length
      const totalAttempts = (stats.attempts as unknown[]).length
      const correctRate = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const avgScore = (stats.scores as any[]).length > 0 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (stats.scores as any[]).reduce((sum: number, score: number) => sum + score, 0) / (stats.scores as any[]).length 
        : 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const avgTime = (stats.times as any[]).length > 0 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (stats.times as any[]).reduce((sum: number, time: number) => sum + time, 0) / (stats.times as any[]).length 
        : null

      return {
        sessionId,
        questionId: stats.questionId,
        questionIndex: stats.questionIndex,
        questionTitle: question?.title || `Fråga ${stats.questionIndex + 1}`,
        questionType: question?.type || 'unknown',
        questionPoints: question?.points || 1,
        totalAttempts,
        correctCount,
        correctRate: Math.round(correctRate * 10) / 10,
        avgScore: Math.round(avgScore * 100) / 100,
        avgTimeSeconds: avgTime ? Math.round(avgTime) : null
      }
    })

    // Sort results
    results.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue || '')
      const bStr = String(bValue || '')
      return sortOrder === 'asc' 
        ? aStr.localeCompare(bStr, 'sv-SE')
        : bStr.localeCompare(aStr, 'sv-SE')
    })

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Questions results error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av frågeanalys' },
      { status: 500 }
    )
  }
}