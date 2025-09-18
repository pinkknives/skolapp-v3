// Integration utilities and service layer

import { 
  type Integration, 
  type IntegrationType, 
  type IntegrationStatus,
  type IntegrationTemplate,
  type SSOProvider,
  type LMSProvider,
  type CalendarProvider,
  type ClassListImport,
  type ExportOperation,
  type BaseIntegration,
  INTEGRATION_PERMISSIONS,
  INTEGRATION_TEMPLATES
} from '@/types/integrations'
import { type User, type SubscriptionPlan } from '@/types/auth'

/**
 * Check if user can perform integration action
 */
export function canPerformIntegrationAction(
  user: User | null,
  integrationType: IntegrationType,
  action: 'read' | 'write' | 'configure' | 'delete'
): boolean {
  if (!user) return false

  const permission = INTEGRATION_PERMISSIONS.find(
    p => p.integration === integrationType && p.action === action
  )

  if (!permission) return false

  // Check role requirement
  if (permission.requiredRole === 'admin' && user.role !== 'lärare') {
    // In this MVP, admin functions are handled by teachers with skolplan
    return false
  }

  if (permission.requiredRole === 'lärare' && user.role !== 'lärare') {
    return false
  }

  // Check subscription plan requirement
  const planHierarchy: SubscriptionPlan[] = ['gratis', 'premium', 'skolplan']
  const userPlanIndex = planHierarchy.indexOf(user.subscriptionPlan)
  const requiredPlanIndex = planHierarchy.indexOf(permission.requiredPlan)

  return userPlanIndex >= requiredPlanIndex
}

/**
 * Get available integration templates for user
 */
export function getAvailableIntegrationTemplates(user: User | null): IntegrationTemplate[] {
  if (!user || user.role !== 'lärare') {
    return []
  }

  return INTEGRATION_TEMPLATES.filter(template => {
    if (template.isPremiumOnly) {
      return user.subscriptionPlan === 'premium' || user.subscriptionPlan === 'skolplan'
    }
    return true
  })
}

/**
 * Validate integration configuration
 */
export function validateIntegrationConfig(
  type: IntegrationType,
  provider: string,
  settings: Record<string, unknown>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  const template = INTEGRATION_TEMPLATES.find(
    t => t.type === type && t.provider === provider
  )

  if (!template) {
    errors.push('Okänd integrationstyp eller leverantör')
    return { isValid: false, errors }
  }

  // Check required settings
  for (const requiredSetting of template.requiredSettings) {
    if (!settings[requiredSetting] || String(settings[requiredSetting]).trim() === '') {
      errors.push(`Obligatorisk inställning saknas: ${requiredSetting}`)
    }
  }

  // Type-specific validation
  if (type === 'sso') {
    validateSSOConfig(settings, errors)
  } else if (type === 'lms') {
    validateLMSConfig(settings, errors)
  } else if (type === 'calendar') {
    validateCalendarConfig(settings, errors)
  }

  return { isValid: errors.length === 0, errors }
}

function validateSSOConfig(settings: Record<string, unknown>, errors: string[]): void {
  if (settings.ssoUrl && !isValidUrl(String(settings.ssoUrl))) {
    errors.push('SSO URL måste vara en giltig URL')
  }

  if (settings.allowedDomains) {
    const domains = settings.allowedDomains as string[]
    for (const domain of domains) {
      if (!isValidDomain(domain)) {
        errors.push(`Ogiltig domän: ${domain}`)
      }
    }
  }
}

function validateLMSConfig(settings: Record<string, unknown>, errors: string[]): void {
  if (settings.clientId && String(settings.clientId).length < 10) {
    errors.push('Client ID verkar vara för kort')
  }

  if (settings.webhookUrl && !isValidUrl(String(settings.webhookUrl))) {
    errors.push('Webhook URL måste vara en giltig URL')
  }
}

