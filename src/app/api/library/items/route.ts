import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireTeacher()
    const supabase = supabaseServer()
    const url = new URL(req.url)
    const scope = url.searchParams.get('scope') || 'mine'

    let query = supabase
      .from('library_items')
      .select('id, title, item_type, subject, grade, created_at')
      .order('created_at', { ascending: false })

    if (scope === 'public') {
      query = query.eq('published', true)
    } else {
      // default: items created by user
      query = query.eq('created_by', user.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data })
  } catch {
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
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


