import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'
import { resolveEffectiveSubscriptionForUser } from '@/lib/billing/subscriptions'
import { getRealtimeLimits } from '@/lib/realtime/limits'

/**
 * POST /api/live-sessions
 * Create a new live quiz session
 * Body: { orgId: string, classId?: string, quizId: string, settings?: object }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireTeacher()
    const supabase = supabaseServer()

    const body = await request.json()
    const { orgId, classId, quizId, settings = {} } = body

    if (!orgId || !quizId) {
      return NextResponse.json(
        { error: 'Organisation-ID och Quiz-ID krävs' },
        { status: 400 }
      )
    }

    // Verify teacher has access to the organization
    const { data: orgMember, error: orgError } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (orgError || !orgMember) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att skapa sessioner för denna organisation' },
        { status: 403 }
      )
    }

    // Realtime guardrails: enforce concurrent session limits per plan
    const quotas = await resolveEffectiveSubscriptionForUser(user.id)
    const limits = getRealtimeLimits(quotas.plan)

    if (limits.maxConcurrentSessions != null) {
      const { count: activeCount } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['CREATED', 'ACTIVE'])

      if ((activeCount || 0) >= limits.maxConcurrentSessions) {
        return NextResponse.json(
          { error: 'Gräns för samtidiga livesessioner uppnådd. Uppgradera för fler.' },
          { status: 429 }
        )
      }
    }

    // If classId is provided, verify access to class
    if (classId) {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, org_id, owner_id')
        .eq('id', classId)
        .eq('org_id', orgId)
        .single()

      if (classError || !classData) {
        return NextResponse.json(
          { error: 'Klass hittades inte eller tillhör inte organisationen' },
          { status: 404 }
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

    // Check quiz access (must be owned by user or in same org)
    const hasQuizAccess = quizData.owner_id === user.id || quizData.org_id === orgId

    if (!hasQuizAccess) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att använda detta quiz' },
        { status: 403 }
      )
    }

    // Create the live quiz session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        org_id: orgId,
        class_id: classId,
        quiz_id: quizId,
        created_by: user.id,
        settings: {
          timePerQuestion: 30,
          showAfterEach: true,
          autoAdvance: false,
          ...settings
        }
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating quiz session:', sessionError)
      return NextResponse.json(
        { error: 'Kunde inte skapa session' },
        { status: 500 }
      )
    }

    // Add teacher as participant
    const { error: participantError } = await supabase
      .from('quiz_session_participants')
      .insert({
        session_id: session.id,
        user_id: user.id,
        display_name: user.email || 'Lärare',
        role: 'teacher'
      })

    if (participantError) {
      console.error('Error adding teacher as participant:', participantError)
      // Continue anyway - not critical
    }

    // Generate join URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const joinUrl = `${baseUrl}/live/join?pin=${session.pin}`

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        pin: session.pin,
        status: session.status,
        orgId: session.org_id,
        classId: session.class_id,
        quizId: session.quiz_id,
        currentIndex: session.current_index,
        settings: session.settings,
        createdBy: session.created_by,
        createdAt: session.created_at,
        quizTitle: quizData.title
      },
      joinUrl
    })

  } catch (error) {
    console.error('Error creating live quiz session:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod' },
      { status: 500 }
    )
  }
}