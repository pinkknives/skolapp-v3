import * as Sentry from '@sentry/nextjs'

export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || ''
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
  })

  // Inject correlation id into server fetches when available via AsyncLocalStorage headers
  const originalFetch = global.fetch
  global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const reqInit = init || {}
      const headers = new Headers(reqInit.headers || {})
      // If a correlation id is present in incoming request, middleware sets it; we forward if present
      // Note: In this context we cannot directly access the incoming request; callers should pass it explicitly when needed.
      return originalFetch(input as RequestInfo, { ...reqInit, headers })
    } catch {
      return originalFetch(input as RequestInfo, init)
    }
  }
}

export function onRequestError(err: unknown, request: Request) {
  try {
    const correlationId = request.headers.get('x-correlation-id') || undefined
    Sentry.captureException(err, {
      tags: {
        correlation_id: correlationId || 'none',
        route: request.url || 'unknown',
      },
    })
  } catch {
    // no-op
  }
}


