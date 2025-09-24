import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, teacher_id')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json({ id: data.id, name: data.name, teacherId: data.teacher_id })
  } catch (_error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
