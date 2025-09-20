'use client'

import { useState, useEffect } from 'react'
import { hasEntitlement, getUserBilling } from '@/lib/billing'
import type { BillingStatus, Entitlements, Plan } from '@/types/billing'

export function useEntitlements() {
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
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [plan, setPlan] = useState<Plan | null>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntitlements()
  }, [])

  const loadEntitlements = async () => {
    try {
      const billing = await getUserBilling()
      if (billing) {
        setEntitlements(billing.entitlements)
        setBillingStatus(billing.billingStatus)
        setPlan(billing.plan)
      }
    } catch (error) {
      console.error('Failed to load entitlements:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEntitlement = async (key: keyof Entitlements): Promise<boolean> => {
    try {
      return await hasEntitlement(key)
    } catch {
      return false
    }
  }

  const hasAI = entitlements.ai_unlimited || entitlements.ai_monthly_used < entitlements.ai_monthly_quota
  const canUseAI = billingStatus === 'active' || billingStatus === 'trialing' || hasAI

  return {
    entitlements,
    billingStatus,
    plan,
    loading,
    hasAI,
    canUseAI,
    checkEntitlement,
    reload: loadEntitlements
  }
}