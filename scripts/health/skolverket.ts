// scripts/health/skolverket.ts
import * as dotenv from 'dotenv'
import { skolverketApi } from '../../src/lib/api/skolverket-client'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function main() {
  // Skolverket API doesn't require authentication, but we should verify it's accessible
  try {
    // First try the health check endpoint
    const isHealthy = await skolverketApi.healthCheck()
    
    if (!isHealthy) {
      throw new Error("Skolverket health check endpoint failed")
    }

    // Try to fetch a simple subjects list to verify functionality
    const subjects = await skolverketApi.getSubjects()
    
    if (!Array.isArray(subjects) || subjects.length === 0) {
      throw new Error("Skolverket subjects API returned no data")
    }

    // Verify we got reasonable subject data
    const hasExpectedSubjects = subjects.some(subject => 
      subject.code && typeof subject.code === 'string'
    )

    if (!hasExpectedSubjects) {
      throw new Error("Skolverket subjects data format is unexpected")
    }

    console.log("SKOLVERKET_OK")
  } catch (error) {
    // Check if it's a network/API issue vs configuration issue
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error(`Skolverket API network error: ${error.message}`)
      }
      throw new Error(`Skolverket API error: ${error.message}`)
    }
    throw error
  }
}

main().catch((e) => {
  console.error("Skolverket error:", e?.message || e)
  process.exit(1)
})