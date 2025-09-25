# Cursor Prompt – Milestone A–D (In-place AI-hjälp för Quiz)

> Kör i ordning: **A → B → C → D**. Följ *exakt* nedan. Små, fokuserade diffar. Små commits med prefix **A1/A2/B1…**.

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre är gröna:** markera tasken som `[x]`, gör **liten** commit `feat(quiz-ai): A1 …`, fortsätt DIREKT.
- **Stoppa endast** om build/lint/type-check faller, eller om acceptans är oklar. I övrigt: fortsätt automatiskt.
- Ändra **inte** secrets/RLS. Gör **inte** breda kosmetiska refactors.

---

## Milestone A — Layout & Varianter

### A1. Panel-variant [x]
**Mål**
- Lägg prop `variant: 'panel' | 'sheet'` i `ImprovedAIQuizDraft`.
- Bryt ur modal-beroenden. Skapa dockad `<aside>`-panel för desktop.
- Ta bort `showAIDraft`/`?type=ai-draft` i create-vyn.

**Gör så här**
1) I `ImprovedAIQuizDraft`:
   - Inför `variant`-prop.
   - Om `variant === 'panel'`: rendera utan overlay/stäng-X, med intern scroll: `max-h-[calc(100vh-8rem)] overflow-auto`.
2) I `src/app/teacher/quiz/create/page.tsx` (eller `QuizQuestionsStep` om create går via wizard):
   - Bygg grid: main + `<aside aria-label="AI-hjälp" class="sticky top-20 ...">`.
   - Rendera `ImprovedAIQuizDraft variant="panel"` permanent.
3) Ta bort logik för `showAIDraft` och URL-param `type=ai-draft`.

**Acceptans**
- Panelen syns till höger (≥1024px), sticky, utan overlay. Build/lint/type-check gröna.

---

### A2. Bottom sheet-variant (mobil) [x]
**Mål**
- Implementera `variant="sheet"` (bottom sheet).
- FAB på mobil som öppnar/stänger sheet. Half (~70vh) ↔ Full (100vh). Swipe/ESC stänger.
- Fokusfälla + restore focus.

**Gör så här**
1) `ImprovedAIQuizDraft`: branch för `sheet`:
   - `fixed bottom-0 inset-x-0`, drag-handle, trap focus, `aria-modal="true" role="dialog"`.
2) Skapa `FAB`-komponent (`fixed bottom-4 right-4`, respektera `env(safe-area-inset-bottom)`).
3) I create-vyn: mounta FAB endast `<640px` som togglar `sheet`.

**Acceptans**
- Mobil: FAB öppnar sheet (half/full), swipe/ESC stänger, fokus återställs till FAB.

---

### A3. Tablet-stöd [x]
**Mål**
- Panelen kollapsbar 640–1024px.
- Sticky sidoflik för öppna/stäng utan skroll.

**Gör så här**
- Lägg `data-state="open|closed"` på panelen. Skapa smal “AI”-flik (`position: sticky`) som togglar state.

**Acceptans**
- Tablet: panel kan öppnas/stängas via flik utan att scrolla.

---

## Milestone B — Per-fråga AI-åtgärder

### B1. AI-meny i frågekort [x]
**Mål**
- AI-ikon i varje frågekort med: *Förbättra*, *Förenkla/Förtydliga*, *Generera distraktorer*, *Omgenerera fråga*.
- Öppna panel/sheet i rätt åtgärdsflik, förifyll aktiv fråga.
- Diff-preview före ersättning.

**Gör så här**
- I `QuestionEditor`: lägg overflow-meny/ikon. Vid val: kalla `openAIAction({ action, question })`.
- I `ImprovedAIQuizDraft`: stöd för per-fråge-context och diff-preview (`före/efter`) + *Ersätt* / *Infoga* / *Avbryt*.

**Acceptans**
- Klick på AI-ikon visar diff-preview och kan ersätta/infoga. Fokus hoppar till uppdaterat fält. Toast “Fråga uppdaterad” + Ångra.

---

### B2. Bevara inline-funktioner
**Mål**
- Behåll inline-edit, delete/duplicate, rätt-svars-toggle även efter AI-ersättning.

**Gör så här**
- Återanvänd befintliga handlers; se till att ersättningen skriver in i samma state-struktur.

