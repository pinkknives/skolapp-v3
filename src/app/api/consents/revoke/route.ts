import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'

/**
 * Revoke consent (admin/teacher action)
 * POST /api/consents/revoke
 * Body: { studentId: string, orgId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseBrowser()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att återkalla samtycken' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { studentId, orgId } = body

    if (!studentId || !orgId) {
      return NextResponse.json(
        { error: 'StudentId och orgId krävs' },
        { status: 400 }
      )
    }

    // Verify user has permission to revoke consent for this org
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att återkalla samtycken för denna organisation' },
        { status: 403 }
      )
    }

    // Find existing consent record
    const { data: existingConsent } = await supabase
      .from('guardian_consents')
      .select('*')
      .eq('org_id', orgId)
      .eq('student_id', studentId)
      .single()

    if (!existingConsent) {
      return NextResponse.json(
        { error: 'Ingen samtyckespost hittades' },
        { status: 404 }
      )
    }

    if (existingConsent.status === 'revoked') {
      return NextResponse.json(
        { error: 'Samtycket är redan återkallat' },
        { status: 400 }
      )
    }

    // Update consent record to revoked
    const { error: consentError } = await supabase
      .from('guardian_consents')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        method: 'admin-override',
        evidence: {
          ...existingConsent.evidence,
          admin_revoked_by: user.id,
          admin_revoked_at: new Date().toISOString(),
          revocation_reason: 'Admin override'
        },
        updated_by: user.id
      })
      .eq('id', existingConsent.id)

    if (consentError) {
      console.error('Error revoking consent:', consentError)
      return NextResponse.json(
        { error: 'Kunde inte återkalla samtycke: ' + consentError.message },
        { status: 500 }
      )
    }

    // TODO: Trigger data cleanup for this student
    // This would be handled by the retention job

    return NextResponse.json({
      success: true,
      message: 'Samtycke återkallat',
      details: {
        student_id: studentId,
        org_id: orgId,
        revoked_by: user.id,
        revoked_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error revoking consent:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel inträffade' },
      { status: 500 }
    )
  }
}