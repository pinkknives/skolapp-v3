'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'
import { QuizSession, SessionParticipant, SessionStatus, ParticipantStatus } from '@/types/quiz'

export interface CreateSessionResult {
  success: boolean
  session?: QuizSession
  error?: string
}

export interface JoinSessionResult {
  success: boolean
  participant?: SessionParticipant
  session?: QuizSession
  error?: string
  errorCode?: 'SESSION_NOT_FOUND' | 'SESSION_ENDED' | 'SESSION_FULL' | 'ALREADY_JOINED' | 'INVALID_CODE'
}

export interface UpdateSessionResult {
  success: boolean
  session?: QuizSession
  error?: string
}

/**
 * Create a new quiz session
 */
export async function createSessionAction(formData: FormData): Promise<CreateSessionResult> {
  const quizId = formData.get('quizId') as string

  if (!quizId) {
    return {
      success: false,
      error: 'Quiz-ID krävs'
    }
  }

  try {
    // Verify teacher authentication
    const user = await requireTeacher()
    
    const supabase = supabaseServer()

    // Verify quiz ownership
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, status')
      .eq('id', quizId)
      .eq('owner_id', user.id)
      .single()

    if (quizError || !quiz) {
      return {
        success: false,
        error: 'Quiz hittades inte eller du har inte behörighet'
      }
    }

    if (quiz.status !== 'published') {
      return {
        success: false,
        error: 'Endast publicerade quiz kan användas för sessioner'
      }
    }

    // Check for existing active session for this quiz
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('quiz_id', quizId)
      .eq('teacher_id', user.id)
      .in('status', ['lobby', 'live'])
      .single()

    if (existingSession) {
      return {
        success: false,
        error: 'Det finns redan en aktiv session för detta quiz'
      }
    }

    // Create new session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        quiz_id: quizId,
        teacher_id: user.id,
        status: 'lobby',
        settings: {}
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

    return {
      success: true,
      session: {
        id: session.id,
        quizId: session.quiz_id,
        teacherId: session.teacher_id,
        code: session.code,
        status: session.status as SessionStatus,
        startedAt: session.started_at ? new Date(session.started_at) : undefined,
        endedAt: session.ended_at ? new Date(session.ended_at) : undefined,
        settings: session.settings || {},
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at)
      }
    }
  } catch (error) {
    console.error('Error creating session:', error)
    return {
      success: false,
      error: 'Det gick inte att skapa sessionen'
    }
  }
}

/**
 * Join a session as a student
 */
