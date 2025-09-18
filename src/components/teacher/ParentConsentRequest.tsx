'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { longTermDataService } from '@/lib/long-term-data'
import { parentTokenService } from '@/lib/parent-tokens'
import { consentNotificationService } from '@/lib/consent-notifications'
import { type User } from '@/types/auth'

interface ParentConsentRequestProps {
  student: User
  onComplete?: () => void
}

export function ParentConsentRequest({ student, onComplete }: ParentConsentRequestProps) {
  const [parentEmail, setParentEmail] = useState('')
  const [parentName, setParentName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedTokens, setGeneratedTokens] = useState<{
    accessCode?: string
    emailLink?: string
    qrCode?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create consent record
      const consentRecord = longTermDataService.createConsentRecord(
        student.id,
        parentEmail,
        parentName,
        'email_link'
      )

      // Generate access tokens
      const accessCodeToken = parentTokenService.generateAccessCode(consentRecord)
      const emailToken = parentTokenService.generateEmailToken(consentRecord)
      const qrToken = parentTokenService.generateQRToken(consentRecord)

      // Generate access URLs
      const emailLink = parentTokenService.generateConsentUrl(emailToken)
      const qrCode = consentNotificationService.generateConsentQRCode(consentRecord.id)

      setGeneratedTokens({
        accessCode: accessCodeToken.accessCode,
        emailLink,
        qrCode
      })

      // Send notification email (in demo mode)
      try {
        await consentNotificationService.sendConsentRequest(
          student,
          parentEmail,
          parentName,
          consentRecord
        )
        console.log('[Teacher] Consent notification sent successfully')
      } catch (error) {
        console.warn('[Teacher] Failed to send notification:', error)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('[Teacher] Error creating consent request:', error)
      alert('Ett fel uppstod vid skapande av samtyckesbegäran. Försök igen.')
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} kopierad till urklipp!`)
    }).catch(() => {
      alert('Kunde inte kopiera till urklipp. Markera och kopiera manuellt.')
    })
  }

  if (generatedTokens.accessCode) {
    return (
      <div className="space-y-6">
        <Card className="border-success-200 bg-success-50">
          <CardHeader>
            <CardTitle className="text-success-800">
              ✅ Samtyckesbegäran skapad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body1" className="text-success-700 mb-4">
              Samtyckesbegäran för {student.firstName} {student.lastName} har skapats framgångsrikt.
              En e-post har skickats till {parentEmail}.
            </Typography>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Access Code */}
          <Card>
            <CardHeader>
              <CardTitle>🔢 Åtkomstkod</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body2" className="text-neutral-600 mb-4">
                Dela denna 8-siffriga kod med föräldern för snabb åtkomst:
              </Typography>
              
              <div className="bg-neutral-100 border rounded-lg p-4 text-center mb-4">
                <Typography variant="h2" className="font-mono tracking-wider text-primary-700">
                  {generatedTokens.accessCode}
                </Typography>
              </div>
              
              <Button 
                onClick={() => copyToClipboard(generatedTokens.accessCode!, 'Åtkomstkod')}
                variant="outline"
                size="sm"
                fullWidth
              >
                📋 Kopiera kod
              </Button>
            </CardContent>
          </Card>

          {/* Email Link */}
          <Card>
            <CardHeader>
              <CardTitle>📧 E-postlänk</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body2" className="text-neutral-600 mb-4">
                Säker länk som skickats till föräldern:
              </Typography>
              
              <div className="bg-neutral-100 border rounded-lg p-3 mb-4">
                <Typography variant="body2" className="font-mono text-sm break-all text-neutral-700">
                  {generatedTokens.emailLink}
                </Typography>
              </div>
              
              <Button 
                onClick={() => copyToClipboard(generatedTokens.emailLink!, 'E-postlänk')}
                variant="outline"
                size="sm"
                fullWidth
              >
                📋 Kopiera länk
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle>📱 QR-kod</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-white border rounded-lg flex items-center justify-center">
                <img 
                  src={generatedTokens.qrCode} 
                  alt="QR-kod för samtycke" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex-1">
                <Typography variant="body2" className="text-neutral-600 mb-4">
                  Föräldern kan scanna denna QR-kod med sin mobiltelefon för direkt åtkomst 
                  till samtyckesinställningarna.
                </Typography>
                
                <Button 
                  onClick={() => {
                    // In real implementation, trigger QR code download
                    const link = document.createElement('a')
                    link.href = generatedTokens.qrCode!
                    link.download = `samtycke-qr-${student.firstName}-${student.lastName}.svg`
                    link.click()
                  }}
                  variant="outline"
                  size="sm"
                >
                  💾 Ladda ner QR-kod
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-info-50 border-info-200">
          <CardHeader>
            <CardTitle className="text-info-800">💡 Instruktioner för föräldern</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="text-info-700">
              <strong>Dela dessa alternativ med föräldern:</strong><br />
              1. <strong>E-post:</strong> Kontrollera inkorg för säker länk<br />
              2. <strong>Åtkomstkod:</strong> Gå till skolapp.se/foralder och ange koden<br />
              3. <strong>QR-kod:</strong> Scanna med mobiltelefon för direkt åtkomst<br />
              4. <strong>BankID:</strong> Logga in med BankID på skolapp.se/foralder
            </Typography>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={onComplete} size="lg">
            ✅ Klar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Begär föräldrasamtycke</CardTitle>
      </CardHeader>
      <CardContent>
        <Typography variant="body2" className="text-neutral-600 mb-6">
          Skapa en samtyckesbegäran för {student.firstName} {student.lastName} som vill 
          använda långtidslagring av data.
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Förälder/vårdnadshavares namn"
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Anna Andersson"
            required
          />

          <Input
            label="E-postadress"
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="anna.andersson@exempel.se"
            required
          />

          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
            <Typography variant="body2" className="text-warning-800 text-sm">
              <strong>Observera:</strong> Kontrollera att e-postadressen är korrekt. 
              Föräldern kommer att få en säker länk för att hantera samtycket.
            </Typography>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={!parentName || !parentEmail}
            size="lg"
          >
            📤 Skicka samtyckesbegäran
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}