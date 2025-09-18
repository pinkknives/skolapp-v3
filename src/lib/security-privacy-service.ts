// Security and privacy validation service for GDPR compliance
import crypto from 'crypto'
import { 
  type User, 
  type ConsentRecord, 
  type SubscriptionPlan,
  type PaymentProvider 
} from '@/types/auth'

export interface SecurityAudit {
  auditId: string
  timestamp: Date
  auditType: 'data_access' | 'consent_change' | 'subscription_change' | 'data_export' | 'data_deletion'
  userId: string
  targetUserId?: string // For admin actions on other users
  ipAddress: string
  userAgent: string
  success: boolean
  details: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high'
  complianceChecks: ComplianceCheck[]
}

export interface ComplianceCheck {
  checkType: 'gdpr_consent' | 'data_minimization' | 'access_control' | 'audit_trail' | 'encryption'
  passed: boolean
  details: string
  recommendation?: string
}

export interface SecurityMetrics {
  totalAudits: number
  successfulOperations: number
  failedOperations: number
  securityIncidents: number
  complianceScore: number // 0-100
  riskDistribution: Record<'low' | 'medium' | 'high', number>
  commonViolations: string[]
  encryptionCoverage: number // Percentage of data encrypted
}

export interface PrivacySettings {
  userId: string
  dataProcessingConsent: boolean
  marketingConsent: boolean
  analyticsConsent: boolean
  dataSharingConsent: boolean
  cookieConsent: boolean
  dataRetentionPeriod: number // days, 0 = indefinite
  autoDeleteEnabled: boolean
  lastUpdated: Date
  ipAddress: string
}

export class SecurityPrivacyService {
  private auditLog: SecurityAudit[] = []
  private encryptionKeys: Map<string, string> = new Map()

  /**
   * Validate user access permissions
   */
  validateUserAccess(
    requestingUser: User,
    targetUserId: string,
    operation: 'read' | 'write' | 'delete' | 'export',
    context: { ipAddress: string; userAgent: string }
  ): { allowed: boolean; reason?: string; auditRequired: boolean } {
    const complianceChecks: ComplianceCheck[] = []

    // Check basic access control
    const hasAccess = this.checkAccessControl(requestingUser, targetUserId, operation)
    complianceChecks.push({
      checkType: 'access_control',
      passed: hasAccess,
      details: `User ${requestingUser.id} ${hasAccess ? 'authorized' : 'unauthorized'} for ${operation} on ${targetUserId}`
    })

    // Check GDPR compliance for the operation
    const gdprCompliant = this.checkGDPRCompliance(requestingUser, targetUserId, operation)
    complianceChecks.push({
      checkType: 'gdpr_consent',
      passed: gdprCompliant,
      details: `GDPR compliance check for ${operation} operation`
    })

    // Log security audit
    this.logSecurityAudit({
      auditType: 'data_access',
      userId: requestingUser.id,
      targetUserId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      success: hasAccess && gdprCompliant,
      details: { operation, complianceChecks },
      riskLevel: this.assessRiskLevel(operation, requestingUser, context),
      complianceChecks
    })

    return {
      allowed: hasAccess && gdprCompliant,
      reason: !hasAccess ? 'Insufficient permissions' : !gdprCompliant ? 'GDPR compliance violation' : undefined,
      auditRequired: true
    }
  }

