# Billing & Prenumerationssystem

## Översikt
Skolapp v3 använder Stripe för att hantera prenumerationer och betalningar på ett GDPR-säkert sätt. Systemet är utformat för att följa svenska dataskyddsregler och integrera smidigt med organisationsfunktionen.

## Arkitektur

### Komponenter
- **Stripe Checkout**: Hanterar säker betalning (inga kortdata i vår databas)
- **Stripe Billing Portal**: Självservice för kunder (uppsägning, ändra plan)
- **Webhooks**: Automatisk synkronisering av prenumerationsstatus
- **Feature Guards**: Kontrollerar åtkomst till AI-funktioner

### Datalagring
Vi följer GDPR genom att:
- **Inte lagra** kortdata eller känslig betalningsinformation
- **Endast lagra** nödvändiga identifierare från Stripe
- **Automatiskt synkronisera** status via webhooks

### Tabellstruktur
```sql
-- Nya kolumner i orgs-tabellen:
billing_status: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
entitlements: jsonb -- {"ai": boolean, "seats": number}
stripe_customer_id: text
stripe_sub_id: text
```

## Entitlements System

### Nuvarande planer
- **Gratis**: Basic funktioner, 10 platser, ingen AI
- **Premium**: AI-funktioner, 100 platser, 99 kr/mån eller 990 kr/år

### AI-funktioner som kräver premium
- AI-assisterad quiz-generering
- Automatisk feedbackgenerering
- Intelligenta bedömningsförslag

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

## Säkerhet

### Stripe Webhook-signaturverifiering
- Alla webhooks verifieras med `STRIPE_WEBHOOK_SECRET`
- Ogiltiga signaturer avvisas med 400-status

### Åtkomstkontroll
- Endast `owner` och `admin` kan hantera fakturering
- RLS-policies skyddar organisationsdata

### Rate Limiting
- Grundläggande skydd mot missbruk
- Kan utökas med Redis eller liknande i produktionsmiljö

## Environment Variables

### Obligatoriska (utveckling & produktion)
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...  # Privat nyckel (server-only)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook-signatur
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_... # Månatlig plan
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_... # Årlig plan
```

### Konfiguration i Stripe Dashboard
1. Skapa produkter för månatlig/årlig prenumeration
2. Konfigurera webhooks för: 
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## GDPR-efterlevnad

### Datahantering
- **Minimering**: Endast nödvändiga Stripe-ID:n lagras
- **Ändamål**: Data används endast för fakturering och funktionsåtkomst
- **Lagringstid**: Data raderas när organisation tas bort
- **Rätt till radering**: Hanteras via organisationsborttagning

### Transparens
- Användare informeras om vilka data som lagras
- Tydlig information om vad premium-funktioner innehåller
- Koppling till våra integritetsvillkor

## Användning i komponenter

### Kontrollera entitlements
```typescript
import { useEntitlements } from '@/hooks/useEntitlements'

function MyComponent() {
  const { canUseAI, billingStatus } = useEntitlements()
  
  if (!canUseAI) {
    return <AIFeatureBlock />
  }
  
  return <AIFeature />
}
```

### Visa faktureringsstatus
```typescript
import { BillingCard } from '@/components/billing/BillingCard'

<BillingCard 
  organizationId={orgId}
  canManage={userCanManageBilling}
/>
```

## Testning

### Stripe Test Cards
```
Lyckad betalning: 4242 4242 4242 4242
Nekad betalning: 4000 0000 0000 0002
3D Secure: 4000 0000 0000 3220
```

### Webhooks testning
1. Använd `stripe listen --forward-to localhost:3000/api/billing/webhook`
2. Testa checkout-flödet med testkort
3. Verifiera att status uppdateras korrekt

## Monitoring & Logging

### Webhook-loggar
- Alla webhook-event loggas i konsolen
- Fel vid statusuppdatering loggas med detaljer
- Stripe Dashboard visar webhook-leveranser

### Felhantering
- Stripe-fel översätts till svenska felmeddelanden
- Fallback-beteende om Stripe inte är tillgängligt
- Graceful degradation av UI-komponenter

## Framtida utbyggnad

### Potentiella förbättringar
- Seat-based billing (per lärare)
- Organisationsnivå-rabatter
- Kvartals/helårsrabatter
- Integrationsskydd mot missbruk
- Analytics för prenumerationshändelser