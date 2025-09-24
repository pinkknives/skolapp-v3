'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Card } from '@/components/ui/Card'
import { CheckCircle, Lock, Clock } from 'lucide-react'
import { liveSession } from '@/locales/sv/quiz'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Question {
  id: string
  type: 'multiple-choice' | 'free-text'
  title: string
  points: number
  options?: Array<{
    id: string
    text: string
  }>
}

interface SessionState {
  id: string
  status: string
  mode: string
  currentIndex: number
  allowResponses: boolean
  quiz: {
    title: string
    questions: Question[]
  }
  participant: {
    id: string
    displayName: string
  } | null
}

export default function PlaySessionPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  
  const supabaseRef = useRef(supabaseBrowser())
  const channelRef = useRef<RealtimeChannel | null>(null)

  const checkExistingAnswer = async (sessionId: string, questionId: string, userId?: string) => {
    try {
      const { data: existingAnswer } = await supabaseRef.current
        .from('session_answers')
        .select('id')
        .eq('session_id', sessionId)
        .eq('question_id', questionId)
        .eq('student_profile_id', userId || null)
        .single()

      setHasAnswered(!!existingAnswer)
    } catch (_) {
      // No existing answer found
      setHasAnswered(false)
    }
  }

  const setupRealtimeSubscription = (sessionId: string) => {
    const supabase = supabaseRef.current
    const channel = supabase.channel(`session:${sessionId}`)

    channel
      .on('broadcast', { event: 'active_question_changed' }, (payload) => {
        setSessionState(prev => prev ? {
          ...prev,
          currentIndex: payload.payload.questionIndex,
          allowResponses: payload.payload.allowResponses
        } : null)
        setCurrentAnswer('')
        setHasAnswered(false)
        setError('')
      })
      .on('broadcast', { event: 'locked_state_changed' }, (payload) => {
        setSessionState(prev => prev ? {
          ...prev,
          allowResponses: payload.payload.allowResponses
        } : null)
      })
      .on('broadcast', { event: 'session_ended' }, () => {
        setSessionState(prev => prev ? {
          ...prev,
          status: 'ended',
          allowResponses: false
        } : null)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected')
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected')
        }
      })

    channelRef.current = channel
  }

  const initializeSession = useCallback(async () => {
    try {
      const supabase = supabaseRef.current
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Find session by code
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          status,
          mode,
          current_index,
          allow_responses,
          quizzes!inner(title, questions)
        `)
        .eq('code', code.toUpperCase())
        .single()

      if (sessionError || !sessionData) {
        setError(liveSession.errors.sessionNotFound)
        return
      }

      if (sessionData.status === 'ended') {
        setError(liveSession.errors.sessionEnded)
        return
      }

      // Get participant info
      const { data: participant } = await supabase
        .from('session_participants')
        .select('id, display_name')
        .eq('session_id', sessionData.id)
        .or(user ? `student_id.eq.${user.id},student_profile_id.eq.${user.id}` : 'student_id.is.null')
        .single()

      if (!participant) {
        router.push(`/join/session/${code}`)
        return
      }

      const quiz = Array.isArray(sessionData.quizzes) ? sessionData.quizzes[0] : sessionData.quizzes

      setSessionState({
        id: sessionData.id,
        status: sessionData.status,
        mode: sessionData.mode,
        currentIndex: sessionData.current_index || 0,
        allowResponses: sessionData.allow_responses || false,
        quiz: {
          title: quiz?.title || '',
          questions: quiz?.questions || []
        },
        participant: {
          id: participant.id,
          displayName: participant.display_name
        }
      })

      // Check if already answered current question
      if (sessionData.mode === 'sync' && sessionData.current_index !== null) {
        const currentQuestion = quiz?.questions?.[sessionData.current_index]
        if (currentQuestion) {
          await checkExistingAnswer(sessionData.id, currentQuestion.id, user?.id)
        }
      }

      // Setup realtime subscription
      setupRealtimeSubscription(sessionData.id)
      setConnectionStatus('connected')

    } catch (error) {
      console.error('Error initializing session:', error)
      setError('Ett oväntat fel uppstod')
    }
  }, [code, router])

  useEffect(() => {
    if (code) {
      initializeSession()
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [code, initializeSession])

  useEffect(() => {
    if (code) {
      initializeSession()
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [code, initializeSession])

  const handleAnswerChange = (value: string | string[]) => {
    setCurrentAnswer(value)
    setError('')
  }

  const handleSubmitAnswer = async () => {
    if (!sessionState || !currentAnswer || hasAnswered) return

    const currentQuestion = sessionState.quiz.questions[sessionState.currentIndex]
    if (!currentQuestion) return

    setIsSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabaseRef.current.auth.getUser()

      const response = await fetch(`/api/quiz-sessions/${sessionState.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: currentAnswer,
          userId: user?.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Ett fel uppstod vid inskickning av svar')
        return
      }

      setHasAnswered(true)
      setCurrentAnswer('')

    } catch (error) {
      console.error('Error submitting answer:', error)
      setError('Ett oväntat fel uppstod')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <Typography variant="body1">Laddar session...</Typography>
        </div>
      </div>
    )
  }

  if (sessionState.status === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <Typography variant="h2" className="mb-2">
              {liveSession.student.play.ended}
            </Typography>
            <Typography variant="body1" className="text-neutral-600 mb-4">
              Tack för ditt deltagande!
            </Typography>
            <Button 
              onClick={() => router.push('/')}
              variant="primary"
            >
              Tillbaka till startsidan
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentQuestion = sessionState.quiz.questions[sessionState.currentIndex]
  const isWaiting = sessionState.mode === 'sync' && (!currentQuestion || sessionState.status === 'lobby')

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="h2">{sessionState.quiz.title}</Typography>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <Typography variant="caption" className="text-neutral-600">
                {connectionStatus === 'connected' ? 'Ansluten' : 'Frånkopplad'}
              </Typography>
            </div>
          </div>
          
          {sessionState.mode === 'sync' && currentQuestion && (
            <Typography variant="body2" className="text-neutral-600">
              Fråga {sessionState.currentIndex + 1} av {sessionState.quiz.questions.length}
            </Typography>
          )}
        </div>

        <Card>
          <div className="p-6">
            {isWaiting ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <Typography variant="h3" className="mb-2">
                  {liveSession.student.play.waiting}
                </Typography>
                <Typography variant="body1" className="text-neutral-600">
                  Väntar på att läraren ska starta sessionen...
                </Typography>
              </div>
            ) : !currentQuestion ? (
              <div className="text-center py-12">
                <Typography variant="h3" className="mb-2">
                  Ingen aktiv fråga
                </Typography>
                <Typography variant="body1" className="text-neutral-600">
                  Väntar på nästa fråga...
                </Typography>
              </div>
            ) : (
              <div>
                <Typography variant="h3" className="mb-6">
                  {currentQuestion.title}
                </Typography>

                {!sessionState.allowResponses && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                    <Lock className="w-5 h-5 text-yellow-600" />
                    <Typography variant="body2" className="text-yellow-800">
                      {liveSession.student.play.locked}
                    </Typography>
                  </div>
                )}

                {hasAnswered && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <Typography variant="body2" className="text-green-800">
                      {liveSession.student.answer.submitted}
                    </Typography>
                  </div>
                )}

                {/* Question Content */}
                <div className="space-y-4">
                  {currentQuestion.type === 'multiple-choice' ? (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            currentAnswer === option.id
                              ? 'border-primary-300 bg-primary-50'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={option.id}
                            checked={currentAnswer === option.id}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            disabled={!sessionState.allowResponses || hasAnswered}
                            className="mr-3"
                          />
                          <Typography variant="body1">{option.text}</Typography>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={currentAnswer as string}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        disabled={!sessionState.allowResponses || hasAnswered}
                        placeholder="Skriv ditt svar här..."
                        rows={4}
                        className="w-full p-3 border border-neutral-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Typography variant="caption" className="text-red-800">
                        {error}
                      </Typography>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer || !sessionState.allowResponses || hasAnswered || isSubmitting}
                    loading={isSubmitting}
                    variant="primary"
                    className="w-full"
                  >
                    {hasAnswered 
                      ? liveSession.student.answer.submitted
                      : liveSession.student.answer.submit
                    }
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}