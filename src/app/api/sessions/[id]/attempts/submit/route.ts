import { NextRequest, NextResponse } from 'next/server'
import { submitAsyncAssignmentAction } from '@/app/actions/sessions'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params
    const body = await request.json()
    const { userId, answers } = body

    if (!sessionId || !userId || !answers) {
      return NextResponse.json(
        { error: 'Sessions-ID, användar-ID och svar krävs' },
        { status: 400 }
      )
    }

    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('userId', userId)
    formData.append('answers', JSON.stringify(answers))

    const result = await submitAsyncAssignmentAction(formData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Submit assignment error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid inskickning av uppgiften' },
      { status: 500 }
    )
  }
}