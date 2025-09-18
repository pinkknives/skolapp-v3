// School administration service for managing teachers and school accounts
import { 
  type User, 
  type SchoolAccount, 
  type SubscriptionPlan,
  type PaymentProvider,
  type DataRetentionMode 
} from '@/types/auth'
import { subscriptionService } from './subscription-service'

export interface TeacherAccount {
  id: string
  user: User
  schoolAccountId: string
  role: 'teacher' | 'admin' | 'owner'
  permissions: TeacherPermission[]
  joinedAt: Date
  isActive: boolean
  lastLoginAt?: Date
  quotaUsage: {
    quizzesCreated: number
    studentsReached: number
    dataStorageUsed: number // in MB
  }
}

export interface TeacherPermission {
  resource: 'quiz_create' | 'quiz_manage' | 'analytics_view' | 'school_admin' | 'billing_manage' | 'teacher_invite'
  allowed: boolean
  grantedBy: string
  grantedAt: Date
}

export interface SchoolUsageStatistics {
  period: 'month' | 'quarter' | 'year'
  startDate: Date
  endDate: Date
  totalTeachers: number
  activeTeachers: number
  totalQuizzes: number
  totalStudents: number
  totalSessions: number
  dataStorageUsed: number // in MB
  topPerformingTeachers: {
    teacherId: string
    teacherName: string
    quizzesCreated: number
    studentsReached: number
    engagementScore: number
  }[]
  subjectBreakdown: Record<string, number>
  consentMetrics: {
    requestsSent: number
    approved: number
    denied: number
    pending: number
    approvalRate: number
  }
}

export interface TeacherInvitation {
  id: string
  schoolAccountId: string
  invitedBy: string
  invitedEmail: string
  invitedName?: string
  role: TeacherAccount['role']
  permissions: TeacherPermission[]
  invitedAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  acceptedAt?: Date
  token: string
}

export interface BillingInfo {
  schoolAccountId: string
  currentPeriod: {
    startDate: Date
    endDate: Date
    activeTeachers: number
    totalCost: number
    costPerTeacher: number
  }
  usage: {
    includedTeachers: number
    additionalTeachers: number
    overage: number
  }
  nextBilling: {
    date: Date
    estimatedCost: number
    estimatedTeachers: number
  }
  paymentHistory: BillingTransaction[]
}

export interface BillingTransaction {
  id: string
  date: Date
  amount: number
  currency: 'SEK'
  description: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  invoiceUrl?: string
  paymentMethod: string
}

export interface GDPRReport {
  schoolAccountId: string
  generatedAt: Date
  period: { start: Date; end: Date }
  dataInventory: {
    studentRecords: number
    quizResults: number
    analyticsRecords: number
    consentRecords: number
  }
  consentStatus: {
    totalRequired: number
    approved: number
    denied: number
    pending: number
    expired: number
  }
  dataRetentionCompliance: {
    longTermDataEnabled: boolean
    retentionPeriod: string
    automaticDeletion: boolean
    manualDeletionRequests: number
  }
  securityMeasures: {
    encryption: boolean
    accessControls: boolean
    auditLogging: boolean
    regularBackups: boolean
  }
  recommendations: string[]
}

