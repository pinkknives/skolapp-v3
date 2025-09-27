# Dataplacering & Retention

## Policies
- `api_metrics`: 90 dagar
- Sentry events: 90 dagar (hanteras hos leverantör)
- `session_answers`, `attempt_items`: 36 månader (konfigurerbart i avtal)
- `consents`: 48 månader
- Backuper: rullande max 35 dagar (leverantör)

## Körning
- Admin‑endpoint: `POST /api/admin/retention/run` städar `api_metrics` äldre än 90 dagar och skapar rapport i `retention_reports`.
- Övriga retentioner körs via schemalagda jobb/leverantörsinställningar.
