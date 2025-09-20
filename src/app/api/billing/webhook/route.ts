import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/billing'
import { createClient } from '@supabase/supabase-js'
import type { BillingStatus } from '@/types/billing'

// Use service role for webhook operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event

  try {
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Stripe webhook handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutCompleted(session: any) {
  console.log('Checkout completed:', session.id)
  
  if (session.mode === 'subscription' && session.subscription) {
    // Get the subscription to get the current status
    const stripe = getStripe()
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    
    const billingStatus: BillingStatus = subscription.status === 'active' ? 'active' : 
                                        subscription.status === 'trialing' ? 'trialing' : 'inactive'
    
    await updateBillingStatus(session.customer, billingStatus, subscription.id)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id)
  
  const billingStatus: BillingStatus = subscription.status === 'active' ? 'active' :
                                      subscription.status === 'trialing' ? 'trialing' :
                                      subscription.status === 'past_due' ? 'past_due' :
                                      subscription.status === 'canceled' ? 'canceled' : 'inactive'
  
  await updateBillingStatus(subscription.customer, billingStatus, subscription.id)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id)
  
  await updateBillingStatus(subscription.customer, 'canceled', subscription.id)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentSucceeded(invoice: any) {
  console.log('Payment succeeded:', invoice.id)
  
  if (invoice.subscription) {
    // Reactivate subscription if it was past due
    const stripe = getStripe()
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    
    if (subscription.status === 'active') {
      await updateBillingStatus(invoice.customer, 'active', subscription.id)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed:', invoice.id)
  
  if (invoice.subscription) {
    const stripe = getStripe()
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    
    const billingStatus: BillingStatus = subscription.status === 'past_due' ? 'past_due' : 'inactive'
    await updateBillingStatus(invoice.customer, billingStatus, subscription.id)
  }
}

async function updateBillingStatus(customerId: string, status: BillingStatus, subscriptionId?: string) {
  try {
    // Use the database function to update user billing status
    const { error } = await supabase.rpc('update_user_billing_status', {
      customer_id: customerId,
      new_status: status,
      subscription_id: subscriptionId
    })
    
    if (error) {
      console.error('Error updating user billing status:', error)
      throw error
    }
    
    console.log(`Updated billing status for customer ${customerId} to ${status}`)
  } catch (error) {
    console.error('Failed to update billing status:', error)
    throw error
  }
}