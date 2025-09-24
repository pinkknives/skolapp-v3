'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Crown, Lock, Sparkles } from 'lucide-react'
import { getStripeConfig } from '@/lib/billing'

interface AIFeatureBlockProps {
  featureName?: string
  description?: string
  onUpgrade?: () => void
  className?: string
}

export function AIFeatureBlock({ 
  featureName = 'AI-funktioner',
  description = 'Denna funktion kräver en aktiv prenumeration för att använda AI-assisterade verktyg.',
  onUpgrade,
  className = ''
}: AIFeatureBlockProps) {
  
  const handleUpgrade = async (priceId: string) => {
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode: 'subscription'
        })
      })

      if (!response.ok) {
        throw new Error('Kunde inte starta checkout')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Upgrade error:', error)
      if (onUpgrade) {
        onUpgrade()
      }
    }
  }

  let stripeConfig
  try {
    stripeConfig = getStripeConfig()
  } catch (_err) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center text-center py-8">
          <Lock size={48} className="text-neutral-400 mb-4" />
          <Typography variant="h6" className="mb-2">
            {featureName} ej tillgängliga
          </Typography>
          <Typography variant="body2" className="text-neutral-600">
            Stripe-konfiguration saknas. Kontakta support.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center text-center py-8 space-y-6">
        {/* Icon */}
        <div className="relative">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-full">
            <Crown size={32} className="text-primary-600" />
          </div>
          <div className="absolute -top-1 -right-1 bg-warning-400 p-1 rounded-full">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Typography variant="h6" className="text-neutral-800">
            Lås upp {featureName}
          </Typography>
          <Typography variant="body2" className="text-neutral-600 max-w-md">
            {description}
          </Typography>
        </div>

        {/* Features list */}
        <div className="bg-neutral-50 rounded-lg p-4 w-full max-w-sm">
          <Typography variant="body2" className="font-medium text-neutral-700 mb-3">
            Premium-funktioner inkluderar:
          </Typography>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <Crown size={14} className="text-primary-500" />
              AI-assisterade bedömningar
            </li>
            <li className="flex items-center gap-2">
              <Crown size={14} className="text-primary-500" />
              Automatisk feedbackgenerering
            </li>
            <li className="flex items-center gap-2">
              <Crown size={14} className="text-primary-500" />
              Intelligenta förslag och förbättringar
            </li>
            <li className="flex items-center gap-2">
              <Crown size={14} className="text-primary-500" />
              Upp till 100 elever per organisation
            </li>
          </ul>
        </div>

        {/* Upgrade buttons */}
        <div className="space-y-3 w-full max-w-sm">
          <Button
            className="w-full"
            onClick={() => handleUpgrade(stripeConfig.monthlyPriceId)}
            leftIcon={<Crown size={16} />}
          >
            Uppgradera - 99 kr/mån
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleUpgrade(stripeConfig.annualPriceId)}
          >
            Årsprenumeration - 990 kr/år
            <span className="ml-2 px-2 py-1 bg-success-100 text-success-700 text-xs rounded-full">
              Spara 2 månader
            </span>
          </Button>
        </div>

        {/* GDPR note */}
        <Typography variant="caption" className="text-neutral-500 max-w-md">
          🔒 Säker betalning via Stripe. Inga kortuppgifter lagras hos oss. Avbryt när som helst.
        </Typography>
      </CardContent>
    </Card>
  )
}