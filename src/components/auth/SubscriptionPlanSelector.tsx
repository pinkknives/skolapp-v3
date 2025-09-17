'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { type SubscriptionPlan, type DataRetentionMode } from '@/types/auth'
import { 
  getSubscriptionFeatures, 
  getSubscriptionDisplayName,
  getDataRetentionDisplayName,
  getDataRetentionDescription,
  getAvailableDataRetentionModes,
  validateUserDataSettings
} from '@/lib/auth-utils'

interface SubscriptionPlanSelectorProps {
  selectedPlan?: SubscriptionPlan
  selectedDataMode?: DataRetentionMode
  isMinor?: boolean
  hasParentalConsent?: boolean
  onPlanSelect: (plan: SubscriptionPlan, dataMode: DataRetentionMode) => void
  onNeedConsent?: () => void
  className?: string
}

export function SubscriptionPlanSelector({
  selectedPlan,
  selectedDataMode,
  isMinor,
  hasParentalConsent,
  onPlanSelect,
  onNeedConsent,
  className
}: SubscriptionPlanSelectorProps) {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(selectedPlan || 'gratis')
  const [currentDataMode, setCurrentDataMode] = useState<DataRetentionMode>(selectedDataMode || 'korttid')

  const plans: SubscriptionPlan[] = ['gratis', 'premium', 'skolplan']
  
  const getPlanPrice = (plan: SubscriptionPlan): string => {
    const prices = {
      gratis: 'Gratis',
      premium: '99 kr/månad',
      skolplan: 'Från 79 kr/lärare/månad'
    }
    return prices[plan]
  }

  const getPlanDescription = (plan: SubscriptionPlan): string => {
    const descriptions = {
      gratis: 'Perfekt för att komma igång med grundläggande quiz-funktioner',
      premium: 'Avancerade funktioner för seriösa lärare med AI-hjälp och analys',
      skolplan: 'Komplett lösning för skolor med administration och obegränsat antal lärare'
    }
    return descriptions[plan]
  }

  const handlePlanChange = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan)
    
    // Auto-select appropriate data retention mode
    const availableModes = getAvailableDataRetentionModes(plan)
    if (!availableModes.includes(currentDataMode)) {
      const newMode = availableModes[0]
      setCurrentDataMode(newMode)
    }
  }

  const handleConfirmSelection = () => {
    const validation = validateUserDataSettings(
      currentPlan,
      currentDataMode,
      hasParentalConsent,
      isMinor
    )

    if (!validation.isValid && validation.errors.some(e => e.includes('samtycke'))) {
      onNeedConsent?.()
      return
    }

    onPlanSelect(currentPlan, currentDataMode)
  }

  const canSelectDataMode = (mode: DataRetentionMode): boolean => {
    return getAvailableDataRetentionModes(currentPlan).includes(mode)
  }

  const validation = validateUserDataSettings(
    currentPlan,
    currentDataMode,
    hasParentalConsent,
    isMinor
  )

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <Typography variant="h4" className="mb-4">
          Välj din plan
        </Typography>
        <Typography variant="body1" className="text-neutral-600 max-w-2xl mx-auto">
          Välj den plan som passar dina behov. Du kan alltid uppgradera eller ändra senare.
        </Typography>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isSelected = currentPlan === plan
          const isPopular = plan === 'premium'
          
          return (
            <Card 
              key={plan}
              variant={isSelected ? 'elevated' : 'interactive'}
              className={`relative ${isSelected ? 'ring-2 ring-primary-500 border-primary-300' : ''}`}
              onClick={() => handlePlanChange(plan)}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Populär
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-center">
                  <Typography variant="h6">{getSubscriptionDisplayName(plan)}</Typography>
                  <Typography variant="h4" className="text-primary-600 mt-2">
                    {getPlanPrice(plan)}
                  </Typography>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <Typography variant="body2" className="text-neutral-600 mb-4 text-center">
                  {getPlanDescription(plan)}
                </Typography>
                
                <ul className="space-y-2">
                  {getSubscriptionFeatures(plan).map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-success-600 mr-2 mt-1">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Data Retention Mode Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <Typography variant="h6">Datalagring</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-neutral-600 mb-4">
            Välj hur länge elevdata ska sparas. Detta påverkar GDPR-krav och funktionalitet.
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['korttid', 'långtid'] as DataRetentionMode[]).map((mode) => {
              const isAvailable = canSelectDataMode(mode)
              const isSelected = currentDataMode === mode
              
              return (
                <Card
                  key={mode}
                  variant={isSelected ? 'elevated' : 'outlined'}
                  className={`cursor-pointer transition-all ${
                    !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSelected ? 'ring-2 ring-primary-500 border-primary-300' : ''}`}
                  onClick={() => isAvailable && setCurrentDataMode(mode)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => isAvailable && setCurrentDataMode(mode)}
                        disabled={!isAvailable}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <Typography variant="subtitle2" className="font-medium">
                          {getDataRetentionDisplayName(mode)}
                        </Typography>
                        <Typography variant="caption" className="text-neutral-600">
                          {getDataRetentionDescription(mode)}
                        </Typography>
                        {!isAvailable && (
                          <Typography variant="caption" className="text-warning-600">
                            Ej tillgängligt för {getSubscriptionDisplayName(currentPlan)}
                          </Typography>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Validation Messages */}
      {!validation.isValid && (
        <Card variant="outlined" className="mb-6 border-warning-300 bg-warning-50">
          <CardContent className="p-4">
            <Typography variant="subtitle2" className="text-warning-800 mb-2">
              Observera följande:
            </Typography>
            <ul className="space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm text-warning-700 flex items-start">
                  <span className="mr-2">⚠️</span>
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Consent Notice */}
      {currentDataMode === 'långtid' && isMinor && (
        <Card variant="outlined" className="mb-6 border-info-300 bg-info-50">
          <CardContent className="p-4">
            <Typography variant="subtitle2" className="text-info-800 mb-2">
              Föräldrasamtycke krävs
            </Typography>
            <Typography variant="body2" className="text-info-700">
              För långtidslagring av elevdata krävs samtycke från förälder/vårdnadshavare enligt GDPR. 
              Du kommer att få hjälp att skicka en begäran om samtycke efter registreringen.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Confirm Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleConfirmSelection}
          className="min-w-48"
        >
          {validation.isValid 
            ? `Välj ${getSubscriptionDisplayName(currentPlan)}`
            : 'Fortsätt ändå'
          }
        </Button>
      </div>
    </div>
  )
}