# Runbook: API Timeouts

Syfte: Felsök och åtgärda API-timeouts och höga p95-svarstider.

## Detektion
- Larm: p95 > tröskel (t.ex. 1000 ms) under 5 min i `/admin/observability`.
- Fel i logg: `Edge timeout` eller 504.

## Omedelbara åtgärder
- Kontrollera incident i hosting (Vercel/Supabase) status-sida.
- Skala ned tunga jobb; pausa batchar (om finns).
- Aktivera fallback (modellbyte 4o→3.5 om AI orsakar latens).

## Diagnostik
- Identifiera route med sämst p95 via nedbrytning per route.
- Inspektera senaste deploy diff; prestanda-regressioner?
- Verifiera DB-index och slow queries i Supabase (Query stats).

## Åtgärder
- Lägg till nödvändiga index.
- Cacha read-tunga endpoints.
- Dela upp tunga operationer i bakgrundsjobb.

## Verifiering
- Kör syntetisk last (25/100/500 samtidiga) och kontrollera p95 åter på mål.

## Postmortem
- Dokumentera rotorsak, åtgärder, samt preventionsplan.
