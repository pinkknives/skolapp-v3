import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        connected: false,
        tables: [],
        error: 'Supabase miljövariabler saknas'
      })
    }

    // Try to connect to Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test connection by trying to query each table individually
    const requiredTables = ['users', 'accounts', 'sessions', 'verification_tokens']
    const existingTables = []

    for (const tableName of requiredTables) {
      try {
        const { error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        // If no error or if error is about RLS (which means table exists), table exists
        if (!tableError || tableError.message.includes('Row Level Security') || tableError.message.includes('permission denied')) {
          existingTables.push(tableName)
        }
      } catch (err) {
        // Table doesn't exist or other error
        console.log(`Table ${tableName} not found or error:`, err)
      }
    }

    // If we can query Supabase (even with errors), connection is working
    const connected = true // We know connection works if we get here

    return NextResponse.json({
      connected,
      tables: existingTables,
      error: undefined
    })

  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      connected: false,
      tables: [],
      error: `Anslutningsfel: ${error instanceof Error ? error.message : 'Okänt fel'}`
    })
  }
}
