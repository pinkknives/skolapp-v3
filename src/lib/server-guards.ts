import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// Use service role for server-side operations
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Server-side guard to check if user can use AI features
 * Returns user object if authorized, null if not
 */
export async function checkAIAccess(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return null
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseService.auth.getUser(token)
    if (error || !user) {
      return null
    }

    // Check if user can use AI (either unlimited or has quota remaining)
    const { data: usage, error: usageError } = await supabaseService.rpc('increment_ai_usage', {
      user_id: user.id
    })

    if (usageError || !usage) {
      // Cannot use AI (over quota or error)
      return null
    }

    return user
  } catch {
    return null
  }
}

/**
 * Check if user has specific entitlement (server-side)
 */
export async function checkEntitlement(userId: string, entitlement: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseService.rpc('has_user_entitlement', {
      user_id: userId,
      entitlement_key: entitlement
    })

    if (error) {
      return false
    }

    return Boolean(data)
  } catch {
    return false
  }
}

/**
 * Guard for CSV export functionality
 */
export async function checkCSVExportAccess(userId: string): Promise<boolean> {
  return checkEntitlement(userId, 'export_csv')
}

/**
 * Guard for advanced analytics functionality
 */
export async function checkAdvancedAnalyticsAccess(userId: string): Promise<boolean> {
  return checkEntitlement(userId, 'advanced_analytics')
}