'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'

interface Step {
  key: string
  label: string
  number: number
}

interface WizardStepsProps {
  steps: Step[]
  currentStep: string
  onStepClick?: (step: string) => void
}

export function WizardSteps({ steps, currentStep, onStepClick }: WizardStepsProps) {
  const currentIndex = steps.findIndex(step => step.key === currentStep)

  const handleKeyDown = (event: React.KeyboardEvent, stepKey: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onStepClick?.(stepKey)
    }
  }

  return (
    <nav 
      className="flex items-center justify-between max-w-2xl mx-auto"
      aria-label="Steg i quiz-skapandet"
    >
      {steps.map((step, index) => {
        const isActive = step.key === currentStep
        const isCompleted = index < currentIndex
        const isClickable = onStepClick && (index <= currentIndex)

        return (
          <React.Fragment key={step.key}>
            <div 
              className={`flex items-center ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={isClickable ? () => onStepClick(step.key) : undefined}
              onKeyDown={isClickable ? (e) => handleKeyDown(e, step.key) : undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={isClickable ? `Gå till ${step.label}` : undefined}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Step circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-700 text-white border-primary-700 shadow-md' 
                    : isCompleted
                    ? 'bg-success-600 text-white border-success-600'
                    : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                  }
                  ${isClickable ? 'hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2' : ''}
                `}
                aria-hidden="true"
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              {/* Step label */}
              <div className="ml-3 text-left">
                <Typography 
                  variant="body2" 
                  className={`font-medium ${
                    isActive ? 'text-primary-700' : isCompleted ? 'text-success-700' : 'text-neutral-500'
                  }`}
                >
                  {step.label}
                </Typography>
                <Typography variant="caption" className="text-neutral-400">
                  Steg {step.number}
                </Typography>
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`
                  flex-1 h-0.5 mx-4 transition-all duration-300
                  ${index < currentIndex ? 'bg-success-600' : 'bg-neutral-200'}
                `}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}