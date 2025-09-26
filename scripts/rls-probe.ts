/*
  Simple RLS probe: attempts to read protected tables with anon key.
  Run with: ts-node scripts/rls-probe.ts
*/
import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY')
    process.exit(1)
  }
  const supabase = createClient(url, anon)

  const tables = ['entitlements', 'quiz_sessions', 'session_answers']
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1)
    if (error) {
      console.log(`[OK] RLS enforced for ${t}:`, error.code || error.message)
    } else {
      console.warn(`[WARN] ${t} returned data for anon:`, data)
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1) })


