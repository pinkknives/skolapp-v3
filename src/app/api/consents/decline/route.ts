import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'

/**
 * Decline consent via token
 * POST /api/consents/decline
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

    // Update consent record to revoked
    const { error: consentError } = await supabase
      .from('guardian_consents')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        method: 'email',
        evidence: {
          token,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          declined_at: new Date().toISOString()
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
      message: 'Samtycke avböjt',
      details: {
        student_id: invite.student_id,
        status: 'revoked'
      }
    })

  } catch (error) {
    console.error('Error declining consent:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel inträffade' },
      { status: 500 }
    )
  }
}