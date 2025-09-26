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
  const libraryId = searchParams.get('library_id')
  let query = supabase.from('library_items').select('id, title, item_type, subject, grade, created_at, latest_version_id')
  if (libraryId) query = query.eq('library_id', libraryId)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = serverClient(req)
  const body = await req.json().catch(() => ({})) as { library_id?: string; item_type?: 'quiz'|'question'; title?: string; subject?: string; grade?: string; content?: unknown }
  if (!body.library_id || !body.item_type || !body.title || !body.content) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: item, error: insErr } = await supabase
    .from('library_items')
    .insert({ library_id: body.library_id, item_type: body.item_type, title: body.title, subject: body.subject || null, grade: body.grade || null, created_by: user.id })
    .select('id')
    .single()
  if (insErr || !item) return NextResponse.json({ error: insErr?.message || 'insert_failed' }, { status: 500 })

  const { data: ver, error: verErr } = await supabase
    .from('item_versions')
    .insert({ item_id: item.id, version_no: 1, content: body.content, created_by: user.id })
    .select('id')
    .single()
  if (verErr || !ver) return NextResponse.json({ error: verErr?.message || 'version_failed' }, { status: 500 })

  await supabase.from('library_items').update({ latest_version_id: ver.id }).eq('id', item.id)
  return NextResponse.json({ success: true, itemId: item.id, versionId: ver.id })
}


