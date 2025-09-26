import { test, expect } from '@playwright/test'

// Contract tests for Skolverket endpoints via our health route
// Uses live mode if SKOLVERKET_LIVE=1

async function fetchJson(path: string) {
  const res = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}${path}`)
  const data = await res.json().catch(() => null)
  return { status: res.status, data }
}

// Minimal schema validation inline to avoid bundling zod in tests/e2e
function isSubjectArray(value: unknown): value is { code: string; name: string }[] {
  return Array.isArray(value) && value.every(v => v && typeof v.code === 'string' && typeof v.name === 'string')
}

test.describe('Skolverket contract', () => {
  test('health + subjects shape', async () => {
    const { status, data } = await fetchJson('/api/health/skolverket')
    expect([200, 503]).toContain(status)

    if (status === 200) {
      expect(data?.ok).toBeTruthy()
      if (Array.isArray(data?.subjects)) {
        expect(isSubjectArray(data.subjects)).toBeTruthy()
      }
    } else {
      // 503 acceptable when upstream is down
      expect(data?.ok).toBeFalsy()
    }
  })
})
