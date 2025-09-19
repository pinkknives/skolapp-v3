import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/billing'
import { supabaseBrowser } from '@/lib/supabase-browser'

export async function POST(request: NextRequest) {
  try {
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
    
    const org = (membership.org as unknown as { id: string; stripe_customer_id?: string })
    
    if (!org.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Ingen aktiv prenumeration hittades' },
        { status: 404 }
      )
    }
    
    // Initialize Stripe
    const stripe = getStripe()
    
    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/teacher/org`
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