'use server'

import { hasEntitlement } from '@/lib/billing'
import { supabaseServer } from '@/lib/supabase-server'
import { Question, QuestionType } from '@/types/quiz'

export interface GenerateQuizRequest {
  subject: string
  gradeLevel: string
  numberOfQuestions: number
  difficulty: 'easy' | 'medium' | 'hard'
  topics?: string[]
  goals?: string
}

export interface GenerateQuizResponse {
  success: boolean
  title?: string
  questions?: Question[]
  error?: string
}

// Rate limiting tracking (in memory for MVP - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting: 10 requests per minute per organization
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(orgId: string): boolean {
  const now = Date.now()
  const key = `ai_quiz_${orgId}`
  const limit = rateLimitStore.get(key)
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  limit.count++
  return true
}

// Content moderation - block inappropriate content
function moderateContent(input: GenerateQuizRequest): boolean {
  const forbiddenPatterns = [
    /personnummer|social security|bank|password|lösenord/i,
    /våld|violence|döda|kill|skada|hurt/i,
    /sex|porn|naket|naked/i,
    /drog|drug|alkohol|alcohol/i
  ]
  
  const textToCheck = [
    input.subject,
    input.gradeLevel,
    input.goals || '',
    ...(input.topics || [])
  ].join(' ')
  
  return !forbiddenPatterns.some(pattern => pattern.test(textToCheck))
}

// Mock AI generation - replace with actual LLM in production
async function generateWithMockAI(input: GenerateQuizRequest): Promise<{ title: string; questions: Question[] }> {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
  
  const questions: Question[] = []
  
  // Generate questions based on input
  for (let i = 0; i < input.numberOfQuestions; i++) {
    const questionTypes: QuestionType[] = ['multiple-choice', 'free-text']
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)]
    
    if (questionType === 'multiple-choice') {
      questions.push({
        id: `ai_q_${Date.now()}_${i}`,
        type: 'multiple-choice',
        title: `Fråga ${i + 1}: Vilken av följande påståenden om ${input.subject.toLowerCase()} är korrekt för ${input.gradeLevel}?`,
        points: 1,
        options: [
          { id: `opt_${i}_1`, text: 'Detta är det korrekta svaret', isCorrect: true },
          { id: `opt_${i}_2`, text: 'Detta är ett felaktigt alternativ', isCorrect: false },
          { id: `opt_${i}_3`, text: 'Detta är också felaktigt', isCorrect: false },
          { id: `opt_${i}_4`, text: 'Detta är det tredje felaktiga alternativet', isCorrect: false }
        ],
        rationale: `Detta svar är korrekt eftersom det följer grundläggande principer inom ${input.subject.toLowerCase()} för ${input.gradeLevel}.`
      })
    } else {
      questions.push({
        id: `ai_q_${Date.now()}_${i}`,
        type: 'free-text',
        title: `Fråga ${i + 1}: Förklara kort vad du vet om ${input.subject.toLowerCase()} och ge ett konkret exempel.`,
        points: 2,
        expectedAnswer: `En förklaring som visar förståelse för grundläggande koncept inom ${input.subject.toLowerCase()}.`,
        rationale: `Ett bra svar ska innehålla både teoretisk förståelse och praktiska exempel från ${input.subject.toLowerCase()}.`
      })
    }
  }
  
  const difficultyPrefix = {
    easy: 'Grundläggande',
    medium: 'Fördjupat',
    hard: 'Avancerat'
  }[input.difficulty]
  
  return {
    title: `${difficultyPrefix} ${input.subject} - ${input.gradeLevel}`,
    questions
  }
}

export async function generateAiQuestions(input: GenerateQuizRequest): Promise<GenerateQuizResponse> {
  try {
    // Content moderation
    if (!moderateContent(input)) {
      return {
        success: false,
        error: 'Innehållet är inte lämpligt för en skolomiljö.'
      }
    }
    
    // Get current user
    const supabase = supabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Du måste vara inloggad för att använda AI-funktioner.'
      }
    }
    
    // Check AI entitlement
    const hasAI = await hasEntitlement('ai')
    if (!hasAI) {
      return {
        success: false,
        error: 'Din organisation saknar AI-funktioner. Uppgradera din prenumeration för att använda denna funktion.'
      }
    }
    
    // Get user's organization for rate limiting
    const { data: membership } = await supabase
      .from('org_members')
      .select(`
        org_id,
        org:org_id (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    if (!membership?.org_id) {
      return {
        success: false,
        error: 'Du måste vara medlem i en organisation för att använda AI-funktioner.'
      }
    }
    
    // Rate limiting check
    if (!checkRateLimit(membership.org_id)) {
      return {
        success: false,
        error: 'För många förfrågningar. Försök igen om en minut.'
      }
    }
    
    // Generate quiz with AI (mock implementation)
    const result = await generateWithMockAI(input)
    
    // Log anonymized usage for analytics (no PII)
    console.log(`AI quiz generated - org: ${membership.org_id}, subject: ${input.subject}, grade: ${input.gradeLevel}, questions: ${input.numberOfQuestions}`)
    
    return {
      success: true,
      title: result.title,
      questions: result.questions
    }
    
  } catch (error) {
    console.error('AI quiz generation error:', error)
    return {
      success: false,
      error: 'Ett fel uppstod vid generering av quiz. Försök igen senare.'
    }
  }
}