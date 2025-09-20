import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'

/**
 * Send consent invitation to guardian
 * POST /api/consents/invite
 * Body: { orgId: string, studentId: string, guardianEmail: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseBrowser()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att skicka samtyckesförfrågningar' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orgId, studentId, guardianEmail } = body

    if (!orgId || !studentId || !guardianEmail) {
      return NextResponse.json(
        { error: 'OrgId, studentId och guardianEmail krävs' },
        { status: 400 }
      )
    }

    // Verify user has permission to send invites for this org
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att skicka inbjudningar för denna organisation' },
        { status: 403 }
      )
    }

    // Check if student exists and is part of org (indirect via quiz attempts)
    const { data: student } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', studentId)
      .single()

    if (!student) {
      return NextResponse.json(
        { error: 'Eleven kunde inte hittas' },
        { status: 404 }
      )
    }

    // Generate unique token for consent link
    const token = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
    
    // Create or update consent record
    const { data: existingConsent } = await supabase
      .from('guardian_consents')
      .select('*')
      .eq('org_id', orgId)
      .eq('student_id', studentId)
      .single()

    if (existingConsent) {
      // Update existing record to pending
      await supabase
        .from('guardian_consents')
        .update({
          status: 'pending',
          updated_by: user.id
        })
        .eq('id', existingConsent.id)
    } else {
      // Create new consent record
      await supabase
        .from('guardian_consents')
        .insert({
          org_id: orgId,
          student_id: studentId,
          status: 'pending',
          created_by: user.id
        })
    }

    // Create consent invite
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 14) // 14 days from now

    const { data: invite, error: inviteError } = await supabase
      .from('consent_invites')
      .insert({
        org_id: orgId,
        student_id: studentId,
        guardian_email: guardianEmail,
        token,
        expires_at: expiresAt.toISOString(),
        meta: {
          sent_by: user.id,
          student_email: student.email
        }
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating consent invite:', inviteError)
      return NextResponse.json(
        { error: 'Kunde inte skapa samtyckesförfrågan: ' + inviteError.message },
        { status: 500 }
      )
    }

    // TODO: Send email notification (v1: log only)
    console.log(`[CONSENT INVITE] Email would be sent to ${guardianEmail}`)
    console.log(`[CONSENT INVITE] Token: ${token}`)
    console.log(`[CONSENT INVITE] Link: ${process.env.NEXT_PUBLIC_APP_URL}/consent/${token}`)

    return NextResponse.json({
      success: true,
      message: 'Samtyckesförfrågan skickad',
      invite: {
        id: invite.id,
        token,
        guardian_email: guardianEmail,
        expires_at: expiresAt
      }
    })

  } catch (error) {
    console.error('Error sending consent invite:', error)
    return NextResponse.json(
      { error: 'Ett oväntat fel inträffade' },
      { status: 500 }
    )
  }
}