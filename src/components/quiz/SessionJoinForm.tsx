'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { joinSessionAction } from '@/app/actions/sessions'
import { QuizSession, SessionParticipant } from '@/types/quiz'
import { Users, AlertCircle, CheckCircle } from 'lucide-react'

interface SessionJoinFormProps {
  prefilledCode?: string
  onJoinSuccess?: (session: QuizSession, participant: SessionParticipant) => void
  className?: string
}

type JoinState = 'code' | 'name' | 'joining' | 'success' | 'error'

export function SessionJoinForm({ prefilledCode = '', onJoinSuccess, className }: SessionJoinFormProps) {
  const [code, setCode] = useState(prefilledCode)
  const [displayName, setDisplayName] = useState('')
  const [state, setState] = useState<JoinState>(prefilledCode ? 'name' : 'code')
  const [error, setError] = useState<string | null>(null)

  const validateCode = (inputCode: string): boolean => {
    return /^[A-Z0-9]{6}$/.test(inputCode.toUpperCase())
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCode(code)) {
      setError('Ange en giltig 6-teckens kod')
      return
    }

    setState('name')
    setError(null)
    
    // TODO: Optionally validate the session exists and get quiz title
    // For now we'll just proceed to name entry
  }

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError('Ange ett giltigt namn (minst 2 tecken)')
      return
    }

    if (!validateCode(code)) {
      setError('Ogiltig sessionskod')
      return
    }

    setState('joining')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('code', code.toUpperCase())
      formData.append('displayName', displayName.trim())
      // TODO: Add studentId if user is authenticated
      
      const result = await joinSessionAction(formData)

      if (result.success && result.session && result.participant) {
        setState('success')
        onJoinSuccess?.(result.session, result.participant)
      } else {
        setState('error')
        setError(result.error || 'Det gick inte att gå med i sessionen')
      }
    } catch (err) {
      console.error('Error joining session:', err)
      setState('error')
      setError('Ett oväntat fel inträffade')
    }
  }

  const handleReset = () => {
    setState('code')
    setCode('')
    setDisplayName('')
    setError(null)
  }

  if (state === 'success') {
    return (
      <div className={className}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <CardTitle>Ansluten till session!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Typography variant="body2" className="text-neutral-600">
              Du är nu ansluten som <strong>{displayName}</strong>
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Vänta på att läraren startar quizet...
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <CardTitle>
            {state === 'code' ? 'Gå med i Quiz' : 
             state === 'name' ? 'Ange ditt namn' : 
             'Ansluter...'}
          </CardTitle>
          <Typography variant="body2" className="text-neutral-600">
            {state === 'code' ? 'Ange sessionskoden från din lärare' :
             state === 'name' ? 'Detta namn kommer att visas för läraren' :
             'Ansluter till sessionen...'}
          </Typography>
        </CardHeader>
        <CardContent>
          {/* Code Entry Step */}
          {state === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <Input
                label="Sessionskod"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                required
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
              />
              
              <Button
                type="submit"
                disabled={!validateCode(code)}
                fullWidth
                size="lg"
              >
                Fortsätt
              </Button>
            </form>
          )}

          {/* Name Entry Step */}
          {state === 'name' && (
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <Typography variant="body2" className="text-neutral-600">
                  Sessionskod: <span className="font-mono font-bold">{code}</span>
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState('code')}
                  className="mt-1"
                >
                  Ändra kod
                </Button>
              </div>

              <Input
                label="Ditt namn"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Anna Andersson"
                required
                autoFocus
                maxLength={50}
              />
              
              <Button
                type="submit"
                disabled={!displayName.trim() || displayName.trim().length < 2}
                fullWidth
                size="lg"
                data-testid="ai-quiz-start"
              >
                Gå med i sessionen
              </Button>
            </form>
          )}

          {/* Joining State */}
          {state === 'joining' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <Typography variant="body2" className="text-neutral-600">
                Ansluter till sessionen...
              </Typography>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 rounded-md mt-4">
              <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
              <Typography variant="body2" className="text-error-700">
                {error}
              </Typography>
            </div>
          )}

          {state === 'error' && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                fullWidth
              >
                Försök igen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}