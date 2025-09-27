import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await requireTeacher()
    const supabase = supabaseServer()
    const body = await req.json().catch(() => ({})) as { parent_item_id?: string }
    if (!body.parent_item_id) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })

    // Load parent item and latest version
    const { data: parent, error: pErr } = await supabase
      .from('library_items')
      .select('id, title, item_type, subject, grade, latest_version_id')
      .eq('id', body.parent_item_id)
      .single()
    if (pErr || !parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 })

    // Create child item
    const { data: childItem, error: cErr } = await supabase
      .from('library_items')
      .insert({
        title: `${parent.title} (kopierad)`,
        item_type: parent.item_type,
        subject: parent.subject,
        grade: parent.grade,
        created_by: user.id
      })
      .select('id')
      .single()
    if (cErr || !childItem) return NextResponse.json({ error: 'Copy failed' }, { status: 500 })

    // Copy version content if available
    if (parent.latest_version_id) {
      const { data: version } = await supabase
        .from('item_versions')
        .select('content')
        .eq('id', parent.latest_version_id)
        .single()
      if (version) {
        await supabase.from('item_versions').insert({ item_id: childItem.id, version_no: 1, content: version.content, created_by: user.id })
      }
    }

    // Create remix ref
    await supabase.from('remix_refs').insert({ parent_item_id: parent.id, child_item_id: childItem.id, created_by: user.id })

    return NextResponse.json({ success: true, child_item_id: childItem.id })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
