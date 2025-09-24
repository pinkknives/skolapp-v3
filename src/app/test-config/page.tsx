'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { CheckCircle, XCircle, AlertCircle, Key, Zap } from 'lucide-react'

export default function TestConfigPage() {
  const configItems = [
    {
      name: 'NEXTAUTH_SECRET',
      value: process.env.NEXTAUTH_SECRET ? '***SET***' : 'Not set',
      required: true,
      description: 'Säker nyckel för NextAuth.js sessioner'
    },
    {
      name: 'NEXT_PUBLIC_ABLY_API_KEY',
      value: process.env.NEXT_PUBLIC_ABLY_API_KEY ? '***SET***' : 'Not set',
      required: true,
      description: 'API-nyckel för Ably real-time kommunikation'
    },
    {
      name: 'GOOGLE_CLIENT_ID',
      value: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'Not set',
      required: true,
      description: 'Google OAuth Client ID'
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      value: process.env.GOOGLE_CLIENT_SECRET ? '***SET***' : 'Not set',
      required: true,
      description: 'Google OAuth Client Secret'
    },
    {
      name: 'NEXTAUTH_URL',
      value: process.env.NEXTAUTH_URL || 'Not set',
      required: true,
      description: 'Base URL för NextAuth.js'
    }
  ]

  const getStatusIcon = (item: { required: boolean; value: string }) => {
    if (item.required) {
      return item.value !== 'Not set' ? 
        <CheckCircle className="w-5 h-5 text-success-500" /> : 
        <XCircle className="w-5 h-5 text-error-500" />
    } else {
      return item.value !== 'Not set' ? 
        <CheckCircle className="w-5 h-5 text-success-500" /> : 
        <AlertCircle className="w-5 h-5 text-warning-500" />
    }
  }

  const getStatusText = (item: { required: boolean; value: string }) => {
    if (item.required) {
      return item.value !== 'Not set' ? 'OK' : 'MISSING'
    } else {
      return item.value !== 'Not set' ? 'OK' : 'OPTIONAL'
    }
  }

  const getStatusColor = (item: { required: boolean; value: string }) => {
    if (item.required) {
      return item.value !== 'Not set' ? 'text-success-600' : 'text-error-600'
    } else {
      return item.value !== 'Not set' ? 'text-success-600' : 'text-warning-600'
    }
  }

  const requiredItems = configItems.filter(item => item.required)
  const configuredItems = requiredItems.filter(item => item.value !== 'Not set')
  const isFullyConfigured = configuredItems.length === requiredItems.length

  return (
    <Layout>
      <Section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="lg">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Konfiguration Status
              </CardTitle>
              <Typography variant="body1" className="text-muted-foreground">
                Kontrollera att alla nödvändiga miljövariabler är konfigurerade
              </Typography>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Overview */}
              <div className={`p-4 rounded-lg ${isFullyConfigured ? 'bg-success-50 dark:bg-success-900/20' : 'bg-warning-50 dark:bg-warning-900/20'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {isFullyConfigured ? (
                    <CheckCircle className="w-6 h-6 text-success-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-warning-500" />
                  )}
                  <Typography variant="h6" className={isFullyConfigured ? 'text-success-700 dark:text-success-300' : 'text-warning-700 dark:text-warning-300'}>
                    {isFullyConfigured ? 'Allt konfigurerat!' : 'Konfiguration ofullständig'}
                  </Typography>
                </div>
                <Typography variant="body2" className={isFullyConfigured ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'}>
                  {configuredItems.length} av {requiredItems.length} obligatoriska variabler är konfigurerade
                </Typography>
              </div>

              {/* Configuration Items */}
              <div className="space-y-4">
                {configItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item)}
                      <div>
                        <Typography variant="body1" className="font-semibold">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" className="text-muted-foreground">
                          {item.description}
                        </Typography>
                      </div>
                    </div>
                    <div className="text-right">
                      <Typography variant="body2" className="font-mono text-sm">
                        {item.value}
                      </Typography>
                      <Typography variant="body2" className={`text-sm font-semibold ${getStatusColor(item)}`}>
                        {getStatusText(item)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Steps */}
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2">
                  Nästa steg
                </Typography>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {isFullyConfigured ? (
                    <>
                      <li>✅ Alla miljövariabler är konfigurerade</li>
                      <li>🚀 Testa Google OAuth på /test-google-auth</li>
                      <li>⚡ Testa Ably real-time på /test-ably</li>
                      <li>🎯 Starta utvecklingsservern: npm run dev</li>
                    </>
                  ) : (
                    <>
                      <li>⚠️ Konfigurera saknade miljövariabler i .env.local</li>
                      <li>🔄 Starta om servern efter ändringar</li>
                      <li>✅ Kontrollera status igen</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <a 
                  href="/test-google-auth" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Testa Google OAuth
                </a>
                <a 
                  href="/test-ably" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Testa Ably
                </a>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </Layout>
  )
}
