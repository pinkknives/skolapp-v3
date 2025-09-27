import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'
import { withApiMetric } from '@/lib/observability'

/**
 * POST /api/quiz-sessions
 * Create a new live quiz session for a class
 * Body: { classId: string, quizId: string, mode?: 'sync' | 'async' }
 */
export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id')
  return (await withApiMetric('quiz-sessions.create', 'POST', correlationId, async () => {
  try {
    // Verify teacher authentication
    const user = await requireTeacher()
    const supabase = supabaseServer()

    const body = await request.json()
    const { classId, quizId, mode = 'sync' } = body

    if (!classId || !quizId) {
      const res = NextResponse.json(
        { error: 'Klass-ID och Quiz-ID krävs' },
        { status: 400 }
      )
      return { result: res, status: 400 }
    }

    // Verify teacher has access to the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name, org_id, owner_id')
      .eq('id', classId)
      .single()

    if (classError || !classData) {
      const res = NextResponse.json(
        { error: 'Klass hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
      return { result: res, status: 404 }
    }

    // Check if user owns the class or is in the same org
    const hasClassAccess = classData.owner_id === user.id
    
    if (!hasClassAccess && classData.org_id) {
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', classData.org_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!orgMember) {
        const res = NextResponse.json(
          { error: 'Du har inte behörighet att skapa sessioner för denna klass' },
          { status: 403 }
        )
        return { result: res, status: 403 }
      }
    }

    // Verify teacher has access to the quiz
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, questions, org_id, owner_id')
      .eq('id', quizId)
      .single()

    if (quizError || !quizData) {
      const res = NextResponse.json(
        { error: 'Quiz hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
      return { result: res, status: 404 }
    }

    // Check quiz access
    const hasQuizAccess = quizData.owner_id === user.id

    if (!hasQuizAccess && quizData.org_id) {
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', quizData.org_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!orgMember) {
        const res = NextResponse.json(
          { error: 'Du har inte behörighet att använda detta quiz' },
          { status: 403 }
        )
        return { result: res, status: 403 }
      }
    }

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        quiz_id: quizId,
        teacher_id: user.id,
        org_id: classData.org_id,
        class_id: classId,
        mode,
        status: 'lobby',
        state: 'idle',
        current_index: 0,
        allow_responses: false // Start with responses locked
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      const res = NextResponse.json(
        { error: 'Kunde inte skapa session' },
        { status: 500 }
      )
      return { result: res, status: 500 }
    }

    // Generate join URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const joinUrl = `${baseUrl}/join/session/${session.code}`

    const res = NextResponse.json({
      success: true,
      session: {
        id: session.id,
        code: session.code,
        status: session.status,
        mode: session.mode,
        quizTitle: quizData.title,
        className: classData.name
      },
      joinUrl
    })
    return { result: res, status: 200 }

  } catch (error) {
    console.error('Error creating quiz session:', error)
    const res = NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
    return { result: res, status: 500 }
  }
  })).result
}