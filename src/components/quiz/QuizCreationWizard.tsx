'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Quiz, Question } from '@/types/quiz'
import { WizardSteps } from './WizardSteps'
import { QuizBasicInfoStep } from './QuizBasicInfoStep'
import { QuizQuestionsStep } from './QuizQuestionsStep'
import { QuizPublishStep } from './QuizPublishStep'
import { motion, AnimatePresence } from 'framer-motion'

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
      onComplete(quiz as Quiz)
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
            onStepClick={(step: string) => setCurrentStep(step as WizardStep)}
          />
        </CardContent>
      </Card>

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
              />
            )}
            
            {currentStep === 'questions' && (
              <QuizQuestionsStep
                quiz={quiz}
                onChange={updateQuiz}
                onValidationChange={setIsValid}
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