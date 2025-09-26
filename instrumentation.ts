import * as Sentry from '@sentry/nextjs'

export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || ''
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}


