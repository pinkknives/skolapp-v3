'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { useAuth } from '@/contexts/AuthContext'
import { FormField } from '@/components/ui/FormField'
import { Stack } from '@/components/layout/Stack'

interface GuestLoginProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function GuestLogin({ onSuccess, onSwitchToLogin }: GuestLoginProps) {
  const { loginAsGuest } = useAuth()
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const session = loginAsGuest(nickname || undefined)
    setIsLoading(false)
    
    if (session) {
      onSuccess?.()
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Fortsätt som gäst</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <Stack align="center" className="text-center" gap="xs">
              <Typography variant="body2" className="text-neutral-600">
                Som gäst kan du delta i quiz utan att skapa ett konto.
              </Typography>
              <Typography variant="caption" className="text-neutral-500">
                Dina resultat sparas inte permanent.
              </Typography>
            </Stack>

            <FormField
              label="Smeknamn (valfritt)"
              helperText="Detta namn visas i quiz om du väljer att dela det"
            >
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="t.ex. Alex"
                maxLength={20}
              />
            </FormField>

            <Stack gap="md">
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-md">
                <Typography variant="body2" className="text-primary-800 font-medium">
                  Som gäst kan du:
                </Typography>
                <ul className="mt-2 text-sm text-primary-700 space-y-1">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Delta i quiz med QR-kod eller fyrställig kod
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Se resultat direkt efter quiz
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Upplev alla quizfunktioner
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-warning-50 border border-warning-200 rounded-md">
                <Typography variant="body2" className="text-warning-800 font-medium">
                  Observera:
                </Typography>
                <ul className="mt-2 text-sm text-warning-700 space-y-1">
                  <li>• Resultat sparas inte permanent</li>
                  <li>• Du kan inte skapa egna quiz</li>
                  <li>• Sessionen upphör efter 4 timmar</li>
                </ul>
              </div>
            </Stack>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fortsätt som gäst
            </Button>

            <Typography variant="body2" className="text-neutral-600 text-center">
              Vill du spara resultat och skapa quiz?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary-600 hover:underline font-medium"
              >
                Skapa konto
              </button>
            </Typography>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
