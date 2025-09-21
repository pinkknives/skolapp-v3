// scripts/health/stripe.ts
import * as dotenv from 'dotenv'
import Stripe from 'stripe'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY")
  }

  // Initialize Stripe client
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil', // Use latest API version
    appInfo: {
      name: 'Skolapp-v3 Health Check',
      version: '1.0.0'
    }
  })

  // Test by retrieving account information (minimal cost operation)
  try {
    const account = await stripe.accounts.retrieve()
    
    if (!account.id) {
      throw new Error("No account ID returned from Stripe")
    }

    // Verify account is active
    if (account.details_submitted !== true) {
      console.warn("Stripe account not fully set up, but API connection works")
    }

    console.log("STRIPE_OK")
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.type} - ${error.message}`)
    }
    throw error
  }
}

main().catch((e) => {
  console.error("Stripe error:", e?.message || e)
  process.exit(1)
})