// Enhanced parental consent service with multiple collection methods
import { 
  type ConsentRecord, 
  type ConsentStatus, 
  type ConsentAuditEntry,
  type User 
} from '@/types/auth'
import QRCode from 'qrcode'

export interface ConsentRequest {
  id: string
  studentId: string
  studentName: string
  teacherId: string
  teacherName: string
  schoolName?: string
  parentEmail: string
  parentName: string
  parentPhone?: string
  consentType: 'data_retention' | 'marketing' | 'analytics'
  method: 'email_link' | 'qr_code' | 'digital_signature' | 'sms_link'
  urgency: 'low' | 'medium' | 'high'
  requestedAt: Date
  expiresAt: Date
  reminderSent?: Date[]
  language: 'sv' | 'en'
}

export interface ConsentResponse {
  consentId: string
  status: ConsentStatus
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    region: string
  }
  timestamp: Date
  signature?: string // For digital signature method
  parentIdentityVerified: boolean
}

export interface ConsentTemplate {
  type: ConsentRequest['consentType']
  language: 'sv' | 'en'
  subject: string
  htmlBody: string
  textBody: string
  legalNotice: string
}

export interface ConsentMetrics {
  totalRequests: number
  approvedCount: number
  deniedCount: number
  pendingCount: number
  expiredCount: number
  approvalRate: number
  averageResponseTime: number // in hours
  methodBreakdown: Record<ConsentRequest['method'], number>
}

