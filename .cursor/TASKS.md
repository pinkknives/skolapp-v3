# Skolapp – Milestone AP–AT (Robusthet, Efterlevnad, Prestanda, Kostnad, Drift)

> Kör i ordning: **AP → AQ → AR → AS → AT**.

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre är gröna** → markera tasken som `[x]`, gör en **liten** commit
  med prefix **AP1/AQ1/…**, och **fortsätt DIREKT** till **nästa** task.
- **Stanna endast** om:
  1) type-check/lint/build misslyckas, **eller**
  2) acceptanskriterier är oklara/ambigua.
- Alla DB-ändringar via migrationer; **RLS krävs** för nya tabeller.
- UI på **svenska**, A11y (WCAG 2.1 AA), telemetri för nya flöden.

---

## Milestone AP — SLO:er, Observability & Incidentberedskap

### AP1. SLO-definitioner & mätning
- [ ] Definiera SLO/SLI: **tillgänglighet**, **p95 svarstid** (elev-quiz, lärar-skapa), **felkvot**.
- [ ] Exportera mätvärden (API, Edge, klient-timing) till dashboard.
**Acceptans**
- [ ] Dashboard visar realtids-SLO + 7/30-dagars historik.

### AP2. Felspårning & loggkorrelation
- [ ] Sentry (webb + server/edge) med release & sourcemaps.
- [ ] `x-correlation-id` på alla requests; loggar korrelerar end-to-end.
**Acceptans**
- [ ] Exceptions syns med versions-tagg; loggkedja kan följas.

### AP3. Incidentrutiner & runbooks
- [ ] `/docs/ops/runbooks/*.md` (API timeouts, DB latens, Ably-fel, OpenAI-fel).
- [ ] Pager/alertregler: SLO-brott, felspikar, kostnadsspikar.
**Acceptans**
- [ ] On-call kan följa runbook och återställa inom mål-MTTR.

---

## Milestone AQ — GDPR, Integritet & Data-portabilitet

### AQ1. Dataregister & DPIA
- [ ] `docs/gdpr/data-inventory.md`: system, tabeller, retention, rättslig grund.
- [ ] `docs/gdpr/dpia.md`: risker, åtgärder, ansvar.
**Acceptans**
- [ ] Dokument färdiga och versionerade.

### AQ2. Samtycke & loggar
- [ ] Konsolidera consent-loggar (användning i AI, cookies/telemetri).
- [ ] Exporterbar historik per användare/org.
**Acceptans**
- [ ] Samtycken kan bevisas i efterhand.

### AQ3. SRR-flöden (Subject Rights Requests)
- [ ] Self-service: **export (ZIP)**, **radering**, **rättelse**.
- [ ] Tidsstämplar och kvittenser till användaren.
**Acceptans**
- [ ] Lärare/elev kan begära export/radering; körs med RLS-skydd.

### AQ4. Dataplacering & retention
- [ ] Policy: retention per tabell (quiz, resultat, träningsdata).
- [ ] Automatisk rensning (cron/Edge) + rapport.
**Acceptans**
- [ ] Utdaterad data rensas; rapport genereras månadsvis.

---

## Milestone AR — Prestanda & Kostnadsoptimering

### AR1. Laster & profiler
- [ ] Körtidsprofiler (server/edge) under syntetisk last (25/100/500 samtidiga elever).
- [ ] Identifiera hotspots (DB index, n+1, cache-missar).
**Acceptans**
- [ ] p95 < målvärde på elevquiz och lärar-skapande.

### AR2. Caching & rate-limits
- [ ] Aggressiv cache på read-tunga endpoints (Edge + CDN).
- [ ] Rate-limits per org/user för dyra vägar.
**Acceptans**
- [ ] Fel minskar vid toppar; inga överraskande 429 på normala flöden.

### AR3. AI/Ably-kostnadsvakter
- [ ] Per-org dagsgränser + varningar; tydlig UX när tak nås.
- [ ] Fallbackstrategier (modellbyte 4o→3.5; fördröjd realtime).
**Acceptans**
- [ ] Kostnader håller sig inom budget utan att UX kraschar.

---

## Milestone AS — Kvalitetssäkring, Testhårdning & CI

### AS1. E2E-svit
- [ ] Playwright: lärar-flöden (skapa, läxa/test, delning), elevflöden (offline/online), guardian.
- [ ] Mobil-viewport tester; a11y-kontroller (axe).
**Acceptans**
- [ ] Kritiska flöden gröna; rapporter som CI-artifact.

### AS2. DB/RLS-tester
- [ ] pgTAP/SQL: policies för lärare/elev/guardian/org-admin.
- [ ] Fuzz mot förbjudna tabeller/operationer.
**Acceptans**
- [ ] Inga otillåtna läs/skriv; fuzz-svit grön.

### AS3. Prompt-evals (AI)
- [ ] Regressionstester av promptar (svenska ämnen; nivåer).
- [ ] Tox/olämpligt-filter och läsbarhetsmätning i CI.
**Acceptans**
- [ ] Inga regressions i AI-kvalitet över huvudfall.

---

## Milestone AT — Säkerhet, Backup/DR & Support

### AT1. Säkerhetsgranskning
- [ ] Headers, CSP, CSRF, SSRF-skydd, auth-härdning.
- [ ] Beroendegranskning + uppdateringar.
**Acceptans**
- [ ] Sårbarhetsskanning utan blockerande findings.

### AT2. Backup & Disaster Recovery
- [ ] Schemalagda backupper, krypterade; restore-övning i staging.
- [ ] RTO/RPO-mål dokumenterade.
**Acceptans**
- [ ] Återställning lyckas inom mål; rapport sparas.

### AT3. Support & Hjälpcenter
- [ ] In-app support (enkelt formulär), status-sida, FAQ.
- [ ] Mallar för svar (svenska), prioriteringsmatris.
**Acceptans**
- [ ] Lärare hittar hjälp i appen; ärenden triageras korrekt.

---

## Gemensamma krav
- [ ] Nya tabeller har migrationer, index och **RLS**.
- [ ] Inga hårdkodade färg-hex (använd tokens/neutral-*).
- [ ] A11y: kontrast ≥ 4.5:1, aria-attribut, synlig fokus.
- [ ] Telemetri: varje ny route/event loggas anonymiserat (GDPR).
- [ ] README-sektion per milstolpe (setup, endpoints, env).
