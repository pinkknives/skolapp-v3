import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Ensure every request has a correlation id for tracing across logs/services
  const correlationId =
    request.headers.get('x-correlation-id') ||
    crypto.randomUUID()

  const response = NextResponse.next()
  response.headers.set('x-correlation-id', correlationId)
  return response
}

export const config = {
  matcher: ['/((?!_next/|static/|public/).*)'],
}


