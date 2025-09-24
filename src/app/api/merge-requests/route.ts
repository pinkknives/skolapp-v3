import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { sourceStudentId, targetStudentId, reason } = (await req.json().catch(() => ({}))) as {
      sourceStudentId?: string
      targetStudentId?: string
      reason?: string
    }

    if (!sourceStudentId || !targetStudentId) {
      return NextResponse.json({ error: 'sourceStudentId och targetStudentId krävs' }, { status: 400 })
    }

    const supabase = supabaseServer()

    // We assume auth via RLS; optionally could check session

    const { data, error } = await supabase
      .from('merge_requests')
      .insert({ source_student_id: sourceStudentId, target_student_id: targetStudentId, reason })
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Kunde inte skapa begäran' }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: data })
  } catch (error) {
    console.error('merge request error', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('merge_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Kunde inte hämta begäran' }, { status: 500 })
    }

    return NextResponse.json({ items: data || [] })
  } catch (_error) {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
