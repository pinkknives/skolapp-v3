import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { resolveCurrentOrgId } from '@/lib/org'
import { track } from '@/lib/telemetry'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = supabaseServer()
    const orgId = await resolveCurrentOrgId(req.headers.get('cookie') || undefined)
    track('org_scope_resolved', { orgId: orgId ?? 'none' })
    let query = supabase
      .from('classes')
      .select('id, name, teacher_id, org_id')
      .eq('id', id)

    if (orgId) {
      query = query.eq('org_id', orgId)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json({ id: data.id, name: data.name, teacherId: data.teacher_id, orgId: data.org_id })
  } catch (_error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
