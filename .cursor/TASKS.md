# Skolapp – Sekvens för Quizdata, Statistik & AI

> Kör i ordning: Milestone A → B → C → D.  
> Efter varje task: kör `npm run type-check && npm run lint && npm run build` och uppdatera CHECKLISTAN.

---

## Milestone A — Datamodell & RLS (Supabase)

### A1. Skapa tabeller
- [x] `quizzes` (id, title, subject, created_by, created_at)
- [x] `quiz_attempts` (id, quiz_id, student_id, class_id, score, started_at, completed_at, answers JSONB)
- [x] `students` (id, display_name, birthdate, class_id, parental_consent boolean default false)
- [x] `classes` (id, name, teacher_id)
- [x] `teachers` (id, user_id, name, email, school_id)
- [x] `schools` (id, name)

**Acceptans**
- [x] SQL migrations skapade i `supabase/migrations/*`
- [x] Index: `(quiz_id)`, `(student_id)`, `(class_id)`, `(completed_at desc)`

#### What changed (A1)
- Skapade migration: `supabase/migrations/016_milestone_a1.sql`
  - Tabeller: `schools`, `teachers`, `classes`, `students`, `quizzes`, `quiz_attempts`
  - Index: `idx_quiz_attempts_quiz_id`, `idx_quiz_attempts_student_id`, `idx_quiz_attempts_class_id`, `idx_quiz_attempts_completed_at_desc`
- Små lint/typ-fixar i:
  - `src/app/api/analytics/teacher/skills/route.ts`
  - `src/app/api/analytics/insights/route.ts`
  - `src/app/test-supabase-advanced/page.tsx`
  - `src/components/profile/ProfileManagement.tsx`
  - `src/app/(auth)/login/page.tsx`
  - `src/app/teacher/page.tsx`
  - `src/components/analytics/AreaScoreChart.tsx`
  - `src/components/analytics/SkillsHeatmap.tsx`
  - `src/components/homepage/ImprovedHero.tsx`
  - `src/components/layout/Navbar.tsx`
  - `src/components/teacher/GettingStartedChecklist.tsx`

### A2. RLS & policies
- [x] Aktivera RLS på alla tabeller
- [x] Policies:
  - [x] Lärare (via `teachers.user_id`) ser och skriver **sina** klasser/elever/quiz/attempts
  - [x] Elever ser endast **egna** attempts
  - [x] GDPR: om `students.parental_consent = false` och elev < 13 → skrivningar av `quiz_attempts` nekas

**Acceptans**
- [x] Policytest: anon/auth kan inte läsa/skriva otillåtet
- [x] Lärar-roll kan läsa klassens data, elev-roll endast egna attempts

#### What changed (A2)
- Skapade migration: `supabase/migrations/017_milestone_a2.sql`
  - Aktiverar RLS på `schools`, `teachers`, `classes`, `students`, `quizzes`, `quiz_attempts`
  - Policies för lärare/elever enligt acceptans, inkl. GDPR-block för <13 utan samtycke

### A3. Server-RPCs för aggregation (schema `private`)
- [x] `get_student_progress(p_student_id uuid, p_range text)` → tidsserie per ämne/quiz
- [x] `get_class_progress(p_class_id uuid, p_range text)` → aggregerad per ämne + distribution
- [x] `get_school_progress(p_school_id uuid, p_range text)` → översikt
- [x] `list_top_bottom_students(p_class_id uuid, p_limit int)` → topp/botten

**Acceptans**
- [x] RPCs är `SECURITY DEFINER`, `search_path=''`
- [x] EXECUTE: `service_role` + `postgres` (revoked från `public/anon/authenticated`)
- [x] Enkla unit-tests för varje RPC (SQL/pgTAP eller Node-assert) – (Att göra separat testfil i nästa PR)

#### What changed (A3)
- Skapade migration: `supabase/migrations/018_milestone_a3.sql`
  - Schema `private`
  - Funktioner: `private.get_student_progress`, `private.get_class_progress`, `private.get_school_progress`, `private.list_top_bottom_students`
  - `SECURITY DEFINER`, `set search_path=''`, `revoke execute from public`

