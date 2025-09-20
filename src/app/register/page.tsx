'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { isValidEmail } from '@/lib/auth-utils'
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type RegisterState = 'idle' | 'sending' | 'sent' | 'error'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [state, setState] = useState<RegisterState>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !displayName) {
      setError('E-postadress och visningsnamn är obligatoriska')
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

    setState('sending')
    setError(null)

    try {
      const supabase = supabaseBrowser()
      
      // Sign up with magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?signup=true&display_name=${encodeURIComponent(displayName.trim())}`,
          data: {
            display_name: displayName.trim(),
            role: 'teacher' // Default role for registration
          }
        }
      })

      if (error) {
        throw error
      }

      setState('sent')
    } catch (err: unknown) {
      console.error('Registration error:', err)
      
      // Provide Swedish error messages
      let errorMessage = 'Det gick inte att skapa kontot. Försök igen.'
      
      if (err instanceof Error) {
        if (err.message?.includes('already registered') || err.message?.includes('already exists')) {
          errorMessage = 'Ett konto med denna e-postadress finns redan. Prova att logga in istället.'
        } else if (err.message?.includes('email')) {
          errorMessage = 'Det gick inte att skicka e-postlänken. Kontrollera att e-postadressen är korrekt.'
        }
      }
      
      setError(errorMessage)
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setError(null)
    setEmail('')
    setDisplayName('')
  }

  if (state === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <CardTitle>Bekräfta ditt konto</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Typography variant="body2" className="text-neutral-600">
              Vi har skickat en bekräftelselänk till:
            </Typography>
            <Typography variant="body1" className="font-medium">
              {email}
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Klicka på länken i e-posten för att slutföra registreringen och logga in. 
              Kontrollera även skräpposten om du inte ser meddelandet.
            </Typography>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="w-full"
            >
              Registrera med annan e-postadress
            </Button>
            <div className="pt-4 border-t border-neutral-200">
              <Typography variant="caption" className="text-neutral-500">
                Har du redan ett konto?{' '}
                <Link href="/login" className="text-primary-600 hover:underline">
                  Logga in här
                </Link>
              </Typography>
            </div>
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
            <UserPlus className="w-6 h-6 text-primary-600" />
          </div>
          <CardTitle>Skapa lärarkonto</CardTitle>
          <Typography variant="body2" className="text-neutral-600">
            Registrera dig för att börja skapa quiz och hantera klasser
          </Typography>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <Input
              label="E-postadress"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="namn@skolan.se"
              required
              disabled={state === 'sending'}
            />

            <Input
              label="Visningsnamn"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Anna Andersson"
              required
              disabled={state === 'sending'}
              helperText="Detta namn kommer att visas för eleverna"
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
              disabled={state === 'sending' || !email || !displayName}
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
  )
}