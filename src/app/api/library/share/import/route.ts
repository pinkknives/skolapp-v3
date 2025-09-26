import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serverClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, { global: { headers: { Authorization: req.headers.get('authorization') || '' } }, auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  const supabase = serverClient(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({})) as { token?: string; target_library_id?: string }
  if (!body.token || !body.target_library_id) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })

  const { data: share } = await supabase.from('library_shares').select('item_id, expires_at, can_copy').eq('token', body.token).maybeSingle()
  if (!share) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  if (share.expires_at && new Date(share.expires_at) < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 400 })
  if (!share.can_copy) return NextResponse.json({ error: 'Copy not allowed' }, { status: 403 })

  const { data: srcItem } = await supabase.from('library_items').select('id, item_type, title, subject, grade').eq('id', share.item_id).maybeSingle()
  if (!srcItem) return NextResponse.json({ error: 'Item missing' }, { status: 404 })

  const { data: srcVer } = await supabase.from('item_versions').select('content').eq('item_id', srcItem.id).order('version_no', { ascending: false }).limit(1).maybeSingle()
  if (!srcVer) return NextResponse.json({ error: 'Version missing' }, { status: 404 })

  const { data: newItem, error: insErr } = await supabase
    .from('library_items')
    .insert({ library_id: body.target_library_id, item_type: srcItem.item_type, title: srcItem.title, subject: srcItem.subject, grade: srcItem.grade, created_by: user.id })
    .select('id')
    .single()
  if (insErr || !newItem) return NextResponse.json({ error: insErr?.message || 'insert_failed' }, { status: 500 })

  const { data: newVer, error: verErr } = await supabase
    .from('item_versions')
    .insert({ item_id: newItem.id, version_no: 1, content: srcVer.content, created_by: user.id })
    .select('id')
    .single()
  if (verErr || !newVer) return NextResponse.json({ error: verErr?.message || 'version_failed' }, { status: 500 })

  await supabase.from('library_items').update({ latest_version_id: newVer.id }).eq('id', newItem.id)
  return NextResponse.json({ success: true, itemId: newItem.id })
}


