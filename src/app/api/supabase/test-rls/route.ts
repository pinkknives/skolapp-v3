import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        enabled: false,
        message: 'Supabase miljövariabler saknas'
      })
    }

    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test RLS by trying to access users table
    const { data: _data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    // If we get an error about RLS, it means RLS is enabled
    if (error && error.message.includes('Row Level Security')) {
      return NextResponse.json({
        enabled: true,
        message: 'RLS är aktiverat på users-tabellen'
      })
    }

    // If we can access data without RLS error, RLS might not be enabled
    if (!error) {
      return NextResponse.json({
        enabled: false,
        message: 'RLS verkar inte vara aktiverat - data är tillgänglig utan autentisering'
      })
    }

    // Other errors
    return NextResponse.json({
      enabled: false,
      message: `Okänt fel vid RLS-test: ${error.message}`
    })

  } catch (error) {
    console.error('RLS test error:', error)
    return NextResponse.json({
      enabled: false,
      message: error instanceof Error ? error.message : 'Okänt fel'
    })
  }
}
