// Data retention service for managing session and quiz data based on subscription plans
import { type User, type DataRetentionMode } from '@/types/auth'
import { type QuizResult, type QuizSession, type Student } from '@/types/quiz'

// Storage keys for different data types
const STORAGE_KEYS = {
  QUIZ_RESULTS: 'skolapp_quiz_results',
  QUIZ_SESSIONS: 'skolapp_quiz_sessions', 
  STUDENT_DATA: 'skolapp_student_data',
  SESSION_CLEANUP: 'skolapp_session_cleanup',
} as const

// Data retention configuration
const RETENTION_CONFIG = {
  korttid: {
    maxSessionDurationMs: 4 * 60 * 60 * 1000, // 4 hours
    cleanupIntervalMs: 30 * 60 * 1000, // 30 minutes
    retainAfterSessionMs: 0, // Immediate cleanup after session ends
  },
  långtid: {
    maxSessionDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    cleanupIntervalMs: 60 * 60 * 1000, // 1 hour
    retainAfterSessionMs: 365 * 24 * 60 * 60 * 1000, // 1 year (or until consent withdrawn)
  },
} as const

export interface SessionData {
  id: string
  userId?: string
  guestId?: string
  dataRetentionMode: DataRetentionMode
  createdAt: Date
  lastActivity: Date
  scheduledCleanup?: Date
  quizResults: QuizResult[]
  studentData?: Student
  hasValidConsent?: boolean
}

export interface CleanupJob {
  id: string
  sessionId: string
  scheduledFor: Date
  retentionMode: DataRetentionMode
  reason: 'session_timeout' | 'consent_withdrawn' | 'user_request' | 'policy_change'
}

class DataRetentionService {
  private cleanupJobs: CleanupJob[] = []
  private cleanupInterval?: NodeJS.Timeout

  constructor() {
    this.loadCleanupJobs()
    this.startCleanupInterval()
  }

  /**
   * Create a new session with appropriate data retention settings
   */
  createSession(
    userId: string | undefined,
    guestId: string | undefined,
    dataRetentionMode: DataRetentionMode,
    hasValidConsent?: boolean
  ): SessionData {
    const now = new Date()
    const config = RETENTION_CONFIG[dataRetentionMode]
    
    const session: SessionData = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      guestId,
      dataRetentionMode,
      createdAt: now,
      lastActivity: now,
      quizResults: [],
      hasValidConsent,
    }

    // Schedule cleanup based on retention mode
    if (dataRetentionMode === 'korttid') {
      // For short-term mode, schedule immediate cleanup after session ends
      session.scheduledCleanup = new Date(now.getTime() + config.maxSessionDurationMs)
      this.scheduleCleanup(session.id, session.scheduledCleanup, dataRetentionMode, 'session_timeout')
    } else if (dataRetentionMode === 'långtid' && !hasValidConsent) {
      // For long-term mode without consent, treat as short-term
      session.scheduledCleanup = new Date(now.getTime() + RETENTION_CONFIG.korttid.maxSessionDurationMs)
      this.scheduleCleanup(session.id, session.scheduledCleanup, 'korttid', 'session_timeout')
    }

