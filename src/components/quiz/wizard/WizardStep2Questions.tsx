'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Quiz, Question, QuestionType } from '@/types/quiz'
import { QuestionEditor } from '@/components/quiz/QuestionEditor'
import { AIQuizDraft } from '@/components/quiz/AIQuizDraft'
import { createDefaultQuestion } from '@/lib/quiz-utils'

interface WizardStep2QuestionsProps {
  quiz: Partial<Quiz>
  onChange: (updates: Partial<Quiz>) => void
  onNext: () => void
  onPrev: () => void
}

export function WizardStep2Questions({ 
  quiz, 
  onChange, 
  onNext, 
  onPrev 
}: WizardStep2QuestionsProps) {
  const [showAIDraft, setShowAIDraft] = useState(false)

  const addQuestion = (type: QuestionType) => {
    const newQuestion = createDefaultQuestion(type) as Question
    onChange({
      questions: [...(quiz.questions || []), newQuestion]
    })
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = quiz.questions?.map((q, i) => 
      i === index ? updatedQuestion : q
    ) || []
    onChange({ questions: updatedQuestions })
  }

  const deleteQuestion = (index: number) => {
    const updatedQuestions = quiz.questions?.filter((_, i) => i !== index) || []
    onChange({ questions: updatedQuestions })
  }

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = quiz.questions?.[index]
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: `question_${Date.now()}`, // Generate new ID
        title: `${questionToDuplicate.title} (kopia)`
      } as Question
      
      const updatedQuestions = [...(quiz.questions || [])]
      updatedQuestions.splice(index + 1, 0, duplicatedQuestion)
      onChange({ questions: updatedQuestions })
    }
  }

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const updatedQuestions = [...(quiz.questions || [])]
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1)
    updatedQuestions.splice(toIndex, 0, movedQuestion)
    onChange({ questions: updatedQuestions })
  }

  const handleAIQuestionsGenerated = (questions: Question[]) => {
    onChange({
      questions: [...(quiz.questions || []), ...questions]
    })
    setShowAIDraft(false)
  }

  const canProceed = quiz.questions && quiz.questions.length > 0

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-neutral-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h6" className="mb-1">
                {quiz.title}
              </Typography>
              <Typography variant="body2" className="text-neutral-600">
                {quiz.questions?.length || 0} frågor • 
                {quiz.questions?.reduce((sum, q) => sum + q.points, 0) || 0} poäng totalt
              </Typography>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAIDraft(true)}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-hjälp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Frågor</CardTitle>
            <Typography variant="caption" className="text-neutral-500">
              Dra och släpp för att ändra ordning
            </Typography>
          </div>
        </CardHeader>
        <CardContent>
          {/* Question Type Selector */}
          <div className="mb-6">
            <Typography variant="body2" className="mb-3 font-medium text-neutral-700">
              Lägg till fråga:
            </Typography>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('multiple-choice')}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Flerval
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('free-text')}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Fritext
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('image')}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Bild
              </Button>
            </div>
          </div>

          {/* Questions List */}
          {quiz.questions && quiz.questions.length > 0 ? (
            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="relative">
                  {/* Drag handle */}
                  <div className="absolute left-2 top-6 cursor-move text-neutral-400 hover:text-neutral-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                  
                  <div className="ml-8">
                    <QuestionEditor
                      question={question}
                      questionIndex={index}
                      onChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                      onDelete={() => deleteQuestion(index)}
                      onDuplicate={() => duplicateQuestion(index)}
                    />
                  </div>

                  {/* Move buttons for accessibility */}
                  <div className="absolute right-2 top-6 flex flex-col gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => moveQuestion(index, index - 1)}
                        className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                        title="Flytta upp"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    )}
                    {index < (quiz.questions?.length || 1) - 1 && (
                      <button
                        onClick={() => moveQuestion(index, index + 1)}
                        className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                        title="Flytta ner"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <svg className="h-16 w-16 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <Typography variant="h6" className="mb-2">Inga frågor ännu</Typography>
              <Typography variant="body2" className="mb-4">
                Lägg till din första fråga genom att klicka på en av knapparna ovan eller använd AI-hjälp.
              </Typography>
              <Button 
                variant="outline" 
                onClick={() => setShowAIDraft(true)}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Skapa med AI-hjälp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-neutral-50">
        <CardContent className="py-4">
          <Typography variant="body2" className="font-medium mb-2 text-neutral-700">
            Tips för bra frågor:
          </Typography>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>• Använd tydliga och enkla formuleringar</li>
            <li>• Undvik dubbla negationer</li>
            <li>• Se till att svarsalternativen inte överlappar</li>
            <li>• Testa frågan genom att läsa den högt</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onPrev}>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tillbaka
        </Button>

        <Button 
          onClick={onNext}
          disabled={!canProceed}
        >
          Fortsätt till publicering
          <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* AI Draft Modal */}
      {showAIDraft && (
        <AIQuizDraft
          onQuestionsGenerated={handleAIQuestionsGenerated}
          onClose={() => setShowAIDraft(false)}
        />
      )}
    </div>
  )
}