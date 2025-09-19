import { NextRequest, NextResponse } from 'next/server'
import { hasEntitlement } from '@/lib/billing'
import { supabaseServer } from '@/lib/supabase-server'
import { Question, QuestionType } from '@/types/quiz'

// Rate limiting tracking (in memory for MVP - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface GenerateQuizRequest {
  subject: string
  gradeLevel: string
  numberOfQuestions: number
  difficulty: 'easy' | 'medium' | 'hard'
  topics?: string[]
  goals?: string
}

interface GenerateQuizResponse {
  title: string
  questions: Question[]
}

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

// Input validation and sanitization
function validateInput(input: unknown): GenerateQuizRequest | null {
  if (!input || typeof input !== 'object') return null
  
  const inputObj = input as Record<string, unknown>
  const { subject, gradeLevel, numberOfQuestions, difficulty, topics, goals } = inputObj
  
  // Validate required fields
  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) return null
  if (!gradeLevel || typeof gradeLevel !== 'string' || gradeLevel.trim().length === 0) return null
  if (!numberOfQuestions || typeof numberOfQuestions !== 'number' || numberOfQuestions < 1 || numberOfQuestions > 20) return null
  if (!difficulty || typeof difficulty !== 'string' || !['easy', 'medium', 'hard'].includes(difficulty)) return null
  
  // Sanitize inputs to prevent injection
  const sanitizedSubject = (subject as string).trim().slice(0, 100) // Max 100 chars
  const sanitizedGradeLevel = (gradeLevel as string).trim().slice(0, 50)
  const sanitizedGoals = goals && typeof goals === 'string' ? goals.trim().slice(0, 500) : undefined // Max 500 chars
  
  // Validate topics array if provided
  let sanitizedTopics: string[] | undefined
  if (topics && Array.isArray(topics)) {
    sanitizedTopics = topics
      .filter(topic => typeof topic === 'string' && topic.trim().length > 0)
      .map(topic => topic.trim().slice(0, 100))
      .slice(0, 10) // Max 10 topics
  }
  
  return {
    subject: sanitizedSubject,
    gradeLevel: sanitizedGradeLevel,
    numberOfQuestions: Math.min(Math.max(numberOfQuestions as number, 1), 20),
    difficulty: difficulty as 'easy' | 'medium' | 'hard',
    topics: sanitizedTopics,
    goals: sanitizedGoals
  }
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

// System prompt for Swedish educational context (not used in mock, but ready for real LLM)
function _createSystemPrompt(input: GenerateQuizRequest): string {
  return `Du är en erfaren svensk lärare som skapar engagerande quiz för svenska skolor.

INSTRUKTIONER:
- Skapa ${input.numberOfQuestions} frågor för ämnet "${input.subject}"
- Årskurs/nivå: ${input.gradeLevel}
- Svårighetsgrad: ${input.difficulty}
${input.topics ? `- Fokusområden: ${input.topics.join(', ')}` : ''}
${input.goals ? `- Lärandemål: ${input.goals}` : ''}

KRAV:
- Alla frågor på svenska
- Anpassa språk och innehåll till svensk läroplan
- Använd svenska exempel och referenser
- Svårighetsgrad ska passa målgruppen
- Skapa både flervals- och fritextfrågor
- Inkludera pedagogisk förklaring för varje fråga

FÖRBJUDET:
- Personuppgifter eller namn på verkliga personer
- Känsligt eller olämpligt innehåll
- Politik eller kontroversiella ämnen
- Kommersiella referenser

Svara ENDAST med valid JSON enligt detta schema:
{
  "title": "Quiz-titel på svenska",
  "questions": [
    {
      "id": "unique_id",
      "type": "multiple-choice" | "free-text",
      "title": "Frågetext på svenska",
      "points": 1,
      "options": [{"id": "opt1", "text": "Alternativ", "isCorrect": boolean}], // endast för multiple-choice
      "expectedAnswer": "Förväntat svar", // endast för free-text
      "rationale": "Kort förklaring varför detta är rätt svar"
    }
  ]
}`
}

// Mock AI generation - replace with actual LLM in production
async function generateWithMockAI(input: GenerateQuizRequest): Promise<GenerateQuizResponse> {
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

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const input = validateInput(body)
    
    if (!input) {
      return NextResponse.json(
        { error: 'Ogiltiga parametrar. Kontrollera att alla fält är korrekt ifyllda.' },
        { status: 400 }
      )
    }
    
    // Content moderation
    if (!moderateContent(input)) {
      return NextResponse.json(
        { error: 'Innehållet är inte lämpligt för en skolomiljö.' },
        { status: 400 }
      )
    }
    
    // Get current user
    const supabase = supabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att använda AI-funktioner.' },
        { status: 401 }
      )
    }
    
    // Check AI entitlement
    const hasAI = await hasEntitlement('ai')
    if (!hasAI) {
      return NextResponse.json(
        { error: 'Din organisation saknar AI-funktioner. Uppgradera din prenumeration för att använda denna funktion.' },
        { status: 403 }
      )
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
      return NextResponse.json(
        { error: 'Du måste vara medlem i en organisation för att använda AI-funktioner.' },
        { status: 403 }
      )
    }
    
    // Rate limiting check
    if (!checkRateLimit(membership.org_id)) {
      return NextResponse.json(
        { error: 'För många förfrågningar. Försök igen om en minut.' },
        { status: 429 }
      )
    }
    
    // Generate quiz with AI (mock implementation)
    const result = await generateWithMockAI(input)
    
    // Log anonymized usage for analytics (no PII)
    console.log(`AI quiz generated - org: ${membership.org_id}, subject: ${input.subject}, grade: ${input.gradeLevel}, questions: ${input.numberOfQuestions}`)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('AI quiz generation error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid generering av quiz. Försök igen senare.' },
      { status: 500 }
    )
  }
}