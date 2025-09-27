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
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    
    // Get quiz data from session storage or URL params
    const quizData = sessionStorage.getItem('current_quiz')
    const sessionData = sessionStorage.getItem('current_session')
    const studentData = sessionStorage.getItem('current_student')

    if (quizData && sessionData && studentData) {
      try {
        const q = JSON.parse(quizData) as Quiz
        const s = JSON.parse(sessionData) as QuizSession
        const st = JSON.parse(studentData) as Student
        setQuiz(q)
        setSession(s)
        setStudent(st)
      } catch (err) {
        // Log error for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error parsing stored data:', err)
        }
        setError('Fel vid laddning av quizdata. Försök gå med i quizet igen.')
      }
    } else {
      setError('Ingen quizdata hittades. Vänligen gå med i quizet först.')
    }
    
    setLoading(false)

    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // Translate content at runtime if student preferred language is not Swedish and session is not language-locked
  useEffect(() => {
    const doTranslate = async () => {
      if (!quiz || !session || !student) return
      const locked = Boolean((session as QuizSession).settings && (session as QuizSession).settings['lockLanguage' as keyof typeof session.settings])
      if (locked) return
      // preferred language comes from profile API
      let preferred = 'sv'
      try {
        const resp = await fetch('/api/user/settings/lang', { method: 'GET' })
        if (resp.ok) {
          const data = await resp.json()
          preferred = data.preferred_language || 'sv'
        }
      } catch {}
      if (!preferred || preferred === 'sv') return

      setTranslating(true)
      try {
        // Collect fields: quiz title, description, question titles, options, explanations
        const items: string[] = []
        const indexMap: Array<{ kind: string; q?: number; o?: number }> = []
        items.push(quiz.title); indexMap.push({ kind: 'quiz.title' })
        items.push(quiz.description); indexMap.push({ kind: 'quiz.description' })
        quiz.questions.forEach((q, qi) => {
          items.push(q.title); indexMap.push({ kind: 'q.title', q: qi })
          if (q.explanation) { items.push(q.explanation); indexMap.push({ kind: 'q.expl', q: qi }) }
          if ('options' in q && Array.isArray(q.options)) {
            q.options.forEach((opt, oi) => {
              items.push(opt.text); indexMap.push({ kind: 'q.opt', q: qi, o: oi })
            })
          }
        })

        if (items.length === 0) return
        const res = await fetch('/api/i18n/translate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ target_lang: preferred, items })
        })
        if (!res.ok) return
        const data = await res.json()
        const translated: string[] = data.translated || []
        if (!Array.isArray(translated) || translated.length !== items.length) return

        const qCopy: Quiz = JSON.parse(JSON.stringify(quiz))
        let idx = 0
        // Apply mapped translations
        indexMap.forEach(map => {
          const value = translated[idx++]
          if (map.kind === 'quiz.title') qCopy.title = value
          else if (map.kind === 'quiz.description') qCopy.description = value
          else if (map.kind === 'q.title' && typeof map.q === 'number') qCopy.questions[map.q].title = value
          else if (map.kind === 'q.expl' && typeof map.q === 'number') qCopy.questions[map.q].explanation = value
          else if (map.kind === 'q.opt' && typeof map.q === 'number' && typeof map.o === 'number' && (qCopy.questions[map.q] as import('@/types/quiz').MultipleChoiceQuestion | import('@/types/quiz').ImageQuestion).options) {
            ;((qCopy.questions[map.q] as import('@/types/quiz').MultipleChoiceQuestion | import('@/types/quiz').ImageQuestion).options as import('@/types/quiz').MultipleChoiceOption[])[map.o].text = value
          }
        })
        setQuiz(qCopy)
      } finally {
        setTranslating(false)
      }
    }
    doTranslate()
  }, [quiz, session, student])

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
            {translating ? 'Översätter innehåll...' : 'Laddar quiz...'}
          </Typography>
        </div>
      </div>
    )
  }

  if (error || !quiz || !session || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6">
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
    <>
      {!online && (
        <div className="w-full bg-warning-100 text-warning-900 px-4 py-2 text-sm text-center">
          Du är offline. Dina svar köas och skickas när anslutningen är tillbaka.
        </div>
      )}
      <QuizTaking
        quiz={quiz}
        session={session}
        student={student}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    </>
  )
}