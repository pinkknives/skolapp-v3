import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logTelemetryEvent } from '@/lib/telemetry'

function getServerSupabase(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('authorization') || '' } },
    auth: { persistSession: false }
  })
}

export async function GET(req: NextRequest) {
  const supabase = getServerSupabase(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error: err } = await supabase
    .from('user_settings')
    .select('consent_to_ai_training')
    .eq('user_id', user.id)
    .maybeSingle()
  if (err) return NextResponse.json({ error: err.message }, { status: 500 })
  return NextResponse.json({ consent: data?.consent_to_ai_training ?? false })
}

export async function PATCH(req: NextRequest) {
  const supabase = getServerSupabase(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({})) as { consent?: boolean }
  if (typeof body.consent !== 'boolean') {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
  const { error: upsertErr } = await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, consent_to_ai_training: body.consent, updated_at: new Date().toISOString() })
  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 })
  try {
    logTelemetryEvent('consent_update', { userId: user.id, consent: body.consent })
  } catch {}
  return NextResponse.json({ success: true })
}


