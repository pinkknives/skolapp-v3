import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('students')
      .select('id, display_name, parental_consent, class_id')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: data.id,
      name: data.display_name,
      parentalConsent: data.parental_consent,
      classId: data.class_id,
    })
  } catch (_error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