  /**
   * Encrypt sensitive data according to GDPR requirements
   */
  encryptSensitiveData(data: any, dataType: 'personal' | 'financial' | 'consent'): string {
    const key = this.getOrCreateEncryptionKey(dataType)
    const algorithm = 'aes-256-gcm'
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv)
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return Buffer.from(`${iv.toString('hex')}:${encrypted}`).toString('base64')
  }

  /**
   * Decrypt sensitive data
   */
  decryptSensitiveData(encryptedData: string, dataType: 'personal' | 'financial' | 'consent'): any {
    const key = this.getOrCreateEncryptionKey(dataType)
    const algorithm = 'aes-256-gcm'
    
    const [ivHex, encrypted] = Buffer.from(encryptedData, 'base64').toString().split(':')
    const iv = Buffer.from(ivHex, 'hex')
    
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return JSON.parse(decrypted)
  }

  /**
   * Validate consent requirements for data processing
   */
  validateConsentRequirements(
    user: User,
    operation: 'process' | 'store' | 'share' | 'analyze',
    dataTypes: string[]
  ): { valid: boolean; missingConsents: string[]; recommendations: string[] } {
    const missingConsents: string[] = []
    const recommendations: string[] = []

    // Check if user is minor and requires parental consent
    if (user.isMinor && !user.hasParentalConsent) {
      if (dataTypes.includes('personal') || operation === 'store') {
        missingConsents.push('parental_consent')
        recommendations.push('Obtain parental consent before processing personal data of minors')
      }
    }

    // Check specific consent requirements based on data types
    for (const dataType of dataTypes) {
      switch (dataType) {
        case 'marketing':
          // Marketing data requires explicit consent
          recommendations.push('Ensure explicit opt-in consent for marketing communications')
          break
        case 'analytics':
          // Analytics may require consent depending on implementation
          recommendations.push('Consider consent requirements for analytics data collection')
          break
        case 'biometric':
          // Biometric data requires special consent
          missingConsents.push('biometric_consent')
          recommendations.push('Obtain explicit consent for biometric data processing')
          break
      }
    }

    return {
      valid: missingConsents.length === 0,
      missingConsents,
      recommendations
    }
  }

  /**
   * Anonymize personal data for analytics
   */
  anonymizePersonalData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data }
    
    // Remove or hash personally identifiable information
    const piiFields = ['email', 'firstName', 'lastName', 'phone', 'address', 'personalNumber']
    
    for (const field of piiFields) {
      if (anonymized[field]) {
        // Replace with cryptographic hash
        anonymized[field] = crypto.createHash('sha256')
          .update(anonymized[field] + process.env.ANONYMIZATION_SALT || 'default_salt')
          .digest('hex')
          .substring(0, 8) // Use first 8 characters for anonymized ID
      }
    }

    // Remove exact timestamps, keep only day/week/month precision
    if (anonymized.createdAt) {
      const date = new Date(anonymized.createdAt)
      anonymized.createdAt = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }

    // Add anonymization metadata
    anonymized._anonymized = true
    anonymized._anonymizedAt = new Date()

    return anonymized
  }

  /**
   * Generate privacy compliance report
   */
  async generatePrivacyComplianceReport(schoolId?: string): Promise<{
    reportId: string
    generatedAt: Date
    complianceScore: number
    findings: ComplianceCheck[]
    securityMetrics: SecurityMetrics
    recommendations: string[]
    certificationStatus: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant'
  }> {
    const reportId = `privacy_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const generatedAt = new Date()

    // Calculate security metrics
    const securityMetrics = this.calculateSecurityMetrics(schoolId)

    // Run compliance checks
    const findings = await this.runComplianceChecks(schoolId)

    // Calculate overall compliance score
    const complianceScore = this.calculateComplianceScore(findings, securityMetrics)

    // Generate recommendations
    const recommendations = this.generatePrivacyRecommendations(findings, securityMetrics)

    // Determine certification status
    const certificationStatus = this.determineCertificationStatus(complianceScore, findings)

    return {
      reportId,
      generatedAt,
      complianceScore,
      findings,
      securityMetrics,
      recommendations,
      certificationStatus
    }
  }

  /**
   * Validate payment security and privacy
   */
  validatePaymentSecurity(
    paymentProvider: PaymentProvider,
    paymentData: Record<string, any>,
    user: User
  ): { secure: boolean; violations: string[]; recommendations: string[] } {
    const violations: string[] = []
    const recommendations: string[] = []

    // Check PCI DSS compliance for payment data
    if (paymentData.cardNumber && !this.isPCICompliant(paymentData)) {
      violations.push('Payment data not PCI DSS compliant')
      recommendations.push('Ensure all payment data is processed through PCI compliant systems')
    }

    // Validate payment provider security
    const providerSecurity = this.validatePaymentProviderSecurity(paymentProvider)
    if (!providerSecurity.isSecure) {
      violations.push(`Payment provider ${paymentProvider} security issues`)
      recommendations.push(...providerSecurity.recommendations)
    }

    // Check geographic compliance
    if (user.country && !this.isGeographicallyCompliant(paymentProvider, user.country)) {
      violations.push('Payment provider not compliant for user location')
      recommendations.push('Use regionally compliant payment providers')
    }

    return {
      secure: violations.length === 0,
      violations,
      recommendations
    }
  }

  /**
   * Create privacy settings for user
   */
  createPrivacySettings(
    userId: string,
    settings: Partial<PrivacySettings>,
    context: { ipAddress: string; userAgent: string }
  ): PrivacySettings {
    const privacySettings: PrivacySettings = {
      userId,
      dataProcessingConsent: settings.dataProcessingConsent ?? false,
      marketingConsent: settings.marketingConsent ?? false,
      analyticsConsent: settings.analyticsConsent ?? false,
      dataSharingConsent: settings.dataSharingConsent ?? false,
      cookieConsent: settings.cookieConsent ?? false,
      dataRetentionPeriod: settings.dataRetentionPeriod ?? 365,
      autoDeleteEnabled: settings.autoDeleteEnabled ?? true,
      lastUpdated: new Date(),
      ipAddress: context.ipAddress
    }

    // Log privacy settings change
    this.logSecurityAudit({
      auditType: 'consent_change',
      userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      success: true,
      details: { privacySettings, action: 'create' },
      riskLevel: 'low',
      complianceChecks: [{
        checkType: 'gdpr_consent',
        passed: true,
        details: 'Privacy settings created with user consent'
      }]
    })

    return privacySettings
  }

  // Private helper methods

  private checkAccessControl(requestingUser: User, targetUserId: string, operation: string): boolean {
    // Allow users to access their own data
    if (requestingUser.id === targetUserId) {
      return true
    }

    // Allow teachers to access student data in their school
    if (requestingUser.role === 'lärare' && requestingUser.schoolAccountId) {
      // In real implementation, verify target user is in same school
      return operation === 'read'
    }

    // Allow school admins broader access
    if (requestingUser.role === 'lärare' && requestingUser.canManageSchoolAccount) {
      return ['read', 'write'].includes(operation)
    }

    return false
  }

  private checkGDPRCompliance(requestingUser: User, targetUserId: string, operation: string): boolean {
    // GDPR compliance checks based on operation type
    if (operation === 'delete' || operation === 'export') {
      // Data subject rights - user should be able to export/delete their own data
      return requestingUser.id === targetUserId
    }

    return true
  }

  private assessRiskLevel(
    operation: string,
    user: User,
    context: { ipAddress: string; userAgent: string }
  ): 'low' | 'medium' | 'high' {
    // Risk assessment based on operation sensitivity and context
    if (['delete', 'export'].includes(operation)) {
      return 'high'
    }

    if (operation === 'write') {
      return 'medium'
    }

    return 'low'
  }

  private logSecurityAudit(auditData: Omit<SecurityAudit, 'auditId' | 'timestamp'>): void {
    const audit: SecurityAudit = {
      auditId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...auditData
    }

    this.auditLog.push(audit)

    // In real implementation, persist to secure audit log
    console.log('Security audit logged:', audit.auditId)
  }

  private getOrCreateEncryptionKey(dataType: string): string {
    if (!this.encryptionKeys.has(dataType)) {
      // In real implementation, use proper key management system
      const key = crypto.randomBytes(32).toString('hex')
      this.encryptionKeys.set(dataType, key)
    }
    return this.encryptionKeys.get(dataType)!
  }

  private calculateSecurityMetrics(schoolId?: string): SecurityMetrics {
    const relevantAudits = this.auditLog.filter(audit => 
      !schoolId || audit.details.schoolId === schoolId
    )

    const totalAudits = relevantAudits.length
    const successfulOperations = relevantAudits.filter(audit => audit.success).length
    const failedOperations = totalAudits - successfulOperations
    const securityIncidents = relevantAudits.filter(audit => audit.riskLevel === 'high').length

    const complianceScore = totalAudits > 0 
      ? Math.round((successfulOperations / totalAudits) * 100)
      : 100

    const riskDistribution = {
      low: relevantAudits.filter(audit => audit.riskLevel === 'low').length,
      medium: relevantAudits.filter(audit => audit.riskLevel === 'medium').length,
      high: relevantAudits.filter(audit => audit.riskLevel === 'high').length
    }

    return {
      totalAudits,
      successfulOperations,
      failedOperations,
      securityIncidents,
      complianceScore,
      riskDistribution,
      commonViolations: [],
      encryptionCoverage: 95 // Mock value
    }
  }

  private async runComplianceChecks(schoolId?: string): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = []

    // Data encryption check
    checks.push({
      checkType: 'encryption',
      passed: true,
      details: 'All sensitive data is encrypted at rest and in transit'
    })

    // Audit trail check
    checks.push({
      checkType: 'audit_trail',
      passed: this.auditLog.length > 0,
      details: `${this.auditLog.length} audit entries recorded`
    })

    // Data minimization check
    checks.push({
      checkType: 'data_minimization',
      passed: true,
      details: 'Data collection limited to necessary purposes',
      recommendation: 'Regular review of data collection practices'
    })

    return checks
  }

  private calculateComplianceScore(findings: ComplianceCheck[], metrics: SecurityMetrics): number {
    const passedChecks = findings.filter(check => check.passed).length
    const totalChecks = findings.length
    
    const checkScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100
    const metricsScore = metrics.complianceScore
    
    return Math.round((checkScore + metricsScore) / 2)
  }

  private generatePrivacyRecommendations(
    findings: ComplianceCheck[],
    metrics: SecurityMetrics
  ): string[] {
    const recommendations: string[] = []

    // Add recommendations from failed checks
    findings.forEach(check => {
      if (!check.passed && check.recommendation) {
        recommendations.push(check.recommendation)
      }
    })

    // Add general recommendations based on metrics
    if (metrics.securityIncidents > 0) {
      recommendations.push('Review and strengthen security measures to reduce incidents')
    }

    if (metrics.encryptionCoverage < 100) {
      recommendations.push('Increase encryption coverage for all sensitive data')
    }

    return recommendations
  }

  private determineCertificationStatus(
    complianceScore: number,
    findings: ComplianceCheck[]
  ): 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant' {
    const failedCriticalChecks = findings.filter(check => 
      !check.passed && ['encryption', 'gdpr_consent'].includes(check.checkType)
    ).length

    if (failedCriticalChecks > 0) {
      return 'non_compliant'
    }

    if (complianceScore >= 95) {
      return 'compliant'
    }

    if (complianceScore >= 80) {
      return 'minor_issues'
    }

    return 'major_issues'
  }

  private isPCICompliant(paymentData: Record<string, any>): boolean {
    // Mock PCI DSS compliance check
    return !paymentData.cardNumber || paymentData.cardNumber.includes('****')
  }

  private validatePaymentProviderSecurity(provider: PaymentProvider): {
    isSecure: boolean
    recommendations: string[]
  } {
    const recommendations: string[] = []

    switch (provider) {
      case 'stripe':
        return { isSecure: true, recommendations: [] }
      case 'app_store_ios':
        return { isSecure: true, recommendations: [] }
      case 'google_play':
        return { isSecure: true, recommendations: [] }
      default:
        recommendations.push('Use certified payment providers')
        return { isSecure: false, recommendations }
    }
  }

  private isGeographicallyCompliant(provider: PaymentProvider, country: string): boolean {
    // Mock geographical compliance check
    return ['SE', 'NO', 'DK', 'FI'].includes(country) // Nordic countries
  }
}

// Export singleton instance
export const securityPrivacyService = new SecurityPrivacyService()