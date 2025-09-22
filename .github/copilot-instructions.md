# Copilot Instructions – Skolapp v3 (uppdaterad)

## Repo context
- Produkt: **Skolapp** – modern PWA för svenska skolor.
- Språk: **svenska först** (UI, texter, fel). i18n-förberett.
- Process: **Spec Kit** för `/plan` och `/tasks` (endast dev-workflow).
- Tech: **Next.js 15 (App Router)**, **TypeScript (strict)**, **Tailwind 4** (tokens), **HeroUI**, **Radix** (primitives), **Framer Motion**, **PWA**, ESLint/Prettier, Vitest/RTL, Playwright.

## Icke-funktionella krav
- **A11y**: WCAG 2.1 AA, tydliga fokusramar, touch ≥44px, korrekta roller/aria.
- **Prestanda**: LCP < 2.5s mobil, initial JS ≤ 200 kB gzip, code-split & lazy-load.
- **PWA**: offline för kritiska vyer, giltig manifest, säkra cache-regler.
- **Säkerhet**: inga hemligheter i repo, CSP, XSS/CSRF-säkert.
- **GDPR**: dataminimering, export/radering, vårdnadshavares samtycke vid behov, **Korttidsläge vs Långtidsläge**.
- **Telemetri**: opt-in, anonymiserad, inga 3:e-parts-cookies utan samtycke.

## Designsystem
**Tailwind 4**
- Endast `@import "tailwindcss";` i globala CSS.
- Tokens via CSS-variabler (`hsl(var(--foreground))`).
- **Gråskala = `neutral-*`** (inte `gray-*`). Inga hårdkodade hex.
- Basfärger måste appliceras:
  ```css
  :root { --background: ...; --foreground: ...; /* … */ }
  html.dark { /* mörka tokens */ }
  body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
HeroUI

Använd HeroUI-komponenter (Button, Card, Input, Navbar, etc.) och deras tokens/variants.

Inga inline styles/hex.

Radix

Primitives där HeroUI saknas (Dialog, Popover, Tooltip).

asChild aldrig på rena DOM-element. Ex:

// Rätt
<Button asChild><a href="/signup">Skapa lärarkonto</a></Button>
// Fel
<button asChild>…</button>
Ikoner & rörelse

lucide-react (primärt). Ikon före text, gap-x-2, stroke 1.5–2px.

Motion 120–200ms, swift-in-out, respektera prefers-reduced-motion.

Tema & Hydration
I app/layout.tsx:

<html lang="sv" suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
I ThemeToggle: visa neutral UI tills mounted === true (läs inte theme på SSR).

Språk & scope
All UI-text på svenska (sv-SE), centraliserad i /locales/sv.

/plan = dev-spec; implementera inte läroplans/plan-UI utan explicit begäran.

Otydligt scope → fråga i PR-kommentar innan kod.

Kod & tester
UI → src/components/ui/*, Layouts → src/components/layout/*

Tokens → src/lib/design-tokens.ts + Tailwind config

Supabase-klient: singleton i browsern.

Tester: RTL för interaktiva komponenter. Playwright E2E för quiz (AI), join/submit, signup/login.

Visuella regressioner: snapshots mobil/tablet/desktop.

CI (Copilot behöver inte flagga)
ESLint/Prettier: oanvända symboler, hooks, format, inline-style-förbud.

Lighthouse CI: prestandabudget, a11y-grund, PWA-krav.

PR-checklista
 Svenska texter

 Tokens/komponenter (inga inline styles/hex)

 A11y (fokus, aria, kontrast)

 Prestanda (bundle-notering, Lighthouse)

 PWA intakt

 GDPR (Korttid/Långtid, samtycke)

 Tester (RTL/E2E)

 Tailwind 4 följs (neutral, inga gray-*)

 Tema & hydration korrekt

 Radix asChild ej på DOM-element

Copilot – vad du SKA flagga
Säkerhet/GDPR (högt): hemligheter i kod, XSS/CSRF, dataläckage, svensk juridik/språk.
A11y (kontekst): djup WCAG-granskning, fokusstyrning.
Arkitektur/perf: kodsplit, state-komplexitet, tunga queries, minnesläckor.

Mönster
Serverkomponenter som default.

Komponerbara props före variant-explosion.

Tom/skeleton/error-states med CTA (“Försök igen”).

Issue/Tasks
Använd .github/ISSUE_TEMPLATE/ för /plan och /tasks; krav ska vara testbara.

Copilot ska avböja vaga issues tills /plan är tydlig.

AI-räcken
AI = lärare-i-loopen.

Visa alltid: “Dubbelkolla alltid innehållet. AI kan ha fel.”
