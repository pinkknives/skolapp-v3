'use client'

import React, { useState } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { QuizBasicInfo } from '@/components/quiz/QuizBasicInfo'
import { QuestionEditor } from '@/components/quiz/QuestionEditor'
import { AIQuizDraft } from '@/components/quiz/AIQuizDraft'
import { Quiz, Question, QuestionType } from '@/types/quiz'
import { 
  createDefaultQuiz, 
  createDefaultQuestion, 
  validateQuiz, 
  generateShareCode,
  generateQuizId,
  calculateTotalPoints,
  estimateCompletionTime
} from '@/lib/quiz-utils'
import { useRouter } from 'next/navigation'

export default function CreateQuizPage() {
  const router = useRouter()
  const [quiz, setQuiz] = useState<Partial<Quiz>>(() => createDefaultQuiz('teacher-1')) // Mock teacher ID
  const [showAIDraft, setShowAIDraft] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const updateQuiz = (updates: Partial<Quiz>) => {
    setQuiz(prev => ({ ...prev, ...updates }))
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const addQuestion = (type: QuestionType) => {
    const newQuestion = createDefaultQuestion(type) as Question
    setQuiz(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }))
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => i === index ? updatedQuestion : q) || []
    }))
  }

  const deleteQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || []
    }))
  }

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = quiz.questions?.[index]
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${questionToDuplicate.title} (kopia)`
      }
      setQuiz(prev => ({
        ...prev,
        questions: [
          ...(prev.questions?.slice(0, index + 1) || []),
          duplicatedQuestion,
          ...(prev.questions?.slice(index + 1) || [])
        ]
      }))
    }
  }

  const handleAIQuestionsGenerated = (questions: Question[]) => {
    setQuiz(prev => ({
      ...prev,
      questions: [...(prev.questions || []), ...questions]
    }))
  }

  const saveDraft = async () => {
    setIsSaving(true)
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedQuiz = {
        ...quiz,
        id: quiz.id || generateQuizId(),
        updatedAt: new Date(),
        status: 'draft' as const
      }
      
      setQuiz(updatedQuiz)
      
      // In a real app, you would save to a database
      console.log('Draft saved:', updatedQuiz)
      
      // Show success message (in a real app, use a toast notification)
      alert('Utkast sparat!')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Fel vid sparande av utkast')
    } finally {
      setIsSaving(false)
    }
  }

  const publishQuiz = async () => {
    const validation = validateQuiz(quiz)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setIsSaving(true)
    try {
      const shareCode = generateShareCode()
      const publishedQuiz = {
        ...quiz,
        id: quiz.id || generateQuizId(),
        createdAt: quiz.createdAt || new Date(),
        updatedAt: new Date(),
        status: 'published' as const,
        shareCode
      }

      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setQuiz(publishedQuiz)
      
      // In a real app, you would save to a database
      console.log('Quiz published:', publishedQuiz)
      
      // Redirect to quiz dashboard or show success
      router.push(`/teacher/quiz/${publishedQuiz.id}?published=true`)
    } catch (error) {
      console.error('Error publishing quiz:', error)
      alert('Fel vid publicering av quiz')
    } finally {
      setIsSaving(false)
    }
  }

  const totalPoints = calculateTotalPoints(quiz.questions || [])
  const estimatedTime = estimateCompletionTime(quiz.questions || [])

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="mb-8">
            <Heading level={1} className="mb-2">
              Skapa nytt quiz
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600">
              Skapa engagerande quiz för dina elever med hjälp av AI eller manuellt.
            </Typography>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="mb-6 border-error-200 bg-error-50">
              <CardContent>
                <Typography variant="body2" className="font-medium text-error-800 mb-2">
                  Åtgärda följande fel innan publicering:
                </Typography>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-error-700">{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Quiz Statistics */}
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-600">
                <div>
                  <span className="font-medium">{quiz.questions?.length || 0}</span> frågor
                </div>
                <div>
                  <span className="font-medium">{totalPoints}</span> poäng totalt
                </div>
                <div>
                  <span className="font-medium">{estimatedTime}</span> min uppskattat
                </div>
                <div>
                  Status: <span className="font-medium">{quiz.status === 'draft' ? 'Utkast' : 'Publicerad'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <QuizBasicInfo quiz={quiz} onChange={updateQuiz} />

              {/* Questions Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Frågor</CardTitle>
                    <Button onClick={() => setShowAIDraft(true)} variant="outline">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI-utkast
                    </Button>
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
                    <div>
                      {quiz.questions.map((question, index) => (
                        <QuestionEditor
                          key={question.id}
                          question={question}
                          questionIndex={index}
                          onChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                          onDelete={() => deleteQuestion(index)}
                          onDuplicate={() => duplicateQuestion(index)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <svg className="h-12 w-12 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <Typography variant="body1" className="mb-2">Inga frågor ännu</Typography>
                      <Typography variant="caption">
                        Lägg till din första fråga genom att klicka på en av knapparna ovan eller använd AI-utkast.
                      </Typography>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Action Buttons */}
              <Card>
                <CardContent className="space-y-3">
                  <Button
                    fullWidth
                    onClick={saveDraft}
                    loading={isSaving && quiz.status === 'draft'}
                    variant="outline"
                  >
                    Spara utkast
                  </Button>
                  
                  <Button
                    fullWidth
                    onClick={publishQuiz}
                    loading={isSaving && quiz.status !== 'draft'}
                    disabled={!quiz.title || !quiz.questions?.length}
                  >
                    Publicera quiz
                  </Button>
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>• Använd tydliga och enkla formuleringar</li>
                    <li>• Testa ditt quiz innan du publicerar</li>
                    <li>• AI-utkast kan hjälpa dig komma igång snabbt</li>
                    <li>• Lägg till bilder för att göra quizet mer engagerande</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Draft Modal */}
          {showAIDraft && (
            <AIQuizDraft
              onQuestionsGenerated={handleAIQuestionsGenerated}
              onClose={() => setShowAIDraft(false)}
            />
          )}
        </Container>
      </Section>
    </Layout>
  )
}