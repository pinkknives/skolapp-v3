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

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local and fill in your Supabase project settings:
# - NEXT_PUBLIC_SUPABASE_URL: Your project URL from Supabase dashboard
# - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your anon public key from API settings
# - SUPABASE_SERVICE_ROLE_KEY: Your service role key from API settings

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

## Environment Configuration

### Supabase Setup

Skolapp v3 uses Supabase for backend services. To configure the connection:

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to your [Supabase dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to Settings → API
   - Copy the following values:

3. **Fill in your `.env.local` file:**
   ```bash
   # Your project URL (e.g., https://abcdefghijklmnop.supabase.co)
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   
   # Your anon public key (safe to expose in browser)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   
   # Your service role key (NEVER commit this - server-side only)
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

4. **Important security notes:**
   - `.env.local` is automatically ignored by Git
   - Never commit real keys to version control
   - Service role key has admin privileges - keep it secure
   - Only use service role key in server-side code

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

### Build Caching Strategy

Skolapp v3 implements multi-layer caching in CI/CD for optimal build performance:

#### Next.js Build Cache

All CI workflows include Next.js build caching to reduce build times:

```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ${{ github.workspace }}/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
```

#### Cache Strategy Layers

1. **NPM Dependencies**: `~/.npm` - Speeds up `npm ci`
2. **Next.js Build Cache**: `.next/cache` - Enables incremental builds
3. **Source File Invalidation**: Hash-based cache keys ensure cache invalidation when source files change

#### Performance Benefits

- **Cold builds**: ~3-5 minutes (no cache)
- **Warm builds**: ~1-2 minutes (with cache)
- **Incremental builds**: ~30-60 seconds (minimal changes)

For local development, builds benefit from Next.js built-in incremental compilation.

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

## 🗄️ Supabase (Auth + DB)

Skolapp v3 använder Supabase för autentisering och datalagring med inbyggt GDPR-stöd.

### Datamodell

- **Auth**: E-post magic link. Roller i `profiles.role` (teacher|student).
- **Data**: `quizzes`, `questions`, `attempts`, `answers`, `consents`.
- **RLS**: På för alla tabeller. Lärare ser egna quiz/resultat; elev ser enbart sitt.

### Klienter

- `supabase-browser.ts` (för client components)
- `supabase-server.ts` (server actions/SSR; använder service_role på servern)

### Flöde (MVP)

1. Användare loggar in → `profiles` upsertas med role (default: teacher).
2. Lärare skapar quiz → join-kod genereras automatiskt.
3. Elev ansluter till quiz med kod → attempt skapas.
4. Svar sparas i `answers`. Långtidslagring kräver `consents`; annars rensas enligt policy.

### Databastabeller

#### `quizzes`
- `id`: UUID primary key
- `owner_id`: Referenser auth.users
- `title`: Quiz titel
- `join_code`: Unik 4-tecken kod
- `status`: 'draft' | 'published'

#### `questions`
- `id`: UUID primary key  
- `quiz_id`: Referenser quizzes
- `type`: 'mcq' | 'free' | 'image'
- `content`: JSONB (frågetext, alternativ)
- `answer_key`: JSONB (facit)

#### `attempts`
- `id`: UUID primary key
- `quiz_id`: Referenser quizzes
- `student_id`: Referenser auth.users
- `data_mode`: 'short' | 'long'
- `student_alias`: För gäst-läge

#### `answers`
- `attempt_id`, `question_id`: Sammansatt primärnyckel
- `value`: JSONB (elevens svar)
- `score`: Numerisk poäng

#### `consents`
- `student_id`: UUID primary key
- `guardian_email`, `guardian_name`: Vårdnadshavare
- `status`: 'pending' | 'approved' | 'denied' | 'expired'
- `expires_at`: Utgångsdatum

### GDPR-kompatibilitet

**Korttid** = auto-rensa (cron/edge). **Långtid** = endast med registrerat samtycke i `consents`.

- **Korttidsläge**: Data rensas automatiskt efter 24h via `cleanup_short_term_data()`
- **Långtidsläge**: Kräver föräldrasamtycke, lagrad permanent tills återkallat
- **RLS**: Säkerställer att användare endast ser egen data
- **Consent tracking**: Fullständig audit trail för samtycken

### Dataaktioner

Server actions tillgängliga i `/src/app/actions/quiz.ts`:

- `createQuizAction()`: Skapa nytt quiz med auto-genererad join-kod
- `createAttemptAction()`: Anslut till quiz via kod, skapa attempt
- `publishQuizAction()`: Publicera quiz för elever

### Auth Widget

Enkel inloggningskomponent med svensk UI:

```tsx
import { AuthWidget } from '@/components/auth/AuthWidget'

// Använd i valfri komponent
<AuthWidget />
```

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

## Organisationer & RLS (Row Level Security)

Skolapp v3 använder ett robust organisationssystem med inbyggd datasäkerhet via Row Level Security (RLS) för att säkerställa att data isoleras mellan olika skolor och organisationer.

### Organisationsstruktur

**Huvudkomponenter:**
- `orgs` - Organisationer (skolor, kommuner, etc.)
- `org_members` - Medlemskap med roller (owner, admin, teacher)
- `org_invites` - Inbjudningar till organisationer
- Koppling till `quizzes` via `org_id` för organisationstillhörighet

**Roller och behörigheter:**
- **Owner**: Skapare av organisation, full kontroll
- **Admin**: Kan hantera medlemmar och inställningar
- **Teacher**: Kan skapa och hantera quiz inom organisationen

### RLS-säkerhetsprinciper

**Grundläggande isolation:**
- Användare kan endast se data från organisationer de tillhör
- Quiz från andra organisationer är ej tillgängliga
- Medlemslistor skyddade mellan organisationer
- Försök och resultat isolerade per organisation

**RLS-policies implementerade:**
```sql
-- Organisationer: Endast medlemmar kan läsa
CREATE POLICY "user reads own orgs" ON orgs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM org_members om 
    WHERE om.org_id = orgs.id 
    AND om.user_id = auth.uid() 
    AND om.status = 'active'
  )
);

