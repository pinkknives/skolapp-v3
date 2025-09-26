# Skolapp – Milestone E–G (Data, Consent, Auth E2E, Skolverkets API)

> Kör i ordning: **E → F → G**.  
> Fokus: korrekt datagrund (RLS + consent + träningsdata), fullständig Auth E2E inkl. mail, samt robust integration med Skolverkets API.

---

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre är gröna** → markera tasken som `[x]`, gör **liten** commit med prefix **E1/E2…**, och **fortsätt DIREKT** till nästa task.
- **Stanna endast** om:
  1) type-check/lint/build misslyckas, **eller**  
  2) acceptanskriterier är oklara/ambigua.  
  I alla andra fall: **fortsätt automatiskt** tills alla tasks är klara.
- Alla DB-ändringar via **Supabase migrations** (inte ad-hoc SQL).
- Följ A11y (WCAG 2.1 AA) & i18n (svenska). Logga telemetri för nya flöden.

---

## Milestone E — Data, Consent & Träningsdata

### E1. Consent (UI + DB)
- [x] Migration: **`2025-10-01T01_add_user_settings_consent.sql`**  
  - Tabell `user_settings` (om saknas): `user_id PK/FK`, `consent_to_ai_training boolean NOT NULL DEFAULT false`, `updated_at timestamptz default now()`  
  - Index: `user_settings_user_id_idx`
- [x] UI: vid första quiz-skapande → modal på svenska:  
  “Får vi använda dina quiz **anonymiserat** för att förbättra Skolapp?” (Ja/Nej)  
  - Inställningssida: toggle för att ändra samtycke.
- [x] Telemetri: `consent.accepted`, `consent.declined`, `consent.changed`
**Acceptans**
- [x] Användarens val sparas i `user_settings` och går att ändra.
- [x] Ingen insamling sker om `consent_to_ai_training = false`.

---

### E2. Träningsdata (AI) – insamling & RLS
- [x] Migration: **`2025-10-01T02_create_ai_training_data.sql`**  
  - Tabell `ai_training_data`:  
    ```
    id uuid pk default gen_random_uuid(),
    teacher_id uuid not null,
    quiz_id uuid not null,
    payload jsonb not null,     -- anonymiserad struktur (frågor, meta)
    subject text not null,
    grade_span text not null,
    created_at timestamptz default now()
    ```
  - Index: `ai_training_data_quiz_id_idx`, `ai_training_data_teacher_id_idx`, `ai_training_data_created_at_idx`
  - **RLS**:  
    - `SELECT`: endast `teacher_id = auth.uid()` **eller** service-role  
    - `INSERT`: endast `teacher_id = auth.uid()` **eller** server/edge-funktion  
    - `UPDATE/DELETE`: endast service-role
- [x] Server-hook: vid “quiz-save” → **om** `consent_to_ai_training === true` → skriv anonym rad till `ai_training_data`  
  - **PII-säkring**: ta bort elevnamn, e-post, fria texter som kan identifiera.
- [x] Telemetri: `ai_training.saved_row` (quiz_id, n_questions)
**Acceptans**
- [x] Samtyckta lärare genererar rader i `ai_training_data`, övriga inte.
- [x] RLS-test: anon/auth kan **inte** läsa andras rader; service kan.

---

### E3. Lärarfeedback (👍/👎 + kommentar)
- [x] Migration: **`2025-10-01T03_create_ai_feedback.sql`**  
  - Tabell `ai_feedback`:  
    ```
    id uuid pk default gen_random_uuid(),
    teacher_id uuid not null,
    training_row_id uuid not null references ai_training_data(id) on delete cascade,
    rating integer not null check (rating in (1,-1)),  -- 1 = 👍, -1 = 👎
    comment text,
    created_at timestamptz default now()
    ```
  - Index: `ai_feedback_training_row_id_idx`, `ai_feedback_teacher_id_idx`
  - **RLS**:  
    - `SELECT`: `teacher_id = auth.uid()` **eller** service-role  
    - `INSERT`: `teacher_id = auth.uid()`  
    - `UPDATE/DELETE`: endast service-role
