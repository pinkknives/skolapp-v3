'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Card } from '@/components/ui/Card'
import { 
  Play, 
  SkipForward, 
  Lock, 
  Unlock, 
  Users, 
  BarChart3,
  Square,
  CheckCircle 
} from 'lucide-react'
import { liveSession } from '@/locales/sv/quiz'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface SessionData {
  id: string
  status: string
  mode: string
  currentIndex: number
  allowResponses: boolean
  quiz: {
    title: string
    questions: Array<{
      id: string
      title: string
      type: string
      options?: Array<{ id: string; text: string; isCorrect: boolean }>
    }>
  }
  class: {
    name: string
  } | null
}

interface SessionSummary {
  participants: Array<{
    id: string
    displayName: string
    status: string
    joinedAt: string
  }>
  statistics: {
    totalParticipants: number
    questionsStats: Array<{
      questionId: string
      questionIndex: number
      title: string
      totalResponses: number
      correctResponses: number
      correctRate: number
      optionDistribution?: Record<string, number>
    }>
  }
  currentQuestion: {
    id: string
    title: string
    type: string
    options?: Array<{ id: string; text: string; isCorrect: boolean }>
  } | null
}

export default function TeacherSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const [session, setSession] = useState<SessionData | null>(null)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [error, setError] = useState('')
  
  const supabaseRef = useRef(supabaseBrowser())
  const channelRef = useRef<RealtimeChannel | null>(null)

  const initializeSession = useCallback(async () => {
    try {
      const supabase = supabaseRef.current
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          status,
          mode,
          current_index,
          allow_responses,
          quizzes!inner(title, questions),
          classes(name)
        `)
        .eq('id', sessionId)
        .single()

      if (sessionError || !sessionData) {
        setError('Session hittades inte')
        return
      }

      const quiz = Array.isArray(sessionData.quizzes) ? sessionData.quizzes[0] : sessionData.quizzes
      const classData = Array.isArray(sessionData.classes) ? sessionData.classes[0] : sessionData.classes

      setSession({
        id: sessionData.id,
        status: sessionData.status,
        mode: sessionData.mode,
        currentIndex: sessionData.current_index || 0,
        allowResponses: sessionData.allow_responses || false,
        quiz: {
          title: quiz?.title || '',
          questions: quiz?.questions || []
        },
        class: classData ? {
          name: classData.name
        } : null
      })

    } catch (error) {
      console.error('Error fetching session:', error)
      setError('Ett oväntat fel uppstod')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz-sessions/${sessionId}/summary`)
      const result = await response.json()

      if (result.success) {
        setSummary(result)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }, [sessionId])

  const setupRealtimeSubscription = useCallback(() => {
    const supabase = supabaseRef.current
    const channel = supabase.channel(`session:${sessionId}`)

    channel
      .on('broadcast', { event: 'participant_joined' }, () => {
        fetchSummary()
      })
      .on('broadcast', { event: 'responses_updated' }, () => {
        fetchSummary()
      })
      .subscribe()

    channelRef.current = channel
  }, [sessionId, fetchSummary])

  useEffect(() => {
    if (sessionId) {
      initializeSession()
      fetchSummary()
      setupRealtimeSubscription()
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [sessionId, initializeSession, fetchSummary, setupRealtimeSubscription])

  const handleSessionAction = async (action: string, _payload?: unknown) => {
    setIsActionLoading(action)
    setError('')

    try {
      let endpoint = ''
      const method = 'POST'
      let body: Record<string, unknown> | null = null

      switch (action) {
        case 'start':
          // Start session by updating status
          const { error: startError } = await supabaseRef.current
            .from('sessions')
            .update({ status: 'live', allow_responses: true })
            .eq('id', sessionId)
          
          if (startError) throw startError
          
          setSession(prev => prev ? { ...prev, status: 'live', allowResponses: true } : null)
          return

        case 'next':
          endpoint = `/api/quiz-sessions/${sessionId}/next`
          break

        case 'lock':
          endpoint = `/api/quiz-sessions/${sessionId}/lock`
          body = { allow: false }
          break

        case 'unlock':
          endpoint = `/api/quiz-sessions/${sessionId}/lock`
          body = { allow: true }
          break

        case 'end':
          endpoint = `/api/quiz-sessions/${sessionId}/end`
          break
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Ett fel uppstod')
        return
      }

      // Update local state based on action
      if (action === 'next' && result.session) {
        setSession(prev => prev ? {
          ...prev,
          currentIndex: result.session.currentIndex,
          allowResponses: result.session.allowResponses
        } : null)
      } else if ((action === 'lock' || action === 'unlock') && result.session) {
        setSession(prev => prev ? {
          ...prev,
          allowResponses: result.session.allowResponses
        } : null)
      } else if (action === 'end') {
        setSession(prev => prev ? { ...prev, status: 'ended' } : null)
        setShowEndConfirm(false)
      }

      fetchSummary()

    } catch (error) {
      console.error(`Error ${action}:`, error)
      setError('Ett oväntat fel uppstod')
    } finally {
      setIsActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <Typography variant="body1">Laddar session...</Typography>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <Typography variant="h2" className="mb-2">Session hittades inte</Typography>
            <Typography variant="body1" className="text-neutral-600 mb-4">
              {error || 'Sessionen kunde inte laddas'}
            </Typography>
            <Button onClick={() => router.push('/teacher')} variant="primary">
              Tillbaka
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentQuestion = session.quiz.questions[session.currentIndex]
  const currentQuestionStats = summary?.statistics.questionsStats.find(
    qs => qs.questionIndex === session.currentIndex
  )

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="h1">
              {liveSession.teacher.title}
            </Typography>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.status === 'live' 
                  ? 'bg-green-100 text-green-800'
                  : session.status === 'ended'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {session.status === 'live' ? liveSession.teacher.status.live :
                 session.status === 'ended' ? liveSession.teacher.status.ended :
                 'Lobby'}
              </div>
            </div>
          </div>
          
          <Typography variant="body1" className="text-neutral-600">
            {session.quiz.title}
            {session.class && ` • ${session.class.name}`}
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Controls */}
            <Card>
              <div className="p-6">
                <Typography variant="h3" className="mb-4">
                  Sessionskontroller
                </Typography>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {session.status === 'lobby' ? (
                    <Button
                      onClick={() => handleSessionAction('start')}
                      loading={isActionLoading === 'start'}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Starta
                    </Button>
                  ) : session.status === 'live' ? (
                    <>
                      <Button
                        onClick={() => handleSessionAction('next')}
                        loading={isActionLoading === 'next'}
                        disabled={session.currentIndex >= session.quiz.questions.length - 1}
                        variant="primary"
                        className="flex items-center gap-2"
                      >
                        <SkipForward className="w-4 h-4" />
                        {liveSession.teacher.controls.next}
                      </Button>

                      <Button
                        onClick={() => handleSessionAction(session.allowResponses ? 'lock' : 'unlock')}
                        loading={isActionLoading === 'lock' || isActionLoading === 'unlock'}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        {session.allowResponses ? (
                          <>
                            <Lock className="w-4 h-4" />
                            {liveSession.teacher.controls.lock}
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            {liveSession.teacher.controls.unlock}
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => setShowEndConfirm(true)}
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Square className="w-4 h-4" />
                        {liveSession.teacher.controls.end}
                      </Button>
                    </>
                  ) : null}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Typography variant="caption" className="text-red-800">
                      {error}
                    </Typography>
                  </div>
                )}
              </div>
            </Card>

            {/* Current Question */}
            {currentQuestion && (
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h3">
                      {liveSession.teacher.question.title}
                    </Typography>
                    <Typography variant="body2" className="text-neutral-600">
                      {liveSession.teacher.question.progress
                        .replace('{current}', (session.currentIndex + 1).toString())
                        .replace('{total}', session.quiz.questions.length.toString())
                      }
                    </Typography>
                  </div>

                  <Typography variant="body1" className="mb-4">
                    {currentQuestion.title}
                  </Typography>

                  {currentQuestion.type === 'multiple-choice' && currentQuestionStats?.optionDistribution && (
                    <div className="space-y-2">
                      <Typography variant="body2" className="font-medium">
                        Svarfördelning:
                      </Typography>
                      {currentQuestion.options?.map((option) => {
                        const count = currentQuestionStats.optionDistribution?.[option.id] || 0
                        const percentage = currentQuestionStats.totalResponses > 0 
                          ? Math.round((count / currentQuestionStats.totalResponses) * 100)
                          : 0

                        return (
                          <div key={option.id} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <Typography variant="caption" className={`${
                                  option.isCorrect ? 'text-green-700 font-medium' : 'text-neutral-700'
                                }`}>
                                  {option.text}
                                  {option.isCorrect && <CheckCircle className="w-4 h-4 ml-1 inline" />}
                                </Typography>
                                <Typography variant="caption" className="text-neutral-500">
                                  {count} ({percentage}%)
                                </Typography>
                              </div>
                              <div className="w-full bg-neutral-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    option.isCorrect ? 'bg-green-500' : 'bg-blue-500'
                                  } ${
                                    percentage === 0 ? 'w-0' :
                                    percentage <= 5 ? 'w-1' :
                                    percentage <= 10 ? 'w-2' :
                                    percentage <= 15 ? 'w-3' :
                                    percentage <= 20 ? 'w-4' :
                                    percentage <= 25 ? 'w-5' :
                                    percentage <= 30 ? 'w-6' :
                                    percentage <= 35 ? 'w-7' :
                                    percentage <= 40 ? 'w-8' :
                                    percentage <= 45 ? 'w-9' :
                                    percentage <= 50 ? 'w-10' :
                                    percentage <= 55 ? 'w-11' :
                                    percentage <= 60 ? 'w-12' :
                                    percentage <= 65 ? 'w-16' :
                                    percentage <= 70 ? 'w-20' :
                                    percentage <= 75 ? 'w-24' :
                                    percentage <= 80 ? 'w-32' :
                                    percentage <= 85 ? 'w-40' :
                                    percentage <= 90 ? 'w-48' :
                                    percentage <= 95 ? 'w-56' : 'w-full'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {currentQuestionStats && (
                    <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                      <Typography variant="caption" className="text-neutral-600">
                        {liveSession.teacher.question.responses
                          .replace('{count}', currentQuestionStats.totalResponses.toString())
                        } • {currentQuestionStats.correctRate}% rätt
                      </Typography>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary-600" />
                  <Typography variant="h3">
                    {liveSession.teacher.participants.title}
                  </Typography>
                </div>

                <Typography variant="body2" className="text-neutral-600 mb-4">
                  {liveSession.teacher.participants.count
                    .replace('{count}', (summary?.participants.length || 0).toString())
                  }
                </Typography>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {summary?.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <Typography variant="caption" className="font-medium">
                        {participant.displayName}
                      </Typography>
                      <div className={`w-2 h-2 rounded-full ${
                        participant.status === 'active' ? 'bg-green-500' : 'bg-neutral-300'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Overall Statistics */}
            {summary?.statistics && (
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <Typography variant="h3">Statistik</Typography>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Typography variant="caption" className="text-neutral-600">
                        Totalt deltagare
                      </Typography>
                      <Typography variant="caption" className="font-medium">
                        {summary.statistics.totalParticipants}
                      </Typography>
                    </div>
                    
                    <div className="flex justify-between">
                      <Typography variant="caption" className="text-neutral-600">
                        Genomsnittlig svarsfrekvens
                      </Typography>
                      <Typography variant="caption" className="font-medium">
                        {summary.statistics.questionsStats.length > 0
                          ? Math.round(
                              summary.statistics.questionsStats.reduce((acc, qs) => acc + qs.correctRate, 0) / 
                              summary.statistics.questionsStats.length
                            )
                          : 0
                        }%
                      </Typography>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* End Session Confirmation */}
        {showEndConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <Typography variant="h3" className="mb-2">
                  {liveSession.teacher.confirm.end.title}
                </Typography>
                <Typography variant="body1" className="text-neutral-600 mb-6">
                  {liveSession.teacher.confirm.end.message}
                </Typography>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowEndConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    {liveSession.teacher.confirm.end.cancel}
                  </Button>
                  <Button
                    onClick={() => handleSessionAction('end')}
                    loading={isActionLoading === 'end'}
                    variant="primary"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {liveSession.teacher.confirm.end.confirm}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}