# Copilot Instructions – Skolapp v3

## Repo context
- Product: **Skolapp** – modern PWA for Swedish schools.
- Primary language: **Swedish first** (UI, copy, errors). i18n-ready for future languages.
- Process: Uses **Spec Kit** for `/plan` and `/tasks`. Spec Kit is a **developer workflow only** (no user-facing “plan management” UI).
- Tech stack: **Next.js 15 (App Router)**, **TypeScript (strict)**, **Tailwind** with **design tokens**, **Framer Motion**, **PWA** (service worker/manifest), ESLint/Prettier, Vitest/RTL, Playwright.

## Non-functional requirements (global)
- **Accessibility**: WCAG 2.1 AA, clear focus rings, ≥44px touch targets, ARIA.
- **Performance**:
  - LCP < 2.5s (mid-tier mobile)
  - Initial JS bundle ≤200 kB gzip (mobile Lighthouse)
  - Code-split and lazy-load where sensible
- **PWA**: offline support for critical views, valid manifest, safe caching defaults.
- **Security & privacy**: no secrets in repo, CSP headers, XSS/CSRF safe.
- **GDPR**:
  - Data minimization, deletion/export, logging
  - **Parental consent flow** where legally required
  - Clear distinction: Korttidsläge (temporary) vs. Långtidsläge (requires consent)
- **Telemetry**: opt-in only, anonymized, no 3rd party cookies without consent.

## Design system (must follow)
- Only use **tokens + core components**: Button, Card, Input, Typography, Navbar, Footer.
- **No inline styles, no hardcoded hex, no ad-hoc fonts.**
- Provide light/dark parity via tokens.
- Motion defaults: **120–200ms, swift-in-out**, respect `prefers-reduced-motion`.

## Language rules
- All user-facing text **in Swedish** (sv-SE).
- Strings centralized for i18n (`/locales/sv`).
- Clear, simple tone in Swedish.

## Scope guardrails
- `/plan` = **project planning/spec only**.
- **Never** implement curriculum/“plan management” unless explicitly requested.
- If an issue is ambiguous or lacks Acceptance, **Copilot must ask for clarification** in comments before coding.
- Prefer small, focused PRs. Split design vs. feature tasks if both appear in the same issue.

## Code & structure
- UI → `src/components/ui/*`
- Layouts → `src/components/layout/*`
- Tokens → `src/lib/design-tokens.ts` and Tailwind config
- Components must be accessible (labels, roles, keyboard)
- Tests:
  - RTL for interactive components
  - Playwright e2e for **critical flows** (quiz create, join, submit)
  - Lighthouse notes in PR description

## PR expectations
- Follow `/plan` scope precisely.
- Link tasks to commits. Keep commit messages imperative.
- PR checklist:
  - [ ] Swedish copy
  - [ ] Uses tokens/components (no inline styles/hex)
  - [ ] A11y pass (focus, ARIA, contrast)
  - [ ] Perf pass (bundle size note, Lighthouse)
  - [ ] PWA unaffected
  - [ ] GDPR respected (Korttid vs Långtid, consent)
  - [ ] Tests included where relevant

## Helpful patterns
- Server components by default; client only where needed.
- Composable props over variant explosion.
- Provide empty, skeleton, and error states with actionable CTA (e.g. “Försök igen”).

## When running tasks
- If a task fails: retry that **task number**.
- If repeated failures: reduce scope and leave a note in PR/issue.
- Never introduce new features/routes outside issue scope.

## Issue template compliance
- All new features/issues must use `/plan` and `/tasks` via `.github/ISSUE_TEMPLATE/`.
- Every `/plan` must define testable Acceptance criteria.
- Copilot must decline vague issues until `/plan` is clarified.

## AI-specific guardrails
- AI features must always be **teacher-in-the-loop**.
- AI output must display Swedish disclaimer:  
  *“Dubbelkolla alltid innehållet. AI kan ha fel.”*
