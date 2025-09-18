'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { 
  type SubscriptionPlan, 
  type DataRetentionMode,
  type PaymentProvider 
} from '@/types/auth'
import { 
  SUBSCRIPTION_PRICING,
  SCHOOL_PRICING_TIERS,
  subscriptionService 
} from '@/lib/subscription-service'
import { motion } from 'framer-motion'

interface EnhancedSubscriptionPlanSelectorProps {
  selectedPlan?: SubscriptionPlan
  selectedDataMode?: DataRetentionMode
  isMinor?: boolean
  hasParentalConsent?: boolean
  onPlanSelect: (plan: SubscriptionPlan, dataMode: DataRetentionMode, options?: {
    isYearly?: boolean
    numberOfTeachers?: number
    paymentProvider?: PaymentProvider
  }) => void
  onNeedConsent?: () => void
  className?: string
  showComparison?: boolean
  showTeacherSlider?: boolean
  platform?: 'web' | 'ios' | 'android'
}

export function EnhancedSubscriptionPlanSelector({
  selectedPlan,
  selectedDataMode,
  isMinor,
  hasParentalConsent,
  onPlanSelect,
  onNeedConsent,
  className,
  showComparison = true,
  showTeacherSlider = true,
  platform = 'web'
}: EnhancedSubscriptionPlanSelectorProps) {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(selectedPlan || 'gratis')
  const [currentDataMode, setCurrentDataMode] = useState<DataRetentionMode>(selectedDataMode || 'korttid')
  const [isYearly, setIsYearly] = useState(false)
  const [numberOfTeachers, setNumberOfTeachers] = useState(1)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('stripe')

  const plans: SubscriptionPlan[] = ['gratis', 'premium', 'skolplan']

  const getPlanPricing = (plan: SubscriptionPlan) => {
    if (plan === 'skolplan') {
      const pricing = subscriptionService.calculateSchoolPricing(numberOfTeachers)
      return {
        monthly: pricing.monthlyTotal,
        yearly: pricing.yearlyTotal,
        savings: pricing.savings,
        tier: pricing.tier
      }
    }
    
    const pricing = SUBSCRIPTION_PRICING[plan]
    return {
      monthly: pricing.monthlyPrice,
      yearly: pricing.yearlyPrice,
      savings: pricing.monthlyPrice * 12 - pricing.yearlyPrice
    }
  }

  const getCompetitorComparison = (plan: SubscriptionPlan) => {
    return subscriptionService.getCompetitorComparison(plan)
  }

  const handlePlanChange = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan)
    
    // Auto-select appropriate data mode
    if (plan === 'gratis') {
      setCurrentDataMode('korttid')
    } else if (currentDataMode === 'korttid' && (plan === 'premium' || plan === 'skolplan')) {
      setCurrentDataMode('långtid')
    }
  }

  const handleDataModeChange = (mode: DataRetentionMode) => {
    // Check if mode is available for current plan
    const availablePlans = mode === 'långtid' ? ['premium', 'skolplan'] : ['gratis', 'premium', 'skolplan']
    
    if (!availablePlans.includes(currentPlan)) {
      // Auto-upgrade to premium if trying to select long-term data on free plan
      setCurrentPlan('premium')
    }
    
    setCurrentDataMode(mode)
  }

  const handleConfirm = () => {
    // Check if consent is needed
    if (currentDataMode === 'långtid' && isMinor && !hasParentalConsent) {
      onNeedConsent?.()
      return
    }

    onPlanSelect(currentPlan, currentDataMode, {
      isYearly,
      numberOfTeachers: currentPlan === 'skolplan' ? numberOfTeachers : undefined,
      paymentProvider
    })
  }

  const getAvailablePaymentProviders = (): PaymentProvider[] => {
    const providers: PaymentProvider[] = ['stripe']
    
    if (platform === 'ios') {
      providers.unshift('app_store_ios')
    } else if (platform === 'android') {
      providers.unshift('google_play')
    }
    
    return providers
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount)
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-neutral-100 rounded-lg p-1 flex">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !isYearly 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Månadsvis
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
              isYearly 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Årsvis
            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const pricing = getPlanPricing(plan)
          const features = SUBSCRIPTION_PRICING[plan].features
          const isSelected = currentPlan === plan
          const comparison = showComparison ? getCompetitorComparison(plan) : null
          
          return (
            <motion.div
              key={plan}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                variant={isSelected ? 'elevated' : 'default'}
                className={`relative h-full ${isSelected ? 'ring-2 ring-primary-500' : ''} ${
                  plan === 'premium' ? 'border-primary-300 shadow-lg' : ''
                }`}
              >
                {plan === 'premium' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Populärast
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold capitalize">
                    {plan === 'gratis' ? 'Gratis' : 
                     plan === 'premium' ? 'Premium' : 
                     'Skolplan'}
                  </CardTitle>
                  
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-primary-600">
                      {plan === 'gratis' ? 'Gratis' : 
                       formatCurrency(isYearly ? pricing.yearly! : pricing.monthly)}
                    </div>
                    
                    {plan !== 'gratis' && (
                      <div className="text-sm text-neutral-600">
                        {plan === 'skolplan' ? `per ${numberOfTeachers} lärare` : 'per månad'}
                        {isYearly && pricing.savings! > 0 && (
                          <div className="text-success-600 font-medium">
                            Spara {formatCurrency(pricing.savings!)} per år
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-success-500 mt-0.5">✓</span>
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Competitor Comparison */}
                  {showComparison && comparison && plan !== 'gratis' && (
                    <div className="bg-neutral-50 rounded-lg p-3 mb-4">
                      <Typography variant="caption" className="font-medium mb-2 block">
                        Jämfört med konkurrenter:
                      </Typography>
                      <div className="space-y-1">
                        {comparison.competitors.map((comp, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span>{comp.name}:</span>
                            <span className="text-neutral-600">
                              {formatCurrency(comp.price)} 
                              <span className="text-success-600 ml-1">
                                (-{formatCurrency(comp.difference)})
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* School Teachers Slider */}
                  {plan === 'skolplan' && showTeacherSlider && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Antal lärare: {numberOfTeachers}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={numberOfTeachers}
                        onChange={(e) => setNumberOfTeachers(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-neutral-600 mt-1">
                        <span>1</span>
                        <span>50</span>
                        <span>100+</span>
                      </div>
                      {pricing.tier && (
                        <div className="text-xs text-primary-600 mt-1">
                          {pricing.tier.discountPercentage > 0 && (
                            <span>
                              {pricing.tier.discountPercentage}% rabatt! 
                              {formatCurrency(pricing.tier.pricePerTeacher)} per lärare
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Select Button */}
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handlePlanChange(plan)}
                  >
                    {isSelected ? 'Vald' : 'Välj plan'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Data Retention Mode Selection */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Datalagring</CardTitle>
          <Typography variant="body2" className="text-neutral-600">
            Välj hur länge elevdata ska lagras
          </Typography>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['korttid', 'långtid'] as DataRetentionMode[]).map((mode) => {
              const isAvailable = mode === 'korttid' || currentPlan !== 'gratis'
              const isSelected = currentDataMode === mode
              
              return (
                <div
                  key={mode}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50' 
                      : isAvailable 
                        ? 'border-neutral-300 hover:border-neutral-400' 
                        : 'border-neutral-200 bg-neutral-50 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => isAvailable && handleDataModeChange(mode)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="dataMode"
                      checked={isSelected}
                      onChange={() => isAvailable && handleDataModeChange(mode)}
                      disabled={!isAvailable}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Typography variant="subtitle2" className="font-medium mb-1">
                        {mode === 'korttid' ? 'Korttidsläge' : 'Långtidsläge'}
                        {!isAvailable && (
                          <span className="ml-2 text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                            Kräver Premium
                          </span>
                        )}
                      </Typography>
                      <Typography variant="body2" className="text-neutral-600">
                        {mode === 'korttid' 
                          ? 'Data raderas automatiskt efter sessionen. GDPR-säkert utan samtycke.'
                          : 'Data sparas permanent för analys och progression. Kräver föräldrasamtycke för minderåriga.'
                        }
                      </Typography>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Provider Selection */}
      {currentPlan !== 'gratis' && (
        <Card>
          <CardHeader>
            <CardTitle>Betalmetod</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getAvailablePaymentProviders().map((provider) => (
                <div
                  key={provider}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentProvider === provider 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  onClick={() => setPaymentProvider(provider)}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentProvider"
                      checked={paymentProvider === provider}
                      onChange={() => setPaymentProvider(provider)}
                    />
                    <span className="font-medium">
                      {provider === 'stripe' ? 'Kort (Stripe)' :
                       provider === 'app_store_ios' ? 'App Store' :
                       provider === 'google_play' ? 'Google Play' :
                       provider}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consent Notice */}
      {currentDataMode === 'långtid' && isMinor && !hasParentalConsent && (
        <Card variant="outlined" className="border-warning-300 bg-warning-50">
          <CardContent className="p-4">
            <Typography variant="subtitle2" className="text-warning-800 mb-2">
              ⚠️ Föräldrasamtycke krävs
            </Typography>
            <Typography variant="body2" className="text-warning-700 mb-4">
              För långtidslagring av elevdata krävs samtycke från förälder/vårdnadshavare enligt GDPR. 
              Du kommer att få hjälp att skicka en begäran om samtycke efter valet av plan.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Confirm Button */}
      <div className="flex justify-center pt-6">
        <Button
          variant="primary"
          size="lg"
          onClick={handleConfirm}
          className="min-w-[200px]"
        >
          {currentPlan === 'gratis' ? 'Kom igång gratis' : `Välj ${currentPlan}`}
        </Button>
      </div>
    </div>
  )
}