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

- ### Brand rules
- Use the Tailwind `primary` palette (teal) for main actions. Do not introduce new hex colors.
- Prefer `bg-primary-500 hover:bg-primary-600 text-white` for primary buttons.
- For sections/hero, consider `bg-brand-gradient` + white text.
- Use `info` palette only for informational accents (not primary actions).

- ## Icons
- Always import icons from `lucide-react` (preferred) or Heroicons.
- Never use emoji or custom SVG inline unless explicitly asked.
- All icons must be consistent in stroke (1.5–2px) and align with text baseline.
- Place icons **before text** in buttons, with spacing token `gap-x-2`.

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

## CI/Tool responsibility (Copilot should NOT flag these)
ESLint automatically handles:
- Unused variables, imports, and parameters
- TypeScript `any` usage and strict typing
- React hooks dependency arrays and patterns
- Code formatting and style consistency
- Inline style restrictions

Lighthouse CI automatically validates:
- Performance budgets (bundle size, Core Web Vitals)
- Basic accessibility compliance (color contrast, ARIA basics)
- PWA requirements and best practices

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

## Copilot review focus areas (what TO flag)
Focus reviews on high-value areas that require human judgment:

### Security & Privacy (HIGH PRIORITY)
- Secrets, tokens, or credentials in code
- SQL injection vulnerabilities  
- XSS/CSRF protection gaps
- Data leakage between organizations
- Environment variable misuse

### GDPR & Swedish Compliance (HIGH PRIORITY)
- Parental consent flow implementation
- Data retention policy violations
- Cross-organization data access
- Swedish language consistency and accuracy
- Legal compliance for Swedish schools

### Accessibility (CONTEXTUAL)
- Complex WCAG 2.1 AA compliance beyond basic color/contrast
- Screen reader experience and semantic HTML
- Keyboard navigation patterns
- Focus management in dynamic content
- Touch target sizing in complex layouts

### Architecture & Performance (STRATEGIC)
- Smart code splitting and lazy loading decisions
- Architectural performance anti-patterns
- Complex state management issues
- Database query optimization opportunities
- Memory leak risks in React components

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

  ## Re-review policy
Copilot ska **inte** re-recencera när diffen endast innehåller:
- `**/*.md`, `.github/workflows/**`, `package-lock.json`
- Endast kommentarsändringar eller formattering

Copilot ska **re-recencera** när:
- PR:en har label `needs-copilot`, eller
- Diffen rör `src/**` eller `app/**`, eller
- PR-beskrivningen innehåller `/recheck` eller `/security-focus`.
