import { NextRequest, NextResponse } from 'next/server'
import { syncControlAction } from '@/app/actions/sessions'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    const body = await request.json()
    const { action, payload } = body

    if (!sessionId || !action) {
      return NextResponse.json(
        { error: 'Sessions-ID och åtgärd krävs' },
        { status: 400 }
      )
    }

    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('action', action)
    if (payload) {
      formData.append('payload', JSON.stringify(payload))
    }

    const result = await syncControlAction(formData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Session control error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid kontroll av sessionen' },
      { status: 500 }
    )
  }
}