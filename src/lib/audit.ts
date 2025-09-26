import { createClient } from '@supabase/supabase-js'

export async function logAuditEvent(params: {
  orgId: string
  actorId: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(url, key, { auth: { persistSession: false } })
  await supabase.from('audit_logs').insert({
    org_id: params.orgId,
    actor_id: params.actorId,
    action: params.action,
    resource_type: params.resourceType || null,
    resource_id: params.resourceId || null,
    metadata: params.metadata || null
  })
}


