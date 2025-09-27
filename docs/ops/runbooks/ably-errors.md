# Runbook: Ably Realtime Fel & Begränsningar

Syfte: Hantera anslutningsfel, rate limits och instabil realtid.

## Detektion
- Larm: felspikar i Sentry med tag `route` relaterad till live‑routes.
- Hälsoskript `scripts/health/ably.ts` fallerar.

## Diagnostik
- Verifiera ABLY_SERVER_API_KEY giltighet och kvoter.
- Kontrollera kanalnamn och publikationsfrekvens.
- Identifiera klienter som spammar events.

## Åtgärder
- Stryp frekvens, batcha events.
- Backoff och retry med jitter på klient.
- Eskalera plan/kvoter om nödvändigt.

## Verifiering
- Stabil anslutning inom 10s och inga 429/5xx under toppar.
