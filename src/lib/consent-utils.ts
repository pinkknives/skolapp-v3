import { supabaseBrowser } from './supabase-browser'

export interface ConsentStatus {
  hasValidConsent: boolean
  requiresConsent: boolean
  status: 'missing' | 'pending' | 'granted' | 'revoked' | 'expired'
  expiresAt?: string
  orgId?: string
}

/**
 * Check if a student has valid consent for long-term data storage
 */
export async function checkStudentConsent(
  studentId: string,
  orgId: string
): Promise<ConsentStatus> {
  const supabase = supabaseBrowser()

  try {
    // Get organization settings
    const { data: orgSettings } = await supabase
      .from('org_settings')
      .select('require_guardian_consent')
      .eq('org_id', orgId)
      .single()

    const requiresConsent = orgSettings?.require_guardian_consent || false

    // If consent is not required, long-term mode is allowed
    if (!requiresConsent) {
      return {
        hasValidConsent: true,
        requiresConsent: false,
        status: 'granted'
      }
    }

    // Check for existing consent record
    const { data: consent } = await supabase
      .from('guardian_consents')
      .select('status, granted_at, expires_at')
      .eq('org_id', orgId)
      .eq('student_id', studentId)
      .single()

    if (!consent) {
      return {
        hasValidConsent: false,
        requiresConsent: true,
        status: 'missing',
        orgId
      }
    }

    // Check if consent is granted and not expired
    const now = new Date()
    const isExpired = consent.expires_at && new Date(consent.expires_at) < now
    
    if (consent.status === 'granted' && !isExpired) {
      return {
        hasValidConsent: true,
        requiresConsent: true,
        status: 'granted',
        expiresAt: consent.expires_at,
        orgId
      }
    }

    // Handle expired consent
    if (isExpired && consent.status === 'granted') {
      // Update status to expired
      await supabase
        .from('guardian_consents')
        .update({ status: 'expired' })
        .eq('org_id', orgId)
        .eq('student_id', studentId)

      return {
        hasValidConsent: false,
        requiresConsent: true,
        status: 'expired',
        expiresAt: consent.expires_at,
        orgId
      }
    }

    return {
      hasValidConsent: false,
      requiresConsent: true,
      status: consent.status as ConsentStatus['status'],
      expiresAt: consent.expires_at,
      orgId
    }

  } catch (error) {
    console.error('Error checking student consent:', error)
    return {
      hasValidConsent: false,
      requiresConsent: true,
      status: 'missing'
    }
  }
}

/**
 * Check consent for multiple students
 */
export async function checkMultipleStudentConsents(
  studentIds: string[],
  orgId: string
): Promise<Record<string, ConsentStatus>> {
  const results = await Promise.all(
    studentIds.map(async (studentId) => ({
      studentId,
      consent: await checkStudentConsent(studentId, orgId)
    }))
  )

  return results.reduce((acc, { studentId, consent }) => ({
    ...acc,
    [studentId]: consent
  }), {})
}

/**
 * Get list of students that need consent for long-term data storage
 */
export async function getStudentsNeedingConsent(
  studentIds: string[],
  orgId: string
): Promise<string[]> {
  const consents = await checkMultipleStudentConsents(studentIds, orgId)
  
  return Object.entries(consents)
    .filter(([_, consent]) => consent.requiresConsent && !consent.hasValidConsent)
    .map(([studentId]) => studentId)
}

/**
 * Determine data mode for quiz attempt based on consent
 */
export async function determineDataMode(
  studentId: string,
  orgId: string
): Promise<'short' | 'long'> {
  const consent = await checkStudentConsent(studentId, orgId)
  return consent.hasValidConsent ? 'long' : 'short'
}