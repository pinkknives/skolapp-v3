'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { isValidEmail } from '@/lib/auth-utils'
import { UserPlus, AlertCircle, Lock, User, Chrome, Mail } from 'lucide-react'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'

 type RegisterState = 'idle' | 'sending' | 'error'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, setState] = useState<RegisterState>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !displayName || !password || !confirmPassword) {
      setError('Fyll i alla fält')
      return
    }
    
    if (!isValidEmail(email)) {
      setError('Ange en giltig e-postadress')
      return
    }

    if (displayName.trim().length < 2) {
      setError('Visningsnamnet måste vara minst 2 tecken långt')
      return
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken')
      return
    }

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte')
      return
    }

    setState('sending')
    setError(null)

    try {
      const supabase = supabaseBrowser()

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            role: 'teacher',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?signup=true&display_name=${encodeURIComponent(displayName.trim())}`,
        },
      })

      if (error) throw error

      // Optional: redirect or inform user to verify email depending on project settings
      // Here we just navigate to login
      window.location.href = '/login'
    } catch (err: unknown) {
      console.error('Registration error:', err)
      let message = 'Det gick inte att skapa kontot. Försök igen.'
      if (err instanceof Error) {
        if (err.message?.includes('already')) message = 'Ett konto med denna e-postadress finns redan.'
      }
      setError(message)
      setState('error')
    }
  }

  const handleGoogleRegister = async () => {
    setState('sending')
    setError(null)
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?signup=true` : undefined,
          queryParams: { prompt: 'select_account' },
        },
      })
      if (error) throw error
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : 'Kunde inte starta Google-registrering.'
      setError(message)
      setState('error')
    }
  }

  return (
    <Layout>
    <section className="min-h-svh w-full centered-flex bg-neutral-50 px-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-primary-600" />
          </div>
          <CardTitle>Skapa lärarkonto</CardTitle>
          <Typography variant="body2" className="text-neutral-600">
            Registrera dig för att börja skapa quiz och hantera klasser
          </Typography>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-3 h-12 text-base font-medium border-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              onClick={handleGoogleRegister}
              disabled={state === 'sending'}
            >
              <Chrome className="w-5 h-5" />
              Skapa konto med Google
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

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <FormField label="E-postadress">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@skolan.se"
                required
                disabled={state === 'sending'}
                leftIcon={<Mail size={16} />}
              />
            </FormField>

            <FormField label="Visningsnamn" helperText="Detta namn kommer att visas för eleverna">
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Anna Andersson"
                required
                disabled={state === 'sending'}
                leftIcon={<User size={16} />}
              />
            </FormField>

            <FormField label="Lösenord">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minst 6 tecken"
                required
                disabled={state === 'sending'}
                showPasswordToggle
                leftIcon={<Lock size={16} />}
              />
            </FormField>

            <FormField label="Bekräfta lösenord">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Bekräfta ditt lösenord"
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

            <Button
              type="submit"
              className="w-full"
              disabled={state === 'sending'}
            >
              {state === 'sending' ? 'Skapar konto...' : 'Skapa konto'}
            </Button>

            <div className="text-center pt-2">
              <Typography variant="caption" className="text-neutral-500">
                Genom att skapa ett konto godkänner du våra{' '}
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
                Har du redan ett konto?{' '}
                <Link href="/login" className="text-primary-600 hover:underline">
                  Logga in här
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
