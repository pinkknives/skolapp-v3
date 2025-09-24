'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { ResponsiveContainer, ResponsiveSection, ResponsiveHeading, ResponsiveGrid } from '@/components/layout/ResponsiveContainer'
import { CheckCircle, X, Star, Zap, Shield, Users, Clock, ArrowRight, CreditCard, Smartphone, Globe } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

const pricingPlans = [
  {
    id: 'free',
    name: 'Gratis',
    description: 'Perfekt för att testa Skolapp',
    price: 0,
    period: 'månad',
    popular: false,
    features: [
      'Upp till 3 quiz per månad',
      'Max 20 elever per quiz',
      'Grundläggande AI-funktioner',
      'E-post support',
      'Mobilapp inkluderad',
      'Grundläggande analyser'
    ],
    limitations: [
      'Begränsade AI-funktioner',
      'Ingen live-support',
      'Ingen dataexport'
    ],
    cta: 'Kom igång gratis',
    ctaVariant: 'outline' as const,
    stripePriceId: null
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Ideal för enskilda lärare',
    price: 89,
    period: 'månad',
    popular: true,
    features: [
      'Obegränsat antal quiz',
      'Obegränsat antal elever',
      'Fullständig AI-assistent',
      'Live-sessioner i realtid',
      'Avancerade analyser',
      'Dataexport (JSON, CSV)',
      'Integrering med Google Classroom',
      'Prioriterad e-post support',
      'Mobilapp med alla funktioner',
      'Anpassade teman'
    ],
    limitations: [],
    cta: 'Starta 14-dagars provperiod',
    ctaVariant: 'primary' as const,
    stripePriceId: 'price_standard_monthly'
  },
  {
    id: 'school',
    name: 'Skola',
    description: 'Komplett lösning för hela skolan',
    price: 149,
    period: 'månad per lärare',
    popular: false,
    features: [
      'Allt i Standard-planen',
      'Administrativ dashboard',
      'Centraliserad fakturering',
      'Användarhantering',
      'Skolebrev och mallar',
      'API-tillgång',
      'Integrering med LMS (Moodle, Canvas)',
      'Telefon support (mån-fre 08:00-17:00)',
      'Dedikerad kundsuccess manager',
      'Anpassade integrationsmöjligheter',
      'Avancerad säkerhet och compliance'
    ],
    limitations: [],
    cta: 'Kontakta oss för offert',
    ctaVariant: 'outline' as const,
    stripePriceId: 'price_school_monthly'
  }
]

const paymentMethods = [
  { name: 'Kreditkort', icon: <CreditCard className="w-5 h-5" />, description: 'Visa, Mastercard, American Express' },
  { name: 'Apple Pay', icon: <Smartphone className="w-5 h-5" />, description: 'Snabb och säker betalning' },
  { name: 'Google Pay', icon: <Globe className="w-5 h-5" />, description: 'Enkelt för Android-användare' },
  { name: 'Swish', icon: <Zap className="w-5 h-5" />, description: 'Populärt i Sverige' }
]

