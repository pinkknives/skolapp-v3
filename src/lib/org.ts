import { createClient } from '@supabase/supabase-js'

export async function resolveCurrentOrgId(cookieHeader?: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(url, anon, {
    global: { headers: cookieHeader ? { cookie: cookieHeader } : {} },
    auth: { persistSession: false }
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('organisation_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  return data?.org_id ?? null
}


