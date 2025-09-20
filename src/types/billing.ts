// Billing and subscription types

export type BillingStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
export type Plan = 'free' | 'pro'

export interface Entitlements {
  ai_unlimited: boolean
  export_csv: boolean
  advanced_analytics: boolean
  seats: number
  ai_monthly_quota: number
  ai_monthly_used: number
  period_start: string
  period_end: string
}

export interface BillingInfo {
  billingStatus: BillingStatus | null
  entitlements: Entitlements
  stripeCustomerId?: string
  plan: Plan | null
}

export interface StripeConfig {
  publicKey: string
  monthlyPriceId: string
  annualPriceId: string
}

export interface CheckoutSessionData {
  sessionId: string
  url: string
}

export interface BillingPortalData {
  url: string
}

// Stripe webhook event types
export type StripeWebhookEvent = 
  | 'checkout.session.completed'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'

// Usage quota related types
export interface UsageInfo {
  ai_monthly_used: number
  ai_monthly_quota: number
  ai_unlimited: boolean
  period_start: string
  period_end: string
}

export interface QuotaStatus {
  hasQuota: boolean
  used: number
  limit: number
  isUnlimited: boolean
  daysUntilReset: number
}
export interface StripeCheckoutSession {
  id: string
  mode: string
  customer: string
  subscription?: string
}

export interface StripeSubscription {
  id: string
  customer: string
  status: string
}

export interface StripeInvoice {
  id: string
  customer: string
  subscription?: string
}

export interface StripeWebhookPayload {
  id: string
  object: string
  type: StripeWebhookEvent
  data: {
    object: StripeCheckoutSession | StripeSubscription | StripeInvoice
  }
  created: number
}