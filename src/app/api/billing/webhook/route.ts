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
        const subscriptionId = session.subscription
        const customerId = session.customer
        const planMeta = session.metadata?.plan
        const orgId = session.metadata?.org_id || null
        const uid = session.metadata?.uid || null

        if (subscriptionId && customerId && planMeta && (orgId || uid)) {
          await supabaseService.from('subscriptions').upsert({
            org_id: orgId || null,
            user_id: orgId ? null : uid,
            plan: planMeta,
            stripe_customer_id: String(customerId),
            stripe_subscription_id: String(subscriptionId),
            updated_at: new Date().toISOString(),
          }, { onConflict: orgId ? 'org_id' : 'user_id' })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const currentPeriodEnd = subscription.current_period_end
        const stripeSubId = subscription.id
        const customerId = subscription.customer

        // Try to find matching subscription by stripe_customer_id or stripe_subscription_id
        const { data: rows } = await supabaseService
          .from('subscriptions')
          .select('id')
          .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${stripeSubId}`)
          .limit(1)

        if (rows && rows.length > 0) {
          await supabaseService
            .from('subscriptions')
            .update({
              stripe_customer_id: String(customerId),
              stripe_subscription_id: String(stripeSubId),
              current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', rows[0].id)
        }

        break
      }

      default:
        // ignore
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}