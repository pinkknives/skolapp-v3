## J1 – Library RLS

## J2 – Search & Tags RLS

## J3 – Sharing RLS

- library_shares: SELECT/ALL endast för medlemmar i käll‑org; token används vid import (servervalidering)

- tags: SELECT/ALL endast för org‑medlemmar
- item_tags: SELECT/ALL endast för items inom medlemmens org

- libraries: SELECT/ALL endast medlemmar i org via org_id
- library_items: SELECT/ALL endast via join till libraries → medlemmar
- item_versions: SELECT/ALL endast via item → library → org medlemmar

## I1 – Organisations RLS

Tabeller och policies:

- organisations: SELECT endast för medlemmar; UPDATE/DELETE för admin; INSERT för authenticated (tillåter skapande – admin‑roll sätts via appflöde)
- organisation_members: SELECT medlemmar; INSERT/UPDATE/DELETE endast admin i mål‑org
- schools/classes: SELECT/ALL scopat via org_id till medlemmar i org
 - org_domains: SELECT medlemmar, write admin
 - audit_logs: SELECT medlemmar; INSERT medlemmar (skrivning från server)

Verifiering (probes):
- som lärare i org A: SELECT från classes med org_id=A → ok; org_id≠A → 0 rader
- som admin i org A: INSERT organisation_members(user_id=X) → ok; icke‑admin → 403 (0 rader)

## RLS Review – public schema

RLS-status:

- users: ENABLED
- accounts: ENABLED
- sessions: ENABLED
- verification_tokens: DISABLED

Policies (sammandrag):

- users
  - SELECT: auth.uid() = id
  - INSERT: with_check auth.uid() = id
  - UPDATE: auth.uid() = id

- accounts
  - SELECT/UPDATE/DELETE: auth.uid() = user_id
  - INSERT: with_check auth.uid() = user_id

- sessions
  - SELECT/UPDATE/DELETE: auth.uid() = user_id
  - INSERT: with_check auth.uid() = user_id

Kommentarer:

- Grundläggande self-access policies finns. Verifiera att server-sidor (service role) hanterar admin-åtgärder.
- Inga policies på verification_tokens (OK – används i verifieringsflöden).


