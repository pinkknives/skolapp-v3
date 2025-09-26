export interface SkolverketHealth {
  ok: boolean
  version?: string
  latencyMs?: number
}

export class SkolverketServiceClient {
  private baseUrl: string
  private defaultTimeoutMs = 8000
  private maxRetries = 3

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_SKOLVERKET_API_URL || 'https://api.skolverket.se'
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error('timeout')), timeoutMs)
      promise
        .then((v) => {
          clearTimeout(id)
          resolve(v)
        })
        .catch((e) => {
          clearTimeout(id)
          reject(e)
        })
    })
  }

  private async sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }

  private async fetchWithRetry(path: string, init?: RequestInit): Promise<Response> {
    let attempt = 0
    let lastErr: unknown
    while (attempt < this.maxRetries) {
      const backoff = attempt === 0 ? 0 : Math.min(2000 * attempt, 4000)
      if (backoff > 0) await this.sleep(backoff)
      try {
        const res = await this.withTimeout(
          fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers: {
              'accept': 'application/json',
              ...(init?.headers as Record<string, string> | undefined)
            }
          }),
          this.defaultTimeoutMs
        )
        if (res.status === 429) {
          attempt++
          continue
        }
        if (res.status >= 500) {
          attempt++
          lastErr = new Error(`Server error ${res.status}`)
          continue
        }
        return res
    } catch (_e) {
      lastErr = _e
        attempt++
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('Skolverket request failed')
  }

  async health(): Promise<SkolverketHealth> {
    const started = Date.now()
    try {
      const res = await this.fetchWithRetry('/health')
      const latencyMs = Date.now() - started
      let version: string | undefined
      try { version = res.headers.get('x-api-version') || undefined } catch {}
      return { ok: res.ok, version, latencyMs }
    } catch (_e) {
      return { ok: false }
    }
  }

  async getSubjects(etag?: string): Promise<{ data: unknown | null; etag?: string | null; status: number }> {
    const res = await this.fetchWithRetry('/subjects', {
      headers: etag ? { 'if-none-match': etag } : undefined
    })
    if (res.status === 304) {
      return { data: null, etag: etag || null, status: 304 }
    }
    const nextEtag = res.headers.get('etag')
    const data = await res.json().catch(() => null)
    return { data, etag: nextEtag, status: res.status }
  }
}
