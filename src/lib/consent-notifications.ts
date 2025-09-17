// Consent notification service for parental consent flow
import { type ConsentRecord, type User } from '@/types/auth'

export interface ConsentNotification {
  id: string
  type: 'consent_request' | 'consent_reminder' | 'consent_approved' | 'consent_denied' | 'consent_revoked'
  studentId: string
  parentEmail: string
  parentName: string
  consentId: string
  createdAt: Date
  sentAt?: Date
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  method: 'email' | 'sms' | 'push'
  content: {
    subject: string
    message: string
    actionUrl?: string
    expiresAt?: Date
  }
}

class ConsentNotificationService {
  private readonly STORAGE_KEY = 'skolapp_consent_notifications'

  /**
   * Create and send consent request notification to parent
   */
  async sendConsentRequest(
    student: User,
    parentEmail: string,
    parentName: string,
    consentRecord: ConsentRecord
  ): Promise<ConsentNotification> {
    const notification: ConsentNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'consent_request',
      studentId: student.id,
      parentEmail,
      parentName,
      consentId: consentRecord.id,
      createdAt: new Date(),
      status: 'pending',
      method: 'email',
      content: {
        subject: `Samtyckesbegäran för ${student.firstName} - Skolapp`,
        message: this.generateConsentRequestMessage(student.firstName, parentName),
        actionUrl: this.generateConsentActionUrl(consentRecord.id),
        expiresAt: consentRecord.expiresAt
      }
    }

    // Store notification
    this.storeNotification(notification)

    // Simulate sending email (in real implementation, use email service)
    try {
      await this.simulateEmailSending(notification)
      notification.status = 'sent'
      notification.sentAt = new Date()
      this.updateNotification(notification)
      
      console.log(`[ConsentNotification] Consent request sent to ${parentEmail}`)
      return notification
    } catch (error) {
      notification.status = 'failed'
      this.updateNotification(notification)
      throw new Error(`Failed to send consent request: ${error}`)
    }
  }

  /**
   * Send reminder notification for pending consent
   */
  async sendConsentReminder(consentRecord: ConsentRecord): Promise<ConsentNotification> {
    const notification: ConsentNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'consent_reminder',
      studentId: consentRecord.studentId,
      parentEmail: consentRecord.parentEmail,
      parentName: consentRecord.parentName,
      consentId: consentRecord.id,
      createdAt: new Date(),
      status: 'pending',
      method: 'email',
      content: {
        subject: 'Påminnelse: Samtyckesbegäran väntar - Skolapp',
        message: this.generateReminderMessage(consentRecord.parentName),
        actionUrl: this.generateConsentActionUrl(consentRecord.id),
        expiresAt: consentRecord.expiresAt
      }
    }

    this.storeNotification(notification)

    try {
      await this.simulateEmailSending(notification)
      notification.status = 'sent'
      notification.sentAt = new Date()
      this.updateNotification(notification)
      
      return notification
    } catch (error) {
      notification.status = 'failed'
      this.updateNotification(notification)
      throw error
    }
  }

  /**
   * Send notification about consent status change
   */
  async sendConsentStatusNotification(
    consentRecord: ConsentRecord,
    newStatus: 'approved' | 'denied' | 'revoked'
  ): Promise<ConsentNotification> {
    const notificationType = newStatus === 'approved' ? 'consent_approved' :
                            newStatus === 'denied' ? 'consent_denied' : 'consent_revoked'

    const notification: ConsentNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: notificationType,
      studentId: consentRecord.studentId,
      parentEmail: consentRecord.parentEmail,
      parentName: consentRecord.parentName,
      consentId: consentRecord.id,
      createdAt: new Date(),
      status: 'pending',
      method: 'email',
      content: {
        subject: `Samtycke ${newStatus === 'approved' ? 'godkänt' : newStatus === 'denied' ? 'nekat' : 'återkallat'} - Skolapp`,
        message: this.generateStatusChangeMessage(consentRecord.parentName, newStatus),
        actionUrl: this.generateConsentActionUrl(consentRecord.id)
      }
    }

    this.storeNotification(notification)

    try {
      await this.simulateEmailSending(notification)
      notification.status = 'sent'
      notification.sentAt = new Date()
      this.updateNotification(notification)
      
      return notification
    } catch (error) {
      notification.status = 'failed'
      this.updateNotification(notification)
      throw error
    }
  }

  /**
   * Generate QR code for parent access
   */
  generateConsentQRCode(consentId: string): string {
    const actionUrl = this.generateConsentActionUrl(consentId)
    // In real implementation, use QR code library
    return `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white"/>
        <text x="50" y="30" text-anchor="middle" font-size="8" fill="black">QR-kod för</text>
        <text x="50" y="45" text-anchor="middle" font-size="8" fill="black">samtycke</text>
        <text x="50" y="70" text-anchor="middle" font-size="6" fill="gray">${consentId.slice(-8)}</text>
      </svg>
    `)}`
  }

  /**
   * Generate secure access link for parent
   */
  private generateConsentActionUrl(consentId: string): string {
    // In real implementation, generate signed JWT token
    const token = btoa(`${consentId}:${Date.now()}:${Math.random()}`)
    return `${window.location.origin}/foralder/samtycke?token=${token}&consent=${consentId}`
  }

  /**
   * Generate consent request message
   */
  private generateConsentRequestMessage(studentName: string, parentName: string): string {
    return `
