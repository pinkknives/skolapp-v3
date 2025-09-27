import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 0.1,
  replaysSessionSampleRate: 0.0,
  beforeSend(event) {
    // Pass correlation id if we have one on the current document
    try {
      const id = document?.querySelector('meta[name="x-correlation-id"]')?.getAttribute('content')
      if (id) {
        event.tags = { ...(event.tags || {}), correlation_id: id }
      }
    } catch {}
    return event
  }
})


