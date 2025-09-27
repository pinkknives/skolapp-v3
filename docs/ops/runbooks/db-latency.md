# Runbook: Databaslatens & Långsamma Frågor

Syfte: Identifiera och åtgärda ökande latens i Postgres/Supabase.

## Detektion
- Ökad p95 på berörda API-routes i `/admin/observability`.
- Sentry-taggar med `route` och fel 500 vid tidouts.
- Supabase: Query stats visar långsam SQL (> 500 ms) eller blockeringar.

## Diagnostik
- Lista top N routes med sämst p95.
- Mappa routes -> SQL-frågor i kodbasen.
- Kontrollera index, n+1, filter på icke-indexerade kolumner.
- Kolla parallella transaktioner och lås.

## Åtgärder
- Skapa index på filter/sort-kolumner.
- Materialisera dyra sammanställningar till vy eller cache.
- Paginera och begränsa kolumnurval.
- Flytta tunga operationer till bakgrundsjobb.

## Verifiering
- Efter ändringar: kör syntetisk last och bekräfta p95 inom mål.
- Övervaka 24h för regressioner.
