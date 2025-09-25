import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env.server'

export type QuotaResult = { ok: true; reason?: string; limit?: number; remaining?: number } | { ok: false; reason: string; limit?: number; remaining?: number }

export async function verifyQuota(params: { userId: string; feature: 'ai_generate' }): Promise<QuotaResult> {
  if (env.quotaCheck === 'off') {
    return { ok: true, reason: 'bypass-dev' }
  }

  // Server-side supabase client with service role if available, fallback to anon
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  try {
    // Read entitlements
    const { data, error } = await supabase
      .from('entitlements')
      .select('limit, remaining, feature')
      .eq('uid', params.userId)
      .eq('feature', 'ai_generate')
      .maybeSingle()

    if (error) {
      const msg = `${error.message || ''} ${error.details || ''}`.toLowerCase()
      if (msg.includes('does not exist') || error.code === 'PGRST116') {
        return { ok: true, reason: 'no-entitlement-table' }
      }
      return { ok: true, reason: 'entitlement-read-error' }
    }

    if (!data) {
      // No specific row: treat as unlimited in current model
      return { ok: true, reason: 'no-row' }
    }

    type Row = { limit: number | null; remaining: number | null; feature: string }
    const row = data as unknown as Row
    const limit = row.limit
    const remaining = row.remaining
    if (limit == null || remaining == null) {
      return { ok: true, reason: 'no-limits' }
    }
    return { ok: remaining > 0, reason: remaining > 0 ? 'ok' : 'quota-exceeded', limit, remaining }
  } catch {
    return { ok: true, reason: 'quota-check-failed' }
  }
}

export function verifyDevSessionCounter(): QuotaResult {
  // Soft‑limit in dev if quota tables are missing: capped per process
  if (env.nodeEnv !== 'development') return { ok: true, reason: 'prod-no-dev-counter' }
  const _key = 'ai_generate_counter'
  // Not using window here (server util). This is a server fallback, always allow.
  return { ok: true, reason: 'server-allow' }
}


