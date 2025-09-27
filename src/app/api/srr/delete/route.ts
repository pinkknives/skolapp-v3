'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabaseFromAuth(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get('authorization') || '' } },
    auth: { persistSession: false },
  })
}

export async function POST(req: NextRequest) {
  const supabase = supabaseFromAuth(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ack = `srr_delete_${user.id}_${Date.now()}`
  // Minimal anonymization for student answers; do not delete teacher-owned content automatically
  try {
    await supabase
      .from('session_answers')
      .update({ student_profile_id: null })
      .eq('student_profile_id', user.id)
  } catch {}

  try {
    await supabase.from('srr_requests').insert({
      user_id: user.id,
      type: 'delete',
      payload: { tables: ['session_answers'] },
      status: 'completed',
      ack_id: ack,
    })
  } catch {}

  return NextResponse.json({ success: true, ack })
}
