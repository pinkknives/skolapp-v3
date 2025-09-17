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

## Framtida utveckling

- Flerspråksstöd (engelska, finska, norska)
- Utökade PWA-funktioner (push-notiser, bakgrundssynkronisering)
- Avancerade animationer och mikro-interaktioner
- Utökad komponentsamling
- Prestandamonitoring och analys

---

*Uppdaterad: 2025-09-17*
*Version: 1.0.0*