'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { isValidEmail } from '@/lib/auth-utils'
import { FormField } from '@/components/ui/FormField'
import { Stack } from '@/components/layout/Stack'
import { 
  Mail, 
  UserPlus, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Users,
  Lock
} from 'lucide-react'

 type AuthMode = 'login' | 'register'
 type AuthState = 'idle' | 'sending' | 'error'

interface ImprovedAuthFormProps {
  mode: AuthMode
  onModeChange?: (mode: AuthMode) => void
  suggestedOrgId?: string
}

export function ImprovedAuthForm({ mode, onModeChange, suggestedOrgId }: ImprovedAuthFormProps) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, setState] = useState<AuthState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [orgHint, setOrgHint] = useState<string | null>(null)

  React.useEffect(() => {
    if (suggestedOrgId) {
      setOrgHint('Din e‑post domän matchar en organisation – du kan bli automatiskt föreslagen där vid första inloggning.')
    } else {
      setOrgHint(null)
    }
  }, [suggestedOrgId])

  const isLogin = mode === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('E-postadress är obligatorisk')
      return
    }
    
    if (!isValidEmail(email)) {
      setError('Ange en giltig e-postadress')
      return
    }

    if (isLogin) {
      if (!password) {
        setError('Lösenord är obligatoriskt')
        return
      }
    } else {
      if (!displayName) {
        setError('Visningsnamn är obligatoriskt')
        return
      }
      if (displayName.trim().length < 2) {
        setError('Visningsnamnet måste vara minst 2 tecken långt')
        return
      }
      if (!password || !confirmPassword) {
        setError('Fyll i och bekräfta ditt lösenord')
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
    }

    setState('sending')
    setError(null)

    try {
      const supabase = supabaseBrowser()

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim(),
              role: 'teacher',
            },
          },
        })
        if (error) throw error
      }

      setState('idle')
    } catch (err: unknown) {
      console.error('Auth error:', err)
      let errorMessage = isLogin 
        ? 'Fel e-post eller lösenord.'
        : 'Det gick inte att skapa kontot. Försök igen.'
      if (err instanceof Error) {
        if (!isLogin && err.message?.includes('already')) {
          errorMessage = 'Ett konto med denna e-postadress finns redan.'
        }
      }
      setError(errorMessage)
      setState('error')
    }
  }

  const handleModeSwitch = () => {
    if (onModeChange) {
      onModeChange(isLogin ? 'register' : 'login')
    }
    setState('idle')
    setError(null)
    setEmail('')
    setDisplayName('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-neutral-50 px-4">
      <Stack className="w-full max-w-md" gap="lg" align="center">
        {/* Header with mode indicator */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-neutral-200">
            <div className={`w-2 h-2 rounded-full ${isLogin ? 'bg-success-500' : 'bg-primary-500'}`} />
            <Typography variant="caption" className="font-medium">
              {isLogin ? 'Befintlig användare' : 'Ny användare'}
            </Typography>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              {isLogin ? (
                <Lock className="w-8 h-8 text-primary-600" />
              ) : (
                <UserPlus className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? 'Välkommen tillbaka!' : 'Skapa ditt lärarkonto'}
            </CardTitle>
            <Typography variant="body2" className="text-neutral-600 mt-2">
              {isLogin 
                ? 'Logga in med e-post och lösenord'
                : 'Registrera dig med e-post, visningsnamn och lösenord'
              }
            </Typography>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <Stack gap="md">
                  <FormField label="E-postadress" helperText={orgHint || undefined}>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isLogin ? 'namn@exempel.se' : 'namn@skolan.se'}
                      required
                      disabled={state === 'sending'}
                      leftIcon={<Mail size={18} />}
                    />
                  </FormField>

                  {!isLogin && (
                    <FormField
                      label="Visningsnamn"
                      helperText="Detta namn kommer att visas för eleverna"
                    >
                      <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Anna Andersson"
                        required
                        disabled={state === 'sending'}
                        leftIcon={<Users size={18} />}
                      />
                    </FormField>
                  )}

                  <FormField label="Lösenord">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minst 6 tecken"
                      required
                      disabled={state === 'sending'}
                      showPasswordToggle
                      leftIcon={<Lock size={18} />}
                    />
                  </FormField>

                  {!isLogin && (
                    <FormField label="Bekräfta lösenord">
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Bekräfta ditt lösenord"
                        required
                        disabled={state === 'sending'}
                        showPasswordToggle
                        leftIcon={<Lock size={18} />}
                      />
                    </FormField>
                  )}
                </Stack>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-error-50 border border-error-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                    <Stack gap="xs" align="start">
                      <Typography variant="body2" className="text-error-700">
                        {error}
                      </Typography>
                    </Stack>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={state === 'sending' || !email || !password || (!isLogin && (!displayName || !confirmPassword))}
                  loading={state === 'sending'}
                  rightIcon={<ArrowRight size={18} />}
                >
                  {isLogin ? 'Logga in' : 'Skapa konto'}
                </Button>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-neutral-600 mt-0.5 flex-shrink-0" />
                    <Stack gap="xs" align="start">
                      <Typography variant="body2" className="text-neutral-700 font-medium">
                        Säker autentisering
                      </Typography>
                      <Typography variant="body2" className="text-neutral-600">
                        Ditt lösenord lagras säkert av vår autentiseringstjänst.
                      </Typography>
                    </Stack>
                  </div>
                </div>

                <Typography variant="caption" className="text-neutral-500 text-center">
                  Genom att {isLogin ? 'logga in' : 'skapa ett konto'} godkänner du våra{' '}
                  <a href="/terms" className="text-primary-600 hover:underline font-medium">
                    användarvillkor
                  </a>{' '}
                  och{' '}
                  <a href="/privacy" className="text-primary-600 hover:underline font-medium">
                    integritetspolicy
                  </a>
                </Typography>

                <Typography variant="caption" className="text-neutral-500 text-center border-t border-neutral-200 pt-4">
                  {isLogin ? 'Har du inget konto än?' : 'Har du redan ett konto?'}{' '}
                  <button 
                    onClick={handleModeSwitch}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    {isLogin ? 'Skapa konto här' : 'Logga in här'}
                  </button>
                </Typography>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Stack>
    </div>
  )
}
