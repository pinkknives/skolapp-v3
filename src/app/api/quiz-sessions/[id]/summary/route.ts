import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * GET /api/quiz-sessions/:id/summary
 * Get aggregated session data for teacher dashboard
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params

    // Verify teacher authentication
    const user = await requireTeacher()
    const supabase = supabaseServer()

    // Get session and verify ownership/access
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        quizzes(id, title, questions),
        classes(id, name)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte' },
        { status: 404 }
      )
    }

    // Verify teacher has access
    const hasAccess = session.teacher_id === user.id

    if (!hasAccess && session.org_id) {
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', session.org_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!orgMember) {
        return NextResponse.json(
          { error: 'Du har inte behörighet att visa denna session' },
          { status: 403 }
        )
      }
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true })

    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
    }

    // Get aggregated answer data
    const { data: aggregates, error: aggregatesError } = await supabase
      .from('session_aggregates')
      .select('*')
      .eq('session_id', sessionId)

    if (aggregatesError) {
      console.error('Error fetching aggregates:', aggregatesError)
    }

    // Get detailed answer counts per question
    const { data: answerCounts, error: answersError } = await supabase
      .from('session_answers')
      .select('question_id, is_correct, answer')
      .eq('session_id', sessionId)

    if (answersError) {
      console.error('Error fetching answer counts:', answersError)
    }

    // Process question-level statistics
    const questions = session.quizzes?.questions || []
    const questionStats = questions.map((question: any, index: number) => {
      const questionAnswers = answerCounts?.filter(a => a.question_id === question.id) || []
      const correctCount = questionAnswers.filter(a => a.is_correct).length
      const totalCount = questionAnswers.length
      
      // For multiple choice, get option distribution
      let optionDistribution: Record<string, number> = {}
      if (question.type === 'multiple-choice') {
        question.options?.forEach((option: any) => {
          optionDistribution[option.id] = 0
        })
        
        questionAnswers.forEach(answer => {
          const selectedOptions = answer.answer?.selectedOptions || []
          selectedOptions.forEach((optionId: string) => {
            if (optionDistribution[optionId] !== undefined) {
              optionDistribution[optionId]++
            }
          })
        })
      }

      return {
        questionId: question.id,
        questionIndex: index,
        title: question.title,
        type: question.type,
        totalResponses: totalCount,
        correctResponses: correctCount,
        correctRate: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
        optionDistribution: question.type === 'multiple-choice' ? optionDistribution : null
      }
    })

    // Calculate overall session statistics
    const totalParticipants = participants?.length || 0
    const totalAnswers = answerCounts?.length || 0
    const totalCorrect = answerCounts?.filter(a => a.is_correct).length || 0
    const overallCorrectRate = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        mode: session.mode,
        currentIndex: session.current_index,
        allowResponses: session.allow_responses,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        quiz: {
          id: session.quizzes?.id,
          title: session.quizzes?.title,
          totalQuestions: questions.length
        },
        class: session.classes ? {
          id: session.classes.id,
          name: session.classes.name
        } : null
      },
      participants: participants?.map(p => ({
        id: p.id,
        displayName: p.display_name,
        joinedAt: p.joined_at,
        status: p.status,
        lastSeen: p.last_seen
      })) || [],
      statistics: {
        totalParticipants,
        totalAnswers,
        totalCorrect,
        overallCorrectRate,
        questionsStats: questionStats
      },
      currentQuestion: session.mode === 'sync' && session.current_index !== null 
        ? questions[session.current_index] 
        : null
    })

  } catch (error) {
    console.error('Error fetching session summary:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}