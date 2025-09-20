import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * POST /api/sessions/:id/ai-insight
 * Generate AI insights for session results (behind feature flag)
 */
export async function POST(
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

    // Check feature flag
    if (process.env.AI_ANALYTICS_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'AI-analys är inte aktiverat' },
        { status: 403 }
      )
    }

    // Verify teacher authentication and session ownership
    const user = await requireTeacher()
    const supabase = supabaseServer()

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, teacher_id, quiz_id')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
    }

    // Get session analytics data for AI analysis
    const baseUrl = request.url.substring(0, request.url.lastIndexOf('/ai-insight'))
    const [questionsRes, studentsRes] = await Promise.all([
      fetch(`${baseUrl}/results/questions`, {
        headers: { 'Authorization': request.headers.get('Authorization') || '' }
      }),
      fetch(`${baseUrl}/results/students`, {
        headers: { 'Authorization': request.headers.get('Authorization') || '' }
      })
    ])

    // Fallback: get data directly if internal API calls fail
    let questionsData, studentsData

    if (questionsRes.ok && studentsRes.ok) {
      questionsData = await questionsRes.json()
      studentsData = await studentsRes.json()
    } else {
      // Direct database queries as fallback
      const [questionsResult, studentsResult] = await Promise.all([
        supabase.from('session_question_stats').select('*').eq('session_id', sessionId),
        supabase.from('session_user_best').select('*').eq('session_id', sessionId)
      ])

      questionsData = { success: !questionsResult.error, data: questionsResult.data || [] }
      studentsData = { success: !studentsResult.error, data: studentsResult.data || [] }
    }

    if (!questionsData.success || !studentsData.success) {
      return NextResponse.json(
        { error: 'Kunde inte bearbeta data för AI-analys' },
        { status: 500 }
      )
    }

    const questions = questionsData.data
    const students = studentsData.data

    // Generate AI insights based on the data
    const insights = generateInsights(questions, students)

    return NextResponse.json({
      success: true,
      data: {
        insights,
        disclaimer: 'Dubbelkolla alltid innehållet. AI kan ha fel.',
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI insight error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid generering av AI-insikter' },
      { status: 500 }
    )
  }
}

/**
 * Generate insights based on question and student data
 * In a real implementation, this would call an AI service like OpenAI
 */
function generateInsights(questions: any[], students: any[]) {
  const insights = []

  // Analyze question performance
  const lowPerformanceQuestions = questions.filter(q => q.correctRate < 50)
  const highPerformanceQuestions = questions.filter(q => q.correctRate > 80)

  if (lowPerformanceQuestions.length > 0) {
    const titles = lowPerformanceQuestions.map(q => q.questionTitle).slice(0, 2)
    insights.push({
      type: 'concern',
      title: 'Frågor med låg framgång',
      description: `${lowPerformanceQuestions.length} frågor har mindre än 50% rätt svar. Exempel: "${titles.join('", "')}". Överväg att gå igenom dessa koncept igen.`,
      action: 'Repetition rekommenderas'
    })
  }

  if (highPerformanceQuestions.length > 0) {
    insights.push({
      type: 'success',
      title: 'Väl förstådda koncept',
      description: `${highPerformanceQuestions.length} frågor har över 80% rätt svar. Eleverna verkar behärska dessa områden väl.`,
      action: 'Kan fokusera på svårare material'
    })
  }

  // Analyze student performance distribution
  const submittedStudents = students.filter(s => s.status === 'submitted')
  const averageScore = submittedStudents.reduce((sum, s) => sum + s.bestScore, 0) / submittedStudents.length

  if (submittedStudents.length > 0) {
    const lowPerformers = submittedStudents.filter(s => s.bestScore < averageScore * 0.7).length
    const highPerformers = submittedStudents.filter(s => s.bestScore > averageScore * 1.3).length

    if (lowPerformers > submittedStudents.length * 0.3) {
      insights.push({
        type: 'concern',
        title: 'Många elever behöver stöd',
        description: `${lowPerformers} elever (${Math.round(lowPerformers/submittedStudents.length*100)}%) presterar under genomsnittet. Överväg extra stöd eller alternativa förklaringar.`,
        action: 'Individuellt stöd rekommenderas'
      })
    }

    if (highPerformers > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Elever redo för utmaning',
        description: `${highPerformers} elever presterar över genomsnittet och kan vara redo för mer utmanande material.`,
        action: 'Fördjupningsuppgifter kan vara lämpliga'
      })
    }
  }

  // Analyze completion and engagement
  const notStarted = students.filter(s => s.status === 'not_started').length
  const inProgress = students.filter(s => s.status === 'in_progress').length

  if (notStarted > students.length * 0.2) {
    insights.push({
      type: 'concern',
      title: 'Låg deltagarnivå',
      description: `${notStarted} elever har inte startat uppgiften ännu. Överväg påminnelser eller kontroll av tillgänglighet.`,
      action: 'Påminnelser kan behövas'
    })
  }

  if (inProgress > 0) {
    insights.push({
      type: 'info',
      title: 'Pågående arbete',
      description: `${inProgress} elever arbetar fortfarande med uppgiften.`,
      action: 'Övervaka framsteg'
    })
  }

  // Time analysis
  const studentsWithTime = students.filter(s => s.avgTimePerQuestion > 0)
  if (studentsWithTime.length > 0) {
    const avgTime = studentsWithTime.reduce((sum, s) => sum + s.avgTimePerQuestion, 0) / studentsWithTime.length
    const quickFinishers = studentsWithTime.filter(s => s.avgTimePerQuestion < avgTime * 0.5).length
    
    if (quickFinishers > studentsWithTime.length * 0.3) {
      insights.push({
        type: 'info',
        title: 'Snabba genomföranden',
        description: `${quickFinishers} elever slutförde uppgiften mycket snabbt. Kontrollera om de läste frågorna noggrant.`,
        action: 'Överväg att uppmuntra noggrannhet'
      })
    }
  }

  // Default insight if no specific patterns found
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Balanserad prestation',
      description: 'Elevernas prestationer är relativt jämna utan tydliga mönster som kräver specifika åtgärder.',
      action: 'Fortsätt som planerat'
    })
  }

  return insights.slice(0, 5) // Limit to max 5 insights
}