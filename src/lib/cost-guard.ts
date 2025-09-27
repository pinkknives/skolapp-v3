import { createClient } from '@supabase/supabase-js'

export type CostGuardResult = { allowed: true; softWarn?: boolean } | { allowed: false; reason: 'budget-exceeded' }

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function checkOrgBudget(orgId: string, feature: 'ai_generate' | 'realtime'): Promise<CostGuardResult> {
  try {
    const supabase = getClient()
    const today = new Date().toISOString().slice(0, 10)
    const [{ data: budget }, { data: usage }] = await Promise.all([
      supabase.from('org_budgets').select('daily_limit, soft_percent').eq('org_id', orgId).eq('feature', feature).maybeSingle(),
      supabase.from('org_usage').select('used').eq('org_id', orgId).eq('feature', feature).eq('window_date', today).maybeSingle(),
    ])

    if (!budget || typeof budget.daily_limit !== 'number') return { allowed: true }
    const used = (usage?.used as number) || 0
    const limit = budget.daily_limit as number
    const soft = Math.max(1, Math.min(100, (budget.soft_percent as number) || 80))
    if (used >= limit) return { allowed: false, reason: 'budget-exceeded' }
    if (used >= Math.floor((soft / 100) * limit)) return { allowed: true, softWarn: true }
    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}

export async function incrementOrgUsage(orgId: string, feature: 'ai_generate' | 'realtime', amount = 1): Promise<void> {
  try {
    const supabase = getClient()
    const today = new Date().toISOString().slice(0, 10)
    // Upsert row and increment
    const { data: row } = await supabase.from('org_usage').select('used').eq('org_id', orgId).eq('feature', feature).eq('window_date', today).maybeSingle()
    const used = (row?.used as number) || 0
    const next = used + amount
    await supabase.from('org_usage').upsert({ org_id: orgId, feature, window_date: today, used: next })
  } catch {
    // ignore
  }
}
