// Consent collection mechanisms with automated workflows
import { 
  type ConsentRecord, 
  type ConsentStatus,
  type User 
} from '@/types/auth'
import { 
  type ConsentRequest,
  parentalConsentService 
} from './parental-consent-service'

export interface ConsentCollectionWorkflow {
  id: string
  studentId: string
  teacherId: string
  schoolId?: string
  consentType: 'data_retention' | 'marketing' | 'analytics'
  status: 'initiated' | 'sent' | 'reminder_sent' | 'completed' | 'expired' | 'failed'
  attempts: ConsentAttempt[]
  createdAt: Date
  completedAt?: Date
  expiresAt: Date
}

export interface ConsentAttempt {
  id: string
  method: ConsentRequest['method']
  sentAt: Date
  deliveryStatus: 'sent' | 'delivered' | 'failed' | 'bounced'
  responseAt?: Date
  reminderCount: number
}

export interface ConsentCollectionMetrics {
  totalWorkflows: number
  activeWorkflows: number
  completedWorkflows: number
  successRate: number
  averageResponseTime: number // in hours
  methodEffectiveness: Record<ConsentRequest['method'], {
    sent: number
    completed: number
    successRate: number
    averageResponseTime: number
  }>
  complianceStatus: {
    gdprCompliant: boolean
    missingConsents: number
    expiringConsents: number
    expiredConsents: number
  }
}

export interface AutomatedReminderConfig {
  enabled: boolean
  intervals: number[] // Days after initial request
  maxReminders: number
  escalationEnabled: boolean
  escalationMethods: ConsentRequest['method'][]
}

export class ConsentCollectionService {
  private workflows: Map<string, ConsentCollectionWorkflow> = new Map()
  private reminderConfig: AutomatedReminderConfig = {
    enabled: true,
    intervals: [3, 7, 14], // Send reminders after 3, 7, and 14 days
    maxReminders: 3,
    escalationEnabled: true,
    escalationMethods: ['email_link', 'sms_link', 'qr_code']
  }

  /**
   * Initiate consent collection workflow
   */
  async initiateConsentCollection(
    student: User,
    teacher: User,
    consentType: ConsentCollectionWorkflow['consentType'],
    parentInfo: {
      name: string
      email: string
      phone?: string
    },
    preferredMethod: ConsentRequest['method'] = 'email_link'
  ): Promise<ConsentCollectionWorkflow> {
    const now = new Date()
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const workflow: ConsentCollectionWorkflow = {
      id: workflowId,
      studentId: student.id,
      teacherId: teacher.id,
      schoolId: student.schoolAccountId,
      consentType,
      status: 'initiated',
      attempts: [],
      createdAt: now,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }

    // Store workflow
    this.workflows.set(workflowId, workflow)

    // Send initial consent request
    await this.sendConsentRequest(workflow, parentInfo, preferredMethod)

    return workflow
  }

  /**
   * Send consent request using specified method
   */
  async sendConsentRequest(
    workflow: ConsentCollectionWorkflow,
    parentInfo: { name: string; email: string; phone?: string },
    method: ConsentRequest['method']
  ): Promise<ConsentAttempt> {
    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    // Create consent request
    const consentRequest = await parentalConsentService.createConsentRequest({
      studentId: workflow.studentId,
      studentName: `Student ${workflow.studentId}`, // Would get from user data
      teacherId: workflow.teacherId,
      teacherName: `Teacher ${workflow.teacherId}`, // Would get from user data
      schoolName: 'Skolan', // Would get from school data
      parentEmail: parentInfo.email,
      parentName: parentInfo.name,
      parentPhone: parentInfo.phone,
      consentType: workflow.consentType,
      method,
      urgency: 'medium',
      language: 'sv'
    })

    // Send the request
    const sendResult = await parentalConsentService.sendConsentRequest(consentRequest)

    // Create attempt record
    const attempt: ConsentAttempt = {
      id: attemptId,
      method,
      sentAt: now,
      deliveryStatus: sendResult.success ? 'sent' : 'failed',
      reminderCount: 0
    }

    // Update workflow
    workflow.attempts.push(attempt)
    workflow.status = sendResult.success ? 'sent' : 'failed'
    this.workflows.set(workflow.id, workflow)

    // Schedule automated reminders if enabled
    if (this.reminderConfig.enabled && sendResult.success) {
      await this.scheduleReminders(workflow, parentInfo, method)
    }

    return attempt
  }

