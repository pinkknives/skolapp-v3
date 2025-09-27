# Larmregler (SLO & Hälsa)

## SLO-larm
- Tillgänglighet (24h) < 99.5% → P2
- p95 svarstid (24h) > 1200 ms på någon kritisk route → P2
- Felfrekvens (60 min) > 2% → P2

Åtgärd: Följ relevant runbook, skapa incident, utse on‑call.

## Hälsokontroller
- `scripts/health/ably.ts` fel → P2
- `scripts/health/openai.ts` fel → P2
- DB-latens: slow query > 1s eller lås > 5s → P2

## Kostnadsvakter (se AR3)
- OpenAI daglig kostnad > 80% budget → varning
- Ably meddelanden > 80% kvot → varning
