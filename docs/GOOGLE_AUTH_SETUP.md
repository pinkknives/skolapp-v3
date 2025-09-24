# Google Authentication Setup Guide

## Miljövariabler som behöver konfigureras

Skapa en `.env.local` fil i projektets rotkatalog med följande innehåll:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase (för databas)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Google Cloud Console Konfiguration

### 1. Skapa ett Google Cloud Project

1. Gå till [Google Cloud Console](https://console.cloud.google.com/)
2. Skapa ett nytt projekt eller välj ett befintligt
3. Aktivera Google+ API

### 2. Konfigurera OAuth 2.0

1. Gå till "APIs & Services" > "Credentials"
2. Klicka på "Create Credentials" > "OAuth 2.0 Client IDs"
3. Välj "Web application" som application type
4. Konfigurera följande:

**Authorized JavaScript origins:**
- `http://localhost:3000` (för utveckling)
- `https://yourdomain.com` (för produktion)

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google` (för utveckling)
- `https://yourdomain.com/api/auth/callback/google` (för produktion)

### 3. Hämta Credentials

1. Efter att ha skapat OAuth 2.0 Client ID, kopiera:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

## Supabase Konfiguration

### 1. Skapa Tabeller för NextAuth.js

Kör följande SQL i Supabase SQL Editor:

```sql
-- Enable necessary extensions
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
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### 2. Konfigurera RLS (Row Level Security)

```sql
-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for accounts table
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for sessions table
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);
```

## Testa Integrationen

1. Starta utvecklingsservern: `npm run dev`
2. Besök `/auth/signin` eller `/auth/signup`
3. Klicka på "Fortsätt med Google"
4. Följ Google OAuth-flödet
5. Kontrollera att användaren skapas i Supabase

## Produktionsdeployment

### 1. Uppdatera Google OAuth Settings

I Google Cloud Console, lägg till din produktionsdomän:
- **Authorized JavaScript origins:** `https://yourdomain.com`
- **Authorized redirect URIs:** `https://yourdomain.com/api/auth/callback/google`

### 2. Uppdatera Miljövariabler

Uppdatera `.env.local` med produktionsvärden:
- `NEXTAUTH_URL=https://yourdomain.com`
- `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

### 3. Säkerhetsinställningar

- Använd starka secrets för `NEXTAUTH_SECRET`
- Aktivera HTTPS i produktion
- Konfigurera säkra cookies i NextAuth.js

## Felsökning

### Vanliga problem:

1. **"Invalid redirect URI"** - Kontrollera att redirect URI matchar exakt i Google Console
2. **"Client ID not found"** - Verifiera att `GOOGLE_CLIENT_ID` är korrekt
3. **Database errors** - Kontrollera att Supabase-tabellerna är skapade korrekt
4. **CORS errors** - Lägg till din domän i Google OAuth inställningar

### Debug-tips:

- Kontrollera browser console för fel
- Använd NextAuth.js debug mode: `NEXTAUTH_DEBUG=true`
- Verifiera att alla miljövariabler är satta korrekt
