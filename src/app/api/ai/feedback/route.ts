import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServerSupabase(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get('authorization') || '' } },
    auth: { persistSession: false }
  })
}

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({})) as {
    rating?: -1 | 1
    comment?: string
    question_title?: string
    subject?: string
    grade?: string
    provider?: string
  }
  if (body.rating !== -1 && body.rating !== 1) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }
  const { error: insertErr } = await supabase
    .from('ai_feedback')
    .insert({
      teacher_id: user.id,
      rating: body.rating,
      comment: body.comment || null,
      question_title: body.question_title || null,
      subject: body.subject || null,
      grade: body.grade || null,
      provider: body.provider || 'ai'
    })
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
  return NextResponse.json({ success: true })
}


