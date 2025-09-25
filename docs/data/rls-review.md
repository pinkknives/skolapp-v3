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


