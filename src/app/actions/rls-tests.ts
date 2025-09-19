/**
 * Server Action for RLS Verification
 * Runs RLS tests and returns results for PR comments
 */

'use server'

import { runRLSVerification } from '../../../test/helpers/rls-verification'

/**
 * Run RLS verification tests and return formatted results
 */
export async function runRLSTests(): Promise<{ 
  success: boolean
  report: string
  summary: string
}> {
  try {
    console.log('🔒 Starting RLS verification from server action...')
    
    const report = await runRLSVerification()
    
    // Extract summary info
    const lines = report.split('\n')
    const totalLine = lines.find((l: string) => l.includes('Total Tests:'))
    const passedLine = lines.find((l: string) => l.includes('Passed:'))
    const successLine = lines.find((l: string) => l.includes('Success Rate:'))
    
    const summary = [totalLine, passedLine, successLine]
      .filter(Boolean)
      .join('\n')

    return {
      success: true,
      report,
      summary
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ RLS verification failed:', errorMessage)
    
    return {
      success: false,
      report: `❌ RLS Verification Failed\n\nError: ${errorMessage}`,
      summary: 'RLS verification could not complete due to an error.'
    }
  }
}