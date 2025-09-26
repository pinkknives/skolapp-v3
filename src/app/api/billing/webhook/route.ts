import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe only when needed
const getStripe = async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  
  const { default: Stripe } = await import('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  })
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Service client for updating billing status/entitlements
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'local_service_key'
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any

  try {
    const stripe = await getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Checkout session completed:', session.id)
        
        // Handle successful checkout
        // In a real app, you would:
        // 1. Create or update user subscription in your database
        // 2. Send confirmation email
        // 3. Grant access to premium features
        
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object
        console.log('Subscription created:', subscription.id)
        
        // Update entitlements based on subscription status
        try {
          const customerId = subscription.customer
          const status = subscription.status
          const subscriptionId = subscription.id
          await supabaseService.rpc('update_user_billing_status', {
            customer_id: customerId,
            new_status: status,
            subscription_id: subscriptionId
          })
        } catch (e) {
          console.error('Failed to update billing status (created):', e)
        }
        
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('Subscription updated:', subscription.id)
        
        // Reflect status/plan changes in entitlements
        try {
          const customerId = subscription.customer
          const status = subscription.status
          const subscriptionId = subscription.id
          await supabaseService.rpc('update_user_billing_status', {
            customer_id: customerId,
            new_status: status,
            subscription_id: subscriptionId
          })
        } catch (e) {
          console.error('Failed to update billing status (updated):', e)
        }
        
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('Subscription cancelled:', subscription.id)
        
        // Revoke premium by setting plan to free
        try {
          const customerId = subscription.customer
          const status = subscription.status || 'canceled'
          const subscriptionId = subscription.id
          await supabaseService.rpc('update_user_billing_status', {
            customer_id: customerId,
            new_status: status,
            subscription_id: subscriptionId
          })
        } catch (e) {
          console.error('Failed to update billing status (deleted):', e)
        }
        
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('Payment succeeded:', invoice.id)
        
        // Handle successful payment
        // In a real app, you would:
        // 1. Update payment status in database
        // 2. Send receipt email
        // 3. Extend subscription period
        
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('Payment failed:', invoice.id)
        
        // Handle failed payment
        // In a real app, you would:
        // 1. Update payment status in database
        // 2. Send payment failure notification
        // 3. Implement retry logic
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}