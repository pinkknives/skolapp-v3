# Skolapp – Milestones E–J

> Tidigare tasks (A–D): se `TASKS_A-D_ARCHIVE.md`
> Kör i ordning: Milestone E → F → G → H → I → J.
> Efter varje task: kör `npm run type-check && npm run lint && npm run build` och uppdatera CHECKLISTAN.

---

## Milestone E — Performance & Caching
- [ ] Server caching (Next.js Route Handlers, revalidate tags) för analytics endpoints
- [ ] Client-side memoization där relevant (React cache/useMemo)
- [ ] Lighthouse/regression-guard i CI

## Milestone F — Skills Tagging & Editor
- [ ] UI för att tagga frågor med `skills` (koppla `question_id` ↔ `skill_id`)
- [ ] Batch‑tagging för quiz
- [ ] Validering + Zod‑scheman, RLS-säkerhet

## Milestone G — Advanced Reports
- [ ] Fler filter (ämne, skill, vecka)
- [ ] Export‑mallar (PDF/PNG presets)
- [ ] Delade rapporter: expanderade metadata

## Milestone H — AI v2
- [ ] Prompt-profiler (snäll/utmanande/diagnostisk)
- [ ] Per‑skill förslag + länk till övningar
- [ ] Rate‑limits + budget guards

## Milestone I — Collaboration v2
- [ ] Merge‑workflow: admin UI för godkännande/avslag
- [ ] Audit trail + notiser
- [ ] Roll‑behörigheter i UI

## Milestone J — QA & Hardening
- [ ] E2E-flöden för elev/klass/rapporter
- [ ] Contract‑tester för RPCer
- [ ] Observability: loggar + metrics på API-svarstid

---

## Gemensamma krav
- [ ] `npm run type-check` grön
- [ ] `npm run lint -- --max-warnings=0` grön
- [ ] `npm run build` lyckas
- [ ] A11y: fokus/kontrast
- [ ] Inga hydreringsfel i konsolen
