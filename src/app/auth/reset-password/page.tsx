"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { isValidEmail } from '@/lib/auth-utils'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordRequestPage() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail)
  }, [initialEmail])

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError('E-postadress är obligatorisk')
      return
    }
    if (!isValidEmail(email)) {
      setError('Ange en giltig e-postadress')
      return
    }

    setState('sending')
    setError(null)

    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setState('sent')
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : 'Det gick inte att skicka återställningslänken.'
      setError(message)
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <Layout>
      <section className="min-h-svh w-full centered-flex bg-neutral-50 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <CardTitle>Återställningslänk skickad</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Typography variant="body2" className="text-neutral-600">
                Vi har skickat en länk för att återställa ditt lösenord till {email}.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </section>
      </Layout>
    )
  }

  return (
    <Layout>
    <section className="min-h-svh w-full centered-flex bg-neutral-50 px-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <CardTitle>Återställ lösenord</CardTitle>
            <Typography variant="body2" className="text-neutral-600">
              Ange din e-postadress så skickar vi en återställningslänk
            </Typography>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendReset} className="space-y-4">
              <FormField label="E-postadress">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="namn@exempel.se"
                  required
                  disabled={state === 'sending'}
                />
              </FormField>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
                  <Typography variant="body2" className="text-error-700">
                    {error}
                  </Typography>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={state === 'sending' || !email}>
                {state === 'sending' ? 'Skickar...' : 'Skicka återställningslänk'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
    </Layout>
  )
}
