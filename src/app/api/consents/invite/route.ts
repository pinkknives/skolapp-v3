import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

/**
 * Send consent invitation to guardian
 * POST /api/consents/invite
 * Body: { orgId: string, studentId: string, guardianEmail: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer()

    // For now, rely on RLS and assume authenticated - optional: add token header validation

    const body = await request.json()
    const { orgId, studentId, guardianEmail } = body as { orgId?: string; studentId?: string; guardianEmail?: string }

    if (!orgId || !studentId || !guardianEmail) {
      return NextResponse.json(
        { error: 'OrgId, studentId och guardianEmail krävs' },
        { status: 400 }
      )
    }

    // Ensure student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, display_name')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Eleven kunde inte hittas' }, { status: 404 })
    }

    const token = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`

    // Upsert guardian_consents to pending
    const { data: existingConsent } = await supabase
      .from('guardian_consents')
      .select('id')
      .eq('org_id', orgId)
      .eq('student_id', studentId)
      .single()

    if (existingConsent) {
      await supabase
        .from('guardian_consents')
        .update({ status: 'pending' })
        .eq('id', existingConsent.id)
    } else {
      await supabase
        .from('guardian_consents')
        .insert({ org_id: orgId, student_id: studentId, status: 'pending' })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 14)

    const { error: inviteError } = await supabase
      .from('consent_invites')
      .insert({
        org_id: orgId,
        student_id: studentId,
        guardian_email: guardianEmail,
        token,
        expires_at: expiresAt.toISOString(),
        meta: { student_name: student.display_name }
      })

    if (inviteError) {
      console.error('Error creating consent invite:', inviteError)
      return NextResponse.json(
        { error: 'Kunde inte skapa samtyckesförfrågan' },
        { status: 500 }
      )
    }

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/consent/${token}`

    // Placeholder for email send – template with round icon
    const emailHtml = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
        <div style="width:64px;height:64px;border-radius:9999px;background:#EEF2FF;display:flex;align-items:center;justify-content:center;margin:16px auto 8px">
          <span style="font-size:28px;color:#4F46E5">✓</span>
        </div>
        <h1 style="text-align:center">Samtycke till databehandling</h1>
        <p>Hej, var vänlig bekräfta samtycke för eleven <b>${student.display_name || ''}</b>.</p>
        <p>Länken är giltig i 14 dagar.</p>
        <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none">Öppna samtyckesformulär</a></p>
      </div>
    `
    console.log('[CONSENT_EMAIL] to:', guardianEmail)
    console.log('[CONSENT_EMAIL] link:', link)
    console.log('[CONSENT_EMAIL] html:', emailHtml)

    return NextResponse.json({ success: true, message: 'Samtyckesförfrågan skapad', link })
  } catch (error) {
    console.error('Consent invite error:', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}