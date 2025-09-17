'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'

interface ParentAccessMethodsProps {
  onMethodSelect: (method: 'access-code' | 'email-link' | 'qr-code' | 'bankid') => void
}

export function ParentAccessMethods({ onMethodSelect }: ParentAccessMethodsProps) {
  const accessMethods = [
    {
      id: 'access-code' as const,
      title: 'Åtkomstkod',
      description: 'Ange den 8-siffriga kod du fått från skolan',
      icon: '🔢',
      primary: true,
    },
    {
      id: 'bankid' as const,
      title: 'BankID',
      description: 'Säker inloggning med ditt BankID',
      icon: '🏦',
      primary: true,
    },
    {
      id: 'email-link' as const,
      title: 'E-postlänk',
      description: 'Få en säker länk skickad till din e-post',
      icon: '📧',
      primary: false,
    },
    {
      id: 'qr-code' as const,
      title: 'QR-kod',
      description: 'Scanna QR-kod med din mobiltelefon',
      icon: '📱',
      primary: false,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-4">
          Välj inloggningssätt
        </Typography>
        <Typography variant="body1" className="text-neutral-600">
          Välj det sätt som fungerar bäst för dig att komma åt ditt barns samtyckesinställningar
        </Typography>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {accessMethods.filter(method => method.primary).map((method) => (
          <Card 
            key={method.id} 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-primary-200"
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">{method.icon}</div>
              <Typography variant="h3" className="mb-2">
                {method.title}
              </Typography>
              <Typography variant="body2" className="text-neutral-600 mb-4">
                {method.description}
              </Typography>
              <Button 
                onClick={() => onMethodSelect(method.id)}
                fullWidth
                size="lg"
              >
                Fortsätt med {method.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Typography variant="h3" className="text-center mb-6">
          Alternativa sätt
        </Typography>
        <div className="grid md:grid-cols-2 gap-4">
          {accessMethods.filter(method => !method.primary).map((method) => (
            <Card 
              key={method.id} 
              className="cursor-pointer transition-all hover:shadow-md border border-neutral-200"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <Typography variant="subtitle1" className="mb-1">
                      {method.title}
                    </Typography>
                    <Typography variant="body2" className="text-neutral-600 text-sm">
                      {method.description}
                    </Typography>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onMethodSelect(method.id)}
                  >
                    Välj
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-info-50 border border-info-200 rounded-lg">
        <Typography variant="subtitle2" className="text-info-800 mb-2">
          Säkert och GDPR-kompatibelt
        </Typography>
        <Typography variant="body2" className="text-info-700">
          All inloggning sker säkert och följer svenska och europeiska dataskyddsregler. 
          Dina uppgifter behandlas konfidentiellt och lagras endast så länge som krävs för att hantera samtycket.
        </Typography>
      </div>
    </div>
  )
}