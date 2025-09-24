'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { testSupabaseConnection, validateSupabaseConfig } from '@/lib/supabase-test'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

type ConnectionResult = {
  browser: { connected: boolean; error: string | null }
  server: { connected: boolean; error: string | null }
  database: { connected: boolean; error: string | null }
}

export function SupabaseConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ConnectionResult | null>(null)
  const [config, setConfig] = useState(validateSupabaseConfig())

  const runTest = async () => {
    setIsLoading(true)
    try {
      const testResults = await testSupabaseConnection()
      setResults(testResults)
      setConfig(validateSupabaseConfig())
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  const StatusIcon = ({ connected, error }: { connected: boolean; error: string | null }) => {
    if (error) {
      return <XCircle className="w-5 h-5 text-error-600" />
    }
    if (connected) {
      return <CheckCircle className="w-5 h-5 text-success-600" />
    }
    return <AlertTriangle className="w-5 h-5 text-warning-600" />
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Typography variant="h1" className="mb-2">
          Supabase Connection Test
        </Typography>
        <Typography variant="body1" className="text-neutral-600">
          Verifiera din Supabase-konfiguration och anslutning
        </Typography>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.isValid ? (
              <CheckCircle className="w-5 h-5 text-success-600" />
            ) : (
              <XCircle className="w-5 h-5 text-error-600" />
            )}
            Environment Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config.isValid ? (
            <Typography variant="body2" className="text-success-600">
              Alla miljövariabler är korrekt konfigurerade.
            </Typography>
          ) : (
            <div className="space-y-2">
              <Typography variant="body2" className="text-error-600 font-medium">
                Konfigurationsproblem funna:
              </Typography>
              <ul className="list-disc list-inside space-y-1">
                {config.issues.map((issue, index) => (
                  <li key={index} className="text-error-600 text-sm">
                    {issue}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-md">
                <Typography variant="body2" className="text-warning-800">
                  <strong>Åtgärd:</strong> Kopiera .env.local.example till .env.local och fyll i dina faktiska Supabase-uppgifter.
                </Typography>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Tests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Anslutningstester</CardTitle>
          <Button
            onClick={runTest}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Testar...' : 'Testa igen'}
          </Button>
        </CardHeader>
        <CardContent>
          {results ? (
            <div className="space-y-4">
              {/* Browser Client */}
              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
                <div className="flex items-center gap-3">
                  <StatusIcon connected={results.browser.connected} error={results.browser.error} />
                  <div>
                    <Typography variant="body2" className="font-medium">
                      Browser Client
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Klient-sidans Supabase anslutning
                    </Typography>
                  </div>
                </div>
                {results.browser.error && (
                  <Typography variant="caption" className="text-error-600 max-w-xs text-right">
                    {results.browser.error}
                  </Typography>
                )}
              </div>

              {/* Server Client */}
              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
                <div className="flex items-center gap-3">
                  <StatusIcon connected={results.server.connected} error={results.server.error} />
                  <div>
                    <Typography variant="body2" className="font-medium">
                      Server Client
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Server-sidans Supabase anslutning
                    </Typography>
                  </div>
                </div>
                {results.server.error && (
                  <Typography variant="caption" className="text-error-600 max-w-xs text-right">
                    {results.server.error}
                  </Typography>
                )}
              </div>

              {/* Database Schema */}
              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
                <div className="flex items-center gap-3">
                  <StatusIcon connected={results.database.connected} error={results.database.error} />
                  <div>
                    <Typography variant="body2" className="font-medium">
                      Database Schema
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      Profiles tabell och struktur
                    </Typography>
                  </div>
                </div>
                {results.database.error && (
                  <Typography variant="caption" className="text-error-600 max-w-xs text-right">
                    {results.database.error}
                  </Typography>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Typography variant="body2" className="text-neutral-500">
                Klicka på &quot;Testa&quot; för att köra anslutningstester
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instruktioner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Typography variant="body2" className="font-medium mb-2">
              1. Skapa Supabase Projekt
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Gå till <a href="https://supabase.com" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a> och skapa ett nytt projekt.
            </Typography>
          </div>

          <div>
            <Typography variant="body2" className="font-medium mb-2">
              2. Konfigurera Environment Variables
            </Typography>
            <Typography variant="body2" className="text-neutral-600 mb-2">
              Kopiera .env.local.example till .env.local och fyll i dina uppgifter:
            </Typography>
            <div className="bg-neutral-900 text-neutral-100 p-3 rounded-md text-sm font-mono">
              cp .env.local.example .env.local
            </div>
          </div>

          <div>
            <Typography variant="body2" className="font-medium mb-2">
              3. Kör Database Migreringar
            </Typography>
            <Typography variant="body2" className="text-neutral-600 mb-2">
              Kör SQL-skripten i Supabase Dashboard {'>'} SQL Editor:
            </Typography>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-600">
              <li>supabase/migrations/001_profiles.sql</li>
              <li>supabase/migrations/002_teacher_verification.sql</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}