import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export const supabaseBrowser = (): SupabaseClient => {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fallback to non-throwing client to avoid runtime crashes in non-configured environments
  // Note: Requests will fail against placeholder values, but the UI can still render gracefully.
  const safeUrl = url || 'http://localhost'
  const safeAnonKey = anonKey || 'public-anon-key-placeholder'
  if (!url || !anonKey) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn('Supabase env vars missing; using placeholder client (non-fatal).')
    }
  }

  _client = createClient(safeUrl, safeAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return _client
}