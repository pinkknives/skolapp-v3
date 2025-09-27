import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireTeacher } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params
    const user = await requireTeacher()
    const supabase = supabaseServer()

    const body = await request.json().catch(() => ({})) as { lock?: boolean }
    if (typeof body.lock !== 'boolean') {
      return NextResponse.json({ error: 'lock måste vara boolean' }, { status: 400 })
    }

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('created_by', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session hittades inte eller behörighet saknas' }, { status: 404 })
    }

    const nextSettings = { ...(session.settings || {}), lockLanguage: body.lock }

    const { error: updateError } = await supabase
      .from('quiz_sessions')
      .update({ settings: nextSettings, updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (updateError) {
      return NextResponse.json({ error: 'Kunde inte uppdatera språk-lås' }, { status: 500 })
    }

    return NextResponse.json({ success: true, lockLanguage: body.lock })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
