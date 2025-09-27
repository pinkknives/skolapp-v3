'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import JSZip from 'jszip'

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

  // Collect datasets with RLS enforcing scope
  const [settings, sessions, answers] = await Promise.all([
    supabase.from('user_settings').select('*').eq('user_id', user.id),
    supabase.from('sessions').select('id, code, status, mode, created_at').eq('teacher_id', user.id),
    supabase.from('session_answers').select('session_id, question_id, is_correct, submitted_at').eq('student_profile_id', user.id),
  ])

  const zip = new JSZip()
  zip.file('user_settings.json', JSON.stringify(settings.data ?? [], null, 2))
  zip.file('sessions_owned.json', JSON.stringify(sessions.data ?? [], null, 2))
  zip.file('answers.json', JSON.stringify(answers.data ?? [], null, 2))

  const ack = `srr_export_${user.id}_${Date.now()}`
  try {
    await supabase.from('srr_requests').insert({
      user_id: user.id,
      type: 'export',
      payload: { parts: ['user_settings','sessions_owned','answers'] },
      status: 'completed',
      ack_id: ack,
    })
  } catch {}

  const now = new Date().toISOString()
  const ab = await zip.generateAsync({ type: 'arraybuffer' })
  return new NextResponse(ab, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="export-${now.split('T')[0]}.zip"`,
      'x-srr-ack': ack,
      'x-srr-at': now,
    }
  })
}
