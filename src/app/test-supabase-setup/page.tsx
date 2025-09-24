'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Database, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TestSupabaseSetupPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)

  const createTables = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      const response = await fetch('/api/supabase/create-tables', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Fel vid skapande av tabeller',
        details: error instanceof Error ? error.message : 'Okänt fel'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const sqlScript = `-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create NextAuth.js tables
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  role VARCHAR(50) DEFAULT 'student',
  school_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);

-- Add foreign key constraints
ALTER TABLE accounts ADD CONSTRAINT fk_accounts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`

  return (
    <Layout>
      <Section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="lg">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Database className="w-6 h-6 text-primary-500" />
                Supabase Tables Setup
              </CardTitle>
              <Typography variant="body1" className="text-muted-foreground">
                Skapa NextAuth.js tabeller i din Supabase-databas
              </Typography>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      {result.success ? 'Tabeller skapade!' : 'Fel vid skapande'}
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

              {/* SQL Script Display */}
              <div className="space-y-4">
                <Typography variant="h6" className="font-semibold">
                  SQL Script som kommer att köras:
                </Typography>
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {sqlScript}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={createTables} 
                  disabled={isCreating}
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
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(sqlScript)
                    alert('SQL-scriptet kopierat till urklipp!')
                  }}
                >
                  Kopiera SQL-script
                </Button>
              </div>

              {/* Manual Instructions */}
              <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-500" />
                  Manuell installation
                </Typography>
                <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Gå till <a href="https://supabase.com/dashboard" target="_blank" className="text-primary-600 hover:underline">Supabase Dashboard</a></li>
                  <li>Välj ditt projekt</li>
                  <li>Gå till &quot;SQL Editor&quot; i vänster meny</li>
                  <li>Klistra in SQL-scriptet ovan</li>
                  <li>Klicka &quot;Run&quot; för att köra scriptet</li>
                  <li>Kontrollera att tabellerna skapades i &quot;Table Editor&quot;</li>
                </ol>
              </div>

              {/* Next Steps */}
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2">
                  Nästa steg efter att tabellerna är skapade
                </Typography>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Testa Supabase-anslutning på /test-supabase</li>
                  <li>🚀 Testa Google OAuth på /test-google-auth</li>
                  <li>⚡ Testa Ably real-time på /test-ably</li>
                  <li>🎯 Alla användardata sparas nu i Supabase!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </Layout>
  )
}
