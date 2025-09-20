'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { CreditCard, ExternalLink, Crown } from 'lucide-react'
import { getUserBilling, getBillingStatusDisplay, getBillingStatusColor, getStripeConfig } from '@/lib/billing'
import type { BillingStatus, Entitlements, Plan } from '@/types/billing'

interface BillingCardProps {
  canManage?: boolean
}

export function BillingCard({ canManage = true }: BillingCardProps) {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [plan, setPlan] = useState<Plan | null>('free')
  const [entitlements, setEntitlements] = useState<Entitlements>({ 
    ai_unlimited: false,
    export_csv: false,
    advanced_analytics: false,
    seats: 1,
    ai_monthly_quota: 20,
    ai_monthly_used: 0,
    period_start: '',
    period_end: ''
  })
  const [loading, setLoading] = useState(true)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBillingInfo()
  }, [])

  const loadBillingInfo = async () => {
    try {
      setLoading(true)
      const billing = await getUserBilling()
      if (billing) {
        setBillingStatus(billing.billingStatus)
        setPlan(billing.plan)
        setEntitlements(billing.entitlements)
      }
    } catch (err) {
      console.error('Failed to load billing info:', err)
      setError('Kunde inte ladda faktureringsinformation')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    if (!canManage) return

    try {
      setLoadingCheckout(true)
      setError(null)

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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kunde inte starta checkout')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel inträffade')
    } finally {
      setLoadingCheckout(false)
    }
  }

  const handleManageBilling = async () => {
    if (!canManage) return

    try {
      setLoadingPortal(true)
      setError(null)

      const response = await fetch('/api/billing/portal', {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kunde inte öppna billing portal')
      }

      const { url } = await response.json()
      
      // Open billing portal in new window
      window.open(url, '_blank')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel inträffade')
    } finally {
      setLoadingPortal(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Prenumeration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-neutral-500">
            Laddar faktureringsinformation...
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const statusColor = getBillingStatusColor(billingStatus || 'inactive')
  
  let stripeConfig
  try {
    stripeConfig = getStripeConfig()
  } catch (_err) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Prenumeration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-error-600">
            Stripe-konfiguration saknas. Kontakta support.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard size={20} />
          Prenumeration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-error-50 border border-error-200 rounded-md">
            <Typography variant="body2" className="text-error-800">
              {error}
            </Typography>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${statusColor}`}>
            {billingStatus ? getBillingStatusDisplay(billingStatus) : 'Gratis'}
          </div>
          {plan === 'pro' && (
            <div className="flex items-center gap-1 text-warning-600">
              <Crown size={16} />
              <Typography variant="caption" className="font-medium">
                Pro-funktioner aktiverade
              </Typography>
            </div>
          )}
        </div>

        {/* Entitlements */}
        <div className="space-y-2">
          <Typography variant="body2" className="font-medium text-neutral-700">
            Inkluderat i din plan:
          </Typography>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${entitlements.ai_unlimited ? 'bg-success-500' : 'bg-neutral-300'}`} />
              AI-funktioner: {entitlements.ai_unlimited ? 'Obegränsat' : `${entitlements.ai_monthly_quota}/månad`}
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${entitlements.export_csv ? 'bg-success-500' : 'bg-neutral-300'}`} />
              CSV-export: {entitlements.export_csv ? 'Aktiverat' : 'Inte aktiverat'}
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${entitlements.advanced_analytics ? 'bg-success-500' : 'bg-neutral-300'}`} />
              Avancerad analys: {entitlements.advanced_analytics ? 'Aktiverat' : 'Inte aktiverat'}
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 border-t border-neutral-200">
          {billingStatus === 'inactive' && canManage && (
            <div className="space-y-2">
              <Typography variant="body2" className="font-medium text-neutral-700">
                Uppgradera för AI-funktioner:
              </Typography>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUpgrade(stripeConfig.monthlyPriceId)}
                  loading={loadingCheckout}
                  disabled={!canManage}
                >
                  99 kr/mån
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpgrade(stripeConfig.annualPriceId)}
                  loading={loadingCheckout}
                  disabled={!canManage}
                >
                  990 kr/år (spare 2 mån)
                </Button>
              </div>
            </div>
          )}

          {(billingStatus === 'active' || billingStatus === 'trialing' || billingStatus === 'past_due') && canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageBilling}
              loading={loadingPortal}
              leftIcon={<ExternalLink size={16} />}
              disabled={!canManage}
            >
              Hantera prenumeration
            </Button>
          )}

          {!canManage && billingStatus === 'inactive' && (
            <Typography variant="body2" className="text-neutral-500">
              Endast ägare och administratörer kan hantera fakturering.
            </Typography>
          )}
        </div>

        {/* GDPR Note */}
        <div className="pt-3 border-t border-neutral-200">
          <Typography variant="caption" className="text-neutral-500">
            🔒 GDPR-säkert: Vi lagrar inga kortuppgifter. All betalning hanteras säkert av Stripe.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}