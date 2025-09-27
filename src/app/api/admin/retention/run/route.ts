'use server'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(_req: NextRequest) {
  try {
    // In a real app, check admin auth here
    const client = supabaseServer()

    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { error: delErr } = await client
      .from('api_metrics')
      .delete()
      .lt('created_at', cutoff)

    if (delErr) throw delErr

    await client.from('retention_reports').insert({
      scope: 'api_metrics',
      details: { cutoff }
    })

    return NextResponse.json({ success: true, cutoff })
  } catch (_error) {
    return NextResponse.json({ error: 'Retention körning misslyckades' }, { status: 500 })
  }
}