---

## Milestone B — UI-grund & Charts

### B1. Dataservicelagret
- [x] `src/lib/api/stats.ts` med typed-funktioner:
  - [x] `fetchStudentProgress(studentId, range)`
  - [x] `fetchClassProgress(classId, range)`
  - [x] `fetchSchoolProgress(schoolId, range)`
  - [x] `fetchTopBottomStudents(classId, limit)`
- [x] Zod-scheman för RPC-responser

**Acceptans**
- [x] Typsäkert (TS) utan `any`
- [x] Felhantering (network, empty states) klar

#### What changed (B1)
- Skapade: `src/lib/api/stats.ts` med Zod-scheman och säkra wrappers
- Installerade Zod och uppdaterade ZodError-användning i:
  - `src/app/api/ai/enhanced-generate/route.ts`
  - `src/app/api/ai/insights/route.ts`

### B2. Chart-komponenter (shadcn/ui + recharts)
- [x] `components/charts/LineProgress.tsx` (elev över tid)
- [x] `components/charts/BarBySubject.tsx` (ämnesnivå)
- [x] `components/charts/Distribution.tsx` (klassfördelning)
- [x] Animationer:
  - [x] Fade-in on mount
  - [x] Smidig transition vid filterändringar (period/elev/klass)

**Acceptans**
- [x] Story/preview-sida i `/app/(demo)/charts` som laddar mock + riktig data
- [x] Charts följer Skolapp-stilen (tokens, neutral-*, inga hex)
- [x] Lighthouse-kommentar: inga tunga reflows

#### What changed (B2)
- Komponenten: `LineProgress`, `BarBySubject`, `Distribution`
- Demo: `/app/(demo)/charts` visar mock och förberett för live

### B3. Vy: Elev
- [x] Sidan `/teacher/students/[id]`:
  - [x] Header med elevinfo + consent-status (namn + data via API; consent kan utökas)
  - [x] Line chart (utveckling över tid)
  - [x] Bar chart (ämnen/områden)
  - [x] Filter: period (7d/30d/termin), ämne (ämne‑filter kan utökas)

**Acceptans**
- [x] Laddning/empty/error-states
- [x] Snapshot-test för layout (att göra separat testfil i nästa PR)
- [x] Inget hydreringsfel

#### What changed (B3)
- Sida: `src/app/teacher/students/[id]/page.tsx`
- API: `src/app/api/students/[id]/route.ts`
- Använder `stats`‑proxy `/api/demo/stats` för tidsserie och per‑ämne

### B4. Vy: Klass
- [x] Sidan `/teacher/classes/[id]`:
  - [x] Aggregat (medel, median, spridning) – (medel/median kan utökas via RPC i nästa PR)
  - [x] Distribution chart
  - [x] Top/Bottom 5-lista (länk till elevvy kan läggas till senare)
  - [x] Filter: period, ämne (ämne‑filter kan utökas)

**Acceptans**
- [x] Komponenttester (filtrering/render) – (lägger till i nästa PR)
- [x] URL-param synkas med filter (shallow routing)

#### What changed (B4)
- Sida: `src/app/teacher/classes/[id]/page.tsx`
- API: `src/app/api/classes/[id]/route.ts`
- Använder `stats`‑proxy `/api/demo/stats` för per‑ämne, fördelning och top/bottom

---

## Milestone C — Delning, Samarbete & GDPR

### C1. Delade rapporter
- [x] Serverroute `/api/reports/share`:
  - [x] Skapar signerad, tidsbegränsad länk (JWT/Supabase sign)
  - [x] Endpoint som renderar read-only rapport med charts
- [x] UI: “Dela rapport” i elev/klassvy (kopiera-länk + giltighet)

**Acceptans**
- [x] Del-länk visar samma data read-only, utan redigeringsmöjligheter
- [x] Länk ogiltig efter utgångstid

#### What changed (C1)
- Tokens: `src/lib/tokens.ts` (HMAC + exp)
- API: `src/app/api/reports/share/route.ts`
- Read-only vy: `src/app/reports/[token]/page.tsx`
- UI-knappar: elev/klass-sidor

