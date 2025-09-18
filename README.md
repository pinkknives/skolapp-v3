# Skolapp v3

Modern Progressive Web App for school management with accessibility, design system, and performance optimization.

## Features

- 🎨 **Design System**: Comprehensive design tokens and component library
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 📱 **Progressive Web App**: Installable, offline-capable
- ⚡ **Performance**: Optimized for speed and efficiency
- 🔒 **Privacy**: GDPR compliant
- 🌍 **Responsive**: Works on all devices
- 🎭 **Animations**: Subtle, modern interactions
- 📋 **Plan Management**: Integrated with Spec Kit
- ✅ **Task Management**: Comprehensive task tracking

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: Custom component library with class-variance-authority
- **Animations**: Framer Motion
- **PWA**: next-pwa with comprehensive caching
- **TypeScript**: Full type safety
- **Performance**: Bundle analysis and optimization

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm (comes with Node.js)
- Git för version control

### Installation

```bash
# Clone the repository
git clone https://github.com/pinkknives/skolapp-v3.git

# Navigate to the project directory
cd skolapp-v3

# Install dependencies
npm install

# Verify installation by running type-check and lint
npm run type-check
npm run lint

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development Workflow

Before committing changes, always run:

```bash
# Type checking
npm run type-check

# Linting (with auto-fix)
npm run lint

# Build verification
npm run build

# Performance analysis (optional)
npm run analyze
```

## Available Scripts

- `npm run dev` - Start development server på port 3000
- `npm run build` - Build för production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint med auto-fix
- `npm run type-check` - Run TypeScript compiler check
- `npm run analyze` - Analyze bundle size och performance

### Performance & Quality Tools

#### Lighthouse Performance Testing

Projektet inkluderar Lighthouse konfiguration för performance monitoring:

```bash
# Install Lighthouse CLI globally
npm install -g @lhci/cli

# Run performance tests (requires running dev server)
npm run dev & 
lhci autorun

# Or run specific Lighthouse checks
lighthouse http://localhost:3000 --preset=desktop --view
```

**Performance Budgets:**
- JavaScript bundle: ≤200 kB
- Total resources: ≤500 kB  
- LCP: ≤2.5s
- Performance score: ≥85%
- Accessibility score: ≥90%

## Quiz Creation Wizard

Skolapp v3 inkluderar en förbättrad quiz-skapande upplevelse med 3-stegs wizard:

### Flöde: Steg 1-3

#### Steg 1: Grundläggande information
- **Fokus**: Snabb start med minimal input
- **Obligatoriskt**: Endast titel krävs för att fortsätta
- **Svensk UI**: "Berätta om ditt quiz", "Grundläggande information"
- **Validering**: Realtid feedback med visuella indikatorer
- **Tips**: Inline-hjälp och rekommendationer för lärare

#### Steg 2: Frågor och innehåll
- **AI-integration**: Prominent "Skapa frågor med AI" knapp
- **Manuella alternativ**: Stöd för olika frågetyper
- **Svensk UI**: "Lägg till frågor", "Skapa frågor med AI"
- **Redigering**: Alla AI-genererade frågor kan granskas/redigeras
- **Progress**: Visuell indikator för antal frågor

#### Steg 3: Granska och publicera  
- **Förhandsgranskning**: Toggle mellan klassvy och mobilvy
- **Validering**: Checklista med visuella checkmarks
- **Sammanfattning**: Nyckeltal (frågor, poäng, tid, läge)
- **Svensk UI**: "Granska och publicera", "Allt ser bra ut! Klart att publicera"

### Prestanda-mål
- **Snabb skapande**: ≤2 minuter för ett komplett quiz
- **AI-väg**: ~90 sekunder (30s info + 45s AI-generering + 15s granska)
- **Tillgänglighet**: WCAG 2.1 AA med full tangentbordsnavigering

### Tekniska komponenter
- `QuizCreationWizard` - Huvudkomponent med steghantering
- `WizardSteps` - Visuell stegindikator
- `QuizBasicInfoStep`, `QuizQuestionsStep`, `QuizPublishStep`
- **Location**: `/src/components/quiz/QuizCreationWizard.tsx`

## AI Panel Integration

### AI-assisterad Quiz-skapning

AI-panelen i steg 2 erbjuder intelligent fråggenerering:

**Funktioner:**
- Strukturerad input (ämne, årskurs, antal frågor, svårighet)
- Svenska prompt-mallar för lärare
- Förhandsvisning med checkbox-val av frågor
- Redigerbara AI-förslag

**Disclaimer (obligatorisk på svenska):**
> "Dubbelkolla alltid innehållet. AI kan ha fel."

### AI-assisterad Rättning (Human-in-the-loop)

**Workflow för lärare:**
1. Öppna TeacherReviewMode för ett quiz
2. För fritextsvar - klicka "AI-förslag" 
3. Granska AI-bedömning med confidence-nivå
4. Välj: **Godkänn**, **Redigera**, eller **Avvisa**

**Stödda frågetyper:**
- Fritextsvar med rubrik-baserad bedömning
- Bildbaserade svar (grundläggande stöd)
- Flervalsfrågor (automatisk rättning)

**Tekniska komponenter:**
- `AISuggestionsPanel` - Modal för AI-förslag 
- `AIGradingClient` - Huvudklient för AI-rättning
- **Location**: `/src/components/quiz/AISuggestionsPanel.tsx`

**Batch-funktioner:**
- Godkänn alla förslag över viss confidence-tröskel
- Snabb behandling av stora klasser

**Prestandaoptimering:**
- Lazy loading av AI-komponenter (+5kB JavaScript)
- AI-bedömning: 800-1200ms per fritextsvar
- Cachning av bedömningar per session

## Design System

Skolapp v3 använder ett konsekvent design system med tokens och komponenter. **Se [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) för detaljerad dokumentation.**

### Snabbreferens

**Design Tokens**: Centraliserade värden för färger, typografi, spacing, shadows m.m.
- **Location**: `/src/lib/design-tokens.ts`
- **Tailwind Config**: `tailwind.config.js`

**Core Components**: Button, Card, Input, Typography, Layout komponenter
- **Location**: `/src/components/ui/`
- **Usage**: Importera och använd med design tokens

### Utvecklingsregler
- ❌ **Aldrig** inline styles eller hardkodade hex-värden
- ✅ **Alltid** använd design tokens och core komponenter
- ✅ **Alltid** testa med both light/dark mode
- ✅ **Alltid** validera mot WCAG 2.1 AA

### Design Tokens

The design system includes comprehensive tokens for:

- **Colors**: Primary, neutral, semantic colors with dark mode support
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation system
- **Motion**: Animation durations and easing functions
- **Breakpoints**: Responsive design breakpoints

### Components

Core components include:

- **Button**: Multiple variants with accessibility support
- **Card**: Flexible content container
- **Input**: Form input with validation states
- **Typography**: Semantic text components
- **Layout**: Navbar, Footer, Container, Section

## Accessibility

- WCAG 2.1 AA compliant
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Reduced motion preferences
- Focus management
- Semantic HTML

## Performance

- Code splitting and lazy loading
- Image optimization
- Service worker caching
- Bundle analysis
- Performance budgets
- Core Web Vitals optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

The app can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- AWS
- Docker

For PWA features to work properly, ensure HTTPS is enabled in production.

## Spec Kit Integration

The application integrates with Spec Kit for:

- Plan management and curriculum planning
- Task assignment and tracking
- Progress monitoring
- Standards alignment

Integration points are located in `/src/components/spec-kit/`.