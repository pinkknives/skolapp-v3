'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { SubscriptionPlanSelector } from '@/components/auth/SubscriptionPlanSelector'
import { type SubscriptionPlan, type DataRetentionMode } from '@/types/auth'

export function PricingContent() {
  const handlePlanSelect = (_plan: SubscriptionPlan, _dataMode: DataRetentionMode) => {
    // This would redirect to signup/login or subscription management
    // In a real app, this would redirect to auth or subscription management
    // window.location.href = `/auth/register?plan=${_plan}&dataMode=${_dataMode}`
  }

  return (
    <>
      <div className="text-center mb-12">
        <Typography variant="h1" className="mb-6">
          Priser som passar alla
        </Typography>
        <Typography
          variant="subtitle1"
          className="text-left mx-auto max-w-5xl text-neutral-600 text-lg sm:text-xl lg:text-2xl leading-relaxed"
        >
          Transparenta priser utan dolda kostnader. Börja gratis och uppgradera när du behöver fler funktioner.
          Alla planer inkluderar GDPR-kompatibel datahantering.
        </Typography>
      </div>

      {/* Competitive comparison callout */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-12 text-center">
        <Typography variant="h6" className="text-primary-800 mb-2">
          Marknadsförd prissättning
        </Typography>
        <Typography variant="body2" className="text-primary-700">
          Våra priser är alltid konkurrensmässiga jämfört med Kahoot! (139 kr/månad), 
          Socrative (69 kr/månad) och Quizlet Teacher (199 kr/månad).
        </Typography>
      </div>

      <SubscriptionPlanSelector
        onPlanSelect={handlePlanSelect}
        className="max-w-6xl mx-auto"
      />

      {/* FAQ Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <Typography variant="h5" className="text-center mb-8">
          Vanliga frågor
        </Typography>
        
        <div className="space-y-6">
          <div className="bg-neutral-50 rounded-lg p-6">
            <Typography variant="h6" className="mb-2">
              Kan jag byta plan när som helst?
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Ja, du kan uppgradera eller nedgradera din plan när som helst. 
              Ändringar träder i kraft vid nästa faktureringsperiod.
            </Typography>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-6">
            <Typography variant="h6" className="mb-2">
              Vad händer med elevdata om jag byter från långtids- till korttidsläge?
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Befintlig data påverkas inte omedelbart. Du får en 30-dagars övergångsperiod 
              för att exportera eller migrera data enligt GDPR-kraven.
            </Typography>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-6">
            <Typography variant="h6" className="mb-2">
              Hur funkar föräldrasamtycke för långtidslagring?
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Vi tillhandahåller enkla verktyg för att skicka samtyckesförfrågningar via e-post, 
              QR-koder eller digitala formulär. Allt dokumenteras automatiskt för GDPR-efterlevnad.
            </Typography>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-6">
            <Typography variant="h6" className="mb-2">
              Vad ingår i skolplanen för administration?
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Skolplanen inkluderar en administratörspanel för att hantera lärarkonton, 
              centralised fakturering, användningsstatistik och GDPR-rapporter för hela skolan.
            </Typography>
          </div>
        </div>
      </div>
    </>
  )
}
