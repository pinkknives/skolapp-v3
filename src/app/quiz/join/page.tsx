'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { QuizJoinForm } from '@/components/quiz/QuizJoinForm'
import { QuizWaitingRoom } from '@/components/quiz/QuizWaitingRoom'
import { joinQuiz, getJoinErrorMessage } from '@/lib/quiz-utils'
import { Quiz, QuizSession, Student, QuizJoinRequest } from '@/types/quiz'

type JoinState = 'form' | 'waiting' | 'error'

export default function QuizJoinPage() {
  const router = useRouter()
  const [state, setState] = useState<JoinState>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [prefilledCode, setPrefilledCode] = useState<string>('')

  // Check for pre-filled code from QR code scanning
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCode = sessionStorage.getItem('quiz_join_code')
      if (storedCode) {
        setPrefilledCode(storedCode)
        // Clear the stored code
        sessionStorage.removeItem('quiz_join_code')
      }
    }
  }, [])

  const handleJoinQuiz = async (shareCode: string, alias: string) => {
    setIsLoading(true)
    setError('')

    try {
      const request: QuizJoinRequest = {
        shareCode: shareCode.toUpperCase(),
        studentAlias: alias.trim()
      }

      const result = await joinQuiz(request)

      if (result.success && result.quiz && result.session) {
        // Success - store the data and show waiting room
        setQuiz(result.quiz)
        setSession(result.session)
        setStudent({
          id: `student_${Date.now()}`,
          alias: alias.trim(),
          joinedAt: new Date(),
          isGuest: true
        })
        setState('waiting')
      } else {
        // Error - show the error message
        const errorMessage = result.error || getJoinErrorMessage(result.errorCode || 'QUIZ_NOT_FOUND')
        setError(errorMessage)
      }
    } catch (err) {
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error joining quiz:', err)
      }
      setError('Ett oväntat fel uppstod. Försök igen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveQuiz = () => {
    // Clear any stored session data
    if (typeof window !== 'undefined' && student && session) {
      sessionStorage.removeItem(`student_${student.id}`)
      sessionStorage.removeItem(`quiz_session_${session.id}`)
    }
    
    // Reset state
    setQuiz(null)
    setSession(null)
    setStudent(null)
    setState('form')
    setError('')
    
    // Navigate back to home or main quiz join page
    router.push('/quiz/join')
  }

  // If we're in the waiting room, show that component
  if (state === 'waiting' && quiz && session && student) {
    return (
      <QuizWaitingRoom
        quiz={quiz}
        session={session}
        student={student}
        onLeaveQuiz={handleLeaveQuiz}
      />
    )
  }

  // Otherwise show the join form
  return (
    <Layout>
      <Section spacing="xl">
        <Container>
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Heading level={1} className="mb-4">
                Gå med i Quiz
              </Heading>
              <Typography variant="subtitle1" className="text-neutral-600">
                Ange fyrteckenskoden från din lärare eller skanna QR-koden för att gå med i quizet.
              </Typography>
            </div>

            {/* Join Form */}
            <QuizJoinForm
              onJoinQuiz={handleJoinQuiz}
              isLoading={isLoading}
              error={error}
              prefilledCode={prefilledCode}
            />

            {/* Help Section */}
            <div className="mt-12 text-center">
              <Typography variant="body2" className="text-neutral-600 mb-4">
                Behöver du hjälp?
              </Typography>
              <div className="space-y-2">
                <Typography variant="caption" className="text-neutral-500 block">
                  • Fråga din lärare efter fyrteckenskoden för quizet
                </Typography>
                <Typography variant="caption" className="text-neutral-500 block">
                  • Du kan också skanna QR-koden som läraren visar
                </Typography>
                <Typography variant="caption" className="text-neutral-500 block">
                  • Koden består av fyra bokstäver och/eller siffror (t.ex. ABC1)
                </Typography>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}