import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase-browser'

// Use service role for usage tracking operations
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/ai/usage
 * Increment AI usage for the current user
 */
export async function POST(_request: NextRequest) {
  try {
    // Get current user
    const supabase = supabaseBrowser()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad' },
        { status: 401 }
      )
    }

    // Use the database function to increment usage and check quota
    const { data, error } = await supabaseService.rpc('increment_ai_usage', {
      user_id: user.id
    })

    if (error) {
      console.error('Error incrementing AI usage:', error)
      return NextResponse.json(
        { error: 'Ett fel uppstod vid uppdatering av AI-användning' },
        { status: 500 }
      )
    }

    // data returns boolean: true if increment was successful, false if over quota
    if (!data) {
      return NextResponse.json(
        { 
          error: 'Du har nått din månadsgräns för AI-frågor',
          code: 'QUOTA_EXCEEDED' 
        },
        { status: 429 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('AI usage tracking error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid spårning av AI-användning' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/usage
 * Get current user's AI usage information
 */
export async function GET() {
  try {
    // Get current user
    const supabase = supabaseBrowser()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad' },
        { status: 401 }
      )
    }

    // Get current usage information
    const { data, error } = await supabase
      .from('entitlements')
      .select('ai_monthly_used, ai_monthly_quota, ai_unlimited, period_start, period_end')
      .eq('uid', user.id)
      .single()

    if (error) {
      console.error('Error fetching AI usage:', error)
      return NextResponse.json(
        { error: 'Ett fel uppstod vid hämtning av AI-användning' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      used: data.ai_monthly_used,
      quota: data.ai_monthly_quota,
      unlimited: data.ai_unlimited,
      periodStart: data.period_start,
      periodEnd: data.period_end,
      remaining: data.ai_unlimited ? -1 : Math.max(0, data.ai_monthly_quota - data.ai_monthly_used)
    })

  } catch (error) {
    console.error('AI usage fetch error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av AI-användning' },
      { status: 500 }
    )
  }
}