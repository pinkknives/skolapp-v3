import { NextRequest, NextResponse } from 'next/server'
import { getSessionSummary } from '@/app/actions/sessions'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessions-ID krävs' },
        { status: 400 }
      )
    }

    const result = await getSessionSummary(sessionId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Session summary error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av sessionssammanfattning' },
      { status: 500 }
    )
  }
}