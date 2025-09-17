'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QuizTaking } from '@/components/quiz/QuizTaking'
import { Typography } from '@/components/ui/Typography'
import { Quiz, QuizSession, Student, StudentAnswer } from '@/types/quiz'

export default function QuizTakePage() {
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Get quiz data from session storage or URL params
    const quizData = sessionStorage.getItem('current_quiz')
    const sessionData = sessionStorage.getItem('current_session')
    const studentData = sessionStorage.getItem('current_student')

    if (quizData && sessionData && studentData) {
      try {
        setQuiz(JSON.parse(quizData))
        setSession(JSON.parse(sessionData))
        setStudent(JSON.parse(studentData))
      } catch (err) {
        console.error('Error parsing stored data:', err)
        setError('Fel vid laddning av quizdata. Försök gå med i quizet igen.')
      }
    } else {
      setError('Ingen quizdata hittades. Vänligen gå med i quizet först.')
    }
    
    setLoading(false)
  }, [])

  const handleQuizComplete = (result: { answers: StudentAnswer[], timeSpent: number }) => {
    // Store results temporarily (in a real app, this would be sent to a server)
    const resultData = {
      quizId: quiz?.id,
      studentId: student?.id,
      answers: result.answers,
      timeSpent: result.timeSpent,
      completedAt: new Date()
    }
    
    sessionStorage.setItem('quiz_result', JSON.stringify(resultData))
    
    // Navigate to results page
    router.push('/quiz/result')
  }

  const handleExit = () => {
    // Clear stored data and return to join page
    sessionStorage.removeItem('current_quiz')
    sessionStorage.removeItem('current_session')
    sessionStorage.removeItem('current_student')
    router.push('/quiz/join')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <Typography variant="body1" className="text-neutral-600">
            Laddar quiz...
          </Typography>
        </div>
      </div>
    )
  }

  if (error || !quiz || !session || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <Typography variant="h6" className="text-error-800 mb-2">
            Ett fel uppstod
          </Typography>
          <Typography variant="body2" className="text-error-600 mb-4">
            {error || 'Kunde inte ladda quizet.'}
          </Typography>
          <button
            onClick={() => router.push('/quiz/join')}
            className="inline-flex items-center px-4 py-2 border border-error-300 rounded-md shadow-sm text-sm font-medium text-error-700 bg-white hover:bg-error-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
          >
            Tillbaka till Anslutning
          </button>
        </div>
      </div>
    )
  }

  return (
    <QuizTaking
      quiz={quiz}
      session={session}
      student={student}
      onComplete={handleQuizComplete}
      onExit={handleExit}
    />
  )
}