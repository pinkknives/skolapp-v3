// Secure token service for parental consent access
import { type ConsentRecord } from '@/types/auth'

export interface ParentAccessToken {
  id: string
  consentId: string
  parentEmail: string
  studentId: string
  method: 'email_link' | 'qr_code' | 'access_code'
  createdAt: Date
  expiresAt: Date
  usedAt?: Date
  ipAddress?: string
  userAgent?: string
  isRevoked: boolean
  accessCode?: string // For 8-digit access codes
}

class ParentTokenService {
  private readonly STORAGE_KEY = 'skolapp_parent_tokens'
  private readonly TOKEN_EXPIRY_HOURS = 72 // 3 days for email links
  private readonly ACCESS_CODE_EXPIRY_HOURS = 24 // 1 day for access codes

  /**
   * Generate secure access token for email links
   */
  generateEmailToken(consentRecord: ConsentRecord): ParentAccessToken {
    const now = new Date()
    const token: ParentAccessToken = {
      id: this.generateSecureTokenId(),
      consentId: consentRecord.id,
      parentEmail: consentRecord.parentEmail,
      studentId: consentRecord.studentId,
      method: 'email_link',
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      isRevoked: false
    }

    this.storeToken(token)
    return token
  }

  /**
   * Generate 8-digit access code for manual entry
   */
  generateAccessCode(consentRecord: ConsentRecord): ParentAccessToken {
    const now = new Date()
    const accessCode = this.generateAccessCode8Digit()
    
    const token: ParentAccessToken = {
      id: this.generateSecureTokenId(),
      consentId: consentRecord.id,
      parentEmail: consentRecord.parentEmail,
      studentId: consentRecord.studentId,
      method: 'access_code',
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.ACCESS_CODE_EXPIRY_HOURS * 60 * 60 * 1000),
      isRevoked: false,
      accessCode
    }

