# Skolapp – Milestone I–N (Org, SSO, Bibliotek, Live 2.0, PWA/Push, Billing, Kvalitet)

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
- Alla DB-ändringar via migrations; **RLS krävs** för nya tabeller.
- UI på **svenska**, A11y (WCAG 2.1 AA), telemetri för nya flöden.

---

## Milestone I — Organisationer, Roller & SSO

### I1. Org-modell & RLS
- [x] Migrationer: `organisations`, `organisation_members(role: admin|teacher)`, `org_id` på `schools/classes`.
- [x] RLS: lärare ser endast sin org; admin kan lägga till/ta bort medlemmar.
**Acceptans**
- [x] Datat isoleras per org; queries scoper alltid på `org_id`.

### I2. Inbjudningar
- [x] API + e-postmall (svenska) för org-invite.
- [x] Join-sida: ogiltig/utgången länk hanteras korrekt.
**Acceptans**
- [x] Lärare kan bli inbjudna och gå med i org; auditlogg skapas.

### I3. SSO (Google/Microsoft)
- [x] Supabase OAuth (Google/Microsoft). Domän→org-mappning.
- [x] Första login: föreslå org om domän matchar.
**Acceptans**
- [x] Login fungerar; org-mappning dokumenterad och testad.

### I4. Auditlogg
- [x] Tabell `audit_logs(actor, action, resource, org_id, ts)`.
- [x] Logga: invite, rollbyte, export, radering.
**Acceptans**
- [x] Admin kan se senaste händelser.

---

## Milestone J — Innehållsbibliotek & Delning

### J1. Bibliotek & versioner
 - [x] Tabeller: `libraries`, `library_items` (quiz/question), `item_versions`.
 - [x] Importera quiz → biblioteksmall; ny version vid ändring.
**Acceptans**
 - [x] Lärare kan spara/återanvända mallar; versionshistorik syns.

### J2. Sök & taggar
 - [x] Fulltextsök (titel/ämne/årskurs) + taggar.
 - [x] Filter: ämne, svårighet, typ.
**Acceptans**
 - [x] Hitta relevant mall < 2s; filtren fungerar.

### J3. Delning
 - [x] Delningslänk inom org (read-only/kopiera).
 - [x] Cross-org: signerad länk (begränsad livslängd).
**Acceptans**
 - [x] Import/kopia utan att exponera elevdata.

---

## Milestone K — Live-undervisning 2.0

### K1. Live-sessioner
 - [x] “Starta live” (lärare) → elever joinar (presence).
 - [x] Realtime-agg (Ably/Supabase Realtime).
**Acceptans**
 - [x] 25+ samtidiga elever utan tapp; latens < 300 ms LAN-nära.

### K2. Kontroller & anti-fusk (light)
 - [x] Pausa/lås fråga, visa/dölj rätt svar, tidsgräns.
 - [x] “Off-tab” indikering (heuristik).
**Acceptans**
 - [x] Klienter reagerar i realtid; status synkroniseras.

### K3. Genvägar
 - [x] Tangentbord: N (nästa), P (paus), R (visa svar).
**Acceptans**
 - [x] Genvägar fungerar och förklaras i UI.

---

## Milestone L — PWA, Push & Mobilfinish

### L1. PWA & offline
 - [x] Manifest + Workbox. Offline-quiz (elevklient) + sync-queue.
**Acceptans**
 - [x] Offline-svar sparas och synkas korrekt.

### L2. Push-notiser
 - [x] Web Push (OneSignal/FCM): “quiz startar”, “resultat klara”.
 - [x] Per användare/klass (opt-in/opt-out).
**Acceptans**
 - [x] Push levereras och kan styras i inställningar.

### L3. Mobil UI-polish
 - [x] Sticky bottombar/FAB (AI, Live, Bibliotek).
 - [ ] Touch-targets ≥44 px, safe areas, reducerad motion.
**Acceptans**
 - [ ] Lighthouse PWA ≥ 90; inga kritiska layoutskift.

---

## Milestone M — Planer, Kvoter & Billing

### M1. Planer & kvoter
- [x] Free/Pro/Skola: kvoter (klasser, AI-anrop/mån, delade mallar).
- [x] UI-indikatorer + graceful degrade vid tak.
**Acceptans**
- [x] Serverkvoter hårda; tydlig UX när tak nås.

### M2. Stripe Billing
- [x] Checkout + kundportal (org-admin).
- [x] Webhooks uppdaterar plan/status i DB.
**Acceptans**
- [x] Upp-/nedgradering syns inom 1 min; fel hanteras.

---

## Milestone N — Kvalitet, Observability & Release-gate

### N1. Observability
- [x] Sentry (web + edge/server) med release/sourcemaps.
- [x] Correlation-id i API + log drain.
**Acceptans**
- [x] Exceptions i Sentry med version; spårbara loggar.

### N2. Performance & stabilitet
- [ ] `next/image` + `sizes`. Profilering live-sessioner; retry/backoff.
**Acceptans**
- [ ] LCP/CLS stabila; live tål packet loss.

### N3. Testhårdning
- [ ] Playwright: auth (inkl. mail), org-invite, live, bibliotek.
- [ ] SQL/RLS-prober (pgTAP/scripts) i CI (Chromium + WebKit/Firefox).
**Acceptans**
- [ ] E2E + RLS grönt i CI.

### N4. Release-gate
- [ ] Pipeline: type-check, lint (0 varningar), build, e2e, RLS-prober, Lighthouse.
**Acceptans**
- [ ] Merge blockeras om något steg faller.

---

## Gemensamma krav
- [ ] Alla nya tabeller har migrations, index och **RLS**.
- [ ] Inga hårdkodade färg-hex (använd tokens/neutral-*).
- [ ] A11y: kontrast ≥ 4.5:1, aria-attribut, synlig fokus.
- [ ] Telemetri: varje ny route/event loggas anonymiserat (GDPR).
- [ ] Kort README-sektion per milstolpe (setup, endpoints, env).
