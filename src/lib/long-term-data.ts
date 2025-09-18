// Long-term data storage service with consent management
import { type User, type ConsentRecord, type ConsentStatus, type ConsentAuditEntry } from '@/types/auth'
import { type QuizResult } from '@/types/quiz'

// Storage keys for long-term data
const LONGTERM_STORAGE_KEYS = {
  USER_DATA: 'skolapp_longterm_users',
  QUIZ_RESULTS: 'skolapp_longterm_results',
  CONSENT_RECORDS: 'skolapp_consent_records',
  ANALYTICS_DATA: 'skolapp_analytics_data',
} as const

export interface LongTermSession {
  id: string
  userId: string
  createdAt: Date
  lastActivity: Date
  consentRecordId?: string
  isActive: boolean
  dataTypes: ('quiz_results' | 'analytics' | 'progress_tracking')[]
}

export interface AnalyticsData {
  id: string
  userId: string
  sessionId: string
  quizId: string
  metrics: {
    timeSpent: number
    questionsAnswered: number
    correctAnswers: number
    incorrectAnswers: number
    averageResponseTime: number
  }
  progressData: {
    skillsImproved: string[]
    strugglingAreas: string[]
    overallProgress: number
  }
  timestamp: Date
}

class LongTermDataService {
  /**
   * Initialize long-term storage for a user with valid consent
   */
  initializeLongTermStorage(
    user: User,
    consentRecord: ConsentRecord,
    dataTypes: LongTermSession['dataTypes'] = ['quiz_results', 'analytics', 'progress_tracking']
  ): LongTermSession {
    if (!this.hasValidConsent(user.id)) {
      throw new Error('Valid consent required for long-term storage initialization')
    }

    const session: LongTermSession = {
      id: `longterm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      consentRecordId: consentRecord.id,
      isActive: true,
      dataTypes
    }

    this.saveLongTermSession(session)
    
    // Log initialization for audit
    this.addConsentAuditEntry(consentRecord.id, 'created', 'Long-term storage session initialized')
    
    return session
  }

  /**
   * Store quiz result in long-term storage
   */
  storeLongTermQuizResult(
    userId: string,
    quizResult: QuizResult,
    sessionId?: string
  ): void {
    if (!this.hasValidConsent(userId)) {
      console.warn('[LongTermData] Attempted to store quiz result without valid consent')
      return
    }

    const storageKey = `${LONGTERM_STORAGE_KEYS.QUIZ_RESULTS}_${userId}`
    
    try {
      const existingResults = this.getLongTermQuizResults(userId)
      const updatedResults = [...existingResults, quizResult]
      
      localStorage.setItem(storageKey, JSON.stringify(updatedResults))
      
      // Update session activity
      if (sessionId) {
        this.updateLongTermSessionActivity(sessionId)
      }
      
      // Quiz result stored successfully
    } catch (error) {
      console.error('[LongTermData] Error storing quiz result:', error)
    }
  }

  /**
   * Store analytics data for long-term tracking
   */
  storeAnalyticsData(analyticsData: AnalyticsData): void {
    if (!this.hasValidConsent(analyticsData.userId)) {
      console.warn('[LongTermData] Attempted to store analytics without valid consent')
      return
    }

    const storageKey = `${LONGTERM_STORAGE_KEYS.ANALYTICS_DATA}_${analyticsData.userId}`
    
    try {
      const existingData = this.getAnalyticsData(analyticsData.userId)
      const updatedData = [...existingData, analyticsData]
      
      // Keep only last 1000 analytics entries per user to prevent storage bloat
      if (updatedData.length > 1000) {
        updatedData.splice(0, updatedData.length - 1000)
      }
      
      localStorage.setItem(storageKey, JSON.stringify(updatedData))
      
      // Analytics data stored successfully
    } catch (error) {
      console.error('[LongTermData] Error storing analytics data:', error)
    }
  }

  /**
   * Get quiz results for a user from long-term storage
   */
  getLongTermQuizResults(userId: string): QuizResult[] {
    if (typeof window === 'undefined') return []

    const storageKey = `${LONGTERM_STORAGE_KEYS.QUIZ_RESULTS}_${userId}`
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return []
      
      const results = JSON.parse(stored) as QuizResult[]
      
      // Convert date strings back to Date objects
      return results.map(result => ({
        ...result,
        startedAt: new Date(result.startedAt),
        completedAt: result.completedAt ? new Date(result.completedAt) : undefined
      }))
    } catch (error) {
      console.error('[LongTermData] Error loading quiz results:', error)
      return []
    }
  }

  /**
   * Get analytics data for a user
   */
  getAnalyticsData(userId: string): AnalyticsData[] {
    if (typeof window === 'undefined') return []

    const storageKey = `${LONGTERM_STORAGE_KEYS.ANALYTICS_DATA}_${userId}`
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return []
      
      const data = JSON.parse(stored) as AnalyticsData[]
      
      // Convert date strings back to Date objects
      return data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
    } catch (error) {
      console.error('[LongTermData] Error loading analytics data:', error)
      return []
    }
  }

  /**
   * Check if user has valid consent for long-term storage
   */
  hasValidConsent(userId: string): boolean {
    const consentRecord = this.getConsentRecord(userId)
    if (!consentRecord) return false
    
    return consentRecord.status === 'approved' && 
           consentRecord.expiresAt > new Date() &&
           consentRecord.consentType === 'data_retention'
  }

  /**
   * Get consent record for a user
   */
  getConsentRecord(userId: string): ConsentRecord | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(LONGTERM_STORAGE_KEYS.CONSENT_RECORDS)
      if (!stored) return null
      
      const records = JSON.parse(stored) as ConsentRecord[]
      const userRecord = records.find(record => 
        record.studentId === userId && record.consentType === 'data_retention'
      )
      
      if (!userRecord) return null
      
      // Convert date strings back to Date objects
      return {
        ...userRecord,
        requestedAt: new Date(userRecord.requestedAt),
        respondedAt: userRecord.respondedAt ? new Date(userRecord.respondedAt) : undefined,
        expiresAt: new Date(userRecord.expiresAt),
        auditLog: userRecord.auditLog.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      }
    } catch (error) {
      console.error('[LongTermData] Error loading consent record:', error)
      return null
    }
  }

  /**
   * Create a new consent record
   */
  createConsentRecord(
    studentId: string,
    parentEmail: string,
    parentName: string,
    consentMethod: ConsentRecord['consentMethod'] = 'email_link'
  ): ConsentRecord {
    const now = new Date()
    const consentRecord: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      parentEmail,
      parentName,
      consentType: 'data_retention',
      status: 'pending',
      requestedAt: now,
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      consentMethod,
      auditLog: [{
        id: `audit_${Date.now()}`,
        timestamp: now,
        action: 'created',
        details: `Consent request created via ${consentMethod}`,
      }]
    }

    this.saveConsentRecord(consentRecord)
    return consentRecord
  }

  /**
   * Update consent status
   */
  updateConsentStatus(
    consentId: string,
    status: ConsentStatus,
    ipAddress?: string,
    userAgent?: string
  ): boolean {
    try {
      const stored = localStorage.getItem(LONGTERM_STORAGE_KEYS.CONSENT_RECORDS)
      if (!stored) return false
      
      const records = JSON.parse(stored) as ConsentRecord[]
      const recordIndex = records.findIndex(r => r.id === consentId)
      
      if (recordIndex === -1) return false
      
      const record = records[recordIndex]
      const now = new Date()
      
      record.status = status
      record.respondedAt = now
      record.ipAddress = ipAddress
      record.userAgent = userAgent
      
      // Add audit entry
      record.auditLog.push({
        id: `audit_${Date.now()}`,
        timestamp: now,
        action: status === 'approved' ? 'approved' : 'denied',
        details: `Consent ${status} by parent`,
        ipAddress,
        userAgent
      })
      
      localStorage.setItem(LONGTERM_STORAGE_KEYS.CONSENT_RECORDS, JSON.stringify(records))
      
      // If consent withdrawn, trigger data cleanup
      if (status === 'denied') {
        this.handleConsentWithdrawal(record.studentId)
      }
      
      return true
    } catch (error) {
      console.error('[LongTermData] Error updating consent status:', error)
      return false
    }
  }

  /**
   * Handle consent withdrawal - immediate cleanup
   */
  private handleConsentWithdrawal(userId: string): void {
    // Process consent withdrawal for user
    
    // Remove all long-term data for user
    const keysToRemove = [
      `${LONGTERM_STORAGE_KEYS.QUIZ_RESULTS}_${userId}`,
      `${LONGTERM_STORAGE_KEYS.ANALYTICS_DATA}_${userId}`,
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Deactivate long-term sessions
    this.deactivateLongTermSessions(userId)
    
    // Data cleanup completed
  }

  /**
   * Save consent record
   */
  private saveConsentRecord(consentRecord: ConsentRecord): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(LONGTERM_STORAGE_KEYS.CONSENT_RECORDS)
      const records = stored ? JSON.parse(stored) as ConsentRecord[] : []
      
      const existingIndex = records.findIndex(r => r.id === consentRecord.id)
      if (existingIndex >= 0) {
        records[existingIndex] = consentRecord
      } else {
        records.push(consentRecord)
      }
      
      localStorage.setItem(LONGTERM_STORAGE_KEYS.CONSENT_RECORDS, JSON.stringify(records))
    } catch (error) {
      console.error('[LongTermData] Error saving consent record:', error)
    }
  }

  /**
   * Add audit entry to consent record
   */
  private addConsentAuditEntry(
    consentId: string,
    action: ConsentAuditEntry['action'],
    details: string,
    ipAddress?: string,
    userAgent?: string
  ): void {
    try {
      const stored = localStorage.getItem(LONGTERM_STORAGE_KEYS.CONSENT_RECORDS)
      if (!stored) return
      
      const records = JSON.parse(stored) as ConsentRecord[]
      const record = records.find(r => r.id === consentId)
      
      if (record) {
        record.auditLog.push({
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          action,
          details,
          ipAddress,
          userAgent
        })
        
        localStorage.setItem(LONGTERM_STORAGE_KEYS.CONSENT_RECORDS, JSON.stringify(records))
      }
    } catch (error) {
      console.error('[LongTermData] Error adding consent audit entry:', error)
    }
  }

  /**
   * Save long-term session
   */
  private saveLongTermSession(session: LongTermSession): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(`longterm_session_${session.id}`, JSON.stringify(session))
    } catch (error) {
      console.error('[LongTermData] Error saving long-term session:', error)
    }
  }

  /**
   * Update session activity
   */
  private updateLongTermSessionActivity(sessionId: string): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(`longterm_session_${sessionId}`)
      if (stored) {
        const session = JSON.parse(stored) as LongTermSession
        session.lastActivity = new Date()
        localStorage.setItem(`longterm_session_${sessionId}`, JSON.stringify(session))
      }
    } catch (error) {
      console.error('[LongTermData] Error updating session activity:', error)
    }
  }

  /**
   * Deactivate long-term sessions for a user
   */
  private deactivateLongTermSessions(userId: string): void {
    if (typeof window === 'undefined') return
    
    const sessionKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('longterm_session_')
    )
    
    for (const key of sessionKeys) {
      try {
        const session = JSON.parse(localStorage.getItem(key) || '{}') as LongTermSession
        if (session.userId === userId) {
          session.isActive = false
          localStorage.setItem(key, JSON.stringify(session))
        }
      } catch (error) {
        console.error('[LongTermData] Error deactivating session:', error)
      }
    }
  }

  /**
   * Export all user data for GDPR compliance
   */
  exportUserData(userId: string): {
    quizResults: QuizResult[]
    analyticsData: AnalyticsData[]
    consentRecord: ConsentRecord | null
    exportedAt: Date
  } {
    return {
      quizResults: this.getLongTermQuizResults(userId),
      analyticsData: this.getAnalyticsData(userId),
      consentRecord: this.getConsentRecord(userId),
      exportedAt: new Date()
    }
  }
}

// Export singleton instance
export const longTermDataService = new LongTermDataService()

// Export utility functions
export function initializeLongTermStorageForUser(user: User): LongTermSession | null {
  if (user.dataRetentionMode !== 'långtid') {
    return null
  }

  const existingConsent = longTermDataService.getConsentRecord(user.id)
  if (!existingConsent || existingConsent.status !== 'approved') {
    return null
  }

  return longTermDataService.initializeLongTermStorage(user, existingConsent)
}

export function canStoreLongTermData(user: User): boolean {
  return user.dataRetentionMode === 'långtid' && 
         longTermDataService.hasValidConsent(user.id)
}