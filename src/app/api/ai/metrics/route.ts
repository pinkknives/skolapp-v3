import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServerSupabase(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { headers: { Authorization: req.headers.get('authorization') || '' } },
    auth: { persistSession: false }
  })
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getServerSupabase(req)

    const since = new Date()
    since.setDate(since.getDate() - 30)
    const sinceISO = since.toISOString()

    // consent-rate
    const { data: totalUsers } = await supabase.from('users').select('id', { count: 'exact', head: true })
    const { data: consentUsers } = await supabase
      .from('user_settings')
      .select('user_id', { count: 'exact', head: true })
      .eq('consent_to_ai_training', true)

    const consentRate = (consentUsers?.length ?? 0) / Math.max(1, (totalUsers?.length ?? 0))

    // training rows per day (last 30 days)
    const { data: trainRows } = await supabase
      .from('ai_training_data')
      .select('created_at')
      .gte('created_at', sinceISO)

    const perDay: Record<string, number> = {}
    for (const r of trainRows || []) {
      const d = new Date(r.created_at as string).toISOString().slice(0, 10)
      perDay[d] = (perDay[d] || 0) + 1
    }

    // feedback ratio (helpful / total)
    const { data: fb } = await supabase
      .from('ai_feedback')
      .select('is_helpful')
      .gte('created_at', sinceISO)

    const totalFb = (fb || []).length
    const helpful = (fb || []).filter(x => (x as { is_helpful?: boolean }).is_helpful === true).length
    const feedbackRatio = totalFb > 0 ? helpful / totalFb : 0

    return NextResponse.json({ consentRate, rowsPerDay: perDay, feedbackRatio })
  } catch (_e) {
    return NextResponse.json({ error: 'metrics_error' }, { status: 500 })
  }
}
