import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service'
import type { Question } from '@/types/quiz'

const insightsSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    points: z.number().optional()
  })),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    isCorrect: z.boolean(),
    timeSpent: z.number()
  }))
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const supabase = supabaseBrowser()
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

    const { questions, answers } = insightsSchema.parse(await req.json())
    
    // Convert to proper Question format
    const formattedQuestions: Question[] = questions.map(q => ({
      id: q.id,
      type: q.type as 'multiple-choice' | 'free-text',
      title: q.title,
      points: q.points || 1
    } as Question))
    
    const insights = await enhancedAIService.analyzeStudentPerformance(formattedQuestions, answers)
    
    return NextResponse.json({
      success: true,
      insights
    })
  } catch (error) {
    console.error('AI insights error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ogiltiga parametrar', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Kunde inte analysera prestationer just nu' },
      { status: 500 }
    )
  }
}