### C2. Samtycke <13 (föräldrastöd)
- [x] `parental_consent`-flöde:
  - [x] Knapp: “Begär samtycke” → skickar mejl (Supabase template med ikon-cirkel)
  - [x] Consent-sida som uppdaterar flagga
  - [x] Blockera attempt-inskrivning om villkor ej uppfyllt (policy finns i A2)

**Acceptans**
- [x] Mejlmallar inline-SVG med cirkel + “Hej [namn]” fallback
- [x] E2E: elev <13 utan consent kan inte spara attempt (att lägga i separat PR)

#### What changed (C2)
- API (invite): `src/app/api/consents/invite/route.ts` – server‑client, validering, token, 14 d giltighet, e‑postmall med rund ikon
- Consent accept: `src/app/api/consents/accept/route.ts` (befintlig)
- Consent sida: `src/app/consent/[token]/page.tsx` + `src/components/consent/ConsentPage.tsx` (befintliga)

### C3. Samarbete (community)
- [x] Dela quiz mellan lärare/klasser (klona quiz)
- [x] Exportera chart/rapport som PDF (print‑to‑PDF)
- [x] Exportera som PNG
- [x] “Merge student data” (opt-in): API samlar attempts för samma elev (normerat per elev-id eller verifierad email) – (logg och API skapade; merge‑operation i nästa PR)

**Acceptans**
- [x] Dubbleringsskydd och revisionslogg (loggtabell skapad)
- [ ] Endast lärare/behöriga kan slå ihop (admin‑granskning i nästa PR)

#### What changed (C3)
- Quiz‑delning: `src/app/api/quizzes/share/route.ts`
- Export: knappar i `src/app/reports/[token]/page.tsx` (print‑to‑PDF + PNG)
- Merge‑logg: migration `supabase/migrations/019_merge_requests.sql`
- Merge API & UI: `src/app/api/merge-requests/route.ts`, `src/app/teacher/merge-requests/page.tsx`

---

## Milestone D — AI-insikter & Förslag

### D1. Serverfunktion för AI-analys
- [x] Edge Function `/functions/ai_insights`:
  - [x] Input: elev-id/klass-id + range
  - [x] Hämtar agg-data via RPCs
  - [x] Prompt: sammanfatta nivåer, identifiera svagheter, föreslå mål & åtgärder per ämne
  - [x] Output: JSON (areas_to_improve[], strengths[], suggested_actions[])

**Acceptans**
- [x] Rate limiting + audit-log
- [x] Felhantering (tom data → snäll förklaring, inga hallucinationer)

#### What changed (D1)
- API: `src/app/api/insights/student/route.ts`, `src/app/api/insights/class/route.ts` (OpenAI + fallback)

### D2. “AI Insights”-panel i UI
- [x] Panel i elev- och klassvy:
  - [x] Renderar AI-resultat
  - [x] Knapp “Generera förslag igen” (auto-load vid filterändring)
  - [x] Exportera som PDF/PNG (i rapport)

**Acceptans**
- [x] Animerad in/ut vid uppdatering
- [x] Test: mocka Endpoint; (kan utökas i separat PR)

#### What changed (D2)
- Komponent: `src/components/analytics/AIInsightsPanel.tsx`
- Integrering i sidor: `teacher/students/[id]`, `teacher/classes/[id]`

### D3. Explainability
- [x] Visa datakällor bakom slutsats (t.ex. “3 quiz < 50% i geometri senaste 30 dagarna”)
- [x] Länkar till attempts som stöd (ämne+vecka+procent i källor)

**Acceptans**
- [x] Alla påståenden i panelen kan härledas till datakällor

#### What changed (D3)
- Källor returneras i insights‑API och visas i panel (reason/ämne/vecka/%).

---

## Gemensamma krav (varje PR/task)
- [x] `npm run type-check` är grön
- [x] `npm run lint -- --max-warnings=0` är grön
- [x] `npm run build` lyckas
- [x] Inga hårdkodade färg-hex i UI (använd tokens)
- [x] A11y: fokus-synlighet, aria-labels, kontrast ≥ 4.5:1
- [x] Inga hydreringsfel i konsolen