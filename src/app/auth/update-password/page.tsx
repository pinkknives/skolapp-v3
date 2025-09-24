"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

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

    setState('saving')
    setError(null)

    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setState('success')
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : 'Det gick inte att uppdatera lösenordet.'
      setError(message)
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <Layout>
      <section className="min-h-svh w-full centered-flex bg-neutral-50 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <CardTitle>Lösenord uppdaterat</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Typography variant="body2" className="text-neutral-600">
                Du kan nu logga in med ditt nya lösenord.
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
              <Lock className="w-6 h-6 text-primary-600" />
            </div>
            <CardTitle>Välj nytt lösenord</CardTitle>
            <Typography variant="body2" className="text-neutral-600">
              Ange ett nytt säkert lösenord för ditt konto
            </Typography>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <FormField label="Nytt lösenord">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minst 6 tecken"
                  required
                  showPasswordToggle
                />
              </FormField>

              <FormField label="Bekräfta nytt lösenord">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Bekräfta ditt lösenord"
                  required
                  showPasswordToggle
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

              <Button type="submit" className="w-full" disabled={state === 'saving' || !password || !confirmPassword}>
                {state === 'saving' ? 'Sparar...' : 'Uppdatera lösenord'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
    </Layout>
  )
}
