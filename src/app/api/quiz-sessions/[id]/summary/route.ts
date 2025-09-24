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
        quizzes!inner(id, title, questions),
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

    // Get detailed answer counts per question
    const { data: answerCounts } = await supabase
      .from('session_answers')
      .select('question_id, is_correct, answer')
      .eq('session_id', sessionId)

    // Process question-level statistics
    const quiz = Array.isArray(session.quizzes) ? session.quizzes[0] : session.quizzes
    const classData = Array.isArray(session.classes) ? session.classes[0] : session.classes
    const questions = quiz?.questions || []
    const questionStats = questions.map((question: { id: string; title: string; type: string; options?: Array<{ id: string; text: string; isCorrect: boolean }> }, index: number) => {
      const questionAnswers = answerCounts?.filter(a => a.question_id === question.id) || []
      const correctCount = questionAnswers.filter(a => a.is_correct).length
      const totalCount = questionAnswers.length
      
      // For multiple choice, get option distribution
      const optionDistribution: Record<string, number> = {}
      if (question.type === 'multiple-choice') {
        question.options?.forEach((option: { id: string }) => {
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
          id: quiz?.id,
          title: quiz?.title,
          totalQuestions: questions.length
        },
        class: classData ? {
          id: classData.id,
          name: classData.name
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