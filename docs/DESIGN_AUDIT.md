# Skolapp v3 – Design & UX Audit (December 2024)

Det här dokumentet sammanfattar observerade styrkor, förbättringar som redan är gjorda samt rekommenderade nästa steg för att hålla Skolapp v3 konsekvent, intuitiv och lättanvänd på alla enheter.

## Utförda förbättringar

- Startsidan har fokuserats kring tydlig berättelse: hero → unika säljargument → hur det fungerar → socialt bevis → CTA (`src/app/page.tsx`).
- CTA-sektionens animationer fungerar igen och har uppdaterade budskap för lärare respektive elever (`src/components/homepage/ImprovedCTA.tsx:20-137`).
- Navbar erbjuder nu direkta vägar för "Elev: gå med", "Logga in lärare" och "Skapa konto" både på desktop och mobil (`src/components/layout/Navbar.tsx:44-205`).
- `centered-grid`-utility säkerställer att auth- och onboarding-sidor inte kollapsar till smala kolumner (`src/styles/globals.css:402` används i flera auth-sidor).
- `Logo`-komponenten har fått stöd för `ariaLabel` och tagline, plus lazy-loading för bättre prestanda (`src/components/brand/Logo.tsx:1-122`).
- Brandriktlinjer och SVG-ikon har lagts till (`docs/brand/LOGO_GUIDE.md`, `public/brand/Skolapp-icon.svg`).
- Gemensam `Stack`-utility och `FormField`-komponent etablerar konsekvent vertikal rytm och formulärlayout, nu utrullat till login-, register-, gäst-, profil- och datainställningsflöden (`src/components/layout/Stack.tsx`, `src/components/ui/FormField.tsx`).
- Profil- och datahanteringssidorna följer samma layoutmönster och footern pekar mot faktiska mål och sociala kanaler.
- CTA-knappar på startsidan har säkerställd kontrast i både ljus och mörk vy (`src/components/homepage/ImprovedCTA.tsx`).

## Globala rekommendationer

- **Typografi (`src/components/ui/Typography.tsx`)**: Standardvarianterna inkluderar fasta `mb-*`-klasser. Överväg att ta bort marginalerna och i stället styra spacing via layoutkomponenter för större flexibilitet.
- **Färgkontrast**: Säkerställ att varje primär knapp/textkombination klarar WCAG AA. Exempel: `variant="outline"` + text i CTA kan behöva mörkare textfärg i mörkt läge.
- **Responsiva mellanrum**: Inför en uppsättning Tailwind-presets (t.ex. `.section-gap-sm/md/lg`) om fler sidor behöver samma vertikala rytm som `ResponsiveSection`.
- **Animeringar**: Definiera ett gemensamt API (t.ex. `useMotionFadeIn`) så att Hero, CTA och framtida sektioner delar samma easing och durations.

## Navigering & layout

- **Navbar** (`src/components/layout/Navbar.tsx`): Lägg till aktiv-state även på hash-länkar genom att jämföra `pathname + hash`. Säkerställ att `UserMenu` i mobil-läget täcker hela bredden (lägg ev. till `w-full`).
- **Layout Container** (`src/components/layout/Layout.tsx`): För sidor med komplexa formflöden, överväg en `Stack`-komponent som hanterar vertikal spacing och `max-w` istället för att upprepa `max-w-md`-divar.
- **Footer** (`src/components/layout/Footer.tsx`): Nuvarande länkar är placeholders. Uppdatera dem eller reducera sektionerna tills faktiska mål finns; annars känns UI:t ofullständigt.

## Formulär & komponentbibliotek

- **Input/Textarea/Select** (`src/components/ui/*`): Samordna höjd och label-position. Ett formulär-grid (`FormField` med `label`, `hint`, `error`) kan minska duplicerade wrappers i auth-sidorna.
- **Button-variant** (`src/components/ui/Button.tsx`): Inför en `link-muted`/`secondary-outline`-variant för footer och tomma state, så att samma stil inte "lånas" från andra varianter.
- **Card** (`src/components/ui/Card.tsx`): Lägg till `shadow-none` och `surface`-varianter för enklare innehållssektioner utan kraftiga skuggor.

## Logotyp & brand

- `Logo`-komponenten stöder nu tagline. Skapa gärna färdiga presets (`ResponsiveLogo` + tagline) för hero/footer så att branden används konsekvent.
- Ta fram en enkel logo-guide (ljus/mörk bakgrund, minsta storlek, frizon). Placera i `docs/brand/LOGO_GUIDE.md` tillsammans med exempelbilder.
- Säkerställ att `.png`-filerna har transparent bakgrund och exportera gärna även en vektorburen `.svg`-version för skarpa renderingar i stora storlekar.

## Dashboard & elever (kommande arbete)

- **Live vyer** (`src/components/quiz/LiveQuizStudentView.tsx` m.fl.): Samla statuschips, räknare och progressbars i en gemensam komponent så att realtidsvyer känns enhetliga.
- **Lärarflöden** (`src/components/quiz/QuizCreationWizard.tsx`): Introducera en sticky sidopanel med stegindikator för att minska scroll och göra processen tydligare.
- **Elevflöden** (`src/app/live/join/page.tsx`): Fyll ut tomrummet runt formuläret med stegindikator + stödtext (QR, PIN) för att guida yngre användare.

## Tillgänglighet

- Gör en snabb manuell tabbfokustest av huvudflöden (hero, auth, quiz). Justera `focus-visible`-stilar så att de syns tydligt i mörkt läge.
- Lägg till `aria-live`-regioner för statusmeddelanden (ex. när magiska länken skickas) så att skärmläsare uppfattar feedback direkt.

## Nästa steg (prioriterad lista)

1. Rulla ut `FormField`/`Stack` på större quiz- och rapportflöden (t.ex. `QuizCreationWizard`, `DataManagementSettings`‑dialoger).
2. Granska övriga CTA-knappar (ex. billing, onboarding) för mörkt-läge-kontrast.
3. Förbered ett komponentbibliotek av checklist-/alert-block så varningskort återanvänds konsekvent.

Det här dokumentet kan utökas löpande efter varje större UI-iteration.
