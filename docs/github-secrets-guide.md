# GitHub Secrets Guide för Skolapp v3

## Översikt

Denna guide förklarar skillnaden mellan olika typer av secrets i GitHub och när de ska användas för Skolapp v3-projektet.

## Repository Secrets vs Codespaces Secrets

### Repository Secrets (Rekommenderat för CI/CD)

**Vad är det?**
Repository Secrets är krypterade miljövariabler som är tillgängliga för GitHub Actions workflows i detta repository.

**När ska de användas?**
- ✅ **GitHub Actions workflows** (som `deploy.yml`, `ci.yml`, etc.)
- ✅ **Automatiserade byggen och deployment**
- ✅ **CI/CD pipelines**

**Hur konfigurerar man dem?**
1. Gå till repository → Settings → Secrets and variables → Actions
2. Klicka på "New repository secret"
3. Lägg till dina secrets (se lista nedan)

### Codespaces Secrets (För utveckling)

**Vad är det?**
Codespaces Secrets är miljövariabler som är tillgängliga i GitHub Codespaces development environments.

**När ska de användas?**
- ✅ **GitHub Codespaces utvecklingsmiljöer**
- ✅ **När du utvecklar direkt i webbläsaren via Codespaces**
- ❌ **INTE för GitHub Actions workflows**

**Hur konfigurerar man dem?**
1. Gå till dina personliga Settings → Codespaces → Secrets
2. Lägg till secrets för utveckling

## Skillnad mellan GitHub Copilot och GitHub Actions

Det verkar finnas förvirring om "Copilot" i issue-beskrivningen. Här är klargörandet:

### GitHub Copilot (AI-kodassistent)
- **Syfte**: AI som hjälper dig skriva kod
- **Secrets**: Använder INTE GitHub Secrets direkt
- **Miljövariabler**: Läser från din lokala `.env.local` fil när du utvecklar

### GitHub Actions (CI/CD)
- **Syfte**: Automatiserade workflows för byggen, tester, deployment
- **Secrets**: Använder Repository Secrets
- **Miljövariabler**: Definieras i workflow-filer (`.github/workflows/`)

## Nödvändiga Secrets för Skolapp v3

### För GitHub Actions (Repository Secrets)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_PROJECT_ID=proj-...

# Ably Configuration (för Live Quiz)
ABLY_API_KEY=app_id.key_id:key_secret
ABLY_SERVER_API_KEY=app_id.key_id:key_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe Configuration
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_...

# Admin API Key
ADMIN_API_KEY=admin_...
```

### För lokal utveckling (.env.local)

Kopiera `.env.local.example` till `.env.local` och fyll i samma värden som ovan.

## Felsökning

### Problem: "API key not found" i GitHub Actions
**Lösning**: Kontrollera att secrets är konfigurerade i Repository Secrets (inte Codespaces Secrets)

### Problem: "API key not found" i lokal utveckling
**Lösning**: Kontrollera att `.env.local` filen existerar och innehåller rätt nycklar

### Problem: "ALBY_API_KEY" fel i workflow
**Lösning**: Detta var en typo - det ska vara `ABLY_API_KEY` (korrigerat i `deploy.yml`)

## Best Practices

1. **ALDRIG** committa API-nycklar till Git
2. **Använd Repository Secrets för CI/CD**
3. **Använd .env.local för lokal utveckling**
4. **Använd Codespaces Secrets endast för Codespaces**
5. **Rotera nycklar regelbundet**
6. **Använd minsta möjliga behörigheter för varje nyckel**

## API Key Validation i Deploy Workflow

Deploy-workflowet (`deploy.yml`) inkluderar automatisk validering av API-nycklar:

- ✅ **Kontrollerar att nycklar är satta**: OPENAI_API_KEY, ABLY_SERVER_API_KEY
- ✅ **Testar riktig API-anslutning**: Gör faktiska anrop till OpenAI och Ably
- ✅ **Stoppar deployment tidigt**: Om någon nyckel saknas eller inte fungerar
- ✅ **Tydliga felmeddelanden**: Med emojis för enkel debugging

**Exempel på output**:
```
✅ OPENAI_API_KEY is set
✅ ABLY_SERVER_API_KEY is set
🧪 Testing OpenAI API connection...
✅ OpenAI svar: PONG
🧪 Testing Ably API connection...
✅ Ably connection: OK
```

## Säkerhet

- ⚠️ Service role keys har admin-behörigheter - håll dem säkra
- ✅ Anon keys är säkra att exponera i frontend
- ✅ NEXT_PUBLIC_* variabler är säkra att exponera i frontend
- ❌ Exponera ALDRIG secret keys i frontend-kod