  /**
   * Process consent response
   */
  async processConsentResponse(
    workflowId: string,
    consentStatus: ConsentStatus,
    metadata?: {
      ipAddress?: string
      userAgent?: string
      responseMethod?: string
    }
  ): Promise<{ success: boolean; workflow: ConsentCollectionWorkflow }> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }

    const now = new Date()

    // Update latest attempt
    const latestAttempt = workflow.attempts[workflow.attempts.length - 1]
    if (latestAttempt) {
      latestAttempt.responseAt = now
    }

    // Update workflow status
    workflow.status = 'completed'
    workflow.completedAt = now

    // Cancel scheduled reminders
    await this.cancelScheduledReminders(workflowId)

    // Log compliance event
    await this.logComplianceEvent(workflow, consentStatus, metadata)

    this.workflows.set(workflowId, workflow)

    return { success: true, workflow }
  }

  /**
   * Schedule automated reminders
   */
  private async scheduleReminders(
    workflow: ConsentCollectionWorkflow,
    parentInfo: { name: string; email: string; phone?: string },
    originalMethod: ConsentRequest['method']
  ): Promise<void> {
    for (let i = 0; i < this.reminderConfig.intervals.length; i++) {
      const days = this.reminderConfig.intervals[i]
      const reminderDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

      // Determine reminder method (escalate if configured)
      let reminderMethod = originalMethod
      if (this.reminderConfig.escalationEnabled && i > 0) {
        reminderMethod = this.reminderConfig.escalationMethods[
          Math.min(i - 1, this.reminderConfig.escalationMethods.length - 1)
        ]
      }

      // In real implementation, this would schedule with a job queue
      console.log(`Scheduling reminder ${i + 1} for workflow ${workflow.id} on ${reminderDate.toISOString()} via ${reminderMethod}`)
    }
  }

  /**
   * Cancel scheduled reminders
   */
  private async cancelScheduledReminders(workflowId: string): Promise<void> {
    // In real implementation, this would cancel scheduled jobs
    console.log(`Cancelling scheduled reminders for workflow ${workflowId}`)
  }

  /**
   * Send reminder for pending consent
   */
  async sendReminder(workflowId: string): Promise<{ success: boolean; attempt: ConsentAttempt }> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow || workflow.status === 'completed') {
      return { success: false, attempt: {} as ConsentAttempt }
    }

    const latestAttempt = workflow.attempts[workflow.attempts.length - 1]
    if (!latestAttempt || latestAttempt.reminderCount >= this.reminderConfig.maxReminders) {
      return { success: false, attempt: {} as ConsentAttempt }
    }

    // Create reminder attempt
    const reminderAttempt: ConsentAttempt = {
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method: latestAttempt.method,
      sentAt: new Date(),
      deliveryStatus: 'sent',
      reminderCount: latestAttempt.reminderCount + 1
    }

    workflow.attempts.push(reminderAttempt)
    workflow.status = 'reminder_sent'
    this.workflows.set(workflowId, workflow)

    return { success: true, attempt: reminderAttempt }
  }

  /**
   * Get consent collection metrics
   */
  async getConsentCollectionMetrics(
    schoolId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<ConsentCollectionMetrics> {
    const workflows = Array.from(this.workflows.values())
    const filteredWorkflows = workflows.filter(w => {
      if (schoolId && w.schoolId !== schoolId) return false
      if (dateRange) {
        if (w.createdAt < dateRange.start || w.createdAt > dateRange.end) return false
      }
      return true
    })

    const totalWorkflows = filteredWorkflows.length
    const activeWorkflows = filteredWorkflows.filter(w => 
      ['initiated', 'sent', 'reminder_sent'].includes(w.status)
    ).length
    const completedWorkflows = filteredWorkflows.filter(w => w.status === 'completed').length
    
    const successRate = totalWorkflows > 0 ? completedWorkflows / totalWorkflows : 0

    // Calculate average response time
    const completedWithTime = filteredWorkflows.filter(w => 
      w.status === 'completed' && w.completedAt && w.createdAt
    )
    const averageResponseTime = completedWithTime.length > 0 
      ? completedWithTime.reduce((sum, w) => {
          const responseTime = (w.completedAt!.getTime() - w.createdAt.getTime()) / (1000 * 60 * 60) // hours
          return sum + responseTime
        }, 0) / completedWithTime.length
      : 0

    // Calculate method effectiveness
    const methodEffectiveness: ConsentCollectionMetrics['methodEffectiveness'] = {
      email_link: { sent: 0, completed: 0, successRate: 0, averageResponseTime: 0 },
      sms_link: { sent: 0, completed: 0, successRate: 0, averageResponseTime: 0 },
      qr_code: { sent: 0, completed: 0, successRate: 0, averageResponseTime: 0 },
      digital_signature: { sent: 0, completed: 0, successRate: 0, averageResponseTime: 0 }
    }

    // Calculate effectiveness for each method
    for (const method of Object.keys(methodEffectiveness) as ConsentRequest['method'][]) {
      const methodWorkflows = filteredWorkflows.filter(w => 
        w.attempts.some(a => a.method === method)
      )
      const methodCompleted = methodWorkflows.filter(w => w.status === 'completed')
      
      methodEffectiveness[method] = {
        sent: methodWorkflows.length,
        completed: methodCompleted.length,
        successRate: methodWorkflows.length > 0 ? methodCompleted.length / methodWorkflows.length : 0,
        averageResponseTime: methodCompleted.length > 0 
          ? methodCompleted.reduce((sum, w) => {
              const responseTime = (w.completedAt!.getTime() - w.createdAt.getTime()) / (1000 * 60 * 60)
              return sum + responseTime
            }, 0) / methodCompleted.length
          : 0
      }
    }

    return {
      totalWorkflows,
      activeWorkflows,
      completedWorkflows,
      successRate,
      averageResponseTime,
      methodEffectiveness,
      complianceStatus: {
        gdprCompliant: true, // Would calculate based on actual compliance rules
        missingConsents: activeWorkflows,
        expiringConsents: 0, // Would calculate based on expiration dates
        expiredConsents: 0 // Would calculate based on expiration dates
      }
    }
  }

  /**
   * Bulk initiate consent collection for multiple students
   */
  async bulkInitiateConsent(
    students: User[],
    teacher: User,
    consentType: ConsentCollectionWorkflow['consentType'],
    parentContactsMap: Map<string, { name: string; email: string; phone?: string }>
  ): Promise<ConsentCollectionWorkflow[]> {
    const workflows: ConsentCollectionWorkflow[] = []

    for (const student of students) {
      const parentInfo = parentContactsMap.get(student.id)
      if (!parentInfo) {
        console.warn(`No parent contact info for student ${student.id}`)
        continue
      }

      try {
        const workflow = await this.initiateConsentCollection(
          student,
          teacher,
          consentType,
          parentInfo
        )
        workflows.push(workflow)
      } catch (error) {
        console.error(`Failed to initiate consent for student ${student.id}:`, error)
      }
    }

    return workflows
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(schoolId?: string): Promise<{
    reportId: string
    generatedAt: Date
    summary: ConsentCollectionMetrics
    details: ConsentCollectionWorkflow[]
    recommendations: string[]
  }> {
    const metrics = await this.getConsentCollectionMetrics(schoolId)
    const workflows = Array.from(this.workflows.values())
      .filter(w => !schoolId || w.schoolId === schoolId)

    const recommendations = this.generateRecommendations(metrics)

    return {
      reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generatedAt: new Date(),
      summary: metrics,
      details: workflows,
      recommendations
    }
  }

  private generateRecommendations(metrics: ConsentCollectionMetrics): string[] {
    const recommendations: string[] = []

    if (metrics.successRate < 0.8) {
      recommendations.push('Förbättra samtyckesfrekvensen genom att förenkla processen')
    }

    if (metrics.averageResponseTime > 72) { // 3 days
      recommendations.push('Minska svarstiden genom snabbare påminnelser')
    }

    if (metrics.complianceStatus.missingConsents > 0) {
      recommendations.push('Följ upp väntande samtycken för att säkerställa GDPR-efterlevnad')
    }

    // Check method effectiveness
    const bestMethod = Object.entries(metrics.methodEffectiveness)
      .sort(([,a], [,b]) => b.successRate - a.successRate)[0]
    
    if (bestMethod && bestMethod[1].successRate > 0.5) {
      recommendations.push(`Använd ${bestMethod[0]} som primär metod baserat på bästa prestanda`)
    }

    return recommendations
  }

  private async logComplianceEvent(
    workflow: ConsentCollectionWorkflow,
    consentStatus: ConsentStatus,
    metadata?: Record<string, any>
  ): Promise<void> {
    console.log('Logging compliance event:', {
      workflowId: workflow.id,
      studentId: workflow.studentId,
      consentType: workflow.consentType,
      status: consentStatus,
      metadata
    })
    // In real implementation, log to audit system
  }
}

// Export singleton instance
export const consentCollectionService = new ConsentCollectionService()