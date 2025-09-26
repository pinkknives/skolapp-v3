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


