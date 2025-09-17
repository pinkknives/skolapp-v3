'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { type ConsentRecord, type ConsentStatus } from '@/types/auth'

interface ConsentStatusPanelProps {
  consent: ConsentRecord
  onConsentAction: (action: 'approve' | 'deny' | 'revoke') => Promise<void>
  loading: boolean
}

export function ConsentStatusPanel({ consent, onConsentAction, loading }: ConsentStatusPanelProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState<'approve' | 'deny' | 'revoke' | null>(null)

  const getStatusInfo = (status: ConsentStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: 'warning',
          icon: '⏳',
          title: 'Väntar på svar',
          description: 'Begäran om samtycke väntar på ditt svar.'
        }
      case 'approved':
        return {
          color: 'success',
          icon: '✅',
          title: 'Godkänt',
          description: 'Du har godkänt datalagring för ditt barn.'
        }
      case 'denied':
        return {
          color: 'error',
          icon: '❌',
          title: 'Nekat',
          description: 'Du har nekat datalagring för ditt barn.'
        }
      case 'expired':
        return {
          color: 'neutral',
          icon: '⏰',
          title: 'Upphört',
          description: 'Samtycket har upphört att gälla.'
        }
    }
  }

  const statusInfo = getStatusInfo(consent.status)

  const confirmAction = async (action: 'approve' | 'deny' | 'revoke') => {
    setShowConfirmDialog(null)
    await onConsentAction(action)
  }

  const isExpired = consent.expiresAt && new Date() > new Date(consent.expiresAt)
  const canModify = consent.status === 'pending' || (consent.status === 'approved' && !isExpired)

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className={`border-${statusInfo.color}-200 bg-${statusInfo.color}-50`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">{statusInfo.icon}</div>
            <div className="flex-1">
              <Typography variant="h3" className={`text-${statusInfo.color}-800 mb-2`}>
                {statusInfo.title}
              </Typography>
              <Typography variant="body1" className={`text-${statusInfo.color}-700 mb-4`}>
                {statusInfo.description}
              </Typography>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Typography variant="subtitle2" className={`text-${statusInfo.color}-800`}>
                    Begärd datum:
                  </Typography>
                  <Typography variant="body2" className={`text-${statusInfo.color}-700`}>
                    {consent.requestedAt.toLocaleDateString('sv-SE')}
                  </Typography>
                </div>
                
                {consent.respondedAt && (
                  <div>
                    <Typography variant="subtitle2" className={`text-${statusInfo.color}-800`}>
                      Svarad datum:
                    </Typography>
                    <Typography variant="body2" className={`text-${statusInfo.color}-700`}>
                      {consent.respondedAt.toLocaleDateString('sv-SE')}
                    </Typography>
                  </div>
                )}
                
                <div>
                  <Typography variant="subtitle2" className={`text-${statusInfo.color}-800`}>
                    Giltigt till:
                  </Typography>
                  <Typography variant="body2" className={`text-${statusInfo.color}-700`}>
                    {consent.expiresAt.toLocaleDateString('sv-SE')}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="subtitle2" className={`text-${statusInfo.color}-800`}>
                    Metod:
                  </Typography>
                  <Typography variant="body2" className={`text-${statusInfo.color}-700`}>
                    {consent.consentMethod === 'email_link' ? 'E-postlänk' : 
                     consent.consentMethod === 'qr_code' ? 'QR-kod' : 
                     'Digital signatur'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vad betyder ditt samtycke?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Typography variant="subtitle2" className="text-primary-800 mb-2">
                📊 Långtidslagring av data
              </Typography>
              <Typography variant="body2" className="text-neutral-700">
                Med ditt samtycke kan Skolapp spara ditt barns quiz-resultat och framsteg permanent. 
                Detta möjliggör detaljerad analys av inlärning och personliga rekommendationer.
              </Typography>
            </div>
            
            <div>
              <Typography variant="subtitle2" className="text-primary-800 mb-2">
                🔒 Säkerhet och integritet
              </Typography>
              <Typography variant="body2" className="text-neutral-700">
                All data krypteras och behandlas enligt GDPR. Endast behöriga lärare och ditt barn 
                har tillgång till informationen. Data säljs aldrig till tredje part.
              </Typography>
            </div>
            
            <div>
              <Typography variant="subtitle2" className="text-primary-800 mb-2">
                ♻️ Dina rättigheter
              </Typography>
              <Typography variant="body2" className="text-neutral-700">
                Du kan när som helst återkalla ditt samtycke, begära ut data, eller kräva radering. 
                Vid återkallelse raderas all data inom 30 dagar.
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {canModify && (
        <Card>
          <CardHeader>
            <CardTitle>Hantera samtycke</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consent.status === 'pending' && (
                <>
                  <Typography variant="body2" className="text-neutral-600 mb-4">
                    Välj om du vill godkänna eller neka datalagring för ditt barn:
                  </Typography>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => setShowConfirmDialog('approve')}
                      disabled={loading}
                      size="lg"
                      className="flex-1"
                    >
                      ✅ Godkänn samtycke
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDialog('deny')}
                      disabled={loading}
                      size="lg"
                      className="flex-1"
                    >
                      ❌ Neka samtycke
                    </Button>
                  </div>
                </>
              )}
              
              {consent.status === 'approved' && !isExpired && (
                <>
                  <Typography variant="body2" className="text-neutral-600 mb-4">
                    Du kan återkalla ditt samtycke när som helst. All data kommer att raderas inom 30 dagar.
                  </Typography>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog('revoke')}
                    disabled={loading}
                    className="w-full md:w-auto"
                  >
                    🚫 Återkalla samtycke
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>
                {showConfirmDialog === 'approve' ? 'Bekräfta godkännande' :
                 showConfirmDialog === 'deny' ? 'Bekräfta nekande' :
                 'Bekräfta återkallelse'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body1" className="mb-6">
                {showConfirmDialog === 'approve' ? 
                  'Är du säker på att du vill godkänna datalagring för ditt barn? Detta gör att Skolapp kan spara resultat och framsteg permanent.' :
                 showConfirmDialog === 'deny' ?
                  'Är du säker på att du vill neka datalagring? Ditt barn kommer endast kunna använda korttidsläge.' :
                  'Är du säker på att du vill återkalla samtycket? All sparad data kommer att raderas inom 30 dagar.'
                }
              </Typography>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(null)}
                  disabled={loading}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                
                <Button
                  onClick={() => confirmAction(showConfirmDialog)}
                  disabled={loading}
                  loading={loading}
                  className="flex-1"
                >
                  {showConfirmDialog === 'approve' ? 'Godkänn' :
                   showConfirmDialog === 'deny' ? 'Neka' :
                   'Återkalla'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}