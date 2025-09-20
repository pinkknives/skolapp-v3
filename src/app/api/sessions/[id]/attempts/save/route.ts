import { NextRequest, NextResponse } from 'next/server'
import { saveAttemptProgressAction } from '@/app/actions/sessions'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params
    const body = await request.json()
    const { userId, questionIndex, answer, attemptNo } = body

    if (!sessionId || !userId || questionIndex === undefined || !answer) {
      return NextResponse.json(
        { error: 'Sessions-ID, användar-ID, frågeindex och svar krävs' },
        { status: 400 }
      )
    }

    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('userId', userId)
    formData.append('questionIndex', questionIndex.toString())
    formData.append('answer', JSON.stringify(answer))
    formData.append('attemptNo', (attemptNo || 1).toString())

    const result = await saveAttemptProgressAction(formData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Save progress error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid sparning av framsteg' },
      { status: 500 }
    )
  }
}