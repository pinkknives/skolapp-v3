'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TeacherReviewMode } from '@/components/quiz/TeacherReviewMode'
import { Quiz, QuizResult, Student, MultipleChoiceQuestion } from '@/types/quiz'
import { User, SubscriptionPlan, DataRetentionMode } from '@/types/auth'
import { motion } from 'framer-motion'

// Mock data - in a real app this would come from a database
const mockQuiz: Quiz = {
  id: 'quiz_1',
  title: 'Matematik - Multiplikation',
  description: 'Grundläggande multiplikationstabeller för åk 3',
  tags: ['matematik', 'multiplikation', 'åk3'],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-16'),
  createdBy: 'teacher-1',
  status: 'published',
  shareCode: 'AB3K',
  settings: {
    timeLimit: 30,
    allowRetakes: false,
    shuffleQuestions: true,
    shuffleAnswers: true,
    showCorrectAnswers: true,
    executionMode: 'self-paced'
  },
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      title: 'Vad är 7 × 8?',
      points: 1,
      options: [
        { id: 'opt1', text: '54', isCorrect: false },
        { id: 'opt2', text: '56', isCorrect: true },
        { id: 'opt3', text: '58', isCorrect: false },
        { id: 'opt4', text: '64', isCorrect: false }
      ]
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      title: 'Vad är 9 × 6?',
      points: 1,
      options: [
        { id: 'opt1', text: '52', isCorrect: false },
        { id: 'opt2', text: '54', isCorrect: true },
        { id: 'opt3', text: '56', isCorrect: false },
        { id: 'opt4', text: '58', isCorrect: false }
      ]
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      title: 'Vad är 12 × 4?',
      points: 1,
      options: [
        { id: 'opt1', text: '46', isCorrect: false },
        { id: 'opt2', text: '48', isCorrect: true },
        { id: 'opt3', text: '50', isCorrect: false },
        { id: 'opt4', text: '52', isCorrect: false }
      ]
    }
  ]
}

const mockStudents: Student[] = [
  { id: 'student_1', alias: 'Anna', joinedAt: new Date(), isGuest: true },
  { id: 'student_2', alias: 'Erik', joinedAt: new Date(), isGuest: true },
  { id: 'student_3', alias: 'Maria', joinedAt: new Date(), isGuest: true },
  { id: 'student_4', alias: 'Oskar', joinedAt: new Date(), isGuest: true },
  { id: 'student_5', alias: 'Lisa', joinedAt: new Date(), isGuest: true },
]

const mockResults: QuizResult[] = [
  {
    id: 'result_1',
    quizId: 'quiz_1',
    studentId: 'student_1',
    answers: [
      { questionId: 'q1', answer: 'opt2' },
      { questionId: 'q2', answer: 'opt2' },
      { questionId: 'q3', answer: 'opt2' }
    ],
    score: 3,
    totalPoints: 3,
    startedAt: new Date(Date.now() - 300000),
    completedAt: new Date(Date.now() - 240000),
    timeSpent: 60
  },
  {
    id: 'result_2', 
    quizId: 'quiz_1',
    studentId: 'student_2',
    answers: [
      { questionId: 'q1', answer: 'opt2' },
      { questionId: 'q2', answer: 'opt1' },
      { questionId: 'q3', answer: 'opt2' }
    ],
    score: 2,
    totalPoints: 3,
    startedAt: new Date(Date.now() - 280000),
    completedAt: new Date(Date.now() - 200000),
    timeSpent: 80
  },
  {
    id: 'result_3',
    quizId: 'quiz_1', 
    studentId: 'student_3',
    answers: [
      { questionId: 'q1', answer: 'opt1' },
      { questionId: 'q2', answer: 'opt2' },
      { questionId: 'q3', answer: 'opt1' }
    ],
    score: 1,
    totalPoints: 3,
    startedAt: new Date(Date.now() - 320000),
    completedAt: new Date(Date.now() - 250000),
    timeSpent: 70
  },
  {
    id: 'result_4',
    quizId: 'quiz_1',
    studentId: 'student_4', 
    answers: [
      { questionId: 'q1', answer: 'opt2' },
      { questionId: 'q2', answer: 'opt2' },
      { questionId: 'q3', answer: 'opt3' }
    ],
    score: 2,
    totalPoints: 3,
    startedAt: new Date(Date.now() - 350000),
    completedAt: new Date(Date.now() - 280000),
    timeSpent: 70
  },
  {
    id: 'result_5',
    quizId: 'quiz_1',
    studentId: 'student_5',
    answers: [
      { questionId: 'q1', answer: 'opt2' },
      { questionId: 'q2', answer: 'opt2' },
      { questionId: 'q3', answer: 'opt2' }
    ],
    score: 3,
    totalPoints: 3,
    startedAt: new Date(Date.now() - 300000),
    completedAt: new Date(Date.now() - 220000),
    timeSpent: 80
  }
]