- [x] UI: efter generering/infogning visas: “Var detta hjälpsamt? 👍/👎 + valfri kommentar”
- [x] Telemetri: `ai_feedback.submit` (rating, hasComment)
**Acceptans**
- [x] Feedback sparas och går att join:a med `ai_training_data`.
- [x] RLS blockerar obehöriga läs/skriv.

---

## Milestone F — Auth & Mail E2E

### F1. Svenska mailmallar (Supabase Auth)
- [x] Sätt mallar (svenska) för: **Confirm signup**, **Magic link**, **Reset password**  
  - Källsanning i repo: `emails/auth/{confirm,magiс,reset}.mdx`  
  - Variabler: länk, giltighetstid, supportadress, enkel footer utan PII
- [x] Script: `scripts/verify-emails.ts` för dev-smoke (Mailpit/Mailhog alt. stub)
**Acceptans**
- [x] Provskick i dev + prod fungerar och landar i rätt vyer.
- [x] `docs/data/auth-review.md` visar malltexter + skärmklipp.

---

### F2. Playwright – fulla auth-flöden
- [x] `tests/e2e/auth.signup.spec.ts`: fyll formulär → se “confirm email” → simulera länk → landa inloggad  
- [x] `tests/e2e/auth.login.spec.ts`: lyckad login + felhantering  
- [x] `tests/e2e/auth.reset.spec.ts`: initiera reset → länk → nytt lösen → login OK
- [x] Kör i CI (Chromium + minst WebKit/Firefox)
**Acceptans**
- [x] Alla tre flöden gröna i CI; bryter på regressioner.

---

### F3. RLS-prober i CI
- [x] Litet teststeg (Node/TS) som försöker otillåtna SELECT/INSERT på `ai_training_data`/`ai_feedback` med `anon`/`auth` → ska fallera
**Acceptans**
- [x] CI-markör “RLS suite” grön; röd på policy-regression.

---

## Milestone G — Skolverkets API (robust integration)

### G1. Health + version + fallback
- [x] Service: `src/services/skolverket/client.ts` (fetch m. timeout 5–8s, retry 3x, 429-backoff)  
- [x] Endpoint: `/api/health/skolverket` (200/503 + latency + ev. versionssträng)
- [x] Read-through cache (Supabase/Redis) + TTL per resurstyp; stöd ETag om finns
- [x] Fallback: visa “senast kända giltiga” med banderoll “Uppdatering pågår”
**Acceptans**
- [x] P95 < 2s vid cache-hit; fallback fungerar utan UI-krascher.

---

### G2. Schema-validering & kontraktstester
- [x] Zod-scheman för de fält som används (ämnes-/kurs-/kunskapskrav)
- [x] Contract tests: mock + (flag) live‐körningar i CI
**Acceptans**
- [x] Brytande API-ändringar flaggas i CI (schema-fel/snapshot-diff).

---

### G3. E2E: kursval → mål → UI
- [x] Playwright: skapa quiz → välj kurs/ämne → hämta mål → rendera → spara  
- [x] “API down”-scenario: UI degraderar till fallback
**Acceptans**
- [x] Båda scenarierna gröna i CI. Snapshot-diff kräver manuell godkännande.

---

### G4. Observability & larm
- [x] Telemetri: `skolverket.request`, `.cacheHit`, `.cacheMiss`, `.fallback`, `.version`, `.error`  
- [x] Cron (5–15 min) “syntetiska requests” + alerts vid p95 > 2s eller 5xx-kvot ↑
**Acceptans**
- [x] Dashboard visar trender; larm triggar inom 2 min vid störning.

---

## Gemensamma krav
- [x] **Alla** nya tabeller via migrations med index **och RLS**.  
- [x] Inga PII i `ai_training_data` eller loggar.  
- [x] UI på svenska, A11y (kontrast, aria, fokus, tangentbord) verifierad.  
- [x] CI kör: type-check, lint (0 varningar), build, **Playwright**, **RLS-prober**.  
- [x] Dokumentation uppdaterad (`docs/data/ERD.md`, `docs/data/rls-review.md`, `docs/skolverket/health.md`).

