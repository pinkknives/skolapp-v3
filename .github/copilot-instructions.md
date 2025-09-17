# Copilot Instructions – Skolapp v3

## Repo context
- Product: **Skolapp** – modern PWA for Swedish schools.
- Primary language: **Swedish first** (UI, copy, errors). i18n for future languages.
- Process: Uses **Spec Kit** for `/plan` and tasks, but Spec Kit is a **dev workflow only** (no user-facing "plan management" UI).
- Tech stack: **Next.js 15 (App Router)**, **TypeScript (strict)**, **Tailwind** with **design tokens**, **Framer Motion** (subtle motion), **PWA** (service worker/manifest), ESLint/Prettier, Vitest/RTL (or Playwright for e2e).

## Non-functional requirements (global)
- **Accessibility**: WCAG 2.1 AA, clear focus rings, touch targets ≥44px.
- **Performance**: LCP < 2.5s (mid-tier mobile), initial JS ≤ 200 kB gzip on landing, code-split and lazy-load where sensible.
- **PWA**: offline for critical views, valid manifest, SW caching with safe defaults.
- **Security & privacy**: no secrets in repo, CSP headers, XSS/CSRF safe patterns.
- **GDPR**: data minimization, consent where required, deletion/export flows planned.
- **Telemetry**: opt-in only, anonymized.

## Design system (must follow)
- Only use **tokens + core components** (Button, Card, Input, Typography, Navbar, Footer).
- **No inline styles**, no hardcoded hex, no ad-hoc fonts.
- Provide dark/light parity via tokens.
- Motion defaults: **120–200ms, swift-in-out**, respect `prefers-reduced-motion`.

## Language rules
- All user-facing text **in Swedish** by default. Use simple, clear tone.
- Strings should be centralized for future i18n (e.g., `lib/i18n.ts` or `/locales/sv`).
- Use Swedish field names/labels in forms and error states.

## Scope guardrails
- `/plan` = **project planning/spec** only.  
  Do **NOT** implement curriculum/"plan management" features (CCSS/NGSS, rubrics, etc.) unless an issue title explicitly says so.
- Prefer small, focused PRs. If an issue mixes design + feature, **split tasks**.

## Code & structure
- Place UI in `src/components/ui/*` and layouts in `src/components/layout/*`.
- Tokens in `src/lib/design-tokens.ts`; extend Tailwind config from tokens.
- Keep components accessible (labelled controls, roles, keyboard order).
- Testing: add minimal RTL tests for interactive components; add Lighthouse notes in PR description when relevant.

## PR expectations
- Follow the issue `/plan` scope precisely; ask for clarification when ambiguous.
- Link tasks to commits. Keep messages imperative: "Add", "Fix", "Refactor".
- Checklists in PR:
  - [ ] Swedish copy
  - [ ] Uses tokens/components (no inline styles/hex)
  - [ ] A11y pass (focus, labels, contrast)
  - [ ] Perf (bundle size note, avoid regressions)
  - [ ] PWA unaffected (if applicable)
  - [ ] No curriculum/standards features unless requested

## Helpful patterns
- Use server components by default; client components only when interactivity is required.
- Prefer composable props over variant explosion.
- Provide empty/skeleton/error states with clear user actions ("Försök igen", "Kontakta support").

## When running tasks
- If a task fails: retry that **task number**. If still failing, reduce scope and leave a note.
- Never introduce new routes/features outside the issue scope.

## Example prompts (internal)
- "Implementera `Navbar` och `Footer` med tokens, svensk copy och a11y. Lägg till responsiv mobilmeny och fokuslogik. Ingen auth."
- "Skapa `Button`, `Card`, `Input`, `Typography` enligt tokens och lägg till `prefers-reduced-motion`-stöd."

## Issue template compliance
- All new features must be defined with `/plan` and `/tasks` (see `.github/ISSUE_TEMPLATE/`).
- Copilot should decline vague tasks until `/plan` is clarified.
- Each `/plan` must include Acceptance criteria that are testable.
