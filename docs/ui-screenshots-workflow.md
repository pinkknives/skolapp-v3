# UI Screenshots Workflow

## Översikt

Workflow för att automatiskt ta screenshots av Skolapp v3 webbsidor i olika viewport-storlekar och posta dem direkt som kommentarer i GitHub issues.

## Användning

### Manual körning

1. Gå till **Actions** → **UI Screenshots → Issue comment**
2. Klicka **Run workflow**
3. Fyll i:
   - **Issue number**: Numret på issuen där kommentaren ska postas (t.ex. `190`)
   - **Base URL**: URL till miljön som ska screenshots (t.ex. `https://stage.skolapp.se` eller `http://localhost:3000`)

### Automatisk körning

Workflow är konfigurerad för `workflow_dispatch` endast, så den körs inte automatiskt. Detta ger kontroll över när screenshots tas.

## Vad händer

1. **Setup**: Installerar Node.js och Playwright med webbläsare
2. **Screenshots**: Tar screenshots av 5 sidor i 3 olika viewport-storlekar:
   - **Sidor**: Startsida (`/`), Logga in (`/login`), Registrera (`/register`), Skapa Quiz (`/teacher/quiz/create`), Profil (`/profile`)
   - **Viewports**: Mobil (375x667), Surfplatta (768x1024), Desktop (1280x720)
3. **Lagring**: Sparar alla bilder i `ci-screenshots` branch under `ci-screenshots/{run-id}/`
4. **Kommentar**: Postar en formaterad kommentar i den angivna issuen med inbäddade bilder

## Exempel på resultat

Kommentaren innehåller:

```markdown
## 📸 UI Screenshots (Workflow Run #12345)

**📍 Base URL:** `https://stage.skolapp.se`
**🕒 Genererat:** 2024-01-20 14:30:00
**🔗 Workflow:** [Se körning](link-to-workflow)

**Genererade:** 2024-01-20 14:30:00
**Framgång:** 14 av 15 screenshots

## Startsida (`/`)

### Startsida - Mobil (iPhone SE)
![Screenshot](url-to-image.png)

### Startsida - Surfplatta (iPad) 
![Screenshot](url-to-image.png)

### Startsida - Desktop
![Screenshot](url-to-image.png)

[... fortsätter för alla sidor och viewports ...]
```

## Felhantering

- Om en sida inte kan laddas visas en varning istället för screenshot
- Workflow misslyckas inte även om enskilda screenshots misslyckas
- Alla lyckade screenshots sparas ändå

## Teknisk information

- **Browser**: Chromium via Playwright
- **Animationer**: Inaktiverade för konsekventa screenshots
- **Locale**: Svenska (sv-SE)
- **Timeout**: 30 sekunder per sida
- **Format**: PNG, fullpage screenshots

## Användningsfall

- **Visuell regression testing**: Jämför layoutförändringar mellan versioner
- **Design review**: Visa hur ändringar ser ut på olika enheter
- **QA**: Dokumentera UI-tillstånd för buggrapporter
- **Dokumentation**: Skapa visuell dokumentation av funktioner

## Begränsningar

- Kräver att målsajten är tillgänglig från GitHub Actions
- Screenshots täcker inte interaktiva tillstånd (hover, focus, etc.)
- Ingen automatisk jämförelse mellan körningar (kan läggas till i framtiden)

## Förbättringsförslag för framtiden

- [ ] Jämförelse med föregående körning
- [ ] Fler sidor i listan
- [ ] Interaktiva tillstånd (hover, focus)
- [ ] Automatisk körning vid PR:s till staging
- [ ] Diff-highlighting för stora visuella skillnader