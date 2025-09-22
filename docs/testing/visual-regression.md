# UI Visual Regression Testing

Detta dokument beskriver hur UI visual regression testing fungerar i Skolapp v3.

## Översikt

Visual regression testing säkerställer att förändringar i koden inte introducerar oväntade visuella regressioner i användargränssnittet. Testerna tar screenshots av kritiska sidor i olika viewport-storlekar och jämför dem med baseline-screenshots.

## Testade Sidor

- **Hem (/)**: Huvudsida med navigering och primära call-to-action knappar
- **Inloggning (/login)**: Autentiseringssida med magic link login
- **Registrering (/register)**: Kontoskapande för lärare
- **Quiz Delta (/quiz/join)**: Sida där elever kan gå med i quiz-sessioner
- **Profil (/profile)**: Användarprofilinställningar

## Viewport-storlekar

Tests körs i tre olika viewport-storlekar för att säkerställa responsiv design:

- **Mobil**: 360×780px (standard smartphone)
- **Tablet**: 768×1024px (standard tablet portrait)
- **Desktop**: 1280×800px (standard laptop/desktop)

## Kritiska Element

Varje sida validerar att kritiska UI-element är synliga och korrekt positionerade:

- `nav-primary`: Huvudnavigering
- `cta-primary`: Primär call-to-action knapp (hem)
- `login-submit`: Inloggningsknapp
- `signup-submit`: Registreringsknapp  
- `ai-quiz-start`: Quiz-startknapp
- `save-settings`: Sparaknapp (profil)

## Användning

### Kör Visual Regression Tests

```bash
# Kör alla visual regression tests
npm run test:visual

# Uppdatera baseline snapshots (efter avsiktliga designförändringar)
npm run test:visual:update
```

### GitHub Workflow

Visual regression tests kan köras manuellt via GitHub Actions:

1. Gå till Actions-fliken i GitHub
2. Välj "UI Visual Regression" workflow
3. Klicka "Run workflow"
4. Valfritt: Ange en bas-URL för testing mot staging/production

### Snapshots

Baseline screenshots lagras i:
```
tests/e2e/ui_layout.spec.ts-snapshots/
├── home-chromium.png
├── login-chromium.png
├── signup-chromium.png
├── ai-quiz-chromium.png
└── profile-chromium.png
```

## Troubleshooting

### Uppdatera Baselines

Om avsiktliga designförändringar har gjorts:

```bash
npm run test:visual:update
```

Granska ändringarna noggrant innan commit för att säkerställa att endast avsiktliga förändringar inkluderas.

### Hantera False Positives

Tests är konfigurerade med 2% pixeldifftolerans för att hantera små renderingsskillnader mellan miljöer. Om tests fortfarande misslyckas på grund av små skillnader, justera `maxDiffPixelRatio` i `playwright.config.ts`.

### CI/CD Artifacts

När tests körs i CI laddas följande artifacts upp:

- HTML-rapporter (playwright-report/)
- Screenshots och diffs (test-results/)
- Video-recordings av test-körningar
- Playwright traces för debugging

## Bästa Praxis

1. **Kör tests lokalt** innan pull requests för att fånga regressioner tidigt
2. **Uppdatera baselines** endast efter noga granskning av visuella förändringar
3. **Inkludera data-testid** på nya kritiska UI-element
4. **Dokumentera** avsiktliga designförändringar i commit-meddelanden

## Konfiguration

Visual regression testing konfigureras i:

- `playwright.config.ts`: Viewport-storlekar och snapshot-inställningar
- `tests/e2e/ui_layout.spec.ts`: Test-logik och element-validering
- `.github/workflows/ui-visual-regression.yml`: CI/CD workflow