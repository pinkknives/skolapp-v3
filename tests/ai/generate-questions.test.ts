import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock OpenAI client
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

// Mock Supabase browser client used for auth in the route
vi.mock('@/lib/supabase-browser', () => ({
  supabaseBrowser: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    }
  }))
}))

// Mock quota checker to always allow
vi.mock('@/lib/ai/quota', () => ({
  verifyQuota: vi.fn().mockResolvedValue({ ok: true })
}))

// Mock Skolverket objectives
vi.mock('@/lib/ai/skolverket', () => ({
  fetchSkolverketObjectives: vi.fn().mockResolvedValue([
    { id: 'M7.1', label: 'Algebraiska uttryck' },
    { id: 'M7.2', label: 'Ekvationer' }
  ])
}))

describe('API /api/ai/generate-questions', () => {
  let mockedOpenAI: Awaited<typeof import('@/lib/ai/openai')>
  let POST: (req: NextRequest) => Promise<Response>
  let fetchSkolverketObjectives: Awaited<typeof import('@/lib/ai/skolverket')>['fetchSkolverketObjectives']

  beforeEach(async () => {
    vi.clearAllMocks()
    mockedOpenAI = vi.mocked(await import('@/lib/ai/openai'))
    ;({ POST } = await import('@/app/api/ai/generate-questions/route'))
    ;({ fetchSkolverketObjectives } = await import('@/lib/ai/skolverket'))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('generates valid JSON, injects curriculum when missing, and normalizes defaults', async () => {
    // Mock OpenAI to return minimal objects missing type/bloom/id/curriculum
    const payload = {
      questions: [
        { prompt: 'Vad är 2 + 2?', options: ['3', '4', '5', '6'], answer: '4' },
        { prompt: 'Förenkla x + x', answer: '2x' }
      ]
    }
    // @ts-expect-error - vi mock
    mockedOpenAI.openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(payload) } }]
    })

    const req = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer test' },
      body: JSON.stringify({
        gradeBand: 'ak7-9',
        subject: 'matematik',
        topic: 'algebra',
        difficulty: 3,
        count: 2,
        language: 'sv'
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()

    // questions exist and are normalized
    expect(Array.isArray(data.questions)).toBe(true)
    expect(data.questions.length).toBe(2)
    const q1 = data.questions[0]
    expect(q1.subject).toBe('matematik')
    expect(q1.grade_band).toBe('ak7-9')
    expect(q1.topic).toBe('algebra')
    expect(q1.type).toBeDefined()
    expect(q1.bloom).toBeDefined()
    expect(q1.id).toBeDefined()
    // curriculum injected from mock (first objective)
    expect(q1.curriculum && q1.curriculum.length).toBe(1)
    expect(q1.curriculum[0].id).toBe('M7.1')
  })

  it('handles missing Skolverket data gracefully (curriculum = [])', async () => {
    // Empty curriculum list
    // @ts-expect-error - vi mock
    ;(fetchSkolverketObjectives as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce([] as unknown)

    const payload = {
      questions: [ { prompt: 'Vad är 1 + 1?', answer: '2' } ]
    }
    // @ts-expect-error - vi mock
    mockedOpenAI.openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(payload) } }]
    })

    const req = new NextRequest('http://localhost/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer test' },
      body: JSON.stringify({
        gradeBand: 'ak4-6',
        subject: 'matematik',
        topic: 'taluppfattning',
        difficulty: 2,
        count: 1,
        language: 'sv'
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.questions[0].curriculum).toEqual([])
  })
})


