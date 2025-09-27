import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const MAX_CHARS_PER_DAY_DEFAULT = 200_000

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

    const body = await req.json().catch(() => ({})) as { org_id?: string; source_lang?: string; target_lang: string; text?: string; items?: string[]; glossary?: string[]; lock?: boolean }
    const target = body.target_lang
    const source = body.source_lang || 'sv'
    const glossary = Array.isArray(body.glossary) ? body.glossary : []

    const orgId = body.org_id || (await (async () => {
      const { data } = await supabase.from('organisation_members').select('org_id').eq('user_id', user.id).limit(1).maybeSingle()
      return data?.org_id as string | undefined
    })())

    if (!target || !body.text && !body.items) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }

    const texts = body.items || [String(body.text || '')]
    const phraseHashes = texts.map(t => hashPhrase(t, glossary))

    // Enforce daily limit per org
    if (orgId) {
      const today = new Date()
      const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
      const { data: usage } = await supabase.from('translation_usage').select('chars_used').eq('org_id', orgId).eq('day', day.toISOString().slice(0,10)).maybeSingle()
      const used = usage?.chars_used || 0
      const incoming = texts.reduce((acc, t) => acc + t.length, 0)
      const limit = Number(process.env.I18N_DAILY_CHAR_LIMIT || MAX_CHARS_PER_DAY_DEFAULT)
      if (used + incoming > limit) {
        return NextResponse.json({ error: 'TRANSLATION_QUOTA_EXCEEDED' }, { status: 429 })
      }
    }

    // Check translation memory (manual overrides first)
    const overrides: Record<string,string> = {}
    if (orgId) {
      const { data: mem } = await supabase
        .from('translation_memory')
        .select('phrase_hash, translated_text')
        .in('phrase_hash', phraseHashes)
        .eq('target_lang', target)
        .eq('is_override', true)
        .eq('org_id', orgId)
      mem?.forEach(r => { overrides[r.phrase_hash] = r.translated_text })
    }

    // Check cache
    const { data: cache } = await supabase
      .from('translation_cache')
      .select('phrase_hash, translated_text')
      .in('phrase_hash', phraseHashes)
      .eq('target_lang', target)

    const cached: Record<string,string> = {}
    cache?.forEach(r => { cached[r.phrase_hash] = r.translated_text })

    const results: string[] = []
    const toTranslate: Array<{ text: string; hash: string }> = []
    texts.forEach((t, i) => {
      const h = phraseHashes[i]
      if (overrides[h]) { results.push(overrides[h]); return }
      if (cached[h]) { results.push(cached[h]); return }
      toTranslate.push({ text: t, hash: h })
    })

    // Call model only for missing
    if (toTranslate.length > 0) {
      // simple pseudo translation for dev/test
      const useMock = !process.env.OPENAI_API_KEY || process.env.NODE_ENV === 'test'
      let translated: string[] = []
      if (useMock) {
        translated = toTranslate.map(({ text }) => `${text} [${target}]`)
      } else {
        const { openai } = await import('@/lib/ai/openai')
        const prompt = `Du är en översättare. Översätt till ${target}. Använd inte översättning för termerna: ${(glossary||[]).join(', ')}. Returnera JSON-array av strängar.`
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: JSON.stringify(toTranslate.map(t => t.text)) }
          ],
          response_format: { type: 'json_object' }
        })
        const content = resp.choices[0]?.message?.content || '[]'
        const parsed = JSON.parse(content) as { translations?: string[] }
        translated = parsed.translations || []
        if (translated.length !== toTranslate.length) {
          translated = toTranslate.map(({ text }) => `${text} [${target}]`)
        }
      }

      // Upsert cache and memory entries
      for (let i = 0; i < toTranslate.length; i++) {
        const t = toTranslate[i]
        const out = translated[i]
        results[ texts.indexOf(t.text) ] = out
        await supabase
          .from('translation_cache')
          .upsert({ org_id: orgId || null, phrase_hash: t.hash, source_lang: source, target_lang: target, translated_text: out }, { onConflict: 'phrase_hash,target_lang' })
      }

      if (orgId) {
        const today = new Date()
        const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
        const incoming = toTranslate.reduce((acc, x) => acc + x.text.length, 0)
        await supabase
          .from('translation_usage')
          .upsert({ org_id: orgId, day: day.toISOString().slice(0,10), chars_used: incoming }, { onConflict: 'org_id,day', ignoreDuplicates: false })
      }
    }

    const payload = Array.isArray(body.items) ? results : results[0]
    return NextResponse.json({ translated: payload })
  } catch (_e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