// Mock user for permission checking
const mockUser: User = {
  id: 'teacher-1',
  email: 'teacher@school.se',
  firstName: 'Lena',
  lastName: 'Andersson',
  role: 'lärare',
  subscriptionPlan: 'premium' as SubscriptionPlan,
  dataRetentionMode: 'långtid' as DataRetentionMode,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  isMinor: false
}

interface QuestionStats {
  questionId: string
  questionTitle: string
  correctAnswers: number
  incorrectAnswers: number
  correctPercentage: number
}

interface ClassSummary {
  totalStudents: number
  averageScore: number
  averagePercentage: number
  averageTimeSpent: number
  questionStats: QuestionStats[]
}

export default function QuizResultsPage() {
  const [quiz] = useState<Quiz>(mockQuiz)
  const [results] = useState<QuizResult[]>(mockResults)
  const [students] = useState<Student[]>(mockStudents)
  const [user] = useState<User>(mockUser)
  const [showReviewMode, setShowReviewMode] = useState(false)
  const [showIndividualResults, setShowIndividualResults] = useState(false)
  const [anonymizeNames, setAnonymizeNames] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Check if user has permission to view individual results
  const canViewIndividualResults = user.subscriptionPlan !== 'gratis' && user.dataRetentionMode === 'långtid'

  // Calculate class summary statistics
  const classSummary: ClassSummary = React.useMemo(() => {
    if (results.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        averagePercentage: 0,
        averageTimeSpent: 0,
        questionStats: []
      }
    }

    const totalStudents = results.length
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalStudents
    const averagePercentage = (averageScore / quiz.questions.length) * 100
    const averageTimeSpent = results.reduce((sum, r) => sum + r.timeSpent, 0) / totalStudents

    const questionStats: QuestionStats[] = quiz.questions.map(question => {
      const questionAnswers = results.map(result => 
        result.answers.find(a => a.questionId === question.id)
      ).filter(Boolean)

      let correctAnswers = 0
      questionAnswers.forEach(answer => {
        if (question.type === 'multiple-choice') {
          const mcQuestion = question as MultipleChoiceQuestion
          const correctOption = mcQuestion.options.find(opt => opt.isCorrect)
          if (correctOption && answer?.answer === correctOption.id) {
            correctAnswers++
          }
        }
      })

      const incorrectAnswers = questionAnswers.length - correctAnswers
      const correctPercentage = questionAnswers.length > 0 ? (correctAnswers / questionAnswers.length) * 100 : 0

      return {
        questionId: question.id,
        questionTitle: question.title,
        correctAnswers,
        incorrectAnswers,
        correctPercentage
      }
    })

    return {
      totalStudents,
      averageScore,
      averagePercentage,
      averageTimeSpent,
      questionStats
    }
  }, [results, quiz.questions])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return 'Okänd elev'
    return anonymizeNames ? `Elev ${students.indexOf(student) + 1}` : student.alias
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success-600 bg-success-50'
    if (percentage >= 60) return 'text-warning-600 bg-warning-50'
    return 'text-error-600 bg-error-50'
  }

  if (loading) {
    return (
      <Layout>
        <Section spacing="lg">
          <Container>
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <Typography variant="body1" className="text-neutral-600">
                  Laddar resultat...
                </Typography>
              </div>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  if (showReviewMode) {
    return (
      <TeacherReviewMode
        quiz={quiz}
        results={results}
        students={students}
        showStudentResponses={canViewIndividualResults}
        onExit={() => setShowReviewMode(false)}
      />
    )
  }

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <Heading level={1} className="mb-2">
                  Resultat: {quiz.title}
                </Heading>
                <Typography variant="body1" className="text-neutral-600">
                  {quiz.description}
                </Typography>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setAnonymizeNames(!anonymizeNames)}
                >
                  {anonymizeNames ? 'Visa namn' : 'Anonymisera namn'}
                </Button>
                <Button
                  onClick={() => setShowReviewMode(true)}
                >
                  Lärargranskningsläge
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Class Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Klassöversikt</CardTitle>
                <CardDescription>
                  Sammanställning av klassens prestation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <Typography variant="h6" className="text-primary-800 mb-1">
                        {classSummary.totalStudents}
                      </Typography>
                      <Typography variant="caption" className="text-primary-600">
                        Deltagare
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-success-50 p-4 rounded-lg">
                      <Typography variant="h6" className="text-success-800 mb-1">
                        {classSummary.averagePercentage.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" className="text-success-600">
                        Genomsnittlig prestation
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-info-50 p-4 rounded-lg">
                      <Typography variant="h6" className="text-info-800 mb-1">
                        {classSummary.averageScore.toFixed(1)}/{quiz.questions.length}
                      </Typography>
                      <Typography variant="caption" className="text-info-600">
                        Genomsnittlig poäng
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <Typography variant="h6" className="text-neutral-800 mb-1">
                        {formatTime(Math.round(classSummary.averageTimeSpent))}
                      </Typography>
                      <Typography variant="caption" className="text-neutral-600">
                        Genomsnittlig tid
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Question Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Frågeanalys</CardTitle>
                <CardDescription>
                  Prestationsöversikt per fråga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classSummary.questionStats.map((stat, index) => (
                    <div key={stat.questionId} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <div className="flex-1">
                          <Typography variant="subtitle1" className="font-medium mb-1">
                            Fråga {index + 1}: {stat.questionTitle}
                          </Typography>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(stat.correctPercentage)}`}>
                          {stat.correctPercentage.toFixed(1)}% rätt
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <ProgressBar 
                        value={stat.correctPercentage}
                        className="mb-2"
                      />
                      
                      <div className="flex justify-between text-sm text-neutral-600">
                        <span>{stat.correctAnswers} rätt</span>
                        <span>{stat.incorrectAnswers} fel</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Individual Results */}
          {canViewIndividualResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Individuella resultat</CardTitle>
                      <CardDescription>
                        Prestationsdata per elev (endast Premium/Skolplan + långtidsläge)
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowIndividualResults(!showIndividualResults)}
                    >
                      {showIndividualResults ? 'Dölj' : 'Visa'} individuella resultat
                    </Button>
                  </div>
                </CardHeader>
                {showIndividualResults && (
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-2">Elev</th>
                            <th className="text-center py-3 px-2">Poäng</th>
                            <th className="text-center py-3 px-2">Procent</th>
                            <th className="text-center py-3 px-2">Tid</th>
                            <th className="text-center py-3 px-2">Slutförd</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((result, index) => {
                            const percentage = (result.score / result.totalPoints) * 100
                            return (
                              <tr key={result.id} className={index % 2 === 0 ? 'bg-neutral-25' : ''}>
                                <td className="py-3 px-2">
                                  <Typography variant="body2" className="font-medium">
                                    {getStudentName(result.studentId)}
                                  </Typography>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Typography variant="body2">
                                    {result.score}/{result.totalPoints}
                                  </Typography>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <span className={`px-2 py-1 rounded text-sm ${getPerformanceColor(percentage)}`}>
                                    {percentage.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Typography variant="body2">
                                    {formatTime(result.timeSpent)}
                                  </Typography>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <Typography variant="body2" className="text-neutral-600">
                                    {result.completedAt?.toLocaleTimeString('sv-SE', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )}

          {/* Limited access notice for free tier */}
          {!canViewIndividualResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-warning-25 border-warning-200">
                <CardContent className="py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <Typography variant="subtitle1" className="text-warning-800 font-medium mb-1">
                        Begränsad åtkomst till individuella resultat
                      </Typography>
                      <Typography variant="body2" className="text-warning-700">
                        Individuella elevresultat är endast tillgängliga för Premium/Skolplan + långtidsläge. 
                        Aggregerade resultat visas alltid enligt GDPR-regler.
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* GDPR Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-info-25 border-info-200">
              <CardContent className="py-4">
                <Typography variant="caption" className="text-info-800 font-medium block mb-2">
                  GDPR & Datahantering
                </Typography>
                <Typography variant="caption" className="text-info-700">
                  {user.dataRetentionMode === 'korttid' 
                    ? 'Korttidsläge: Individuella resultat raderas automatiskt efter sessionen. Endast aggregerade data visas.'
                    : 'Långtidsläge: Data sparas permanent för analys och progression enligt användarens samtycke.'
                  } För mer information om datahantering, kontakta skolans administratör.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Section>
    </Layout>
  )
}