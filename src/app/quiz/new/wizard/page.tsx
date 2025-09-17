'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Quiz, Question } from '@/types/quiz'
import { createDefaultQuiz, generateQuizId, generateShareCode } from '@/lib/quiz-utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { WizardStep1BasicInfo } from '@/components/quiz/wizard/WizardStep1BasicInfo'
import { WizardStep2Questions } from '@/components/quiz/wizard/WizardStep2Questions'
import { WizardStep3Publish } from '@/components/quiz/wizard/WizardStep3Publish'

type QuizType = 'empty' | 'template' | 'ai-draft'
type WizardStep = 1 | 2 | 3

const stepTitles = {
  1: 'Grundinformation',
  2: 'Frågor', 
  3: 'Publicera & dela'
}

export default function QuizWizardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quizType = searchParams.get('type') as QuizType || 'empty'
  
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [quiz, setQuiz] = useState<Partial<Quiz>>(() => createDefaultQuiz('teacher-1'))
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (quiz.title || quiz.description || quiz.questions?.length) {
        await autoSave()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [quiz])

  const autoSave = async () => {
    setIsAutoSaving(true)
    try {
      // Mock auto-save operation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedQuiz = {
        ...quiz,
        id: quiz.id || generateQuizId(),
        updatedAt: new Date(),
        status: 'draft' as const
      }
      
      setQuiz(updatedQuiz)
      setLastSaved(new Date())
      
      console.log('Auto-saved quiz:', updatedQuiz)
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  const updateQuiz = (updates: Partial<Quiz>) => {
    setQuiz(prev => ({ ...prev, ...updates }))
  }

  const canProceedToStep = (step: WizardStep): boolean => {
    switch (step) {
      case 2:
        return !!(quiz.title?.trim())
      case 3:
        return !!(quiz.title?.trim() && quiz.questions?.length)
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStep < 3 && canProceedToStep(currentStep + 1 as WizardStep)) {
      setCurrentStep((prev) => (prev + 1) as WizardStep)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep)
    }
  }

  const goToStep = (step: WizardStep) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step)
    }
  }

  const handlePublish = async () => {
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

      // Mock publish operation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setQuiz(publishedQuiz)
      
      console.log('Quiz published:', publishedQuiz)
      
      // Redirect to quiz management with success message
      router.push(`/teacher/quiz?published=${publishedQuiz.id}`)
    } catch (error) {
      console.error('Error publishing quiz:', error)
      alert('Fel vid publicering av quiz')
    }
  }

  const getStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WizardStep1BasicInfo 
            quiz={quiz}
            quizType={quizType}
            onChange={updateQuiz}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <WizardStep2Questions 
            quiz={quiz}
            onChange={updateQuiz}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <WizardStep3Publish 
            quiz={quiz}
            onChange={updateQuiz}
            onPublish={handlePublish}
            onPrev={prevStep}
          />
        )
      default:
        return null
    }
  }

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Header with progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Heading level={1} className="mb-2">
                    Skapa nytt quiz
                  </Heading>
                  <Typography variant="subtitle1" className="text-neutral-600">
                    {stepTitles[currentStep]}
                  </Typography>
                </div>
                
                {/* Auto-save indicator */}
                <div className="text-right">
                  {isAutoSaving && (
                    <Typography variant="caption" className="text-primary-600 block mb-1">
                      Sparar...
                    </Typography>
                  )}
                  {lastSaved && !isAutoSaving && (
                    <Typography variant="caption" className="text-neutral-500 block mb-1">
                      Senast sparad {lastSaved.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  )}
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <button
                      onClick={() => goToStep(step as WizardStep)}
                      disabled={!canProceedToStep(step as WizardStep)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step === currentStep
                          ? 'bg-primary-600 text-white'
                          : step < currentStep
                          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                          : canProceedToStep(step as WizardStep)
                          ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      {step < currentStep ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step
                      )}
                    </button>
                    
                    <div className="ml-3 mr-6">
                      <Typography 
                        variant="body2" 
                        className={`font-medium ${
                          step === currentStep 
                            ? 'text-primary-700' 
                            : step < currentStep 
                            ? 'text-neutral-700' 
                            : 'text-neutral-500'
                        }`}
                      >
                        {stepTitles[step as WizardStep]}
                      </Typography>
                    </div>

                    {step < 3 && (
                      <div className={`flex-1 h-px ${
                        step < currentStep ? 'bg-primary-300' : 'bg-neutral-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="mb-8">
              {getStepComponent()}
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}