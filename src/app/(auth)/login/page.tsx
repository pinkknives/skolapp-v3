'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { isValidEmail } from '@/lib/auth-utils'
import { Mail, AlertCircle, Lock, Chrome } from 'lucide-react'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { useRouter, useSearchParams } from 'next/navigation'

 type AuthState = 'idle' | 'sending' | 'error'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/teacher'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState<AuthState>('idle')
  const [error, setError] = useState<string | null>(null)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('E-postadress är obligatorisk')
      return
    }
    
    if (!isValidEmail(email)) {
      setError('Ange en giltig e-postadress')
      return
    }

    if (!password) {
      setError('Lösenord är obligatoriskt')
      return
    }

    setState('sending')
    setError(null)

    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Surface Supabase error message if present
        throw error
      }

      setState('idle')
      router.replace(callbackUrl)
    } catch (err) {
      console.error('Password login error:', err)
      const message = err instanceof Error && err.message
        ? err.message
        : 'Fel e-post eller lösenord. Försök igen.'
      setError(message)
      setState('error')
    }
  }

  const handleGoogleLogin = async () => {
    setState('sending')
    setError(null)
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          queryParams: { prompt: 'select_account' },
        },
      })
      if (error) throw error
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : 'Kunde inte starta Google-inloggning.'
      setError(message)
      setState('error')
    }
  }

  const isInvalidCreds = (error || '').toLowerCase().includes('invalid login credentials')
  const isEmailNotConfirmed = (error || '').toLowerCase().includes('confirm') || (error || '').toLowerCase().includes('not confirmed')

  return (
    <Layout>
    <section className="min-h-svh w-full centered-flex bg-neutral-50 px-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
      <Card className="w-full">
        <CardHeader className="text-center max-w-none">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <CardTitle>Logga in med e-post och lösenord</CardTitle>
          <Typography 
            variant="body2" 
            className="dark:text-neutral-300 text-left text-neutral-600 max-w-none"
          >
            Ange din e-postadress och ditt lösenord för att logga in
          </Typography>
        </CardHeader>
        <CardContent className="max-w-none">
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-3 h-12 text-base font-medium border-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              onClick={handleGoogleLogin}
              disabled={state === 'sending'}
            >
              <Chrome className="w-5 h-5" />
              Logga in med Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">eller</span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
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

            <FormField label="Lösenord">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ditt lösenord"
                required
                disabled={state === 'sending'}
                showPasswordToggle
                leftIcon={<Lock size={16} />}
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

            {(isInvalidCreds || isEmailNotConfirmed) && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <Typography variant="body2" className="text-neutral-700">
                  {isInvalidCreds
                    ? 'Om du tidigare loggat in via e‑postlänk har du inget lösenord ännu. Återställ/lägg till ett lösenord nedan.'
                    : 'Din e‑postadress kan behöva bekräftas. Kolla din inkorg och skräppost, eller sätt ett nytt lösenord.'}
                </Typography>
                <div className="mt-2">
                  <Link
                    href={`/auth/reset-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Återställ lösenord
                  </Link>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={state === 'sending' || !email || !password}
            >
              {state === 'sending' ? 'Loggar in...' : 'Logga in'}
            </Button>

            <div className="text-center">
              <Link href="/auth/reset-password" className="text-sm text-primary-600 hover:underline">
                Glömt lösenord?
              </Link>
            </div>

            <div className="text-center pt-2">
              <Typography variant="caption" className="text-neutral-500">
                Genom att logga in godkänner du våra{' '}
                <a href="/terms" className="text-primary-600 hover:underline">
                  användarvillkor
                </a>{' '}
                och{' '}
                <a href="/privacy" className="text-primary-600 hover:underline">
                  integritetspolicy
                </a>
              </Typography>
            </div>

            <div className="text-center pt-4 border-t border-neutral-200">
              <Typography variant="caption" className="text-neutral-500">
                Har du inget konto än?{' '}
                <Link href="/register" className="text-primary-600 hover:underline">
                  Skapa lärarkonto här
                </Link>
              </Typography>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </section>
    </Layout>
  )
}
