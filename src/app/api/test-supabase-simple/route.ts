import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Key (first 20 chars):', supabaseAnonKey?.substring(0, 20))

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: 'Miljövariabler saknas',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey
        }
      })
    }

    // Try to create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    console.log('Query result:', { data, error })

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Supabase query failed',
        details: {
          error: error.message,
          code: error.code,
          hint: error.hint
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      details: {
        data: data,
        tableExists: true
      }
    })

  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Connection failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    })
  }
}
