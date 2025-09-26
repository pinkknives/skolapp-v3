'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { QuizBasicInfo } from '@/components/quiz/QuizBasicInfo'
import { QuestionEditor } from '@/components/quiz/QuestionEditor'
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
import { useEntitlements } from '@/hooks/useEntitlements'
import { AIFeatureBlock } from '@/components/billing/AIFeatureBlock'
import { QuizOnboarding } from '@/components/quiz/QuizOnboarding'
import { AIAssistantPanel } from '@/components/quiz/AIAssistantPanel'
import { toast } from '@/components/ui/Toast'
import { AIQuotaDisplay } from '@/components/billing/AIQuotaDisplay'

// Dynamically import AI components for better performance
const ImprovedAIQuizDraft = dynamic(() => import('@/components/quiz/ImprovedAIQuizDraft'), {
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

function CreateQuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [quiz, setQuiz] = useState<Partial<Quiz>>(() => createDefaultQuiz('teacher-1')) // Mock teacher ID
  // Docked AI panel is always visible when feature flag is enabled
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { canUseAI } = useEntitlements()
  const [showConsentPrompt, setShowConsentPrompt] = useState(false)
  const [consentLoading, setConsentLoading] = useState(true)

  useEffect(() => {
    const checkConsent = async () => {
      try {
        // only prompt once per browser unless explicitly reset
        const key = 'sk_consent_prompt_shown_v1'
        const shown = typeof window !== 'undefined' ? localStorage.getItem(key) : '1'
        if (shown === '1') {
          setConsentLoading(false)
          return
        }
        const resp = await fetch('/api/user/settings/consent', { method: 'GET' })
        if (resp.ok) {
          const data = await resp.json()
          if (!data.consent) setShowConsentPrompt(true)
        }
      } finally {
        setConsentLoading(false)
      }
    }
    checkConsent()
  }, [])
  const dockedEnabled = process.env.NEXT_PUBLIC_FEATURE_QUIZ_AI_DOCKED !== 'false'

  // Check for ai-draft URL parameter
  useEffect(() => {
    // legacy: ?type=ai-draft no longer toggles modal
  }, [searchParams, canUseAI])

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
    toast.success(`${questions.length} frågor tillagda`)
  }

  // Wire per-question AI actions to open panel/sheet with context (handled inside ImprovedAIQuizDraft via global store in later tasks)
  const [pendingAction, setPendingAction] = React.useState<{
    action: 'improve' | 'simplify' | 'distractors' | 'regenerate';
    question: Question;
    index: number;
  } | null>(null)
  const [batchMode, setBatchMode] = React.useState<'replace' | 'add' | null>(null)

  // Simple per-question undo ring buffer (size 1)
  const undoBufferRef = React.useRef<Record<string, Question>>({})

  const handleAIActionRequested = (params: { action: 'improve' | 'simplify' | 'distractors' | 'regenerate'; question: Question; index: number }) => {
    setPendingAction(params)
    try {
      const el = document.querySelector('[aria-label="AI-hjälp"]') as HTMLElement | null
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {}
  }

  const handleReplaceQuestionAt = (idx: number, updated: Question) => {
    setQuiz(prev => {
      const questions = prev.questions || []
      const prevQ = questions[idx]
      if (prevQ) {
        undoBufferRef.current[prevQ.id] = prevQ
      }
      const next = { ...prev, questions: questions.map((q, i) => (i === idx ? updated : q)) }
      return next
    })
    // Auto-scroll to the updated card and focus its title input
    setTimeout(() => {
      try {
        const card = document.querySelector(`[data-question-index="${idx}"]`) as HTMLElement | null
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const input = card?.querySelector('input, textarea') as HTMLElement | null
        input?.focus()
      } catch {}
    }, 50)

    // Toast with undo
    toast.success('Fråga uppdaterad', {
      action: {
        label: 'Ångra',
        onClick: () => {
          setQuiz(prev => {
            const questions = prev.questions || []
            const current = questions[idx]
            const prevVersion = current ? undoBufferRef.current[current.id] : undefined
            if (!prevVersion) return prev
            const next = { ...prev, questions: questions.map((q, i) => (i === idx ? prevVersion : q)) }
            return next
          })
        }
      }
    })
  }

  const handleBatchReplace = (newQuestions: Question[]) => {
    setQuiz(prev => ({ ...prev, questions: newQuestions }))
    toast.success(`Ersatte med ${newQuestions.length} frågor`)
  }

  const saveDraft = async () => {
    setIsSaving(true)
    try {
      const draftQuiz = {
        ...quiz,
        id: quiz.id || generateQuizId(),
        createdAt: quiz.createdAt || new Date(),
        updatedAt: new Date(),
        status: 'draft' as const,
      }

      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1200))

      setQuiz(draftQuiz)
      try { localStorage.setItem('sk_last_quiz_created_at', String(Date.now())) } catch {}

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving draft:', error)
      }
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
      try { localStorage.setItem('sk_last_quiz_created_at', String(Date.now())) } catch {}
      
      // In a real app, you would save to a database
      // Quiz published successfully
      
      // Redirect to quiz dashboard or show success
      router.push(`/teacher/quiz/${publishedQuiz.id}?published=true`)
    } catch (error) {
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error publishing quiz:', error)
      }
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
          {/* Consent prompt modal */}
          {showConsentPrompt && !consentLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                <div className="p-6 border-b">
                  <Heading level={3}>Får vi använda dina quiz anonymiserat?</Heading>
                  <Typography variant="body2" className="text-neutral-600 mt-2">
                    Om du samtycker kan dina quizfrågor användas anonymt för att förbättra AI‑förslagen för alla lärare.
                  </Typography>
                </div>
                <div className="p-6 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await fetch('/api/user/settings/consent', {
                          method: 'PATCH',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({ consent: false })
                        })
                      } finally {
                        try { localStorage.setItem('sk_consent_prompt_shown_v1', '1') } catch {}
                        setShowConsentPrompt(false)
                      }
                    }}
                  >
                    Nej, inte nu
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await fetch('/api/user/settings/consent', {
                          method: 'PATCH',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({ consent: true })
                        })
                      } finally {
                        try { localStorage.setItem('sk_consent_prompt_shown_v1', '1') } catch {}
                        setShowConsentPrompt(false)
                      }
                    }}
                  >
                    Ja, jag samtycker
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="mb-12 space-y-4">
            <Heading level={1}>
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
                  {canUseAI ? (
                    <div />
                  ) : (
                      <Button 
                        variant="outline" 
                        disabled
                        className="opacity-50"
                        title="Kräver premium-prenumeration"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI-utkast 🔒
                      </Button>
                    )}
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
                        leftIcon={
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        }
                      >
                        Flerval
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion('free-text')}
                        leftIcon={
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      >
                        Fritext
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion('image')}
                        leftIcon={
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        }
                      >
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
                          onAIActionRequested={handleAIActionRequested}
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
              <AIQuotaDisplay />
              {/* AI Assistant */}
              {canUseAI ? (
                <AIAssistantPanel
                  onGenerateQuestions={() => {}}
                  onGenerateTitle={() => {/* TODO: Implement title generation */}}
                  onGenerateAnswers={() => {/* TODO: Implement answer generation */}}
                  onSimplifyText={() => {/* TODO: Implement text simplification */}}
                  isGenerating={false}
                  hasQuestions={!!(quiz.questions && quiz.questions.length > 0)}
                  subject={''}
                  gradeLevel={''}
                />
              ) : (
                <AIFeatureBlock
                  featureName="AI-assistent"
                  description="Låt AI hjälpa dig att skapa frågor, förbättra texter och generera svar automatiskt."
                  onUpgrade={() => {}}
                />
              )}

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

          {/* Docked AI Panel on desktop, sheet on mobile */}
          {canUseAI && dockedEnabled && (
            <>
              <div className="hidden lg:block">
                <ImprovedAIQuizDraft
                  quizTitle={quiz.title}
                  onQuestionsGenerated={handleAIQuestionsGenerated}
                  onClose={() => {}}
                  variant="panel"
                  pendingAction={pendingAction}
                  onReplaceQuestion={handleReplaceQuestionAt}
                  onClearPending={() => setPendingAction(null)}
                  batchMode={batchMode}
                  onSetBatchMode={setBatchMode}
                  onBatchReplace={handleBatchReplace}
                />
              </div>
              <div className="lg:hidden">
                <ImprovedAIQuizDraft
                  quizTitle={quiz.title}
                  onQuestionsGenerated={handleAIQuestionsGenerated}
                  onClose={() => {}}
                  variant="sheet"
                  pendingAction={pendingAction}
                  onReplaceQuestion={handleReplaceQuestionAt}
                  onClearPending={() => setPendingAction(null)}
                  batchMode={batchMode}
                  onSetBatchMode={setBatchMode}
                  onBatchReplace={handleBatchReplace}
                />
              </div>
            </>
          )}

          {/* AI Feature Paywall Modal (kept for future toggle) */}
          {false && !canUseAI && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">AI-assisterad quiz</Typography>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {}}
                      className="text-neutral-500 hover:text-neutral-700"
                    >
                      ✕
                    </Button>
                  </div>
                  <AIFeatureBlock
                    featureName="AI-assisterad quiz-generering"
                    description="Låt AI hjälpa dig att skapa engagerande quiz baserat på ditt ämne och mål. Få intelligenta förslag på frågor, svar och feedback."
                    onUpgrade={() => {}}
                  />
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <QuizOnboarding
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
    </Layout>
  )
}

function CreateQuizPageWrapper() {
  return (
    <Suspense fallback={
      <Layout>
        <Section>
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <Typography variant="body2">Laddar quiz-skapare...</Typography>
              </div>
            </div>
          </Container>
        </Section>
      </Layout>
    }>
      <CreateQuizPage />
    </Suspense>
  )
}

export default CreateQuizPageWrapper