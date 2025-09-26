import { supabaseServer } from '@/lib/supabase-server'

export type BillingPlan = 'free' | 'teacher_bas' | 'teacher_pro' | 'school'

export interface SubscriptionRow {
	id: string
	org_id: string | null
	user_id: string | null
	plan: BillingPlan
	max_quizzes: number | null
	ai_quota_4o: number | null
	ai_quota_3_5: number | null
	stripe_customer_id: string | null
	stripe_subscription_id: string | null
	current_period_end: string | null // ISO timestamptz
	created_at: string
	updated_at: string
}

export interface EffectiveQuotas {
	plan: BillingPlan
	maxQuizzes: number | null
	aiQuota4o: number | null
	aiQuota35: number | null
	subscriptionId?: string
}

const DEFAULT_QUOTAS: Record<BillingPlan, { maxQuizzes: number | null; aiQuota4o: number | null; aiQuota35: number | null }> = {
	free: { maxQuizzes: 3, aiQuota4o: 0, aiQuota35: 50 },
	teacher_bas: { maxQuizzes: 50, aiQuota4o: 10, aiQuota35: 200 },
	teacher_pro: { maxQuizzes: 200, aiQuota4o: 200, aiQuota35: 2000 },
	school: { maxQuizzes: null, aiQuota4o: null, aiQuota35: null }, // null => unlimited
}

export function getCurrentPeriodStartUTC(today: Date = new Date()): string {
	const year = today.getUTCFullYear()
	const month = today.getUTCMonth() // 0-11
	const firstOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
	return firstOfMonth.toISOString().slice(0, 10) // YYYY-MM-DD
}

export function normalizeQuotasFromRow(row: Pick<SubscriptionRow, 'plan' | 'max_quizzes' | 'ai_quota_4o' | 'ai_quota_3_5'>): EffectiveQuotas {
	const defaults = DEFAULT_QUOTAS[row.plan]
	return {
		plan: row.plan,
		maxQuizzes: row.max_quizzes ?? defaults.maxQuizzes,
		aiQuota4o: row.ai_quota_4o ?? defaults.aiQuota4o,
		aiQuota35: row.ai_quota_3_5 ?? defaults.aiQuota35,
	}
}

export async function resolveEffectiveSubscriptionForUser(userId: string): Promise<EffectiveQuotas> {
	const supabase = supabaseServer()

	// Prefer organisation subscription if the user belongs to any org
	const { data: membership, error: memErr } = await supabase
		.from('organisation_members')
		.select('org_id')
		.eq('user_id', userId)
		.limit(1)
		.maybeSingle()

	if (memErr) {
		// Fallback to user subscription if membership fails
		return await resolveUserOrFallback(userId)
	}

	if (membership?.org_id) {
		type SubLite = Pick<SubscriptionRow, 'id' | 'plan' | 'max_quizzes' | 'ai_quota_4o' | 'ai_quota_3_5'>
		const { data: sub, error } = await supabase
			.from('subscriptions')
			.select('id, plan, max_quizzes, ai_quota_4o, ai_quota_3_5')
			.eq('org_id', membership.org_id)
			.maybeSingle()

		if (!error && sub) {
			const subRow = sub as SubLite
			const quotas = normalizeQuotasFromRow(subRow)
			return { ...quotas, subscriptionId: subRow.id }
		}
	}

	return await resolveUserOrFallback(userId)
}

async function resolveUserOrFallback(userId: string): Promise<EffectiveQuotas> {
	const supabase = supabaseServer()
	type SubLite = Pick<SubscriptionRow, 'id' | 'plan' | 'max_quizzes' | 'ai_quota_4o' | 'ai_quota_3_5'>
	const { data: sub } = await supabase
		.from('subscriptions')
		.select('id, plan, max_quizzes, ai_quota_4o, ai_quota_3_5')
		.eq('user_id', userId)
		.maybeSingle()

	if (sub) {
		const subRow = sub as SubLite
		const quotas = normalizeQuotasFromRow(subRow)
		return { ...quotas, subscriptionId: subRow.id }
	}

	// Fallback: free defaults
	return { ...DEFAULT_QUOTAS.free, plan: 'free' }
}