export async function joinSessionAction(formData: FormData): Promise<JoinSessionResult> {
  const code = formData.get('code') as string
  const displayName = formData.get('displayName') as string
  const studentId = formData.get('studentId') as string // Optional for authenticated users

  if (!code || !displayName) {
    return {
      success: false,
      error: 'Sessionskod och visningsnamn krävs',
      errorCode: 'INVALID_CODE'
    }
  }

  try {
    const supabase = supabaseServer()

    // Find session by code
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        quizzes(id, title, status)
      `)
      .eq('code', code.toUpperCase())
      .single()

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Session hittades inte. Kontrollera att koden är korrekt.',
        errorCode: 'SESSION_NOT_FOUND'
      }
    }

    if (session.status === 'ended') {
      return {
        success: false,
        error: 'Denna session har avslutats.',
        errorCode: 'SESSION_ENDED'
      }
    }

    // Check if student is already in the session
    const { data: existingParticipant } = await supabase
      .from('session_participants')
      .select('id')
      .eq('session_id', session.id)
      .eq('display_name', displayName.trim())
      .single()

    if (existingParticipant) {
      return {
        success: false,
        error: 'Du är redan med i denna session.',
        errorCode: 'ALREADY_JOINED'
      }
    }

    // Count current participants for capacity check
    const { count: participantCount } = await supabase
      .from('session_participants')
      .select('*', { count: 'exact' })
      .eq('session_id', session.id)

    const maxParticipants = (session.settings as Record<string, unknown>)?.maxParticipants as number || 100
    if (participantCount && participantCount >= maxParticipants) {
      return {
        success: false,
        error: 'Sessionen är full.',
        errorCode: 'SESSION_FULL'
      }
    }

    // Add participant to session
    const { data: participant, error: participantError } = await supabase
      .from('session_participants')
      .insert({
        session_id: session.id,
        student_id: studentId || null,
        display_name: displayName.trim(),
        status: 'joined'
      })
      .select()
      .single()

    if (participantError) {
      throw participantError
    }

    return {
      success: true,
      participant: {
        id: participant.id,
        sessionId: participant.session_id,
        studentId: participant.student_id,
        displayName: participant.display_name,
        joinedAt: new Date(participant.joined_at),
        status: participant.status as ParticipantStatus,
        lastSeen: new Date(participant.last_seen)
      },
      session: {
        id: session.id,
        quizId: session.quiz_id,
        teacherId: session.teacher_id,
        code: session.code,
        status: session.status as SessionStatus,
        startedAt: session.started_at ? new Date(session.started_at) : undefined,
        endedAt: session.ended_at ? new Date(session.ended_at) : undefined,
        settings: session.settings || {},
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at)
      }
    }
  } catch (error) {
    console.error('Error joining session:', error)
    return {
      success: false,
      error: 'Det gick inte att gå med i sessionen'
    }
  }
}

/**
 * Update session status (start, end, etc.)
 */
export async function updateSessionStatusAction(formData: FormData): Promise<UpdateSessionResult> {
  const sessionId = formData.get('sessionId') as string
  const status = formData.get('status') as SessionStatus

  if (!sessionId || !status) {
    return {
      success: false,
      error: 'Sessions-ID och status krävs'
    }
  }

  try {
    // Verify teacher authentication
    const user = await requireTeacher()
    
    const supabase = supabaseServer()

    // Verify session ownership
    const { data: existingSession, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !existingSession) {
      return {
        success: false,
        error: 'Session hittades inte eller du har inte behörighet'
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'live' && !existingSession.started_at) {
      updateData.started_at = new Date().toISOString()
    }

    if (status === 'ended' && !existingSession.ended_at) {
      updateData.ended_at = new Date().toISOString()
    }

    // Update session
    const { data: session, error: updateError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return {
      success: true,
      session: {
        id: session.id,
        quizId: session.quiz_id,
        teacherId: session.teacher_id,
        code: session.code,
        status: session.status as SessionStatus,
        startedAt: session.started_at ? new Date(session.started_at) : undefined,
        endedAt: session.ended_at ? new Date(session.ended_at) : undefined,
        settings: session.settings || {},
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at)
      }
    }
  } catch (error) {
    console.error('Error updating session:', error)
    return {
      success: false,
      error: 'Det gick inte att uppdatera sessionen'
    }
  }
}

/**
 * Get session with participants for teacher view
 */
export async function getSessionWithParticipants(sessionId: string): Promise<QuizSession & { participants: SessionParticipant[] } | null> {
  try {
    // Verify teacher authentication
    const user = await requireTeacher()
    
    const supabase = supabaseServer()

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return null
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true })

    if (participantsError) {
      throw participantsError
    }

    return {
      id: session.id,
      quizId: session.quiz_id,
      teacherId: session.teacher_id,
      code: session.code,
      status: session.status as SessionStatus,
      startedAt: session.started_at ? new Date(session.started_at) : undefined,
      endedAt: session.ended_at ? new Date(session.ended_at) : undefined,
      settings: session.settings || {},
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at),
      participants: participants.map(p => ({
        id: p.id,
        sessionId: p.session_id,
        studentId: p.student_id,
        displayName: p.display_name,
        joinedAt: new Date(p.joined_at),
        status: p.status as ParticipantStatus,
        lastSeen: new Date(p.last_seen)
      }))
    }
  } catch (error) {
    console.error('Error getting session with participants:', error)
    return null
  }
}