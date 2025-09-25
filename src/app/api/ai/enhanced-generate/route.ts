import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service'

const enhancedGenerateSchema = z.object({
  subject: z.string().min(1),
  grade: z.string().min(1),
  difficulty: z.enum(['lätt', 'medel', 'svår']).default('medel'),
  count: z.number().int().min(1).max(20).default(5),
  type: z.enum(['multiple-choice', 'free-text', 'mixed']).default('mixed'),
  topics: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  extraContext: z.string().optional(),
  pedagogicalApproach: z.enum(['conceptual', 'practical', 'analytical', 'creative']).optional(),
  previousPerformance: z.object({
    averageScore: z.number().min(0).max(100),
    commonMistakes: z.array(z.string()),
    strengths: z.array(z.string())
  }).optional(),
  studentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional()
})

const actionSchema = z.object({
  action: z.enum(['improve', 'rewrite', 'regenerate', 'distractors']),
  params: enhancedGenerateSchema,
  // minimal question payload for actions that transform an existing question
  question: z.object({
    type: z.enum(['multiple-choice', 'free-text']).optional(),
    title: z.string().optional(),
    options: z.array(z.object({ id: z.string(), text: z.string(), isCorrect: z.boolean().optional() })).optional(),
    expectedAnswer: z.string().optional()
  }).optional()
})

const personalizedGenerateSchema = z.object({
  studentProfile: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']),
    interests: z.array(z.string()),
    previousPerformance: z.number().min(0).max(100),
    averageTimePerQuestion: z.number().optional(),
    commonMistakes: z.array(z.string()).optional()
  }),
  params: enhancedGenerateSchema
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication (server-side, using Authorization header)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('authorization') || '' } },
      auth: { persistSession: false }
    })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att använda AI-funktioner' },
        { status: 401 }
      )
    }

    // Check quota
    const quotaResponse = await fetch(`${req.nextUrl.origin}/api/ai/usage`, {
      method: 'POST',
      headers: { 
        'authorization': req.headers.get('authorization') || '',
        'content-type': 'application/json'
      }
    })

    if (quotaResponse.status === 429) {
      const quotaData = await quotaResponse.json()
      return NextResponse.json(quotaData, { status: 429 })
    }

    if (!quotaResponse.ok) {
      return NextResponse.json(
        { error: 'Kunde inte verifiera AI-kvot' },
        { status: 500 }
      )
    }

    const body = await req.json()

    // Check if this is a personalized request
    if (body.studentProfile) {
      const { studentProfile, params } = personalizedGenerateSchema.parse(body)
      const questions = await enhancedAIService.generatePersonalizedQuestions(studentProfile, params)
      
      return NextResponse.json({
        success: true,
        questions: questions.map(aq => ({
          question: aq.question,
          difficulty: aq.difficulty,
          estimatedTime: aq.estimatedTime,
          learningObjective: aq.learningObjective,
          prerequisites: aq.prerequisites,
          followUpSuggestions: aq.followUpSuggestions
        }))
      })
    }

    // Unified actions endpoint
    if (body.action) {
      const { action, params, question } = actionSchema.parse(body)
      const result = await enhancedAIService.performAction(action, params, question)
      return NextResponse.json({ success: true, ...result })
    }

    // Default adaptive generation
    {
      const params = enhancedGenerateSchema.parse(body)
      const questions = await enhancedAIService.generateAdaptiveQuestions(params)
      
      return NextResponse.json({
        success: true,
        questions: questions.map(aq => ({
          question: aq.question,
          difficulty: aq.difficulty,
          estimatedTime: aq.estimatedTime,
          learningObjective: aq.learningObjective,
          prerequisites: aq.prerequisites,
          followUpSuggestions: aq.followUpSuggestions
        }))
      })
    }
  } catch (error) {
    console.error('Enhanced AI generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ogiltiga parametrar', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Kunde inte generera frågor just nu' },
      { status: 500 }
    )
  }
}