Hej ${parentName},

${studentName} har registrerat sig för att använda Skolapp och valt långtidslagring av data för att få bättre inlärningsanalys och framstegsspårning.

Enligt GDPR behöver vi ditt samtycke för att lagra ${studentName}s data permanent. Med ditt samtycke kan vi:

• Spara quiz-resultat och framsteg
• Ge personliga rekommendationer
• Analysera inlärningsprofil
• Förbättra undervisning

Klicka på länken nedan för att granska och ge ditt samtycke:

[Ge/neka samtycke]

Om du inte svarar inom 30 dagar kommer begäran att upphöra och endast korttidslagring att användas.

All data behandlas säkert enligt GDPR och svenska dataskyddsregler.

Med vänliga hälsningar,
Skolapp-teamet
    `.trim()
  }

  /**
   * Generate reminder message
   */
  private generateReminderMessage(parentName: string): string {
    return `
Hej ${parentName},

Detta är en påminnelse om att en samtyckesbegäran för ditt barn väntar på ditt svar.

För att ge ditt barn tillgång till alla funktioner i Skolapp, klicka på länken nedan för att granska och svara på begäran:

[Svara på samtyckesbegäran]

Om du inte svarar kommer endast grundläggande funktioner att vara tillgängliga.

Med vänliga hälsningar,
Skolapp-teamet
    `.trim()
  }

  /**
   * Generate status change message
   */
  private generateStatusChangeMessage(parentName: string, status: 'approved' | 'denied' | 'revoked'): string {
    const statusText = status === 'approved' ? 'godkänt' : 
                      status === 'denied' ? 'nekat' : 'återkallat'
    
    return `
Hej ${parentName},

Vi bekräftar att du har ${statusText} samtycke för ditt barns datalagring i Skolapp.

${status === 'approved' ? 
  'Ditt barn kan nu använda alla funktioner inklusive långtidslagring och detaljerad framstegsspårning.' :
  status === 'denied' ?
  'Ditt barn kommer att använda korttidsläge där data endast sparas tillfälligt under varje session.' :
  'All sparad data kommer att raderas inom 30 dagar enligt din begäran.'
}

Du kan när som helst ändra ditt beslut genom att logga in på föräldraområdet.

Med vänliga hälsningar,
Skolapp-teamet
    `.trim()
  }

  /**
   * Simulate email sending (replace with real email service)
   */
  private async simulateEmailSending(notification: ConsentNotification): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Email service temporarily unavailable')
    }
    
    console.log(`[ConsentNotification] Email sent to ${notification.parentEmail}:`)
    console.log(`Subject: ${notification.content.subject}`)
    console.log(`Message: ${notification.content.message.substring(0, 100)}...`)
  }

  /**
   * Store notification in localStorage
   */
  private storeNotification(notification: ConsentNotification): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const notifications = stored ? JSON.parse(stored) : []
      
      notifications.push(notification)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.error('[ConsentNotification] Error storing notification:', error)
    }
  }

  /**
   * Update existing notification
   */
  private updateNotification(notification: ConsentNotification): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return
      
      const notifications = JSON.parse(stored) as ConsentNotification[]
      const index = notifications.findIndex(n => n.id === notification.id)
      
      if (index !== -1) {
        notifications[index] = notification
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications))
      }
    } catch (error) {
      console.error('[ConsentNotification] Error updating notification:', error)
    }
  }

  /**
   * Get notifications for a consent record
   */
  getNotificationsForConsent(consentId: string): ConsentNotification[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const notifications = JSON.parse(stored) as ConsentNotification[]
      return notifications.filter(n => n.consentId === consentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error('[ConsentNotification] Error getting notifications:', error)
      return []
    }
  }

  /**
   * Schedule automatic reminders for pending consents
   */
  scheduleConsentReminders(): void {
    // In real implementation, this would be handled by backend cron jobs
    // For demo purposes, we'll check every hour for pending consents
    setInterval(() => {
      this.checkPendingConsents()
    }, 60 * 60 * 1000) // 1 hour
  }

  /**
   * Check for pending consents that need reminders
   */
  private checkPendingConsents(): void {
    // In real implementation, fetch from backend
    console.log('[ConsentNotification] Checking for pending consents needing reminders...')
  }
}

// Export singleton instance
export const consentNotificationService = new ConsentNotificationService()