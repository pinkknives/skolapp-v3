# API Smoke Test Guide för Skolapp v3

## Översikt

API smoke testen säkerställer att alla externa API-integrationery i Skolapp fungerar korrekt. Detta inkluderar AI-funktioner och andra kritiska tjänster.

## Vad testas

### Kärnfunktionalitet (krävs)
- ✅ **Supabase API** - Databas och autentisering
  - Browser client anslutning
  - Server client anslutning  
  - Databasschema verifiering

### Valfria funktioner (konfigurationsberoende)
- 🤖 **OpenAI API** - AI-drivna funktioner
  - Chat completions API
  - Model tillgänglighet
- 🔴 **Ably API** - Live Quiz realtidsfunktioner
  - Anslutningstest via WebSocket
  - Time endpoint verifiering
- 💳 **Stripe API** - Faktureringsfunktioner
  - Konto verifiering
  - API nyckel validering
- 📚 **Skolverket API** - Läroplansdata
  - Health check endpoint
  - Subjects API anrop

## Köra tester

### Manuellt
```bash
# Alla API:er
npm run health:all

# Enskilda API:er
npm run health:supabase
npm run health:openai
npm run health:ably
npm run health:stripe
npm run health:skolverket
```

### GitHub Actions
1. **Manuell körning**: Gå till Actions → "API E2E Smoke Test" → "Run workflow"
2. **Schemalagd körning**: Körs automatiskt dagligen kl 08:00 UTC

## Workflow-beteende

### Framgångsrikt test
```
✅ NEXT_PUBLIC_SUPABASE_URL is set
✅ Supabase query OK (fick tillbaka 1 rad)
✅ OpenAI svar: "OK från Actions"
✅ Ably time OK: [1737462814000]
✅ Stripe account OK
✅ Skolverket subjects OK
```

### Hantering av saknade nycklar
- **Kärnfunktioner** (Supabase): Workflow STOPPAR
- **Valfria funktioner** (OpenAI, Ably, Stripe): Workflow FORTSÄTTER med varning
- **Extern service** (Skolverket): Icke-kritiskt, loggar varning

### Felhantering
```
❌ NEXT_PUBLIC_SUPABASE_URL not set
⚠️ OPENAI_API_KEY not set - skipping AI features test
⚠️ Skolverket API test failed - curriculum features may be limited
```

## API Status Badge

README visar aktuell status för alla API:er:

[![API Status](https://github.com/pinkknives/skolapp-v3/actions/workflows/api-smoke-test.yml/badge.svg)](https://github.com/pinkknives/skolapp-v3/actions/workflows/api-smoke-test.yml)

## Felsökning

### Problem: Health script misslyckas lokalt
**Lösning**: Kontrollera att `.env.local` innehåller rätt API-nycklar

### Problem: Workflow misslyckas i GitHub Actions
**Lösning**: Kontrollera Repository Secrets i GitHub Settings

### Problem: "Network error" för Skolverket API
**Orsak**: Detta är förväntat i vissa miljöer - Skolverket API är extern tjänst
**Åtgärd**: Inga - detta är icke-kritiskt för kärnfunktionalitet

## Säkerhet

- ✅ API-nycklar maskeras i workflow-loggar
- ✅ Inga hemliga värden loggas eller committas
- ✅ Endast status och testresultat visas
- ✅ dotenv läser lokala konfigurationsfiler säkert

## Schemaläggning

Workflow körs automatiskt:
- **Frekvens**: Dagligen kl 08:00 UTC
- **Syfte**: Tidig upptäckt av API-problem
- **Aktion vid fel**: Badge uppdateras för att visa failure status

## Relaterade filer

- **Workflow**: `.github/workflows/api-smoke-test.yml`
- **Health scripts**: `scripts/health/`
- **Package scripts**: `package.json` (health:* commands)
- **Dokumentation**: `docs/github-secrets-guide.md`