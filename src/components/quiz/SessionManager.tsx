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

  // Check for existing active session when component mounts
  useEffect(() => {
    // TODO: Check for existing session via API
    // This would query for any existing 'lobby' or 'live' sessions for this quiz
  }, [quiz.id])

  const handleCreateSession = async () => {
    setIsCreating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('quizId', quiz.id)

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
            <div className="bg-neutral-50 p-4 rounded-md">
              <Typography variant="body2" className="font-medium mb-2">
                Så här fungerar det:
              </Typography>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Du får en unik 6-teckens kod och QR-kod</li>
                <li>• Elever kan gå med via kod eller genom att skanna QR-koden</li>
                <li>• Du ser alla som går med i realtid</li>
                <li>• Du bestämmer när quizet startar och slutar</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateSession}
              disabled={isCreating || quiz.status !== 'published'}
              className="w-full gap-2"
            >
              <Play className="w-4 h-4" />
              {isCreating ? 'Skapar session...' : 'Skapa Session'}
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