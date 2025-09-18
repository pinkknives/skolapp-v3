// Integration types for Swedish school systems

export type IntegrationType = 'sso' | 'lms' | 'calendar' | 'sis'

export type SSOProvider = 'skolfederation' | 'saml' | 'google' | 'microsoft'

export type LMSProvider = 'google_classroom' | 'microsoft_teams' | 'unikum' | 'schoolsoft'

export type CalendarProvider = 'skola24' | 'ical' | 'google_calendar' | 'outlook'

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending'

export interface BaseIntegration {
  id: string
  type: IntegrationType
  name: string
  description: string
  isEnabled: boolean
  status: IntegrationStatus
  schoolAccountId: string
  configuredBy: string // User ID who configured
  configuredAt: Date
  lastSyncAt?: Date
  errorMessage?: string
  settings: Record<string, unknown>
}

export interface SSOIntegration extends BaseIntegration {
  type: 'sso'
  provider: SSOProvider
  settings: {
    entityId?: string
    ssoUrl?: string
    x509Certificate?: string
    attributeMapping?: {
      email?: string
      firstName?: string
      lastName?: string
      role?: string
      schoolId?: string
    }
    allowedDomains?: string[]
    autoCreateUsers?: boolean
    defaultRole?: 'elev' | 'lärare'
  }
}

export interface LMSIntegration extends BaseIntegration {
  type: 'lms'
  provider: LMSProvider
  settings: {
    clientId?: string
    clientSecret?: string
    tenantId?: string // For Microsoft Teams
    scopes?: string[]
    webhookUrl?: string
    autoSync?: boolean
    syncFrequency?: 'realtime' | 'hourly' | 'daily'
    exportFormats?: ('pdf' | 'xlsx' | 'csv')[]
  }
}

export interface CalendarIntegration extends BaseIntegration {
  type: 'calendar'
  provider: CalendarProvider
  settings: {
    serverUrl?: string
    username?: string
    password?: string
    calendarId?: string
    syncDirection?: 'import' | 'export' | 'bidirectional'
    autoCreateEvents?: boolean
    eventCategories?: string[]
  }
}

export interface SISIntegration extends BaseIntegration {
  type: 'sis'
  provider: LMSProvider
  settings: {
    apiUrl?: string
    apiKey?: string
    schoolCode?: string
    syncClassLists?: boolean
    syncSchedules?: boolean
    syncGrades?: boolean
    dataMapping?: Record<string, string>
  }
}

export type Integration = SSOIntegration | LMSIntegration | CalendarIntegration | SISIntegration

export interface IntegrationTemplate {
  type: IntegrationType
  provider: SSOProvider | LMSProvider | CalendarProvider
  name: string
  description: string
  logoUrl?: string
  documentationUrl?: string
  supportedFeatures: string[]
  requiredSettings: string[]
  optionalSettings: string[]
  isPopular?: boolean
  isPremiumOnly?: boolean
}

export interface ClassListImport {
  id: string
  integrationId: string
  schoolAccountId: string
  fileName?: string
  source: 'manual_upload' | 'sis_sync' | 'lms_import'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalStudents: number
  processedStudents: number
  failedStudents: number
  createdAt: Date
  completedAt?: Date
  errorDetails?: string[]
  importedClasses: ImportedClass[]
}

export interface ImportedClass {
  id: string
  name: string
  externalId?: string
  teacherId: string
  students: ImportedStudent[]
  schedules?: ClassSchedule[]
}

export interface ImportedStudent {
  id?: string // May not exist yet if auto-creating
  externalId?: string
  email?: string
  firstName: string
  lastName: string
  personalNumber?: string // Personnummer for Swedish students
  classYear?: string
  isNew: boolean // True if student needs to be created
  importErrors?: string[]
}

export interface ClassSchedule {
  id: string
  subject: string
  dayOfWeek: number // 1-7, Monday=1
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  room?: string
  teacher?: string
  externalId?: string
}

