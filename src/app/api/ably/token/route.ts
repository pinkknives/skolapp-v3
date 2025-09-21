import { NextRequest, NextResponse } from 'next/server'
import { Rest } from 'ably'

function deriveRole(req: NextRequest): 'teacher' | 'student' {
  // TODO: replace with real auth/session when available
  // For now, use header or fallback to student
  const role = req.headers.get('x-role')
  return role === 'teacher' ? 'teacher' : 'student'
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.ABLY_API_KEY
    const ttl = Number(process.env.ABLY_TOKEN_TTL_SECONDS ?? 3600)
    
    if (!apiKey) {
      console.error('❌ ABLY_API_KEY saknas i miljövariablerna')
      return NextResponse.json(
        { 
          error: 'Ably API-nyckel saknas i miljövariablerna',
          details: 'Kontrollera att ABLY_API_KEY är konfigurerad korrekt'
        },
        { status: 500 }
      )
    }

    const role = deriveRole(req)
    const clientId = req.headers.get('x-client-id') ?? `${role}-${Date.now()}`

    const ably = new Rest(apiKey)

    // Capability per role: limit permissions based on user role
    // Note: For specific quizId scoping, extend this based on query parameters
    const capability =
      role === 'teacher'
        ? {
            'quiz:*:control': ['publish', 'subscribe'],
            'quiz:*:answers': ['subscribe'],
            'quiz:*:room': ['presence.subscribe', 'presence.enter', 'presence.leave'],
          }
        : {
            'quiz:*:control': ['subscribe'],
            'quiz:*:answers': ['publish'],
            'quiz:*:room': ['presence.subscribe', 'presence.enter', 'presence.leave'],
          }

    const tokenRequest = await ably.auth.createTokenRequest({
      clientId,
      ttl: ttl * 1000,
      capability: JSON.stringify(capability),
    })

    return NextResponse.json(tokenRequest)
  } catch (error) {
    console.error('Error creating Ably token:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod när token skulle skapas' },
      { status: 500 }
    )
  }
}