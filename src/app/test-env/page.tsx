'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TestEnvPage() {
  const envVars = [
    {
      name: 'NEXTAUTH_URL',
      value: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
      required: true
    },
    {
      name: 'NEXTAUTH_SECRET',
      value: process.env.NEXTAUTH_SECRET ? '***SET***' : 'Not set',
      required: true
    },
    {
      name: 'GOOGLE_CLIENT_ID',
      value: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'Not set',
      required: true
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      value: process.env.GOOGLE_CLIENT_SECRET ? '***SET***' : 'Not set',
      required: true
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
      required: false
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'Not set',
      required: false
    }
  ]

  const getStatusIcon = (envVar: { required: boolean; value: string }) => {
    if (envVar.required) {
      return envVar.value !== 'Not set' ? 
        <CheckCircle className="w-5 h-5 text-success-500" /> : 
        <XCircle className="w-5 h-5 text-error-500" />
    } else {
      return envVar.value !== 'Not set' ? 
        <CheckCircle className="w-5 h-5 text-success-500" /> : 
        <AlertCircle className="w-5 h-5 text-warning-500" />
    }
  }

  const getStatusText = (envVar: { required: boolean; value: string }) => {
    if (envVar.required) {
      return envVar.value !== 'Not set' ? 'OK' : 'MISSING'
    } else {
      return envVar.value !== 'Not set' ? 'OK' : 'OPTIONAL'
    }
  }

  const getStatusColor = (envVar: { required: boolean; value: string }) => {
    if (envVar.required) {
      return envVar.value !== 'Not set' ? 'text-success-600' : 'text-error-600'
    } else {
      return envVar.value !== 'Not set' ? 'text-success-600' : 'text-warning-600'
    }
  }

  return (
    <Layout>
      <Section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="lg">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Miljövariabler Test
              </CardTitle>
              <Typography variant="body1" className="text-muted-foreground">
                Kontrollera att alla nödvändiga miljövariabler är konfigurerade
              </Typography>
            </CardHeader>
            <CardContent className="space-y-4">
              {envVars.map((envVar, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(envVar)}
                    <div>
                      <Typography variant="body1" className="font-semibold">
                        {envVar.name}
                      </Typography>
                      <Typography variant="body2" className="text-muted-foreground">
                        {envVar.required ? 'Obligatorisk' : 'Valfri'}
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body2" className="font-mono text-sm">
                      {envVar.value}
                    </Typography>
                    <Typography variant="body2" className={`text-sm font-semibold ${getStatusColor(envVar)}`}>
                      {getStatusText(envVar)}
                    </Typography>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2">
                  Sammanfattning
                </Typography>
                <div className="space-y-1 text-sm">
                  <Typography variant="body2">
                    ✅ Obligatoriska variabler: {envVars.filter(v => v.required && v.value !== 'Not set').length} / {envVars.filter(v => v.required).length}
                  </Typography>
                  <Typography variant="body2">
                    ℹ️ Valfria variabler: {envVars.filter(v => !v.required && v.value !== 'Not set').length} / {envVars.filter(v => !v.required).length}
                  </Typography>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2">
                  Nästa steg
                </Typography>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Kontrollera att alla obligatoriska variabler är satta</li>
                  <li>• Starta om servern efter ändringar i .env.local</li>
                  <li>• Testa Google OAuth på /test-google-auth</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </Layout>
  )
}
