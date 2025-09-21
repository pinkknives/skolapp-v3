import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase-browser'

/**
 * Health Check Endpoint
 * 
 * Provides basic health status of the application and its dependencies.
 * Used for uptime monitoring and automated health checks.
 */

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  services: {
    database: ServiceHealth
    ai?: ServiceHealth
    realtime?: ServiceHealth
    storage?: ServiceHealth
  }
  metadata: {
    uptime: number
    region: string
    commit?: string
  }
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded'
  responseTime?: number
  lastChecked: string
  error?: string
}

const startTime = Date.now()

export async function GET(_request: NextRequest) {
  const checkStart = Date.now()
  
  try {
    // Basic system info
    const timestamp = new Date().toISOString()
    const uptime = Date.now() - startTime
    
    // Initialize health status
    const health: HealthStatus = {
      status: 'healthy',
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: { status: 'down', lastChecked: timestamp }
      },
      metadata: {
        uptime,
        region: process.env.VERCEL_REGION || 'local',
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7)
      }
    }
    
    // Check database connectivity
    const dbStart = Date.now()
    try {
      const supabase = supabaseBrowser()
      
      // Simple query to test connectivity
      const { error: dbError } = await supabase
        .from('quizzes')
        .select('count')
        .limit(1)
        .single()
      
      const dbResponseTime = Date.now() - dbStart
      
      if (dbError && dbError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine for health check
        throw dbError
      }
      
      health.services.database = {
        status: 'up',
        responseTime: dbResponseTime,
        lastChecked: timestamp
      }
    } catch (error) {
      health.services.database = {
        status: 'down',
        lastChecked: timestamp,
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
      health.status = 'degraded'
    }
    
    // Check AI service availability (optional)
    if (process.env.OPENAI_API_KEY) {
      const aiStart = Date.now()
      try {
        // Simple check - just verify the key format
        const keyFormat = process.env.OPENAI_API_KEY.startsWith('sk-')
        const aiResponseTime = Date.now() - aiStart
        
        health.services.ai = {
          status: keyFormat ? 'up' : 'degraded',
          responseTime: aiResponseTime,
          lastChecked: timestamp,
          error: keyFormat ? undefined : 'Invalid API key format'
        }
        
        if (!keyFormat) {
          health.status = 'degraded'
        }
      } catch (error) {
        health.services.ai = {
          status: 'down',
          lastChecked: timestamp,
          error: error instanceof Error ? error.message : 'AI service check failed'
        }
        health.status = 'degraded'
      }
    }
    
    // Check Ably realtime service (optional)
    if (process.env.ABLY_API_KEY) {
      const realtimeStart = Date.now()
      try {
        // Basic format check for Ably key
        const keyFormat = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+:[a-zA-Z0-9_-]+$/.test(process.env.ABLY_API_KEY)
        const realtimeResponseTime = Date.now() - realtimeStart
        
        health.services.realtime = {
          status: keyFormat ? 'up' : 'degraded',
          responseTime: realtimeResponseTime,
          lastChecked: timestamp,
          error: keyFormat ? undefined : 'Invalid Ably key format'
        }
        
        if (!keyFormat) {
          health.status = 'degraded'
        }
      } catch (error) {
        health.services.realtime = {
          status: 'down',
          lastChecked: timestamp,
          error: error instanceof Error ? error.message : 'Realtime service check failed'
        }
        health.status = 'degraded'
      }
    }
    
    // Determine overall status
    const serviceStatuses = Object.values(health.services).map(service => service.status)
    const hasDown = serviceStatuses.includes('down')
    const hasDegraded = serviceStatuses.includes('degraded')
    
    if (hasDown) {
      health.status = 'unhealthy'
    } else if (hasDegraded) {
      health.status = 'degraded'
    }
    
    // Set appropriate HTTP status code
    const httpStatus = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503
    
    // Add cache headers for monitoring tools
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': health.status,
      'X-Response-Time': `${Date.now() - checkStart}ms`
    }
    
    return NextResponse.json(health, { 
      status: httpStatus,
      headers 
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorResponse: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: { 
          status: 'down', 
          lastChecked: new Date().toISOString(),
          error: 'Health check system failure'
        }
      },
      metadata: {
        uptime: Date.now() - startTime,
        region: process.env.VERCEL_REGION || 'local',
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7)
      }
    }
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'unhealthy'
      }
    })
  }
}

/**
 * Simple text-based health check for load balancers
 */
export async function HEAD(_request: NextRequest) {
  try {
    const supabase = supabaseBrowser()
    await supabase.from('quizzes').select('count').limit(1).single()
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Health-Status': 'healthy'
      }
    })
  } catch {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy'
      }
    })
  }
}