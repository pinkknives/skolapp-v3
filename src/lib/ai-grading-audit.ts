// Audit logging service for AI grading decisions
import { AIAssessment, TeacherDecision } from '@/types/quiz'

export interface AIGradingAuditEntry {
  id: string
  timestamp: Date
  sessionId: string
  teacherId: string
  action: 'ai_assessment_generated' | 'teacher_decision_made' | 'batch_action_performed'
  questionId: string
  questionType: string
  assessmentId?: string
  decisionId?: string
  details: {
    // AI Assessment details
    aiModel?: string
    confidence?: number
    suggestedScore?: number
    finalScore?: number
    
    // Teacher decision details
    decision?: 'approve' | 'edit' | 'reject'
    reasonForChange?: string
    
    // Batch action details
    batchAction?: string
    batchThreshold?: number
    batchCount?: number
    
    // Privacy and compliance
    hadPII?: boolean
    wasAnonymized?: boolean
    dataRetentionMode?: string
  }
  metadata?: {
    userAgent?: string
    ipAddress?: string // Only logged in accordance with GDPR requirements
    sessionDuration?: number
  }
}

export interface AIGradingStats {
  totalAssessments: number
  totalDecisions: number
  approvalRate: number
  averageConfidence: number
  mostCommonDecision: 'approve' | 'edit' | 'reject'
  averageProcessingTime: number
  questionTypeBreakdown: Record<string, number>
}

class AIGradingAuditService {
  private auditLog: AIGradingAuditEntry[] = []
  private readonly MAX_LOG_ENTRIES = 10000 // Prevent memory issues

  // Log AI assessment generation
  logAIAssessment(
    assessment: AIAssessment,
    sessionId: string,
    teacherId: string,
    hadPII: boolean = false,
    wasAnonymized: boolean = true
  ): void {
    const entry: AIGradingAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sessionId,
      teacherId,
      action: 'ai_assessment_generated',
      questionId: assessment.questionId,
      questionType: assessment.questionType,
      assessmentId: assessment.id,
      details: {
        aiModel: assessment.aiModel,
        confidence: assessment.confidence,
        suggestedScore: assessment.suggestedScore,
        hadPII,
        wasAnonymized
      }
    }

    this.addAuditEntry(entry)
  }

  // Log teacher decision
  logTeacherDecision(
    decision: TeacherDecision,
    assessment: AIAssessment,
    sessionId: string,
    reasonForChange?: string
  ): void {
    const entry: AIGradingAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sessionId,
      teacherId: decision.teacherId,
      action: 'teacher_decision_made',
      questionId: assessment.questionId,
      questionType: assessment.questionType,
      assessmentId: assessment.id,
      decisionId: decision.id,
      details: {
        decision: decision.decision,
        suggestedScore: assessment.suggestedScore,
        finalScore: decision.finalScore,
        reasonForChange
      }
    }

    this.addAuditEntry(entry)
  }

  // Log batch actions
  logBatchAction(
    sessionId: string,
    teacherId: string,
    action: string,
    threshold: number,
    count: number,
    affectedQuestions: string[]
  ): void {
    affectedQuestions.forEach(questionId => {
      const entry: AIGradingAuditEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        sessionId,
        teacherId,
        action: 'batch_action_performed',
        questionId,
        questionType: 'batch', // Special type for batch actions
        details: {
          batchAction: action,
          batchThreshold: threshold,
          batchCount: count
        }
      }

      this.addAuditEntry(entry)
    })
  }

  // Get audit log for a specific session
  getSessionAuditLog(sessionId: string): AIGradingAuditEntry[] {
    return this.auditLog.filter(entry => entry.sessionId === sessionId)
  }

  // Get audit log for a specific teacher
  getTeacherAuditLog(teacherId: string, limit: number = 100): AIGradingAuditEntry[] {
    return this.auditLog
      .filter(entry => entry.teacherId === teacherId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Generate statistics for a grading session
  generateSessionStats(sessionId: string): AIGradingStats {
    const sessionEntries = this.getSessionAuditLog(sessionId)
    const assessments = sessionEntries.filter(e => e.action === 'ai_assessment_generated')
    const decisions = sessionEntries.filter(e => e.action === 'teacher_decision_made')

    const approvals = decisions.filter(d => d.details.decision === 'approve').length
    const approvalRate = decisions.length > 0 ? approvals / decisions.length : 0

    const confidenceValues = assessments
      .map(a => a.details.confidence)
      .filter((c): c is number => c !== undefined)
    const averageConfidence = confidenceValues.length > 0 
      ? confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length 
      : 0

    // Count decisions by type
    const decisionCounts = decisions.reduce((acc, d) => {
      const decision = d.details.decision || 'unknown'
      acc[decision] = (acc[decision] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonDecision = Object.entries(decisionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as 'approve' | 'edit' | 'reject' || 'approve'

    // Question type breakdown
    const questionTypeBreakdown = assessments.reduce((acc, a) => {
      acc[a.questionType] = (acc[a.questionType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalAssessments: assessments.length,
      totalDecisions: decisions.length,
      approvalRate,
      averageConfidence,
      mostCommonDecision,
      averageProcessingTime: 0, // Would calculate from timestamps in real implementation
      questionTypeBreakdown
    }
  }

  // Export audit log for compliance
  exportAuditLog(
    teacherId?: string,
    startDate?: Date,
    endDate?: Date
  ): AIGradingAuditEntry[] {
    let filtered = this.auditLog

    if (teacherId) {
      filtered = filtered.filter(entry => entry.teacherId === teacherId)
    }

    if (startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= endDate)
    }

    return filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  // Clear old audit entries (for memory management)
  cleanupOldEntries(olderThanDays: number = 90): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
    
    const beforeCount = this.auditLog.length
    this.auditLog = this.auditLog.filter(entry => entry.timestamp > cutoffDate)
    const afterCount = this.auditLog.length
    
    return beforeCount - afterCount
  }

  private addAuditEntry(entry: AIGradingAuditEntry): void {
    this.auditLog.push(entry)

    // Prevent memory issues by limiting log size
    if (this.auditLog.length > this.MAX_LOG_ENTRIES) {
      this.auditLog = this.auditLog.slice(-this.MAX_LOG_ENTRIES)
    }
  }

  // Get summary of AI usage for transparency
  getAIUsageSummary(sessionId: string): {
    questionsWithAI: number
    questionsWithoutAI: number
    averageConfidence: number
    humanOverrideRate: number
    warningMessage: string
  } {
    const stats = this.generateSessionStats(sessionId)
    const humanOverrideRate = stats.totalDecisions > 0 
      ? (stats.totalDecisions - stats.totalDecisions * stats.approvalRate) / stats.totalDecisions
      : 0

    return {
      questionsWithAI: stats.totalAssessments,
      questionsWithoutAI: 0, // Would need to calculate from quiz data
      averageConfidence: stats.averageConfidence,
      humanOverrideRate,
      warningMessage: 'AI kan ha fel - läraren har granskat och fastställt alla resultat.'
    }
  }
}

// Singleton instance
export const aiGradingAuditService = new AIGradingAuditService()