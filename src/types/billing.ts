// Billing and subscription types

export type BillingStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'

export interface Entitlements {
  ai: boolean
  seats: number
  [key: string]: boolean | number
}

export interface BillingInfo {
  billingStatus: BillingStatus
  entitlements: Entitlements
  stripeCustomerId?: string
  stripeSubId?: string
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

// Stripe webhook object types
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