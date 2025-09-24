'use client'

import React, { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Chrome, User, Mail, Shield, CheckCircle, XCircle } from 'lucide-react'

export default function TestGoogleAuthPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signIn('google', { 
        callbackUrl: '/test-google-auth',
        redirect: false 
      })
    } catch (err) {
      setError('Inloggning misslyckades')
      console.error('Google sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/test-google-auth' })
    } catch (err) {
      setError('Utloggning misslyckades')
      console.error('Sign out error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <Layout>
        <Section className="min-h-screen flex items-center justify-center">
          <Container size="sm" className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <Typography variant="body1">Laddar autentisering...</Typography>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section className="min-h-screen py-12 bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="lg" className="max-w-4xl">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Google OAuth Test
              </CardTitle>
              <Typography variant="body1" className="text-muted-foreground">
                Testa Google-inloggning och se sessiondata
              </Typography>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {/* Status */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {session ? (
                    <CheckCircle className="w-6 h-6 text-success-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-error-500" />
                  )}
                  <Typography variant="h6" className={session ? 'text-success-600' : 'text-error-600'}>
                    {session ? 'Inloggad' : 'Inte inloggad'}
                  </Typography>
                </div>
              </div>

              {/* Session Data */}
              {session && (
                <Card className="bg-neutral-50 dark:bg-neutral-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Session Data</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <Typography variant="body2" className="font-semibold">Namn:</Typography>
                          <Typography variant="body2">{session.user?.name || 'Okänt'}</Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <Typography variant="body2" className="font-semibold">E-post:</Typography>
                          <Typography variant="body2">{session.user?.email || 'Okänt'}</Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <Typography variant="body2" className="font-semibold">Roll:</Typography>
                          <Typography variant="body2">{(session.user as { role?: string })?.role || 'student'}</Typography>
                        </div>
                      </div>
                      {session.user?.image && (
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={session.user.image} 
                            alt="Profilbild" 
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <Typography variant="body2">Profilbild från Google</Typography>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Message */}
              {error && (
                <Card className="bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800">
                  <CardContent className="pt-4">
                    <Typography variant="body2" className="text-error-600 dark:text-error-400">
                      {error}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {!session ? (
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 h-12"
                  >
                    <Chrome className="w-5 h-5 flex-shrink-0" />
                    <span>{isLoading ? 'Ansluter...' : 'Logga in med Google'}</span>
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    size="lg"
                    variant="destructive"
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 h-12"
                  >
                    <span>{isLoading ? 'Loggar ut...' : 'Logga ut'}</span>
                  </Button>
                )}
              </div>

              {/* Debug Info */}
              <Card className="bg-neutral-50 dark:bg-neutral-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Debug Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Typography variant="body2" className="font-semibold">Status:</Typography>
                      <Typography variant="body2" className="font-mono">{status}</Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="font-semibold">Session ID:</Typography>
                      <Typography variant="body2" className="font-mono">
                        {session?.user?.id || 'Ingen session'}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" className="font-semibold">Expires:</Typography>
                      <Typography variant="body2" className="font-mono">
                        {session?.expires || 'Okänt'}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Raw Session Data */}
              {session && (
                <Card className="bg-neutral-50 dark:bg-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Raw Session Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-white dark:bg-neutral-900 p-3 rounded border overflow-auto">
                      {JSON.stringify(session, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </Container>
      </Section>
    </Layout>
  )
}
