# Design System - Skolapp v3

Omfattande design system för konsistent och tillgänglig användarupplevelse.

## Översikt

Skolapp v3 design system bygger på:
- **Design tokens** för centraliserade värden
- **Core komponenter** för återanvändning
- **WCAG 2.1 AA** tillgänglighet som standard
- **Svenska UI-texter** och microcopy

## Design Tokens

### Färger

Alla färger definieras i `src/lib/design-tokens.ts` och `tailwind.config.js`.

#### Primary Colors (Blå)
```css
primary-50:  #f0f9ff  /* Mycket ljus bakgrund */
primary-100: #e0f2fe  /* Ljus bakgrund */ 
primary-500: #0ea5e9  /* Huvudfärg - knappar, länkar */
primary-600: #0284c7  /* Hover states */
primary-700: #0369a1  /* Active states */
primary-900: #0c4a6e  /* Mörk text på ljus bakgrund */
```

#### Neutral Colors (Grå)
```css
neutral-50:  #fafafa  /* Ljusaste bakgrund */
neutral-100: #f5f5f5  /* Sekundär bakgrund */
neutral-200: #e5e5e5  /* Kantlinjer, dividers */
neutral-500: #737373  /* Sekundär text */
neutral-700: #404040  /* Huvudtext på ljus bakgrund */
neutral-900: #171717  /* Svartast text */
```

#### Semantic Colors
```css
/* Success (Grön) */
success-50:  #f0fdf4  /* Ljus bakgrund för meddelanden */
success-500: #22c55e  /* Huvudfärg för framgång */
success-600: #16a34a  /* Hover/active states */

/* Warning (Orange) */
warning-50:  #fffbeb  /* Ljus bakgrund för varningar */
warning-500: #f59e0b  /* Huvudfärg för varningar */
warning-600: #d97706  /* Hover/active states */

/* Error (Röd) */
error-50:    #fef2f2  /* Ljus bakgrund för fel */
error-500:   #ef4444  /* Huvudfärg för fel */
error-600:   #dc2626  /* Hover/active states */
```

### Typografi

#### Font Families
```css
font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif
font-mono: "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace
```

#### Font Sizes
```css
text-xs:   0.75rem  (12px) - Små labels, timestamps
text-sm:   0.875rem (14px) - Sekundär text, captions
text-base: 1rem     (16px) - Huvudtext (default)
text-lg:   1.125rem (18px) - Större brödtext
text-xl:   1.25rem  (20px) - Underrubriker
text-2xl:  1.5rem   (24px) - Större rubriker
text-3xl:  1.875rem (30px) - Sektionsrubriker
text-4xl:  2.25rem  (36px) - Huvudrubriker
```

#### Font Weights
```css
font-light:    300 - Ljus text (sällan använd)
font-normal:   400 - Normal brödtext
font-medium:   500 - Framhävd text
font-semibold: 600 - Underrubriker
font-bold:     700 - Huvudrubriker, knappar
```

### Spacing

Konsekvent spacing-skala baserad på 0.25rem (4px):

```css
xs:  0.25rem (4px)  - Minimal padding/margin
sm:  0.5rem  (8px)  - Liten padding
md:  1rem    (16px) - Standard spacing
lg:  1.5rem  (24px) - Större spacing
xl:  2rem    (32px) - Stor section padding
2xl: 3rem    (48px) - Mycket stor spacing
3xl: 4rem    (64px) - Layout-nivå spacing
```

### Shadows

Elevation system för djup och hierarki:

```css
shadow-xs: 0 1px 2px rgba(0,0,0,0.05)     - Subtila kantlinjer
shadow-sm: 0 1px 3px rgba(0,0,0,0.1)      - Knappar, små kort
shadow-md: 0 4px 6px rgba(0,0,0,0.1)      - Kort, dropdowns
shadow-lg: 0 10px 15px rgba(0,0,0,0.1)    - Modaler, floating panels
shadow-xl: 0 20px 25px rgba(0,0,0,0.1)    - Stora modaler
```

### Motion

Animationer som respekterar `prefers-reduced-motion`:

