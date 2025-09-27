'use client'

import React from 'react'
import { Typography } from '@/components/ui/Typography'
import { SubscriptionPlanSelector } from '@/components/auth/SubscriptionPlanSelector'
import { type SubscriptionPlan, type DataRetentionMode } from '@/types/auth'
import { Button } from '@/components/ui/Button'

export function PricingContent() {
  const handlePlanSelect = (_plan: SubscriptionPlan, _dataMode: DataRetentionMode) => {
    // This would redirect to signup/login or subscription management
    // In a real app, this would redirect to auth or subscription management
    // window.location.href = `/auth/register?plan=${_plan}&dataMode=${_dataMode}`
  }

  const checkout = async (plan: 'teacher_bas' | 'teacher_pro' | 'school') => {
    try {
      const priceByPlan: Record<typeof plan, string> = {
        teacher_bas: process.env.NEXT_PUBLIC_STRIPE_PRICE_BAS || 'price_teacher_bas',
        teacher_pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_teacher_pro',
        school: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOL || 'price_school'
      }
      const resp = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ priceId: priceByPlan[plan], plan, billingPeriod: 'monthly' })
      })
      if (!resp.ok) throw new Error('checkout_failed')
      const data = await resp.json()
      if (data?.url) window.location.href = data.url
    } catch {
      alert('Kunde inte starta Checkout just nu. Försök igen senare.')
    }
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

      <div className="mt-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <Typography variant="h6" className="mb-1">Bas</Typography>
          <Typography variant="subtitle2" className="text-neutral-600 mb-3">För enskilda lärare</Typography>
          <Button onClick={() => checkout('teacher_bas')}>Uppgradera till Bas</Button>
        </div>
        <div className="border rounded-lg p-4">
          <Typography variant="h6" className="mb-1">Pro</Typography>
          <Typography variant="subtitle2" className="text-neutral-600 mb-3">För avancerade användare</Typography>
          <Button onClick={() => checkout('teacher_pro')}>Uppgradera till Pro</Button>
        </div>
        <div className="border rounded-lg p-4">
          <Typography variant="h6" className="mb-1">Skola</Typography>
          <Typography variant="subtitle2" className="text-neutral-600 mb-3">För hela skolor</Typography>
          <Button onClick={() => checkout('school')}>Kontakta försäljning</Button>
        </div>
      </div>

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
