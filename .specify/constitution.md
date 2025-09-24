# Skolapp v3 - Projektkonstitution

## Ordlista

### /plan
**Definition**: Projektplanering och specifikationshantering (inte läroplanshantering)

I kontexten av Skolapp v3 refererar `/plan` till:
- Projektspecifikationer och -planer
- Designsystem-planering
- Utvecklingsplanering och milstolpar
- Teknisk arkitektur och specifikationer

**Viktigt**: `/plan` ska INTE förväxlas med utbildningsplanering, läroplaner eller curriculumhantering.

### Designsystem
**Definition**: Omfattande samling av designtokens, komponenter och riktlinjer

Inkluderar:
- Designtokens (färger, typografi, mellanrum, skuggor, animationer)
- Kärnkomponenter (Button, Card, Input, Typography, Navbar, Footer)
- Responsiva layouter
- Tillgänglighetsstandarder (WCAG 2.1 AA)
- Prestanda-optimeringar

### Progressiv webbapp (PWA)
**Definition**: Modern webbapplikation med app-liknande funktioner

Funktioner:
- Installationsbar på alla enheter
- Offline-funktionalitet
- Service workers för caching
- App manifest för installation
- Prestanda-optimering

## Projektmål

Skolapp v3 är en designsystem-fokuserad PWA som demonstrerar:
1. Modern webbutveckling med Next.js 15
2. Tillgänglig design (WCAG 2.1 AA)
3. Responsiv och prestanda-optimerad arkitektur
4. Svenska som primärt språk
5. Skalbart designsystem

## Språkstrategi

**Primärt språk**: Svenska
- Alla användargränssnitt ska vara på svenska
- Dokumentation på svenska
- Felmeddelanden och feedback på svenska
- Framtida flerspråksstöd kan implementeras senare

## Teknisk stack

- **Framework**: Next.js 15 med App Router
- **Språk**: TypeScript (strict mode)
- **Styling**: Tailwind CSS med anpassade designtokens
- **Komponenter**: Anpassat komponentbibliotek
- **Animationer**: Framer Motion
- **PWA**: next-pwa med Workbox
- **Byggsystem**: Webpack med optimering

## Designprinciper

1. **Tillgänglighet först**: WCAG 2.1 AA-efterlevnad
2. **Mobilförstresponsiv**: Design för alla skärmstorlekar
3. **Prestanda**: Snabb laddning och responsiv interaktion
4. **Skalbarhet**: Modulära komponenter och tokens
5. **Användarvänlighet**: Intuitiv och inkluderande design

## Projektstruktur

```
src/
├── components/
│   ├── ui/           # Kärnkomponenter
│   └── layout/       # Layoutkomponenter
├── lib/
│   ├── design-tokens.ts
│   └── utils.ts
├── styles/
│   └── globals.css
└── app/              # Next.js App Router
    ├── layout.tsx
    └── page.tsx
```

## Utvecklingsriktlinjer

- Använd svenska för alla användarinriktade texter
- Följ designsystem-tokens för konsekvent styling
- Säkerställ tillgänglighet i alla komponenter
- Optimera för prestanda och Core Web Vitals
- Testa responsiv design på alla enheter

## Globala icke-funktionella krav

Dessa krav gäller för alla funktioner och utveckling i Skolapp v3:

### Svenska först
- All UI/texter/felmeddelanden på svenska som standard
- Internationalisering (i18n) för framtida språkstöd
- Svenska lokalisering (sv_SE) i metadata och tillgänglighet

### Tillgänglighet
- **WCAG 2.1 AA-efterlevnad** obligatorisk för alla komponenter
- Tydliga fokusmarkeringar för tangentbordsnavigation
- Touch targets ≥44px för alla interaktiva element
- Semantisk HTML och korrekt ARIA-märkning
- Stöd för skärmläsare och hjälpmedel

### Prestanda & PWA
- **LCP < 2.5s** för alla sidor på alla enheter
- **Initial JS < 200 kB gzip** på mobil
- Offline-stöd för kritiska vyer och funktioner
- Service worker med intelligent caching-strategier
- Core Web Vitals-optimering obligatorisk

### Designsystemstvång
- Endast designtokens och kärnkomponenter får användas
- Inga inline-stilar eller hex-färger i kod
- Dark/light mode-paritet för alla komponenter
- Konsekvent responsiv design med breakpoints
- Strikt typning för komponentvarianter

### Säkerhet & dataskydd
- Kryptering i transit och at rest för all data
- Roll- och behörighetssystem (Lärare/Student/Admin)
- Audit-loggning för känsliga åtgärder
- Säkra headers (CSP, X-Frame-Options, XSS Protection)
- Säker sessionhantering och autentisering

### GDPR "flawless"
- **Dataminimering**: Samla endast nödvändig data
- **Åldersgränser**: Åldersuppskattning och verifiering
- **Föräldrasamtycke**: Obligatoriskt för användare under 13 år
- **Dataportabilitet**: Fullständig datautlämning på begäran
- **Raderingsrätt**: Säker och fullständig dataradering
- **Lagringspolicy**: Tydliga regler för datalagring och retention
- **Personuppgiftsbiträdesavtal**: Vid tredjepartsintegration

### Telemetri & analys
- Endast med uttryckligt användarsamtycke
- Anonymiserad data utan personliga identifierare
- Inga tredjepartscookies utan avtal/samtycke
- Transparent datainsamlingspolicy
- Opt-out möjlighet för all telemetri

### Kvalitetsstandarder
- **Enhetliga tomtillstånd**: Konsekvent hantering av tom data
- **Skeleton loading**: Smooth loading-states för alla komponenter
- **Felhantering**: Tydliga felmeddelanden med åtgärder (försök igen/kontakt)
- **Progressiv förbättring**: Grundfunktionalitet utan JavaScript
- **Robusta formulär**: Validering på både klient och server

## Framtida utveckling

- Flerspråksstöd (engelska, finska, norska)
- Utökade PWA-funktioner (push-notiser, bakgrundssynkronisering)
- Avancerade animationer och mikro-interaktioner
- Utökad komponentsamling
- Prestandamonitoring och analys

## Efterlevnad

Alla framtida funktioner och issues måste:
1. Uppfylla samtliga globala icke-funktionella krav
2. Dokumentera hur kraven uppfylls
3. Inkludera tester för tillgänglighet och prestanda
4. Valideras mot GDPR-krav innan implementation

---

*Uppdaterad: 2025-09-17*
*Version: 1.1.0*