export class SchoolAdministrationService {
  /**
   * Create a new school account
   */
  async createSchoolAccount(
    adminUser: User,
    schoolData: {
      name: string
      organizationNumber: string
      contactEmail: string
      billingEmail?: string
      maxTeachers: number
      dataRetentionMode: DataRetentionMode
      paymentProvider: PaymentProvider
    }
  ): Promise<SchoolAccount> {
    const now = new Date()
    
    const schoolAccount: SchoolAccount = {
      id: `school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: schoolData.name,
      organizationNumber: schoolData.organizationNumber,
      contactEmail: schoolData.contactEmail,
      adminUserId: adminUser.id,
      subscriptionPlan: 'skolplan',
      maxTeachers: schoolData.maxTeachers,
      currentTeachers: 1, // Admin is the first teacher
      dataRetentionMode: schoolData.dataRetentionMode,
      paymentProvider: schoolData.paymentProvider,
      billingEmail: schoolData.billingEmail,
      createdAt: now,
      updatedAt: now,
      isActive: true
    }

    // Create admin teacher account
    await this.createTeacherAccount(adminUser, schoolAccount.id, 'owner')

    // Store school account (in real implementation, this goes to database)
    await this.storeSchoolAccount(schoolAccount)

    return schoolAccount
  }

  /**
   * Invite a teacher to join the school
   */
  async inviteTeacher(
    schoolAccountId: string,
    invitedBy: string,
    invitationData: {
      email: string
      name?: string
      role: TeacherAccount['role']
      permissions: TeacherPermission[]
    }
  ): Promise<TeacherInvitation> {
    const now = new Date()
    const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const invitation: TeacherInvitation = {
      id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      schoolAccountId,
      invitedBy,
      invitedEmail: invitationData.email,
      invitedName: invitationData.name,
      role: invitationData.role,
      permissions: invitationData.permissions,
      invitedAt: now,
      expiresAt: expiryDate,
      status: 'pending',
      token: this.generateInvitationToken()
    }

    // Send invitation email
    await this.sendTeacherInvitation(invitation)

    // Store invitation
    await this.storeTeacherInvitation(invitation)

    return invitation
  }

  /**
   * Accept teacher invitation and create account
   */
  async acceptTeacherInvitation(
    token: string,
    userData: {
      firstName: string
      lastName: string
      password: string
    }
  ): Promise<{ success: boolean; user?: User; teacherAccount?: TeacherAccount }> {
    const invitation = await this.getTeacherInvitationByToken(token)
    
    if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
      return { success: false }
    }

    // Create user account
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: invitation.invitedEmail,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'lärare',
      subscriptionPlan: 'skolplan',
      dataRetentionMode: 'långtid', // School plan default
      schoolAccountId: invitation.schoolAccountId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Create teacher account
    const teacherAccount = await this.createTeacherAccount(user, invitation.schoolAccountId, invitation.role, invitation.permissions)

    // Update invitation status
    await this.updateTeacherInvitation(invitation.id, { 
      status: 'accepted', 
      acceptedAt: new Date() 
    })

    // Update school current teacher count
    await this.incrementSchoolTeacherCount(invitation.schoolAccountId)

    return { success: true, user, teacherAccount }
  }

  /**
   * Remove teacher from school
   */
  async removeTeacher(
    schoolAccountId: string,
    teacherId: string,
    removedBy: string
  ): Promise<{ success: boolean; dataHandled: boolean }> {
    const teacherAccount = await this.getTeacherAccount(teacherId)
    
    if (!teacherAccount || teacherAccount.schoolAccountId !== schoolAccountId) {
      return { success: false, dataHandled: false }
    }

    // Handle data according to GDPR
    // 1. Transfer quiz ownership to school admin
    // 2. Anonymize personal data if required
    // 3. Maintain educational data integrity
    const dataHandled = await this.handleTeacherDataRemoval(teacherId, removedBy)

    // Deactivate teacher account
    await this.updateTeacherAccount(teacherId, { 
      isActive: false,
      permissions: [] // Remove all permissions
    })

    // Decrement school teacher count
    await this.decrementSchoolTeacherCount(schoolAccountId)

    return { success: true, dataHandled }
  }

  /**
   * Get school usage statistics
   */
  async getSchoolUsageStatistics(
    schoolAccountId: string,
    period: 'month' | 'quarter' | 'year'
  ): Promise<SchoolUsageStatistics> {
    const now = new Date()
    let startDate: Date
    const endDate = now

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // In real implementation, this would query the database
    // For now, return mock statistics
    return {
      period,
      startDate,
      endDate,
      totalTeachers: 15,
      activeTeachers: 12,
      totalQuizzes: 145,
      totalStudents: 450,
      totalSessions: 1250,
      dataStorageUsed: 125.5,
      topPerformingTeachers: [
        {
          teacherId: 'teacher_1',
          teacherName: 'Anna Svensson',
          quizzesCreated: 25,
          studentsReached: 85,
          engagementScore: 0.92
        },
        {
          teacherId: 'teacher_2',
          teacherName: 'Erik Johansson',
          quizzesCreated: 18,
          studentsReached: 65,
          engagementScore: 0.87
        }
      ],
      subjectBreakdown: {
        'Matematik': 45,
        'Svenska': 38,
        'Engelska': 32,
        'Naturkunskap': 20,
        'Historia': 10
      },
      consentMetrics: {
        requestsSent: 85,
        approved: 72,
        denied: 8,
        pending: 5,
        approvalRate: 0.85
      }
    }
  }

  /**
   * Generate billing information
   */
  async getBillingInfo(schoolAccountId: string): Promise<BillingInfo> {
    const schoolAccount = await this.getSchoolAccount(schoolAccountId)
    const teachers = await this.getSchoolTeachers(schoolAccountId)
    const activeTeachers = teachers.filter(t => t.isActive).length

    const pricing = subscriptionService.calculateSchoolPricing(activeTeachers)
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return {
      schoolAccountId,
      currentPeriod: {
        startDate: periodStart,
        endDate: periodEnd,
        activeTeachers,
        totalCost: pricing.monthlyTotal,
        costPerTeacher: pricing.tier.pricePerTeacher
      },
      usage: {
        includedTeachers: activeTeachers,
        additionalTeachers: Math.max(0, activeTeachers - schoolAccount.maxTeachers),
        overage: Math.max(0, (activeTeachers - schoolAccount.maxTeachers) * pricing.tier.pricePerTeacher)
      },
      nextBilling: {
        date: nextBillingDate,
        estimatedCost: pricing.monthlyTotal,
        estimatedTeachers: activeTeachers
      },
      paymentHistory: [] // Would be populated from payment records
    }
  }

  /**
   * Generate GDPR compliance report
   */
  async generateGDPRReport(
    schoolAccountId: string,
    period: { start: Date; end: Date }
  ): Promise<GDPRReport> {
    const schoolAccount = await this.getSchoolAccount(schoolAccountId)
    
    // In real implementation, this would aggregate actual data
    return {
      schoolAccountId,
      generatedAt: new Date(),
      period,
      dataInventory: {
        studentRecords: 450,
        quizResults: 3250,
        analyticsRecords: 1500,
        consentRecords: 420
      },
      consentStatus: {
        totalRequired: 420,
        approved: 380,
        denied: 25,
        pending: 10,
        expired: 5
      },
      dataRetentionCompliance: {
        longTermDataEnabled: schoolAccount.dataRetentionMode === 'långtid',
        retentionPeriod: schoolAccount.dataRetentionMode === 'långtid' ? 'Permanent (med samtycke)' : 'Session endast',
        automaticDeletion: true,
        manualDeletionRequests: 8
      },
      securityMeasures: {
        encryption: true,
        accessControls: true,
        auditLogging: true,
        regularBackups: true
      },
      recommendations: [
        'Säkerställ att alla föräldrasamtycken är uppdaterade',
        'Granska datalagringspolicyer regelbundet',
        'Genomför säkerhetsutbildning för lärare',
        'Överväg implementering av dataklassificering'
      ]
    }
  }

  /**
   * Update school settings
   */
  async updateSchoolSettings(
    schoolAccountId: string,
    updates: Partial<Pick<SchoolAccount, 'name' | 'contactEmail' | 'billingEmail' | 'maxTeachers' | 'dataRetentionMode'>>
  ): Promise<SchoolAccount> {
    const schoolAccount = await this.getSchoolAccount(schoolAccountId)
    
    const updatedAccount: SchoolAccount = {
      ...schoolAccount,
      ...updates,
      updatedAt: new Date()
    }

    await this.storeSchoolAccount(updatedAccount)
    return updatedAccount
  }

  // Private helper methods

  private async createTeacherAccount(
    user: User,
    schoolAccountId: string,
    role: TeacherAccount['role'],
    permissions: TeacherPermission[] = []
  ): Promise<TeacherAccount> {
    const defaultPermissions: TeacherPermission[] = [
      {
        resource: 'quiz_create',
        allowed: true,
        grantedBy: 'system',
        grantedAt: new Date()
      },
      {
        resource: 'quiz_manage',
        allowed: true,
        grantedBy: 'system',
        grantedAt: new Date()
      },
      {
        resource: 'analytics_view',
        allowed: true,
        grantedBy: 'system',
        grantedAt: new Date()
      }
    ]

    const teacherAccount: TeacherAccount = {
      id: `teacher_${user.id}`,
      user,
      schoolAccountId,
      role,
      permissions: permissions.length > 0 ? permissions : defaultPermissions,
      joinedAt: new Date(),
      isActive: true,
      quotaUsage: {
        quizzesCreated: 0,
        studentsReached: 0,
        dataStorageUsed: 0
      }
    }

    await this.storeTeacherAccount(teacherAccount)
    return teacherAccount
  }

  private generateInvitationToken(): string {
    return Math.random().toString(36).substr(2, 15) + Date.now().toString(36)
  }

  private async sendTeacherInvitation(invitation: TeacherInvitation): Promise<void> {
    // In real implementation, send email invitation
    console.log(`Sending teacher invitation to ${invitation.invitedEmail}`)
  }

  private async handleTeacherDataRemoval(teacherId: string, removedBy: string): Promise<boolean> {
    // In real implementation:
    // 1. Transfer quiz ownership
    // 2. Anonymize personal references
    // 3. Maintain data integrity for educational purposes
    // 4. Log all changes for audit
    console.log(`Handling data removal for teacher ${teacherId} by ${removedBy}`)
    return true
  }

  // Storage methods (would be replaced with database calls)
  private async storeSchoolAccount(account: SchoolAccount): Promise<void> {
    console.log('Storing school account:', account.id)
  }

  private async storeTeacherAccount(account: TeacherAccount): Promise<void> {
    console.log('Storing teacher account:', account.id)
  }

  private async storeTeacherInvitation(invitation: TeacherInvitation): Promise<void> {
    console.log('Storing teacher invitation:', invitation.id)
  }

  private async getSchoolAccount(schoolAccountId: string): Promise<SchoolAccount> {
    // Mock implementation
    return {
      id: schoolAccountId,
      name: 'Exempel Skola',
      organizationNumber: '123456-7890',
      contactEmail: 'kontakt@exempelskola.se',
      adminUserId: 'admin_user_1',
      subscriptionPlan: 'skolplan',
      maxTeachers: 20,
      currentTeachers: 15,
      dataRetentionMode: 'långtid',
      paymentProvider: 'stripe',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  }

  private async getTeacherAccount(teacherId: string): Promise<TeacherAccount | null> {
    // Mock implementation
    return null
  }

  private async getSchoolTeachers(schoolAccountId: string): Promise<TeacherAccount[]> {
    // Mock implementation
    return []
  }

  private async getTeacherInvitationByToken(token: string): Promise<TeacherInvitation | null> {
    // Mock implementation
    return null
  }

  private async updateTeacherInvitation(invitationId: string, updates: Partial<TeacherInvitation>): Promise<void> {
    console.log('Updating teacher invitation:', invitationId)
  }

  private async updateTeacherAccount(teacherId: string, updates: Partial<TeacherAccount>): Promise<void> {
    console.log('Updating teacher account:', teacherId)
  }

  private async incrementSchoolTeacherCount(schoolAccountId: string): Promise<void> {
    console.log('Incrementing teacher count for school:', schoolAccountId)
  }

  private async decrementSchoolTeacherCount(schoolAccountId: string): Promise<void> {
    console.log('Decrementing teacher count for school:', schoolAccountId)
  }
}

// Export singleton instance
export const schoolAdministrationService = new SchoolAdministrationService()