'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { SubscriptionPlanSelector } from './SubscriptionPlanSelector'
import { type SubscriptionPlan, type DataRetentionMode, type User } from '@/types/auth'

interface SubscriptionOnboardingProps {
  user?: User
  onComplete: (plan: SubscriptionPlan, dataMode: DataRetentionMode) => void
  onNeedConsent?: () => void
  className?: string
}

type OnboardingStep = 'welcome' | 'plan-selection' | 'confirmation'

export function SubscriptionOnboarding({
  user,
  onComplete,
  onNeedConsent,
  className
}: SubscriptionOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>()
  const [selectedDataMode, setSelectedDataMode] = useState<DataRetentionMode>()

  const handlePlanSelect = (plan: SubscriptionPlan, dataMode: DataRetentionMode) => {
    setSelectedPlan(plan)
    setSelectedDataMode(dataMode)
    setCurrentStep('confirmation')
  }

  const handleConfirm = () => {
    if (selectedPlan && selectedDataMode) {
      onComplete(selectedPlan, selectedDataMode)
    }
  }

  const renderWelcomeStep = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </div>
        <Typography variant="h3" className="mb-4">
          Välkommen till Skolapp!
        </Typography>
        <Typography variant="body1" className="text-neutral-600 mb-6">
          För att komma igång behöver vi veta vilken plan som passar dig bäst. 
          Detta påverkar vilka funktioner du får tillgång till och hur elevdata hanteras.
        </Typography>
      </div>

      <Card variant="outlined" className="mb-8 bg-primary-50 border-primary-200">
        <CardContent>
          <Typography variant="h6" className="text-primary-800 mb-3">
            Viktigt om datahantering
          </Typography>
          <div className="text-left space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-primary-600 mt-1">🔒</span>
              <Typography variant="body2" className="text-primary-700">
                <strong>GDPR-kompatibel:</strong> Vi följer alla svenska och europeiska dataskyddsregler
              </Typography>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-primary-600 mt-1">⏱️</span>
              <Typography variant="body2" className="text-primary-700">
                <strong>Flexibel lagring:</strong> Välj mellan korttids- och långtidslagring av elevdata
              </Typography>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-primary-600 mt-1">👨‍👩‍👧‍👦</span>
              <Typography variant="body2" className="text-primary-700">
                <strong>Föräldrasamtycke:</strong> Automatisk hantering av samtycke för minderåriga
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={() => setCurrentStep('plan-selection')}>
        Välj min plan
      </Button>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <Typography variant="h4" className="mb-4">
          Bekräfta ditt val
        </Typography>
        <Typography variant="body1" className="text-neutral-600 mb-6">
          Du har valt följande inställningar. Du kan alltid ändra dessa senare i dina kontoinställningar.
        </Typography>
      </div>

      <Card variant="outlined" className="mb-8">
        <CardHeader>
          <CardTitle>
            <Typography variant="h6">Dina valda inställningar</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-left">
            <div>
              <Typography variant="subtitle2" className="text-neutral-800 mb-1">
                Prenumerationsplan
              </Typography>
              <Typography variant="body1" className="text-primary-600 font-medium">
                {selectedPlan === 'gratis' && 'Gratis - 99 kr/månad'}
                {selectedPlan === 'premium' && 'Premium - 99 kr/månad'}
                {selectedPlan === 'skolplan' && 'Skolplan - Från 79 kr/lärare/månad'}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle2" className="text-neutral-800 mb-1">
                Datalagring
              </Typography>
              <Typography variant="body1" className="font-medium">
                {selectedDataMode === 'korttid' && 'Korttidsläge - Data raderas efter session'}
                {selectedDataMode === 'långtid' && 'Långtidsläge - Permanent lagring för analys'}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDataMode === 'långtid' && user?.isMinor && (
        <Card variant="outlined" className="mb-6 border-warning-300 bg-warning-50">
          <CardContent>
            <Typography variant="subtitle2" className="text-warning-800 mb-2">
              Nästa steg: Föräldrasamtycke
            </Typography>
            <Typography variant="body2" className="text-warning-700">
              Eftersom du valt långtidslagring kommer vi att hjälpa dig skicka en begäran om 
              samtycke till din förälder/vårdnadshavare efter att du slutfört registreringen.
            </Typography>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 justify-center">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('plan-selection')}
        >
          Ändra val
        </Button>
        <Button size="lg" onClick={handleConfirm}>
          Bekräfta och fortsätt
        </Button>
      </div>
    </div>
  )

  return (
    <div className={className}>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep !== 'welcome' ? 'text-success-600' : 'text-primary-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
              currentStep !== 'welcome' 
                ? 'bg-success-600 text-white border-success-600' 
                : 'bg-primary-600 text-white border-primary-600'
            }`}>
              {currentStep !== 'welcome' ? '✓' : '1'}
            </div>
            <span className="ml-2 text-sm font-medium">Välkommen</span>
          </div>
          
          <div className={`h-0.5 w-16 ${currentStep === 'confirmation' ? 'bg-success-600' : 'bg-neutral-300'}`} />
          
          <div className={`flex items-center ${
            currentStep === 'plan-selection' ? 'text-primary-600' : 
            currentStep === 'confirmation' ? 'text-success-600' : 'text-neutral-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
              currentStep === 'plan-selection' 
                ? 'bg-primary-600 text-white border-primary-600'
                : currentStep === 'confirmation'
                ? 'bg-success-600 text-white border-success-600'
                : 'bg-neutral-300 text-neutral-600 border-neutral-300'
            }`}>
              {currentStep === 'confirmation' ? '✓' : '2'}
            </div>
            <span className="ml-2 text-sm font-medium">Välj plan</span>
          </div>
          
          <div className={`h-0.5 w-16 ${currentStep === 'confirmation' ? 'bg-primary-600' : 'bg-neutral-300'}`} />
          
          <div className={`flex items-center ${currentStep === 'confirmation' ? 'text-primary-600' : 'text-neutral-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
              currentStep === 'confirmation'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-neutral-300 text-neutral-600 border-neutral-300'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Bekräfta</span>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-96">
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'plan-selection' && (
          <SubscriptionPlanSelector
            selectedPlan={selectedPlan}
            selectedDataMode={selectedDataMode}
            isMinor={user?.isMinor}
            hasParentalConsent={user?.hasParentalConsent}
            onPlanSelect={handlePlanSelect}
            onNeedConsent={onNeedConsent}
          />
        )}
        {currentStep === 'confirmation' && renderConfirmationStep()}
      </div>
    </div>
  )
}