/*
  Simple RLS probe: attempts to read protected tables with anon key.
  Run with: ts-node scripts/rls-probe.ts
*/
import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) {
    console.error('Missing Supabase env vars')
    process.exit(1)
  }

  const anonClient = createClient(url, anon)
  const serviceClient = createClient(url, service)

  let failures = 0

  // Attempt unauthorized SELECT on ai_training_data (should not see others rows)
  {
    const { data, error } = await anonClient
      .from('ai_training_data')
      .select('id')
      .limit(1)
    if (error) {
      // permission denied is ok
      console.log('[anon] ai_training_data SELECT error (expected):', error.message)
    } else if (data && data.length > 0) {
      console.error('[anon] ai_training_data SELECT returned rows (unexpected)')
      failures++
    } else {
      console.log('[anon] ai_training_data SELECT returned empty (ok)')
    }
  }

  // Attempt unauthorized INSERT on ai_training_data
  {
    const { error } = await anonClient
      .from('ai_training_data')
      .insert({ teacher_id: '00000000-0000-0000-0000-000000000000', quiz_id: '00000000-0000-0000-0000-000000000000', payload: {}, subject: 'x', grade_span: 'x' })
    if (error) {
      console.log('[anon] ai_training_data INSERT error (expected):', error.message)
    } else {
      console.error('[anon] ai_training_data INSERT succeeded (unexpected)')
      failures++
    }
  }

  // Attempt unauthorized SELECT on ai_feedback
  {
    const { data, error } = await anonClient
      .from('ai_feedback')
      .select('id')
      .limit(1)
    if (error) {
      console.log('[anon] ai_feedback SELECT error (expected):', error.message)
    } else if (data && data.length > 0) {
      console.error('[anon] ai_feedback SELECT returned rows (unexpected)')
      failures++
    } else {
      console.log('[anon] ai_feedback SELECT returned empty (ok)')
    }
  }

  // Attempt unauthorized INSERT on ai_feedback
  {
    const { error } = await anonClient
      .from('ai_feedback')
      .insert({ teacher_id: '00000000-0000-0000-0000-000000000000', rating: 1 })
    if (error) {
      console.log('[anon] ai_feedback INSERT error (expected):', error.message)
    } else {
      console.error('[anon] ai_feedback INSERT succeeded (unexpected)')
      failures++
    }
  }

  // Service-role should be able to SELECT from both
  for (const table of ['ai_training_data', 'ai_feedback']) {
    const { error } = await serviceClient.from(table).select('id').limit(1)
    if (error) {
      console.error(`[service] ${table} SELECT failed (unexpected):`, error.message)
      failures++
    } else {
      console.log(`[service] ${table} SELECT ok`)
    }
  }

  if (failures > 0) {
    console.error(`RLS probe failed with ${failures} issue(s)`) 
    process.exit(1)
  }
  console.log('RLS probe passed')
}

main().catch((e) => {
  console.error('RLS probe crashed:', e)
  process.exit(1)
})



