/**
 * Skolverket API Client
 * Minimal client used by tests. Provides:
 * - getSubjects(schoolType?)
 * - getCentralContent(subjectCode, gradeSpan, page?, limit?)
 * - healthCheck()
 * Includes simple retry logic for 429/5xx.
 */

export type SchoolType = 'grundskola' | 'gymnasium' | string

export interface Subject {
  code: string
  name: string
  schoolType?: SchoolType
}

export interface CentralContentItem {
  id: string
  subjectCode: string
  gradeSpan: string
  title: string
  body: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  hasNext: boolean
}

type Json = Record<string, unknown>
type HeaderLike = { get(name: string): string | null } | Map<string, string>

export class SkolverketApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || process.env.NEXT_PUBLIC_SKOLVERKET_API_URL || '').replace(/\/$/, '')
    this.defaultHeaders = {
      Accept: 'application/json',
      'User-Agent': 'Skolapp-v3/1.0 (Educational Quiz Platform)'
    }
  }

  private async sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms))
  }

  private buildUrl(path: string) {
    if (this.baseUrl) return `${this.baseUrl}${path}`
    return path
  }

  private getHeader(res: Response, name: string): string | null {
    const headers = (res as Response).headers as unknown as HeaderLike | undefined
    if (!headers) return null
    if (headers instanceof Map) {
      const val = headers.get(name)
      return typeof val === 'string' ? val : val ? String(val) : null
    }
    return headers.get(name)
  }

  private async request(input: RequestInfo | URL, init?: RequestInit, attempt = 0): Promise<Response> {
    const maxRetries = 1
    let res: Response
    try {
      res = await fetch(input, {
        ...init,
        headers: {
          ...this.defaultHeaders,
          ...(init?.headers as Record<string, string> | undefined)
        }
      })
    } catch (err) {
      // Network error: return a synthetic non-ok response so callers can handle gracefully
      return new Response(null, {
        status: 503,
        statusText: (err as Error)?.message || 'Network Error'
      })
    }

    if (res.ok) return res

    // Retry on 429 with Retry-After
    if (res.status === 429 && attempt < maxRetries) {
      const retryAfter = this.getHeader(res, 'Retry-After')
      const sec = retryAfter ? parseInt(retryAfter, 10) : 1
      await this.sleep((Number.isFinite(sec) ? sec : 1) * 1000)
      try {
        const retryRes = await this.request(input, init, attempt + 1)
        return retryRes ?? res
      } catch {
        return res
      }
    }

    // Retry once on 5xx
    if (res.status >= 500 && res.status < 600 && attempt < maxRetries) {
      await this.sleep(500)
      try {
        const retryRes = await this.request(input, init, attempt + 1)
        return retryRes ?? res
      } catch {
        return res
      }
    }

    return res
  }

  async getSubjects(schoolType?: SchoolType): Promise<Subject[]> {
    const params = new URLSearchParams()
    if (schoolType) params.set('schoolType', schoolType)
    const url = this.buildUrl(`/subjects${params.toString() ? `?${params.toString()}` : ''}`)
    const res = await this.request(url, { method: 'GET' })
    if (!res.ok) {
      const statusText = res.statusText || ''
      throw new Error(`Failed to fetch subjects: ${res.status} ${statusText}`.trim())
    }
    const json = (await res.json()) as Subject[] | { subjects?: Subject[]; data?: Subject[] } & Json
    // Handle direct array response or wrapped responses under `data` or `subjects`
    if (Array.isArray(json)) {
      return json
    }
    if (Array.isArray(json.data)) {
      return json.data
    }
    return (json.subjects as Subject[]) || []
  }

  async getCentralContent(
    subjectCode: string,
    gradeSpan: string,
    page = 1,
    limit = 100
  ): Promise<{ data: CentralContentItem[]; pagination: Pagination }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), gradeSpan })
    const url = this.buildUrl(`/subjects/${encodeURIComponent(subjectCode)}/central-content?${params}`)
    const res = await this.request(url, { method: 'GET' })
    if (!res.ok) {
      const statusText = res.statusText || ''
      throw new Error(`Failed to fetch central content: ${res.status} ${statusText}`.trim())
    }
    const json = (await res.json()) as {
      data?: CentralContentItem[]
      pagination?: Pagination
    } & Json
    return {
      data: (json.data as CentralContentItem[]) || [],
      pagination: (json.pagination as Pagination) || { page, limit, total: 0, hasNext: false }
    }
  }

  async healthCheck(): Promise<boolean> {
    const url = this.buildUrl('/health')
    try {
      const res = await this.request(url, { method: 'GET' })
      return res.ok
    } catch (_error) {
      return false
    }
  }
}

// Named singleton instance for simple imports in scripts and tests
export const skolverketApi = new SkolverketApiClient()

export default SkolverketApiClient