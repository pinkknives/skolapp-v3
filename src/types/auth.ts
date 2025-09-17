// Authentication and user types

export type UserRole = 'gäst' | 'elev' | 'lärare'

export type SubscriptionPlan = 'gratis' | 'premium' | 'skolplan'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  subscriptionPlan: SubscriptionPlan
  hasParentalConsent?: boolean // Required for users under 13
  isMinor?: boolean // True if user is under 18
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface AuthSession {
  user: User
  sessionId: string
  expiresAt: Date
  createdAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: 'elev' | 'lärare'
  subscriptionPlan?: SubscriptionPlan
  dateOfBirth?: string // For age verification
  hasParentalConsent?: boolean
  acceptsTerms: boolean
  acceptsPrivacyPolicy: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface GuestSession {
  id: string
  nickname?: string
  joinedQuizId: string
  createdAt: Date
  expiresAt: Date
}

// Role permissions
export interface RolePermissions {
  canCreateQuiz: boolean
  canManageQuiz: boolean
  canViewAnalytics: boolean
  canManageSubscription: boolean
  canAccessTeacherPortal: boolean
  canSaveResults: boolean
  maxQuizzes?: number
  maxStudents?: number
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  gäst: {
    canCreateQuiz: false,
    canManageQuiz: false,
    canViewAnalytics: false,
    canManageSubscription: false,
    canAccessTeacherPortal: false,
    canSaveResults: false,
  },
  elev: {
    canCreateQuiz: false,
    canManageQuiz: false,
    canViewAnalytics: false,
    canManageSubscription: false,
    canAccessTeacherPortal: false,
    canSaveResults: true,
  },
  lärare: {
    canCreateQuiz: true,
    canManageQuiz: true,
    canViewAnalytics: true,
    canManageSubscription: true,
    canAccessTeacherPortal: true,
    canSaveResults: true,
  },
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, Partial<RolePermissions>> = {
  gratis: {
    maxQuizzes: 3,
    maxStudents: 30,
  },
  premium: {
    maxQuizzes: 50,
    maxStudents: 100,
  },
  skolplan: {
    // Unlimited
  },
}