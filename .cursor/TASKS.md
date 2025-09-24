# Skolapp – Milestone E–J (Nästa fas)

> Kör i ordning: **E → F → G → H → I → J**.  
> Efter varje task: `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`.  
> Små commits per task med prefix **E1/E2 …**. Undvik breda kosmetiska diffar.

---

## Milestone E — Production Hardening & Kvalitet

### E1. Observability & Felspårning
- [ ] Lägg till Sentry (webb + Edge/Server routes) med release & sourcemaps.
- [ ] Lägg till correlation-id i API-svar/logg och skicka till log drain (Supabase/Logflare).
**Acceptans**
- [ ] Exceptions hamnar i Sentry med versions-tagg och stacktraces.
- [ ] Varje request korreleras i loggar via `x-correlation-id`.

### E2. Performance & LCP/CLS
- [ ] Använd `next/image` + `sizes` på stora bilder/illustrationer.
- [ ] Optimera charts/animationer för minimal layout shift (prefers-reduced-motion).
- [ ] Lighthouse ≥ 90 på teacher/student/class.
**Acceptans**
- [ ] Lighthouse-rapporter sparas som CI artifacts.

### E3. Testhårdning
- [ ] Playwright: e2e för login, elevvy, klassvy, delad rapport.
- [ ] pgTAP/SQL tests för policies & RPC:er (minst 1/grupp).
**Acceptans**
- [ ] CI kör Chromium + minst WebKit/Firefox.
- [ ] SQL-tester gröna.

### E4. Security & RLS-fuzz
- [ ] Fuzzade queries (anon/auth) som försöker läsa/skriva förbjudna tabeller.
- [ ] Zod safe-parse i alla serverroutes, maskera hemligheter i logs.
**Acceptans**
- [ ] Endpoints exponerar inget utan auth; fuzz-suite grön.

---

## Milestone F — Uppgifter, Bedömning & Återkoppling

### F1. Uppgiftsflöde
- [ ] Tabeller: `assignments`, `submissions`, `rubrics` (+ index).
- [ ] RLS för lärare/elever + koppling till `classes`/`quizzes`.
**Acceptans**
- [ ] Elev kan lämna in; lärare kan bedöma mot rubrik.

### F2. Återkoppling & Historik
- [ ] UI: inline feedback + tidslinje per elev.
- [ ] Export av bedömningsunderlag (PDF).
**Acceptans**
- [ ] Elev & lärare ser historik; export fungerar.

---

## Milestone G — Realtid i klassrummet

### G1. Live-quiz & Närvaro (Ably/Supabase Realtime)
- [ ] “Start live quiz” (lärare) → elevklient joinar session.
- [ ] Presence + live-resultat (agg/sek).
**Acceptans**
- [ ] 25+ samtidiga elever uppdateras i realtid utan tapp.

### G2. Snabbkommandon & Låsning
- [ ] Läraren kan pausa, låsa fråga, visa rätt svar.
**Acceptans**
- [ ] Klienter reagerar < 300 ms på LAN-nära.

---

## Milestone H — PWA & Mobilupplevelse

### H1. PWA-basics
- [ ] Manifest, offline-fallback, Workbox cache-strategier.
- [ ] Touch-targets, motion-reducering, fokusringar.
**Acceptans**
- [ ] “Add to Home Screen” och Lighthouse PWA ≥ 90.

### H2. Responsiva vyer
- [ ] Elev-/klassgrafer optimerade för mobil & tablet.
**Acceptans**
- [ ] Charts animerar smidigt på lågprestanda-enheter.

---

## Milestone I — Multi-tenant & Roller

### I1. Organisationer & Roller
- [ ] Tabeller: `organisations`, `organisation_members` (role: admin/teacher).
- [ ] Koppla `schools` till `organisations` och säkerställ isolering.
**Acceptans**
- [ ] Admin kan bjuda in lärare; data isoleras per org (RLS verifierad).

### I2. Delning över org-gränser
- [ ] Signerade rapportlänkar med org-scoping.
**Acceptans**
- [ ] Rapport kan inte öppnas utanför rätt org.

---

## Milestone J — Planer, Kvoter & Billing (MVP)

### J1. Planer & Kvoter
- [ ] Free/Pro/Skola (kvoter: klasser, AI-anrop/mån, delade rapporter).
- [ ] UI-indikatorer när kvoter närmar sig taket.
**Acceptans**
- [ ] Server-kvoter hårda; tydlig UX vid tak.

### J2. Stripe Billing
- [ ] Checkout + portal för org-admin.
- [ ] Webhooks uppdaterar plan/status i DB.
**Acceptans**
- [ ] Upp/nedgradering syns i appen inom 1 min.

---

## Gemensamma krav
- [ ] Nya tabeller har migrations, index och **RLS**.
- [ ] Inga hårdkodade färg-hex (använd tokens/neutral-*).
- [ ] A11y: kontrast ≥ 4.5:1, aria-attribut, synlig fokus.
- [ ] Telemetri: varje ny route/event loggas anonymiserat (GDPR).
- [ ] Kort README-sektion per milstolpe (setup, endpoints, env).