'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Quiz, Question, QuestionType } from '@/types/quiz'
import { QuestionEditor } from './QuestionEditor'
import { AIPanel } from './ai/AIPanel'
import { createDefaultQuestion } from '@/lib/quiz-utils'
import { useEntitlements } from '@/hooks/useEntitlements'

interface QuizQuestionsStepProps {
  quiz: Partial<Quiz>
  onChange: (updates: Partial<Quiz>) => void
  onValidationChange: (isValid: boolean) => void
}

export function QuizQuestionsStep({ quiz, onChange, onValidationChange }: QuizQuestionsStepProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const { canUseAI } = useEntitlements()

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 112.828 2.828L16 9.172a2 2 0 012.828 0L20 10m-6 6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Content + Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
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
                    Skapa engagerande frågor för dina elever. Använd AI-assistenten till höger eller lägg till manuellt.
                  </Typography>
                  
                  {/* Manual Question Creation */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {questionTypes.map(({ type, label, icon, description }) => (
                      <Button
                        key={type}
                        onClick={() => addQuestion(type)}
                        variant="outline"
                        className="border-primary-300 text-primary-700 hover:bg-primary-50 flex items-center gap-2 justify-start"
                        title={description}
                      >
                        {icon}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          {quiz.questions && quiz.questions.length > 0 ? (
            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <Card key={question.id} className="border-neutral-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-medium text-neutral-600">
                          {index + 1}
                        </div>
                        <div>
                          <Typography variant="body2" className="font-medium text-neutral-900">
                            {question.title || 'Otitlad fråga'}
                          </Typography>
                          <Typography variant="caption" className="text-neutral-500">
                            {questionTypes.find(t => t.type === question.type)?.label} • {question.points} poäng
                          </Typography>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                          className="text-neutral-600"
                        >
                          {expandedQuestion === index ? 'Dölj' : 'Redigera'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateQuestion(index)}
                          className="text-neutral-600"
                          title="Duplicera fråga"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          className="text-error-600 border-error-300 hover:bg-error-50"
                          title="Ta bort fråga"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedQuestion === index && (
                    <CardContent className="pt-0">
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
            <Card className="border-dashed border-2 border-neutral-300">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <Typography variant="h6" className="text-neutral-900 mb-2">
                  Inga frågor ännu
                </Typography>
                <Typography variant="body2" className="text-neutral-600 mb-6">
                  Lägg till din första fråga genom att klicka på en av knapparna ovan eller använd AI-assistenten.
                </Typography>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {questionTypes.slice(0, 2).map(({ type, label, icon }) => (
                    <Button
                      key={type}
                      onClick={() => addQuestion(type)}
                      variant="outline"
                      className="border-primary-300 text-primary-700 hover:bg-primary-50 flex items-center gap-2"
                    >
                      {icon}
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Sidebar */}
        {canUseAI && (
          <div className="lg:w-96">
            <div className="lg:sticky lg:top-6">
              <AIPanel onQuestionsGenerated={handleAIQuestionsGenerated} />
            </div>
          </div>
        )}
        
        {/* AI Feature Block for users without entitlements */}
        {!canUseAI && (
          <div className="lg:w-96">
            <div className="lg:sticky lg:top-6">
              <Card className="border-neutral-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Typography variant="h6" className="text-neutral-900 mb-2">
                    AI-utkast 🔒
                  </Typography>
                  <Typography variant="body2" className="text-neutral-600 mb-4">
                    Kräver premium-prenumeration för att generera frågor automatiskt med AI.
                  </Typography>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    Uppgradera för AI-funktioner
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
