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
- [ ] DB: `students.preferred_language` (`sv`, `en`, `ar`, `uk`, …), default `sv`.
- [ ] RLS: elev/guardian/lärare med behörighet kan läsa/sätta preferensen.
**Acceptans**
- [ ] Elev kan välja språk i profil; lärare kan sätta/återställa.

### AA2. Översättning av quiz-innehåll (run-time)
- [ ] Backend: endpoint `POST /api/i18n/translate` med cache + kvot (modell kan vara OpenAI eller annan).
- [ ] Översätt: quiz-titel, beskrivning, frågor, svarsalternativ, förklaringar.
- [ ] Glossary-stöd: ämnesspecifika termer (t.ex. NO, matte) + “låt bli att översätta”.
- [ ] Translation Memory: `translation_memory` + hash per fras/version.
**Acceptans**
- [ ] Elev ser quiz på sitt språk utan märkbar fördröjning (cacheträffar).
- [ ] Läraren kan **låsa** språk för “test”-lägen (ingen auto-översättning).

### AA3. Läraröversikt & manuell korr
- [ ] UI (lärarvy): “Se/Lås översättning”, snabbredigera maskinöversatt text.
- [ ] Spara lärarens override i `translation_memory` (prioritet över maskin).
**Acceptans**
- [ ] Manuell korr visas för alla elever med samma målspråk.

### AA4. Read-aloud / TTS (elev)
- [ ] TTS-stöd i elevklient för valt språk (browser/edge-funktion med fallback).
- [ ] Preferenser: läshastighet, stopp/start per fråga.
**Acceptans**
- [ ] Tydlig TTS-ikon, fungerar offline om möjligt (progressiv caching).

---

## Milestone AB — AI-generering (flera startpunkter)

### AB1. Källor: prompt, dokument, URL
- [ ] UI: välj källa (ämne/prompt, ladda upp PDF/DOCX, klistra in URL).
- [ ] Extractors: enkel text-/rubrikutvinning (server) + förhandsgranskning.
**Acceptans**
- [ ] Läraren kan generera utkast med valfri källa.

### AB2. Promptbibliotek + nivå
- [ ] `prompts/` m. metadata (ämne, årskurs, nivå, mål).
- [ ] Välj svårighetsgrad (grund/medel/avancerad) → påverkar frågetyp/poäng.
**Acceptans**
- [ ] Vald prompt-variant loggas och speglas i resultat.

### AB3. Evals & guardrails
- [ ] Automatisk screening (läsbarhet, nivå, tox/olämpligt innehåll).
- [ ] Diff-preview: visa ändringar/flaggar innan infogning.
**Acceptans**
- [ ] <0.5% flaggade frågor slinker igenom över 30 dagar.

---

## Milestone AC — Rapporter & analytics (lärare)

### AC1. Quiz- och elevrapporter
- [ ] Per quiz: rätt/fel, tidsåtgång, svårighetsgrad, distraktor-analys.
- [ ] Per elev: trend över tid, mål-uppfyllelse, rekommendationer.
**Acceptans**
- [ ] Läraren kan exportera CSV/PDF; data stämmer mot råtabeller.

### AC2. Klass/Dagbok
- [ ] Veckovy: avklarat/kvar, riskindikatorer, “föreslå nästa”.
- [ ] Telemetri: öppningsgrad, klick på rekommendationer.
**Acceptans**
- [ ] Rekommendationer upplevs relevanta (≥70% av lärarna godkänner).

---

## Milestone AD — Bibliotek, delning & remix

### AD1. Publicera & sök
- [ ] Publicera mallar till org/publik katalog; metadata (ämne, årskurs, nivå, språk, taggar).
- [ ] Sök och filter; indexering inom 1 min.
**Acceptans**
- [ ] Hittbarhet (testfall): mall dyker upp med givna taggar.

### AD2. Moderering & feedback
- [ ] Rapportera olämpligt; intern moderationskö.
- [ ] Betyg + kort kommentar (lärare).
**Acceptans**
- [ ] Rapporter döljer mall tills granskad; feedback sparas.

### AD3. Remix
- [ ] “Kopiera & anpassa” med bibehållen referens/version.
**Acceptans**
- [ ] Ursprung krediteras; ingen elevdata följer med.

---

## Milestone AE — Media & import + tillgänglighetspaket

### AE1. Media i frågor
- [ ] Bild/video/ljud i frågekort; storleksgräns, alt-text.
- [ ] `next/image` + `sizes`; lazy-load + skeletons.
**Acceptans**
- [ ] Snabb rendering; a11y-alt-texter krävs.

### AE2. Slide-import (MVP)
- [ ] Ladda upp PPTX/PDF → generera frågeutkast per slide/sektion.
**Acceptans**
- [ ] Minst 60% slides skapar meningsfulla utkast i testdataset.

### AE3. A11y-basics
- [ ] Fokusordning, ARIA, kontrast ≥ 4.5:1, `prefers-reduced-motion`.
**Acceptans**
- [ ] Manuell a11y-review passerad; inga blockande fel.

---

## Milestone AF — Game modes & kontroll

### AF1. Spellägen
- [ ] “Standard” (tid+poäng), “Accuracy mode” (poäng för korrekthet), “Study mode” (utan tid).
**Acceptans**
- [ ] Läraren kan välja läge; elevflöde ändras korrekt.

### AF2. Fusk-skydd (enkelt, icke-påträngande)
- [ ] Slumpa ordning på frågor/svar; tidsgräns (per quiz/per fråga).
- [ ] Fullscreen-läge (desktop), 1 försök i test-läge.
**Acceptans**
- [ ] Test-läge upplevs rättvist; inga blockerande buggar.

---

## Gemensamma krav
- [ ] **Migrationer + RLS** för nya tabeller (`translation_memory`, ev. `tts_cache`, `prompts`, `remix_refs`).
- [ ] **Kostnadsvakter** för översättning/TTS/AI (per org/dag); cachea aggressivt.
- [ ] **Telemetri**: språkval, TTS-användning, översättningscache-träff, AI-källa/typ, rapportvisningar.
- [ ] **Readme/docs**: kort setup för översättning/TTS/AI-källor + a11y-checklista.
