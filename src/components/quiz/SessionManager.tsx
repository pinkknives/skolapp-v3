'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz, QuizSession, SessionParticipant } from '@/types/quiz'
import { createSessionAction, getSessionWithParticipants } from '@/app/actions/sessions'
import { SessionLobby } from './SessionLobby'
import { Share2, Play, AlertCircle } from 'lucide-react'

interface SessionManagerProps {
  quiz: Quiz
  onClose?: () => void
  className?: string
}

export function SessionManager({ quiz, onClose, className }: SessionManagerProps) {
  const [session, setSession] = useState<(QuizSession & { participants: SessionParticipant[] }) | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'async' | 'sync'>('async')
  
  // Async assignment settings
  const [openAt, setOpenAt] = useState<string>('')
  const [dueAt, setDueAt] = useState<string>('')
  const [maxAttempts, setMaxAttempts] = useState<number>(1)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('')
  const [revealPolicy, setRevealPolicy] = useState<'immediate' | 'after_deadline' | 'never'>('after_deadline')

  // Check for existing active session when component mounts
  useEffect(() => {
    // TODO: Check for existing session via API
    // This would query for any existing 'lobby' or 'live' sessions for this quiz
  }, [quiz.id])

  const handleCreateSession = async () => {
    setIsCreating(true)
    setError(null)

    // Validate async assignment settings
    if (mode === 'async') {
      if (!dueAt) {
        setError('Deadline krävs för asynkrona uppgifter')
        setIsCreating(false)
        return
      }

      const dueDate = new Date(dueAt)
      const now = new Date()
      
      if (dueDate <= now) {
        setError('Deadline måste vara i framtiden')
        setIsCreating(false)
        return
      }

      if (openAt) {
        const openDate = new Date(openAt)
        if (openDate >= dueDate) {
          setError('Öppningstid måste vara före deadline')
          setIsCreating(false)
          return
        }
      }

      if (maxAttempts < 1 || maxAttempts > 10) {
        setError('Antal försök måste vara mellan 1 och 10')
        setIsCreating(false)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('quizId', quiz.id)
      formData.append('mode', mode)
      
      // Add async assignment settings
      if (mode === 'async') {
        if (openAt) formData.append('openAt', openAt)
        formData.append('dueAt', dueAt)
        formData.append('maxAttempts', maxAttempts.toString())
        if (timeLimitMinutes) formData.append('timeLimitSeconds', (Number(timeLimitMinutes) * 60).toString())
        formData.append('revealPolicy', revealPolicy)
      }

      const result = await createSessionAction(formData)

      if (result.success && result.session) {
        // Get the full session with participants
        const fullSession = await getSessionWithParticipants(result.session.id)
        if (fullSession) {
          setSession(fullSession)
        }
      } else {
        setError(result.error || 'Det gick inte att skapa sessionen')
      }
    } catch (err) {
      console.error('Error creating session:', err)
      setError('Ett oväntat fel inträffade')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSessionUpdate = (updatedSession: QuizSession) => {
    if (session) {
      setSession({
        ...session,
        ...updatedSession
      })
    }
  }

  // If we have an active session, show the lobby
  if (session) {
    return (
      <div className={className}>
        <SessionLobby 
          session={session}
          quizTitle={quiz.title}
          quiz={quiz}
          onSessionUpdate={handleSessionUpdate}
        />
        
        {onClose && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={onClose}>
              Stäng
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Show session creation interface
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary-600" />
            Starta Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Typography variant="h6" className="mb-2">
              {quiz.title}
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Skapa en session för att låta elever gå med i realtid
            </Typography>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
              <Typography variant="body2" className="text-error-700">
                {error}
              </Typography>
            </div>
          )}

          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="space-y-3">
              <Typography variant="body2" className="font-medium">
                Välj körläge:
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('async')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    mode === 'async' 
                      ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${mode === 'async' ? 'bg-primary-600' : 'bg-neutral-300'}`} />
                    <Typography variant="body2" className="font-medium">
                      Självgående
                    </Typography>
                  </div>
                  <Typography variant="caption" className="text-neutral-600">
                    Elever svarar i egen takt. Du kan följa upp resultat efteråt.
                  </Typography>
                </button>

                <button
                  onClick={() => setMode('sync')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    mode === 'sync' 
                      ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${mode === 'sync' ? 'bg-primary-600' : 'bg-neutral-300'}`} />
                    <Typography variant="body2" className="font-medium">
                      Live (Realtid)
                    </Typography>
                  </div>
                  <Typography variant="caption" className="text-neutral-600">
                    Du styr quizet fråga för fråga. Alla elever följer samma takt.
                  </Typography>
                </button>
              </div>
            </div>

            {/* Async Assignment Settings */}
            {mode === 'async' && (
              <div className="space-y-4 p-4 border border-primary-200 bg-primary-50 rounded-lg">
                <Typography variant="body2" className="font-medium text-primary-800">
                  Inställningar för läxa
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Open Date */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Öppnas (valfritt)
                    </label>
                    <input
                      type="datetime-local"
                      value={openAt}
                      onChange={(e) => setOpenAt(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Typography variant="caption" className="text-neutral-600">
                      Lämna tom för att öppna direkt
                    </Typography>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Max Attempts */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Max antal försök
                    </label>
                    <select
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {[1, 2, 3, 4, 5, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Tidsgräns per försök (minuter)
                    </label>
                    <input
                      type="number"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
                      placeholder="Ingen gräns"
                      min="1"
                      max="180"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Reveal Policy */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Visa facit
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRevealPolicy('immediate')}
                        className={`p-3 border rounded-md text-left transition-colors ${
                          revealPolicy === 'immediate' 
                            ? 'border-primary-500 bg-primary-100 text-primary-800' 
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        <Typography variant="body2" className="font-medium">Direkt</Typography>
                        <Typography variant="caption" className="text-neutral-600">
                          Visa facit när eleven skickat in
                        </Typography>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setRevealPolicy('after_deadline')}
                        className={`p-3 border rounded-md text-left transition-colors ${
                          revealPolicy === 'after_deadline' 
                            ? 'border-primary-500 bg-primary-100 text-primary-800' 
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        <Typography variant="body2" className="font-medium">Efter deadline</Typography>
                        <Typography variant="caption" className="text-neutral-600">
                          Visa facit när deadline passerat
                        </Typography>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setRevealPolicy('never')}
                        className={`p-3 border rounded-md text-left transition-colors ${
                          revealPolicy === 'never' 
                            ? 'border-primary-500 bg-primary-100 text-primary-800' 
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        <Typography variant="body2" className="font-medium">Aldrig</Typography>
                        <Typography variant="caption" className="text-neutral-600">
                          Visa aldrig facit automatiskt
                        </Typography>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-neutral-50 p-4 rounded-md">
              <Typography variant="body2" className="font-medium mb-2">
                Så här fungerar det:
              </Typography>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Du får en unik 6-teckens kod och QR-kod</li>
                <li>• Elever kan gå med via kod eller genom att skanna QR-koden</li>
                <li>• Du ser alla som går med i realtid</li>
                {mode === 'sync' ? (
                  <li>• Du kontrollerar när varje fråga startar och avslutas</li>
                ) : (
                  <li>• Elever kan börja när som helst innan deadline</li>
                )}
                {mode === 'async' && (
                  <li>• Du kan följa elevers framsteg i realtid</li>
                )}
              </ul>
            </div>

            <Button
              onClick={handleCreateSession}
              disabled={isCreating || quiz.status !== 'published'}
              className="w-full gap-2"
            >
              <Play className="w-4 h-4" />
              {isCreating ? 'Skapar...' : mode === 'sync' ? 'Skapa Live-Session' : 'Skapa Läxa'}
            </Button>

            {quiz.status !== 'published' && (
              <Typography variant="caption" className="text-warning-600 text-center block">
                Quizet måste vara publicerat för att skapa en session
              </Typography>
            )}
          </div>

          {onClose && (
            <div className="pt-4 border-t border-neutral-200">
              <Button variant="outline" onClick={onClose} className="w-full">
                Avbryt
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}