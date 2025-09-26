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
- [ ] API + e-postmall (svenska) för org-invite.
- [ ] Join-sida: ogiltig/utgången länk hanteras korrekt.
**Acceptans**
- [ ] Lärare kan bli inbjudna och gå med i org; auditlogg skapas.

### I3. SSO (Google/Microsoft)
- [ ] Supabase OAuth (Google/Microsoft). Domän→org-mappning.
- [ ] Första login: föreslå org om domän matchar.
**Acceptans**
- [ ] Login fungerar; org-mappning dokumenterad och testad.

### I4. Auditlogg
- [ ] Tabell `audit_logs(actor, action, resource, org_id, ts)`.
- [ ] Logga: invite, rollbyte, export, radering.
**Acceptans**
- [ ] Admin kan se senaste händelser.

---

## Milestone J — Innehållsbibliotek & Delning

### J1. Bibliotek & versioner
- [ ] Tabeller: `libraries`, `library_items` (quiz/question), `item_versions`.
- [ ] Importera quiz → biblioteksmall; ny version vid ändring.
**Acceptans**
- [ ] Lärare kan spara/återanvända mallar; versionshistorik syns.

### J2. Sök & taggar
- [ ] Fulltextsök (titel/ämne/årskurs) + taggar.
- [ ] Filter: ämne, svårighet, typ.
**Acceptans**
- [ ] Hitta relevant mall < 2s; filtren fungerar.

### J3. Delning
- [ ] Delningslänk inom org (read-only/kopiera).
- [ ] Cross-org: signerad länk (begränsad livslängd).
**Acceptans**
- [ ] Import/kopia utan att exponera elevdata.

---

## Milestone K — Live-undervisning 2.0

### K1. Live-sessioner
- [ ] “Starta live” (lärare) → elever joinar (presence).
- [ ] Realtime-agg (Ably/Supabase Realtime).
**Acceptans**
- [ ] 25+ samtidiga elever utan tapp; latens < 300 ms LAN-nära.

### K2. Kontroller & anti-fusk (light)
- [ ] Pausa/lås fråga, visa/dölj rätt svar, tidsgräns.
- [ ] “Off-tab” indikering (heuristik).
**Acceptans**
- [ ] Klienter reagerar i realtid; status synkroniseras.

### K3. Genvägar
- [ ] Tangentbord: N (nästa), P (paus), R (visa svar).
**Acceptans**
- [ ] Genvägar fungerar och förklaras i UI.

---

## Milestone L — PWA, Push & Mobilfinish

### L1. PWA & offline
- [ ] Manifest + Workbox. Offline-quiz (elevklient) + sync-queue.
**Acceptans**
- [ ] Offline-svar sparas och synkas korrekt.

### L2. Push-notiser
- [ ] Web Push (OneSignal/FCM): “quiz startar”, “resultat klara”.
- [ ] Per användare/klass (opt-in/opt-out).
**Acceptans**
- [ ] Push levereras och kan styras i inställningar.

### L3. Mobil UI-polish
- [ ] Sticky bottombar/FAB (AI, Live, Bibliotek).
- [ ] Touch-targets ≥44 px, safe areas, reducerad motion.
**Acceptans**
- [ ] Lighthouse PWA ≥ 90; inga kritiska layoutskift.

---

## Milestone M — Planer, Kvoter & Billing

### M1. Planer & kvoter
- [ ] Free/Pro/Skola: kvoter (klasser, AI-anrop/mån, delade mallar).
- [ ] UI-indikatorer + graceful degrade vid tak.
**Acceptans**
- [ ] Serverkvoter hårda; tydlig UX när tak nås.

### M2. Stripe Billing
- [ ] Checkout + kundportal (org-admin).
- [ ] Webhooks uppdaterar plan/status i DB.
**Acceptans**
- [ ] Upp-/nedgradering syns inom 1 min; fel hanteras.

---

## Milestone N — Kvalitet, Observability & Release-gate

### N1. Observability
- [ ] Sentry (web + edge/server) med release/sourcemaps.
- [ ] Correlation-id i API + log drain.
**Acceptans**
- [ ] Exceptions i Sentry med version; spårbara loggar.

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
