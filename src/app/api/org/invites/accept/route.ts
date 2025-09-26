import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logAuditEvent } from '@/lib/audit'

function serverClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, { global: { headers: { Authorization: req.headers.get('authorization') || '' } }, auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = serverClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({})) as { token?: string }
    if (!body.token) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })

    const { data: inv } = await supabase
      .from('organisation_invites')
      .select('id, org_id, email, role, status, expires_at')
      .eq('token', body.token)
      .maybeSingle()
    if (!inv) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    if (inv.status !== 'pending' || (inv.expires_at && new Date(inv.expires_at) < new Date())) {
      return NextResponse.json({ error: 'Invite expired or used' }, { status: 400 })
    }

    // Upsert membership
    const { error: upErr } = await supabase
      .from('organisation_members')
      .upsert({ org_id: inv.org_id, user_id: user.id, role: inv.role })
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    const { error: updErr } = await supabase
      .from('organisation_invites')
      .update({ status: 'accepted', accepted_by: user.id, accepted_at: new Date().toISOString() })
      .eq('id', inv.id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    try {
      await logAuditEvent({ orgId: inv.org_id, actorId: user.id, action: 'org_member_added', resourceType: 'organisation_members', metadata: { role: inv.role } })
    } catch {}

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
