import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { Question } from '@/types/quiz'

interface SaveDraftRequest {
  title: string
  description?: string
  questions: Question[]
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SaveDraftRequest = await request.json()
    
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { error: 'Titel och frågor krävs för att spara utkast.' },
        { status: 400 }
      )
    }
    
    // Get current user
    const supabase = supabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att spara quiz.' },
        { status: 401 }
      )
    }
    
    // Get user's organization
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
    
    // Create quiz draft in database
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: body.title,
        description: body.description,
        owner_id: user.id,
        org_id: membership?.org_id || null,
        status: 'draft',
        join_code: null // Will be generated when published
      })
      .select()
      .single()
    
    if (quizError) {
      console.error('Quiz creation error:', quizError)
      return NextResponse.json(
        { error: 'Kunde inte spara quiz i databasen.' },
        { status: 500 }
      )
    }
    
    // Save questions to database
    const questionsToSave = body.questions.map(question => ({
      quiz_id: quiz.id,
      type: question.type,
      content: {
        title: question.title,
        points: question.points,
        options: 'options' in question ? question.options : undefined,
        expectedAnswer: 'expectedAnswer' in question ? question.expectedAnswer : undefined,
        acceptedAnswers: 'acceptedAnswers' in question ? question.acceptedAnswers : undefined,
        imageUrl: 'imageUrl' in question ? question.imageUrl : undefined,
        imageAlt: 'imageAlt' in question ? question.imageAlt : undefined,
        rationale: 'rationale' in question ? question.rationale : undefined
      },
      answer_key: 'options' in question 
        ? { correct: question.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [] }
        : 'expectedAnswer' in question 
        ? { expected: question.expectedAnswer }
        : null,
      points: question.points
    }))
    
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToSave)
    
    if (questionsError) {
      console.error('Questions creation error:', questionsError)
      // Try to clean up the quiz if questions failed
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      return NextResponse.json(
        { error: 'Kunde inte spara frågorna. Försök igen.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        status: quiz.status
      }
    })
    
  } catch (error) {
    console.error('Save draft error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid sparande av utkast.' },
      { status: 500 }
    )
  }
}