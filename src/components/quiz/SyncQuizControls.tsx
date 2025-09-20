'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { QuizSession, SessionParticipant, Quiz } from '@/types/quiz'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { 
  Play, 
  Pause, 
  SkipForward, 
  Eye, 
  Square, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface SyncQuizControlsProps {
  session: QuizSession & { participants: SessionParticipant[] }
  quiz: Quiz
  onSessionUpdate?: (session: QuizSession) => void
}

interface AttemptStats {
  totalAnswered: number
  totalParticipants: number
  answerDistribution: Record<string, number>
}

export function SyncQuizControls({ session, quiz, onSessionUpdate }: SyncQuizControlsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptStats, setAttemptStats] = useState<AttemptStats>({ 
    totalAnswered: 0, 
    totalParticipants: session.participants.length,
    answerDistribution: {} 
  })
  const [isRevealed, setIsRevealed] = useState(false)

  const currentQuestion = quiz.questions[session.currentIndex]
  const isLastQuestion = session.currentIndex >= quiz.questions.length - 1

  // Real-time subscription for session updates
  useEffect(() => {
    const supabase = supabaseBrowser()

    const channel = supabase
      .channel(`sync-session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          console.log('Session update:', payload)
          if (payload.new && onSessionUpdate) {
            const updatedSession = {
              ...session,
              state: payload.new.state,
              currentIndex: payload.new.current_index,
              questionWindowSeconds: payload.new.question_window_seconds,
              questionWindowStartedAt: payload.new.question_window_started_at ? new Date(payload.new.question_window_started_at) : undefined
            }
            onSessionUpdate(updatedSession)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_attempts',
          filter: `session_id=eq.${session.id}`
        },
        () => {
          // Reload attempt stats when new answers come in
          loadAttemptStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, onSessionUpdate, loadAttemptStats])

  // Load current attempt statistics
  const loadAttemptStats = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/summary`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.summary) {
          const currentQuestionStats = data.summary.questionStats.find(
            (q: { questionIndex: number }) => q.questionIndex === session.currentIndex
          )
          
          setAttemptStats({
            totalAnswered: currentQuestionStats?.totalAttempts || 0,
            totalParticipants: session.participants.length,
            answerDistribution: currentQuestionStats?.answerDistribution || {}
          })
        }
      }
    } catch (error) {
      console.error('Error loading attempt stats:', error)
    }
  }, [session.id, session.currentIndex, session.participants.length])

  useEffect(() => {
    loadAttemptStats()
  }, [loadAttemptStats])

  const handleControl = async (action: string, payload?: Record<string, unknown>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${session.id}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Ett fel uppstod')
      } else if (result.session && onSessionUpdate) {
        onSessionUpdate(result.session)
        
        // Reset reveal state when moving to next question
        if (action === 'next') {
          setIsRevealed(false)
        }
      }
    } catch (error) {
      console.error('Control error:', error)
      setError('Ett oväntat fel inträffade')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStart = () => {
    const payload = currentQuestion?.timeLimit ? { questionWindowSeconds: currentQuestion.timeLimit } : {}
    handleControl('start', payload)
  }

  const handlePause = () => handleControl('pause')
  const handleNext = () => {
    const nextIndex = session.currentIndex + 1
    const nextQuestion = quiz.questions[nextIndex]
    const payload = nextQuestion?.timeLimit ? { questionWindowSeconds: nextQuestion.timeLimit } : {}
    handleControl('next', payload)
  }
  
  const handleReveal = () => {
    setIsRevealed(true)
    handleControl('reveal')
  }
  
  const handleEnd = () => handleControl('end')

  const renderQuestion = () => {
    if (!currentQuestion) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Fråga {session.currentIndex + 1} av {quiz.questions.length}
            </CardTitle>
            {currentQuestion.timeLimit && (
              <div className="flex items-center gap-1 text-sm text-neutral-600">
                <Clock className="w-4 h-4" />
                {currentQuestion.timeLimit}s
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            {currentQuestion.title}
          </Typography>
          
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const answerCount = attemptStats.answerDistribution[option.id] || 0
                const percentage = attemptStats.totalAnswered > 0 ? (answerCount / attemptStats.totalAnswered) * 100 : 0
                
                return (
                  <div
                    key={option.id}
                    className={`p-3 border rounded-lg ${
                      isRevealed && option.isCorrect 
                        ? 'border-success-300 bg-success-50' 
                        : 'border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isRevealed && option.isCorrect && (
                          <CheckCircle className="w-4 h-4 text-success-600" />
                        )}
                        <Typography variant="body2">
                          {String.fromCharCode(65 + index)}. {option.text}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-2">
                        <Typography variant="caption" className="text-neutral-600">
                          {answerCount} elever ({percentage.toFixed(0)}%)
                        </Typography>
                        <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 transition-all duration-500"
                            // eslint-disable-next-line no-restricted-syntax
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          <div className="mt-4 flex items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {attemptStats.totalAnswered} av {attemptStats.totalParticipants} har svarat
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderControls = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary-600" />
            Quiz-kontroller
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 rounded-md mb-4">
              <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
              <Typography variant="body2" className="text-error-700">
                {error}
              </Typography>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {session.state === 'idle' && (
              <Button
                onClick={handleStart}
                disabled={isLoading}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Starta Quiz
              </Button>
            )}

            {session.state === 'running' && (
              <>
                <Button
                  onClick={handlePause}
                  disabled={isLoading}
                  variant="outline"
                  className="gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pausa
                </Button>

                <Button
                  onClick={handleReveal}
                  disabled={isLoading || isRevealed}
                  variant="outline"
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Visa facit
                </Button>

                <Button
                  onClick={isLastQuestion ? handleEnd : handleNext}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLastQuestion ? (
                    <>
                      <Square className="w-4 h-4" />
                      Avsluta Quiz
                    </>
                  ) : (
                    <>
                      <SkipForward className="w-4 h-4" />
                      Nästa fråga
                    </>
                  )}
                </Button>
              </>
            )}

            {session.state === 'paused' && (
              <>
                <Button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Fortsätt
                </Button>

                <Button
                  onClick={handleEnd}
                  disabled={isLoading}
                  variant="outline"
                  className="gap-2"
                >
                  <Square className="w-4 h-4" />
                  Avsluta Quiz
                </Button>
              </>
            )}

            {session.state === 'ended' && (
              <Typography variant="body2" className="text-neutral-600">
                Quiz avslutat
              </Typography>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <Typography variant="caption" className="text-neutral-600">
              Status: {session.state === 'idle' ? 'Väntar på start' : 
                      session.state === 'running' ? 'Pågående' : 
                      session.state === 'paused' ? 'Pausad' : 'Avslutad'}
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {renderQuestion()}
      {renderControls()}
    </div>
  )
}