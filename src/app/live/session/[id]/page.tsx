'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Clock, Users, CheckCircle, AlertCircle, Trophy, Loader2 } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'
import type { LiveQuizSession, Question } from '@/types/quiz'

interface SessionState {
  session: LiveQuizSession
  quiz: {
    id: string
    title: string
    questions: Question[]
  }
  currentQuestion?: Question
  participantCount: number
  hasAnswered: boolean
  timeRemaining?: number
  userAnswer?: string
  isCorrect?: boolean
  showResults: boolean
}

export default function LiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const supabase = supabaseBrowser()
  
  const [state, setState] = useState<SessionState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  // no channel state needed

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        router.push('/auth/login')
        return
      }
    }
    
    getUser()
  }, [supabase, router])

  // Initialize session
  const initializeSession = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Get session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError || !sessionData) {
        setError('Session hittades inte')
        return
      }

      // Get quiz details
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, questions')
        .eq('id', sessionData.quiz_id)
        .single()

      if (quizError || !quiz) {
        setError('Quiz hittades inte')
        return
      }

      // Verify user is participant
      const { data: participant, error: participantError } = await supabase
        .from('quiz_session_participants')
        .select('user_id, role')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (participantError || !participant) {
        setError('Du är inte deltagare i denna session')
        return
      }

      // Get participant count
      const { count: participantCount } = await supabase
        .from('quiz_session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('role', 'student')

      // Get current question if session is active
      let currentQuestion: Question | undefined
      let hasAnswered = false
      let isCorrect: boolean | undefined
      let userAnswer: string | undefined

      if (sessionData.status === 'ACTIVE' && quiz.questions[sessionData.current_index]) {
        currentQuestion = quiz.questions[sessionData.current_index]
        
        // Check if user has already answered current question
        if (currentQuestion) {
          const { data: existingAnswer } = await supabase
            .from('quiz_answers')
            .select('answer, is_correct')
            .eq('session_id', sessionId)
            .eq('question_id', currentQuestion.id)
            .eq('user_id', user.id)
            .single()

          if (existingAnswer) {
            hasAnswered = true
            userAnswer = existingAnswer.answer
            isCorrect = existingAnswer.is_correct
          }
        }
      }

      setState({
        session: {
          id: sessionData.id,
          orgId: sessionData.org_id,
          classId: sessionData.class_id,
          quizId: sessionData.quiz_id,
          pin: sessionData.pin,
          status: sessionData.status,
          currentIndex: sessionData.current_index,
          settings: sessionData.settings || {},
          createdBy: sessionData.created_by,
          startedAt: sessionData.started_at ? new Date(sessionData.started_at) : undefined,
          endedAt: sessionData.ended_at ? new Date(sessionData.ended_at) : undefined,
          createdAt: new Date(sessionData.created_at)
        },
        quiz,
        currentQuestion,
        participantCount: participantCount || 0,
        hasAnswered,
        userAnswer,
        isCorrect,
        showResults: sessionData.status === 'ENDED'
      })

    } catch (error) {
      console.error('Error initializing session:', error)
      setError('Ett fel uppstod när sessionen skulle laddas')
    } finally {
      setIsLoading(false)
    }
  }, [user, sessionId, supabase])

  // Setup real-time subscription
  const sessionStateId = state?.session.id
  useEffect(() => {
    if (!user || !sessionStateId) return

    const channel = supabase.channel(`live:session:${sessionId}`)

    channel
      .on('broadcast', { event: 'session:start' }, (_payload) => {
        setState(prev => prev ? {
          ...prev,
          session: { ...prev.session, status: 'ACTIVE' }
        } : null)
      })
      .on('broadcast', { event: 'question:show' }, (payload) => {
        setState(prev => {
          if (!prev) return prev
          const idx = payload.payload.questionIndex
          if (!prev.quiz.questions[idx]) return prev
          return {
            ...prev,
            session: { ...prev.session, currentIndex: idx },
            currentQuestion: prev.quiz.questions[idx],
            hasAnswered: false,
            userAnswer: undefined,
            isCorrect: undefined,
            timeRemaining: payload.payload.timeLimit
          }
        })
        setSelectedAnswer('')
      })
      .on('broadcast', { event: 'session:end' }, (_payload) => {
        setState(prev => prev ? {
          ...prev,
          session: { ...prev.session, status: 'ENDED' },
          showResults: true
        } : null)
      })
      .on('broadcast', { event: 'participant_joined' }, (payload) => {
        setState(prev => prev ? {
          ...prev,
          participantCount: payload.payload.participantCount
        } : null)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, sessionStateId, sessionId, supabase])

  // Timer effect
  useEffect(() => {
    if (!state?.timeRemaining || state.hasAnswered || state.session.status !== 'ACTIVE') return

    const timer = setInterval(() => {
      setState(prev => {
        if (!prev || !prev.timeRemaining) return prev
        const newTime = prev.timeRemaining - 1
        if (newTime <= 0) {
          return { ...prev, timeRemaining: 0 }
        }
        return { ...prev, timeRemaining: newTime }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state?.timeRemaining, state?.hasAnswered, state?.session.status])

  // Initialize when user is available
  useEffect(() => {
    if (user) {
      initializeSession()
    }
  }, [user, initializeSession])

  const handleAnswerSubmit = async () => {
    if (!state?.currentQuestion || !selectedAnswer || !user) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: state.currentQuestion.id,
          answer: selectedAnswer,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Kunde inte skicka svaret')
        return
      }

      setState(prev => prev ? {
        ...prev,
        hasAnswered: true,
        userAnswer: result.answer.answer,
        isCorrect: result.answer.isCorrect
      } : null)

    } catch (error) {
      console.error('Error submitting answer:', error)
      setError('Ett fel uppstod när svaret skulle skickas')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <Typography variant="body1">Laddar session...</Typography>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="w-8 h-8 text-error-600 mx-auto mb-4" />
          <Typography variant="h6" className="mb-2">Ett fel uppstod</Typography>
          <Typography variant="body2" className="text-neutral-600 mb-4">
            {error}
          </Typography>
          <Button onClick={() => router.push('/live/join')} variant="primary">
            Tillbaka till start
          </Button>
        </Card>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography variant="body1">Laddar...</Typography>
      </div>
    )
  }

  // Lobby state
  if (state.session.status === 'LOBBY') {
    return (
  <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 dark:bg-neutral-950">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <Typography variant="h5" className="mb-2">
            {state.quiz.title}
          </Typography>
          <Typography variant="body2" className="text-neutral-600 mb-4">
            Väntar på att läraren startar quizet...
          </Typography>
          <div className="bg-neutral-100 rounded-lg p-4 mb-4 dark:bg-neutral-900">
            <Typography variant="body2" className="font-medium mb-1">
              PIN: {state.session.pin}
            </Typography>
            <Typography variant="caption" className="text-neutral-600">
              {state.participantCount} deltagare online
            </Typography>
          </div>
          <Typography variant="caption" className="text-neutral-500">
            Quizet startar automatiskt när läraren är redo
          </Typography>
        </Card>
      </div>
    )
  }

  // Active question state
  if (state.session.status === 'ACTIVE' && state.currentQuestion) {
    return (
  <div className="min-h-screen bg-neutral-50 p-4 dark:bg-neutral-950">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Typography variant="h6" className="text-neutral-800">
                Fråga {state.session.currentIndex + 1} av {state.quiz.questions.length}
              </Typography>
              <Typography variant="body2" className="text-neutral-600">
                {state.quiz.title}
              </Typography>
            </div>
            {state.timeRemaining !== undefined && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                state.timeRemaining <= 10 ? 'bg-error-100 text-error-700' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
              }`}>
                <Clock className="w-4 h-4" />
                {state.timeRemaining}s
              </div>
            )}
          </div>

          {/* Question */}
          <Card className="p-6 mb-6">
            <Typography variant="h5" className="mb-4">
              {state.currentQuestion.title}
            </Typography>

            {state.currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-3">
                {state.currentQuestion.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => !state.hasAnswered && setSelectedAnswer(option.id)}
                    disabled={state.hasAnswered || state.timeRemaining === 0}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedAnswer === option.id
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    } ${
                      state.hasAnswered || state.timeRemaining === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                  >
                    <Typography variant="body1">{option.text}</Typography>
                  </button>
                ))}
              </div>
            )}

            {state.currentQuestion.type === 'free-text' && (
              <div>
                <textarea
                  value={selectedAnswer}
                  onChange={(e) => !state.hasAnswered && setSelectedAnswer(e.target.value)}
                  disabled={state.hasAnswered || state.timeRemaining === 0}
                  placeholder="Skriv ditt svar här..."
                  className="w-full p-3 border border-neutral-200 rounded-lg resize-none"
                  rows={3}
                />
              </div>
            )}
          </Card>

          {/* Answer status */}
          {state.hasAnswered && (
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <Typography variant="body2" className="text-success-700">
                  Svar inskickat! Väntar på nästa fråga...
                </Typography>
              </div>
              {state.isCorrect !== undefined && (
                <Typography variant="body2" className={`mt-2 ${
                  state.isCorrect ? 'text-success-700' : 'text-error-700'
                }`}>
                  {state.isCorrect ? '✓ Rätt svar!' : '✗ Fel svar'}
                </Typography>
              )}
            </Card>
          )}

          {/* Submit button */}
          {!state.hasAnswered && selectedAnswer && state.timeRemaining !== 0 && (
            <Button
              onClick={handleAnswerSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center gap-2"
              variant="primary"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Skickar svar...
                </>
              ) : (
                'Skicka svar'
              )}
            </Button>
          )}

          {error && (
            <div className="mt-4 text-center text-error-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Results state
  if (state.showResults) {
    return (
  <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 dark:bg-neutral-950">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mx-auto mb-4">
            <Trophy className="w-6 h-6 text-success-600" />
          </div>
          <Typography variant="h5" className="mb-2">
            Quiz avslutat!
          </Typography>
          <Typography variant="body2" className="text-neutral-600 mb-4">
            Bra jobbat! Resultaten kommer att visas av läraren.
          </Typography>
          <Button onClick={() => router.push('/dashboard')} variant="primary">
            Tillbaka till dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // Paused state
  return (
  <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 dark:bg-neutral-950">
      <Card className="w-full max-w-md p-6 text-center">
        <Typography variant="h6" className="mb-2">Quiz pausat</Typography>
        <Typography variant="body2" className="text-neutral-600">
          Väntar på att läraren fortsätter...
        </Typography>
      </Card>
    </div>
  )
}