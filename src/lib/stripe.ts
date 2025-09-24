import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with the publishable key
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  currency: 'SEK',
  country: 'SE',
  locale: 'sv',
}
