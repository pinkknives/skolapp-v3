'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function InviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const success = searchParams.get('success')
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (success === 'true') {
      setStatus('success')
    } else if (error) {
      setStatus('error')
    } else {
      setStatus('error')
    }
  }, [success, error])

  const handleGoToOrganization = () => {
    router.push('/teacher/org')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <Layout>
      <Section spacing="lg" className="min-h-svh centered-grid">
        <Container>
          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  {status === 'loading' && (
                    <Loader2 size={48} className="text-primary-500 animate-spin" />
                  )}
                  {status === 'success' && (
                    <CheckCircle size={48} className="text-green-500" />
                  )}
                  {status === 'error' && (
                    <XCircle size={48} className="text-error-500" />
                  )}
                </div>
                <CardTitle>
                  {status === 'loading' && 'Accepterar inbjudan...'}
                  {status === 'success' && 'Inbjudan accepterad!'}
                  {status === 'error' && 'Kunde inte acceptera inbjudan'}
                </CardTitle>
                <CardDescription>
                  {message || error || 'Behandlar inbjudan...'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {status === 'success' && (
                  <>
                    <Typography variant="body2" className="text-neutral-600">
                      Du är nu medlem i organisationen och kan börja samarbeta med andra lärare.
                    </Typography>
                    <Button onClick={handleGoToOrganization} className="w-full">
                      Gå till min organisation
                    </Button>
                  </>
                )}
                {status === 'error' && (
                  <Button onClick={handleGoHome} variant="outline" className="w-full">
                    Tillbaka till startsidan
                  </Button>
                )}
                {status === 'loading' && (
                  <Typography variant="body2" className="text-neutral-600">
                    Vänta medan vi behandlar din inbjudan...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <Layout>
        <Section spacing="lg">
          <Container>
            <div className="max-w-lg mx-auto text-center">
              <Loader2 size={48} className="text-primary-500 animate-spin mx-auto mb-4" />
              <Typography variant="body1">Laddar...</Typography>
            </div>
          </Container>
        </Section>
      </Layout>
    }>
      <InviteContent />
    </Suspense>
  )
}
