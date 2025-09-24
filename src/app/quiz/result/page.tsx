'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { StudentAnswer } from '@/types/quiz'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, Loader2, Plus } from 'lucide-react'
import { quizResult as t } from '@/locales/sv/quiz'

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
  const reduceMotion = useReducedMotion()

  const getMotionProps = (opts?: { delay?: number; fromY?: number }) => {
    const delay = opts?.delay ?? 0
    const fromY = opts?.fromY ?? 20
    return {
      initial: reduceMotion ? false : { opacity: 0, y: fromY },
      animate: { opacity: 1, y: 0 },
      transition: { duration: reduceMotion ? 0 : 0.18, delay: reduceMotion ? 0 : delay }
    }
  }

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
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite" aria-busy="true">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" aria-hidden="true" />
          <Typography variant="body1" className="text-neutral-600">
            {t.loading}
          </Typography>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="alert" aria-live="polite">
        <div className="text-center max-w-lg mx-auto p-6">
          <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-warning-600" aria-hidden="true" />
          </div>
          <Typography variant="h6" className="text-warning-800 mb-2">
            {t.noResult.title}
          </Typography>
          <Typography variant="body2" className="text-warning-600 mb-4">
            {t.noResult.description}
          </Typography>
          <Button onClick={handleNewQuiz} className="inline-flex items-center gap-x-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t.actions.joinNewQuiz}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 to-neutral-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div {...getMotionProps({ fromY: -12 })} className="text-center mb-8">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-success-600" aria-hidden="true" />
          </div>
          <Typography variant="h4" className="text-success-800 mb-2">
            {t.header.title}
          </Typography>
          <Typography variant="body1" className="text-success-600">
            {t.header.subtitle}
          </Typography>
        </motion.div>

        {/* Summary Card */}
        <motion.div {...getMotionProps({ delay: 0.1 })}>
          <Card className="bg-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-center">{t.summary.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-primary-800 mb-1">
                    {result.answers.length}
                  </Typography>
                  <Typography variant="caption" className="text-primary-600">
                    {t.summary.answered}
                  </Typography>
                </div>
                
                <div className="bg-success-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-success-800 mb-1">
                    {formatTime(result.timeSpent)}
                  </Typography>
                  <Typography variant="caption" className="text-success-600">
                    {t.summary.totalTime}
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
                    {t.summary.completedAt}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedback Message */}
        <motion.div {...getMotionProps({ delay: 0.2 })}>
          <Card className="bg-white shadow-lg mb-6">
            <CardContent className="text-center py-6">
              <Typography variant="h6" className="text-neutral-800 mb-3">
                {t.feedback.title}
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mb-4">
                {t.feedback.description}
              </Typography>
              <div className="bg-primary-50 p-4 rounded-lg inline-flex items-start gap-x-2 text-left mx-auto">
                <Info className="h-4 w-4 text-primary-700 mt-0.5" aria-hidden="true" />
                <Typography variant="caption" className="text-primary-700">
                  {t.gdpr.shortTermNote}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div {...getMotionProps({ delay: 0.3 })} className="text-center">
          <Button size="lg" onClick={handleNewQuiz} className="inline-flex items-center gap-x-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t.actions.joinNewQuiz}
          </Button>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div {...getMotionProps({ delay: 0.4 })} className="mt-8 text-center">
          <Typography variant="caption" className="text-neutral-500">
            {t.gdpr.notice}
          </Typography>
        </motion.div>
      </div>
    </div>
  )
}