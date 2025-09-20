# Skolverket Syllabus API Integration

Detta dokument beskriver integrationen av Skolverkets Syllabus API med RAG-stöd för AI-frågegenerering i Skolapp v3.

## Översikt

Systemet hämtar officiella läroplansdata från Skolverkets API och använder denna som kontext (RAG) när AI genererar quiz-frågor. Detta säkerställer att frågorna baseras på korrekt och aktuellt underlag från svenska läroplaner.

## Konfiguration

### Miljövariabler

```bash
# Aktivera/avaktivera Skolverket-integrationen
FEATURE_SYLLABUS=true

# Bas-URL för Skolverkets Syllabus API
SYLLABUS_BASE_URL=https://api.skolverket.se/syllabus

# Admin API-nyckel för manuell datauppdatering
ADMIN_API_KEY=<säker_api_nyckel>

# Databasanslutning (Supabase)
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# OpenAI för embeddings (valfritt)
OPENAI_API_KEY=<openai_key>
```

## Komponenter

### 1. OpenAPI-klient (`src/lib/api/skolverket-client.ts`)

Robust klient för Skolverkets API med:
- Exponential backoff retry-logik
- Rate limiting-hantering
- Paginering av stora datamängder
- Felhantering och fallback

**Huvudmetoder:**
- `getSubjects()` - Hämta alla ämnen
- `getCentralContent()` - Hämta centralt innehåll per ämne/årskurs
- `getKnowledgeRequirements()` - Hämta kunskapskrav
- `healthCheck()` - Kontrollera API-tillgänglighet

### 2. ETL-process (`scripts/etl/skolverket.js`)

Hämtar, normaliserar och lagrar läroplansdata:

```bash
# Inkrementell uppdatering
npm run etl:skolverket

# Ny import (rensar befintlig data)
npm run etl:skolverket:fresh
```

**Funktioner:**
- Automatisk fallback till mock-data om API ej tillgängligt
- Chunking och embedding av textinnehåll
- Versionsspårning och metadata
- Robust felhantering

### 3. Admin API (`/api/admin/syllabus/refresh`)

Skyddad endpoint för manuell datauppdatering:

```bash
curl -X POST https://skolapp.se/api/admin/syllabus/refresh \
  -H "Authorization: Bearer <ADMIN_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"fresh": false}'
```

### 4. RAG-integration (`/api/rag/quiz/context`)

Hämtar relevant läroplanskontext baserat på ämne och årskurs:
- Hybrid sökning (semantisk + lexikal)
- Filterering på ämne och årskurs
- Begränsad textmängd för optimal AI-prestanda

### 5. GitHub Action (`.github/workflows/skolverket-refresh.yml`)

Automatisk veckovis uppdatering:
- Körs söndagar 02:00 UTC
- Skapar issue vid fel
- Manuell triggerning möjlig

## UI-integration

### AI-panelen förbättringar

- Realtids-kontroll av funktionens tillgänglighet
- Visuell feedback för RAG-status
- Källcitation från Skolverket
- Graceful fallback när data saknas

**Användargränssnitt:**
1. Checkbox för "Använd svenska läroplaner"
2. Infobox med källa och länk
3. Tydlig feedback vid otillgänglig data

## Säkerhet och juridik

### Dataskydd (GDPR)
- Endast offentliga läroplansdata
- Inga personuppgifter hanteras
- Tydlig källangivelse i UI

### API-säkerhet
- Rate limiting respekteras
- Robust felhantering
- Admin-endpoints skyddade med API-nycklar

## Användning

### För lärare
1. Öppna AI-frågegeneratorn
2. Välj ämne och årskurs
3. Aktivera "Använd svenska läroplaner"
4. Generera frågor med officiellt underlag

### För administratörer
1. Konfigurera miljövariabler
2. Kör initial ETL: `npm run etl:skolverket:fresh`
3. Övervaka GitHub Actions för automatisk uppdatering
4. Använd admin API för manuell refresh vid behov

## Felsökning

### Vanliga problem

**API-anslutning misslyckades**
- Kontrollera `SYLLABUS_BASE_URL`
- Verifiera nätverksanslutning
- Systemet faller tillbaka på mock-data

**ETL-process misslyckas**
- Kontrollera Supabase-konfiguration
- Verifiera OpenAI API-nyckel (om embeddings används)
- Granska loggar för specifika fel

**UI visar ej RAG-option**
- Kontrollera `FEATURE_SYLLABUS=true`
- Verifiera att RAG API svarar korrekt
- Kontrollera nätverkstrafik i utvecklarverktyg

### Loggar och övervakning

ETL-processen loggar:
- Antal bearbetade ämnen
- API-källa (skolverket_api eller mock_data)
- Senaste lyckade synkronisering
- Fel och varningar

## Utveckling

### Lokal utveckling
1. Kopiera `.env.local.example` till `.env.local`
2. Konfigurera Supabase-variabler
3. Sätt `FEATURE_SYLLABUS=true` för testning
4. Kör `npm run etl:skolverket` för att populera testdata

### Testning
- Unit tests för API-klient
- Integration tests för ETL-process
- E2E tests för UI-flöde

### Bidrag
- Följ svensk språk-first-principen
- Använd designsystemets tokens och komponenter
- Säkerställ accessibility (WCAG 2.1 AA)
- Inkludera tester för ny funktionalitet

## Framtida utveckling

### Planerade förbättringar
- OER-källor (Open Educational Resources)
- Vektorindexering med pgvector
- Skolenhetsregistret för rapportering
- Avancerad analytics för läroplantäckning

### API-utvidgning
- Fler ämnen och årskurser
- Detaljerad innehållsstruktur
- Historisk versionsspårning
- Kopplade bedömningsstöd