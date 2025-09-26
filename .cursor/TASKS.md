# Skolapp – Milestone I–N (Nästa fas)

> Kör i ordning: **I → J → K → L → M → N**.

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre kommandon är gröna** → markera tasken som `[x]`, gör en **liten** commit
  med prefix **I1/I2/J1…**, och **fortsätt DIREKT** till **nästa** task.
- **Stanna endast** om:
  1) type-check/lint/build misslyckas, **eller**  
  2) acceptanskriterier är oklara/ambigua.  
  I alla andra fall: **fortsätt automatiskt** tills alla tasks är klara.
- Gör inte breda kosmetiska förändringar. Endast minimala, fokuserade diffar per task.
- Alla DB-ändringar via migrations; RLS krävs för nya tabeller.
- Följ A11y (WCAG 2.1 AA) & i18n (svenska), och logga telemetri för nya flöden.

---

## Milestone I — Organisationer, Roller & SSO

### I1. Org-modell & roller
 - [x] Tabeller: `organisations`, `organisation_members` (role: admin/teacher), koppling till `schools/classes`.
 - [x] RLS: isolera data per org; admin kan bjuda in lärare.
**Acceptans**
 - [x] Lärare ser bara data inom sin org; admin kan invitera/ta bort.

### I2. Org-invites
 - [x] Endpoint + e-postmall för org-inbjudan (svenska).
 - [x] Länk leder till join-sida; felhantering för ogiltig/utgången invite.
**Acceptans**
 - [x] Lärare kan gå med via e-postlänk; auditlogg skapas.

### I3. SSO (Google/Microsoft)
 - [x] Supabase OAuth för Google/Microsoft; mappa domän → org (konfig).
 - [x] “Föreslå org” på första login om domän matchar en befintlig org.
**Acceptans**
 - [x] Login funkar med båda IdP; org-mappning dokumenterad/testad.

### I4. Auditlogg
 - [x] Tabell `audit_logs` (actor, action, resource, org_id, ts).
 - [x] Logga nyckelhändelser: inbjudan, rolländring, export, radering.
**Acceptans**
 - [x] Admin kan se senaste händelser för sin org.

---

## Milestone J — Innehållsbibliotek & Delning

### J1. Bibliotek (mallar & versioner)
 - [x] Tabeller: `libraries`, `library_items` (quiz/question), `item_versions`.
 - [x] Importera quiz → biblioteks-mall; skapa ny version vid ändring.
 **Acceptans**
 - [x] Lärare kan spara/återanvända mallar; versionshistorik visas.

### J2. Sök & taggar
 - [x] Fulltextsök på titel/ämne/årskurs; taggar per item.
 - [x] Snabbfilter: ämne, svårighetsgrad, typ.
**Acceptans**
 - [x] Hitta relevanta mallar < 2s; filtren fungerar.

### J3. Delning
 - [x] Delningslänk inom org; val för read-only/kopiera.
 - [x] Cross-org delning via signerad länk (begränsad livslängd).
**Acceptans**
 - [x] Andra lärare kan importera/kopiera mall utan att se elevdata.

---

## Milestone K — Live-undervisning 2.0

### K1. Live-sessioner
 - [x] “Starta live” (lärare) → elevklient joinar session (presence).
 - [x] Live-resultat/agg uppdateras i realtid (Ably/Supabase Realtime).
**Acceptans**
 - [x] 25+ samtidiga elever utan tapp; latens < 300ms LAN-nära.

### K2. Kontroller & anti-fusk (light)
 - [x] Pausa/lås fråga, dölj/visa rätt svar, tidsgräns.
 - [x] “Elev är off-tab” signal (heuristik) – endast indikation, ej block.
**Acceptans**
 - [x] Kontroller påverkar klienter i realtid; off-tab markeras.

### K3. Snabbkommandon
 - [x] Tangentbordsgenvägar för lärare (N nästa fråga, P paus, R visa rätt svar).
**Acceptans**
 - [x] Genvägar fungerar och är dokumenterade i UI.

---

## Milestone L — PWA, Push & Mobilfinish

### L1. PWA & offline
 - [x] Manifest, Workbox-strategier (quiz-genomförande fungerar offline).
 - [x] Sync-queue för svar vid återkoppling.
**Acceptans**
 - [x] Offline-genomförande sparas och synkas korrekt.

### L2. Push-notiser
- [ ] Web Push (OneSignal/FCM): “quiz startar”, “resultat klara”.
- [ ] Inställning per användare/klass.
**Acceptans**
- [ ] Push levereras; opt-in/opt-out fungerar.

### L3. Mobil UI-polish
 - [x] Sticky bottombar/FAB där relevant (AI, Live, Bibliotek).
- [ ] Touch-targets ≥44px, keyboard-safe areas, reducerad motion.
**Acceptans**
- [ ] Lighthouse PWA ≥ 90; inga layoutskift i kritiska vyer.

---

## Milestone M — Planer & Billing

### M1. Planer & kvoter
- [ ] Free/Pro/Skola: kvoter (klasser, AI-anrop/mån, delade mallar).
- [ ] UI-indikatorer + graceful degrade när tak nås.
**Acceptans**
- [ ] Server-kvoter hårda; tydlig UX vid tak.

### M2. Stripe Billing
- [ ] Checkout + kundportal (org-admin).
- [ ] Webhooks som uppdaterar plan/status i DB.
**Acceptans**
- [ ] Upp/nedgradering syns inom 1 min; fel återhämtas.

---

## Milestone N — Kvalitet, Observability & QA-grind

### N1. Observability
 - [x] Sentry (webb + edge/server) med release & sourcemaps.
 - [x] Correlation-id i API & log drain.
**Acceptans**
 - [x] Exceptions i Sentry m. versions-tagg; korrelerade loggar.

### N2. Performance & stabilitet
- [ ] `next/image` + `sizes` för stora medier.
 - [x] Profilera live-sessioner; backoff/retry-strategier.
**Acceptans**
- [ ] LCP/CLS stabila; live håller vid packet loss.

### N3. Testhårdning
 - [x] Playwright: auth (inkl. mail), org-invite, live-session, bibliotek.
 - [x] SQL/RLS-tester (pgTAP eller scriptade probes).
**Acceptans**
 - [x] CI kör Chromium + minst WebKit/Firefox; RLS-suite grön.

### N4. Release-gate
 - [x] “Go/No-Go” pipeline: type-check, lint (0 varningar), build, e2e, RLS-probes, Lighthouse.
**Acceptans**
 - [x] Merge blockeras om något steg faller.

---

## Gemensamma krav
- [ ] Nya tabeller har migrations, index och **RLS**.
- [ ] Inga hårdkodade färg-hex (använd tokens/neutral-*).
- [ ] A11y: kontrast ≥ 4.5:1, aria-attribut, synlig fokus.
- [ ] Telemetri: varje ny route/event loggas anonymiserat (GDPR).
- [ ] Kort README-sektion per milstolpe (setup, endpoints, env).
