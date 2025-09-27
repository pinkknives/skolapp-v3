import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, anon, { global: { headers: { Authorization: req.headers.get('authorization') || '' } }, auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  try {
    const supabase = serviceClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase.from('user_settings').select('preferred_language').eq('user_id', user.id).single()
    return NextResponse.json({ preferred_language: data?.preferred_language || 'sv' })
  } catch {
    return NextResponse.json({ preferred_language: 'sv' })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = serviceClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { preferred_language?: string }
    const lang = body.preferred_language
    if (!lang || !['sv','en','ar','uk'].includes(lang)) {
      return NextResponse.json({ error: 'Ogiltigt språk' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, preferred_language: lang }, { onConflict: 'user_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
