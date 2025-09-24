# Billing & Prenumerationssystem

## Översikt
Skolapp v3 använder användarbaserat faktureringssystem via Stripe för individuella prenumerationer. Varje användare har sin egen prenumeration med personliga kvoter och entitlements.

## Arkitektur

### Komponenter
- **Stripe Checkout**: Hanterar säker betalning (inga kortdata i vår databas)
- **Stripe Billing Portal**: Självservice för användare (uppsägning, ändra plan)  
- **Webhooks**: Automatisk synkronisering av prenumerationsstatus
- **Feature Guards**: Kontrollerar åtkomst till AI-funktioner baserat på kvoter
- **Usage Tracking**: Spårar AI-användning per användare med månatliga kvoter

### Datalagring
Vi följer GDPR genom att:
- **Inte lagra** kortdata eller känslig betalningsinformation
- **Endast lagra** nödvändiga identifierare från Stripe
- **Automatiskt synkronisera** status via webhooks
- **Spåra användning** för kvothantering och transparens

### Tabellstruktur
```sql
-- Nya kolumner i profiles-tabellen:
stripe_customer_id: text
subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | null
plan: 'free' | 'pro' | null

-- Ny entitlements-tabell (per användare):
uid: uuid (PK, FK till auth.users)
ai_unlimited: boolean
export_csv: boolean  
advanced_analytics: boolean
seats: integer
ai_monthly_quota: integer
ai_monthly_used: integer
period_start: date
period_end: date

-- Ny billing_events-tabell (audit):
id: uuid (PK)
uid: uuid (FK till auth.users)
type: text
raw: jsonb
created_at: timestamptz
```

## Entitlements System

### Nuvarande planer
- **Gratis**: Grundfunktioner, 20 AI-frågor/månad, ingen CSV-export, ingen avancerad analys
- **Pro**: Obegränsad AI, CSV-export, avancerad analys, 99 kr/mån eller 990 kr/år

### AI-funktioner med kvoter
- **Gratis användare**: 20 AI-frågor per månad
- **Pro användare**: Obegränsad AI-användning (med rimlig rate-limiting)
- **Månadsvis reset**: Kvoter återställs automatiskt

### Premium-funktioner som kräver Pro
- Obegränsad AI-assisterad quiz-generering
- CSV-export av resultat
- Avancerad analys och rapporter
- Automatisk feedbackgenerering

## API Endpoints

### `/api/billing/checkout`
```typescript
POST /api/billing/checkout
Body: { priceId: string, mode?: 'subscription' }
Returns: { sessionId: string, url: string }
```

### `/api/billing/portal`
```typescript
POST /api/billing/portal
Returns: { url: string }
```

### `/api/billing/webhook`
```typescript
POST /api/billing/webhook
Headers: { stripe-signature: string }
Hanterar: checkout.session.completed, customer.subscription.*
```

### `/api/ai/usage`
```typescript
GET /api/ai/usage
Returns: { used: number, quota: number, unlimited: boolean, remaining: number }

POST /api/ai/usage
Returns: { success: boolean } eller { error: string, code: 'QUOTA_EXCEEDED' }
```

## Säkerhet

### Stripe Webhook-signaturverifiering
- Alla webhooks verifieras med `STRIPE_WEBHOOK_SECRET`
- Ogiltiga signaturer avvisas med 400-status

### Åtkomstkontroll
- Varje användare hanterar sin egen fakturering
- RLS-policies skyddar användardata
- Server-side kontroller för premium-funktioner

### AI-kvothantering
- Serverside spårning av AI-användning
- Automatisk blockering vid kvotöverskridning
- Månatlig återställning via databasfunktion

### Rate Limiting
- Grundläggande skydd mot missbruk
- Kan utökas med Redis eller liknande i produktionsmiljö

## Environment Variables
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (publika)
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_...

# Supabase (för webhook service role)
SUPABASE_SERVICE_ROLE_KEY=...
```

## GDPR-efterlevnad
- **Minimal datalagring**: Endast Stripe customer ID lagras
- **Användarkontroll**: Användare kan hantera sin prenumeration själv
- **Audit trail**: Alla faktureringshändelser loggas för transparens
- **Dataportabilitet**: Användning och status kan exporteras

## Användning i komponenter

### Kontrollera entitlements
```typescript
import { hasEntitlement } from '@/lib/billing'

const canExportCSV = await hasEntitlement('export_csv')
```

### Visa kvotinformation
```typescript
import { AIQuotaDisplay } from '@/components/billing/AIQuotaDisplay'

<AIQuotaDisplay className="mb-4" />
```

### Uppgradering
```typescript
import { AIFeatureBlock } from '@/components/billing/AIFeatureBlock'

<AIFeatureBlock 
  featureName="CSV-Export"
  description="Exportera quiz-resultat till CSV-format"
/>
```

### Kontrollera AI-kvot före användning
```typescript
// Klient-side kontroll
import { canUseAI, getQuotaStatus } from '@/lib/billing'

const canUse = await canUseAI()
const quota = await getQuotaStatus()

// Server-side spårning (API routes)
const response = await fetch('/api/ai/usage', { method: 'POST' })
if (response.status === 429) {
  // Kvot överskriden
}
```

## Testning

### Stripe Test Mode
- Använd Stripe test keys för utveckling
- Test webhooks via Stripe CLI eller ngrok

### Databastestning
```sql
-- Skapa testanvändare med entitlements
INSERT INTO entitlements (uid, ai_unlimited, export_csv) 
VALUES ('user-uuid', true, true);

-- Testa kvotfunktioner
SELECT increment_ai_usage('user-uuid');
```

## Monitoring & Logging

### Viktiga metrics
- AI-användning per användare
- Konverteringsgrad (gratis → pro)  
- Faktureringshändelser och fel
- Kvotöverskridningar

### Logging
- Webhook-händelser loggas i `billing_events`
- AI-användning spåras i `entitlements`
- Fel loggas i applikationsloggar

## Framtida utbyggnad

### Möjliga förbättringar
- Organisations-fakturering för skolor
- Volymlicenser och rabatter
- Mer granulära entitlements
- Advanced analytics för administratörer
- Automatiska påminnelser vid kvotöverskridning