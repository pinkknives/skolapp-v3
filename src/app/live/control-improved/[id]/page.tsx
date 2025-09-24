'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
// import { Card } from '@/components/ui/Card'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { ImprovedLiveConnection } from '@/components/quiz/ImprovedLiveConnection'
import { ImprovedLiveDashboard } from '@/components/quiz/ImprovedLiveDashboard'
import { 
  Loader2,
  AlertCircle
} from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import QRCodeLib from 'qrcode'
import type { User } from '@supabase/supabase-js'
import type { LiveQuizSession, LiveQuizParticipant, Question } from '@/types/quiz'

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

export default function ImprovedLiveControlPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const supabase = supabaseBrowser()
  
  const [state, setState] = useState<ControlState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [_isActionLoading, setIsActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  // const [copySuccess, setCopySuccess] = useState(false)
  const [user, setUser] = useState<User | null>(null)

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

        if (!orgMember || !['admin', 'teacher'].includes(orgMember.role)) {
          setError('Du har inte behörighet att hantera denna session')
          return
        }
      }

      // Get quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, questions')
        .eq('id', sessionData.quiz_id)
        .single()

      if (quizError || !quizData) {
        setError('Quiz hittades inte')
        return
      }

      // Get participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('live_quiz_participants')
        .select('*')
        .eq('session_id', sessionId)

      if (participantsError) {
        console.error('Error fetching participants:', participantsError)
      }

      // Generate QR code
      const joinUrl = `${window.location.origin}/live/join?pin=${sessionData.pin}`
      const qrCodeUrl = await QRCodeLib.toDataURL(joinUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Get current question
      const currentQuestion = quizData.questions?.[sessionData.current_index]

      // Calculate answer stats
      const totalParticipants = participantsData?.length || 0
      const answeredCount = participantsData?.filter(p => p.has_answered).length || 0

      setState({
        session: {
          ...sessionData,
          startedAt: sessionData.started_at ? new Date(sessionData.started_at) : undefined,
          endedAt: sessionData.ended_at ? new Date(sessionData.ended_at) : undefined
        },
        quiz: quizData,
        participants: participantsData || [],
        currentQuestion,
        answerStats: {
          totalParticipants,
          answeredCount,
          answerDistribution: {}
        },
        qrCodeUrl
      })

    } catch (error) {
      console.error('Error initializing session:', error)
      setError('Ett fel uppstod vid laddning av sessionen')
    } finally {
      setIsLoading(false)
    }
  }, [user, sessionId, supabase])

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initializeSession()
    }
  }, [user, initializeSession])

  // Handle session actions
  const handleSessionAction = async (action: string) => {
    if (!state) return

    try {
      setIsActionLoading(action)
      
      const response = await fetch(`/api/live-sessions/${sessionId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          action
        })
      })

      if (!response.ok) {
        throw new Error('Action failed')
      }

      // Refresh session data
      await initializeSession()

    } catch (error) {
      console.error(`Error ${action} session:`, error)
      setError(`Kunde inte ${action} sessionen`)
    } finally {
      setIsActionLoading(null)
    }
  }

  // Copy functions
  const handleCopyPin = () => {
    if (state?.session.pin) {
      navigator.clipboard.writeText(state.session.pin)
      // setCopySuccess(true)
      // setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const handleCopyUrl = () => {
    if (state?.session.pin) {
      const url = `${window.location.origin}/live/join?pin=${state.session.pin}`
      navigator.clipboard.writeText(url)
      // setCopySuccess(true)
      // setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const studentParticipants = state?.participants.filter(p => p.role === 'student') || []

  return (
    <Layout>
      <Section className="py-8">
        <Container size="xl">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <Typography variant="h6">Laddar session...</Typography>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-error-600 mx-auto mb-4" />
                <Typography variant="h6" className="mb-2">Ett fel uppstod</Typography>
                <Typography variant="body2" className="text-neutral-600 mb-4">{error}</Typography>
                <Button onClick={() => window.location.reload()}>
                  Försök igen
                </Button>
              </div>
            </div>
          ) : state ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Improved Live Dashboard */}
              <div className="lg:col-span-2">
                <ImprovedLiveDashboard
                  quizId={state.quiz.id}
                  quizTitle={state.quiz.title}
                  questions={state.quiz.questions.map(q => ({
                    id: q.id,
                    question: 'question' in q ? String(q.question) : '',
                    options: q.type === 'multiple-choice' && 'options' in q ? q.options?.map(opt => ({
                      id: opt.id,
                      text: opt.text
                    })) : undefined
                  }))}
                  currentQuestionIndex={state.session.currentIndex}
                  isLive={state.session.status === 'ACTIVE'}
                  stats={{
                    totalParticipants: state.answerStats.totalParticipants,
                    answeredCurrent: state.answerStats.answeredCount,
                    correctAnswers: Math.round(state.answerStats.answeredCount * 0.8), // Mock data
                    averageTime: 15, // Mock data
                    currentQuestion: state.session.currentIndex + 1,
                    totalQuestions: state.quiz.questions.length
                  }}
                  participants={studentParticipants.map((p, index) => ({
                    id: p.userId || `student-${index}`,
                    name: p.displayName || `Student ${index + 1}`,
                    hasAnswered: Math.random() > 0.5, // Mock data
                    isCorrect: Math.random() > 0.3, // Mock data
                    answerTime: Math.floor(Math.random() * 30) + 5, // Mock data
                    joinedAt: new Date(Date.now() - Math.random() * 60000) // Mock data
                  }))}
                  onStartQuiz={() => handleSessionAction('start')}
                  onPauseQuiz={() => handleSessionAction('pause')}
                  onNextQuestion={() => handleSessionAction('next')}
                  onEndQuiz={() => handleSessionAction('end')}
                  onRevealAnswers={() => handleSessionAction('reveal')}
                />
              </div>

              {/* Right column - Improved Live Connection */}
              <div>
                <ImprovedLiveConnection
                  sessionId={sessionId}
                  pin={state.session.pin}
                  qrCodeUrl={state.qrCodeUrl}
                  joinUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/live/join?pin=${state.session.pin}`}
                  participantCount={studentParticipants.length}
                  isConnected={state.session.status === 'ACTIVE'}
                  onCopyPin={handleCopyPin}
                  onCopyUrl={handleCopyUrl}
                />
              </div>
            </div>
          ) : null}
        </Container>
      </Section>
    </Layout>
  )
}
