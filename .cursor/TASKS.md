# Skolapp – Milestone E–H (Data, Supabase, Consent, Feedback)

> Kör i ordning: **E → F → G → H**.  
> **Milestone E börjar med en fullständig data- & Supabase-granskning via MCP**.

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre är gröna** → markera tasken som `[x]`, gör **liten** commit med prefix **E1/E2…**, och **fortsätt direkt**.
- **Stanna endast** om:
  1) type-check/lint/build faller, **eller**
  2) acceptanskriterier är oklara/ambigua.
- **MCP/Supabase**: Använd **read-only** inspektion i E0/E1. Alla förändringar sker via migrations/PR (inte via ad-hoc SQL).

---

## Milestone E — Data & Supabase + Consent

### E0. Data Audit (MCP, read-only)
- [ ] Lista tabeller, vyer, policies, triggers och index via MCP:
  - `list_tables`, `list_extensions`, `list_migrations`, `get_project_url`
  - Vid behov **read-only** `execute_sql` för `pg_policy`, `pg_indexes`, `information_schema`.
- [ ] Dokumentera datamodellen (ER-översikt) med fokus på:
  - `users/teachers/students`, `classes`, `quizzes`, `questions`, `answers/responses`, `reports/analytics`.
  - Primärnycklar, FK, ON DELETE-beteenden, unika index.
  - RLS: vilka tabeller har `USING/WITH CHECK`, vilka roller (anon/auth/service).
- [ ] Granska datapipor:
  - Konto & inloggning (auth-tabeller), klass-/elevkopplingar, resultatskrivningar.
  - Analytics/diagram: vilka tabeller/vyer läses? aggregeringar? materialiserade vyer?
- [ ] Exportera **TypeScript-typer** via MCP `generate_typescript_types` (om tillgängligt) och jämför med lokala typer (drizzle/zod/types).
**Acceptans**
- [ ] `docs/data/ERD.md` skapad (eller uppdaterad) med tabellkarta, relationer och RLS-sammanfattning.
- [ ] `docs/data/types.ts` genererad/validerad mot appens typer.
- [ ] Lista på **gap/inkonsistenser** och föreslagna migrations (utan att köra dem).

### E1. RLS & Åtkomstflöden (review)
- [ ] Kartlägg **allt** som skriver/läser elevresultat och quizdata:
  - API-routes/Edge Functions som interagerar med Supabase.
  - Klient-SDK-anrop (auth-krav, row-scoping).
- [ ] Verifiera att **minsta behörighet** gäller (lärare ser bara sina klasser/elevdata, elever ser bara sitt).
- [ ] Identifiera saknade index för vanliga JOIN/WHERE (klass, quiz, tidsintervall).
**Acceptans**
- [ ] `docs/data/rls-review.md` med tydlig tabell/route-matris.
- [ ] Lista på exakta index/migrations som krävs (men **inte** körda).

### E2. Consent – Samtyckesdialog + inställning
- [ ] UI: första-körningen/”Skapa quiz” visar dialog om anonymiserad datadelning för att förbättra AI.
- [ ] DB: `user_settings.consent_to_ai_training boolean NOT NULL DEFAULT false`.
- [ ] Inställningsvy: toggle för att ändra beslut.
**Acceptans**
- [ ] Beslut sparas i DB, kan ändras när som helst. Behandlas på klientsidan (feature flaggar UI).

### E3. Insamling till träningsdata (opt-in)
- [ ] Ny tabell `ai_training_data` (quiz, frågor, metadata), **utan PII**:
  - Normalisera bort elev-ID, namn, e-post. Hasha/lossa ev. lärar-ID (k-anonymitet vid behov).
- [ ] Hook vid quiz-save: om `consent_to_ai_training === true` → skriv anonym post.
- [ ] Telemetri: `consent_accepted/declined`, `ai_training_data_saved`.
**Acceptans**
- [ ] Endast lärare som samtyckt genererar träningsrader.
- [ ] Ingen PII sparas. Telemetri visar antal/kvot.

---

## Milestone F — AI-träning & Feedbackloop

### F1. Export-pipeline (JSONL)
- [ ] Export av `ai_training_data` till JSONL: `{prompt, context, targets, tags, lang}`.
- [ ] CLI/cron (Edge Function/Scheduled) som bygger en batch.
**Acceptans**
- [ ] Artefakt `exports/ai_training_YYYYMMDD.jsonl` skapas lokalt/CI-artifact.

### F2. Lärar-feedback
- [ ] UI: “Var dessa frågor hjälpsamma?” (👍/👎 + kort motivering).
- [ ] Tabell `ai_feedback` kopplad till genereringstillfälle (utan elevdata).
**Acceptans**
- [ ] Feedback sparas och kan joinas mot träningsrader.

---

## Milestone G — Analys, Diagram & Transparens

### G1. Dashboard (lärare)
- [ ] Översikt per klass/elev över tid: aggregat, trendlinjer, svårighetsgrad.
- [ ] Prestanda: index/vyer för toppfrågor, felmönster.
**Acceptans**
- [ ] Diagram visar korrekta aggregeringar på klass- och elevnivå.

### G2. Transparens & förtroende
- [ ] Info-sektion: hur datan används/anonymiseras.
- [ ] Länk till policy/”Så funkar det”.
**Acceptans**
- [ ] Text godkänd (svenska, begriplig, icke-juridisk men korrekt).

---

## Milestone H — Skalning & Robusthet

### H1. Köer & async-insamling
- [ ] Flytta insamling till kö/async (Edge Function + queue) så quiz-save inte blockar.
**Acceptans**
- [ ] Under last (25+ samtidiga) är svarstider stabila.

### H2. Metrics/Observability
- [ ] Mätpunkter: consent-rate, träningsrader/dag, feedback-ratio, export-frekvens.
- [ ] Larm vid avvikelser.
**Acceptans**
- [ ] Dashboard/alerts visar hälsa och datavolymer.

---

## Gemensamma krav
- [ ] Alla schemaändringar via migrations + index.
- [ ] **RLS** på nya tabeller. Minsta behörighet verifierad.
- [ ] **Inga PII** i `ai_training_data`/`ai_feedback`.
- [ ] A11y, i18n (svenska) och telemetri på ny UI.
- [ ] CI: artefakter för export (F1), samt rapporter för E-granskning.
