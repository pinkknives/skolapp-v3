# UI Screenshots Script

Ett enkelt script för att ta live-screenshots av Skolapp v3 sidor i olika viewport-storlekar och posta dem som kommentar i GitHub issues.

## Installation

```bash
# Installera dependencies
npm install -D playwright @octokit/rest

# Installera Playwright browsers (krävs för riktiga screenshots)
npx playwright install --with-deps
```

## Användning

### Grundläggande användning

```bash
# Sätt GitHub token
export GITHUB_TOKEN=$(gh auth token)  # eller använd PAT med repo-rättigheter

# Kör script
node scripts/ui-screenshots-comment.mjs --issue ISSUE_NUMBER --base BASE_URL
```

### Exempel

```bash
# Med lokal dev-server
node scripts/ui-screenshots-comment.mjs --issue 192 --base http://localhost:3000

# Med staging-miljö
node scripts/ui-screenshots-comment.mjs --issue 192 --base https://stage.skolapp.se

# Demo mode (skapar mock screenshots för testning)
DEMO_MODE=true node scripts/ui-screenshots-comment.mjs --issue 192 --base http://localhost:3000
```

## Vad händer

1. **Screenshots**: Tar screenshots av 5 sidor i 3 olika viewport-storlekar:
   - **Sidor**: Startsida (`/`), Logga in (`/login`), Registrera (`/register`), Skapa Quiz (`/teacher/quiz/create`), Profil (`/profile`)
   - **Viewports**: Mobil (375x667), Surfplatta (768x1024), Desktop (1280x720)

2. **Lagring**: Sparar alla bilder i `ui-screenshots` branch under `ui-screenshots/{timestamp}/`

3. **Kommentar**: Postar en formaterad kommentar i den angivna issuen med inbäddade bilder

## Funktioner

- ✅ Stöd för svenska språkinställningar
- ✅ Inaktiverar animationer för konsekventa screenshots  
- ✅ Fullpage screenshots
- ✅ Strukturerad markdown-output
- ✅ Felhantering per sida/viewport
- ✅ Demo mode för testning utan browser
- ✅ Git branch-hantering
- ✅ GitHub issue kommentarer

## Krav

- Node.js 18+
- Git konfigurerat för repo
- GitHub token med `repo` permissions
- Playwright (installeras automatiskt via npm)
- Fungerande webbserver på angiven BASE_URL

## Demo Mode

Om Playwright browsers inte kan installeras eller för snabb testning:

```bash
DEMO_MODE=true node scripts/ui-screenshots-comment.mjs --issue 192 --base http://localhost:3000
```

Detta skapar mock PNG-filer istället för riktiga screenshots, men testar alla andra delar av scriptet.

## Felsökning

### Playwright browser fel
```bash
# Försök installera dependencies först
npx playwright install-deps

# Sedan browsers
npx playwright install

# Eller använd demo mode
DEMO_MODE=true node scripts/...
```

### GitHub authentication fel
```bash
# Kontrollera token
echo $GITHUB_TOKEN

# Eller sätt manuellt
export GITHUB_TOKEN=ghp_your_token_here
```

### Git push fel
- Kontrollera att du har push-rättigheter till repot
- Kontrollera att Git är konfigurerat korrekt