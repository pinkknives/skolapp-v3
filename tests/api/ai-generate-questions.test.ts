import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { POST } from '../../src/app/api/ai/generate-questions/route'

// Mock OpenAI
vi.mock('@/lib/ai/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  },
  isOpenAIAvailable: true
}))

// Mock Supabase
vi.mock('@/lib/supabase-browser', () => ({
  supabaseBrowser: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    }
  }))
}))

vi.mock('@/lib/ai/quota', () => ({
  verifyQuota: vi.fn().mockResolvedValue({ ok: true })
}))

const mockOpenAI = vi.mocked(await import('@/lib/ai/openai'))
const mockSupabase = vi.mocked(await import('@/lib/supabase-browser'))

// Mock fetch for quota checking
let fetchMock: Mock

// Helper to override mocked OpenAI availability without using any
function setOpenAIAvailability(value: boolean) {
  Object.defineProperty(mockOpenAI as unknown as Record<string, unknown>, 'isOpenAIAvailable', {
    value,
    configurable: true
  })
}

describe('/api/ai/generate-questions', () => {
  beforeEach(() => {
  (mockOpenAI.openai.chat.completions.create as unknown as Mock).mockClear()
    mockSupabase.supabaseBrowser.mockClear()
    // Stub global fetch for each test case
    vi.unstubAllGlobals()
    vi.stubGlobal('fetch', vi.fn())
    fetchMock = global.fetch as unknown as Mock
    
    // Mock successful user auth
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null
        })
      }
    }
    mockSupabase.supabaseBrowser.mockReturnValue(
      mockSupabaseClient as unknown as SupabaseClient
    )
    
    // Mock successful quota check
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true })
    } as unknown as Response)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('should reject requests when OpenAI is not available', async () => {
  // Override the availability flag on the mocked module
  setOpenAIAvailability(false)

    const request = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Matematik',
        grade: 'Åk 6'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toBe('AI-funktioner är inte konfigurerade på denna server.')
  })

  it('should reject requests when user is not authenticated', async () => {
    // Reset availability
  setOpenAIAvailability(true)
    
    // Mock auth failure
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Auth error')
        })
      }
    }
    mockSupabase.supabaseBrowser.mockReturnValue(
      mockSupabaseClient as unknown as SupabaseClient
    )

    const request = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Matematik',
        grade: 'Åk 6'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Du måste vara inloggad för att använda AI-funktioner')
  })

  it('should reject requests when quota is exceeded', async () => {
    // Reset availability
    setOpenAIAvailability(true)
    
    // Mock quota exceeded via verifyQuota
    const { verifyQuota } = await import('@/lib/ai/quota')
    ;(verifyQuota as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({ ok: false, reason: 'quota-exceeded' } as { ok: false; reason: string })

    const request = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        gradeBand: 'ak4-6',
        subject: 'matematik',
        topic: 'taluppfattning',
        difficulty: 2,
        count: 1,
        language: 'sv'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.code).toBe('QUOTA_EXCEEDED')
  })

  it('should generate questions successfully with valid request', async () => {
    // Reset availability
    setOpenAIAvailability(true)

    const mockResponse: unknown = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              questions: [
                {
                  id: 'q1',
                  subject: 'matematik',
                  grade_band: 'ak7-9',
                  topic: 'algebra',
                  difficulty: 3,
                  bloom: 'understand',
                  type: 'mcq',
                  prompt: 'Vad är 2 + 2?',
                  options: ['3', '4', '5', '6'],
                  answer: 1,
                  rationale: '2 + 2 = 4',
                  curriculum: [{ id: 'M7.1', label: 'Algebraiska uttryck' }]
                }
              ]
            })
          }
        }
      ]
    }

  ;(mockOpenAI.openai.chat.completions.create as unknown as Mock).mockResolvedValueOnce(mockResponse)

    const request = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        gradeBand: 'ak7-9',
        subject: 'matematik',
        topic: 'algebra',
        difficulty: 3,
        count: 1,
        language: 'sv'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.questions).toBeDefined()
    expect(Array.isArray(data.questions)).toBe(true)
    expect(data.questions[0].prompt).toBe('Vad är 2 + 2?')
    expect(data.questions[0].type).toBe('mcq')

    expect(mockOpenAI.openai.chat.completions.create).toHaveBeenCalled()
  })

  it('should handle OpenAI API errors gracefully', async () => {
    // Reset availability
  setOpenAIAvailability(true)

    ;(mockOpenAI.openai.chat.completions.create as unknown as Mock).mockRejectedValueOnce(
      new Error('OpenAI API error')
    )

    const request = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Matematik',
        grade: 'Åk 6'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Kunde inte generera frågor just nu.')
  })

  it('should handle malformed JSON responses', async () => {
    // Reset availability
    setOpenAIAvailability(true)

    const mockResponse: unknown = {
      choices: [
        {
          message: {
            content: 'This is not valid JSON'
          }
        }
      ]
    }

  ;(mockOpenAI.openai.chat.completions.create as unknown as Mock).mockResolvedValueOnce(mockResponse)

    const request = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        gradeBand: 'ak7-9',
        subject: 'matematik',
        topic: 'algebra',
        difficulty: 3,
        count: 1,
        language: 'sv'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
  })
})