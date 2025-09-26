import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serverClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, { global: { headers: { Authorization: req.headers.get('authorization') || '' } }, auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  const supabase = serverClient(req)
  const { searchParams } = new URL(req.url)
  const email = (searchParams.get('email') || '').toLowerCase()
  const domain = email.split('@')[1]
  if (!domain) return NextResponse.json({ org: null })
  const { data } = await supabase.from('org_domains').select('org_id').eq('domain', domain).maybeSingle()
  return NextResponse.json({ orgId: data?.org_id || null })
}