function validateCalendarConfig(settings: Record<string, unknown>, errors: string[]): void {
  if (settings.serverUrl && !isValidUrl(String(settings.serverUrl))) {
    errors.push('Server URL måste vara en giltig URL')
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/
  return domainRegex.test(domain)
}

/**
 * Get integration status display text in Swedish
 */
export function getIntegrationStatusText(status: IntegrationStatus): string {
  const statusTexts = {
    active: 'Aktiv',
    inactive: 'Inaktiv',
    error: 'Fel',
    pending: 'Väntar'
  }
  return statusTexts[status]
}

/**
 * Get integration type display text in Swedish
 */
export function getIntegrationTypeText(type: IntegrationType): string {
  const typeTexts = {
    sso: 'Enkel inloggning (SSO)',
    lms: 'Lärplattform (LMS)',
    calendar: 'Schema',
    sis: 'Elevregister (SIS)'
  }
  return typeTexts[type]
}

/**
 * Check if integration requires GDPR consent
 */
export function requiresGDPRConsent(integration: Integration): boolean {
  // SSO and SIS integrations that sync personal data require consent
  if (integration.type === 'sso' || integration.type === 'sis') {
    return true
  }

  // LMS integrations that auto-sync also require consent
  if (integration.type === 'lms' && integration.settings.autoSync) {
    return true
  }

  return false
}

/**
 * Mock service functions for development
 */
export class IntegrationService {
  static async getIntegrations(schoolAccountId: string): Promise<Integration[]> {
    // Mock data for development
    return []
  }

  static async createIntegration(integration: Omit<BaseIntegration, 'id' | 'configuredAt' | 'status'>): Promise<Integration> {
    // Mock implementation
    const newIntegration: Integration = {
      ...integration,
      id: `int_${Date.now()}`,
      configuredAt: new Date(),
      status: 'pending'
    } as Integration

    return newIntegration
  }

  static async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    // Mock implementation
    throw new Error('Not implemented yet')
  }

  static async deleteIntegration(id: string): Promise<void> {
    // Mock implementation
    console.log(`Deleting integration ${id}`)
  }

  static async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
    // Mock implementation
    return {
      success: true,
      message: 'Integrationen fungerar korrekt'
    }
  }

  static async syncClassLists(integrationId: string): Promise<ClassListImport> {
    // Mock implementation
    return {
      id: `import_${Date.now()}`,
      integrationId,
      schoolAccountId: 'school_1',
      source: 'sis_sync',
      status: 'pending',
      totalStudents: 0,
      processedStudents: 0,
      failedStudents: 0,
      createdAt: new Date(),
      importedClasses: []
    }
  }

  static async exportResults(
    integrationId: string,
    quizIds: string[],
    format: 'native' | 'csv' | 'xlsx' | 'pdf'
  ): Promise<ExportOperation> {
    // Mock implementation
    return {
      id: `export_${Date.now()}`,
      integrationId,
      type: 'quiz_results',
      targetSystem: 'google_classroom',
      status: 'pending',
      quizIds,
      format,
      createdBy: 'user_1',
      createdAt: new Date(),
      exportedRecords: 0,
      failedRecords: 0
    }
  }
}

/**
 * SSO provider specific functions
 */
export class SSOService {
  static buildSAMLRequest(entityId: string, ssoUrl: string): string {
    // Mock SAML request generation
    return `<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="request_${Date.now()}" Version="2.0" IssueInstant="${new Date().toISOString()}" Destination="${ssoUrl}"><saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${entityId}</saml:Issuer></samlp:AuthnRequest>`
  }

  static validateSAMLResponse(response: string, certificate: string): { isValid: boolean; userData?: any; error?: string } {
    // Mock SAML response validation
    try {
      // In real implementation, this would use a SAML library
      return {
        isValid: true,
        userData: {
          email: 'user@school.se',
          firstName: 'Test',
          lastName: 'Användare',
          role: 'lärare'
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Ogiltigt SAML-svar'
      }
    }
  }
}

/**
 * LMS provider specific functions
 */
export class LMSService {
  static async exportToGoogleClassroom(
    integration: any,
    quizData: any
  ): Promise<{ success: boolean; message: string; exportId?: string }> {
    // Mock Google Classroom export
    return {
      success: true,
      message: 'Quiz-resultat exporterade till Google Classroom',
      exportId: `gc_export_${Date.now()}`
    }
  }

  static async exportToMicrosoftTeams(
    integration: any,
    quizData: any
  ): Promise<{ success: boolean; message: string; exportId?: string }> {
    // Mock Microsoft Teams export
    return {
      success: true,
      message: 'Quiz-resultat exporterade till Microsoft Teams',
      exportId: `teams_export_${Date.now()}`
    }
  }
}

/**
 * Calendar provider specific functions
 */
export class CalendarService {
  static async syncWithSkola24(
    integration: any
  ): Promise<{ success: boolean; message: string; eventsImported?: number }> {
    // Mock Skola24 sync
    return {
      success: true,
      message: 'Schema synkroniserat från Skola24',
      eventsImported: 15
    }
  }

  static generateICalEvent(
    title: string,
    startTime: Date,
    endTime: Date,
    description?: string
  ): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z'
    }

    return [
      'BEGIN:VEVENT',
      `UID:${Date.now()}@skolapp.se`,
      `DTSTART:${formatDate(startTime)}`,
      `DTEND:${formatDate(endTime)}`,
      `SUMMARY:${title}`,
      description ? `DESCRIPTION:${description}` : '',
      'END:VEVENT'
    ].filter(Boolean).join('\r\n')
  }
}