export type UsageKind = 'quiz_created' | 'ai_4o' | 'ai_3_5'

function usageColumnFor(kind: UsageKind): 'quizzes_created' | 'ai_4o_used' | 'ai_3_5_used' {
	if (kind === 'quiz_created') return 'quizzes_created'
	if (kind === 'ai_4o') return 'ai_4o_used'
	return 'ai_3_5_used'
}

export async function ensureUsageRow(subscriptionId: string, periodStart: string): Promise<void> {
	const supabase = supabaseServer()
	await supabase
		.from('subscription_usage')
		.insert({ subscription_id: subscriptionId, period_start: periodStart })
		.select('id')
		.single()
		.then(async (res) => {
			if (res.error && !String(res.error.message).toLowerCase().includes('duplicate')) {
				// Try upsert on conflict
				await supabase
					.from('subscription_usage')
					.upsert({ subscription_id: subscriptionId, period_start: periodStart }, { onConflict: 'subscription_id,period_start' })
			}
		})
}

export interface UsageSnapshot {
	quizzesCreated: number
	ai4oUsed: number
	ai35Used: number
}

export async function getUsage(subscriptionId: string, date: Date = new Date()): Promise<UsageSnapshot> {
	const supabase = supabaseServer()
	const periodStart = getCurrentPeriodStartUTC(date)
	const { data } = await supabase
		.from('subscription_usage')
		.select('quizzes_created, ai_4o_used, ai_3_5_used')
		.eq('subscription_id', subscriptionId)
		.eq('period_start', periodStart)
		.maybeSingle()

	return {
		quizzesCreated: data?.quizzes_created ?? 0,
		ai4oUsed: data?.ai_4o_used ?? 0,
		ai35Used: data?.ai_3_5_used ?? 0,
	}
}

export async function incrementUsage(params: { subscriptionId: string; kind: UsageKind; amount?: number; date?: Date }): Promise<void> {
	const { subscriptionId, kind } = params
	const amount = params.amount ?? 1
	const periodStart = getCurrentPeriodStartUTC(params.date)
	await ensureUsageRow(subscriptionId, periodStart)
	const supabase = supabaseServer()
	const col = usageColumnFor(kind)
	await supabase.rpc('increment_subscription_usage', { p_subscription_id: subscriptionId, p_period_start: periodStart, p_column: col, p_amount: amount })
}

// Fallback RPC implementation if not present: perform an update expression
export async function incrementUsageFallback(params: { subscriptionId: string; kind: UsageKind; amount?: number; date?: Date }): Promise<void> {
	const { subscriptionId, kind } = params
	const amount = params.amount ?? 1
	const periodStart = getCurrentPeriodStartUTC(params.date)
	await ensureUsageRow(subscriptionId, periodStart)
	const supabase = supabaseServer()
	const col = usageColumnFor(kind)
	const current = await getUsage(subscriptionId, params.date)
	const nextValue = col === 'quizzes_created' ? current.quizzesCreated + amount : col === 'ai_4o_used' ? current.ai4oUsed + amount : current.ai35Used + amount
	await supabase
		.from('subscription_usage')
		.update({ [col]: nextValue })
		.eq('subscription_id', subscriptionId)
		.eq('period_start', periodStart)
}

export function computeRemaining(quotas: EffectiveQuotas, usage: UsageSnapshot): { quizzesRemaining: number | null; ai4oRemaining: number | null; ai35Remaining: number | null } {
	const qRem = quotas.maxQuizzes == null ? null : Math.max(quotas.maxQuizzes - usage.quizzesCreated, 0)
	const o4Rem = quotas.aiQuota4o == null ? null : Math.max(quotas.aiQuota4o - usage.ai4oUsed, 0)
	const g35Rem = quotas.aiQuota35 == null ? null : Math.max(quotas.aiQuota35 - usage.ai35Used, 0)
	return { quizzesRemaining: qRem, ai4oRemaining: o4Rem, ai35Remaining: g35Rem }
}