export interface ExportOperation {
  id: string
  integrationId: string
  type: 'quiz_results' | 'class_list' | 'gradebook'
  targetSystem: LMSProvider
  status: 'pending' | 'processing' | 'completed' | 'failed'
  quizIds?: string[]
  classIds?: string[]
  format: 'native' | 'csv' | 'xlsx' | 'pdf'
  createdBy: string
  createdAt: Date
  completedAt?: Date
  downloadUrl?: string
  errorMessage?: string
  exportedRecords: number
  failedRecords: number
}

export interface IntegrationAuditLog {
  id: string
  integrationId: string
  action: 'created' | 'updated' | 'deleted' | 'sync_started' | 'sync_completed' | 'sync_failed' | 'export' | 'import'
  userId: string
  details: string
  metadata?: Record<string, unknown>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export interface IntegrationPermission {
  integration: IntegrationType
  action: 'read' | 'write' | 'configure' | 'delete'
  requiredRole: 'lärare' | 'admin'
  requiredPlan: 'premium' | 'skolplan'
  description: string
}

export const INTEGRATION_PERMISSIONS: IntegrationPermission[] = [
  {
    integration: 'sso',
    action: 'configure',
    requiredRole: 'admin',
    requiredPlan: 'skolplan',
    description: 'Konfigurera inloggning via skolans system'
  },
  {
    integration: 'lms',
    action: 'configure',
    requiredRole: 'lärare',
    requiredPlan: 'premium',
    description: 'Konfigurera export till LMS-system'
  },
  {
    integration: 'lms',
    action: 'write',
    requiredRole: 'lärare',
    requiredPlan: 'premium',
    description: 'Exportera resultat till LMS-system'
  },
  {
    integration: 'calendar',
    action: 'configure',
    requiredRole: 'lärare',
    requiredPlan: 'premium',
    description: 'Konfigurera schemaintegration'
  },
  {
    integration: 'sis',
    action: 'configure',
    requiredRole: 'admin',
    requiredPlan: 'skolplan',
    description: 'Konfigurera import från elevregister'
  }
]

export const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  {
    type: 'sso',
    provider: 'skolfederation',
    name: 'Skolfederation',
    description: 'Säker inloggning via svenska skolans centrala system',
    supportedFeatures: ['single_sign_on', 'auto_user_creation', 'role_mapping'],
    requiredSettings: ['entityId', 'ssoUrl', 'x509Certificate'],
    optionalSettings: ['attributeMapping', 'allowedDomains'],
    isPopular: true,
    isPremiumOnly: true
  },
  {
    type: 'lms',
    provider: 'google_classroom',
    name: 'Google Classroom',
    description: 'Exportera quiz-resultat till Google Classroom',
    supportedFeatures: ['export_results', 'create_assignments', 'sync_classes'],
    requiredSettings: ['clientId', 'clientSecret'],
    optionalSettings: ['autoSync', 'exportFormats'],
    isPopular: true,
    isPremiumOnly: false
  },
  {
    type: 'lms',
    provider: 'microsoft_teams',
    name: 'Microsoft Teams för Utbildning',
    description: 'Integrera med Microsoft Teams och OneNote Class Notebook',
    supportedFeatures: ['export_results', 'create_assignments', 'sync_classes'],
    requiredSettings: ['clientId', 'clientSecret', 'tenantId'],
    optionalSettings: ['autoSync', 'exportFormats'],
    isPopular: true,
    isPremiumOnly: false
  },
  {
    type: 'calendar',
    provider: 'skola24',
    name: 'Skola24',
    description: 'Synkronisera med Skola24 schema-system',
    supportedFeatures: ['import_schedule', 'create_events', 'sync_classes'],
    requiredSettings: ['serverUrl', 'schoolCode'],
    optionalSettings: ['autoCreateEvents', 'eventCategories'],
    isPopular: true,
    isPremiumOnly: true
  }
]