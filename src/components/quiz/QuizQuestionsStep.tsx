'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz, Question, QuestionType } from '@/types/quiz'
import { QuestionEditor } from './QuestionEditor'
import { createDefaultQuestion } from '@/lib/quiz-utils'

// Dynamically import AI components for better performance
const ImprovedAIQuizDraft = dynamic(() => import('./ImprovedAIQuizDraft').then(mod => ({ default: mod.ImprovedAIQuizDraft })), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <Typography variant="body2">Laddar AI-assistent...</Typography>
      </div>
    </div>
  ),
  ssr: false
})

// Dynamically import preview modal for better performance
const QuizPreviewModal = dynamic(() => import('./preview/QuizPreviewModal').then(mod => ({ default: mod.QuizPreviewModal })), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <Typography variant="body2">Laddar förhandsvisning...</Typography>
      </div>
    </div>
  ),
  ssr: false
})

interface QuizQuestionsStepProps {
  quiz: Partial<Quiz>
  onChange: (updates: Partial<Quiz>) => void
  onValidationChange: (isValid: boolean) => void
}

export function QuizQuestionsStep({ quiz, onChange, onValidationChange }: QuizQuestionsStepProps) {
  const [showAIModal, setShowAIModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  // Validate on changes
  useEffect(() => {
    const isValid = !!(quiz.questions && quiz.questions.length > 0)
    onValidationChange(isValid)
  }, [quiz.questions, onValidationChange])

  const addQuestion = (type: QuestionType) => {
    const newQuestion = createDefaultQuestion(type) as Question
    onChange({
      questions: [...(quiz.questions || []), newQuestion]
    })
    // Auto-expand the new question for editing
    setExpandedQuestion((quiz.questions || []).length)
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...(quiz.questions || [])]
    updatedQuestions[index] = updatedQuestion
    onChange({ questions: updatedQuestions })
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = quiz.questions?.filter((_, i) => i !== index) || []
    onChange({ questions: updatedQuestions })
    setExpandedQuestion(null)
  }

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = quiz.questions?.[index]
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${questionToDuplicate.title} (kopia)`
      }
      const updatedQuestions = [
        ...(quiz.questions?.slice(0, index + 1) || []),
        duplicatedQuestion,
        ...(quiz.questions?.slice(index + 1) || [])
      ]
      onChange({ questions: updatedQuestions })
    }
  }

  const handleAIQuestionsGenerated = (aiQuestions: Question[]) => {
    onChange({
      questions: [...(quiz.questions || []), ...aiQuestions]
    })
    setShowAIModal(false)
  }

  const questionTypes: { type: QuestionType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      type: 'multiple-choice',
      label: 'Flerval',
      description: 'Elever väljer bland flera alternativ',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      type: 'free-text',
      label: 'Fritext',
      description: 'Elever skriver eget svar',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      type: 'image',
      label: 'Bild',
      description: 'Lägg till visuellt innehåll',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <Typography variant="h5" className="text-primary-900 font-semibold mb-2">
                Lägg till frågor
              </Typography>
              <Typography variant="body2" className="text-primary-700 mb-4">
                Skapa engagerande frågor för dina elever. Använd AI för att komma igång snabbt eller lägg till manuellt.
              </Typography>
              
              {/* AI Quick Start */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowAIModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                >
                  Skapa frågor med AI
                </Button>
                
                {quiz.questions && quiz.questions.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="border-primary-300 text-primary-700 hover:bg-primary-50"
                    leftIcon={
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 6 16 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  >
                    Förhandsgranska
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Options */}
      <Card>
        <CardHeader>
          <CardTitle>Lägg till fråga manuellt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {questionTypes.map((type) => (
              <Button
                key={type.type}
                variant="outline"
                onClick={() => addQuestion(type.type)}
                className="h-auto p-4 text-left flex-col items-start justify-start min-h-[88px]"
              >
                <div className="inline-flex items-center gap-x-2 mb-2 whitespace-nowrap">
                  <span className="text-primary-600 flex-shrink-0" aria-hidden="true">
                    {type.icon}
                  </span>
                  <Typography variant="body2" className="font-medium">
                    {type.label}
                  </Typography>
                </div>
                <Typography variant="caption" className="text-neutral-600 text-left">
                  {type.description}
                </Typography>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {quiz.questions && quiz.questions.length > 0 ? (
        <div className="space-y-4">
          <Typography variant="h6" className="font-semibold">
            Dina frågor ({quiz.questions.length})
          </Typography>
          
          {quiz.questions.map((question, index) => (
            <Card key={question.id || index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <Typography variant="body2" className="font-medium">
                        {question.title || 'Ny fråga'}
                      </Typography>
                      <Typography variant="caption" className="text-neutral-500">
                        {question.type === 'multiple-choice' && 'Flerval'}
                        {question.type === 'free-text' && 'Fritext'}
                        {question.type === 'image' && 'Bild'}
                        {question.points && ` • ${question.points} poäng`}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                    >
                      {expandedQuestion === index ? 'Dölj' : 'Redigera'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="text-error-600 hover:text-error-700 hover:border-error-300"
                    >
                      Ta bort
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedQuestion === index && (
                <CardContent className="pt-0 border-t">
                  <QuestionEditor
                    question={question}
                    questionIndex={index}
                    onChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                    onDelete={() => removeQuestion(index)}
                    onDuplicate={() => duplicateQuestion(index)}
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        /* Empty state */
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-sm mx-auto">
              <svg className="h-16 w-16 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <Typography variant="h6" className="mb-2">
                Inga frågor ännu
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mb-6">
                Kom igång genom att använda AI för att generera frågor eller lägg till manuellt.
              </Typography>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setShowAIModal(true)}
                  className="bg-primary-600 hover:bg-primary-700"
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                >
                  Skapa med AI
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addQuestion('multiple-choice')}
                >
                  Lägg till manuellt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Modal */}
      {showAIModal && (
        <ImprovedAIQuizDraft
          quizTitle={quiz.title}
          onQuestionsGenerated={handleAIQuestionsGenerated}
          onClose={() => setShowAIModal(false)}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <QuizPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          quiz={quiz}
        />
      )}

      {/* Progress indicator */}
      {quiz.questions && quiz.questions.length > 0 && (
        <Card className="bg-success-50 border-success-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <Typography variant="body2" className="font-medium text-success-800">
                  Bra jobbat! Du har {quiz.questions.length} fråga{quiz.questions.length !== 1 ? 'r' : ''}
                </Typography>
                <Typography variant="caption" className="text-success-700">
                  Du kan lägga till fler frågor eller gå vidare till nästa steg
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}