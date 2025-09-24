import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

/**
 * POST /api/quiz-sessions
 * Create a new live quiz session for a class
 * Body: { classId: string, quizId: string, mode?: 'sync' | 'async' }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify teacher authentication
    const user = await requireTeacher()
    const supabase = supabaseServer()

    const body = await request.json()
    const { classId, quizId, mode = 'sync' } = body

    if (!classId || !quizId) {
      return NextResponse.json(
        { error: 'Klass-ID och Quiz-ID krävs' },
        { status: 400 }
      )
    }

    // Verify teacher has access to the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name, org_id, owner_id')
      .eq('id', classId)
      .single()

    if (classError || !classData) {
      return NextResponse.json(
        { error: 'Klass hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
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
        return NextResponse.json(
          { error: 'Du har inte behörighet att skapa sessioner för denna klass' },
          { status: 403 }
        )
      }
    }

    // Verify teacher has access to the quiz
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, questions, org_id, owner_id')
      .eq('id', quizId)
      .single()

    if (quizError || !quizData) {
      return NextResponse.json(
        { error: 'Quiz hittades inte eller du har inte behörighet' },
        { status: 404 }
      )
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
        return NextResponse.json(
          { error: 'Du har inte behörighet att använda detta quiz' },
          { status: 403 }
        )
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
      return NextResponse.json(
        { error: 'Kunde inte skapa session' },
        { status: 500 }
      )
    }

    // Generate join URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const joinUrl = `${baseUrl}/join/session/${session.code}`

    return NextResponse.json({
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

  } catch (error) {
    console.error('Error creating quiz session:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}