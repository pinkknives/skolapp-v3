import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

function isAuthorized(request: NextRequest): boolean {
  const adminApiKey = process.env.ADMIN_API_KEY
  const authHeader = request.headers.get('authorization') || ''
  return !!adminApiKey && authHeader === `Bearer ${adminApiKey}`
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Obehörig' }, { status: 403 })
    }

    const { id } = await context.params
    const { action } = (await request.json().catch(() => ({}))) as { action?: 'approve' | 'reject' }
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Ogiltig åtgärd' }, { status: 400 })
    }

    const supabase = supabaseServer()
    const status = action === 'approve' ? 'approved' : 'rejected'

    const { error } = await supabase
      .from('merge_requests')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Kunde inte uppdatera status' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (_error) {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
