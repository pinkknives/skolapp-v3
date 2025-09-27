'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Card, CardContent } from '@/components/ui/Card'
import { Quiz } from '@/types/quiz'
import { WizardSteps } from './WizardSteps'
import { motion, AnimatePresence } from 'framer-motion'
import { QuizBasicInfoStep } from './QuizBasicInfoStep'
import { QuizQuestionsStep } from './QuizQuestionsStep'
import { QuizPublishStep } from './QuizPublishStep'
import { toast } from '@/components/ui/Toast'

interface QuizCreationWizardProps {
  initialQuiz: Partial<Quiz>
  onComplete: (quiz: Quiz) => void
}

type WizardStep = 'info' | 'questions' | 'publish'

const steps: { key: WizardStep; label: string; number: number }[] = [
  { key: 'info', label: 'Grundläggande information', number: 1 },
  { key: 'questions', label: 'Frågor och innehåll', number: 2 },
  { key: 'publish', label: 'Granska och publicera', number: 3 },
]

export function QuizCreationWizard({ initialQuiz, onComplete }: QuizCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('info')
  const [quiz, setQuiz] = useState<Partial<Quiz>>(initialQuiz)
  const [isValid, setIsValid] = useState(false)
  
  // Track AI context for hints
  const [aiContext, setAiContext] = useState<{
    subject?: string
    gradeLevel?: string
  }>({})
  const [slideSuggestions, setSlideSuggestions] = useState<string[]>([])
  const [isImportingSlides, setIsImportingSlides] = useState(false)

  const updateQuiz = (updates: Partial<Quiz>) => {
    const updatedQuiz = { ...quiz, ...updates }
    setQuiz(updatedQuiz)
    validateCurrentStep(updatedQuiz)
  }

  const validateCurrentStep = (currentQuiz: Partial<Quiz>) => {
    switch (currentStep) {
      case 'info':
        setIsValid(!!(currentQuiz.title && currentQuiz.title.trim().length > 0))
        break
      case 'questions':
        setIsValid(!!(currentQuiz.questions && currentQuiz.questions.length > 0))
        break
      case 'publish':
        setIsValid(!!(currentQuiz.title && currentQuiz.questions && currentQuiz.questions.length > 0))
        break
      default:
        setIsValid(false)
    }
  }

  const goToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep)
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].key
      setCurrentStep(nextStep)
      // Re-validate for the new step
      setTimeout(() => validateCurrentStep(quiz), 0)
      
      // Toast feedback
      toast.success(`Går till steg ${currentIndex + 2}: ${steps[currentIndex + 1].label}`)
    }
  }

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep)
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1].key
      setCurrentStep(prevStep)
      // Re-validate for the new step
      setTimeout(() => validateCurrentStep(quiz), 0)
    }
  }

  const handleComplete = () => {
    if (isValid && quiz.title && quiz.questions) {
      toast.success('Quiz skapades framgångsrikt! 🎉')
      onComplete(quiz as Quiz)
    } else {
      toast.error('Vänligen fyll i alla obligatoriska fält')
    }
  }

  const getCurrentStepNumber = () => {
    return steps.find(step => step.key === currentStep)?.number || 1
  }

  const isFirstStep = currentStep === 'info'
  const isLastStep = currentStep === 'publish'

  // Animation variants
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with steps */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <WizardSteps
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step as WizardStep)}
          />
        </CardContent>
      </Card>

      {/* Slides import (AE2) */}
      {currentStep === 'questions' && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <Typography variant="h6">Importera slides (MVP)</Typography>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const input = (e.currentTarget.elements.namedItem('slides') as HTMLInputElement)
                const file = input?.files?.[0]
                if (!file) return
                setIsImportingSlides(true)
                try {
                  const fd = new FormData()
                  fd.append('file', file)
                  const resp = await fetch('/api/import/slides', { method: 'POST', body: fd })
                  const data = await resp.json()
                  setSlideSuggestions(data.suggestions || [])
                } finally {
                  setIsImportingSlides(false)
                }
              }}
              className="flex items-center gap-3"
            >
              <input name="slides" type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
              <Button type="submit" disabled={isImportingSlides}>{isImportingSlides ? 'Importerar…' : 'Importera'}</Button>
            </form>
            {slideSuggestions.length > 0 && (
              <div>
                <Typography variant="subtitle2" className="mb-2">Förslag</Typography>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {slideSuggestions.map((s, i) => (<li key={i}>{s}</li>))}
                </ul>
                <div className="mt-2">
                  <Button
                    onClick={() => {
                      const qs = slideSuggestions.slice(0, 8).map((t, idx) => ({ id: `q-${Date.now()}-${idx}`, type: 'multiple-choice', title: t, points: 1, options: [ { id: 'a', text: 'A', isCorrect: true }, { id: 'b', text: 'B', isCorrect: false }, { id: 'c', text: 'C', isCorrect: false }, { id: 'd', text: 'D', isCorrect: false } ] }))
                      updateQuiz({ questions: qs as unknown as Quiz['questions'] })
                    }}
                  >Lägg till som frågor</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main content */}
      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait" custom={getCurrentStepNumber()}>
          <motion.div
            key={currentStep}
            custom={getCurrentStepNumber()}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            {currentStep === 'info' && (
              <QuizBasicInfoStep
                quiz={quiz}
                onChange={updateQuiz}
                onValidationChange={setIsValid}
                onAiContextChange={setAiContext}
              />
            )}
            
            {currentStep === 'questions' && (
              <QuizQuestionsStep
                quiz={quiz}
                onChange={updateQuiz}
                onValidationChange={setIsValid}
                gradeLevel={aiContext.gradeLevel}
              />
            )}
            
            {currentStep === 'publish' && (
              <QuizPublishStep
                quiz={quiz}
                onChange={updateQuiz}
                onValidationChange={setIsValid}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Föregående
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Typography variant="caption" className="text-neutral-500">
                Steg {getCurrentStepNumber()} av {steps.length}
              </Typography>
              
              {!isLastStep ? (
                <Button
                  onClick={goToNextStep}
                  disabled={!isValid}
                  className="flex items-center gap-2"
                >
                  Nästa
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!isValid}
                  className="flex items-center gap-2 bg-success-600 hover:bg-success-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Publicera quiz
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}