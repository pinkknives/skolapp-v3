'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { StudentSyncQuiz } from '@/components/quiz/StudentSyncQuiz'
import { QuizSession, SessionParticipant, Quiz } from '@/types/quiz'

interface SyncQuizPageProps {
  params: Promise<{
    id: string
  }>
}

export default function SyncQuizPage({ params }: SyncQuizPageProps) {
  const router = useRouter()
  const [_sessionId, setSessionId] = useState<string>('')
  const [session, setSession] = useState<QuizSession | null>(null)
  const [participant, setParticipant] = useState<SessionParticipant | null>(null)
  const [quiz, _setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setSessionId(id)
      
      // Get session and participant data from sessionStorage
      if (typeof window !== 'undefined') {
        const storedSession = sessionStorage.getItem('current_session')
        const storedParticipant = sessionStorage.getItem('current_participant')
        
        if (storedSession && storedParticipant) {
          try {
            const sessionData = JSON.parse(storedSession) as QuizSession
            const participantData = JSON.parse(storedParticipant) as SessionParticipant
            
            if (sessionData.id === id) {
              setSession(sessionData)
              setParticipant(participantData)
              loadQuizData(sessionData.quizId)
            } else {
              setError('Sessionsdata matchar inte')
              setLoading(false)
            }
          } catch (err) {
            console.error('Error parsing stored data:', err)
            setError('Ogiltig sessionsdata')
            setLoading(false)
          }
        } else {
          setError('Ingen sessionsdata hittades. Gå med i sessionen igen.')
          setLoading(false)
        }
      }
    })
  }, [params])

  const loadQuizData = async (_quizId: string) => {
    try {
      // We'll need to create an API endpoint to get quiz data
      // For now, we'll simulate the quiz data loading
      // In production, this should fetch from /api/quiz/[id] or similar
      setError('Quiz-data kunde inte laddas. API-endpoint saknas.')
      setLoading(false)
      
      // TODO: Implement quiz data loading
      // const response = await fetch(`/api/quiz/${quizId}`)
      // if (response.ok) {
      //   const quizData = await response.json()
      //   setQuiz(quizData)
      //   setLoading(false)
      // } else {
      //   setError('Kunde inte ladda quiz-data')
      //   setLoading(false)
      // }
    } catch (err) {
      console.error('Error loading quiz:', err)
      setError('Ett fel uppstod vid laddning av quiz')
      setLoading(false)
    }
  }

  const handleBackToJoin = () => {
    // Clear stored data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_session')
      sessionStorage.removeItem('current_participant')
    }
    router.push('/quiz/join')
  }

  if (loading) {
    return (
      <Layout>
        <Section className="py-12">
          <Container size="sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <Typography variant="body1" className="text-neutral-600">
                Laddar quiz...
              </Typography>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  if (error || !session || !participant) {
    return (
      <Layout>
        <Section className="py-12">
          <Container size="sm">
            <div className="text-center space-y-4">
              <Heading level={2} className="text-error-600">
                Ett fel uppstod
              </Heading>
              <Typography variant="body1" className="text-neutral-600">
                {error || 'Kunde inte ladda session'}
              </Typography>
              <button
                onClick={handleBackToJoin}
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Tillbaka till start
              </button>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  // For demo purposes, create a mock quiz
  const mockQuiz: Quiz = {
    id: session.quizId,
    title: 'Live Quiz',
    description: 'Ett live quiz i realtid',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: session.teacherId,
    status: 'published',
    settings: {
      timeLimit: 30,
      allowRetakes: false,
      shuffleQuestions: false,
      shuffleAnswers: false,
      showCorrectAnswers: true,
      executionMode: 'teacher-controlled'
    },
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        title: 'Vad är huvudstaden i Sverige?',
        points: 1,
        timeLimit: 30,
        options: [
          { id: 'a', text: 'Stockholm', isCorrect: true },
          { id: 'b', text: 'Göteborg', isCorrect: false },
          { id: 'c', text: 'Malmö', isCorrect: false },
          { id: 'd', text: 'Uppsala', isCorrect: false }
        ]
      },
      {
        id: '2',
        type: 'multiple-choice',
        title: 'Vilket år grundades Sverige som nation?',
        points: 1,
        timeLimit: 45,
        options: [
          { id: 'a', text: '1523', isCorrect: true },
          { id: 'b', text: '1397', isCorrect: false },
          { id: 'c', text: '1648', isCorrect: false },
          { id: 'd', text: '1809', isCorrect: false }
        ]
      },
      {
        id: '3',
        type: 'free-text',
        title: 'Beskriv kort vad demokrati innebär.',
        points: 2,
        timeLimit: 60,
        expectedAnswer: 'Folkstyrelse där medborgarna har inflytande över politiska beslut'
      }
    ]
  }

  return (
    <Layout>
      <Section className="py-6">
        <Container size="lg">
          <StudentSyncQuiz
            session={session}
            quiz={quiz || mockQuiz}
            userId={participant.studentId || 'guest'}
            displayName={participant.displayName}
          />
        </Container>
      </Section>
    </Layout>
  )
}