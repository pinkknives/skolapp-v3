import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for usage tracking operations
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'local_service_key'
)

/**
 * POST /api/ai/usage
 * Increment AI usage for the current user
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from Authorization header (Supabase JWT)
    const authHeader = request.headers.get('authorization') || ''
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-placeholder',
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
    )
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad' },
        { status: 401 }
      )
    }

    // Use the database function to increment usage and check quota
    const { data, error } = await supabaseService.rpc('increment_ai_usage', { user_id: user.id })

    if (error) {
      // Graceful fallback when quota schema/RPC is not present in local/dev
      const msg = `${error.message || ''} ${error.details || ''}`.toLowerCase()
      const isMissing =
        error.code === 'PGRST116' || // resource not found
        msg.includes('does not exist') ||
        msg.includes('not exist') ||
        msg.includes('increment_ai_usage')

      if (isMissing) {
        console.warn('[ai/usage] Quota RPC missing – allowing request (dev fallback)')
        return NextResponse.json({ success: true })
      }

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
export async function GET(request: NextRequest) {
  try {
    // Get current user from Authorization header (Supabase JWT)
    const authHeader = request.headers.get('authorization') || ''
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-placeholder',
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
    )
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
      // Graceful fallback if entitlements table is not available in local/dev
      const msg = `${error.message || ''} ${error.details || ''}`.toLowerCase()
      const isMissing = msg.includes('does not exist') || msg.includes('not exist') || error.code === 'PGRST116'
      if (isMissing) {
        console.warn('[ai/usage] Entitlements table missing – returning unlimited usage (dev fallback)')
        return NextResponse.json({
          used: 0,
          quota: 0,
          unlimited: true,
          periodStart: null,
          periodEnd: null,
          remaining: -1,
        })
      }

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