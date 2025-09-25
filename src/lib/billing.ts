// Billing utilities and Stripe integration
import Stripe from 'stripe'
import { supabaseBrowser } from '@/lib/supabase-browser'

const ENTITLEMENTS_ENABLED = process.env.NEXT_PUBLIC_ENTITLEMENTS_ENABLED !== 'false'
import type { BillingStatus, Entitlements, BillingInfo, UsageInfo, QuotaStatus } from '@/types/billing'

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
 * Check if current user has a specific entitlement
 */
export async function hasEntitlement(entitlementKey: keyof Entitlements): Promise<boolean> {
  const supabase = supabaseBrowser()
  if (!ENTITLEMENTS_ENABLED) return false
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return false
    }

    if (!ENTITLEMENTS_ENABLED) return false
    const { data, error } = await supabase
      .from('entitlements')
      .select('*')
      .eq('uid', user.id)
      .single()

    if (error || !data) {
      return false
    }

    return Boolean(data[entitlementKey])
  } catch {
    return false
  }
}

/**
 * Get current user's billing information
 */
export async function getUserBilling(): Promise<BillingInfo | null> {
  const supabase = supabaseBrowser()
  if (!ENTITLEMENTS_ENABLED) {
    const ent: Entitlements = {
      ai_unlimited: true,
      export_csv: false,
      advanced_analytics: false,
      seats: 1,
      ai_monthly_quota: 0,
      ai_monthly_used: 0,
      period_start: '',
      period_end: ''
    }
    const info: BillingInfo = {
      billingStatus: null,
      entitlements: ent,
      plan: null,
    }
    return info
  }
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return null
    }

    // Get user profile and entitlements
    const [profileResult, entitlementsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('stripe_customer_id, subscription_status, plan')
        .eq('user_id', user.id)
        .single(),
      ENTITLEMENTS_ENABLED
        ? supabase
            .from('entitlements')
            .select('*')
            .eq('uid', user.id)
            .single()
        : Promise.resolve({ data: null as unknown, error: null as unknown })
    ])

    if (profileResult.error || entitlementsResult.error) {
      return null
    }

    const profile = profileResult.data
    const entitlements: {
      ai_unlimited: boolean
      export_csv: boolean
      advanced_analytics: boolean
      seats: number
      ai_monthly_quota: number
      ai_monthly_used: number
      period_start: string | null
      period_end: string | null
    } = entitlementsResult.data || {
      ai_unlimited: true,
      export_csv: false,
      advanced_analytics: false,
      seats: 1,
      ai_monthly_quota: 0,
      ai_monthly_used: 0,
      period_start: null,
      period_end: null,
    }

    return {
      billingStatus: profile.subscription_status,
      entitlements: {
        ai_unlimited: entitlements.ai_unlimited,
        export_csv: entitlements.export_csv,
        advanced_analytics: entitlements.advanced_analytics,
        seats: entitlements.seats,
        ai_monthly_quota: entitlements.ai_monthly_quota,
        ai_monthly_used: entitlements.ai_monthly_used,
      period_start: entitlements.period_start ?? '',
      period_end: entitlements.period_end ?? ''
      },
      stripeCustomerId: profile.stripe_customer_id,
      plan: profile.plan
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
export function canUseAIFeatures(status: BillingStatus | null): boolean {
  return status === 'active' || status === 'trialing'
}

/**
 * Get user's AI usage information
 */
export async function getUsageInfo(): Promise<UsageInfo | null> {
  const supabase = supabaseBrowser()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return null
    }

    if (!ENTITLEMENTS_ENABLED) {
      return {
        ai_monthly_used: 0,
        ai_monthly_quota: 0,
        ai_unlimited: true,
        period_start: null as unknown as string,
        period_end: null as unknown as string,
      }
    }
    const { data, error } = await supabase
      .from('entitlements')
      .select('ai_monthly_used, ai_monthly_quota, ai_unlimited, period_start, period_end')
      .eq('uid', user.id)
      .single()

    if (error || !data) {
      return null
    }

    return {
      ai_monthly_used: data.ai_monthly_used,
      ai_monthly_quota: data.ai_monthly_quota,
      ai_unlimited: data.ai_unlimited,
      period_start: data.period_start,
      period_end: data.period_end
    }
  } catch {
    return null
  }
}

/**
 * Check if user can use AI features (considering quota)
 */
export async function canUseAI(): Promise<boolean> {
  const usage = await getUsageInfo()
  if (!usage) return false
  
  return usage.ai_unlimited || usage.ai_monthly_used < usage.ai_monthly_quota
}

/**
 * Get quota status for display
 */
export async function getQuotaStatus(): Promise<QuotaStatus | null> {
  const usage = await getUsageInfo()
  if (!usage) return null

  const periodEnd = new Date(usage.period_end)
  const now = new Date()
  const daysUntilReset = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    hasQuota: !usage.ai_unlimited,
    used: usage.ai_monthly_used,
    limit: usage.ai_monthly_quota,
    isUnlimited: usage.ai_unlimited,
    daysUntilReset: Math.max(0, daysUntilReset)
  }
}

/**
 * Increment AI usage (server-side only)
 */
export async function incrementAIUsage(): Promise<boolean> {
  // This should only be called from server-side API routes
  // The actual implementation will be in the API route using the database function
  throw new Error('incrementAIUsage should only be called from server-side API routes')
}