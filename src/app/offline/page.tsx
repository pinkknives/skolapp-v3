'use client'

import { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Layout, Container, Section } from '@/components/layout/Layout'

export default function OfflinePage() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : false)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return (
    <Layout>
      <Section className="py-16">
        <Container size="sm">
          <div className="text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-warning-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-warning-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.2 0 2-1.3 1.37-2.34L13.37 4.66c-.6-1.02-2.13-1.02-2.73 0L3.7 16.66C3.07 17.7 3.86 19 5.07 19z" />
              </svg>
            </div>
            <Typography variant="h5" className="mb-2">Du är offline</Typography>
            <Typography variant="body2" className="text-neutral-600 mb-6">
              Ingen internetanslutning. Sidan kan visas från cache om den varit besökt tidigare. Försök igen när du är online.
            </Typography>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => window.location.reload()} disabled={!online}>Ladda om</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/')}>Till startsidan</Button>
            </div>
            <Typography variant="caption" className="text-neutral-500 mt-6 block">
              Status: {online ? 'Online' : 'Offline'}
            </Typography>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}


