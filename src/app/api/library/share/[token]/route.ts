import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serverClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, { global: { headers: { Authorization: req.headers.get('authorization') || '' } }, auth: { persistSession: false } })
}

export async function GET(req: NextRequest, context: { params: Promise<{ token: string }> }) {
  const token = (await context.params).token
  const supabase = serverClient(req)
  const { data: share } = await supabase.from('library_shares').select('item_id, expires_at, can_copy').eq('token', token).maybeSingle()
  if (!share) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  if (share.expires_at && new Date(share.expires_at) < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 400 })
  const { data: item } = await supabase.from('library_items').select('id, title, type, subject, grade_span, created_at, latest_version_id').eq('id', share.item_id).maybeSingle()
  return NextResponse.json({ item, canCopy: share.can_copy })
}


