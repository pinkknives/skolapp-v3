// Billing utilities and Stripe integration
import Stripe from 'stripe'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { BillingStatus, Entitlements } from '@/types/billing'

// Initialize Stripe (server-side only)
let stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil'
    })
  }
  return stripe
}

// Client-side Stripe configuration
export function getStripeConfig() {
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL
  
  if (!monthlyPriceId || !annualPriceId) {
    throw new Error('Stripe price IDs are not configured')
  }
  
  return {
    monthlyPriceId,
    annualPriceId
  }
}

/**
 * Check if current user's organization has a specific entitlement
 */
export async function hasEntitlement(entitlementKey: string): Promise<boolean> {
  const supabase = supabaseBrowser()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return false
    }

    // Get user's active organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('org_members')
      .select(`
        org:org_id (
          id,
          entitlements
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership?.org) {
      return false
    }

    const org = membership.org as unknown as { id: string; entitlements: Entitlements }
    return Boolean(org.entitlements[entitlementKey])
  } catch {
    return false
  }
}

/**
 * Get current user's organization billing information
 */
export async function getOrganizationBilling(): Promise<{
  billingStatus: BillingStatus
  entitlements: Entitlements
} | null> {
  const supabase = supabaseBrowser()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return null
    }

    // Get user's active organization
    const { data: membership, error: membershipError } = await supabase
      .from('org_members')
      .select(`
        org:org_id (
          billing_status,
          entitlements
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership?.org) {
      return null
    }

    const org = membership.org as unknown as {
      billing_status: BillingStatus
      entitlements: Entitlements
    }

    return {
      billingStatus: org.billing_status,
      entitlements: org.entitlements
    }
  } catch {
    return null
  }
}

/**
 * Format billing status for display
 */
export function getBillingStatusDisplay(status: BillingStatus): string {
  switch (status) {
    case 'active':
      return 'Aktiv'
    case 'trialing':
      return 'Provperiod'
    case 'past_due':
      return 'Förfallen'
    case 'canceled':
      return 'Avslutad'
    case 'inactive':
      return 'Inaktiv'
    default:
      return 'Okänd'
  }
}

/**
 * Get billing status color class for UI
 */
export function getBillingStatusColor(status: BillingStatus): string {
  switch (status) {
    case 'active':
      return 'text-success-600 bg-success-50 border-success-200'
    case 'trialing':
      return 'text-info-600 bg-info-50 border-info-200'
    case 'past_due':
      return 'text-warning-600 bg-warning-50 border-warning-200'
    case 'canceled':
    case 'inactive':
      return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    default:
      return 'text-neutral-600 bg-neutral-50 border-neutral-200'
  }
}

/**
 * Check if billing status allows AI features
 */
export function canUseAIFeatures(status: BillingStatus): boolean {
  return status === 'active' || status === 'trialing'
}