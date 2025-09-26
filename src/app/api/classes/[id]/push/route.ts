import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServerSupabase(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('authorization') || '' } },
    auth: { persistSession: false }
  })
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase(req)
  const { id } = await context.params
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({})) as { enabled?: boolean }
  if (typeof body.enabled !== 'boolean') return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  const { error: updErr } = await supabase
    .from('classes')
    .update({ push_notifications_enabled: body.enabled })
    .eq('id', id)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
  return NextResponse.json({ success: true })
}