    this.saveSession(session)
    return session
  }

  /**
   * Update session activity and extend cleanup if needed
   */
  updateSessionActivity(sessionId: string): void {
    const session = this.getSession(sessionId)
    if (!session) return

    session.lastActivity = new Date()
    
    // For short-term sessions, extend the cleanup time
    if (session.dataRetentionMode === 'korttid' || !session.hasValidConsent) {
      const config = RETENTION_CONFIG.korttid
      const newCleanupTime = new Date(session.lastActivity.getTime() + config.maxSessionDurationMs)
      
      if (!session.scheduledCleanup || newCleanupTime > session.scheduledCleanup) {
        session.scheduledCleanup = newCleanupTime
        this.rescheduleCleanup(sessionId, newCleanupTime)
      }
    }

    this.saveSession(session)
  }

  /**
   * Add quiz result to session
   */
  addQuizResult(sessionId: string, quizResult: QuizResult): void {
    const session = this.getSession(sessionId)
    if (!session) return

    session.quizResults.push(quizResult)
    session.lastActivity = new Date()
    
    this.saveSession(session)
    this.updateSessionActivity(sessionId)
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.QUIZ_SESSIONS}_${sessionId}`)
      if (!stored) return null
      
      const session = JSON.parse(stored) as SessionData
      
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt)
      session.lastActivity = new Date(session.lastActivity)
      if (session.scheduledCleanup) {
        session.scheduledCleanup = new Date(session.scheduledCleanup)
      }
      
      return session
    } catch (error) {
      console.error('Error loading session:', error)
      return null
    }
  }

  /**
   * Schedule session cleanup
   */
  private scheduleCleanup(
    sessionId: string, 
    scheduledFor: Date, 
    retentionMode: DataRetentionMode,
    reason: CleanupJob['reason']
  ): void {
    const cleanupJob: CleanupJob = {
      id: `cleanup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      scheduledFor,
      retentionMode,
      reason,
    }

    this.cleanupJobs.push(cleanupJob)
    this.saveCleanupJobs()
  }

  /**
   * Reschedule existing cleanup job
   */
  private rescheduleCleanup(sessionId: string, newTime: Date): void {
    const jobIndex = this.cleanupJobs.findIndex(job => job.sessionId === sessionId)
    if (jobIndex >= 0) {
      this.cleanupJobs[jobIndex].scheduledFor = newTime
      this.saveCleanupJobs()
    }
  }

  /**
   * Process pending cleanup jobs
   */
  private processCleanupJobs(): void {
    const now = new Date()
    const jobsToProcess = this.cleanupJobs.filter(job => job.scheduledFor <= now)
    
    for (const job of jobsToProcess) {
      this.executeCleanup(job)
    }

    // Remove processed jobs
    this.cleanupJobs = this.cleanupJobs.filter(job => job.scheduledFor > now)
    this.saveCleanupJobs()
  }

  /**
   * Execute cleanup for a specific job
   */
  private executeCleanup(job: CleanupJob): void {
    const session = this.getSession(job.sessionId)
    if (!session) return

    console.log(`[DataRetention] Cleaning up session ${job.sessionId} (reason: ${job.reason})`)

    // Remove session data from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_KEYS.QUIZ_SESSIONS}_${job.sessionId}`)
      
      // Remove associated quiz results if short-term
      if (job.retentionMode === 'korttid') {
        session.quizResults.forEach(result => {
          localStorage.removeItem(`${STORAGE_KEYS.QUIZ_RESULTS}_${result.id}`)
        })
      }

      // Remove student data if guest
      if (session.guestId) {
        localStorage.removeItem(`${STORAGE_KEYS.STUDENT_DATA}_${session.guestId}`)
      }
    }

    // Log cleanup for audit trail
    this.logCleanupAction(job, session)
  }

  /**
   * Log cleanup action for audit trail
   */
  private logCleanupAction(job: CleanupJob, session: SessionData): void {
    const auditLog = {
      timestamp: new Date(),
      action: 'data_cleanup',
      sessionId: job.sessionId,
      userId: session.userId,
      guestId: session.guestId,
      retentionMode: job.retentionMode,
      reason: job.reason,
      dataTypes: ['quiz_results', 'session_data', 'student_data'],
    }

    // In a real app, this would be sent to an audit logging service
    console.log('[DataRetention] Audit Log:', auditLog)
  }

  /**
   * Handle consent withdrawal - immediate cleanup of long-term data
   */
  withdrawConsent(userId: string): void {
    // Find all sessions for this user
    if (typeof window === 'undefined') return

    const sessionKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(STORAGE_KEYS.QUIZ_SESSIONS)
    )

    for (const key of sessionKeys) {
      try {
        const sessionData = JSON.parse(localStorage.getItem(key) || '{}')
        if (sessionData.userId === userId) {
          this.scheduleCleanup(
            sessionData.id, 
            new Date(), // Immediate cleanup
            sessionData.dataRetentionMode,
            'consent_withdrawn'
          )
        }
      } catch (error) {
        console.error('Error processing session for consent withdrawal:', error)
      }
    }

    // Process cleanup jobs immediately
    this.processCleanupJobs()
  }

  /**
   * Save session to storage
   */
  private saveSession(session: SessionData): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(
        `${STORAGE_KEYS.QUIZ_SESSIONS}_${session.id}`,
        JSON.stringify(session)
      )
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  /**
   * Load cleanup jobs from storage
   */
  private loadCleanupJobs(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_CLEANUP)
      if (stored) {
        this.cleanupJobs = JSON.parse(stored).map((job: any) => ({
          ...job,
          scheduledFor: new Date(job.scheduledFor)
        }))
      }
    } catch (error) {
      console.error('Error loading cleanup jobs:', error)
      this.cleanupJobs = []
    }
  }

  /**
   * Save cleanup jobs to storage
   */
  private saveCleanupJobs(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_CLEANUP, JSON.stringify(this.cleanupJobs))
    } catch (error) {
      console.error('Error saving cleanup jobs:', error)
    }
  }

  /**
   * Start the cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Run cleanup every 30 minutes
    this.cleanupInterval = setInterval(() => {
      this.processCleanupJobs()
    }, 30 * 60 * 1000)

    // Run initial cleanup
    this.processCleanupJobs()
  }

  /**
   * Get retention statistics for debugging/admin
   */
  getRetentionStats(): {
    activeSessions: number
    pendingCleanups: number
    shortTermSessions: number
    longTermSessions: number
  } {
    if (typeof window === 'undefined') {
      return { activeSessions: 0, pendingCleanups: 0, shortTermSessions: 0, longTermSessions: 0 }
    }

    const sessionKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(STORAGE_KEYS.QUIZ_SESSIONS)
    )

    let shortTermSessions = 0
    let longTermSessions = 0

    for (const key of sessionKeys) {
      try {
        const session = JSON.parse(localStorage.getItem(key) || '{}')
        if (session.dataRetentionMode === 'korttid') {
          shortTermSessions++
        } else {
          longTermSessions++
        }
      } catch (error) {
        // Ignore malformed sessions
      }
    }

    return {
      activeSessions: sessionKeys.length,
      pendingCleanups: this.cleanupJobs.length,
      shortTermSessions,
      longTermSessions,
    }
  }

  /**
   * Cleanup on service shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Export singleton instance
export const dataRetentionService = new DataRetentionService()

// Export utility functions
export function createSessionWithRetention(
  user: User | null,
  guestId?: string
): SessionData {
  const dataRetentionMode = user?.dataRetentionMode || 'korttid'
  const hasValidConsent = user?.hasParentalConsent || false
  
  return dataRetentionService.createSession(
    user?.id,
    guestId,
    dataRetentionMode,
    hasValidConsent
  )
}

export function getDataRetentionMode(user: User | null): DataRetentionMode {
  return user?.dataRetentionMode || 'korttid'
}

export function requiresConsentForRetention(user: User | null): boolean {
  const mode = getDataRetentionMode(user)
  return mode === 'långtid' && (user?.isMinor || false)
}