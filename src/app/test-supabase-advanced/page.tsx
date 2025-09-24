'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { 
  Database, 
  Play, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Key,
  RefreshCw,
  Zap
} from 'lucide-react'

export default function TestSupabaseAdvancedPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSettingUpRLS, setIsSettingUpRLS] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string
    tables?: string[]
  } | null>(null)
  const [testResults, setTestResults] = useState<{
    connection: boolean
    tables: string[]
    rls: boolean
    permissions: boolean
  } | null>(null)

  const testSupabaseConnection = async () => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/test-supabase')
      const data = await response.json()
      
      setTestResults({
        connection: data.connected,
        tables: data.tables || [],
        rls: false, // Will be tested separately
        permissions: false // Will be tested separately
      })
    } catch (_error) {
      setTestResults({
        connection: false,
        tables: [],
        rls: false,
        permissions: false
      })
    } finally {
      setIsTesting(false)
    }
  }

  const createTables = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      const response = await fetch('/api/supabase/create-tables', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
      
      // Refresh test results after creating tables
      if (data.success) {
        setTimeout(() => {
          testSupabaseConnection()
        }, 1000)
      }
    } catch (_error) {
      setResult({
        success: false,
        message: 'Fel vid skapande av tabeller',
        details: _error instanceof Error ? _error.message : 'Okänt fel'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const testRLS = async () => {
    try {
      const response = await fetch('/api/supabase/test-rls')
      const data = await response.json()
      
      if (testResults) {
        setTestResults(prev => prev ? { ...prev, rls: data.enabled } : null)
      }
    } catch (error) {
      console.error('RLS test failed:', error)
    }
  }

  const setupRLS = async () => {
    setIsSettingUpRLS(true)
    setResult(null)

    try {
      const response = await fetch('/api/supabase/setup-rls', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
      
      // Refresh test results after setting up RLS
      if (data.success) {
        setTimeout(() => {
          testRLS()
        }, 1000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Fel vid RLS-konfiguration',
        details: error instanceof Error ? error.message : 'Okänt fel'
      })
    } finally {
      setIsSettingUpRLS(false)
    }
  }

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="w-5 h-5 text-success-500" /> : 
      <XCircle className="w-5 h-5 text-error-500" />
  }

  

  const requiredTables = ['users', 'accounts', 'sessions', 'verification_tokens']
  const existingTables = testResults?.tables || []
  const missingTables = requiredTables.filter(table => !existingTables.includes(table))
  const allTablesExist = missingTables.length === 0

  return (
    <Layout>
      <Section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="lg">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Database className="w-6 h-6 text-primary-500" />
                Supabase Advanced Setup
              </CardTitle>
              <Typography variant="body1" className="text-muted-foreground">
                Automatisk skapande av NextAuth.js tabeller och RLS-konfiguration
              </Typography>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              {testResults && (
                <div className={`p-4 rounded-lg ${testResults.connection ? 'bg-success-50 dark:bg-success-900/20' : 'bg-error-50 dark:bg-error-900/20'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {isTesting ? (
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      getStatusIcon(testResults.connection)
                    )}
                    <Typography variant="h6" className={testResults.connection ? 'text-success-700 dark:text-success-300' : 'text-error-700 dark:text-error-300'}>
                      {isTesting ? 'Testar anslutning...' : testResults.connection ? 'Ansluten till Supabase' : 'Ej ansluten till Supabase'}
                    </Typography>
                  </div>
                  <Typography variant="body2" className={testResults.connection ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}>
                    {testResults.connection ? 'Supabase-anslutning fungerar' : 'Kontrollera miljövariabler och nätverksanslutning'}
                  </Typography>
                </div>
              )}

              {/* Tables Status */}
              {testResults && (
                <div className="space-y-4">
                  <Typography variant="h6" className="font-semibold">
                    Tabeller ({existingTables.length}/4)
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requiredTables.map((table) => {
                      const exists = existingTables.includes(table)
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

              {/* Result Display */}
              {result && (
                <div className={`p-4 rounded-lg ${result.success ? 'bg-success-50 dark:bg-success-900/20' : 'bg-error-50 dark:bg-error-900/20'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error-500" />
                    )}
                    <Typography variant="h6" className={result.success ? 'text-success-700 dark:text-success-300' : 'text-error-700 dark:text-error-300'}>
                      {result.success ? 'Operation lyckades!' : 'Operation misslyckades'}
                    </Typography>
                  </div>
                  <Typography variant="body2" className={result.success ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}>
                    {result.message}
                  </Typography>
                  {result.details && (
                    <Typography variant="body2" className="text-muted-foreground mt-2 font-mono text-xs">
                      {result.details}
                    </Typography>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={testSupabaseConnection} 
                  disabled={isTesting}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isTesting ? (
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isTesting ? 'Testar...' : 'Testa Anslutning'}
                </Button>

                <Button 
                  onClick={createTables} 
                  disabled={isCreating || !testResults?.connection}
                  className="flex items-center gap-2"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isCreating ? 'Skapar tabeller...' : 'Skapa tabeller automatiskt'}
                </Button>

                <Button 
                  onClick={testRLS} 
                  disabled={!allTablesExist}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Testa RLS
                </Button>

                <Button 
                  onClick={setupRLS} 
                  disabled={isSettingUpRLS || !allTablesExist}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSettingUpRLS ? (
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {isSettingUpRLS ? 'Konfigurerar RLS...' : 'Konfigurera RLS'}
                </Button>
              </div>

              {/* Next Steps */}
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2">
                  Nästa steg
                </Typography>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {!testResults?.connection ? (
                    <>
                      <li>⚠️ Konfigurera Supabase miljövariabler</li>
                      <li>🔄 Starta om servern efter ändringar</li>
                      <li>✅ Testa anslutning igen</li>
                    </>
                  ) : !allTablesExist ? (
                    <>
                      <li>✅ Supabase är ansluten</li>
                      <li>🗄️ Skapa saknade tabeller med knappen ovan</li>
                      <li>🔄 Testa anslutning igen</li>
                    </>
                  ) : (
                    <>
                      <li>✅ Allt är konfigurerat!</li>
                      <li>🚀 Testa Google OAuth på /test-google-auth</li>
                      <li>⚡ Testa Ably real-time på /test-ably</li>
                      <li>🎯 Alla användardata sparas nu i Supabase!</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-3 justify-center">
                <a 
                  href="/test-supabase" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Grundläggande Test
                </a>
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
