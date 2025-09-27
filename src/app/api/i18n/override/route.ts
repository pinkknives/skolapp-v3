import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function serviceClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, anon, { global: { headers: { Authorization: req.headers.get('authorization') || '' } }, auth: { persistSession: false } })
}

function hashPhrase(text: string, glossary?: string[]): string {
  const h = crypto.createHash('sha256')
  h.update(text)
  if (glossary && glossary.length) h.update(glossary.join('|'))
  return h.digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = serviceClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { org_id?: string; source_text: string; source_lang?: string; target_lang: string; translated_text: string }
    const sourceText = (body.source_text || '').trim()
    const targetLang = (body.target_lang || '').trim()
    if (!sourceText || !targetLang || !body.translated_text) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }

    const orgId = body.org_id || (await (async () => {
      const { data } = await supabase.from('organisation_members').select('org_id').eq('user_id', user.id).limit(1).maybeSingle()
      return data?.org_id as string | undefined
    })())
    if (!orgId) return NextResponse.json({ error: 'Org saknas' }, { status: 400 })

    const hash = hashPhrase(sourceText)
    const { error } = await supabase
      .from('translation_memory')
      .upsert({
        org_id: orgId,
        phrase_hash: hash,
        source_text: sourceText,
        source_lang: body.source_lang || 'sv',
        target_lang: targetLang,
        translated_text: body.translated_text,
        is_override: true,
        created_by: user.id
      }, { onConflict: 'org_id,phrase_hash,target_lang' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
