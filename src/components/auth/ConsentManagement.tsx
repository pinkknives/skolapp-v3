'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { 
  type ConsentRecord, 
  type ConsentStatus,
  type User 
} from '@/types/auth'
import { 
  type ConsentRequest,
  parentalConsentService 
} from '@/lib/parental-consent-service'
import { motion } from 'framer-motion'

interface ConsentManagementProps {
  user: User
  onConsentSent?: (request: ConsentRequest) => void
  onConsentReceived?: (record: ConsentRecord) => void
  className?: string
}

export function ConsentManagement({
  user,
  onConsentSent,
  onConsentReceived,
  className
}: ConsentManagementProps) {
  const [step, setStep] = useState<'info' | 'details' | 'method' | 'sending' | 'sent'>('info')
  const [parentInfo, setParentInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [consentMethod, setConsentMethod] = useState<ConsentRequest['method']>('email_link')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendConsent = async () => {
    setIsLoading(true)
    setStep('sending')

    try {
      // Create consent request
      const request = await parentalConsentService.createConsentRequest({
        studentId: user.id,
        studentName: `${user.firstName} ${user.lastName}`,
        teacherId: 'current_teacher', // Would come from context
        teacherName: 'Läraren', // Would come from context
        schoolName: 'Skolan', // Would come from context
        parentEmail: parentInfo.email,
        parentName: parentInfo.name,
        parentPhone: parentInfo.phone || undefined,
        consentType: 'data_retention',
        method: consentMethod,
        urgency: 'medium',
        language: 'sv'
      })

      // Generate QR code if needed
      if (consentMethod === 'qr_code') {
        const qrCode = await parentalConsentService.generateConsentQRCode(request)
        setQrCodeUrl(qrCode)
      }

      // Send the request
      await parentalConsentService.sendConsentRequest(request)

      setStep('sent')
      onConsentSent?.(request)
    } catch (error) {
      console.error('Failed to send consent request:', error)
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'info':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-info-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <Typography variant="h6" className="mb-4">
                Föräldrasamtycke krävs
              </Typography>
              <Typography variant="body1" className="text-neutral-600 max-w-md mx-auto">
                För att aktivera långtidslagring av {user.firstName}s quiz-resultat och lärprogression 
                behöver vi samtycke från förälder eller vårdnadshavare enligt GDPR.
              </Typography>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4">
              <Typography variant="subtitle2" className="font-medium mb-2">
                Vad innebär långtidslagring?
              </Typography>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li>• Quiz-resultat sparas för att följa progression över tid</li>
                <li>• Läraren kan se utveckling och identifiera styrkor/svårigheter</li>
                <li>• Data används endast för pedagogiska ändamål</li>
                <li>• Samtycket kan återkallas när som helst</li>
                <li>• All data raderas om samtycke återkallas</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setStep('details')}>
                Fortsätt med samtycke
              </Button>
            </div>
          </div>
        )

      case 'details':
        return (
          <div className="space-y-6">
            <Typography variant="h6" className="text-center mb-6">
              Förälder/vårdnadshavare uppgifter
            </Typography>

            <div className="space-y-4">
              <Input
                label="Förälders namn"
                placeholder="För- och efternamn"
                value={parentInfo.name}
                onChange={(e) => setParentInfo(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <Input
                label="E-postadress"
                type="email"
                placeholder="foralder@example.com"
                value={parentInfo.email}
                onChange={(e) => setParentInfo(prev => ({ ...prev, email: e.target.value }))}
                required
                helperText="Vi skickar samtyckesbegäran till denna adress"
              />

              <Input
                label="Telefonnummer (valfritt)"
                type="tel"
                placeholder="070-123 45 67"
                value={parentInfo.phone}
                onChange={(e) => setParentInfo(prev => ({ ...prev, phone: e.target.value }))}
                helperText="För SMS-påminnelser om begäran"
              />
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setStep('info')}>
                Tillbaka
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setStep('method')}
                disabled={!parentInfo.name || !parentInfo.email}
              >
                Nästa
              </Button>
            </div>
          </div>
        )

      case 'method':
        return (
          <div className="space-y-6">
            <Typography variant="h6" className="text-center mb-6">
              Välj kontaktmetod
            </Typography>

            <div className="space-y-4">
              {[
                {
                  method: 'email_link' as const,
                  title: 'E-post med länk',
                  description: 'Skicka en säker länk via e-post som föräldern klickar på',
                  icon: '📧',
                  recommended: true
                },
                {
                  method: 'qr_code' as const,
                  title: 'QR-kod',
                  description: 'Generera en QR-kod som kan skickas eller visas för föräldern',
                  icon: '📱'
                },
                {
                  method: 'sms_link' as const,
                  title: 'SMS med länk',
                  description: 'Skicka en kort länk via SMS (kräver telefonnummer)',
                  icon: '💬',
                  disabled: !parentInfo.phone
                },
                {
                  method: 'digital_signature' as const,
                  title: 'Digital signatur',
                  description: 'BankID eller annan stark autentisering (premium-funktion)',
                  icon: '🔐',
                  premium: true
                }
              ].map((option) => (
                <div
                  key={option.method}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    consentMethod === option.method 
                      ? 'border-primary-500 bg-primary-50' 
                      : option.disabled
                        ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed opacity-60'
                        : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  onClick={() => !option.disabled && setConsentMethod(option.method)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Typography variant="subtitle2" className="font-medium">
                          {option.title}
                        </Typography>
                        {option.recommended && (
                          <span className="bg-success-100 text-success-700 text-xs px-2 py-0.5 rounded">
                            Rekommenderad
                          </span>
                        )}
                        {option.premium && (
                          <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded">
                            Premium
                          </span>
                        )}
                        {option.disabled && (
                          <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-0.5 rounded">
                            Ej tillgänglig
                          </span>
                        )}
                      </div>
                      <Typography variant="body2" className="text-neutral-600">
                        {option.description}
                      </Typography>
                      {consentMethod === option.method && (
                        <div className="mt-2 flex items-center space-x-1 text-primary-600">
                          <span className="text-sm">✓</span>
                          <span className="text-sm font-medium">Vald</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setStep('details')}>
                Tillbaka
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSendConsent}
                disabled={isLoading}
              >
                Skicka samtyckesbegäran
              </Button>
            </div>
          </div>
        )

      case 'sending':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                ⏳
              </motion.div>
            </div>
            <Typography variant="h6">
              Skickar samtyckesbegäran...
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Vi förbereder och skickar begäran till {parentInfo.name}
            </Typography>
          </div>
        )

      case 'sent':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            
            <div>
              <Typography variant="h6" className="mb-2">
                Samtyckesbegäran skickad!
              </Typography>
              <Typography variant="body1" className="text-neutral-600">
                {consentMethod === 'email_link' && (
                  <>E-post skickad till <strong>{parentInfo.email}</strong></>
                )}
                {consentMethod === 'sms_link' && (
                  <>SMS skickat till <strong>{parentInfo.phone}</strong></>
                )}
                {consentMethod === 'qr_code' && (
                  <>QR-kod genererad för <strong>{parentInfo.name}</strong></>
                )}
                {consentMethod === 'digital_signature' && (
                  <>Digital signatur-begäran skickad till <strong>{parentInfo.email}</strong></>
                )}
              </Typography>
            </div>

            {consentMethod === 'qr_code' && qrCodeUrl && (
              <div className="space-y-4">
                <Typography variant="subtitle2" className="font-medium">
                  Visa eller skicka denna QR-kod till föräldern:
                </Typography>
                <div className="flex justify-center">
                  <img src={qrCodeUrl} alt="QR-kod för samtycke" className="w-48 h-48" />
                </div>
                <Button variant="outline" onClick={() => {
                  // Download QR code
                  const link = document.createElement('a')
                  link.href = qrCodeUrl
                  link.download = `samtycke-qr-${user.firstName}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}>
                  Ladda ner QR-kod
                </Button>
              </div>
            )}

            <div className="bg-info-50 rounded-lg p-4">
              <Typography variant="subtitle2" className="font-medium mb-2 text-info-800">
                Nästa steg:
              </Typography>
              <ul className="text-sm text-info-700 space-y-1">
                <li>• Föräldern får instruktioner via {
                  consentMethod === 'email_link' ? 'e-post' :
                  consentMethod === 'sms_link' ? 'SMS' :
                  consentMethod === 'qr_code' ? 'QR-kod' :
                  'digital signatur'
                }</li>
                <li>• De kan godkänna eller neka samtycket säkert online</li>
                <li>• Du får besked så snart svaret kommit in</li>
                <li>• Påminnelser skickas automatiskt om ingen respons inom 3 dagar</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => {
                // Reset form
                setStep('info')
                setParentInfo({ name: '', email: '', phone: '' })
                setConsentMethod('email_link')
                setQrCodeUrl('')
              }}>
                Skicka till annan förälder
              </Button>
              <Button variant="primary" onClick={() => {
                // Close or continue
              }}>
                Klar
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={className}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Föräldrasamtycke</CardTitle>
            {step !== 'info' && step !== 'sent' && (
              <div className="flex space-x-2">
                {['info', 'details', 'method'].map((stepName, index) => (
                  <div
                    key={stepName}
                    className={`w-3 h-3 rounded-full ${
                      ['info', 'details', 'method'].indexOf(step) >= index
                        ? 'bg-primary-500'
                        : 'bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}

// Consent status component for showing current consent state
interface ConsentStatusProps {
  consentRecord?: ConsentRecord
  user: User
  onRequestNew?: () => void
  className?: string
}

export function ConsentStatus({
  consentRecord,
  user,
  onRequestNew,
  className
}: ConsentStatusProps) {
  const getStatusColor = (status: ConsentStatus) => {
    switch (status) {
      case 'approved': return 'success'
      case 'denied': return 'error'
      case 'expired': return 'warning'
      case 'pending': return 'info'
      default: return 'neutral'
    }
  }

  const getStatusText = (status: ConsentStatus) => {
    switch (status) {
      case 'approved': return 'Godkänt'
      case 'denied': return 'Nekat'
      case 'expired': return 'Utgånget'
      case 'pending': return 'Väntar på svar'
      default: return 'Okänt'
    }
  }

  if (!consentRecord) {
    return (
      <Card className={`border-warning-300 bg-warning-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <span className="text-warning-600 text-lg">⚠️</span>
            <div className="flex-1">
              <Typography variant="subtitle2" className="text-warning-800 mb-1">
                Samtycke saknas
              </Typography>
              <Typography variant="body2" className="text-warning-700 mb-3">
                För att aktivera långtidslagring behöver vi föräldrasamtycke för {user.firstName}.
              </Typography>
              <Button variant="outline" size="sm" onClick={onRequestNew}>
                Begär samtycke
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusColor = getStatusColor(consentRecord.status)
  
  return (
    <Card className={`border-${statusColor}-300 bg-${statusColor}-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <span className={`text-${statusColor}-600 text-lg`}>
            {consentRecord.status === 'approved' ? '✅' : 
             consentRecord.status === 'denied' ? '❌' : 
             consentRecord.status === 'expired' ? '⏰' : '⏳'}
          </span>
          <div className="flex-1">
            <Typography variant="subtitle2" className={`text-${statusColor}-800 mb-1`}>
              Samtycke: {getStatusText(consentRecord.status)}
            </Typography>
            <Typography variant="body2" className={`text-${statusColor}-700 mb-2`}>
              {consentRecord.status === 'approved' && 
                `Godkänt av ${consentRecord.parentName} den ${consentRecord.respondedAt?.toLocaleDateString('sv-SE')}`
              }
              {consentRecord.status === 'denied' && 
                `Nekat av ${consentRecord.parentName} den ${consentRecord.respondedAt?.toLocaleDateString('sv-SE')}`
              }
              {consentRecord.status === 'pending' && 
                `Skickat till ${consentRecord.parentEmail} den ${consentRecord.requestedAt.toLocaleDateString('sv-SE')}`
              }
              {consentRecord.status === 'expired' && 
                `Gick ut den ${consentRecord.expiresAt.toLocaleDateString('sv-SE')}`
              }
            </Typography>
            
            {(consentRecord.status === 'denied' || consentRecord.status === 'expired') && (
              <Button variant="outline" size="sm" onClick={onRequestNew}>
                Skicka nytt samtycke
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}