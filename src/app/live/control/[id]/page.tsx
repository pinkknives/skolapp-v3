'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { 
  Play, 
  SkipForward, 
  Users, 
  Copy, 
  Trophy,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import QRCodeLib from 'qrcode'
import type { User } from '@supabase/supabase-js'
import type { LiveQuizSession, LiveQuizParticipant, Question } from '@/types/quiz'
import Image from 'next/image'

interface ControlState {
  session: LiveQuizSession
  quiz: {
    id: string
    title: string
    questions: Question[]
  }
  participants: LiveQuizParticipant[]
  currentQuestion?: Question
  answerStats: {
    totalParticipants: number
    answeredCount: number
    answerDistribution: Record<string, number>
  }
  qrCodeUrl?: string
}

export default function LiveControlPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const supabase = supabaseBrowser()
  
  const [state, setState] = useState<ControlState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // Refs for progress bars to avoid inline styles
  const answerProgressRef = useRef<HTMLDivElement>(null)
  const sessionProgressRef = useRef<HTMLDivElement>(null)

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

      // Verify user is creator or has permission
      if (sessionData.created_by !== user.id) {
        // Check if user has org permission
        const { data: orgMember } = await supabase
          .from('org_members')
          .select('role')
          .eq('org_id', sessionData.org_id)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (!orgMember || !['owner', 'admin'].includes(orgMember.role)) {
          setError('Du har inte behörighet att styra denna session')
          return
        }
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

      // Get participants
      const { data: participants, error: participantError } = await supabase
        .from('quiz_session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: false })

      if (participantError) {
        console.error('Error loading participants:', participantError)
      }

      // Get current question
      let currentQuestion: Question | undefined
      if (sessionData.status === 'ACTIVE' && quiz.questions[sessionData.current_index]) {
        currentQuestion = quiz.questions[sessionData.current_index]
      }

      // Get answer stats for current question
      let answerStats = {
        totalParticipants: 0,
        answeredCount: 0,
        answerDistribution: {}
      }

      if (currentQuestion) {
        const { count: totalParticipants } = await supabase
          .from('quiz_session_participants')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionId)
          .eq('role', 'student')

        const { count: answeredCount } = await supabase
          .from('quiz_answers')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionId)
          .eq('question_id', currentQuestion.id)

        answerStats = {
          totalParticipants: totalParticipants || 0,
          answeredCount: answeredCount || 0,
          answerDistribution: {}
        }
      }

      // Generate QR code
      const joinUrl = `${window.location.origin}/live/join?pin=${sessionData.pin}`
      const qrCodeUrl = await QRCodeLib.toDataURL(joinUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      })

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
        participants: participants?.map(p => ({
          sessionId: p.session_id,
          userId: p.user_id,
          displayName: p.display_name,
          role: p.role,
          joinedAt: new Date(p.joined_at),
          lastSeenAt: new Date(p.last_seen_at)
        })) || [],
        currentQuestion,
        answerStats,
        qrCodeUrl
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
      .on('broadcast', { event: 'participant_joined' }, (_payload) => {
        // Refresh participant list
        initializeSession()
      })
      .on('broadcast', { event: 'answer:submitted' }, (payload) => {
        setState(prev => prev ? {
          ...prev,
          answerStats: {
            ...prev.answerStats,
            answeredCount: payload.payload.answeredCount,
            totalParticipants: payload.payload.totalParticipants
          }
        } : null)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, sessionStateId, sessionId, supabase, initializeSession])

  // Initialize when user is available
  useEffect(() => {
    if (user) {
      initializeSession()
    }
  }, [user, initializeSession])

  // Update answer progress bar
  useEffect(() => {
    if (answerProgressRef.current && state?.answerStats) {
      const percentage = state.answerStats.totalParticipants > 0 
        ? (state.answerStats.answeredCount / state.answerStats.totalParticipants) * 100
        : 0
      answerProgressRef.current.style.setProperty('--progress-width', `${percentage}%`)
    }
  }, [state?.answerStats])

  // Update session progress bar
  useEffect(() => {
    if (sessionProgressRef.current && state?.session && state?.quiz) {
      const percentage = (state.session.status === 'ENDED' 
        ? state.quiz.questions.length 
        : state.session.currentIndex) / state.quiz.questions.length * 100
      sessionProgressRef.current.style.setProperty('--progress-width', `${percentage}%`)
    }
  }, [state?.session, state?.quiz])

  const handleSessionAction = async (action: string) => {
    if (!state) return

    setIsActionLoading(action)
    setError('')

    try {
      let endpoint = ''
      
      switch (action) {
        case 'start':
          endpoint = `/api/live-sessions/${sessionId}/start`
          break
        case 'next':
          endpoint = `/api/live-sessions/${sessionId}/next`
          break
        default:
          return
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Ett fel uppstod')
        return
      }

      // Update local state based on action
      if (action === 'start') {
        setState(prev => prev ? {
          ...prev,
          session: { ...prev.session, status: 'ACTIVE' }
        } : null)
      } else if (action === 'next') {
        if (result.finished) {
          setState(prev => prev ? {
            ...prev,
            session: { ...prev.session, status: 'ENDED' },
            currentQuestion: undefined
          } : null)
        } else {
          setState(prev => prev ? {
            ...prev,
            session: { ...prev.session, currentIndex: result.session.currentIndex },
            currentQuestion: prev.quiz.questions[result.session.currentIndex],
            answerStats: {
              totalParticipants: 0,
              answeredCount: 0,
              answerDistribution: {}
            }
          } : null)
        }
      }

    } catch (error) {
      console.error(`Error ${action}:`, error)
      setError('Ett oväntat fel uppstod')
    } finally {
      setIsActionLoading(null)
    }
  }

  const handleCopyPin = async () => {
    if (!state) return
    
    try {
      await navigator.clipboard.writeText(state.session.pin)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy PIN:', error)
    }
  }

  const handleCopyUrl = async () => {
    if (!state) return
    
    try {
      const joinUrl = `${window.location.origin}/live/join?pin=${state.session.pin}`
      await navigator.clipboard.writeText(joinUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
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
          <Button onClick={() => router.push('/teacher')} variant="primary">
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

  const studentParticipants = state.participants.filter(p => p.role === 'student')

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Typography variant="h4" className="mb-2">
            Live Quiz Kontroll
          </Typography>
          <Typography variant="body1" className="text-neutral-600">
            {state.quiz.title} • Status: {
              state.session.status === 'LOBBY' ? 'Lobby' :
              state.session.status === 'ACTIVE' ? 'Aktiv' :
              state.session.status === 'PAUSED' ? 'Pausad' :
              'Avslutad'
            }
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Session info and controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session controls */}
            <Card className="p-6">
              <Typography variant="h6" className="mb-4">Sessionskontroller</Typography>
              
              <div className="flex flex-wrap gap-3">
                {state.session.status === 'LOBBY' && (
                  <Button
                    onClick={() => handleSessionAction('start')}
                    disabled={studentParticipants.length === 0 || isActionLoading === 'start'}
                    className="flex items-center gap-2"
                    variant="primary"
                  >
                    {isActionLoading === 'start' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Starta Quiz
                  </Button>
                )}
                
                {state.session.status === 'ACTIVE' && (
                  <Button
                    onClick={() => handleSessionAction('next')}
                    disabled={isActionLoading === 'next'}
                    className="flex items-center gap-2"
                    variant="primary"
                  >
                    {isActionLoading === 'next' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SkipForward className="w-4 h-4" />
                    )}
                    {state.session.currentIndex >= state.quiz.questions.length - 1 ? 'Avsluta Quiz' : 'Nästa fråga'}
                  </Button>
                )}
              </div>

              {error && (
                <div className="mt-4 text-error-600 text-sm">
                  {error}
                </div>
              )}
            </Card>

            {/* Current question status */}
            {state.currentQuestion && (
              <Card className="p-6">
                <Typography variant="h6" className="mb-4">
                  Fråga {state.session.currentIndex + 1} av {state.quiz.questions.length}
                </Typography>
                
                <Typography variant="body1" className="mb-4">
                  {state.currentQuestion.title}
                </Typography>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-neutral-100 rounded-lg p-3">
                    <Typography variant="caption" className="text-neutral-600">
                      Har svarat
                    </Typography>
                    <Typography variant="h6">
                      {state.answerStats.answeredCount} / {state.answerStats.totalParticipants}
                    </Typography>
                  </div>
                  <div className="bg-neutral-100 rounded-lg p-3">
                    <Typography variant="caption" className="text-neutral-600">
                      Svarsgrad
                    </Typography>
                    <Typography variant="h6">
                      {state.answerStats.totalParticipants > 0 
                        ? Math.round((state.answerStats.answeredCount / state.answerStats.totalParticipants) * 100)
                        : 0}%
                    </Typography>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
                  <div 
                    ref={answerProgressRef}
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300 progress-bar-dynamic"
                  />
                </div>
                <Typography variant="caption" className="text-neutral-600">
                  Väntar på svar från {state.answerStats.totalParticipants - state.answerStats.answeredCount} deltagare
                </Typography>
              </Card>
            )}

            {/* Final results */}
            {state.session.status === 'ENDED' && (
              <Card className="p-6 text-center">
                <Trophy className="w-12 h-12 text-success-600 mx-auto mb-4" />
                <Typography variant="h6" className="mb-2">Quiz avslutat!</Typography>
                <Typography variant="body2" className="text-neutral-600 mb-4">
                  Alla frågor har besvarats. Du kan nu visa resultaten för eleverna.
                </Typography>
                <Button variant="primary">
                  Visa resultat
                </Button>
              </Card>
            )}
          </div>

          {/* Right column - Join info and participants */}
          <div className="space-y-6">
            {/* Join information */}
            {state.session.status !== 'ENDED' && (
              <Card className="p-6">
                <Typography variant="h6" className="mb-4">Gå med</Typography>
                
                {/* PIN */}
                <div className="text-center mb-4">
                  <Typography variant="caption" className="text-neutral-600">PIN</Typography>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Typography variant="h4" className="font-mono tracking-wider">
                      {state.session.pin}
                    </Typography>
                    <Button
                      onClick={handleCopyPin}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      {copySuccess ? 'Kopierad!' : 'Kopiera'}
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                {state.qrCodeUrl && (
                  <div className="text-center mb-4">
                    <Typography variant="caption" className="text-neutral-600 block mb-2">
                      QR-kod
                    </Typography>
                    <Image
                      src={state.qrCodeUrl}
                      alt="QR kod för att gå med i sessionen"
                      className="mx-auto rounded-md border"
                      width={200}
                      height={200}
                      priority
                    />
                  </div>
                )}

                {/* Join URL */}
                <div>
                  <Typography variant="caption" className="text-neutral-600">
                    Direktlänk
                  </Typography>
                  <div className="flex items-center gap-2 mt-1">
                    <Typography variant="body2" className="flex-1 truncate text-xs">
                      {window.location.origin}/live/join?pin={state.session.pin}
                    </Typography>
                    <Button
                      onClick={handleCopyUrl}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Participants */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-neutral-600" />
                <Typography variant="h6">Deltagare ({studentParticipants.length})</Typography>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {studentParticipants.length === 0 ? (
                  <Typography variant="body2" className="text-neutral-600 text-center py-4">
                    Inga deltagare än
                  </Typography>
                ) : (
                  studentParticipants.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                      <Typography variant="body2">
                        {participant.displayName}
                      </Typography>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-success-500 rounded-full" />
                        <Typography variant="caption" className="text-success-600">
                          Online
                        </Typography>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quiz progress */}
            <Card className="p-6">
              <Typography variant="h6" className="mb-4">Framsteg</Typography>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Typography variant="body2">Frågor genomförda</Typography>
                  <Typography variant="body2">
                    {state.session.status === 'ENDED' ? state.quiz.questions.length : state.session.currentIndex} / {state.quiz.questions.length}
                  </Typography>
                </div>
                
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    ref={sessionProgressRef}
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300 progress-bar-dynamic"
                  />
                </div>

                {state.session.startedAt && (
                  <div className="flex justify-between">
                    <Typography variant="caption" className="text-neutral-600">
                      Startad
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      {state.session.startedAt.toLocaleTimeString('sv-SE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}