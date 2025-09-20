import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { SkolverketApiClient } from '@/lib/api/skolverket-client'

// Mock fetch globally before any imports
const mockFetch = vi.fn()

// Disable MSW for this test suite
beforeAll(() => {
  // @ts-expect-error - Overriding global fetch for testing
  global.fetch = mockFetch
})

afterAll(() => {
  // Restore original fetch
  vi.restoreAllMocks()
})

describe('SkolverketApiClient', () => {
  let client: SkolverketApiClient
  
  beforeEach(() => {
    client = new SkolverketApiClient('https://test-api.skolverket.se')
    mockFetch.mockClear()
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getSubjects', () => {
    it('should fetch subjects successfully', async () => {
      const mockSubjects = [
        { code: 'GRGRMAT01', name: 'Matematik', schoolType: 'grundskola' as const },
        { code: 'GRGRSVE01', name: 'Svenska', schoolType: 'grundskola' as const }
      ]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSubjects })
      })

      const result = await client.getSubjects('grundskola')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.skolverket.se/subjects?schoolType=grundskola',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'User-Agent': 'Skolapp-v3/1.0 (Educational Quiz Platform)'
          })
        })
      )
      expect(result).toEqual(mockSubjects)
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(client.getSubjects()).rejects.toThrow(
        'Failed to fetch subjects: 500 Internal Server Error'
      )
    })
  })

  describe('getCentralContent', () => {
    it('should fetch central content with pagination', async () => {
      const mockContent = [
        {
          id: '1',
          subjectCode: 'GRGRMAT01',
          gradeSpan: '1-3',
          title: 'Tal och algebra',
          body: 'Naturliga tal och deras egenskaper...'
        }
      ]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockContent,
          pagination: { page: 1, limit: 100, total: 1, hasNext: false }
        })
      })

      const result = await client.getCentralContent('GRGRMAT01', '1-3')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.skolverket.se/subjects/GRGRMAT01/central-content?page=1&limit=100&gradeSpan=1-3',
        expect.any(Object)
      )
      expect(result.data).toEqual(mockContent)
    })
  })

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })
      
      const result = await client.healthCheck()
      
      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.skolverket.se/health',
        expect.any(Object)
      )
    })

    it('should return false when API is unhealthy', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })
      
      const result = await client.healthCheck()
      
      expect(result).toBe(false)
    })

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      const result = await client.healthCheck()
      
      expect(result).toBe(false)
    })
  })

  describe('retry logic', () => {
    it('should retry on rate limiting (429)', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Map([['Retry-After', '1']])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] })
        })

      const result = await client.getSubjects()
      
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual([])
    })

    it('should retry on server errors (5xx)', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] })
        })

      const result = await client.getSubjects()
      
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual([])
    })

    it('should not retry on client errors (4xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(client.getSubjects()).rejects.toThrow('Failed to fetch subjects: 404 Not Found')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})