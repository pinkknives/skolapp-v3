import { describe, it, expect } from 'vitest'
import { normalizeQuotasFromRow, computeRemaining, getCurrentPeriodStartUTC, type SubscriptionRow, type EffectiveQuotas } from '@/lib/billing/subscriptions'

describe('subscriptions billing helpers', () => {
	it('normalizes quotas using defaults when nulls', () => {
		const row = {
			plan: 'teacher_bas',
			max_quizzes: null,
			ai_quota_4o: null,
			ai_quota_3_5: null,
		} as Pick<SubscriptionRow, 'plan' | 'max_quizzes' | 'ai_quota_4o' | 'ai_quota_3_5'>
		const q = normalizeQuotasFromRow(row)
		expect(q.plan).toBe('teacher_bas')
		expect(q.maxQuizzes).toBe(50)
		expect(q.aiQuota4o).toBe(10)
		expect(q.aiQuota35).toBe(200)
	})

	it('computeRemaining handles unlimited (null) gracefully', () => {
		const quotas: EffectiveQuotas = { plan: 'school', maxQuizzes: null, aiQuota4o: null, aiQuota35: null }
		const usage = { quizzesCreated: 123, ai4oUsed: 999, ai35Used: 5000 }
		const r = computeRemaining(quotas, usage)
		expect(r.quizzesRemaining).toBeNull()
		expect(r.ai4oRemaining).toBeNull()
		expect(r.ai35Remaining).toBeNull()
	})

	it('getCurrentPeriodStartUTC returns first day of month (UTC)', () => {
		const d = new Date(Date.UTC(2025, 8, 26, 12, 0, 0)) // 2025-09-26
		expect(getCurrentPeriodStartUTC(d)).toBe('2025-09-01')
	})
})
