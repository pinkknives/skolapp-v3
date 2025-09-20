import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'

/**
 * Get consent status for a student
 * GET /api/consents/[studentId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const supabase = supabaseBrowser()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad' },
        { status: 401 }
      )
    }

    const { studentId } = await params

    if (!studentId) {
      return NextResponse.json(
        { error: 'StudentId krävs' },
        { status: 400 }
      )
    }

    // Get the user's organizations to check permissions
    const { data: userOrgs } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (!userOrgs || userOrgs.length === 0) {
      return NextResponse.json(
        { error: 'Du har inte tillgång till någon organisation' },
        { status: 403 }
      )
    }

    const orgIds = userOrgs.map(org => org.org_id)

    // Get consent records for student in user's organizations
    const { data: consents, error: consentError } = await supabase
      .from('guardian_consents')
      .select(`
        *,
        orgs!inner(id, name)
      `)
      .eq('student_id', studentId)
      .in('org_id', orgIds)

    if (consentError) {
      console.error('Error fetching consent records:', consentError)
      return NextResponse.json(
        { error: 'Kunde inte hämta samtyckesuppgifter' },
        { status: 500 }
      )
    }

    // Get organization settings for each consent
    const orgSettings = await Promise.all(
      orgIds.map(async (orgId) => {
        const { data: settings } = await supabase
          .from('org_settings')
          .select('require_guardian_consent, consent_valid_months, retention_korttid_days')
          .eq('org_id', orgId)
          .single()
        
        return { 
          orgId, 
          settings: settings as { 
            require_guardian_consent?: boolean; 
            consent_valid_months?: number; 
            retention_korttid_days?: number; 
          } | null 
        }
      })
    )

    // Build response with consolidated consent status
    const consentStatus = consents.map(consent => {
      const orgSetting = orgSettings.find(s => s.orgId === consent.org_id)
      const isExpired = consent.expires_at && new Date(consent.expires_at) < new Date()
      
      return {
        id: consent.id,
        org_id: consent.org_id,
        org_name: consent.orgs.name,
        status: isExpired ? 'expired' : consent.status,
        granted_at: consent.granted_at,
        expires_at: consent.expires_at,
        method: consent.method,
        requires_consent: orgSetting?.settings?.require_guardian_consent || false,
        created_at: consent.created_at,
        updated_at: consent.updated_at
      }
    })

    return NextResponse.json({
      student_id: studentId,
      consents: consentStatus,
      requires_consent_for_long_term: consentStatus.some(c => c.requires_consent),
      has_valid_consent: consentStatus.some(c => c.status === 'granted' && c.expires_at && new Date(c.expires_at) > new Date())
    })

  } catch (error) {
    console.error('Error getting consent status:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel inträffade' },
      { status: 500 }
    )
  }
}