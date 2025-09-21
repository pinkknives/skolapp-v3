import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/ai/generate-questions/route'

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
global.fetch = vi.fn()

describe('/api/ai/generate-questions', () => {
  beforeEach(() => {
    mockOpenAI.openai.chat.completions.create.mockClear()
    mockSupabase.supabaseBrowser.mockClear()
    
    // Mock successful user auth
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null
        })
      }
    }
    mockSupabase.supabaseBrowser.mockReturnValue(mockSupabaseClient as never)
    
    // Mock successful quota check
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true })
    } as unknown as Response)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should reject requests when OpenAI is not available', async () => {
    // Override the availability
    vi.mocked(mockOpenAI).isOpenAIAvailable = false

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
    vi.mocked(mockOpenAI).isOpenAIAvailable = true
    
    // Mock auth failure
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Auth error')
        })
      }
    }
    mockSupabase.supabaseBrowser.mockReturnValue(mockSupabaseClient as never)

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
    vi.mocked(mockOpenAI).isOpenAIAvailable = true
    
    // Mock quota exceeded
    vi.mocked(global.fetch).mockResolvedValue({
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
    vi.mocked(mockOpenAI).isOpenAIAvailable = true

    const mockResponse = {
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

    mockOpenAI.openai.chat.completions.create.mockResolvedValueOnce(mockResponse)

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
    vi.mocked(mockOpenAI).isOpenAIAvailable = true

    mockOpenAI.openai.chat.completions.create.mockRejectedValueOnce(
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
    vi.mocked(mockOpenAI).isOpenAIAvailable = true

    const mockResponse = {
      choices: [
        {
          message: {
            content: 'This is not valid JSON'
          }
        }
      ]
    }

    mockOpenAI.openai.chat.completions.create.mockResolvedValueOnce(mockResponse)

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