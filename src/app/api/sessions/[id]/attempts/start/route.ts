import { NextRequest, NextResponse } from 'next/server'
import { startAttemptAction } from '@/app/actions/sessions'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params
    const body = await request.json()
    const { userId } = body

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Sessions-ID och användar-ID krävs' },
        { status: 400 }
      )
    }

    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('userId', userId)

    const result = await startAttemptAction(formData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Start attempt error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid start av försöket' },
      { status: 500 }
    )
  }
}