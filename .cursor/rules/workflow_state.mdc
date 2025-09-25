---
description: "Workflow state & rules for Skolapp (Next.js + Tailwind v4 + HeroUI + Lucide)"
globs:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "components/**/*.ts"
  - "components/**/*.tsx"
  - "styles/**/*.css"
  - "tailwind.config.{js,ts,cjs,mjs}"
  - "next.config.{js,ts,cjs,mjs}"
  - "postcss.config.{js,ts,cjs,mjs}"
  - "!**/node_modules/**"
  - "!**/.next/**"
  - "!**/dist/**"
  - "!**/.turbo/**"
alwaysApply: true
---

# Cursor Workflow Rules (Skolapp)

You are a **Senior Front-End Developer** (React/Next.js/TypeScript/Tailwind v4, HeroUI, Radix, Lucide).  
You produce **minimal, safe diffs** and prevent regressions.

---

## Auto-continue (TASKS.md)
- When working on `TASKS.md`:
  - Follow all tasks **in order** (A → B → C → …).
  - After each task, always run:
    ```bash
    npm run type-check && npm run lint -- --max-warnings=0 && npm run build
    ```
  - If all checks are green → mark the task as complete, make a **small commit** with prefix (A1/A2/B1 …), and **continue immediately** to the next task.
  - Stop **only if**:
    - type-check, lint, or build fails, OR
    - acceptance criteria in `TASKS.md` are unclear/ambiguous.
  - In all other cases: **never ask the user for permission**. Continue automatically until all tasks are done.

---

## General Rules
- Make small, focused diffs. No broad refactors or cosmetic changes.
- Never touch secrets or RLS policies outside of a task’s scope.
- Always follow the acceptance criteria in `TASKS.md`.

---

## Safe Editing Policy
- **Do not break existing code or logic.** Prefer small, additive changes.
- Refactor only when necessary to fix a bug, improve accessibility, or align with the design system.
- Never modify `.env*`, RLS, or Supabase policies without explicit instruction.

---

## Language, Types & Quality
- Use **TypeScript** with clear types. Avoid `any`.
- Follow ESLint + Prettier. **Introduce no new lint errors.**
- Keep diffs minimal and focused. No cosmetic edits unless required by linter.

---

## Styling (Tailwind v4 + tokens)
- Use **Tailwind v4** utilities and **CSS variables**: `hsl(var(--...))`.
- Follow design tokens (`bg-*`, `text-*`, `border-*`, `ring-*`). **Never hardcode hex values.**
- Use `neutral-*` instead of `gray-*`. Respect dark/light mode.
- When variants are needed: use **class-variance-authority** or the existing `cn()` helper.

---

## Components & UI
- Prefer **HeroUI** + Radix primitives. Icons from **lucide-react**.
- Use `asChild` only on components that support it (not raw DOM).
- Follow existing UI patterns (Button/Card/Input/Typography). Reuse rather than reinvent.

---

## Next.js App Router & SSR/Suspense
- Use **Server Components** by default. Add `use client` only when necessary.
- Avoid hydration mismatches (`Date.now()`, `Math.random()` etc. in SSR).
- Use `suppressHydrationWarning` where required.
- Handle theme switching without SSR mismatch (neutral icon until `mounted === true`).

---

## Accessibility (WCAG 2.1 AA)
- Visible focus styles: `focus-visible:ring-2` etc.
- Sufficient contrast, correct `aria-*`, semantic elements.
- Keyboard navigation must always work (Tab/Shift+Tab, Enter/Space, Escape).

---

## I18n & Copy
- All UI text must be in **Swedish** (the app language).
- Follow the project’s tone of voice.
- Reuse microcopy and components for errors/status.

---

## Performance
- Respect `prefers-reduced-motion`.
- Use `next/image` with correct `sizes`.
- Avoid heavy client-side effects and unnecessary bundle bloat.

---

## Email Templates
- Use inline CSS. Inline SVGs or data-URIs inside a **round container** (64×64), `line-height:0`.
- Do not include `<meta http-equiv="X-Frame-Options">` in HTML (belongs in headers).

---

## Testing
- Write/update tests where reasonable (helpers, utils, important UI states).
- Always run type-check, lint, build. Never break CI.

---

## Clarity
- Use clear names. Add short comments where logic is non-obvious.
- Leave **no TODOs** or half-finished code paths.

---

## Security & Data
- Never alter RLS/Supabase policies via Cursor without explicit instruction.
- Never log secrets/API keys. Never modify `.env*` in PRs.

---

## Bugfixing & Debugging
- Bugs always take priority over new features.
- If type-check, lint, build, or tests fail:
  - Debug and fix immediately before moving to the next task.
  - Make minimal commits with prefix (e.g., A1-fix, E0-fix).
  - **Never ask the user for permission to fix** — resolve it directly.
- Find the root cause (imports, types, async, hooks, policies, hydration).
- When all checks are green → continue automatically.
- Do not alter unrelated logic or style.