// Consent templates in Swedish (primary) and English (backup)
export const CONSENT_TEMPLATES: Record<ConsentRequest['consentType'], Record<'sv' | 'en', ConsentTemplate>> = {
  data_retention: {
    sv: {
      type: 'data_retention',
      language: 'sv',
      subject: 'Samtycke krävs: Långtidslagring av {studentName}s skoldata',
      htmlBody: `
        <h2>Begäran om samtycke för datalagring</h2>
        <p>Hej {parentName},</p>
        <p>{teacherName} på {schoolName} behöver ditt samtycke för att lagra {studentName}s quiz-resultat och lärprogression över längre tid.</p>
        
        <h3>Vad innebär detta?</h3>
        <ul>
          <li>Quiz-resultat och prestationer sparas för analys av lärprogression</li>
          <li>Data används endast för pedagogiska ändamål</li>
          <li>Du kan när som helst återkalla samtycket</li>
          <li>All data raderas om samtycke återkallas</li>
        </ul>
        
        <p><strong>Klicka här för att ge/neka samtycke:</strong></p>
        <p><a href="{consentUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Hantera samtycke</a></p>
        
        <p>Länken är giltig till {expiryDate}.</p>
        
        <hr>
        <p><small>Detta meddelande skickas enligt GDPR och svenska dataskyddslagen. Skolapp v3 är GDPR-kompatibel och följer alla svenska regler för elevdataskydd.</small></p>
      `,
      textBody: `
Begäran om samtycke för datalagring

Hej {parentName},

{teacherName} på {schoolName} behöver ditt samtycke för att lagra {studentName}s quiz-resultat och lärprogression över längre tid.

Vad innebär detta?
- Quiz-resultat och prestationer sparas för analys av lärprogression
- Data används endast för pedagogiska ändamål  
- Du kan när som helst återkalla samtycket
- All data raderas om samtycke återkallas

Hantera samtycke: {consentUrl}

Länken är giltig till {expiryDate}.

Detta meddelande skickas enligt GDPR och svenska dataskyddslagen.
      `,
      legalNotice: 'Enligt GDPR artikel 6 och 8, samt Skollagen 2010:800, krävs föräldrasamtycke för lagring av elevdata över grundläggande sessionstid.'
    },
    en: {
      type: 'data_retention',
      language: 'en',
      subject: 'Consent Required: Long-term Storage of {studentName}s School Data',
      htmlBody: `
        <h2>Data Storage Consent Request</h2>
        <p>Hello {parentName},</p>
        <p>{teacherName} at {schoolName} needs your consent to store {studentName}s quiz results and learning progress long-term.</p>
        
        <h3>What does this mean?</h3>
        <ul>
          <li>Quiz results and performance data will be stored for learning progression analysis</li>
          <li>Data is used only for educational purposes</li>
          <li>You can withdraw consent at any time</li>
          <li>All data will be deleted if consent is withdrawn</li>
        </ul>
        
        <p><strong>Click here to give/deny consent:</strong></p>
        <p><a href="{consentUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Manage Consent</a></p>
        
        <p>This link is valid until {expiryDate}.</p>
        
        <hr>
        <p><small>This message is sent according to GDPR and Swedish data protection law. Skolapp v3 is GDPR compliant and follows all Swedish rules for student data protection.</small></p>
      `,
      textBody: `
Data Storage Consent Request

Hello {parentName},

{teacherName} at {schoolName} needs your consent to store {studentName}s quiz results and learning progress long-term.

What does this mean?
- Quiz results and performance data will be stored for learning progression analysis
- Data is used only for educational purposes
- You can withdraw consent at any time
- All data will be deleted if consent is withdrawn

Manage consent: {consentUrl}

This link is valid until {expiryDate}.

This message is sent according to GDPR and Swedish data protection law.
      `,
      legalNotice: 'According to GDPR Articles 6 and 8, and Swedish Education Act 2010:800, parental consent is required for storing student data beyond basic session time.'
    }
  },
  marketing: {
    sv: {
      type: 'marketing',
      language: 'sv',
      subject: 'Samtycke: Marknadsföring och nyhetsbrev från Skolapp',
      htmlBody: `
        <h2>Begäran om samtycke för marknadsföring</h2>
        <p>Hej {parentName},</p>
        <p>Vi skulle vilja skicka information om nya funktioner och pedagogiska tips som kan hjälpa {studentName}s lärande.</p>
        
        <h3>Vad innebär detta?</h3>
        <ul>
          <li>Nyhetsbrev med pedagogiska tips och resurser</li>
          <li>Information om nya funktioner i Skolapp</li>
          <li>Inga reklammejl från tredje part</li>
          <li>Enkelt att avsluta prenumeration när som helst</li>
        </ul>
        
        <p><a href="{consentUrl}">Hantera marknadsföringssamtycke</a></p>
      `,
      textBody: `
Begäran om samtycke för marknadsföring

Hej {parentName},

Vi skulle vilja skicka information om nya funktioner och pedagogiska tips som kan hjälpa {studentName}s lärande.

Hantera samtycke: {consentUrl}
      `,
      legalNotice: 'Enligt GDPR artikel 6(1)(a) krävs uttryckligt samtycke för marknadsföring via e-post.'
    },
    en: {
      type: 'marketing',
      language: 'en',
      subject: 'Consent: Marketing and Newsletter from Skolapp',
      htmlBody: `
        <h2>Marketing Consent Request</h2>
        <p>Hello {parentName},</p>
        <p>We would like to send information about new features and educational tips that can help {studentName}s learning.</p>
        
        <p><a href="{consentUrl}">Manage Marketing Consent</a></p>
      `,
      textBody: `
Marketing Consent Request

Hello {parentName},

We would like to send information about new features and educational tips that can help {studentName}s learning.

Manage consent: {consentUrl}
      `,
      legalNotice: 'According to GDPR Article 6(1)(a), explicit consent is required for email marketing.'
    }
  },
  analytics: {
    sv: {
      type: 'analytics',
      language: 'sv',
      subject: 'Samtycke: Användningsanalys för förbättring av Skolapp',
      htmlBody: `
        <h2>Begäran om samtycke för användningsanalys</h2>
        <p>Hej {parentName},</p>
        <p>Vi skulle vilja samla anonymiserad statistik om hur {studentName} använder Skolapp för att förbättra applikationen.</p>
        
        <p><a href="{consentUrl}">Hantera analyssamtycke</a></p>
      `,
      textBody: `
Begäran om samtycke för användningsanalys

Hej {parentName},

Vi skulle vilja samla anonymiserad statistik om hur {studentName} använder Skolapp för att förbättra applikationen.

Hantera samtycke: {consentUrl}
      `,
      legalNotice: 'Enligt GDPR artikel 6(1)(a) krävs samtycke för insamling av användningsdata, även anonymiserad.'
    },
    en: {
      type: 'analytics',
      language: 'en',
      subject: 'Consent: Usage Analytics for Skolapp Improvement',
      htmlBody: `
        <h2>Analytics Consent Request</h2>
        <p>Hello {parentName},</p>
        <p>We would like to collect anonymized statistics about how {studentName} uses Skolapp to improve the application.</p>
        
        <p><a href="{consentUrl}">Manage Analytics Consent</a></p>
      `,
      textBody: `
Analytics Consent Request

Hello {parentName},

We would like to collect anonymized statistics about how {studentName} uses Skolapp to improve the application.

Manage consent: {consentUrl}
      `,
      legalNotice: 'According to GDPR Article 6(1)(a), consent is required for collecting usage data, even anonymized.'
    }
  }
}

