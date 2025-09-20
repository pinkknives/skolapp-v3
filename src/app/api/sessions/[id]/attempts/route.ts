import { NextRequest, NextResponse } from 'next/server'
import { submitAttemptAction } from '@/app/actions/sessions'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const body = await request.json()
    const { answer, userId } = body

    if (!sessionId || !answer || !userId) {
      return NextResponse.json(
        { error: 'Sessions-ID, svar och användar-ID krävs' },
        { status: 400 }
      )
    }

    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('answer', typeof answer === 'string' ? answer : JSON.stringify(answer))
    formData.append('userId', userId)

    const result = await submitAttemptAction(formData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Submit attempt error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid inskickning av svar' },
      { status: 500 }
    )
  }
}