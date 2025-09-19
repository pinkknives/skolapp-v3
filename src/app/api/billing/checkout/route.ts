import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/billing'
import { supabaseBrowser } from '@/lib/supabase-browser'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { priceId, mode = 'subscription' } = await request.json()
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID är obligatorisk' },
        { status: 400 }
      )
    }
    
    // Get current user and organization
    const supabase = supabaseBrowser()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad' },
        { status: 401 }
      )
    }
    
    // Get user's organization
    const { data: membership, error: membershipError } = await supabase
      .from('org_members')
      .select(`
        org:org_id (
          id,
          name,
          stripe_customer_id
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .in('role', ['owner', 'admin']) // Only owners and admins can manage billing
      .single()
    
    if (membershipError || !membership?.org) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att hantera fakturering för denna organisation' },
        { status: 403 }
      )
    }
    
    const org = (membership.org as unknown as { id: string; name: string; stripe_customer_id?: string })
    
    // Initialize Stripe
    const stripe = getStripe()
    
    // Create or get Stripe customer
    let customerId = org.stripe_customer_id
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          org_id: org.id,
          org_name: org.name
        }
      })
      
      customerId = customer.id
      
      // Update organization with customer ID
      await supabase
        .from('orgs')
        .update({ stripe_customer_id: customerId })
        .eq('id', org.id)
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as 'subscription' | 'payment',
      success_url: `${request.nextUrl.origin}/teacher/org?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/teacher/org?canceled=true`,
      metadata: {
        org_id: org.id
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          org_id: org.id
        }
      } : undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'sv' // Swedish locale
    })
    
    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
    
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Ett fel inträffade vid skapandet av checkout-sessionen' },
      { status: 500 }
    )
  }
}