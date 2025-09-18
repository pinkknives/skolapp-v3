'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { EnhancedSubscriptionPlanSelector } from '@/components/auth/EnhancedSubscriptionPlanSelector'
import { type SubscriptionPlan, type DataRetentionMode } from '@/types/auth'

export function PricingContent() {
  const handlePlanSelect = (
    plan: SubscriptionPlan, 
    dataMode: DataRetentionMode,
    options?: {
      isYearly?: boolean
      numberOfTeachers?: number
      paymentProvider?: any
    }
  ) => {
    // This would redirect to signup/login or subscription management
    console.log('Plan selected:', { plan, dataMode, options })
    // In a real app, this would redirect to auth or subscription management
    // window.location.href = `/auth/register?plan=${plan}&dataMode=${dataMode}&yearly=${options?.isYearly}`
  }

  return (
    <>
      <div className="text-center mb-12">
        <Typography variant="h1" className="mb-6">
          Priser som passar alla
        </Typography>
        <Typography variant="subtitle1" className="text-neutral-600 max-w-3xl mx-auto">
          Transparenta priser utan dolda kostnader. Börja gratis och uppgradera när du behöver fler funktioner.
          Alla planer inkluderar GDPR-kompatibel datahantering.
        </Typography>
      </div>

      {/* Enhanced Plan Selector */}
      <EnhancedSubscriptionPlanSelector
        onPlanSelect={handlePlanSelect}
        className="max-w-6xl mx-auto"
        showComparison={true}
        showTeacherSlider={true}
        platform="web"
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
              All befintlig data behålls tills dess att föräldrasamtycken går ut eller återkallas. 
              Ny data kommer endast att lagras temporärt enligt korttidsläge.
            </Typography>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-6">
            <Typography variant="h6" className="mb-2">
              Hur fungerar föräldrasamtycket?
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              För elever under 18 år krävs föräldrasamtycke för långtidslagring. Vi skickar en säker länk 
              via e-post eller SMS där föräldern enkelt kan godkänna eller neka. Samtycket kan återkallas när som helst.
            </Typography>
          </div>

          <div className="bg-neutral-50 rounded-lg p-6">
            <Typography variant="h6" className="mb-2">
              Vilka betalmetoder accepteras?
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Vi accepterar kort via Stripe på webben, App Store-betalningar på iOS och Google Play-betalningar 
              på Android. För skolor erbjuder vi även fakturering.
            </Typography>
          </div>

          <div className="bg-neutral-50 rounded-lg p-6">
            <Typography variant="h6" className="mb-2">
              Finns det volymrabatter för skolor?
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Ja! Skolplanen har automatiska volymrabatter. Ju fler lärare, desto lägre pris per lärare. 
              Från 6 lärare får ni 13% rabatt, från 16 lärare 25% rabatt, och så vidare.
            </Typography>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-6">
            <Typography variant="h6" className="mb-2">
              Vad ingår i skolplanen för administration?
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Skolplanen inkluderar en administratörspanel för att hantera lärarkonton, 
              centraliserad fakturering, användningsstatistik och GDPR-rapporter för hela skolan.
            </Typography>
          </div>
        </div>
      </div>
    </>
  )
}