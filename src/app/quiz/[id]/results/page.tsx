'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { QuizResultsOverview } from '@/components/quiz/QuizResultsOverview'
import { QuizAnalyticsView } from '@/components/quiz/QuizAnalyticsView'
import { QuizParticipantsList } from '@/components/quiz/QuizParticipantsList'
import { IndividualStudentView } from '@/components/quiz/IndividualStudentView'
import { TeacherReviewMode } from '@/components/quiz/TeacherReviewMode'
import { Quiz, QuizAnalytics, ParticipantResult } from '@/types/quiz'
import { getQuizAnalytics, getQuizById } from '@/lib/quiz-utils'
import { canAccessPremiumFeatures } from '@/lib/auth-utils'
import { motion } from 'framer-motion'

type ViewMode = 'overview' | 'analytics' | 'participants' | 'individual' | 'review'

export default function QuizResultsPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedStudent, setSelectedStudent] = useState<ParticipantResult | null>(null)
  const [showAnonymized, setShowAnonymized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Mock user for demo - in real app this would come from auth context
  const user = { id: 'teacher_1', accountType: 'premium', dataRetentionMode: 'långtid' }
  const canAccessPremium = canAccessPremiumFeatures(user)

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLoading(true)
        
        // Load quiz data
        const quizData = await getQuizById(quizId)
        if (!quizData) {
          setError('Quiz hittades inte.')
          return
        }
        setQuiz(quizData)

        // Load analytics data
        const analyticsData = await getQuizAnalytics(quizId)
        setAnalytics(analyticsData)

      } catch (err) {
        console.error('Error loading quiz data:', err)
        setError('Ett fel uppstod vid laddning av quizdata.')
      } finally {
        setLoading(false)
      }
    }

    if (quizId) {
      loadQuizData()
    }
  }, [quizId])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    setSelectedStudent(null)
  }

  const handleStudentSelect = (student: ParticipantResult) => {
    if (canAccessPremium) {
      setSelectedStudent(student)
      setViewMode('individual')
    }
  }

  const handleAnonymityToggle = () => {
    setShowAnonymized(!showAnonymized)
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

  if (error || !quiz || !analytics) {
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
            {error || 'Kunde inte ladda resultat.'}
          </Typography>
          <Button onClick={() => router.push('/teacher/quiz')}>
            Tillbaka till Quiz-översikt
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
            <div>
              <Typography variant="h4" className="text-neutral-900 mb-2">
                {quiz.title}
              </Typography>
              <Typography variant="body2" className="text-neutral-600">
                Resultat och analys
              </Typography>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={handleAnonymityToggle}
              >
                {showAnonymized ? 'Visa namn' : 'Dölj namn'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/teacher/quiz')}
              >
                Tillbaka
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={viewMode === 'overview' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('overview')}
                >
                  Översikt
                </Button>
                <Button
                  variant={viewMode === 'analytics' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('analytics')}
                >
                  Analys
                </Button>
                <Button
                  variant={viewMode === 'participants' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('participants')}
                >
                  Deltagare
                </Button>
                <Button
                  variant={viewMode === 'review' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('review')}
                >
                  Granska frågor
                </Button>
                {!canAccessPremium && (
                  <div className="flex items-center ml-2 px-3 py-1 bg-warning-50 text-warning-700 rounded-md text-xs">
                    Vissa funktioner kräver Premium
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'overview' && (
            <QuizResultsOverview 
              quiz={quiz} 
              analytics={analytics}
              showAnonymized={showAnonymized}
            />
          )}
          
          {viewMode === 'analytics' && (
            <QuizAnalyticsView 
              quiz={quiz} 
              analytics={analytics}
            />
          )}
          
          {viewMode === 'participants' && (
            <QuizParticipantsList 
              analytics={analytics}
              showAnonymized={showAnonymized}
              onStudentSelect={handleStudentSelect}
              canAccessPremium={canAccessPremium}
            />
          )}
          
          {viewMode === 'individual' && selectedStudent && (
            <IndividualStudentView 
              quiz={quiz}
              student={selectedStudent}
              showAnonymized={showAnonymized}
              onBack={() => handleViewModeChange('participants')}
            />
          )}
          
          {viewMode === 'review' && (
            <TeacherReviewMode 
              quiz={quiz} 
              onExit={() => handleViewModeChange('overview')}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}