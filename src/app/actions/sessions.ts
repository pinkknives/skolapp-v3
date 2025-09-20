'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'
import { QuizSession, SessionParticipant, SessionStatus, ParticipantStatus, SessionMode, SessionState, SessionEventType, SessionAttempt, RevealPolicy } from '@/types/quiz'

// Helper function to map database session to QuizSession type
function mapDatabaseSessionToQuizSession(dbSession: Record<string, unknown>): QuizSession {
  return {
    id: dbSession.id as string,
    quizId: dbSession.quiz_id as string,
    teacherId: dbSession.teacher_id as string,
    code: dbSession.code as string,
    status: dbSession.status as SessionStatus,
    mode: dbSession.mode as SessionMode,
    state: dbSession.state as SessionState,
    currentIndex: (dbSession.current_index as number) || 0,
    questionWindowSeconds: dbSession.question_window_seconds as number | undefined,
    questionWindowStartedAt: dbSession.question_window_started_at ? new Date(dbSession.question_window_started_at as string) : undefined,
    // Async assignment fields with defaults
    openAt: dbSession.open_at ? new Date(dbSession.open_at as string) : undefined,
    dueAt: dbSession.due_at ? new Date(dbSession.due_at as string) : undefined,
    maxAttempts: (dbSession.max_attempts as number) || 1,
    timeLimitSeconds: dbSession.time_limit_seconds as number | undefined,
    revealPolicy: (dbSession.reveal_policy as RevealPolicy) || 'after_deadline',
    startedAt: dbSession.started_at ? new Date(dbSession.started_at as string) : undefined,
    endedAt: dbSession.ended_at ? new Date(dbSession.ended_at as string) : undefined,
    settings: (dbSession.settings as Record<string, unknown>) || {},
    createdAt: new Date(dbSession.created_at as string),
    updatedAt: new Date(dbSession.updated_at as string)
  }
}

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

export interface SyncControlResult {
  success: boolean
  session?: QuizSession
  error?: string
}

export interface SubmitAttemptResult {
  success: boolean
  attempt?: SessionAttempt
  error?: string
}

/**
 * Create a new quiz session
 */
