'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { BankIDLogin } from './BankIDLogin'
import { ParentAccessMethods } from './ParentAccessMethods'

interface ParentalLoginContentProps {}

type LoginMethod = 'access-code' | 'email-link' | 'qr-code' | 'bankid'

export function ParentalLoginContent({}: ParentalLoginContentProps) {
  const [selectedMethod, setSelectedMethod] = useState<LoginMethod | null>(null)
  const [accessCode, setAccessCode] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleMethodSelect = (method: LoginMethod) => {
    setSelectedMethod(method)
  }

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate access code validation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real implementation, validate access code and redirect to consent dashboard
    console.log('Access code submitted:', accessCode)
    setIsLoading(false)
  }

  const handleEmailLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate email link sending
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    alert('En säker länk har skickats till din e-post. Kontrollera din inkorg.')
    setIsLoading(false)
  }

  const renderMethodContent = () => {
    switch (selectedMethod) {
      case 'access-code':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Ange åtkomstkod</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                <div>
                  <Typography variant="body2" className="text-neutral-600 mb-3">
                    Ange den 8-siffriga kod som din lärare eller skola delat med dig.
                  </Typography>
                  
                  <Input
                    label="Åtkomstkod"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="12345678"
                    maxLength={8}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  disabled={accessCode.length !== 8}
                >
                  Logga in
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod(null)}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Välj annat inloggningssätt
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )

      case 'email-link':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Säker e-postlänk</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailLinkRequest} className="space-y-4">
                <div>
                  <Typography variant="body2" className="text-neutral-600 mb-3">
                    Vi skickar en säker länk till din e-post som ger dig tillgång till ditt barns samtyckesinställningar.
                  </Typography>
                  
                  <Input
                    label="E-postadress"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="förälder@exempel.se"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  disabled={!emailAddress}
                >
                  Skicka säker länk
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod(null)}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Välj annat inloggningssätt
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )

      case 'qr-code':
        return (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">QR-kod inloggning</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Typography variant="body2" className="text-neutral-600 mb-4">
                Scanna QR-koden som du fått från din lärare eller skola med din telefons kamera.
              </Typography>
              
              {/* Placeholder for QR code scanner */}
              <div className="w-64 h-64 mx-auto bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <Typography variant="body2" className="text-neutral-500">
                    QR-kodskanner kommer här
                  </Typography>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Välj annat inloggningssätt
                </button>
              </div>
            </CardContent>
          </Card>
        )

      case 'bankid':
        return <BankIDLogin onBack={() => setSelectedMethod(null)} />

      default:
        return <ParentAccessMethods onMethodSelect={handleMethodSelect} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Typography variant="h1" className="mb-4">
          Föräldraområde
        </Typography>
        <Typography variant="body1" className="text-neutral-600">
          Hantera samtycke och se hur ditt barns data används i Skolapp
        </Typography>
      </div>

      {renderMethodContent()}
    </div>
  )
}