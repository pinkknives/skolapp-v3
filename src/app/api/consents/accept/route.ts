import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'

/**
 * Accept consent via token
 * POST /api/consents/accept
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseBrowser()
    
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token krävs' },
        { status: 400 }
      )
    }

    // Find the invite by token
    const { data: invite, error: inviteError } = await supabase
      .from('consent_invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Ogiltig eller utgången länk' },
        { status: 404 }
      )
    }

    // Check if invite is still valid
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Länken har gått ut' },
        { status: 410 }
      )
    }

    if (invite.status !== 'sent' && invite.status !== 'visited') {
      return NextResponse.json(
        { error: 'Denna länk har redan använts' },
        { status: 410 }
      )
    }

    // Get organization settings for consent validity period
    const { data: orgSettings } = await supabase
      .from('org_settings')
      .select('consent_valid_months')
      .eq('org_id', invite.org_id)
      .single()

    const validMonths = orgSettings?.consent_valid_months || 12

    // Calculate expiry date for consent
    const consentExpiresAt = new Date()
    consentExpiresAt.setMonth(consentExpiresAt.getMonth() + validMonths)

    // Update consent record to granted
    const { error: consentError } = await supabase
      .from('guardian_consents')
      .update({
        status: 'granted',
        granted_at: new Date().toISOString(),
        expires_at: consentExpiresAt.toISOString(),
        method: 'email',
        evidence: {
          token,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          accepted_at: new Date().toISOString()
        }
      })
      .eq('org_id', invite.org_id)
      .eq('student_id', invite.student_id)

    if (consentError) {
      console.error('Error updating consent:', consentError)
      return NextResponse.json(
        { error: 'Kunde inte uppdatera samtycke' },
        { status: 500 }
      )
    }

    // Mark invite as completed
    await supabase
      .from('consent_invites')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', invite.id)

    return NextResponse.json({
      success: true,
      message: 'Samtycke godkänt',
      details: {
        student_id: invite.student_id,
        expires_at: consentExpiresAt,
        valid_for_months: validMonths
      }
    })

  } catch (error) {
    console.error('Error accepting consent:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel inträffade' },
      { status: 500 }
    )
  }
}