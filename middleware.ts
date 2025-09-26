import { NextRequest, NextResponse } from 'next/server'

function generateCorrelationId(): string {
  try {
    // Prefer crypto.randomUUID when available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (globalThis as any).crypto?.randomUUID?.()
    if (g) return g
  } catch {}
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function middleware(request: NextRequest) {
  const existing = request.headers.get('x-correlation-id')
  const id = existing || generateCorrelationId()
  const response = NextResponse.next({ request: { headers: request.headers } })
  response.headers.set('x-correlation-id', id)
  return response
}

export const config = {
  matcher: ['/api/:path*']
}


