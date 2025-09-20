'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { isValidEmail } from '@/lib/auth-utils'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type AuthState = 'idle' | 'sending' | 'sent' | 'error'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<AuthState>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSendMagicLink = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      setState('sent')
    } catch (err) {
      console.error('Magic link error:', err)
      setError('Det gick inte att skicka e-postlänken. Försök igen.')
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setError(null)
    setEmail('')
  }

  if (state === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <CardTitle>E-post skickad!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Typography variant="body2" className="text-neutral-600">
              Vi har skickat en inloggningslänk till:
            </Typography>
            <Typography variant="body1" className="font-medium">
              {email}
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Klicka på länken i e-posten för att logga in. Kontrollera även skräpposten om du inte ser meddelandet.
            </Typography>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="w-full"
            >
              Skicka till annan e-postadress
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <CardTitle>Logga in med e-post</CardTitle>
          <Typography variant="body2" className="text-neutral-600">
            Ange din e-postadress så skickar vi en säker inloggningslänk
          </Typography>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <Input
              label="E-postadress"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="namn@exempel.se"
              required
              disabled={state === 'sending'}
              data-testid="email"
            />

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
              disabled={state === 'sending' || !email}
              data-testid="login-submit"
            >
              {state === 'sending' ? 'Skickar...' : 'Skicka inloggningslänk'}
            </Button>

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
  )
}