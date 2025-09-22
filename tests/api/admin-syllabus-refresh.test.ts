import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/admin/syllabus/refresh/route'

// Mock child_process without capturing external variables to avoid hoisting issues
vi.mock('child_process', () => {
  const fn = vi.fn()
  return {
    execSync: fn,
    default: { execSync: fn }
  }
})

// Obtain the mocked function reference after mocking
const mockExecSync = vi.mocked(await import('child_process')).execSync

describe('/api/admin/syllabus/refresh', () => {
  beforeEach(() => {
    // Set test environment variables
    process.env.ADMIN_API_KEY = 'test-admin-key'
    mockExecSync.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    delete process.env.ADMIN_API_KEY
  })

  it('should reject requests without authorization', async () => {
    const request = new NextRequest('http://localhost/api/admin/syllabus/refresh', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Otillräcklig behörighet')
  })

  it('should reject requests with invalid API key', async () => {
    const request = new NextRequest('http://localhost/api/admin/syllabus/refresh', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer wrong-key'
      },
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('should execute ETL script successfully with valid authorization', async () => {
    const mockOutput = `
📚 Processing subject: Matematik
✅ Completed processing Matematik
🎉 ETL process completed successfully!
📊 Processed 1 subjects using mock_data
    `

  mockExecSync.mockReturnValueOnce(mockOutput)

    const request = new NextRequest('http://localhost/api/admin/syllabus/refresh', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-admin-key'
      },
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Syllabusdata uppdaterad framgångsrikt')
    expect(data.stats).toEqual({
      subjectsProcessed: 1,
      processingTime: expect.any(Number),
      apiSource: 'mock_data'
    })

    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringMatching(/scripts\/etl\/skolverket\.js$/),
      expect.objectContaining({
        encoding: 'utf8',
        timeout: 300000,
        env: expect.objectContaining({
          NODE_ENV: 'production'
        })
      })
    )
  })

  it('should handle fresh import flag', async () => {
  mockExecSync.mockReturnValueOnce('ETL completed')

    const request = new NextRequest('http://localhost/api/admin/syllabus/refresh', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-admin-key'
      },
      body: JSON.stringify({ fresh: true })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringMatching(/scripts\/etl\/skolverket\.js --fresh$/),
      expect.any(Object)
    )
  })

  it('should handle ETL script execution errors', async () => {
    const error = new Error('ETL script failed')
    mockExecSync.mockImplementationOnce(() => {
      throw error
    })

    const request = new NextRequest('http://localhost/api/admin/syllabus/refresh', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-admin-key'
      },
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('ETL-processen misslyckades')
    expect(data.error).toBe('ETL script failed')
  })

  it('should return 401 when ADMIN_API_KEY is not configured', async () => {
    delete process.env.ADMIN_API_KEY

    const request = new NextRequest('http://localhost/api/admin/syllabus/refresh', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer any-key'
      },
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })
})