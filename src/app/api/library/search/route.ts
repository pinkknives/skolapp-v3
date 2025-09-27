import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = supabaseServer()
    const url = new URL(req.url)
    const q = (url.searchParams.get('q') || '').trim()
    const tag = (url.searchParams.get('tag') || '').trim()
    const scope = url.searchParams.get('scope') || 'public'

    let query = supabase
      .from('library_items')
      .select('id, title, item_type, subject, grade, created_at')
      .order('created_at', { ascending: false })

    if (scope === 'public') {
      query = query.eq('published', true)
    }

    if (q) {
      query = query.filter('search_tsv', 'fts', q)
    }
    if (tag) {
      // join via item_tags if available; fallback to LIKE in title
      query = query.ilike('title', `%${tag}%`)
    }

    const { data, error } = await query.limit(50)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data })
  } catch {
    return NextResponse.json({ items: [] })
  }
}