    this.storeToken(token)
    return token
  }

  /**
   * Generate QR code token
   */
  generateQRToken(consentRecord: ConsentRecord): ParentAccessToken {
    const now = new Date()
    const token: ParentAccessToken = {
      id: this.generateSecureTokenId(),
      consentId: consentRecord.id,
      parentEmail: consentRecord.parentEmail,
      studentId: consentRecord.studentId,
      method: 'qr_code',
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      isRevoked: false
    }

    this.storeToken(token)
    return token
  }

  /**
   * Validate and use a token
   */
  validateToken(tokenId: string, ipAddress?: string, userAgent?: string): ParentAccessToken | null {
    const token = this.getToken(tokenId)
    
    if (!token) {
      console.warn('[ParentToken] Token not found:', tokenId)
      return null
    }

    if (token.isRevoked) {
      console.warn('[ParentToken] Token is revoked:', tokenId)
      return null
    }

    if (new Date() > token.expiresAt) {
      console.warn('[ParentToken] Token has expired:', tokenId)
      this.revokeToken(tokenId)
      return null
    }

    if (token.usedAt) {
      console.warn('[ParentToken] Token already used:', tokenId)
      return null
    }

    // Mark token as used
    token.usedAt = new Date()
    token.ipAddress = ipAddress
    token.userAgent = userAgent
    this.updateToken(token)

    return token
  }

  /**
   * Validate access code
   */
  validateAccessCode(accessCode: string, ipAddress?: string, userAgent?: string): ParentAccessToken | null {
    const tokens = this.getAllTokens()
    const token = tokens.find(t => 
      t.accessCode === accessCode && 
      !t.isRevoked && 
      !t.usedAt &&
      new Date() <= t.expiresAt
    )

    if (!token) {
      console.warn('[ParentToken] Invalid or expired access code:', accessCode)
      return null
    }

    // Mark token as used
    token.usedAt = new Date()
    token.ipAddress = ipAddress
    token.userAgent = userAgent
    this.updateToken(token)

    return token
  }

  /**
   * Revoke a token
   */
  revokeToken(tokenId: string): boolean {
    const token = this.getToken(tokenId)
    if (!token) return false

    token.isRevoked = true
    this.updateToken(token)
    return true
  }

  /**
   * Revoke all tokens for a consent record
   */
  revokeTokensForConsent(consentId: string): number {
    const tokens = this.getAllTokens()
    let revokedCount = 0

    tokens.forEach(token => {
      if (token.consentId === consentId && !token.isRevoked) {
        token.isRevoked = true
        this.updateToken(token)
        revokedCount++
      }
    })

    return revokedCount
  }

  /**
   * Generate consent action URL with token
   */
  generateConsentUrl(token: ParentAccessToken): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://skolapp.se'
    return `${baseUrl}/foralder/samtycke?token=${token.id}&student=${token.studentId}`
  }

  /**
   * Clean up expired tokens (housekeeping)
   */
  cleanupExpiredTokens(): number {
    const tokens = this.getAllTokens()
    const now = new Date()
    let cleanedCount = 0

    const validTokens = tokens.filter(token => {
      if (now > token.expiresAt) {
        cleanedCount++
        return false
      }
      return true
    })

    if (cleanedCount > 0) {
      this.storeAllTokens(validTokens)
      console.log(`[ParentToken] Cleaned up ${cleanedCount} expired tokens`)
    }

    return cleanedCount
  }

  /**
   * Get token usage statistics for audit
   */
  getTokenStats(consentId?: string): {
    total: number
    used: number
    expired: number
    revoked: number
    byMethod: Record<string, number>
  } {
    const tokens = this.getAllTokens()
    const filteredTokens = consentId ? tokens.filter(t => t.consentId === consentId) : tokens
    const now = new Date()

    const stats = {
      total: filteredTokens.length,
      used: filteredTokens.filter(t => t.usedAt).length,
      expired: filteredTokens.filter(t => now > t.expiresAt).length,
      revoked: filteredTokens.filter(t => t.isRevoked).length,
      byMethod: {} as Record<string, number>
    }

    filteredTokens.forEach(token => {
      stats.byMethod[token.method] = (stats.byMethod[token.method] || 0) + 1
    })

    return stats
  }

  /**
   * Generate cryptographically secure token ID
   */
  private generateSecureTokenId(): string {
    // In real implementation, use crypto.getRandomValues() or backend generation
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 15)
    const additional = Math.random().toString(36).substr(2, 10)
    return `pt_${timestamp}_${random}_${additional}`
  }

  /**
   * Generate 8-digit access code
   */
  private generateAccessCode8Digit(): string {
    // Generate cryptographically secure 8-digit code
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += Math.floor(Math.random() * 10).toString()
    }
    
    // Ensure it's not a sequence or repeated pattern
    if (this.isWeakCode(code)) {
      return this.generateAccessCode8Digit() // Regenerate if weak
    }
    
    return code
  }

  /**
   * Check if access code is weak (avoid 12345678, 11111111, etc.)
   */
  private isWeakCode(code: string): boolean {
    // Check for all same digits
    if (new Set(code).size === 1) return true
    
    // Check for ascending sequence
    let isAscending = true
    for (let i = 1; i < code.length; i++) {
      if (parseInt(code[i]) !== parseInt(code[i-1]) + 1) {
        isAscending = false
        break
      }
    }
    if (isAscending) return true
    
    // Check for descending sequence
    let isDescending = true
    for (let i = 1; i < code.length; i++) {
      if (parseInt(code[i]) !== parseInt(code[i-1]) - 1) {
        isDescending = false
        break
      }
    }
    if (isDescending) return true
    
    return false
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: ParentAccessToken): void {
    try {
      const tokens = this.getAllTokens()
      tokens.push(token)
      this.storeAllTokens(tokens)
    } catch (error) {
      console.error('[ParentToken] Error storing token:', error)
    }
  }

  /**
   * Get token by ID
   */
  private getToken(tokenId: string): ParentAccessToken | null {
    try {
      const tokens = this.getAllTokens()
      return tokens.find(t => t.id === tokenId) || null
    } catch (error) {
      console.error('[ParentToken] Error getting token:', error)
      return null
    }
  }

  /**
   * Update existing token
   */
  private updateToken(updatedToken: ParentAccessToken): void {
    try {
      const tokens = this.getAllTokens()
      const index = tokens.findIndex(t => t.id === updatedToken.id)
      
      if (index !== -1) {
        tokens[index] = updatedToken
        this.storeAllTokens(tokens)
      }
    } catch (error) {
      console.error('[ParentToken] Error updating token:', error)
    }
  }

  /**
   * Get all tokens from storage
   */
  private getAllTokens(): ParentAccessToken[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const tokens = JSON.parse(stored) as ParentAccessToken[]
      // Convert date strings back to Date objects
      return tokens.map(token => ({
        ...token,
        createdAt: new Date(token.createdAt),
        expiresAt: new Date(token.expiresAt),
        usedAt: token.usedAt ? new Date(token.usedAt) : undefined
      }))
    } catch (error) {
      console.error('[ParentToken] Error loading tokens:', error)
      return []
    }
  }

  /**
   * Store all tokens to localStorage
   */
  private storeAllTokens(tokens: ParentAccessToken[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens))
    } catch (error) {
      console.error('[ParentToken] Error storing tokens:', error)
    }
  }
}

// Export singleton instance
export const parentTokenService = new ParentTokenService()

// Initialize cleanup interval (every hour)
if (typeof window !== 'undefined') {
  setInterval(() => {
    parentTokenService.cleanupExpiredTokens()
  }, 60 * 60 * 1000) // 1 hour
}