```css
/* Durations */
duration-fast:   150ms - Små hover-effekter
duration-normal: 300ms - Standard transitioner
duration-slow:   500ms - Större layout-ändringar

/* Easing */
ease-out:    cubic-bezier(0, 0, 0.2, 1)     - Naturliga exits
ease-in:     cubic-bezier(0.4, 0, 1, 1)     - Naturliga entries  
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)   - Balanserade rörelser
```

### Border Radius

```css
rounded-none: 0
rounded-sm:   0.125rem (2px)  - Små element
rounded-md:   0.375rem (6px)  - Standard (knappar, inputs)
rounded-lg:   0.5rem   (8px)  - Kort, panels
rounded-xl:   0.75rem  (12px) - Större kort
rounded-2xl:  1rem     (16px) - Hero-sektioner
rounded-full: 9999px          - Cirkulära element
```

## Core Components

### Button Component

**Location**: `/src/components/ui/Button.tsx`

#### Varianter
```tsx
// Primary button (blå bakgrund)
<Button variant="primary">Spara quiz</Button>

// Secondary button (transparent med blå kantlinje)  
<Button variant="secondary">Avbryt</Button>

// Outline button (endast kantlinje)
<Button variant="outline">Redigera</Button>

// Ghost button (endast text)
<Button variant="ghost">Tillbaka</Button>

// Destructive button (röd för farliga actions)
<Button variant="destructive">Ta bort quiz</Button>
```

#### Storlekar
```tsx
<Button size="sm">Liten knapp</Button>     // Kompakt för toolbars
<Button size="md">Standard</Button>        // Default storlek  
<Button size="lg">Stor knapp</Button>      // Viktiga actions
```

#### States
```tsx
<Button disabled>Inaktiverad</Button>
<Button loading>Sparar...</Button>        // Med spinner
<Button leftIcon={<PlusIcon />}>Lägg till</Button>
```

### Card Component

**Location**: `/src/components/ui/Card.tsx`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Quiz-resultat</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Här visas quiz-statistik...</p>
  </CardContent>
  <CardFooter>
    <Button>Exportera</Button>
  </CardFooter>
</Card>
```

#### Varianter
```tsx
<Card variant="elevated">Kort med skugga</Card>
<Card variant="outlined">Kort med kantlinje</Card>
<Card variant="filled">Fyllt kort</Card>
```

### Input Component

**Location**: `/src/components/ui/Input.tsx`

```tsx
<Input 
  label="Titel på quiz"
  placeholder="Skriv en titel..."
  error="Titel krävs"
  helpText="Detta visas för eleverna"
/>

<Textarea 
  label="Beskrivning" 
  rows={4}
  placeholder="Beskriv vad quizet handlar om..."
/>
```

#### States
```tsx
<Input state="error" error="Felmeddelande" />
<Input state="success" />
<Input state="warning" />
<Input disabled />
```

### Typography Component

**Location**: `/src/components/ui/Typography.tsx`

```tsx
<Heading level={1}>Huvudrubrik</Heading>
<Heading level={2}>Underrubrik</Heading>

<Typography variant="body1">Standard brödtext</Typography>
<Typography variant="body2">Mindre brödtext</Typography>
<Typography variant="caption">Bildtext eller timestamp</Typography>
<Typography variant="subtitle1">Framhävd undertext</Typography>
```

### Layout Components

**Location**: `/src/components/layout/Layout.tsx`

```tsx
<Layout>
  <Container maxWidth="lg">
    <Section className="py-12">
      <Heading level={1}>Innehåll här</Heading>
    </Section>
  </Container>
</Layout>
```

## Användningsregler

### ✅ Gör så här

```tsx
// Använd design tokens
<div className="bg-primary-50 text-neutral-700 p-md rounded-lg">

// Använd core komponenter
<Button variant="primary" size="lg">
  Skapa quiz
</Button>

// Svenska UI-texter
<Button>Spara ändringar</Button>
<Typography variant="caption">Senast uppdaterad</Typography>
```

### ❌ Gör INTE så här

```tsx
// Inline styles - FÖRBJUDET
<div style={{ backgroundColor: '#blue', padding: '16px' }}>

// Hardkodade hex-värden - FÖRBJUDET  
<div className="bg-[#3b82f6] text-[#000000]">

