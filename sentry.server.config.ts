import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    try {
      const request = (event.request && event.request.headers) ? event.request : undefined
      const headers = (request?.headers || {}) as Record<string, unknown>
      const corr = (headers['x-correlation-id'] as string | undefined) || undefined
      if (corr) {
        event.tags = { ...(event.tags || {}), correlation_id: String(corr) }
      }
    } catch {}
    return event
  }
})