**Acceptans**
- Inline-UI fungerar identiskt före/efter AI-ersättning.

---

### B3. Undo/återställ + micro-interaktioner
**Mål**
- Spara **senaste** ändring per fråga (minst 1 nivå). Toast med Ångra.
- Efter infogning/ersättning: auto-scroll till frågekort + fokus på titelinput.

**Gör så här**
- Lokal ring-buffer (min 1) i state/localStorage.
- Utility för `scrollIntoView` + `focus()`.

**Acceptans**
- Ångra återställer föregående version. Ny/ersatt fråga scrollas in och fokuseras.

---

## Milestone C — Batch-generering & API

### C1. Generera om alla (batch)
**Mål**
- Global knapp ovanför frågelistan + i panelen.
- Preview i panel/sheet med selektering. *Lägg till* / *Ersätt*.

**Gör så här**
- Återanvänd mock/preview-mekaniken. Koppla till `onQuestionsGenerated`.

**Acceptans**
- Flera frågor genereras om i ett svep och kan väljas/införas utan sidbyte.

---

### C2. Lägg till fler frågor
**Mål**
- Knapp i panelen för att addera fler frågor utan att ersätta.

**Gör så här**
- Samma preview-flöde som C1 men merge istället för replace.

**Acceptans**
- Befintliga frågor finns kvar; nya läggs till selektivt.

---

### C3. API-actions
**Mål**
- Konsolidera till `enhanced-generate` med `action: 'improve' | 'rewrite' | 'regenerate' | 'distractors'`.
- Zod-schema + felhantering.

**Gör så här**
- Uppdatera serverroute/payload/guards. En enhetlig fetch-helper `aiAction(payload)`.

**Acceptans**
- Alla åtgärder går via samma endpoint; validering/fel visas korrekt i UI.

---

### C4. Draft-hantering
**Mål**
- Behåll localStorage-drafts för panelen.
- Cacha senaste per-frågeoperation (för Ångra).

**Gör så här**
- LS-nycklar namngett per quiz/id. Clear efter accept enligt befintlig policy.

**Acceptans**
- Reload behåller panelens utkast; ångra fungerar för senaste operation.

---

## Milestone D — A11y, Telemetri, Tester, Prestanda

### D1. Tillgänglighet
**Mål**
- Panel: `<aside aria-label="AI-hjälp">` (ej modal).
- Sheet: `role="dialog" aria-modal="true"`, fokusfälla, ESC/drag, restore focus.
- Live-region för “N nya frågor infogade” / “Fråga uppdaterad”.

**Acceptans**
- Tabb-ordning korrekt. Skärmläsare får feedback.

---

### D2. Microcopy (svenska)
**Mål**
- Konsekvent svensk microcopy i `form/generating/preview/error`.

**Acceptans**
- Alla texter på svenska, enhetlig ton.

---

### D3. Telemetri + feature flag
**Mål**
- Flagga `features.quizAI.docked`.
- Events: `ai_panel_open/close`, `ai_action_improve/regenerate/distractors`, `ai_batch_apply`, `ai_question_replace`, `undo`.

**Acceptans**
- Flagga kan slå av/på nya UI:t; events syns i logg.

---

### D4. Tester
**Mål**
- RTL: panel/sheet-rendering, per-fråga-meny, fokus/ARIA.
- Playwright: batch-flöde, per-fråga-förbättring, mobil FAB+sheet (half↔full, swipe).
- Lighthouse (manuellt/CI-artifact): fokus/kontrast OK.

**Acceptans**
- Samtliga nya tester gröna i CI.

---

### D5. Prestanda
**Mål**
- Dynamic import av AI-panelen på mobil/tablet.
- Skeleton loaders i `generating`.

**Acceptans**
- Låg initial load; tydlig “generating” skeleton.

---

## Slutkontroll (DoD)
- Desktop: dockad panel alltid synlig (ingen modal i create-vyn).
- Tablet: kollapsbar panel m. sticky flik.
- Mobil: FAB + bottom sheet (half/full, swipe/ESC, fokusfälla).
- Per-fråga-åtgärder med diff-preview + fokus/undo.
- Batch: generera om alla + lägg till fler utan sidbyte.
- Telemetri/flag OK, A11y OK, tester gröna.

