export type BillingPlan = 'free' | 'teacher_bas' | 'teacher_pro' | 'school'

export interface RealtimeLimits {
	maxConcurrentSessions: number | null // null = unlimited
	maxParticipantsPerSession: number | null
	sessionTimeoutMinutes: number | null
}

export function getRealtimeLimits(plan: BillingPlan): RealtimeLimits {
	if (plan === 'free') {
		return {
			maxConcurrentSessions: 1,
			maxParticipantsPerSession: 20,
			sessionTimeoutMinutes: 30,
		}
	}
	if (plan === 'teacher_bas') {
		return {
			maxConcurrentSessions: 2,
			maxParticipantsPerSession: 60,
			sessionTimeoutMinutes: 90,
		}
	}
	if (plan === 'teacher_pro') {
		return {
			maxConcurrentSessions: 5,
			maxParticipantsPerSession: 200,
			sessionTimeoutMinutes: 180,
		}
	}
	return {
		maxConcurrentSessions: null,
		maxParticipantsPerSession: null,
		sessionTimeoutMinutes: null,
	}
}
