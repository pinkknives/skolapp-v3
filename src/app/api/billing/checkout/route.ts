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
    
    // Get current user
    const supabase = supabaseBrowser()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad' },
        { status: 401 }
      )
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, display_name')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      return NextResponse.json(
        { error: 'Kunde inte hämta användardata' },
        { status: 500 }
      )
    }
    
    // Initialize Stripe
    const stripe = getStripe()
    
    // Create or get Stripe customer
    let customerId = profile.stripe_customer_id
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.display_name || user.email,
        metadata: {
          user_id: user.id
        }
      })
      
      customerId = customer.id
      
      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
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
      success_url: `${request.nextUrl.origin}/teacher?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/teacher?canceled=true`,
      metadata: {
        user_id: user.id
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          user_id: user.id
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