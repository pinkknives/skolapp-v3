# Skolapp – AI-frågegeneration (Skolverket-styrd, pricksäker)

**Mål:** Generera mycket träffsäkra frågor via OpenAI, styrt av Skolverkets mål/centralt innehåll, årskurs, ämne, område och svårighetsgrad. Returnera **validerad JSON** och koppla varje fråga till läroplanens punkter.

**Obligatoriskt:**
- Följ `CURSOR_RULES.md`.
- Kör efter varje task: `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`.
- Små commits per task: `AI1/AI2/...` i commit-prefix.
- Fortsätt automatiskt till nästa task utan att vänta på input när acceptans-kriterierna är uppfyllda.

---

## Förutsättningar / Miljö

- Env (i `.env.local`):
  - `OPENAI_API_KEY=...`
  - `OPENAI_PROJECT_ID=...` (om du använder)
  - `NEXT_PUBLIC_SKOLVERKET_API_URL=https://api.skolverket.se/syllabus/v1`
- Feature-flaggor (om sådana finns): lämna påslagna default (ingen kod som kräver manuellt togglande).
- Rör inte secrets/RLS utanför scope.

---

## Artefakter som ska skapas/ändras

- `src/app/api/ai/generate-questions/route.ts`  ← huvudroute (skapa/ersätt robust implementation)
- `src/lib/ai/prompt.ts`                          ← prompt-builder (system/dev/user)
- `src/lib/ai/skolverket.ts`                      ← hämtning och normalisering av mål/centralt innehåll
- `src/lib/ai/schemas.ts`                         ← Zod-scheman (input/output)
- `src/tests/ai/generate-questions.test.ts`       ← enhetstest (mocka OpenAI + Skolverket)
- Ev. mindre UI-koppling: säkerställ att Quiz-assistenten skickar alla fält.

---

## TASKS

### AI1 — Scheman (Zod) & typer ✅
**Gör:**
- Skapa `src/lib/ai/schemas.ts` med:
  - Input: `{ gradeBand: "ak1-3"|"ak4-6"|"ak7-9"|"gy1"|"gy2"|"gy3", subject: string, topic: string, subtopic?: string, difficulty: 1..5, bloom?: enum, type?: enum("mcq"|"short"|"numeric"|"open"), count: 1..20, language: "sv", extra?: string }`
  - Output: `{ questions: Question[], warnings?: string[] }`
  - `Question`: id, subject, grade_band, topic, difficulty, bloom, type, prompt, options?, answer, rationale?, curriculum[{id,label}]
**Acceptans:**
- `schemas.ts` exporterar `InputSchema`, `OutputSchema`, `QuestionSchema` utan `any`.
- Type-check/lint/build grönt.

---

### AI2 — Skolverket-hämtning ✅
**Gör:**
- Skapa `src/lib/ai/skolverket.ts`:
  - `fetchSkolverketObjectives(subject, gradeBand): Promise<Array<{id:string;label:string}>>`
  - Timeout 3s, robust felhantering, normalisera `{id,label}` (max ~12 st).
  - Bas-URL från `NEXT_PUBLIC_SKOLVERKET_API_URL`.
**Acceptans:**
- Vid API-fel returneras `[]` och loggas varning.
- Enhetlig output-form.

---

### AI3 — Prompt-builder ✅
**Gör:**
- Skapa `src/lib/ai/prompt.ts`:
  - `buildMessages(input, curriculum)` → `[system, developer, user]`
  - System: svensk ton, följ Lgr22/Gy11, JSON-krav, åldersanpassning.
  - Developer: exakt JSON-schema-instruktion, regler för antal, MCQ-kvalitet, svårighet→distraktorer, rationale, curriculum-koppling.
  - User: konkret info (klass/ämne/område/svårighet/antal/instruktioner) + inklistrad curriculum-lista.
**Acceptans:**
- Unit-test: builder returnerar tre meddelanden innehållande ämne, åk och topic.

---

### AI4 — Route-implementation (OpenAI JSON-mode) ✅
**Gör:**
- Implementera/ersätt `src/app/api/ai/generate-questions/route.ts`:
  - Parse request m. `InputSchema`.
  - Hämta curriculum via `fetchSkolverketObjectives`.
  - Bygg meddelanden via `buildMessages`.
  - Anropa OpenAI `chat.completions` med `response_format: json_schema` (eller motsv. SDK-stöd).
  - Validera svaret med `OutputSchema`.
  - Normalisera tomma fält (t.ex. `id`, `bloom`, `type`, `curriculum`) innan return.
  - Fel: returnera `{error, details}` 500 med tydligt skäl.
**Acceptans:**
- Genererar giltig JSON med minst 1 fråga.
- Klarar avsaknad av Skolverket-data (curriculum = `[]`).
- Type-check/lint/build grönt.

---

### AI5 — UI-koppling & params ✅
**Gör:**
- Säkerställ att Quiz-assistenten skickar ALLA fält: årskurs (gradeBand), ämne, topic/subtopic, difficulty, bloom?, type?, count, extra.
- Om n/a i UI: sätt rimliga defaults (ex: `type` auto, `bloom` auto).
- Visa fel från API snyggt (befintlig felruta räcker, men visa `details` om dev-build).
**Acceptans:**
- Man kan välja klass/ämne/område/svårighet/antal → output speglar valen.
- Inga hydreringsfel.

---

### AI6 — Tester
**Gör:**
- `src/tests/ai/generate-questions.test.ts`:
  - Mocka OpenAI-svar (JSON med 2 frågor).
  - Mocka Skolverket (2–3 items).
  - Testa: validering, curriculum-injektering, defaultfyllnad.
**Acceptans:**
- Testerna körs lokalt (`npm run test`) och i CI (minst smoke).

---

### AI7 — Finjustering & dokumentation
**Gör:**
- Mappa difficulty→temperatur (t.ex. `0.15 + 0.1*(difficulty-1)` clamp 0.15–0.7).
- Liten README-sektion: hur funktionen används och vilka fält som behövs i UI.
**Acceptans:**
- README uppdaterad under `docs/ai-questions.md` eller liknande.
- Bygg och lint grönt.

---

## Done Definition (hela epiken)
- Alla tasks AI1–AI7 uppfyllda.
- Demo: 3 körningar som visar skillnad mellan åk/ämnen/svårigheter och med/utan curriculum.
- Kod följer tokens/a11y-krav; inga hårdkodade färger; inga konsol-fel i dev.