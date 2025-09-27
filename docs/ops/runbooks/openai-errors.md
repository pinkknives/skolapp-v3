# Runbook: OpenAI Fel & Kostnadsspikar

Syfte: Hantera API-fel (5xx, timeouts) och kostnadsspikar.

## Detektion
- Sentry error med tag `route` på AI‑endpoints.
- Hälsoskript `scripts/health/openai.ts` fallerar.
- Kostnadsvarningar (se AR3 i @TASKS.md för vakter).

## Diagnostik
- Vilken modell används? (byt till 3.5 vid incident)
- Latens mot OpenAI‑basURL och svarsstorlekar.
- Promptlängder och streaming.

## Åtgärder
- Sänk modell (4o→3.5), minifiera prompts, öka timeouts marginellt.
- Cachea resultat där möjligt, samt klipp onödiga fält.
- Aktivera retry med exponential backoff.

## Verifiering
- Färre fel och p95 < mål i `/admin/observability`.
