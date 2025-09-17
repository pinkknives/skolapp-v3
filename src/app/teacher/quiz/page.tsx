'use client'

import React, { useState } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { QuizSharing } from '@/components/quiz/QuizSharing'
import { TeacherReviewMode } from '@/components/quiz/TeacherReviewMode'
import { Quiz, QuizStatus } from '@/types/quiz'
import { formatExecutionMode, calculateTotalPoints, estimateCompletionTime } from '@/lib/quiz-utils'
import Link from 'next/link'

// Mock data - in a real app this would come from a database
const mockQuizzes: Quiz[] = [
  {
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
      }
    ]
  },
  {
    id: 'quiz_2',
    title: 'Svenska - Ordklass',
    description: 'Igenkänning av olika ordklasser',
    tags: ['svenska', 'ordklass', 'grammatik'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'teacher-1',
    status: 'draft',
    settings: {
      allowRetakes: true,
      shuffleQuestions: false,
      shuffleAnswers: false,
      showCorrectAnswers: true,
      executionMode: 'teacher-controlled'
    },
    questions: [
      {
        id: 'q1',
        type: 'free-text',
        title: 'Vilken ordklass är ordet "springa"?',
        points: 2,
        expectedAnswer: 'verb'
      }
    ]
  }
]

export default function QuizManagementPage() {
  const [quizzes] = useState<Quiz[]>(mockQuizzes)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showSharing, setShowSharing] = useState(false)
  const [showReviewMode, setShowReviewMode] = useState(false)
  const [filterStatus, setFilterStatus] = useState<QuizStatus | 'all'>('all')

  const filteredQuizzes = filterStatus === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.status === filterStatus)

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case 'published':
        return 'text-success-600 bg-success-50 border-success-200'
      case 'draft':
        return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'archived':
        return 'text-neutral-600 bg-neutral-50 border-neutral-200'
      default:
        return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    }
  }

  const getStatusText = (status: QuizStatus) => {
    switch (status) {
      case 'published':
        return 'Publicerad'
      case 'draft':
        return 'Utkast'
      case 'archived':
        return 'Arkiverad'
      default:
        return status
    }
  }

  const handleShareQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setShowSharing(true)
  }

  const handleReviewMode = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setShowReviewMode(true)
  }

  if (showReviewMode && selectedQuiz) {
    return (
      <TeacherReviewMode
        quiz={selectedQuiz}
        onExit={() => {
          setShowReviewMode(false)
          setSelectedQuiz(null)
        }}
      />
    )
  }

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Heading level={1} className="mb-2">
                  Mina Quiz
                </Heading>
                <Typography variant="subtitle1" className="text-neutral-600">
                  Hantera dina quiz, se statistik och dela med dina elever.
                </Typography>
              </div>
              <Button asChild>
                <Link href="/teacher/quiz/create">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Skapa nytt quiz
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <Typography variant="body2" className="font-medium text-neutral-700">
                  Filtrera:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {status === 'all' ? 'Alla' : getStatusText(status as QuizStatus)}
                      {status !== 'all' && (
                        <span className="ml-1 text-xs opacity-75">
                          ({quizzes.filter(q => q.status === status).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Grid */}
          {filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <Card key={quiz.id} className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{quiz.title}</CardTitle>
                        <CardDescription className="mb-3">
                          {quiz.description}
                        </CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(quiz.status)}`}>
                        {getStatusText(quiz.status)}
                      </span>
                    </div>
                    
                    {/* Tags */}
                    {quiz.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {quiz.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                        {quiz.tags.length > 3 && (
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md">
                            +{quiz.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                      <div>
                        <Typography variant="caption" className="text-neutral-500">Frågor</Typography>
                        <Typography variant="body2" className="font-medium">{quiz.questions.length}</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" className="text-neutral-500">Poäng</Typography>
                        <Typography variant="body2" className="font-medium">{calculateTotalPoints(quiz.questions)}</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" className="text-neutral-500">Tid (ca)</Typography>
                        <Typography variant="body2" className="font-medium">
                          {quiz.settings.timeLimit ? `${quiz.settings.timeLimit} min` : `${estimateCompletionTime(quiz.questions)} min`}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="caption" className="text-neutral-500">Läge</Typography>
                        <Typography variant="body2" className="font-medium">{formatExecutionMode(quiz.settings.executionMode)}</Typography>
                      </div>
                    </div>

                    {quiz.shareCode && (
                      <div className="mt-4 p-3 bg-primary-50 rounded-md">
                        <Typography variant="caption" className="text-primary-600 block mb-1">Delningskod</Typography>
                        <Typography variant="body2" className="font-mono font-bold text-primary-800">{quiz.shareCode}</Typography>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2">
                    {quiz.status === 'published' && (
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          onClick={() => handleShareQuiz(quiz)}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          Dela
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          onClick={() => handleReviewMode(quiz)}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Granska
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2 w-full">
                      {quiz.status === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          asChild
                        >
                          <Link href={`/quiz/${quiz.id}/results`}>
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Visa resultat
                          </Link>
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        asChild
                      >
                        <Link href={`/teacher/quiz/edit/${quiz.id}`}>
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Redigera
                        </Link>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-neutral-500 hover:text-error-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <svg className="h-16 w-16 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <Heading level={3} className="mb-2">
                  {filterStatus === 'all' ? 'Inga quiz skapade än' : `Inga ${getStatusText(filterStatus as QuizStatus).toLowerCase()} quiz`}
                </Heading>
                <Typography variant="body1" className="text-neutral-600 mb-6">
                  {filterStatus === 'all' 
                    ? 'Skapa ditt första quiz för att komma igång med interaktiv undervisning.'
                    : 'Inga quiz matchar det valda filtret.'
                  }
                </Typography>
                {filterStatus === 'all' && (
                  <Button asChild>
                    <Link href="/teacher/quiz/create">
                      Skapa ditt första quiz
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sharing Modal */}
          {showSharing && selectedQuiz && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <QuizSharing
                  quiz={selectedQuiz}
                  onClose={() => {
                    setShowSharing(false)
                    setSelectedQuiz(null)
                  }}
                />
              </div>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}