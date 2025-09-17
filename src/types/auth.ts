// Authentication and user types

export type UserRole = 'gäst' | 'elev' | 'lärare'

export type SubscriptionPlan = 'gratis' | 'premium' | 'skolplan'

export type DataRetentionMode = 'korttid' | 'långtid'

export type ConsentStatus = 'pending' | 'approved' | 'denied' | 'expired'

export type PaymentProvider = 'stripe' | 'app_store_ios' | 'google_play' | 'none'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  subscriptionPlan: SubscriptionPlan
  dataRetentionMode: DataRetentionMode
  schoolAccountId?: string // Links to school account for skolplan users
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
  dataRetentionMode?: DataRetentionMode
  schoolAccountId?: string
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

export interface SchoolAccount {
  id: string
  name: string
  organizationNumber: string
  contactEmail: string
  adminUserId: string
  subscriptionPlan: 'skolplan'
  maxTeachers: number
  currentTeachers: number
  dataRetentionMode: DataRetentionMode
  paymentProvider: PaymentProvider
  billingEmail?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface ConsentRecord {
  id: string
  studentId: string
  parentEmail: string
  parentName: string
  consentType: 'data_retention' | 'marketing' | 'analytics'
  status: ConsentStatus
  requestedAt: Date
  respondedAt?: Date
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  consentMethod: 'email_link' | 'qr_code' | 'digital_signature'
  auditLog: ConsentAuditEntry[]
}

export interface ConsentAuditEntry {
  id: string
  timestamp: Date
  action: 'created' | 'sent' | 'viewed' | 'approved' | 'denied' | 'expired' | 'revoked'
  details: string
  ipAddress?: string
  userAgent?: string
}

export interface SubscriptionFeature {
  key: string
  name: string
  description: string
  includedInPlans: SubscriptionPlan[]
  requiresConsent?: boolean
  requiresDataRetention?: DataRetentionMode
}

// Role permissions
export interface RolePermissions {
  canCreateQuiz: boolean
  canManageQuiz: boolean
  canViewAnalytics: boolean
  canManageSubscription: boolean
  canAccessTeacherPortal: boolean
  canSaveResults: boolean
  canAccessLongTermData: boolean
  canManageSchoolAccount: boolean
  canRequestParentalConsent: boolean
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
    canAccessLongTermData: false,
    canManageSchoolAccount: false,
    canRequestParentalConsent: false,
  },
  elev: {
    canCreateQuiz: false,
    canManageQuiz: false,
    canViewAnalytics: false,
    canManageSubscription: false,
    canAccessTeacherPortal: false,
    canSaveResults: true,
    canAccessLongTermData: false,
    canManageSchoolAccount: false,
    canRequestParentalConsent: false,
  },
  lärare: {
    canCreateQuiz: true,
    canManageQuiz: true,
    canViewAnalytics: true,
    canManageSubscription: true,
    canAccessTeacherPortal: true,
    canSaveResults: true,
    canAccessLongTermData: true,
    canManageSchoolAccount: false,
    canRequestParentalConsent: true,
  },
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, Partial<RolePermissions>> = {
  gratis: {
    maxQuizzes: 3,
    maxStudents: 30,
    canAccessLongTermData: false,
  },
  premium: {
    maxQuizzes: 50,
    maxStudents: 100,
    canAccessLongTermData: true,
  },
  skolplan: {
    // Unlimited
    canAccessLongTermData: true,
    canManageSchoolAccount: true,
  },
}

export const DATA_RETENTION_FEATURES: Record<DataRetentionMode, {
  name: string
  description: string
  maxStorageDays: number | null
  requiresConsent: boolean
  availableForPlans: SubscriptionPlan[]
}> = {
  korttid: {
    name: 'Korttidsläge',
    description: 'Data raderas automatiskt efter sessionen',
    maxStorageDays: null, // Session only
    requiresConsent: false,
    availableForPlans: ['gratis', 'premium', 'skolplan'],
  },
  långtid: {
    name: 'Långtidsläge',
    description: 'Data sparas permanent för analys och progression',
    maxStorageDays: null, // Permanent until consent withdrawn
    requiresConsent: true,
    availableForPlans: ['premium', 'skolplan'],
  },
}