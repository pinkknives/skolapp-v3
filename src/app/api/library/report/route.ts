import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await requireTeacher()
    const supabase = supabaseServer()
    const body = await req.json().catch(() => ({})) as { item_id?: string; reason?: string }
    if (!body.item_id || !body.reason) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    const { error } = await supabase.from('library_reports').insert({ item_id: body.item_id, reported_by: user.id, reason: body.reason })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
