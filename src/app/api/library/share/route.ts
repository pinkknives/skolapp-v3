import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function serverClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, { global: { headers: { Authorization: req.headers.get('authorization') || '' } }, auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  const supabase = serverClient(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({})) as { item_id?: string; expires_in_hours?: number; can_copy?: boolean }
  if (!body.item_id) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  const token = crypto.randomBytes(24).toString('hex')
  const expires = body.expires_in_hours ? new Date(Date.now() + body.expires_in_hours * 3600 * 1000).toISOString() : null
  const { error } = await supabase.from('library_shares').insert({ item_id: body.item_id, token, can_copy: body.can_copy ?? true, expires_at: expires, created_by: user.id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, token })
}


