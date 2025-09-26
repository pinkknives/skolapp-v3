import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serverClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, { global: { headers: { Authorization: req.headers.get('authorization') || '' } }, auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  const supabase = serverClient(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const tag = (searchParams.get('tag') || '').trim()

  const { data: orgs } = await supabase.from('org_members').select('org_id').eq('user_id', user.id).eq('status', 'active')
  const firstOrgId = orgs && orgs[0]?.org_id
  if (!firstOrgId) return NextResponse.json({ items: [] })

  const { data: libIds } = await supabase.from('libraries').select('id').eq('org_id', firstOrgId)
  const libraryIds = (libIds || []).map(r => r.id)

  let query = supabase
    .from('library_items')
    .select('id, title, type, subject, grade_span, created_at')
    .in('library_id', libraryIds)

  if (q) {
    // use trigram-backed ilike filters
    query = query.or(`title.ilike.%${q}%,subject.ilike.%${q}%,grade_span.ilike.%${q}%`)
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data || [] })
}


