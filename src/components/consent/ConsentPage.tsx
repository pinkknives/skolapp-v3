'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface ConsentInvite {
  id: string
  token: string
  guardian_email: string
  expires_at: string
  meta: {
    student_email?: string
  }
  orgs: {
    name: string
  }
}

interface ConsentPageProps {
  invite: ConsentInvite
  orgName: string
  isExpired?: boolean
  isCompleted?: boolean
}

export function ConsentPage({ invite, orgName, isExpired, isCompleted }: ConsentPageProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleConsent = async (accepted: boolean) => {
    setIsProcessing(true)
    setResult(null)

    try {
      const endpoint = accepted ? '/api/consents/accept' : '/api/consents/decline'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: invite.token }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || (accepted ? 'Samtycke godkänt' : 'Samtycke avböjt')
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Ett fel inträffade'
        })
      }
    } catch (error) {
      console.error('Error processing consent:', error)
      setResult({
        success: false,
        message: 'Ett oväntat fel inträffade'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Show result after action
  if (result) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {result.success ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <CardTitle>
              {result.success ? 'Klart!' : 'Fel inträffade'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Typography variant="body1" className="text-neutral-600 dark:text-neutral-300 mb-6">
              {result.message}
            </Typography>
            <Typography variant="caption" className="text-neutral-500">
              Du kan nu stänga denna sida.
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show expired state
  if (isExpired) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <CardTitle>Länken har gått ut</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Typography variant="body1" className="text-neutral-600 dark:text-neutral-300 mb-4">
              Denna samtyckeslänk har gått ut och kan inte längre användas.
            </Typography>
            <Typography variant="caption" className="text-neutral-500">
              Kontakta skolan för att få en ny länk.
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show completed state
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Redan hanterat</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Typography variant="body1" className="text-neutral-600 dark:text-neutral-300 mb-4">
              Du har redan svarat på denna samtyckesförfrågan.
            </Typography>
            <Typography variant="caption" className="text-neutral-500">
              Kontakta skolan om du behöver ändra ditt svar.
            </Typography>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main consent form
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Samtycke för datalagring
          </CardTitle>
          <Typography variant="body1" className="text-center text-neutral-600 dark:text-neutral-300">
            {orgName}
          </Typography>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex gap-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <Typography variant="small" className="font-medium text-blue-900 dark:text-blue-200">
                  Viktigt att veta
                </Typography>
                <Typography variant="caption" className="text-blue-700 dark:text-blue-300 mt-1">
                  Skolan behöver ditt samtycke för att kunna spara elevens quizresultat och framsteg långsiktigt.
                </Typography>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Typography variant="h3">Vad detta handlar om</Typography>
            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <Typography variant="body1">
                Din elev använder Skolapp för att delta i quiz och lärande aktiviteter. 
                Skolan kan använda systemet på två sätt:
              </Typography>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <Typography variant="small" className="font-medium mb-2">
                    Korttidsläge (utan samtycke)
                  </Typography>
                  <Typography variant="caption" className="text-neutral-600 dark:text-neutral-400">
                    • Data sparas endast under pågående aktivitet<br/>
                    • Automatisk rensning efter 30 dagar<br/>
                    • Begränsad historik och analys
                  </Typography>
                </div>
                
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <Typography variant="small" className="font-medium mb-2 text-primary-900 dark:text-primary-200">
                    Långtidsläge (med samtycke)
                  </Typography>
                  <Typography variant="caption" className="text-primary-700 dark:text-primary-300">
                    • Framsteg och resultat sparas permanent<br/>
                    • Detaljerad analys och rapporter<br/>
                    • Bättre personaliserad undervisning
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Typography variant="h3">Dina rättigheter</Typography>
            <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
              <Typography variant="small">
                • Du kan när som helst återkalla ditt samtycke
              </Typography>
              <Typography variant="small">
                • Du kan begära att få ut eller radera elevens data
              </Typography>
              <Typography variant="small">
                • Samtycket gäller i 12 månader och förnyas automatiskt
              </Typography>
              <Typography variant="small">
                • Inga data delas med tredje part utan ditt godkännande
              </Typography>
            </div>
          </div>

          <div className="border-t pt-6">
            <Typography variant="body1" className="text-center mb-6 text-neutral-600 dark:text-neutral-300">
              Vill du ge samtycke för långsiktig datalagring?
            </Typography>
            
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleConsent(false)}
                disabled={isProcessing}
                className="min-w-32"
              >
                Nej, avböj
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleConsent(true)}
                disabled={isProcessing}
                className="min-w-32"
              >
                {isProcessing ? 'Behandlar...' : 'Ja, godkänn'}
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <Typography variant="caption" className="text-neutral-500">
              Skickat till: {invite.guardian_email}<br/>
              Gäller till: {new Date(invite.expires_at).toLocaleDateString('sv-SE')}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}