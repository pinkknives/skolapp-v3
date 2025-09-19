# Environment Setup Guide

## Översikt

Skolapp v3 använder Supabase för backend-tjänster inklusive autentisering, databas och real-time funktioner. Den här guiden beskriver hur du konfigurerar miljövariabler för både lokal utveckling och CI/CD.

## Lokal utveckling

### 1. Kopiera environment template

```bash
cp .env.local.example .env.local
```

### 2. Skapa Supabase projekt

1. Gå till [supabase.com](https://supabase.com) och skapa ett konto
2. Klicka på "New Project"
3. Välj en organisation och ge projektet ett namn
4. Välj region (rekommenderas: Europe West - Ireland för svenska användare)
5. Skapa ett säkert lösenord för databasen

### 3. Hämta Supabase credentials

1. Öppna ditt Supabase projekt dashboard
2. Gå till **Settings** → **API**
3. Kopiera följande värden:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys")

### 4. Konfigurera .env.local

Redigera `.env.local` filen och fyll i dina uppgifter:

```bash
# Ditt projekt URL
NEXT_PUBLIC_SUPABASE_URL=https://ditt-projekt-ref.supabase.co

# Din anon public key (säker att exponera i browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key-här

# Din service role key (ALDRIG commit till version control)
SUPABASE_SERVICE_ROLE_KEY=din-service-role-key-här
```

### 5. Verifiera konfigurationen

```bash
# Kontrollera att TypeScript kompilerar
npm run type-check

# Starta utvecklingsservern
npm run dev
```

Besök `http://localhost:3000/admin/supabase-test` för att testa din Supabase-anslutning.

## CI/CD Setup (GitHub Actions)

### 1. Konfigurera GitHub Secrets

I ditt GitHub repository:

1. Gå till **Settings** → **Secrets and variables** → **Actions**
2. Klicka på **New repository secret**
3. Lägg till följande secrets:

| Secret Name | Beskrivning | Exempel |
|-------------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ditt Supabase projekt URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Din Supabase anon public key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Din Supabase service role key | `eyJhbGciOiJIUzI1NiIs...` |

### 2. Verifiera CI/CD konfiguration

GitHub Actions workflow (`.github/workflows/qa-suite.yml`) är redan konfigurerad att använda dessa secrets. Workflowet kommer att:

- Använda secrets för att bygga applikationen
- Köra tester med Supabase-anslutning
- Verifiera att alla miljövariabler är korrekt konfigurerade

### 3. Testa workflowet

Skapa en ny commit eller öppna en Pull Request för att trigga CI/CD workflowet och verifiera att allt fungerar.

## Säkerhetsbestämmelser

### ⚠️ Viktiga säkerhetsregler

- **ALDRIG** commit riktiga keys till version control
- **ALDRIG** exponera `SUPABASE_SERVICE_ROLE_KEY` i browser-kod
- **ALLTID** använd GitHub Secrets för CI/CD miljövariabler
- **ALLTID** rotera keys om de läcker ut

### Miljövariabel typer

| Variabel | Typ | Säkerhet | Användning |
|----------|-----|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Säker att exponera | Browser + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Säker att exponera | Browser + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Private | **ALDRIG** exponera | Endast Server |

### RLS (Row Level Security)

Supabase använder Row Level Security för att säkra data. `SUPABASE_SERVICE_ROLE_KEY` kan läsa all data och ska endast användas för:

- Server-side API routes
- Database migrationer
- Admin funktioner
- Test data setup

## Troubleshooting

### Vanliga problem

**Problem:** Build failar med "Missing Supabase environment variables"
```
Lösning: Kontrollera att alla tre miljövariabler är konfigurerade i GitHub Secrets
```

**Problem:** "Invalid Supabase configuration"
```
Lösning: Verifiera att URL och keys är kopierade korrekt från Supabase dashboard
```

**Problem:** "Permission denied" fel i applikationen
```
Lösning: Kontrollera RLS policies i Supabase och att rätt key används för rätt kontext
```

### Debug verktyg

- Använd `/admin/supabase-test` sidan för att testa anslutning
- Kontrollera browser console för client-side fel
- Kolla server logs för backend fel

## Relaterade filer

- `.env.local.example` - Template för lokala miljövariabler
- `.env.local` - Dina lokala miljövariabler (git ignored)
- `src/lib/supabase-browser.ts` - Browser client konfiguration
- `src/lib/supabase-server.ts` - Server client konfiguration
- `src/lib/supabase-test.ts` - Test verktyg för anslutning
- `.github/workflows/qa-suite.yml` - CI/CD konfiguration