-- Quiz: Medlemmar kan läsa organisationens quiz
CREATE POLICY "org member reads org quizzes" ON quizzes
FOR SELECT USING (
  auth.uid() = owner_id
  OR (
    org_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM org_members om 
      WHERE om.org_id = quizzes.org_id 
      AND om.user_id = auth.uid() 
      AND om.status = 'active'
    )
  )
);
```

**Verifierad säkerhet:**
- Negativa tester bekräftar att cross-org access blockeras
- RLS-policies förhindrar dataläckage mellan organisationer
- Automatiserade tester säkerställer korrekt isolering

### Implementation

**Frontend-komponenter:**
- `/src/app/teacher/org/page.tsx` - Organisationshantering
- `/src/app/teacher/quiz/page.tsx` - Quiz-hantering per organisation
- `/src/lib/orgs.ts` - Organisationsfunktioner
- `/src/lib/quiz-utils.ts` - Quiz-funktioner med organisationsstöd

**Backend-säkerhet:**
- `/supabase/migrations/005_orgs.sql` - RLS-policies och schema
- Server-side validering av organisationstillhörighet
- Automatisk koppling av quiz till användarens organisation

**Testning:**
- `/test/helpers/rls-verification.ts` - RLS-verifieringstester
- `/scripts/run-rls-tests.js` - Automatiserade säkerhetstester
- Negativtester för cross-org access

### Användning

**För lärare:**
1. Skapa eller bli inbjuden till en organisation
2. Alla quiz kopplas automatiskt till organisationen
3. Se endast quiz och medlemmar från egen organisation
4. Bjud in kollegor via e-postinbjudningar

**För utvecklare:**
```typescript
// Hämta quiz för användarens organisation
const { data, error } = await getOrganizationQuizzes()

// Skapa quiz i organisation
const result = await createQuizWithOrganization(title, description, orgId)

// Verifiera organisationstillhörighet
const { data: membership } = await getCurrentUserOrganization()
```

**Säkerhetstestning:**
```bash
# Kör RLS-verifieringstester
node scripts/run-rls-tests.js

# Resultat visar att cross-org access blockeras korrekt
# ✅ All RLS tests passed. Organization isolation working correctly.
```

Detta system garanterar GDPR-kompatibilitet och datasäkerhet genom att säkerställa att varje organisation endast kan komma åt sin egen data.