export class ParentalConsentService {
  private baseUrl: string

  constructor(baseUrl: string = 'https://skolapp.se') {
    this.baseUrl = baseUrl
  }

  /**
   * Create a new consent request
   */
  async createConsentRequest(request: Omit<ConsentRequest, 'id' | 'requestedAt' | 'expiresAt'>): Promise<ConsentRequest> {
    const now = new Date()
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const consentRequest: ConsentRequest = {
      ...request,
      id: `consent_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestedAt: now,
      expiresAt: expiryDate
    }

    // Store the request (in real implementation, this would go to database)
    await this.storeConsentRequest(consentRequest)

    return consentRequest
  }

  /**
   * Generate consent URL for different methods
   */
  generateConsentUrl(consentId: string, method: ConsentRequest['method']): string {
    const baseConsentUrl = `${this.baseUrl}/consent/${consentId}`
    
    switch (method) {
      case 'email_link':
      case 'sms_link':
        return `${baseConsentUrl}?method=${method}&token=${this.generateSecureToken()}`
      case 'qr_code':
        return `${baseConsentUrl}?method=qr&qr=1`
      case 'digital_signature':
        return `${baseConsentUrl}?method=signature&secure=1`
      default:
        return baseConsentUrl
    }
  }

  /**
   * Generate QR code for consent request
   */
  async generateConsentQRCode(consentRequest: ConsentRequest): Promise<string> {
    const consentUrl = this.generateConsentUrl(consentRequest.id, 'qr_code')
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(consentUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff' // White
        },
        width: 256
      })
      
      return qrCodeDataUrl
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      throw new Error('QR-kod kunde inte genereras')
    }
  }

  /**
   * Send consent request via specified method
   */
  async sendConsentRequest(consentRequest: ConsentRequest): Promise<{ success: boolean; method: string; identifier: string }> {
    const template = CONSENT_TEMPLATES[consentRequest.consentType][consentRequest.language]
    const consentUrl = this.generateConsentUrl(consentRequest.id, consentRequest.method)

    const templateVars = {
      parentName: consentRequest.parentName,
      studentName: consentRequest.studentName,
      teacherName: consentRequest.teacherName,
      schoolName: consentRequest.schoolName || 'Skolan',
      consentUrl,
      expiryDate: consentRequest.expiresAt.toLocaleDateString('sv-SE')
    }

    const subject = this.replaceTemplateVars(template.subject, templateVars)
    const htmlBody = this.replaceTemplateVars(template.htmlBody, templateVars)
    const textBody = this.replaceTemplateVars(template.textBody, templateVars)

    switch (consentRequest.method) {
      case 'email_link':
        return await this.sendConsentEmail(consentRequest.parentEmail, subject, htmlBody, textBody)
      
      case 'sms_link':
        return await this.sendConsentSMS(consentRequest.parentPhone!, consentUrl, consentRequest.studentName)
      
      case 'qr_code':
        // QR code would typically be displayed/printed by the teacher
        return { success: true, method: 'qr_code', identifier: consentUrl }
      
      case 'digital_signature':
        // Digital signature requires special handling
        return await this.initiateDigitalSignature(consentRequest)
      
      default:
        throw new Error(`Okänd samtyckes-metod: ${consentRequest.method}`)
    }
  }

  /**
   * Process consent response
   */
  async processConsentResponse(response: ConsentResponse): Promise<{ success: boolean; consentRecord: ConsentRecord }> {
    // Create audit entry
    const auditEntry: ConsentAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: response.timestamp,
      action: response.status === 'approved' ? 'approved' : 'denied',
      details: `Consent ${response.status} via ${response.parentIdentityVerified ? 'verified' : 'unverified'} channel`,
      ipAddress: response.ipAddress,
      userAgent: response.userAgent
    }

    // In real implementation, this would update the database
    // and create proper ConsentRecord
    const consentRecord: ConsentRecord = {
      id: response.consentId,
      studentId: '', // Would be filled from database
      parentEmail: '',
      parentName: '',
      consentType: 'data_retention',
      status: response.status,
      requestedAt: new Date(),
      respondedAt: response.timestamp,
      expiresAt: new Date(),
      ipAddress: response.ipAddress,
      userAgent: response.userAgent,
      consentMethod: 'email_link',
      auditLog: [auditEntry]
    }

    return { success: true, consentRecord }
  }

  /**
   * Send reminder for pending consent
   */
  async sendConsentReminder(consentRequest: ConsentRequest): Promise<{ success: boolean }> {
    // Check if not too many reminders have been sent
    const maxReminders = 3
    const reminderCount = consentRequest.reminderSent?.length || 0
    
    if (reminderCount >= maxReminders) {
      throw new Error('Maximalt antal påminnelser har skickats')
    }

    // Send reminder using same method as original request
    const result = await this.sendConsentRequest({
      ...consentRequest,
      urgency: 'medium' // Escalate urgency for reminders
    })

    if (result.success) {
      // Update reminder tracking
      const updatedRequest = {
        ...consentRequest,
        reminderSent: [...(consentRequest.reminderSent || []), new Date()]
      }
      await this.storeConsentRequest(updatedRequest)
    }

    return result
  }

  /**
   * Get consent metrics for analytics
   */
  async getConsentMetrics(schoolId?: string, dateRange?: { start: Date; end: Date }): Promise<ConsentMetrics> {
    // In real implementation, this would query the database
    // For now, return mock metrics
    return {
      totalRequests: 150,
      approvedCount: 120,
      deniedCount: 15,
      pendingCount: 10,
      expiredCount: 5,
      approvalRate: 0.8,
      averageResponseTime: 24.5,
      methodBreakdown: {
        email_link: 100,
        qr_code: 30,
        digital_signature: 15,
        sms_link: 5
      }
    }
  }

  /**
   * Validate consent is still active and not expired
   */
  isConsentValid(consentRecord: ConsentRecord): boolean {
    const now = new Date()
    return (
      consentRecord.status === 'approved' &&
      consentRecord.expiresAt > now
    )
  }

  /**
   * Revoke consent and trigger data deletion
   */
  async revokeConsent(consentRecord: ConsentRecord, reason: string): Promise<{ success: boolean; deletionInitiated: boolean }> {
    // Add audit entry for revocation
    const auditEntry: ConsentAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      action: 'revoked',
      details: `Consent revoked: ${reason}`,
    }

    // Update consent record
    const updatedRecord: ConsentRecord = {
      ...consentRecord,
      status: 'denied',
      auditLog: [...consentRecord.auditLog, auditEntry]
    }

    // Initiate data deletion process
    const deletionInitiated = await this.initiateDataDeletion(consentRecord.studentId)

    return { success: true, deletionInitiated }
  }

  // Private helper methods

  private replaceTemplateVars(template: string, vars: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] || match)
  }

  private generateSecureToken(): string {
    return Math.random().toString(36).substr(2, 15) + Date.now().toString(36)
  }

  private async storeConsentRequest(request: ConsentRequest): Promise<void> {
    // In real implementation, store in database
    console.log('Storing consent request:', request.id)
  }

  private async sendConsentEmail(email: string, subject: string, htmlBody: string, textBody: string): Promise<{ success: boolean; method: string; identifier: string }> {
    // In real implementation, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Sending consent email to ${email}`)
    console.log(`Subject: ${subject}`)
    
    return { success: true, method: 'email', identifier: email }
  }

  private async sendConsentSMS(phone: string, consentUrl: string, studentName: string): Promise<{ success: boolean; method: string; identifier: string }> {
    // In real implementation, integrate with SMS service (Twilio, etc.)
    const message = `Samtycke krävs för ${studentName}s skoldata. Hantera: ${consentUrl}`
    console.log(`Sending SMS to ${phone}: ${message}`)
    
    return { success: true, method: 'sms', identifier: phone }
  }

  private async initiateDigitalSignature(request: ConsentRequest): Promise<{ success: boolean; method: string; identifier: string }> {
    // In real implementation, integrate with digital signature service (DocuSign, BankID, etc.)
    console.log(`Initiating digital signature for consent ${request.id}`)
    
    return { success: true, method: 'digital_signature', identifier: request.id }
  }

  private async initiateDataDeletion(studentId: string): Promise<boolean> {
    // In real implementation, this would trigger GDPR data deletion process
    console.log(`Initiating data deletion for student ${studentId}`)
    return true
  }
}

// Export singleton instance
export const parentalConsentService = new ParentalConsentService()