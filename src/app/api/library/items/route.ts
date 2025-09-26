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
  // List latest items in user's orgs (first org for now)
  const { data: orgs } = await supabase.from('org_members').select('org_id').eq('user_id', user.id).eq('status', 'active')
  const firstOrgId = orgs && orgs[0]?.org_id
  if (!firstOrgId) return NextResponse.json({ items: [] })

  const { data } = await supabase
    .from('library_items')
    .select('id, title, type, subject, grade_span, created_at')
    .in('library_id', (await supabase.from('libraries').select('id').eq('org_id', firstOrgId)).data?.map(r => r.id) || [])
    .order('created_at', { ascending: false })
    .limit(50)
  return NextResponse.json({ items: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = serverClient(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as {
    orgId?: string
    quizId: string
    title: string
    tags?: string[]
  }
  if (!body.quizId || !body.title) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  const orgId = body.orgId || null
  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
  }

  const { data: lib } = await supabase
    .from('libraries')
    .select('id')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  let libraryId = lib?.id as string | undefined
  if (!libraryId) {
    const { data: created, error: createErr } = await supabase
      .from('libraries')
      .insert({ org_id: orgId, name: 'Standardbibliotek', created_by: user.id })
      .select('id')
      .single()
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
    libraryId = created.id
  }

  // Fetch quiz minimal info
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title, subject, grade_span')
    .eq('id', body.quizId)
    .maybeSingle()

  const payload = {
    source: 'quiz',
    quizId: body.quizId,
    title: quiz?.title || body.title
  }

  const { data: item, error: itemErr } = await supabase
    .from('library_items')
    .insert({ library_id: libraryId, type: 'quiz', title: body.title, tags: body.tags || null, subject: quiz?.subject || null, grade_span: quiz?.grade_span || null })
    .select('id')
    .single()
  if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 })

  const { data: version, error: verErr } = await supabase
    .from('item_versions')
    .insert({ item_id: item.id, version_no: 1, payload, created_by: user.id })
    .select('id')
    .single()
  if (verErr) return NextResponse.json({ error: verErr.message }, { status: 500 })

  await supabase
    .from('library_items')
    .update({ latest_version_id: version.id })
    .eq('id', item.id)

  return NextResponse.json({ success: true, itemId: item.id })
}


