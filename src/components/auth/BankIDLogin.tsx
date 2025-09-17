'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'

interface BankIDLoginProps {
  onBack: () => void
}

type BankIDState = 'init' | 'waiting' | 'authenticating' | 'success' | 'failed'

export function BankIDLogin({ onBack }: BankIDLoginProps) {
  const [state, setState] = useState<BankIDState>('init')
  const [progress, setProgress] = useState(0)

  const startBankIDAuth = () => {
    setState('waiting')
    setProgress(0)

    // Simulate BankID flow
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setState('authenticating')
          
          // Simulate authentication process
          setTimeout(() => {
            // For demo purposes, simulate success after authentication
            setState('success')
          }, 2000)
          
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const renderContent = () => {
    switch (state) {
      case 'init':
        return (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-8h2v6h-2z"/>
              </svg>
            </div>
            
            <Typography variant="h3" className="mb-4">
              Logga in med BankID
            </Typography>
            
            <Typography variant="body1" className="text-neutral-600 mb-6">
              Använd ditt BankID för säker inloggning till föräldraområdet.
              Du kommer att kunna hantera samtycke för ditt barns datalagring.
            </Typography>
            
            <div className="space-y-4">
              <Button 
                onClick={startBankIDAuth}
                size="lg"
                fullWidth
                className="mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Starta BankID
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onBack}
                fullWidth
              >
                Tillbaka till inloggningsval
              </Button>
            </div>
          </div>
        )

      case 'waiting':
        return (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="w-full h-full bg-blue-100 rounded-full"></div>
              <div 
                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full transition-all duration-300"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + (progress / 2)}% 0%, ${50 + (progress / 2) * Math.cos((progress / 100) * 2 * Math.PI)}% ${50 - (progress / 2) * Math.sin((progress / 100) * 2 * Math.PI)}%, 50% 50%)`
                }}
              ></div>
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            
            <Typography variant="h3" className="mb-4">
              Startar BankID...
            </Typography>
            
            <Typography variant="body1" className="text-neutral-600 mb-6">
              Öppna BankID-appen på din telefon och följ instruktionerna för att logga in.
            </Typography>
            
            <div className="bg-neutral-50 p-4 rounded-lg mb-4">
              <Typography variant="body2" className="text-neutral-700">
                <strong>Steg att följa:</strong><br />
                1. Öppna BankID-appen<br />
                2. Ange din säkerhetskod<br />
                3. Bekräfta inloggningen
              </Typography>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setState('init')}
              fullWidth
            >
              Avbryt
            </Button>
          </div>
        )

      case 'authenticating':
        return (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <Typography variant="h3" className="mb-4">
              Autentiserar...
            </Typography>
            
            <Typography variant="body1" className="text-neutral-600">
              Verifierar din identitet med BankID. Detta tar bara några sekunder.
            </Typography>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-success-500 to-success-700 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <Typography variant="h3" className="mb-4 text-success-700">
              Inloggning lyckades!
            </Typography>
            
            <Typography variant="body1" className="text-neutral-600 mb-6">
              Du är nu inloggad i föräldraområdet. Du kommer att omdirigeras till din kontrollpanel.
            </Typography>
            
            <Button 
              size="lg"
              fullWidth
              onClick={() => {
                // In real implementation, redirect to consent dashboard
                console.log('Redirecting to consent dashboard...')
              }}
            >
              Fortsätt till kontrollpanel
            </Button>
          </div>
        )

      case 'failed':
        return (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-error-500 to-error-700 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <Typography variant="h3" className="mb-4 text-error-700">
              Inloggning misslyckades
            </Typography>
            
            <Typography variant="body1" className="text-neutral-600 mb-6">
              BankID-inloggningen kunde inte genomföras. Försök igen eller välj ett annat inloggningssätt.
            </Typography>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setState('init')}
                fullWidth
              >
                Försök igen
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onBack}
                fullWidth
              >
                Välj annat inloggningssätt
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">BankID-inloggning</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  )
}