const comparisonFeatures = [
  { name: 'Quiz per månad', free: '3', standard: 'Obegränsat', school: 'Obegränsat' },
  { name: 'Elever per quiz', free: '20', standard: 'Obegränsat', school: 'Obegränsat' },
  { name: 'AI-assistent', free: 'Grundläggande', standard: 'Fullständig', school: 'Fullständig' },
  { name: 'Live-sessioner', free: 'Nej', standard: 'Ja', school: 'Ja' },
  { name: 'Analyser', free: 'Grundläggande', standard: 'Avancerade', school: 'Avancerade' },
  { name: 'Dataexport', free: 'Nej', standard: 'Ja', school: 'Ja' },
  { name: 'Integreringar', free: 'Nej', standard: 'Google Classroom', school: 'Alla LMS' },
  { name: 'Support', free: 'E-post', standard: 'Prioriterad e-post', school: 'Telefon + e-post' },
  { name: 'API-tillgång', free: 'Nej', standard: 'Nej', school: 'Ja' },
  { name: 'Administrativ dashboard', free: 'Nej', standard: 'Nej', school: 'Ja' }
]

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [showComparison, setShowComparison] = useState(false)

  const handlePlanSelect = async (planId: string, stripePriceId: string | null) => {
    if (planId === 'school') {
      // Redirect to contact form for school plans
      window.location.href = '/contact?plan=school'
      return
    }

    if (planId === 'free') {
      // Redirect to signup for free plan
      window.location.href = '/register?plan=free'
      return
    }

    if (stripePriceId) {
      // Redirect to Stripe checkout
      try {
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: stripePriceId,
            billingPeriod,
            planId
          }),
        })

        const { url } = await response.json()
        if (url) {
          window.location.href = url
        } else {
          throw new Error('No checkout URL received')
        }
      } catch (error) {
        console.error('Error creating checkout session:', error)
        // Show user-friendly error message
        alert('Ett fel uppstod vid skapande av betalningssession. Vänligen försök igen eller kontakta support.')
      }
    }
  }

  const getDiscountedPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.round(price * 10) : price
  }


  return (
    <ResponsiveSection className="bg-white dark:bg-neutral-900">
      <ResponsiveContainer size="xl" padding="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <motion.div variants={itemVariants}>
              <ResponsiveHeading level={2} className="mb-4 text-foreground">
                Enkla priser för alla behov
              </ResponsiveHeading>
              <Typography
                variant="subtitle1"
                className="text-left mx-auto max-w-5xl text-muted-foreground text-lg sm:text-xl lg:text-2xl leading-relaxed mb-8"
              >
                Välj den plan som passar dig bäst. Alla planer inkluderar 14 dagars gratis provperiod.
              </Typography>
            </motion.div>

            {/* Billing Toggle */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Månadsvis
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'} flex items-center gap-1`}>
                Årsvis
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Spara 20%
                </span>
              </span>
            </motion.div>
          </div>

          {/* Pricing Cards */}
          <ResponsiveGrid 
            cols={{ default: 1, md: 2, lg: 3 }} 
            gap="lg" 
            className="mb-16"
          >
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? 'ring-2 ring-primary-500 shadow-lg scale-105'
                    : 'hover:shadow-lg'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Mest populär
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground text-base sm:text-lg">{plan.description}</CardDescription>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl sm:text-5xl font-bold text-foreground">
                      {getDiscountedPrice(plan.price)}
                    </span>
                    <span className="text-muted-foreground text-lg sm:text-xl">
                      kr/{billingPeriod === 'yearly' ? 'år' : 'månad'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <Typography variant="body2" className="text-neutral-700 dark:text-neutral-300">
                          {feature}
                        </Typography>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <Typography variant="body2" className="text-neutral-500 dark:text-neutral-400">
                          {limitation}
                        </Typography>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.ctaVariant}
                    size="lg"
                    fullWidth
                    onClick={() => handlePlanSelect(plan.id, plan.stripePriceId)}
                    className="mt-6 flex items-center justify-center gap-2"
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>

          {/* Payment Methods */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <Typography variant="h6" className="mb-6 text-foreground">
              Säker betalning med
            </Typography>
            <div className="flex flex-wrap justify-center gap-6">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  {method.icon}
                  <span className="text-sm font-medium">{method.name}</span>
                </div>
              ))}
            </div>
            <Typography variant="caption" className="text-muted-foreground mt-4 block">
              Alla betalningar hanteras säkert via Stripe. Vi accepterar alla större kreditkort och lokala betalningsmetoder.
            </Typography>
          </motion.div>

          {/* Feature Comparison */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <Button
                variant="outline"
                onClick={() => setShowComparison(!showComparison)}
                className="mb-4"
              >
                {showComparison ? 'Dölj' : 'Visa'} detaljerad jämförelse
              </Button>
            </div>

            {showComparison && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <th className="text-left p-4 font-semibold text-foreground">Funktion</th>
                          <th className="text-center p-4 font-semibold text-foreground">Gratis</th>
                          <th className="text-center p-4 font-semibold text-foreground">Standard</th>
                          <th className="text-center p-4 font-semibold text-foreground">Skola</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonFeatures.map((feature, index) => (
                          <tr key={index} className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="p-4 font-medium text-foreground">{feature.name}</td>
                            <td className="p-4 text-center text-neutral-600 dark:text-neutral-400">{feature.free}</td>
                            <td className="p-4 text-center text-neutral-600 dark:text-neutral-400">{feature.standard}</td>
                            <td className="p-4 text-center text-neutral-600 dark:text-neutral-400">{feature.school}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-green-600 mb-2" />
                <Typography variant="h6" className="text-foreground mb-1">
                  GDPR-kompatibel
                </Typography>
                <Typography variant="body2" className="text-muted-foreground text-center">
                  All data hanteras enligt svenska och EU:s dataskyddsregler
                </Typography>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <Typography variant="h6" className="text-foreground mb-1">
                  2,500+ lärare
                </Typography>
                <Typography variant="body2" className="text-muted-foreground text-center">
                  Förtroende av tusentals lärare i Sverige
                </Typography>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-8 h-8 text-purple-600 mb-2" />
                <Typography variant="h6" className="text-foreground mb-1">
                  14 dagar gratis
                </Typography>
                <Typography variant="body2" className="text-muted-foreground text-center">
                  Testa alla funktioner utan risk
                </Typography>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
