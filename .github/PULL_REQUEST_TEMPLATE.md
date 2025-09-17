Pull Request Checklist

Obligatoriskt att bocka av innan merge:
	•	Designsystem: Endast tokens + kärnkomponenter används.
	•	Typning: TypeScript strict → inga any, implicit types eller brutna builds.
	•	Lint/Prettier: All kod passerar ESLint och är formaterad med Prettier.
	•	Tillgänglighet: WCAG 2.1 AA → kontrast, ARIA, fokusordning testad.
	•	Copy: Allt användargränssnitt är på svenska.
	•	Prestanda: Lighthouse A11y ≥0.9, Perf ≥0.85, bundle-size inom budget.
	•	GDPR: Ingen elevdata lagras utanför definierade datalägen.
	•	Tests: Nya komponenter/flöden har grundläggande tester (Vitest/RTL eller Playwright).
	•	Dokumentation: README/CONTRIBUTING/DESIGN_SYSTEM uppdaterade vid behov.
	•	CI: Alla automatiska checks passerar (lint, typecheck, tests, Lighthouse).
