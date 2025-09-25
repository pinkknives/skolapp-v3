# Skolapp – Milestone E–H (Data, Supabase, Consent, Feedback)

> Kör i ordning: **E → F → G → H**.  
> **Milestone E börjar med en fullständig datagranskning + fix av Supabase & Auth-flöden** via MCP.

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre är gröna** → markera tasken `[x]`, gör **liten** commit med prefix **E0/E1…**, och **fortsätt direkt**.
- **Stanna endast** om:
  1) type-check/lint/build faller, **eller**
  2) acceptanskriterier är oklara/ambigua.
- Cursor får använda **MCP/Supabase** fullt ut: både read och write (`execute_sql`, `apply_migration`, `deploy_edge_function`).
- Alla schemaändringar görs via migrations (`supabase db migration new` + `apply_migration`), inte ad-hoc SQL.
- Telemetri/A11y ska alltid uppdateras vid nya UI-flöden.

---

## Milestone E — Data, Supabase & Consent

### E0. Data Audit & Fix
 - [x] Kör MCP: `list_tables`, `list_extensions`, `list_migrations`, `generate_typescript_types`, `execute_sql` (queries för `pg_indexes`, `pg_policies`, `information_schema`).
 - [x] Skapa/uppdatera docs:  
  - `docs/data/ERD.md` (tabeller, relationer, index, vyer)  
  - `docs/data/rls-review.md` (RLS policies, roll-matris)  
  - `docs/data/types.generated.ts` (Supabase TS-typer)  
  - `docs/data/types.diff.md` (skillnader mot lokala typer)  
  - `docs/data/gaps-and-migrations.md` (gap + planerade migrations)
 - [x] Om gap hittas → skapa migrationer och kör `apply_migration`.
**Acceptans**
- [x] `docs/data/*` skapade/uppdaterade.
- [x] Gap åtgärdade via migrationer eller listade i `gaps-and-migrations.md`.

### E0a. Auth-flöden (konto, login, reset, mail)
- [x] Inspektera Supabase `auth.*`-tabeller (users, sessions, identities, mfa, verifications).  
- [x] Skanna projektets auth-kod (`src/app/(auth)/**/*.{ts,tsx}`) för signup, login, reset password.  
- [x] Dokumentera flöden i `docs/data/auth-review.md`.  
- [ ] Verifiera mailmallar (signup, reset, magic links) – på svenska, rätt tonalitet.  
- [ ] Lägg E2E-tester (Playwright) för signup/login/reset flows.  
**Acceptans**  
- [ ] `auth-review.md` beskriver alla flöden.  
- [ ] Mailmallar fungerar i dev + prod.  
- [ ] Auth-flöden körbara i Playwright (signup, login, reset).

### E1. RLS & Åtkomstflöden
 - [x] Verifiera att alla quiz-/resultattabeller har korrekt RLS:  
  - Lärare → sina klasser  
  - Elever → sina egna resultat  
 - [x] Uppdatera policies om nödvändigt.  
 - [x] Lägg saknade index (klass_id, quiz_id, elev_id).  
**Acceptans**
 - [x] RLS testad med queries.  
 - [x] Index skapade, validerade.

### E2. Consent – Samtyckesdialog + inställning
 - [ ] UI: Modal vid första quizskapande: “Får vi använda dina quiz anonymiserat…”.  
 - [x] DB: `user_settings.consent_to_ai_training boolean NOT NULL DEFAULT false`.  
 - [x] Inställningsvy: toggle.  
**Acceptans**
 - [x] Beslut sparas i DB och kan ändras när som helst.

### E3. Insamling till träningsdata (opt-in)
 - [x] Ny tabell `ai_training_data` (quiz, frågor, metadata) utan PII.  
 - [x] Hook vid quiz-save: om `consent_to_ai_training === true` → skriv anonym rad.  
 - [ ] Telemetri: logga consent accept/decline + saved rows.  
**Acceptans**
 - [x] Endast samtyckta lärare bidrar data.  
 - [x] Ingen PII sparas.

---

## Milestone F — AI-träning & Feedbackloop

### F1. Export-pipeline (JSONL)
- [ ] CLI/cron som exporterar `ai_training_data` → JSONL batch.  
**Acceptans**
- [ ] Artefakt `exports/ai_training_YYYYMMDD.jsonl` skapas.

### F2. Lärar-feedback
- [ ] UI: “Var dessa frågor hjälpsamma?” (👍/👎 + ev. kommentar).  
- [ ] Tabell `ai_feedback` kopplad till genereringstillfälle.  
**Acceptans**
- [ ] Feedback sparas, joinbar med `ai_training_data`.

---

## Milestone G — Analys, Diagram & Transparens

### G1. Dashboard (lärare)
- [ ] Diagram för klass/elev över tid: resultat, trender, svårighetsgrad.  
- [ ] Index/vyer för prestanda.  
**Acceptans**
- [ ] Diagram visar korrekta aggregat.  

### G2. Transparens
- [ ] Info-sektion: “Så används datan/anonymisering”.  
- [ ] Länk till policy.  
**Acceptans**
- [ ] Text begriplig, på svenska.

---

## Milestone H — Skalning & Robusthet

### H1. Köer & async-insamling
- [ ] Flytta insamling till queue/async (Edge Function + Supabase Queue).  
**Acceptans**
- [ ] Quiz-save blockar ej, testad med ≥25 samtidiga.

### H2. Metrics/Observability
- [ ] Logga consent-rate, träningsrader/dag, feedback-ratio.  
- [ ] Dashboard + alerts.  
**Acceptans**
- [ ] Metrics synliga, larm triggas vid avvikelser.

---

## Gemensamma krav
- [ ] Alla schemaändringar via migrations.  
- [ ] RLS på alla nya tabeller.  
- [ ] Inga PII i träningsdata.  
- [ ] UI följer A11y + i18n (svenska).  
- [ ] CI kör tester på dataflöden och nya policies.  
- [ ] Mailmallar testas i dev + prod.  
- [ ] Auth-, quiz- och consentflöden täckta i Playwright E2E.