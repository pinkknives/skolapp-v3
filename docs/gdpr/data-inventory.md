# Dataregister (GDPR) – Skolapp v3

Senast uppdaterad: 2025‑09‑27
Ägare: Produkt/Dataskydd (PO + DPO)

## System & Personuppgiftsbiträden
- Supabase (Postgres, Auth, Storage) – personuppgiftsbiträde. Data inom EU‑region där möjligt.
- Vercel (hosting) – biträde. Loggar och edge‑körning.
- Sentry (felspårning) – biträde. Pseudonymiserade händelser; inga PII i event.
- Ably (realtid) – biträde. Session- och kanalmetadata, ej PII.
- Stripe (betalning) – självständig personuppgiftsansvarig för betaldata.
- OpenAI (AI‑funktioner, valfritt) – biträde. Inga personuppgifter ska skickas; innehåll minimeras.

## Tabeller & Datakategorier (Postgres)
- `users` (identiteter från auth): e‑post, namn (valfritt), roll – Rättslig grund: Avtal.
- `orgs`, `org_members`: organisationsdata, medlemskap, roller – Avtal/berättigat intresse.
- `classes`, `students` (om aktiverat): klass/elevegenskaper – Avtal/berättigat intresse.
- `quizzes`, `sessions`: lärarens material och tillfällen – Avtal.
- `session_answers`, `attempt_items`: elevsvar/resultat – Avtal, utbildningsändamål.
- `libraries`, `library_items`, `item_versions`: delat undervisningsmaterial – Avtal.
- `consents`: samtycken för AI/telemetri – Samtycke.
- `audit_logs` (om aktiverat): spårbarhet – Berättigat intresse/rättslig förpliktelse.

## Lagring (Storage)
- Uppladdade filer (t.ex. bilder/underlag). Inget känsligt eller personnummer ska lagras.

## Telemetri & Loggar
- Sentry: felhändelser utan PII. `correlation_id` för spårbarhet.
- Interna mätvärden: `api_metrics` (route, status, duration, correlation_id) – inga personuppgifter.
- Vercel/Supabase loggar: standard, retention enligt leverantör.

## Retention & Radering
- `session_answers`, `attempt_items`: 36 månader (standard) eller enligt skolhuvudmans avtal. Radering vid SRR.
- `quizzes`, `sessions`: behålls tills lärare raderar eller konto avslutas (12 mån efter uppsägning).
- `consents`: behåll 48 månader för bevisbörda.
- `users`, `org_members`: raderas/anonymiseras vid kontoavslut (inom 30 dagar) om inte rättslig förpliktelse kräver längre.
- Telemetri (`api_metrics`): 90 dagar.
- Felspårning (Sentry): 90 dagar.
- Backuper: enligt leverantör, rullande max 35 dagar.

## Rättslig grund (sammanfattning)
- Avtal: inloggning, klass/quiz, elevsvar/resultat, delning inom organisation.
- Berättigat intresse: säkerhet, missbruksdetektering, felspårning, minimal nödvändig telemetri.
- Samtycke: AI‑assisterade funktioner (om text kan innehålla personuppgifter), cookies/analys (om aktiverat).

## Åtkomst & Säkerhet
- RLS aktiverat för alla elev-/org‑scopade tabeller (se `docs/data/rls-review.md`).
- Least privilege: service‑nycklar används endast server‑side.
- Kryptering i transit (TLS) och i vila (leverantörsstandard).

## Portabilitet & Export
- SRR‑export (ZIP) av användardata och elevresultat; CSV/JSON för quiz och resultat (se AQ3).

## Anmärkningar
- Inga känsliga personuppgifter (artikel 9) ska behandlas.
- Personnummer ska inte lagras.
- Innehåll som skickas till AI beskärs/anononymiseras.
