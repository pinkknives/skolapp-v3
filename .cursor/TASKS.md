# Skolapp – Milestone AL–AO (UX, Enkelhet & Pedagogik)

> Kör i ordning: **AL → AM → AN → AO**.  
> Fokus: Enkel användning, självklar navigering, minsta möjliga friktion.

---

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre kommandon är gröna** → markera tasken `[x]`, gör en **liten** commit
  med prefix **AL1/AM1/…**, och **fortsätt DIREKT** till **nästa** task.
- **Stanna endast** om:
  1) type-check/lint/build misslyckas, **eller**
  2) acceptanskriterier är oklara/ambigua.  
- Alla DB-ändringar via migrationer; **RLS krävs** för nya tabeller.
- UI på **svenska**, A11y (WCAG 2.1 AA), telemetri för nya flöden.
- **Inget får ligga gömt bakom mer än 2 klick.**

---

## Milestone AL — UX-granskning & UI-polish
- [x] Full UX-review: identifiera friktion (för många klick, otydliga knappar).
- [x] Harmonisering: knappar, ikoner, flöden → konsekvent placering.
- [x] Lägg till microcopy/tooltips vid osäkra moment (“Vad händer nu?”).
**Acceptans**
- [x] En ny lärare kan skapa och dela ett quiz på <2 min utan manual.

---

## Milestone AM — Guided onboarding
- [x] “Kom igång”-guide (coachmarks + checklista).
- [x] Demoquiz att testa direkt.
- [x] Contextual help: hjälp-ikon öppnar rätt docs/FAQ.
**Acceptans**
- [ ] >80% nya lärare klarar första quiz + delning utan support.

---

## Milestone AN — Pedagogiska funktioner
- [x] Läxor: välj antal försök (1 / obegränsat / X).
- [x] Test-läge: slumpa frågor/svar, tidsgräns, fullscreen-läge.
- [x] Feedback: förklaringar, tips efter quiz.
**Acceptans**
- [ ] Lärare kan skapa träningsquiz, läxa och prov – tydligt skilda.

---

## Milestone AO — Tillgänglighet & flerspråkighet polish
- [ ] Full WCAG 2.1 AA-check på alla vyer.
- [ ] Elev: smidig toggle för auto-översättning + TTS.
- [ ] “Större text”-läge (UI-scaling).
**Acceptans**
- [ ] Elever i olika åldrar/språk kan använda appen utan hinder.

---

## Gemensamma krav
- [ ] UI på svenska för lärare, elevinnehåll översätts efter preferens.
- [ ] Telemetri: logga var användare fastnar i UX-flödet.
- [ ] README/docs: UX-principer och a11y-checklista.
