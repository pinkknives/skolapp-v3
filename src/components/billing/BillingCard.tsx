'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { CreditCard, ExternalLink, Crown } from 'lucide-react'
import { getOrganizationBilling, getBillingStatusDisplay, getBillingStatusColor, getStripeConfig } from '@/lib/billing'
import type { BillingStatus, Entitlements } from '@/types/billing'

interface BillingCardProps {
  organizationId: string
  canManage: boolean
}

export function BillingCard({ organizationId, canManage }: BillingCardProps) {
  const [billingStatus, setBillingStatus] = useState<BillingStatus>('inactive')
  const [entitlements, setEntitlements] = useState<Entitlements>({ ai: false, seats: 10 })
  const [loading, setLoading] = useState(true)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBillingInfo()
  }, [organizationId])

  const loadBillingInfo = async () => {
    try {
      setLoading(true)
      const billing = await getOrganizationBilling()
      if (billing) {
        setBillingStatus(billing.billingStatus)
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

  const statusColor = getBillingStatusColor(billingStatus)
  
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
            {getBillingStatusDisplay(billingStatus)}
          </div>
          {entitlements.ai && (
            <div className="flex items-center gap-1 text-warning-600">
              <Crown size={16} />
              <Typography variant="caption" className="font-medium">
                AI-funktioner aktiverade
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
              <span className={`w-2 h-2 rounded-full ${entitlements.ai ? 'bg-success-500' : 'bg-neutral-300'}`} />
              AI-assisterade bedömningar: {entitlements.ai ? 'Aktiverat' : 'Inte aktiverat'}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-500" />
              Maximalt antal platser: {entitlements.seats}
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