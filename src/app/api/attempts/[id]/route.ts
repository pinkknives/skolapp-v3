import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * GET /api/attempts/:attemptId
 * Get detailed attempt review data
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await context.params

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Försök-ID krävs' },
        { status: 400 }
      )
    }

    // For now, we'll interpret attemptId as a combination of sessionId and userId
    // since our attempt_items table doesn't have a single attempt ID
    // Expected format: "sessionId:userId" or "sessionId:userId:attemptNo"
    const parts = attemptId.split(':')
    if (parts.length < 2) {
      return NextResponse.json(
        { error: 'Ogiltigt försök-ID format' },
        { status: 400 }
      )
    }

    const sessionId = parts[0]
    const userId = parts[1] 
    const attemptNo = parts[2] ? parseInt(parts[2], 10) : null

    // Verify teacher authentication and session ownership
    const user = await requireTeacher()
    const supabase = supabaseServer()

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id, 
        teacher_id, 
        mode, 
        due_at, 
        reveal_policy, 
        quiz_id
      `)
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
    }

    // Get quiz with questions separately for better typing
    const { data: quiz, error: _quizError } = await supabase
      .from('quizzes')
      .select(`
        id, 
        title, 
        questions(id, title, type, points, options)
      `)
      .eq('id', session.quiz_id)
      .single()

    if (_quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz hittades inte' },
        { status: 404 }
      )
    }

    // Check reveal policy - teachers can always see, but this affects what students see
    const canRevealAnswers = 
      session.reveal_policy === 'immediate' ||
      (session.reveal_policy === 'after_deadline' && session.due_at && new Date() > new Date(session.due_at))

    // Get participant info
    const { data: participant, error: participantError } = await supabase
      .from('session_participants')
      .select('session_id, student_id, display_name')
      .eq('session_id', sessionId)
      .eq('student_id', userId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Deltagare hittades inte' },
        { status: 404 }
      )
    }

    // Get attempt items for this user
    let query = supabase
      .from('attempt_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('question_index')
      .order('attempt_no')

    if (attemptNo !== null) {
      query = query.eq('attempt_no', attemptNo)
    }

    const { data: attemptItems, error: itemsError } = await query

    if (itemsError) {
      return NextResponse.json(
        { error: 'Ett fel uppstod vid hämtning av försöksdata' },
        { status: 500 }
      )
    }

    // Get progress info
    const { data: progress, error: progressError } = await supabase
      .from('session_progress')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single()

    if (progressError) {
      console.error('Error fetching progress:', progressError)
    }

    // Process attempt data by question
    const questionAttempts = new Map()

    attemptItems?.forEach(item => {
      if (!questionAttempts.has(item.question_index)) {
        questionAttempts.set(item.question_index, [])
      }
      questionAttempts.get(item.question_index).push(item)
    })

    // Build detailed response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = quiz ? (quiz.questions as any[]).map((question: any, index: number) => {
      const attempts = questionAttempts.get(index) || []
      const latestAttempt = attempts[attempts.length - 1] // Most recent attempt

      let studentAnswer = null
      let isCorrect = false
      let score = 0
      let timeSpent = null
      let answeredAt = null

      if (latestAttempt) {
        studentAnswer = latestAttempt.answer
        isCorrect = latestAttempt.is_correct || false
        score = latestAttempt.score || 0
        timeSpent = latestAttempt.time_spent_seconds
        answeredAt = latestAttempt.answered_at
      }

      // Format answer for display
      let formattedAnswer = ''
      if (studentAnswer) {
        if (question.type === 'multiple-choice' && Array.isArray(studentAnswer)) {
          // Map option IDs to option text
          const selectedOptions = studentAnswer.map((optionId: string) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const option = question.options?.find((opt: any) => opt.id === optionId)
            return option ? option.text : optionId
          })
          formattedAnswer = selectedOptions.join(', ')
        } else if (typeof studentAnswer === 'object') {
          formattedAnswer = JSON.stringify(studentAnswer)
        } else {
          formattedAnswer = String(studentAnswer)
        }
      }

      // Get correct answer (for teachers or when reveal policy allows)
      let correctAnswer = null
      if (canRevealAnswers && question.type === 'multiple-choice') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const correctOptions = question.options?.filter((opt: any) => opt.isCorrect) || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        correctAnswer = correctOptions.map((opt: any) => opt.text).join(', ')
      }

      return {
        questionIndex: index,
        questionId: question.id,
        questionTitle: question.title,
        questionType: question.type,
        questionPoints: question.points,
        studentAnswer: formattedAnswer,
        isCorrect,
        score,
        timeSpentSeconds: timeSpent,
        answeredAt,
        attempts: attempts.length,
        correctAnswer: canRevealAnswers ? correctAnswer : null,
        options: question.options || null
      }
    }) : []

    // Calculate totals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalScore = questions.reduce((sum: number, q: any) => sum + q.score, 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maxPossibleScore = quiz ? (quiz.questions as any[]).reduce((sum: number, q: any) => sum + q.points, 0) : 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalTimeSpent = questions.reduce((sum: number, q: any) => sum + (q.timeSpentSeconds || 0), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionsAnswered = questions.filter((q: any) => q.studentAnswer).length

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        userId,
        participantName: participant.display_name,
        quizTitle: quiz?.title || 'Okänd quiz',
        totalScore,
        maxPossibleScore,
        percentage: maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0,
        questionsAnswered,
        totalQuestions: quiz ? (quiz.questions as any[]).length : 0, // eslint-disable-line @typescript-eslint/no-explicit-any
        totalTimeSpent,
        status: progress?.status || 'not_started',
        startedAt: progress?.started_at,
        submittedAt: progress?.submitted_at,
        attemptNo: attemptNo,
        canRevealAnswers,
        questions
      }
    })

  } catch (error) {
    console.error('Attempt detail error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av försöksdetaljer' },
      { status: 500 }
    )
  }
}