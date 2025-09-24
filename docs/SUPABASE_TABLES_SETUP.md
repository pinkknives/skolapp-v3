# Supabase Tables Setup Guide

## 🗄️ Tabeller som behöver skapas

För att NextAuth.js ska fungera med Supabase behöver du skapa följande tabeller i din Supabase-databas:

### 1. Kör SQL i Supabase SQL Editor

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

## 🔧 Miljövariabler som behövs

Lägg till dessa i din `.env.local` fil:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=din_supabase_service_role_key
```

## 📍 Var hittar du dessa värden?

1. **Gå till Supabase Dashboard**: https://supabase.com/dashboard
2. **Välj ditt projekt**
3. **Gå till Settings > API**
4. **Kopiera**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

## ✅ Testa att det fungerar

1. **Starta om servern**:
   ```bash
   npm run dev
   ```

2. **Besök test-sidan**:
   ```
   http://localhost:3003/test-config
   ```

3. **Testa Google OAuth**:
   ```
   http://localhost:3003/test-google-auth
   ```

## 🚨 Felsökning

### Problem: "supabaseKey is required"
- **Lösning**: Kontrollera att `NEXT_PUBLIC_SUPABASE_URL` är satt korrekt

### Problem: "Invalid API key"
- **Lösning**: Kontrollera att `NEXT_PUBLIC_SUPABASE_ANON_KEY` är korrekt

### Problem: "Table doesn't exist"
- **Lösning**: Kör SQL-scriptet ovan i Supabase SQL Editor

## 🎯 Vad händer när det fungerar?

- **Användardata sparas** i Supabase-databasen
- **Sessioner lagras** persistent i databasen
- **Google OAuth** skapar användare automatiskt
- **Användardata** synkroniseras mellan sessioner

## 📊 Tabellstruktur

### `users` tabell
- `id` - Unik användar-ID
- `name` - Användarens namn
- `email` - E-postadress
- `image` - Profilbild URL
- `role` - Användarroll (student/teacher)
- `school_id` - Skol-ID (valfritt)

### `accounts` tabell
- `user_id` - Länk till användare
- `provider` - OAuth-provider (google)
- `provider_account_id` - Google-användar-ID
- `access_token` - OAuth access token

### `sessions` tabell
- `user_id` - Länk till användare
- `session_token` - Unik session-token
- `expires` - Session-utgångstid

När du har skapat tabellerna kommer Google OAuth att fungera med persistent användardata! 🚀
