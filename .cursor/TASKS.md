# Skolapp – Milestone AA–AF (Konkurrensfunktioner + Flerspråkig elevupplevelse)

> Kör i ordning: **AA → AB → AC → AD → AE → AF**.

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre kommandon är gröna** → markera tasken som `[x]`, gör en **liten** commit
  med prefix **AA1/AB1/…**, och **fortsätt DIREKT** till **nästa** task.
- **Stanna endast** om:
  1) type-check/lint/build misslyckas, **eller**
  2) acceptanskriterier är oklara/ambigua.
- Alla DB-ändringar via migrationer; **RLS krävs** för nya tabeller.
- UI-texter på **svenska**; elevinnehåll kan vara **flerspråkigt** (se AA).

---

## Milestone AA — Flerspråkig elevupplevelse (auto-översättning)

### AA1. Språkpreferens per elev
- [x] DB: `students.preferred_language` (`sv`, `en`, `ar`, `uk`, …), default `sv`.
- [x] RLS: elev/guardian/lärare med behörighet kan läsa/sätta preferensen.
**Acceptans**
- [x] Elev kan välja språk i profil; lärare kan sätta/återställa.

### AA2. Översättning av quiz-innehåll (run-time)
- [x] Backend: endpoint `POST /api/i18n/translate` med cache + kvot (modell kan vara OpenAI eller annan).
- [x] Översätt: quiz-titel, beskrivning, frågor, svarsalternativ, förklaringar.
- [x] Glossary-stöd: ämnesspecifika termer (t.ex. NO, matte) + “låt bli att översätta”.
- [x] Translation Memory: `translation_memory` + hash per fras/version.
**Acceptans**
- [x] Elev ser quiz på sitt språk utan märkbar fördröjning (cacheträffar).
- [x] Läraren kan **låsa** språk för “test”-lägen (ingen auto-översättning).

### AA3. Läraröversikt & manuell korr
- [x] UI (lärarvy): “Se/Lås översättning”, snabbredigera maskinöversatt text.
- [x] Spara lärarens override i `translation_memory` (prioritet över maskin).
**Acceptans**
- [x] Manuell korr visas för alla elever med samma målspråk.

### AA4. Read-aloud / TTS (elev)
- [x] TTS-stöd i elevklient för valt språk (browser/edge-funktion med fallback).
- [x] Preferenser: läshastighet, stopp/start per fråga.
**Acceptans**
- [x] Tydlig TTS-ikon, fungerar offline om möjligt (progressiv caching).

---

## Milestone AB — AI-generering (flera startpunkter)

### AB1. Källor: prompt, dokument, URL
- [x] UI: välj källa (ämne/prompt, ladda upp PDF/DOCX, klistra in URL).
- [x] Extractors: enkel text-/rubrikutvinning (server) + förhandsgranskning.
**Acceptans**
- [x] Läraren kan generera utkast med valfri källa.

### AB2. Promptbibliotek + nivå
- [x] `prompts/` m. metadata (ämne, årskurs, nivå, mål).
- [x] Välj svårighetsgrad (grund/medel/avancerad) → påverkar frågetyp/poäng.
**Acceptans**
- [x] Vald prompt-variant loggas och speglas i resultat.

### AB3. Evals & guardrails
- [x] Automatisk screening (läsbarhet, nivå, tox/olämpligt innehåll).
- [x] Diff-preview: visa ändringar/flaggar innan infogning.
**Acceptans**
- [x] <0.5% flaggade frågor slinker igenom över 30 dagar.

---

## Milestone AC — Rapporter & analytics (lärare)

### AC1. Quiz- och elevrapporter
- [x] Per quiz: rätt/fel, tidsåtgång, svårighetsgrad, distraktor-analys.
- [x] Per elev: trend över tid, mål-uppfyllelse, rekommendationer.
**Acceptans**
- [x] Läraren kan exportera CSV/PDF; data stämmer mot råtabeller.

### AC2. Klass/Dagbok
- [x] Veckovy: avklarat/kvar, riskindikatorer, “föreslå nästa”.
- [x] Telemetri: öppningsgrad, klick på rekommendationer.
**Acceptans**
- [x] Rekommendationer upplevs relevanta (≥70% av lärarna godkänner).

---

## Milestone AD — Bibliotek, delning & remix

### AD1. Publicera & sök
- [x] Publicera mallar till org/publik katalog; metadata (ämne, årskurs, nivå, språk, taggar).
- [x] Sök och filter; indexering inom 1 min.
**Acceptans**
- [x] Hittbarhet (testfall): mall dyker upp med givna taggar.

### AD2. Moderering & feedback
- [x] Rapportera olämpligt; intern moderationskö.
- [x] Betyg + kort kommentar (lärare).
**Acceptans**
- [x] Rapporter döljer mall tills granskad; feedback sparas.

### AD3. Remix
- [x] “Kopiera & anpassa” med bibehållen referens/version.
**Acceptans**
- [x] Ursprung krediteras; ingen elevdata följer med.

---

## Milestone AE — Media & import + tillgänglighetspaket

### AE1. Media i frågor
- [x] Bild/video/ljud i frågekort; storleksgräns, alt-text.
- [x] `next/image` + `sizes`; lazy-load + skeletons.
**Acceptans**
- [x] Snabb rendering; a11y-alt-texter krävs.

### AE2. Slide-import (MVP)
- [x] Ladda upp PPTX/PDF → generera frågeutkast per slide/sektion.
**Acceptans**
- [x] Minst 60% slides skapar meningsfulla utkast i testdataset.

### AE3. A11y-basics
- [x] Fokusordning, ARIA, kontrast ≥ 4.5:1, `prefers-reduced-motion`.
**Acceptans**
- [x] Manuell a11y-review passerad; inga blockande fel.

---

## Milestone AF — Game modes & kontroll

### AF1. Spellägen
- [x] “Standard” (tid+poäng), “Accuracy mode” (poäng för korrekthet), “Study mode” (utan tid).
**Acceptans**
- [x] Läraren kan välja läge; elevflöde ändras korrekt.

### AF2. Fusk-skydd (enkelt, icke-påträngande)
- [x] Slumpa ordning på frågor/svar; tidsgräns (per quiz/per fråga).
- [x] Fullscreen-läge (desktop), 1 försök i test-läge.
**Acceptans**
- [x] Test-läge upplevs rättvist; inga blockerande buggar.

---

## Gemensamma krav
- [x] **Migrationer + RLS** för nya tabeller (`translation_memory`, ev. `tts_cache`, `prompts`, `remix_refs`).
- [x] **Kostnadsvakter** för översättning/TTS/AI (per org/dag); cachea aggressivt.
- [x] **Telemetri**: språkval, TTS-användning, översättningscache-träff, AI-källa/typ, rapportvisningar.
- [ ] **Readme/docs**: kort setup för översättning/TTS/AI-källor + a11y-checklista.
