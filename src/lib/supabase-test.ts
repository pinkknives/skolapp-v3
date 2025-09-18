import { supabaseBrowser } from './supabase-browser'
import { supabaseServer } from './supabase-server'

/**
 * Test Supabase connection and configuration
 */
export async function testSupabaseConnection() {
  const results = {
    browser: { connected: false, error: null as string | null },
    server: { connected: false, error: null as string | null },
    database: { connected: false, error: null as string | null }
  }

  // Test browser client
  try {
    const browserClient = supabaseBrowser()
    const { data, error } = await browserClient.from('profiles').select('count').limit(1)
    if (error) throw error
    results.browser.connected = true
  } catch (error) {
    results.browser.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test server client
  try {
    const serverClient = supabaseServer()
    const { data, error } = await serverClient.from('profiles').select('count').limit(1)
    if (error) throw error
    results.server.connected = true
  } catch (error) {
    results.server.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test database schema (profiles table exists)
  try {
    const serverClient = supabaseServer()
    const { data, error } = await serverClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')
      .single()
    
    if (error || !data) {
      throw new Error('Profiles table not found. Please run the migration: supabase/migrations/001_profiles.sql')
    }
    results.database.connected = true
  } catch (error) {
    results.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return results
}

/**
 * Check if Supabase is properly configured for production use
 */
export function validateSupabaseConfig() {
  const issues: string[] = []

  // Check for placeholder values
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || url === 'https://xyzexample.supabase.co') {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is not set or still using example value')
  }

  if (!anonKey || anonKey === '******') {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or still using placeholder value')
  }

  if (!serviceKey || serviceKey === '******') {
    issues.push('SUPABASE_SERVICE_ROLE_KEY is not set or still using placeholder value')
  }

  return {
    isValid: issues.length === 0,
    issues
  }
}