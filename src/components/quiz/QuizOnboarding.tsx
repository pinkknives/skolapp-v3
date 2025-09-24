'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react'

interface QuizOnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

export function QuizOnboarding({ onComplete, onSkip }: QuizOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: <Sparkles className="w-8 h-8 text-primary-600" />,
      title: "Välkommen till Quiz-skaparen!",
      description: "Låt oss gå igenom hur du skapar engagerande quiz för dina elever.",
      content: (
        <div className="space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <Typography variant="body2" className="text-primary-800">
              <strong>Pro tip:</strong> Du kan använda AI för att generera hela quiz eller enskilda frågor automatiskt!
            </Typography>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span>AI-genererade frågor</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span>Automatisk bedömning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span>Live-sessioner</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span>Detaljerade rapporter</span>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary-600" />,
      title: "Steg 1: Grundläggande information",
      description: "Börja med att ge ditt quiz en titel och beskrivning.",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-600">1</span>
              </div>
              <div>
                <Typography variant="body2" className="font-medium">Titel</Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Välj en tydlig titel som beskriver vad quizet handlar om
                </Typography>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-600">2</span>
              </div>
              <div>
                <Typography variant="body2" className="font-medium">Beskrivning</Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Förklara vad eleverna kommer att lära sig
                </Typography>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-600">3</span>
              </div>
              <div>
                <Typography variant="body2" className="font-medium">Inställningar</Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Välj tidsgräns, genomförandeläge och andra alternativ
                </Typography>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Steg 2: Skapa frågor",
      description: "Lägg till frågor manuellt eller låt AI hjälpa dig.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-neutral-200 rounded-lg p-4">
              <Typography variant="body2" className="font-medium mb-2">Manuellt</Typography>
              <Typography variant="caption" className="text-neutral-600">
                Skapa frågor själv med flerval, fritext eller andra typer
              </Typography>
            </div>
            <div className="border border-primary-200 bg-primary-50 rounded-lg p-4">
              <Typography variant="body2" className="font-medium mb-2 text-primary-800">
                Med AI-assistent
              </Typography>
              <Typography variant="caption" className="text-primary-700">
                Låt AI generera frågor baserat på ämne och årskurs
              </Typography>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Typography variant="body2" className="text-blue-800 font-medium mb-1">
              💡 AI-tips
            </Typography>
            <Typography variant="caption" className="text-blue-700">
              AI kan generera frågor baserat på Skolverkets läroplaner och anpassa svårighetsgraden efter årskurs.
            </Typography>
          </div>
        </div>
      )
    },
    {
      icon: <Clock className="w-8 h-8 text-primary-600" />,
      title: "Steg 3: Publicera och kör",
      description: "Granska ditt quiz och publicera det för eleverna.",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-600">1</span>
              </div>
              <div>
                <Typography variant="body2" className="font-medium">Förhandsgranska</Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Se hur quizet kommer att se ut för eleverna
                </Typography>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-600">2</span>
              </div>
              <div>
                <Typography variant="body2" className="font-medium">Publicera</Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Spara quizet och få en delningskod för eleverna
                </Typography>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-600">3</span>
              </div>
              <div>
                <Typography variant="body2" className="font-medium">Kör live-session</Typography>
                <Typography variant="caption" className="text-neutral-600">
                  Starta en live-session där du styr tempot
                </Typography>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            {currentStepData.icon}
          </div>
          <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
          <Typography variant="body2" className="text-neutral-600">
            {currentStepData.description}
          </Typography>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep 
                    ? 'bg-primary-600' 
                    : index < currentStep 
                    ? 'bg-primary-300' 
                    : 'bg-neutral-300'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-neutral-500"
              >
                <X className="w-4 h-4 mr-2" />
                Hoppa över
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                >
                  Föregående
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                rightIcon={<ArrowRight size={16} />}
              >
                {isLastStep ? 'Kom igång!' : 'Nästa'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