export async function createSessionAction(formData: FormData): Promise<CreateSessionResult> {
  const quizId = formData.get('quizId') as string
  const mode = (formData.get('mode') as SessionMode) || 'async'

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
        mode: mode,
        state: 'idle',
        current_index: 0,
        settings: {}
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

    return {
      success: true,
      session: mapDatabaseSessionToQuizSession(session)
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
      session: mapDatabaseSessionToQuizSession(session)
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
      session: mapDatabaseSessionToQuizSession(session)
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
 * Control sync quiz session (start, pause, next, reveal, end)
 */
export async function syncControlAction(formData: FormData): Promise<SyncControlResult> {
  const sessionId = formData.get('sessionId') as string
  const action = formData.get('action') as string
  const payload = formData.get('payload') ? JSON.parse(formData.get('payload') as string) : {}

  if (!sessionId || !action) {
    return {
      success: false,
      error: 'Sessions-ID och åtgärd krävs'
    }
  }

  try {
    // Verify teacher authentication
    const user = await requireTeacher()
    
    const supabase = supabaseServer()

    // Verify session ownership and get current state
    const { data: existingSession, error: sessionError } = await supabase
      .from('sessions')
      .select('*, quizzes(questions)')
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !existingSession) {
      return {
        success: false,
        error: 'Session hittades inte eller du har inte behörighet'
      }
    }

    if (existingSession.mode !== 'sync') {
      return {
        success: false,
        error: 'Kontroller är endast tillgängliga för synkroniserade sessioner'
      }
    }

    const questions = existingSession.quizzes?.questions || []
    const currentIndex = existingSession.current_index || 0

    // Prepare update data based on action
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    // State machine logic
    switch (action) {
      case 'start':
        if (existingSession.state !== 'idle' && existingSession.state !== 'paused') {
          return { success: false, error: 'Kan inte starta från aktuellt tillstånd' }
        }
        updateData.state = 'running'
        updateData.status = 'live'
        if (!existingSession.started_at) {
          updateData.started_at = new Date().toISOString()
        }
        if (payload.questionWindowSeconds) {
          updateData.question_window_seconds = payload.questionWindowSeconds
          updateData.question_window_started_at = new Date().toISOString()
        }
        break

      case 'pause':
        if (existingSession.state !== 'running') {
          return { success: false, error: 'Kan inte pausa från aktuellt tillstånd' }
        }
        updateData.state = 'paused'
        break

      case 'next':
        if (existingSession.state !== 'running' && existingSession.state !== 'paused') {
          return { success: false, error: 'Kan inte gå till nästa från aktuellt tillstånd' }
        }
        if (currentIndex >= questions.length - 1) {
          // Last question - end session
          updateData.state = 'ended'
          updateData.status = 'ended'
          updateData.ended_at = new Date().toISOString()
        } else {
          updateData.current_index = currentIndex + 1
          updateData.state = 'running'
          if (payload.questionWindowSeconds) {
            updateData.question_window_seconds = payload.questionWindowSeconds
            updateData.question_window_started_at = new Date().toISOString()
          }
        }
        break

      case 'reveal':
        // Just log the reveal event - state doesn't change
        break

      case 'end':
        updateData.state = 'ended'
        updateData.status = 'ended'
        updateData.ended_at = new Date().toISOString()
        break

      default:
        return {
          success: false,
          error: 'Okänd åtgärd'
        }
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

    // Log event
    await supabase
      .from('session_events')
      .insert({
        session_id: sessionId,
        type: action as SessionEventType,
        payload: payload,
        created_by: user.id
      })

    return {
      success: true,
      session: mapDatabaseSessionToQuizSession(session)
    }
  } catch (error) {
    console.error('Error controlling sync session:', error)
    return {
      success: false,
      error: 'Det gick inte att kontrollera sessionen'
    }
  }
}

/**
 * Submit student attempt for current question in sync session
 */
export async function submitAttemptAction(formData: FormData): Promise<SubmitAttemptResult> {
  const sessionId = formData.get('sessionId') as string
  const answer = formData.get('answer') as string
  const userId = formData.get('userId') as string

  if (!sessionId || !answer || !userId) {
    return {
      success: false,
      error: 'Sessions-ID, svar och användar-ID krävs'
    }
  }

  try {
    const supabase = supabaseServer()

    // Get session and verify participation
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        quizzes(questions),
        session_participants(user_id, display_name)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Session hittades inte'
      }
    }

    // Verify user is participant (or allow guest)
    const isParticipant = session.session_participants?.some((p: { user_id: string | null; display_name: string }) => 
      p.user_id === userId || p.user_id === null
    )
    
    if (!isParticipant) {
      return {
        success: false,
        error: 'Du är inte deltagare i denna session'
      }
    }

    // Verify session is in running state for sync mode
    if (session.mode === 'sync' && session.state !== 'running') {
      return {
        success: false,
        error: 'Svar accepteras endast när sessionen körs'
      }
    }

    const questions = session.quizzes?.questions || []
    const currentIndex = session.current_index || 0
    const currentQuestion = questions[currentIndex]

    if (!currentQuestion) {
      return {
        success: false,
        error: 'Ingen aktiv fråga hittades'
      }
    }

    // Parse answer based on question type
    let parsedAnswer: unknown
    let isCorrect = false

    if (currentQuestion.type === 'multiple-choice') {
      parsedAnswer = JSON.parse(answer) // Array of selected option IDs
      const correctOptions = currentQuestion.options?.filter((opt: { isCorrect: boolean; id: string }) => opt.isCorrect).map((opt: { id: string }) => opt.id) || []
      isCorrect = JSON.stringify((parsedAnswer as string[]).sort()) === JSON.stringify(correctOptions.sort())
    } else {
      parsedAnswer = answer // String for free-text
      // For free-text, could implement simple string matching or AI grading
      isCorrect = currentQuestion.expectedAnswer ? 
        answer.toLowerCase().trim() === currentQuestion.expectedAnswer.toLowerCase().trim() : 
        false
    }

    // Insert or update attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('session_attempts')
      .upsert({
        session_id: sessionId,
        user_id: userId,
        question_index: currentIndex,
        answer: parsedAnswer,
        is_correct: isCorrect
      }, {
        onConflict: 'session_id,user_id,question_index'
      })
      .select()
      .single()

    if (attemptError) {
      throw attemptError
    }

    return {
      success: true,
      attempt: {
        id: attempt.id,
        sessionId: attempt.session_id,
        userId: attempt.user_id,
        questionIndex: attempt.question_index,
        answer: attempt.answer,
        isCorrect: attempt.is_correct,
        answeredAt: new Date(attempt.answered_at),
        attemptNo: attempt.attempt_no || 1,
        durationSeconds: attempt.duration_seconds
      }
    }
  } catch (error) {
    console.error('Error submitting attempt:', error)
    return {
      success: false,
      error: 'Det gick inte att skicka svaret'
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
      ...mapDatabaseSessionToQuizSession(session),
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

/**
 * Get session summary with results for teacher review
 */
export async function getSessionSummary(sessionId: string) {
  try {
    const user = await requireTeacher()
    const supabase = supabaseServer()

    // Get session with quiz data
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        quizzes(id, title, questions),
        session_participants(*),
        session_attempts(*)
      `)
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .single()

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Session hittades inte eller du har inte behörighet'
      }
    }

    const questions = session.quizzes?.questions || []
    const participants = session.session_participants || []
    const attempts = session.session_attempts || []

    // Calculate stats
    const totalParticipants = participants.length
    const participantsWithAttempts = new Set(attempts.map((a: { user_id: string }) => a.user_id)).size
    const totalAttempts = attempts.length
    const correctAttempts = attempts.filter((a: { is_correct: boolean }) => a.is_correct).length

    // Per question stats
    const questionStats = questions.map((question: { type: string; title: string; options?: { id: string; isCorrect: boolean }[] }, index: number) => {
      const questionAttempts = attempts.filter((a: { question_index: number }) => a.question_index === index)
      const correctCount = questionAttempts.filter((a: { is_correct: boolean }) => a.is_correct).length
      
      // Answer distribution for MC questions
      const answerDistribution: Record<string, number> = {}
      if (question.type === 'multiple-choice') {
        question.options?.forEach((option: { id: string }) => {
          answerDistribution[option.id] = questionAttempts.filter((a: { answer: unknown }) =>
            Array.isArray(a.answer) && a.answer.includes(option.id)
          ).length
        })
      }

      return {
        questionIndex: index,
        questionTitle: question.title,
        totalAttempts: questionAttempts.length,
        correctAttempts: correctCount,
        correctPercentage: questionAttempts.length > 0 ? (correctCount / questionAttempts.length) * 100 : 0,
        answerDistribution
      }
    })

    // Participant results
    const participantResults = participants.map((participant: { user_id: string; [key: string]: unknown }) => {
      const userAttempts = attempts.filter((a: { user_id: string }) => a.user_id === participant.user_id)
      const correctCount = userAttempts.filter((a: { is_correct: boolean }) => a.is_correct).length
      const totalAnswered = userAttempts.length
      
      return {
        ...participant,
        totalAnswered,
        correctAnswers: correctCount,
        score: totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0,
        attempts: userAttempts
      }
    })

    return {
      success: true,
      summary: {
        session: {
          id: session.id,
          quizTitle: session.quizzes?.title,
          status: session.status,
          mode: session.mode,
          state: session.state,
          startedAt: session.started_at ? new Date(session.started_at) : undefined,
          endedAt: session.ended_at ? new Date(session.ended_at) : undefined
        },
        stats: {
          totalParticipants,
          participantsWithAttempts,
          totalAttempts,
          correctAttempts,
          averageScore: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0
        },
        questionStats,
        participantResults
      }
    }
  } catch (error) {
    console.error('Error getting session summary:', error)
    return {
      success: false,
      error: 'Det gick inte att hämta sessionssammanfattning'
    }
  }
}