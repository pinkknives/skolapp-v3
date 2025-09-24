'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { CheckCircle, XCircle, Database, Key } from 'lucide-react'

export default function TestSupabasePage() {
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean
    tables: string[]
    error?: string
  }>({
    connected: false,
    tables: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSupabaseStatus()
  }, [])

  const checkSupabaseStatus = async () => {
    setIsLoading(true)
    try {
      // Test basic connection
      const response = await fetch('/api/test-supabase')
      const data = await response.json()
      
      setSupabaseStatus(data)
    } catch (_error) {
      setSupabaseStatus({
        connected: false,
        tables: [],
        error: 'Kunde inte ansluta till Supabase'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="w-5 h-5 text-success-500" /> : 
      <XCircle className="w-5 h-5 text-error-500" />
  }

  

  return (
    <Layout>
      <Section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="lg">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Database className="w-6 h-6 text-primary-500" />
                Supabase Status
              </CardTitle>
              <Typography variant="body1" className="text-muted-foreground">
                Kontrollera Supabase-anslutning och tabeller
              </Typography>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              <div className={`p-4 rounded-lg ${supabaseStatus.connected ? 'bg-success-50 dark:bg-success-900/20' : 'bg-error-50 dark:bg-error-900/20'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    getStatusIcon(supabaseStatus.connected)
                  )}
                  <Typography variant="h6" className={supabaseStatus.connected ? 'text-success-700 dark:text-success-300' : 'text-error-700 dark:text-error-300'}>
                    {isLoading ? 'Kontrollerar...' : supabaseStatus.connected ? 'Ansluten till Supabase' : 'Ej ansluten till Supabase'}
                  </Typography>
                </div>
                {supabaseStatus.error && (
                  <Typography variant="body2" className="text-error-600 dark:text-error-400">
                    {supabaseStatus.error}
                  </Typography>
                )}
              </div>

              {/* Environment Variables */}
              <div className="space-y-4">
                <Typography variant="h6" className="font-semibold">
                  Miljövariabler
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary-500" />
                      <Typography variant="body2" className="font-medium">
                        NEXT_PUBLIC_SUPABASE_URL
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                        <CheckCircle className="w-4 h-4 text-success-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-error-500" />
                      )}
                      <Typography variant="body2" className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-success-600' : 'text-error-600'}>
                        {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING'}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary-500" />
                      <Typography variant="body2" className="font-medium">
                        NEXT_PUBLIC_SUPABASE_ANON_KEY
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                        <CheckCircle className="w-4 h-4 text-success-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-error-500" />
                      )}
                      <Typography variant="body2" className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-success-600' : 'text-error-600'}>
                        {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MISSING'}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tables Status */}
              {supabaseStatus.connected && (
                <div className="space-y-4">
                  <Typography variant="h6" className="font-semibold">
                    Tabeller
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['users', 'accounts', 'sessions', 'verification_tokens'].map((table) => {
                      const exists = supabaseStatus.tables.includes(table)
                      return (
                        <div key={table} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-primary-500" />
                            <Typography variant="body2" className="font-medium">
                              {table}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-2">
                            {exists ? (
                              <CheckCircle className="w-4 h-4 text-success-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-error-500" />
                            )}
                            <Typography variant="body2" className={exists ? 'text-success-600' : 'text-error-600'}>
                              {exists ? 'EXISTS' : 'MISSING'}
                            </Typography>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2">
                  Nästa steg
                </Typography>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {!supabaseStatus.connected ? (
                    <>
                      <li>⚠️ Konfigurera Supabase miljövariabler</li>
                      <li>📋 Kopiera SQL-scriptet från /docs/SUPABASE_TABLES_SETUP.md</li>
                      <li>🗄️ Kör SQL-scriptet i Supabase SQL Editor</li>
                      <li>🔄 Uppdatera denna sida</li>
                    </>
                  ) : supabaseStatus.tables.length < 4 ? (
                    <>
                      <li>✅ Supabase är ansluten</li>
                      <li>📋 Skapa saknade tabeller med SQL-scriptet</li>
                      <li>🔄 Uppdatera denna sida</li>
                    </>
                  ) : (
                    <>
                      <li>✅ Allt är konfigurerat!</li>
                      <li>🚀 Testa Google OAuth på /test-google-auth</li>
                      <li>⚡ Testa Ably real-time på /test-ably</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={checkSupabaseStatus} disabled={isLoading}>
                  {isLoading ? 'Kontrollerar...' : 'Uppdatera Status'}
                </Button>
                <a 
                  href="/docs/SUPABASE_TABLES_SETUP.md" 
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Visa Setup Guide
                </a>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </Layout>
  )
}
