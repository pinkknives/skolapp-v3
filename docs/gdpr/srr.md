# SRR (Subject Rights Requests)

## Självbetjäning (API)
- Export: `POST /api/srr/export` → ZIP med användarens data (RLS).
- Radering: `POST /api/srr/delete` → Anonymiserar elevsvar, kvittens.
- Rättelse: `POST /api/srr/rectify` body `{ displayName?: string }` → Uppdaterar profil, kvittens.

Alla anrop loggas i `srr_requests` med kvittens‑ID (`ack`).

## Administrativa exports
- Användarens samtycken: `GET /api/consents/export/user`
- Org‑samtycken (admin): `GET /api/consents/export/org?orgId=...`
