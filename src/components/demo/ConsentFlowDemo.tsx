'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { ParentConsentRequest } from '@/components/teacher/ParentConsentRequest'
import { type User } from '@/types/auth'

export function ConsentFlowDemo() {
  const [currentStep, setCurrentStep] = useState<'overview' | 'teacher' | 'parent'>('overview')
  const [demoAccessCode, setDemoAccessCode] = useState<string>('')

  // Mock student data
  const mockStudent: User = {
    id: 'student_demo_123',
    email: 'elev@exempel.se',
    firstName: 'Emma',
    lastName: 'Johansson',
    role: 'elev',
    subscriptionPlan: 'premium',
    dataRetentionMode: 'långtid',
    isMinor: true,
    hasParentalConsent: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  }

  const handleConsentRequestComplete = () => {
    // This would normally be called when the teacher creates a consent request
    // For demo purposes, we'll generate a demo access code
    const demoCode = '12345678' // In real app, this would come from ParentConsentRequest
    setDemoAccessCode(demoCode)
    alert(`Demo: Åtkomstkod ${demoCode} genererad! Använd denna kod för att testa föräldraflödet.`)
  }

  const renderOverview = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <Typography variant="h1" className="mb-4">
          Föräldrainloggning & Samtyckesflöde
        </Typography>
        <Typography variant="body1" className="text-neutral-600">
          Demo av det kompletta flödet för föräldrasamtycke i Skolapp
        </Typography>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentStep('teacher')}>
          <CardHeader>
            <CardTitle>👩‍🏫 Lärarvy</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="text-neutral-600 mb-4">
              Se hur lärare skapar samtyckesbegäran och genererar åtkomstkoder för föräldrar.
            </Typography>
            <Button fullWidth>Visa lärarflöde</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentStep('parent')}>
          <CardHeader>
            <CardTitle>👨‍👩‍👧‍👦 Föräldravy</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="text-neutral-600 mb-4">
              Testa hur föräldrar loggar in och hanterar samtycke för sina barn.
            </Typography>
            <Button fullWidth>Visa föräldraflöde</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-info-50 border-info-200">
        <CardHeader>
          <CardTitle className="text-info-800">🔄 Komplett flöde</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-info-700 mb-4">
            <strong>Så här fungerar samtyckesflödet:</strong>
          </Typography>
          <ol className="list-decimal list-inside space-y-2 text-info-700 text-sm">
            <li>Eleven registrerar sig och väljer långtidslagring</li>
            <li>Systemet identifierar att föräldrrasamtycke krävs (GDPR)</li>
            <li>Läraren skapar samtyckesbegäran med förälderns kontaktuppgifter</li>
            <li>Systemet genererar säkra åtkomstalternativ (kod, länk, QR, BankID)</li>
            <li>Föräldern får notifikation och kan logga in på flera sätt</li>
            <li>Föräldern granskar och beslutar om samtycke</li>
            <li>All aktivitet loggas för GDPR-compliance</li>
            <li>Systemet hanterar data enligt samtyckesstatusen</li>
          </ol>
        </CardContent>
      </Card>

      {demoAccessCode && (
        <Card className="border-success-200 bg-success-50">
          <CardHeader>
            <CardTitle className="text-success-800">🔑 Demo-åtkomstkod genererad</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body1" className="text-success-700 mb-4">
              Använd denna kod för att testa föräldraflödet:
            </Typography>
            <div className="bg-white border rounded-lg p-4 text-center mb-4">
              <Typography variant="h2" className="font-mono tracking-wider text-primary-700">
                {demoAccessCode}
              </Typography>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => window.open('/foralder', '_blank')}
                className="flex-1"
              >
                🔗 Öppna föräldraområde
              </Button>
              <Button 
                onClick={() => navigator.clipboard.writeText(demoAccessCode)}
                variant="outline"
                className="flex-1"
              >
                📋 Kopiera kod
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <Typography variant="subtitle2" className="mb-1">GDPR-kompatibel</Typography>
            <Typography variant="body2" className="text-neutral-600 text-sm">
              Full transparens och auditloggning
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📱</div>
            <Typography variant="subtitle2" className="mb-1">Mobilanpassad</Typography>
            <Typography variant="body2" className="text-neutral-600 text-sm">
              Fungerar perfekt på alla enheter
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏦</div>
            <Typography variant="subtitle2" className="mb-1">Säker inloggning</Typography>
            <Typography variant="body2" className="text-neutral-600 text-sm">
              BankID och andra säkra metoder
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTeacherView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          onClick={() => setCurrentStep('overview')}
          variant="outline"
          size="sm"
          className="mr-4"
        >
          ← Tillbaka
        </Button>
        <Typography variant="h2">Lärarvy - Skapa samtyckesbegäran</Typography>
      </div>

      <ParentConsentRequest 
        student={mockStudent}
        onComplete={handleConsentRequestComplete}
      />
    </div>
  )

  const renderParentView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          onClick={() => setCurrentStep('overview')}
          variant="outline"
          size="sm"
          className="mr-4"
        >
          ← Tillbaka
        </Button>
        <Typography variant="h2">Föräldravy - Test samtyckesinloggning</Typography>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🔗 Direkt länk</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="text-neutral-600 mb-4">
              Testa det kompletta föräldraflödet direkt:
            </Typography>
            <Button 
              onClick={() => window.open('/foralder', '_blank')}
              fullWidth
              size="lg"
            >
              Öppna föräldraområde
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Med demo-data</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="text-neutral-600 mb-4">
              Testa med färdigifylld samtyckesinformation:
            </Typography>
            <Button 
              onClick={() => window.open('/foralder/samtycke?token=demo&student=student_demo_123', '_blank')}
              fullWidth
              size="lg"
            >
              Öppna samtyckedashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {demoAccessCode && (
        <Card className="mt-6 border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle className="text-primary-800">🔑 Testa med genererad kod</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="text-primary-700 mb-4">
              Använd denna kod i föräldraområdet för att testa åtkomstkodflödet:
            </Typography>
            <div className="bg-white border rounded-lg p-3 mb-4 text-center">
              <Typography variant="h3" className="font-mono tracking-wider text-primary-700">
                {demoAccessCode}
              </Typography>
            </div>
            <Typography variant="body2" className="text-primary-600 text-sm">
              Gå till föräldraområdet, välj "Åtkomstkod" och ange koden ovan.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 bg-warning-50 border-warning-200">
        <CardHeader>
          <CardTitle className="text-warning-800">⚠️ Demo-läge</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body2" className="text-warning-700">
            Detta är en demonstration. I den riktiga applikationen skulle tokens valideras 
            mot backend och e-post skickas via en riktig e-posttjänst.
          </Typography>
        </CardContent>
      </Card>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'teacher':
        return renderTeacherView()
      case 'parent':
        return renderParentView()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        {renderCurrentStep()}
      </div>
    </div>
  )
}