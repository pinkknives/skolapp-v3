import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for admin operations
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'local_service_key'
)

/**
 * POST /api/admin/reset-quotas
 * Reset monthly AI quotas for all users (to be called by cron job)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access with a simple API key
    const authHeader = request.headers.get('authorization')
    const adminApiKey = process.env.ADMIN_API_KEY
    
    if (!adminApiKey || authHeader !== `Bearer ${adminApiKey}`) {
      return NextResponse.json(
        { error: 'Obehörig åtkomst' },
        { status: 403 }
      )
    }

    // Use the database function to reset quotas
    const { error } = await supabaseService.rpc('reset_monthly_ai_usage')

    if (error) {
      console.error('Error resetting quotas:', error)
      return NextResponse.json(
        { error: 'Ett fel uppstod vid återställning av kvoter' },
        { status: 500 }
      )
    }

    console.log('Successfully reset monthly AI quotas')
    
    return NextResponse.json({ 
      success: true,
      message: 'Månadskvoter återställda framgångsrikt'
    })

  } catch (error) {
    console.error('Quota reset error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid återställning av kvoter' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/reset-quotas
 * Get information about quota reset status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization')
    const adminApiKey = process.env.ADMIN_API_KEY
    
    if (!adminApiKey || authHeader !== `Bearer ${adminApiKey}`) {
      return NextResponse.json(
        { error: 'Obehörig åtkomst' },
        { status: 403 }
      )
    }

    // Get quota statistics
    const { data, error } = await supabaseService
      .from('entitlements')
      .select('ai_monthly_used, ai_monthly_quota, ai_unlimited, period_start, period_end')

    if (error) {
      console.error('Error fetching quota stats:', error)
      return NextResponse.json(
        { error: 'Ett fel uppstod vid hämtning av kvotstatistik' },
        { status: 500 }
      )
    }

    const stats = data.reduce((acc, user) => {
      if (user.ai_unlimited) {
        acc.unlimitedUsers++
      } else {
        acc.limitedUsers++
        acc.totalUsage += user.ai_monthly_used
        acc.totalQuota += user.ai_monthly_quota
        if (user.ai_monthly_used >= user.ai_monthly_quota) {
          acc.overQuotaUsers++
        }
      }
      return acc
    }, {
      limitedUsers: 0,
      unlimitedUsers: 0,
      totalUsage: 0,
      totalQuota: 0,
      overQuotaUsers: 0
    })

    return NextResponse.json({
      stats,
      message: 'Kvotstatistik hämtad framgångsrikt'
    })

  } catch (error) {
    console.error('Quota stats error:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av kvotstatistik' },
      { status: 500 }
    )
  }
}