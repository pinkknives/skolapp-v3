// Authentication utilities and helpers

import { type User, type UserRole, type SubscriptionPlan, ROLE_PERMISSIONS, SUBSCRIPTION_LIMITS } from '@/types/auth'

/**
 * Check if user has specific permission based on role
 */
export function hasPermission(user: User | null, permission: keyof typeof ROLE_PERMISSIONS.lärare): boolean {
  if (!user) return false
  return ROLE_PERMISSIONS[user.role][permission] as boolean
}

/**
 * Check if user can access teacher portal
 */
export function canAccessTeacherPortal(user: User | null): boolean {
  return hasPermission(user, 'canAccessTeacherPortal')
}

/**
 * Check if user can create quiz
 */
export function canCreateQuiz(user: User | null): boolean {
  return hasPermission(user, 'canCreateQuiz')
}

/**
 * Check if user can save quiz results
 */
export function canSaveResults(user: User | null): boolean {
  return hasPermission(user, 'canSaveResults')
}

/**
 * Get subscription limits for user
 */
export function getSubscriptionLimits(user: User | null) {
  if (!user) return SUBSCRIPTION_LIMITS.gratis
  return SUBSCRIPTION_LIMITS[user.subscriptionPlan] || SUBSCRIPTION_LIMITS.gratis
}

/**
 * Check if user has reached quiz limit
 */
export function hasReachedQuizLimit(user: User | null, currentQuizCount: number): boolean {
  if (!user) return true
  const limits = getSubscriptionLimits(user)
  return limits.maxQuizzes ? currentQuizCount >= limits.maxQuizzes : false
}

/**
 * Format user display name
 */
export function getUserDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

/**
 * Get role display name in Swedish
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    gäst: 'Gäst',
    elev: 'Elev', 
    lärare: 'Lärare'
  }
  return roleNames[role]
}

/**
 * Get subscription plan display name in Swedish
 */
export function getSubscriptionDisplayName(plan: SubscriptionPlan): string {
  const planNames = {
    gratis: 'Gratis',
    premium: 'Premium',
    skolplan: 'Skolplan'
  }
  return planNames[plan]
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Lösenordet måste vara minst 8 tecken långt')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Lösenordet måste innehålla minst en stor bokstav')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Lösenordet måste innehålla minst en liten bokstav')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Lösenordet måste innehålla minst en siffra')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Check if user is a minor (under 18)
 */
export function isMinor(dateOfBirth: string): boolean {
  return calculateAge(dateOfBirth) < 18
}

/**
 * Check if user needs parental consent (under 13)
 */
export function needsParentalConsent(dateOfBirth: string): boolean {
  return calculateAge(dateOfBirth) < 13
}

/**
 * Generate secure password requirements text in Swedish
 */
export function getPasswordRequirements(): string[] {
  return [
    'Minst 8 tecken långt',
    'Innehåller stor bokstav (A-Z)',
    'Innehåller liten bokstav (a-z)', 
    'Innehåller minst en siffra (0-9)'
  ]
}

/**
 * Format subscription plan features for display
 */
export function getSubscriptionFeatures(plan: SubscriptionPlan): string[] {
  const features = {
    gratis: [
      'Upp till 3 quiz',
      'Upp till 30 elever per quiz',
      'Grundläggande statistik',
      'E-postsupport'
    ],
    premium: [
      'Upp till 50 quiz',
      'Upp till 100 elever per quiz',
      'Detaljerad statistik och analys',
      'AI-hjälp för quizskapande',
      'Prioriterad support'
    ],
    skolplan: [
      'Obegränsat antal quiz',
      'Obegränsat antal elever',
      'Avancerad analys och rapporter',
      'AI-hjälp för quizskapande',
      'Klasshantering och progression',
      'Dedikerad support',
      'GDPR-kompatibel datahantering'
    ]
  }
  
  return features[plan] || features.gratis
}