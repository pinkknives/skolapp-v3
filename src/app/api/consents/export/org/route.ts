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

export async function GET(req: NextRequest) {
  const supabase = supabaseFromAuth(req)
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('orgId')
  if (!orgId) return NextResponse.json({ error: 'orgId krävs' }, { status: 400 })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // RLS will ensure only admins can read within org
  const { data, error: err } = await supabase
    .from('consent_logs')
    .select('created_at, user_id, scope, event, previous, current')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (err) return NextResponse.json({ error: err.message }, { status: 500 })
  return NextResponse.json({ orgId, items: data ?? [] })
}
