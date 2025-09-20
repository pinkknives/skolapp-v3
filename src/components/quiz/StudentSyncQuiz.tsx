'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { QuizSession, Quiz } from '@/types/quiz'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { 
  Clock, 
  CheckCircle, 
  Circle, 
  Pause, 
  AlertCircle,
  Eye,
  Loader2
} from 'lucide-react'

interface StudentSyncQuizProps {
  session: QuizSession
  quiz: Quiz
  userId: string
  displayName: string
}

interface StudentAttempt {
  questionIndex: number
  answer: unknown
  isCorrect?: boolean
  answeredAt: Date
}

export function StudentSyncQuiz({ session, quiz, userId, displayName }: StudentSyncQuizProps) {
  const [currentAnswer, setCurrentAnswer] = useState<string[]>([]) // For MC questions
  const [freeTextAnswer, setFreeTextAnswer] = useState('') // For free-text questions
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionState, setSessionState] = useState(session.state)
  const [currentIndex, setCurrentIndex] = useState(session.currentIndex)
  const [isRevealed, setIsRevealed] = useState(false)
  const [myAttempt, setMyAttempt] = useState<StudentAttempt | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const currentQuestion = quiz.questions[currentIndex]

  // Real-time subscription for session updates
  useEffect(() => {
    const supabase = supabaseBrowser()

    const channel = supabase
      .channel(`student-sync-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          console.log('Session update for student:', payload)
          if (payload.new) {
            setSessionState(payload.new.state)
            
            // If question changed, reset answer state
            if (payload.new.current_index !== currentIndex) {
              setCurrentIndex(payload.new.current_index)
              setCurrentAnswer([])
              setFreeTextAnswer('')
              setHasAnswered(false)
              setIsRevealed(false)
              setMyAttempt(null)
              checkExistingAttempt(payload.new.current_index)
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_events',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          console.log('Session event for student:', payload)
          if (payload.new && (payload.new as { type?: string }).type === 'reveal') {
            setIsRevealed(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session.id, currentIndex, checkExistingAttempt])

  // Timer effect for question time limits
  useEffect(() => {
    if (!session.questionWindowStartedAt || !session.questionWindowSeconds) {
      setTimeRemaining(null)
      return
    }

    const startTime = new Date(session.questionWindowStartedAt).getTime()
    const duration = session.questionWindowSeconds * 1000
    
    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const remaining = Math.max(0, duration - elapsed)
      
      setTimeRemaining(Math.ceil(remaining / 1000))
      
      if (remaining <= 0) {
        // Time's up - could auto-submit or disable further changes
        return
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [session.questionWindowStartedAt, session.questionWindowSeconds])

  // Check if student has already answered current question
  const checkExistingAttempt = React.useCallback(async (questionIndex: number) => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/summary`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.summary) {
          const myResult = data.summary.participantResults.find(
            (p: { user_id: string }) => p.user_id === userId
          )
          
          if (myResult) {
            const attempt = myResult.attempts.find(
              (a: { question_index: number }) => a.question_index === questionIndex
            )
            
            if (attempt) {
              setMyAttempt({
                questionIndex: attempt.question_index,
                answer: attempt.answer,
                isCorrect: attempt.is_correct,
                answeredAt: new Date(attempt.answered_at)
              })
              setHasAnswered(true)
              
              // Restore answer state for display
              if (Array.isArray(attempt.answer)) {
                setCurrentAnswer(attempt.answer)
              } else {
                setFreeTextAnswer(attempt.answer)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing attempt:', error)
    }
  }, [session.id, userId])

  useEffect(() => {
    checkExistingAttempt(currentIndex)
  }, [currentIndex, checkExistingAttempt])

  const handleMultipleChoiceAnswer = (optionId: string) => {
    if (hasAnswered || sessionState !== 'running' || isRevealed) return

    // For single-select questions, replace the answer
    // For multi-select, toggle the option (this would need to be determined by question config)
    setCurrentAnswer([optionId])
  }

  const handleSubmitAnswer = async () => {
    if (hasAnswered || sessionState !== 'running') return

    const answer = currentQuestion.type === 'multiple-choice' ? currentAnswer : freeTextAnswer
    
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      setError('Välj ett svar innan du skickar')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${session.id}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: Array.isArray(answer) ? JSON.stringify(answer) : answer,
          userId: userId
        }),
      })

      const result = await response.json()

      if (result.success) {
        setHasAnswered(true)
        setMyAttempt({
          questionIndex: currentIndex,
          answer: answer,
          isCorrect: result.attempt?.isCorrect,
          answeredAt: new Date()
        })
      } else {
        setError(result.error || 'Ett fel uppstod vid inskickning av svar')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setError('Ett oväntat fel inträffade')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSessionStatusMessage = () => {
    switch (sessionState) {
      case 'idle':
        return 'Väntar på att quizet ska starta...'
      case 'paused':
        return 'Quiz pausat - väntar på att fortsätta...'
      case 'ended':
        return 'Quiz avslutat'
      default:
        return null
    }
  }

  const renderQuestion = () => {
    if (!currentQuestion) {
      return (
        <div className="text-center py-8">
          <Typography variant="body1" className="text-neutral-600">
            Ingen fråga tillgänglig
          </Typography>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="h5">
            Fråga {currentIndex + 1} av {quiz.questions.length}
          </Typography>
          {timeRemaining !== null && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              timeRemaining <= 10 ? 'bg-error-100 text-error-700' : 'bg-neutral-100 text-neutral-700'
            }`}>
              <Clock className="w-4 h-4" />
              {timeRemaining}s
            </div>
          )}
        </div>

        <Typography variant="h6" className="mb-6">
          {currentQuestion.title}
        </Typography>

        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer.includes(option.id)
              const isCorrect = option.isCorrect
              const showCorrect = isRevealed && isCorrect
              const showIncorrect = isRevealed && isSelected && !isCorrect
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleMultipleChoiceAnswer(option.id)}
                  disabled={hasAnswered || sessionState !== 'running' || isRevealed}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    showCorrect
                      ? 'border-success-300 bg-success-50'
                      : showIncorrect
                      ? 'border-error-300 bg-error-50'
                      : isSelected
                      ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-neutral-200 hover:border-neutral-300'
                  } ${
                    hasAnswered || sessionState !== 'running' || isRevealed
                      ? 'cursor-not-allowed opacity-75'
                      : 'cursor-pointer hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {showCorrect ? (
                        <CheckCircle className="w-5 h-5 text-success-600" />
                      ) : isSelected ? (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Typography variant="body2" className="font-medium">
                          {String.fromCharCode(65 + index)}.
                        </Typography>
                        <Typography variant="body2">
                          {option.text}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {currentQuestion.type === 'free-text' && (
          <div>
            <textarea
              value={freeTextAnswer}
              onChange={(e) => setFreeTextAnswer(e.target.value)}
              disabled={hasAnswered || sessionState !== 'running' || isRevealed}
              placeholder="Skriv ditt svar här..."
              className="w-full p-3 border border-neutral-300 rounded-md resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
              rows={4}
            />
          </div>
        )}

        {/* Answer status and feedback */}
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
              <Typography variant="body2" className="text-error-700">
                {error}
              </Typography>
            </div>
          )}

          {hasAnswered && (
            <div className="flex items-center gap-2 p-3 bg-success-50 border border-success-200 rounded-md">
              <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0" />
              <Typography variant="body2" className="text-success-700">
                Svar inskickat! Väntar på nästa fråga...
              </Typography>
            </div>
          )}

          {isRevealed && myAttempt && (
            <div className={`p-3 border rounded-md ${
              myAttempt.isCorrect 
                ? 'bg-success-50 border-success-200' 
                : 'bg-error-50 border-error-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4" />
                <Typography variant="body2" className="font-medium">
                  Resultat:
                </Typography>
              </div>
              <Typography variant="body2" className={
                myAttempt.isCorrect ? 'text-success-700' : 'text-error-700'
              }>
                {myAttempt.isCorrect ? 'Rätt svar!' : 'Fel svar'}
              </Typography>
            </div>
          )}

          {!hasAnswered && sessionState === 'running' && !isRevealed && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || (!currentAnswer.length && !freeTextAnswer.trim())}
              className="w-full gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Skickar svar...' : 'Skicka svar'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  const statusMessage = getSessionStatusMessage()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Session Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Quiz</span>
            <span className="text-sm font-normal text-neutral-600">
              {displayName}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Status Messages */}
      {statusMessage && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 py-8">
              {sessionState === 'paused' && <Pause className="w-5 h-5 text-neutral-600" />}
              <Typography variant="body1" className="text-neutral-600 text-center">
                {statusMessage}
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Content */}
      {sessionState === 'running' && (
        <Card>
          <CardContent className="pt-6">
            {renderQuestion()}
          </CardContent>
        </Card>
      )}

      {/* Quiz Complete */}
      {sessionState === 'ended' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-success-600 mx-auto mb-4" />
              <Typography variant="h6" className="mb-2">
                Quiz avslutat!
              </Typography>
              <Typography variant="body2" className="text-neutral-600">
                Tack för ditt deltagande. Läraren kommer att dela resultaten.
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}