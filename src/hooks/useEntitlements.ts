'use client'

import { useState, useEffect } from 'react'
import { hasEntitlement, getOrganizationBilling } from '@/lib/billing'
import type { BillingStatus, Entitlements } from '@/types/billing'

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<Entitlements>({ ai: false, seats: 10 })
  const [billingStatus, setBillingStatus] = useState<BillingStatus>('inactive')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntitlements()
  }, [])

  const loadEntitlements = async () => {
    try {
      const billing = await getOrganizationBilling()
      if (billing) {
        setEntitlements(billing.entitlements)
        setBillingStatus(billing.billingStatus)
      }
    } catch (error) {
      console.error('Failed to load entitlements:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEntitlement = async (key: string): Promise<boolean> => {
    try {
      return await hasEntitlement(key)
    } catch {
      return false
    }
  }

  const hasAI = entitlements.ai
  const canUseAI = billingStatus === 'active' || billingStatus === 'trialing'

  return {
    entitlements,
    billingStatus,
    loading,
    hasAI,
    canUseAI,
    checkEntitlement,
    reload: loadEntitlements
  }
}