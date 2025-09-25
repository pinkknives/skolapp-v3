'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase-server'
import { generateShareCode } from '@/lib/quiz-utils'

interface CreateQuizResult {
  success: boolean
  quizId?: string
  joinCode?: string
  error?: string
}

interface CreateAttemptResult {
  success: boolean
  attemptId?: string
  error?: string
  errorCode?: string
}

/**
 * Create a new quiz with auto-generated join code
 */
export async function createQuizAction(formData: FormData): Promise<CreateQuizResult> {
  const title = formData.get('title') as string
  const ownerId = formData.get('ownerId') as string
  const orgId = formData.get('orgId') as string

  if (!title || !ownerId) {
    return {
      success: false,
      error: 'Titel och användare-ID krävs'
    }
  }

  if (!orgId) {
    return {
      success: false,
      error: 'Organisation krävs'
    }
  }

  try {
    const supabase = supabaseServer()

    // Verify user has access to the organization
    const { data: membership, error: membershipError } = await supabase
      .from('org_members')
      .select('*')
      .eq('org_id', orgId)
      .eq('user_id', ownerId)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership) {
      return {
        success: false,
        error: 'Du har inte behörighet att skapa quiz i denna organisation'
      }
    }

    // Generate unique join code
    let joinCode = generateShareCode()
    let attempts = 0
    const maxAttempts = 10

    // Ensure join code is unique
    while (attempts < maxAttempts) {
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('join_code', joinCode)
        .single()

      if (!existingQuiz) {
        break // Code is unique
      }

      joinCode = generateShareCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return {
        success: false,
        error: 'Kunde inte generera unik join-kod. Försök igen.'
      }
    }

    // Insert the quiz with organization
    const { data: quiz, error: insertError } = await supabase
      .from('quizzes')
      .insert({
        title,
        owner_id: ownerId,
        org_id: orgId,
        join_code: joinCode,
        status: 'draft'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Quiz creation error:', insertError)
      return {
        success: false,
        error: 'Kunde inte skapa quiz. Försök igen.'
      }
    }

    // If teacher consented to AI training, save anonymized training data stub
    try {
      const { data: us } = await supabase
        .from('user_settings')
        .select('consent_to_ai_training')
        .eq('user_id', ownerId)
        .maybeSingle()
      if (us?.consent_to_ai_training) {
        await supabase
          .from('ai_training_data')
          .insert({
            teacher_id: ownerId,
            quiz_id: quiz.id,
            question_text: `[quiz-created] ${title}`,
            question_type: null,
            subject: null,
            grade: null,
          })
      }
    } catch (e) {
      console.warn('ai_training_data insert skipped:', e)
    }

    revalidatePath('/teacher/quiz')
    return {
      success: true,
      quizId: quiz.id,
      joinCode: quiz.join_code
    }
  } catch (error) {
    console.error('Quiz creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod'
    }
  }
}

/**
 * Create an attempt for a student to join a quiz via join code
 */
export async function createAttemptAction(formData: FormData): Promise<CreateAttemptResult> {
  const code = formData.get('code') as string
  const studentId = formData.get('studentId') as string
  const studentAlias = formData.get('studentAlias') as string

  if (!code) {
    return {
      success: false,
      error: 'Quiz-kod krävs',
      errorCode: 'INVALID_CODE'
    }
  }

  try {
    const supabase = supabaseServer()

    // Find the quiz by join code
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, status')
      .eq('join_code', code.toUpperCase())
      .single()

    if (quizError || !quiz) {
      return {
        success: false,
        error: 'Quiz hittades inte. Kontrollera att koden är korrekt.',
        errorCode: 'QUIZ_NOT_FOUND'
      }
    }

    // Check if quiz is published
    if (quiz.status !== 'published') {
      return {
        success: false,
        error: 'Detta quiz är inte aktivt just nu. Kontakta din lärare.',
        errorCode: 'QUIZ_NOT_ACTIVE'
      }
    }

    // Check if user already has an attempt for this quiz
    if (studentId) {
      const { data: existingAttempt } = await supabase
        .from('attempts')
        .select('id')
        .eq('quiz_id', quiz.id)
        .eq('student_id', studentId)
        .single()

      if (existingAttempt) {
        return {
          success: false,
          error: 'Du har redan ett pågående försök för detta quiz.',
          errorCode: 'ALREADY_ATTEMPTED'
        }
      }
    }

    // Determine data retention mode based on consent
    let dataMode = 'short' // Default to short-term
    
    if (studentId) {
      // Use new consent system
      const { data: consent } = await supabase
        .from('guardian_consents')
        .select('status, expires_at')
        .eq('student_id', studentId)
        .eq('status', 'granted')
        .single()

      if (consent && consent.expires_at && new Date(consent.expires_at) > new Date()) {
        dataMode = 'long'
      }
    }

    // Create the attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        quiz_id: quiz.id,
        student_id: studentId,
        student_alias: studentAlias,
        data_mode: dataMode
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Attempt creation error:', attemptError)
      return {
        success: false,
        error: 'Kunde inte ansluta till quiz. Försök igen.',
        errorCode: 'CREATE_ATTEMPT_FAILED'
      }
    }

    revalidatePath('/quiz/take')
    return {
      success: true,
      attemptId: attempt.id
    }
  } catch (error) {
    console.error('Attempt creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod',
      errorCode: 'UNKNOWN_ERROR'
    }
  }
}

/**
 * Publish a quiz to make it available for students
 */
export async function publishQuizAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const quizId = formData.get('quizId') as string
  const ownerId = formData.get('ownerId') as string

  if (!quizId || !ownerId) {
    return {
      success: false,
      error: 'Quiz-ID och användare-ID krävs'
    }
  }

  try {
    const supabase = supabaseServer()

    // Verify ownership and update status
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ status: 'published' })
      .eq('id', quizId)
      .eq('owner_id', ownerId)

    if (updateError) {
      console.error('Quiz publish error:', updateError)
      return {
        success: false,
        error: 'Kunde inte publicera quiz. Kontrollera att du äger detta quiz.'
      }
    }

    revalidatePath('/teacher/quiz')
    return { success: true }
  } catch (error) {
    console.error('Quiz publish error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod'
    }
  }
}