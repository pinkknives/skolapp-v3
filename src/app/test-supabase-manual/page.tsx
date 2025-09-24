'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Database, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export default function TestSupabaseManualPage() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create NextAuth.js tables
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
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for accounts table
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for sessions table
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Layout>
      <Section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="lg">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Database className="w-6 h-6 text-primary-500" />
                Supabase Manual Setup
              </CardTitle>
              <Typography variant="body1" className="text-muted-foreground">
                Skapa NextAuth.js tabeller manuellt i Supabase Dashboard
              </Typography>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <Typography variant="h6" className="text-success-700 dark:text-success-300">
                    Supabase-anslutning fungerar!
                  </Typography>
                </div>
                <Typography variant="body2" className="text-success-600 dark:text-success-400">
                  Miljövariablerna är korrekt konfigurerade. Nu behöver du bara skapa tabellerna.
                </Typography>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <Typography variant="h6" className="font-semibold">
                  Steg-för-steg instruktioner:
                </Typography>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                  <li>
                    <strong>Gå till Supabase Dashboard:</strong>{' '}
                    <a 
                      href="https://supabase.com/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline inline-flex items-center gap-1"
                    >
                      https://supabase.com/dashboard
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li><strong>Välj ditt projekt</strong> (eicodpabcqojxdsftgsd)</li>
                  <li><strong>Gå till &quot;SQL Editor&quot;</strong> i vänster meny</li>
                  <li><strong>Klistra in SQL-scriptet</strong> nedan</li>
                  <li><strong>Klicka &quot;Run&quot;</strong> för att köra scriptet</li>
                  <li><strong>Kontrollera att tabellerna skapades</strong> i &quot;Table Editor&quot;</li>
                </ol>
              </div>

              {/* SQL Script */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" className="font-semibold">
                    SQL Script att köra:
                  </Typography>
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Kopierad!' : 'Kopiera'}
                  </Button>
                </div>
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {sqlScript}
                  </pre>
                </div>
              </div>

              {/* What this script does */}
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2">
                  Vad detta script gör:
                </Typography>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Skapar 4 tabeller: users, accounts, sessions, verification_tokens</li>
                  <li>✅ Lägger till index för bättre prestanda</li>
                  <li>✅ Konfigurerar foreign key constraints</li>
                  <li>✅ Aktiverar Row Level Security (RLS)</li>
                  <li>✅ Skapar säkerhetspolicies för användardata</li>
                </ul>
              </div>

              {/* Next steps */}
              <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <Typography variant="h6" className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-500" />
                  Efter att du har kört scriptet:
                </Typography>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>🔄 Gå tillbaka till <a href="/test-supabase-advanced" className="text-primary-600 hover:underline">test-sidan</a></li>
                  <li>✅ Klicka &quot;Testa Anslutning&quot; - ska visa &quot;Ansluten&quot;</li>
                  <li>🗄️ Klicka &quot;Skapa tabeller automatiskt&quot; - ska visa att tabellerna finns</li>
                  <li>🚀 Testa Google OAuth på <a href="/test-google-auth" className="text-primary-600 hover:underline">test-google-auth</a></li>
                </ul>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Öppna Supabase Dashboard
                </a>
                <a 
                  href="/test-supabase-advanced" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Tillbaka till Test-sida
                </a>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </Layout>
  )
}
