import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/billing'
import { supabaseBrowser } from '@/lib/supabase-browser'

export async function POST(request: NextRequest) {
  try {
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
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()
    
    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Ingen aktiv prenumeration hittades' },
        { status: 404 }
      )
    }
    
    // Initialize Stripe
    const stripe = getStripe()
    
    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/teacher`
    })
    
    return NextResponse.json({
      url: portalSession.url
    })
    
  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: 'Ett fel inträffade vid skapandet av billing portal-sessionen' },
      { status: 500 }
    )
  }
}