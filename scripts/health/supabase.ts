// scripts/health/supabase.ts
import * as dotenv from 'dotenv'
import { testSupabaseConnection } from '../../src/lib/supabase-test'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function main() {
  // Test basic environment variables first
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY") 
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }

  // Test actual connection
  const results = await testSupabaseConnection()

  // Check if all connections are working
  if (!results.browser.connected) {
    throw new Error(`Browser client failed: ${results.browser.error}`)
  }

  if (!results.server.connected) {
    throw new Error(`Server client failed: ${results.server.error}`)
  }

  if (!results.database.connected) {
    throw new Error(`Database check failed: ${results.database.error}`)
  }

  console.log("SUPABASE_OK")
}

main().catch((e) => {
  console.error("Supabase error:", e?.message || e)
  process.exit(1)
})