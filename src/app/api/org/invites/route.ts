import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
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

    const body = await req.json().catch(() => ({})) as { org_id?: string; email?: string; role?: 'admin' | 'teacher'; expires_in_hours?: number }
    if (!body.org_id || !body.email) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })

    // require admin in org
    const { data: me } = await supabase
      .from('organisation_members')
      .select('role')
      .eq('org_id', body.org_id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!me || me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const token = crypto.randomBytes(24).toString('hex')
    const expires = new Date(Date.now() + (body.expires_in_hours ?? 72) * 3600 * 1000).toISOString()

    const { error } = await supabase.from('organisation_invites').insert({
      org_id: body.org_id,
      email: String(body.email).toLowerCase(),
      role: body.role ?? 'teacher',
      token,
      status: 'pending',
      expires_at: expires,
      created_by: user.id
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await logAuditEvent({ orgId: body.org_id, actorId: user.id, action: 'org_invite_created', resourceType: 'organisation_invites', metadata: { email: body.email, role: body.role ?? 'teacher' } })
    } catch {}

    return NextResponse.json({ success: true, token })
  } catch (_e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = serverClient(req)
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') || ''
    if (!token) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })

    const { data } = await supabase
      .from('organisation_invites')
      .select('org_id, email, role, status, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (!data) return NextResponse.json({ valid: false })
    const expired = data.expires_at && new Date(data.expires_at) < new Date()
    return NextResponse.json({ valid: !expired && data.status === 'pending', invite: data })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
