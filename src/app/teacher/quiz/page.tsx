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
import { Plus, Share2, Play, BarChart3, HelpCircle, Edit, Copy, Archive } from 'lucide-react'

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
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showSharing, setShowSharing] = useState(false)
  const [showReviewMode, setShowReviewMode] = useState(false)
  const [filterStatus, setFilterStatus] = useState<QuizStatus | 'all'>('all')

  // Sort quizzes by last updated (senaste uppdaterade överst)
  const sortedQuizzes = [...quizzes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  const filteredQuizzes = filterStatus === 'all' 
    ? sortedQuizzes 
    : sortedQuizzes.filter(quiz => quiz.status === filterStatus)

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case 'published':
        return 'text-success-700 bg-success-100'
      case 'draft':
        return 'text-warning-700 bg-warning-100'
      case 'archived':
        return 'text-neutral-700 bg-neutral-100'
      default:
        return 'text-neutral-700 bg-neutral-100'
    }
  }

  const getStatusText = (status: QuizStatus) => {
    switch (status) {
      case 'published':
        return 'Publikt'
      case 'draft':
        return 'Utkast'
      case 'archived':
        return 'Arkiverat'
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

  const handleDuplicateQuiz = (quiz: Quiz) => {
    // Skapa en kopia av quizet som utkast
    const duplicatedQuiz: Quiz = {
      ...quiz,
      id: `quiz_${Date.now()}`, // Enkel ID-generering för demo
      title: `${quiz.title} (Kopia)`,
      status: 'draft',
      shareCode: undefined, // Ny delningskod behövs för publicering
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setQuizzes(prevQuizzes => [duplicatedQuiz, ...prevQuizzes])
    
    // Visa bekräftelse (i framtiden kan detta vara en toast)
    console.log('Quiz duplicerat:', duplicatedQuiz.title)
  }

  const handleArchiveQuiz = (quiz: Quiz) => {
    // Arkivera quizet
    setQuizzes(prevQuizzes => 
      prevQuizzes.map(q => 
        q.id === quiz.id 
          ? { ...q, status: 'archived' as QuizStatus, updatedAt: new Date() }
          : q
      )
    )
    
    // Visa bekräftelse (i framtiden kan detta vara en toast)
    console.log('Quiz arkiverat:', quiz.title)
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
              <Button 
                asChild 
                leftIcon={<Plus size={16} strokeWidth={2} />}
              >
                <Link href="/teacher/quiz/create">
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quiz.status)}`}>
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
                          leftIcon={<Share2 size={16} strokeWidth={2} />}
                        >
                          Dela
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          onClick={() => handleReviewMode(quiz)}
                          leftIcon={<Play size={16} strokeWidth={2} />}
                        >
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
                          <Link href={`/quiz/${quiz.id}/results`} className="flex items-center gap-x-2">
                            <BarChart3 size={16} strokeWidth={2} />
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
                        <Link href={`/teacher/quiz/edit/${quiz.id}`} className="flex items-center gap-x-2">
                          <Edit size={16} strokeWidth={2} />
                          Redigera
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => handleDuplicateQuiz(quiz)}
                        leftIcon={<Copy size={16} strokeWidth={2} />}
                      >
                        Duplicera
                      </Button>
                      
                      {quiz.status !== 'archived' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchiveQuiz(quiz)}
                          className="text-neutral-500 hover:text-warning-600"
                          leftIcon={<Archive size={16} strokeWidth={2} />}
                        >
                          Arkivera
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <HelpCircle size={64} strokeWidth={1.5} className="mx-auto mb-4 text-neutral-300" />
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