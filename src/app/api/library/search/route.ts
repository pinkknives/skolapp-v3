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
  const q = (searchParams.get('q') || '').trim()
  const tag = searchParams.get('tag') || ''
  let query = supabase
    .from('library_items')
    .select('id, title, item_type, subject, grade, created_at')

  if (q) {
    // Use ilike as portable fallback alongside tsvector index
    query = query.or(`title.ilike.%${q}%,subject.ilike.%${q}%,grade.ilike.%${q}%`)
  }
  if (tag) {
    query = query.in('id',
      (await supabase.from('item_tags').select('item_id, tags(name)').eq('tags.name', tag)).data?.map(r => r.item_id) || []
    )
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data || [] })
}


