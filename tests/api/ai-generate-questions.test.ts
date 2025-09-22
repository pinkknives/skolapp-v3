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
    // Override the availability
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
    
    // Mock quota exceeded
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: vi.fn().mockResolvedValue({ 
        error: 'Du har nått din månadsgräns för AI-frågor',
        code: 'QUOTA_EXCEEDED' 
      })
    } as unknown as Response)

    const request = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        subject: 'Matematik',
        grade: 'Åk 6'
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
                  type: 'flerval',
                  question: 'Vad är 2 + 2?',
                  options: ['3', '4', '5', '6'],
                  correctIndex: 1,
                  explanation: '2 + 2 = 4'
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
        subject: 'Matematik',
        grade: 'Åk 6',
        count: 1,
        type: 'flerval',
        difficulty: 'lätt'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.questions).toBeDefined()
    expect(Array.isArray(data.questions)).toBe(true)
    expect(data.questions[0]).toEqual({
      type: 'flerval',
      question: 'Vad är 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctIndex: 1,
      explanation: '2 + 2 = 4'
    })

    // Verify OpenAI was called with correct parameters
    expect(mockOpenAI.openai.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: expect.stringContaining('Du är en svensk lärarassistent')
        },
        {
          role: 'user',
          content: expect.stringContaining('Skapa 1 frågor')
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
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
        subject: 'Matematik',
        grade: 'Åk 6'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.questions).toEqual([]) // Should fall back to empty array
  })
})