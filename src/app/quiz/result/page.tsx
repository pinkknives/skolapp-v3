'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { StudentAnswer } from '@/types/quiz'
import { motion } from 'framer-motion'

interface QuizResult {
  quizId: string
  studentId: string
  answers: StudentAnswer[]
  timeSpent: number
  completedAt: Date
}

export default function QuizResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get result data from session storage
    const resultData = sessionStorage.getItem('quiz_result')
    
    if (resultData) {
      try {
        const parsed = JSON.parse(resultData)
        // Convert date string back to Date object
        parsed.completedAt = new Date(parsed.completedAt)
        setResult(parsed)
      } catch (err) {
        // Log error for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error parsing result data:', err)
        }
      }
    }
    
    setLoading(false)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNewQuiz = () => {
    // Clear all stored data
    sessionStorage.removeItem('quiz_result')
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
            Laddar resultat...
          </Typography>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <Typography variant="h6" className="text-warning-800 mb-2">
            Inga resultat hittades
          </Typography>
          <Typography variant="body2" className="text-warning-600 mb-4">
            Det gick inte att hitta resultat för detta quiz.
          </Typography>
          <Button onClick={handleNewQuiz}>
            Gå med i nytt quiz
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 to-neutral-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-10 w-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Typography variant="h4" className="text-success-800 mb-2">
            Quiz Slutförd!
          </Typography>
          <Typography variant="body1" className="text-success-600">
            Tack för ditt deltagande. Dina svar har sparats.
          </Typography>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-center">Sammanfattning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-primary-800 mb-1">
                    {result.answers.length}
                  </Typography>
                  <Typography variant="caption" className="text-primary-600">
                    Besvarade frågor
                  </Typography>
                </div>
                
                <div className="bg-success-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-success-800 mb-1">
                    {formatTime(result.timeSpent)}
                  </Typography>
                  <Typography variant="caption" className="text-success-600">
                    Total tid
                  </Typography>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-neutral-800 mb-1">
                    {new Date(result.completedAt).toLocaleTimeString('sv-SE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                  <Typography variant="caption" className="text-neutral-600">
                    Slutförd
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedback Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white shadow-lg mb-6">
            <CardContent className="text-center py-6">
              <Typography variant="h6" className="text-neutral-800 mb-3">
                Vad händer nu?
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mb-4">
                Din lärare kommer att granska dina svar och ge feedback. Resultat och bedömning kommer att delas med dig senare.
              </Typography>
              <div className="bg-primary-50 p-4 rounded-lg">
                <Typography variant="caption" className="text-primary-700">
                  📊 Dina svar sparas tillfälligt enligt GDPR-regler. Långtidslagring kräver samtycke från skolan.
                </Typography>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleNewQuiz}
            className="mr-4"
          >
            Gå med i nytt quiz
          </Button>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Typography variant="caption" className="text-neutral-500">
            Dina personuppgifter hanteras enligt GDPR. Kontakta din lärare för frågor om datahantering.
          </Typography>
        </motion.div>
      </div>
    </div>
  )
}