'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabaseFromAuth(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get('authorization') || '' } },
    auth: { persistSession: false },
  })
}

export async function POST(req: NextRequest) {
  const supabase = supabaseFromAuth(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({})) as { displayName?: string }

  const updates: Record<string, unknown> = {}
  if (typeof body.displayName === 'string') {
    updates['display_name'] = body.displayName.slice(0, 120)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Inget att rätta' }, { status: 400 })
  }

  try {
    await supabase
      .from('profile')
      .update(updates)
      .eq('user_id', user.id)
  } catch {}

  const ack = `srr_rectify_${user.id}_${Date.now()}`
  try {
    await supabase.from('srr_requests').insert({
      user_id: user.id,
      type: 'rectify',
      payload: { fields: Object.keys(updates) },
      status: 'completed',
      ack_id: ack,
    })
  } catch {}

  return NextResponse.json({ success: true, ack })
}
