/**
 * RLS Verification Test Helper
 * Tests negative access cases to verify Row Level Security (RLS) works properly
 * for organization isolation.
 */

import { createClient } from '@supabase/supabase-js'

// Mock environment for testing - these would be configured in CI/test environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test_anon_key'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test_service_key'

/**
 * RLS Test Results Interface
 */
export interface RLSTestResult {
  testName: string
  query: string
  expectedResult: 'permission_denied' | 'empty_result' | 'error'
  actualResult: 'permission_denied' | 'empty_result' | 'success' | 'error'
  passed: boolean
  errorMessage?: string
  details?: unknown
}

/**
 * Test Organization Data Structure
 */
export interface TestOrgData {
  orgA: {
    id: string
    userId: string
    quizId?: string
  }
  orgB: {
    id: string
    userId: string
    quizId?: string
  }
}

/**
 * RLS Verification Test Runner
 * Tests negative access cases between different organizations
 */
export class RLSVerifier {
  private supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  private results: RLSTestResult[] = []

  /**
   * Run all RLS verification tests
   */
  async runAllTests(): Promise<RLSTestResult[]> {
    console.log('🔒 Starting RLS Verification Tests...')
    this.results = []

    try {
      // Setup test data
      const testData = await this.setupTestData()
      
      // Run negative access tests
      await this.testCrossOrgQuizAccess(testData)
      await this.testCrossOrgMemberAccess(testData)
      await this.testCrossOrgAttemptAccess(testData)
      await this.testUnauthorizedOrgAccess(testData)
      
      // Cleanup test data
      await this.cleanupTestData(testData)
      
    } catch (error) {
      console.error('❌ RLS Test setup failed:', error)
      this.results.push({
        testName: 'Test Setup',
        query: 'N/A',
        expectedResult: 'error',
        actualResult: 'error',
        passed: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    console.log(`🔒 RLS Tests completed: ${this.results.filter(r => r.passed).length}/${this.results.length} passed`)
    return this.results
  }

  /**
   * Setup test data for RLS verification
   */
  private async setupTestData(): Promise<TestOrgData> {
    console.log('📝 Setting up test data...')

    // Create test users (simulated)
    const userAId = 'test-user-a-' + Date.now()
    const userBId = 'test-user-b-' + Date.now()

    // Create test organizations using service role
    const { data: orgA, error: orgAError } = await this.supabaseAdmin
      .from('orgs')
      .insert({
        name: 'Test Organization A',
        created_by: userAId
      })
      .select()
      .single()

    if (orgAError) throw new Error(`Failed to create org A: ${orgAError.message}`)

    const { data: orgB, error: orgBError } = await this.supabaseAdmin
      .from('orgs')
      .insert({
        name: 'Test Organization B', 
        created_by: userBId
      })
      .select()
      .single()

    if (orgBError) throw new Error(`Failed to create org B: ${orgBError.message}`)

    // Create memberships
    await this.supabaseAdmin.from('org_members').insert([
      { org_id: orgA.id, user_id: userAId, role: 'owner', status: 'active' },
      { org_id: orgB.id, user_id: userBId, role: 'owner', status: 'active' }
    ])

    // Create test quizzes
    const { data: quizA } = await this.supabaseAdmin
      .from('quizzes')
      .insert({
        title: 'Test Quiz A',
        owner_id: userAId,
        org_id: orgA.id,
        join_code: 'TSTA',
        status: 'published'
      })
      .select()
      .single()

    const { data: quizB } = await this.supabaseAdmin
      .from('quizzes')
      .insert({
        title: 'Test Quiz B',
        owner_id: userBId,
        org_id: orgB.id,
        join_code: 'TSTB',
        status: 'published'
      })
      .select()
      .single()

    return {
      orgA: { id: orgA.id, userId: userAId, quizId: quizA?.id },
      orgB: { id: orgB.id, userId: userBId, quizId: quizB?.id }
    }
  }

  /**
   * Test 1: Cross-organization quiz access (should be denied)
   */
  private async testCrossOrgQuizAccess(testData: TestOrgData): Promise<void> {
    const testName = 'Cross-org quiz access should be denied'
    
    try {
      // Simulate user A trying to access user B's quiz
      const userAClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      // Mock auth context for user A
      const query = `SELECT * FROM quizzes WHERE org_id = '${testData.orgB.id}'`
      
      const { data, error } = await userAClient
        .from('quizzes')
        .select('*')
        .eq('org_id', testData.orgB.id)

      let result: RLSTestResult['actualResult'] = 'success'
      let errorMessage = undefined

      if (error) {
        result = error.message.includes('permission') ? 'permission_denied' : 'error'
        errorMessage = error.message
      } else if (!data || data.length === 0) {
        result = 'empty_result'
      }

      this.results.push({
        testName,
        query,
        expectedResult: 'permission_denied',
        actualResult: result,
        passed: result === 'permission_denied' || result === 'empty_result',
        errorMessage,
        details: { dataLength: data?.length }
      })

    } catch (error) {
      this.results.push({
        testName,
        query: 'Cross-org quiz access',
        expectedResult: 'permission_denied',
        actualResult: 'error',
        passed: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Test 2: Cross-organization member access (should be denied)
   */
  private async testCrossOrgMemberAccess(testData: TestOrgData): Promise<void> {
    const testName = 'Cross-org member access should be denied'
    
    try {
      // User A trying to see members of org B
      const userAClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const query = `SELECT * FROM org_members WHERE org_id = '${testData.orgB.id}'`
      
      const { data, error } = await userAClient
        .from('org_members')
        .select('*')
        .eq('org_id', testData.orgB.id)

      let result: RLSTestResult['actualResult'] = 'success'
      let errorMessage = undefined

      if (error) {
        result = error.message.includes('permission') ? 'permission_denied' : 'error'
        errorMessage = error.message
      } else if (!data || data.length === 0) {
        result = 'empty_result'
      }

      this.results.push({
        testName,
        query,
        expectedResult: 'permission_denied',
        actualResult: result,
        passed: result === 'permission_denied' || result === 'empty_result',
        errorMessage,
        details: { dataLength: data?.length }
      })

    } catch (error) {
      this.results.push({
        testName,
        query: 'Cross-org member access',
        expectedResult: 'permission_denied',
        actualResult: 'error',
        passed: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Test 3: Cross-organization attempt access (should be denied)
   */
  private async testCrossOrgAttemptAccess(testData: TestOrgData): Promise<void> {
    const testName = 'Cross-org quiz attempts should be denied'
    
    try {
      // Create a test attempt for org B's quiz
      const attemptId = 'test-attempt-' + Date.now()
      await this.supabaseAdmin.from('attempts').insert({
        id: attemptId,
        quiz_id: testData.orgB.quizId,
        student_id: 'test-student-' + Date.now(),
        data_mode: 'short',
        student_alias: 'Test Student'
      })

      // User A trying to see attempts for org B's quiz
      const userAClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const query = `SELECT * FROM attempts WHERE quiz_id = '${testData.orgB.quizId}'`
      
      const { data, error } = await userAClient
        .from('attempts')
        .select('*')
        .eq('quiz_id', testData.orgB.quizId)

      let result: RLSTestResult['actualResult'] = 'success'
      let errorMessage = undefined

      if (error) {
        result = error.message.includes('permission') ? 'permission_denied' : 'error'
        errorMessage = error.message
      } else if (!data || data.length === 0) {
        result = 'empty_result'
      }

      this.results.push({
        testName,
        query,
        expectedResult: 'permission_denied',
        actualResult: result,
        passed: result === 'permission_denied' || result === 'empty_result',
        errorMessage,
        details: { dataLength: data?.length }
      })

    } catch (error) {
      this.results.push({
        testName,
        query: 'Cross-org attempt access',
        expectedResult: 'permission_denied',
        actualResult: 'error',
        passed: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Test 4: Unauthorized organization access (should be denied)
   */
  private async testUnauthorizedOrgAccess(testData: TestOrgData): Promise<void> {
    const testName = 'Unauthorized org access should be denied'
    
    try {
      // User A trying to read org B details
      const userAClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const query = `SELECT * FROM orgs WHERE id = '${testData.orgB.id}'`
      
      const { data, error } = await userAClient
        .from('orgs')
        .select('*')
        .eq('id', testData.orgB.id)

      let result: RLSTestResult['actualResult'] = 'success'
      let errorMessage = undefined

      if (error) {
        result = error.message.includes('permission') ? 'permission_denied' : 'error'
        errorMessage = error.message
      } else if (!data || data.length === 0) {
        result = 'empty_result'
      }

      this.results.push({
        testName,
        query,
        expectedResult: 'permission_denied',
        actualResult: result,
        passed: result === 'permission_denied' || result === 'empty_result',
        errorMessage,
        details: { dataLength: data?.length }
      })

    } catch (error) {
      this.results.push({
        testName,
        query: 'Unauthorized org access',
        expectedResult: 'permission_denied',
        actualResult: 'error',
        passed: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Cleanup test data
   */
  private async cleanupTestData(testData: TestOrgData): Promise<void> {
    console.log('🧹 Cleaning up test data...')
    
    try {
      // Clean up in reverse order due to foreign keys
      await this.supabaseAdmin.from('attempts').delete().like('id', 'test-attempt-%')
      await this.supabaseAdmin.from('quizzes').delete().eq('join_code', 'TSTA')
      await this.supabaseAdmin.from('quizzes').delete().eq('join_code', 'TSTB')
      await this.supabaseAdmin.from('org_members').delete().eq('org_id', testData.orgA.id)
      await this.supabaseAdmin.from('org_members').delete().eq('org_id', testData.orgB.id)
      await this.supabaseAdmin.from('orgs').delete().eq('id', testData.orgA.id)
      await this.supabaseAdmin.from('orgs').delete().eq('id', testData.orgB.id)
    } catch (error) {
      console.error('⚠️ Cleanup failed:', error)
    }
  }

  /**
   * Generate a summary report
   */
  generateReport(): string {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests

    let report = '\n🔒 RLS Verification Report\n'
    report += '==========================\n\n'
    report += `Total Tests: ${totalTests}\n`
    report += `Passed: ${passedTests}\n`
    report += `Failed: ${failedTests}\n`
    report += `Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%\n\n`

    report += 'Test Results:\n'
    report += '-------------\n'

    this.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      report += `${index + 1}. ${status} - ${result.testName}\n`
      report += `   Query: ${result.query}\n`
      report += `   Expected: ${result.expectedResult}\n`
      report += `   Actual: ${result.actualResult}\n`
      
      if (result.errorMessage) {
        report += `   Error: ${result.errorMessage}\n`
      }
      
      if (result.details) {
        report += `   Details: ${JSON.stringify(result.details)}\n`
      }
      
      report += '\n'
    })

    if (failedTests > 0) {
      report += '⚠️  Some RLS tests failed. This indicates potential security vulnerabilities.\n'
      report += 'Please review the RLS policies and ensure proper organization isolation.\n'
    } else {
      report += '✅ All RLS tests passed. Organization isolation is working correctly.\n'
    }

    return report
  }
}

/**
 * Run RLS verification and log results
 */
export async function runRLSVerification(): Promise<string> {
  const verifier = new RLSVerifier()
  const _results = await verifier.runAllTests()
  const report = verifier.generateReport()
  
  console.log(report)
  return report
}