// Engelska i UI - UNDVIK
<Button>Save changes</Button>
```

## Tillgänglighet (A11y)

### Obligatoriska krav

#### Färgkontrast
- **Normal text**: Minst 4.5:1 kontrast mot bakgrund
- **Stor text**: Minst 3:1 kontrast mot bakgrund  
- **UI-komponenter**: Minst 3:1 kontrast för kanter och ikoner

#### Focus Management
```tsx
// Alla interaktiva element MÅSTE ha tydlig focus-ring
<Button className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">

// Focus-ordning ska vara logisk
<div tabIndex={0} role="button" onKeyDown={handleKeyDown}>
```

#### Touch Targets
- **Minimum**: 44x44px för alla klickbara element
- **Rekommenderat**: 48x48px på mobil

#### ARIA Labels
```tsx
// Deskriptiva labels på svenska
<Button aria-label="Ta bort quiz permanent">
  <TrashIcon />
</Button>

// Status-meddelanden
<div role="status" aria-live="polite">
  Quiz sparat framgångsrikt
</div>
```

### Tangentbordsnavigation

Alla komponenter ska stödja:
- **Tab/Shift+Tab**: Navigation mellan element
- **Enter/Space**: Aktivera knappar och links
- **Escape**: Stäng modaler och dropdowns
- **Arrow keys**: Navigation i listor och menyer

## Utvecklingsworkflow

### Innan du kodar

1. **Kontrollera design tokens**: Finns rätt färg/spacing redan?
2. **Kolla befintliga komponenter**: Kan du återanvända något?
3. **Planera för a11y**: Hur navigerar man med tangentbord?

### Under utveckling

```bash
# Kör regelbundet under utveckling
npm run type-check  # TypeScript-fel
npm run lint        # ESLint-fel och stilregler
```

### Före commit

```bash
# Obligatorisk checklista
npm run type-check && npm run lint && npm run build
```

### Testing av tillgänglighet

```bash
# Install axe CLI för a11y testing
npm install -g @axe-core/cli

# Test accessibility
axe http://localhost:3000
```

## Responsivitet

### Breakpoints

```css
sm:  640px  - Stora telefoner
md:  768px  - Surfplattor  
lg:  1024px - Små laptops
xl:  1280px - Stora skärmar
2xl: 1536px - Mycket stora skärmar
```

### Mobile-first approach

```tsx
// Börja med mobil, bygg uppåt
<div className="p-4 md:p-6 lg:p-8">
  <Heading level={1} className="text-2xl md:text-3xl lg:text-4xl">
    Responisv rubrik
  </Heading>
</div>
```

## Performance Guidelines

### Bundle Size
- **Core komponenter**: ≤50kB gzipped totalt
- **Design tokens**: ≤5kB (träffar build-time)
- **Per komponent**: Lazy-load stora komponenter

### Optimering
```tsx
// Lazy loading för stora komponenter
const AISuggestionsPanel = lazy(() => import('./AISuggestionsPanel'))

// Conditional imports
if (needsAI) {
  const { generateQuestions } = await import('./ai-utils')
}
```

## Uppdatering och Underhåll

### Lägga till nya tokens

1. Uppdatera `src/lib/design-tokens.ts`
2. Lägg till i `tailwind.config.js`
3. Uppdatera denna dokumentation
4. Testa med befintliga komponenter

### Nya komponenter

1. Följ samma struktur som befintliga i `/src/components/ui/`
2. Använd class-variance-authority för varianter
3. Inkludera TypeScript-typer
4. Skriv exempel i denna dokumentation
5. Testa tillgänglighet med axe

### Deprecated patterns

När något blir deprecated:
1. Markera som `@deprecated` i TypeScript
2. Lägg till i CHANGELOG
3. Uppdatera dokumentation
4. Plan för migration

---

## Support och Resurser

- **Design Tokens**: `/src/lib/design-tokens.ts`
- **Component Library**: `/src/components/ui/`
- **Tailwind Config**: `tailwind.config.js`  
- **A11y Testing**: `npm install -g @axe-core/cli`
- **Performance**: Lighthouse CI i `.lighthouserc.json`

**Kontakt utvecklingsteam för frågor om design systemet.**