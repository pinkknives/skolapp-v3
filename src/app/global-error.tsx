'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    try { Sentry.captureException(error) } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <html lang="sv">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-error-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.1 19h13.8c1.2 0 2-1.3 1.4-2.34L13.4 4.66c-.6-1.02-2.2-1.02-2.8 0L3.7 16.66C3.1 17.7 3.9 19 5.1 19z"/></svg>
            </div>
            <Typography variant="h5">Ett fel uppstod</Typography>
            <Typography variant="body2" className="text-neutral-600">
              Vi har loggat felet. Försök igen, eller gå tillbaka till startsidan.
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => reset()}>Försök igen</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/')}>Startsidan</Button>
            </div>
            {error?.digest && (
              <Typography variant="caption" className="text-neutral-400">Referens: {error.digest}</Typography>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}


