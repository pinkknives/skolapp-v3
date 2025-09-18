# Performance & PWA Requirements

## Lighthouse Målsättningar

### Mobila enheter (Primary target)
- **Accessibility**: ≥ 90/100 (WCAG 2.1 AA compliance)
- **Performance**: ≥ 85/100 (Excellent mobile experience)
- **PWA**: 100/100 (Full PWA compliance)
- **Best Practices**: ≥ 90/100 (Modern web standards)

### Desktop (Secondary target)
- **Accessibility**: ≥ 95/100
- **Performance**: ≥ 90/100
- **PWA**: 100/100
- **Best Practices**: ≥ 95/100

## Core Web Vitals

### LCP (Largest Contentful Paint) ≤ 2.5s
**Definition**: Tid för största synliga elementet att renderas

#### Kritiska sidor att mäta
- [ ] **Landing page** (/): Hero section med CTA-knappar
- [ ] **Quiz join** (/quiz/join): Formulärsektion
- [ ] **Quiz taking** (/quiz/take): Första frågan
- [ ] **Teacher portal** (/teacher): Dashboard cards
- [ ] **Quiz creation** (/teacher/quiz/create): Formulärsektion

#### Optimeringsstrategier
```typescript
// Next.js Image optimization
import Image from 'next/image'

// ✅ Använd Next.js Image för alla bilder
<Image
  src="/hero-image.webp"
  alt="Skolapp hero"
  width={800}
  height={600}
  priority // För above-the-fold bilder
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // Blur placeholder
/>

// ✅ Optimera critical CSS
// Inline critical CSS i <head>
// Lazy load non-critical CSS
```

#### Critical Resource Loading
- [ ] **Fonts**: Preload viktiga fonter
- [ ] **Critical CSS**: Inline above-the-fold styles
- [ ] **Hero images**: Preload med `priority`
- [ ] **JavaScript**: Code splitting för routes

### FID (First Input Delay) ≤ 100ms
**Definition**: Tid från första interaktion till browser svarar

#### Optimeringsstrategier
- [ ] **JavaScript chunking**: Split kod per route
- [ ] **Component lazy loading**: Använd React.lazy() för stora komponenter
- [ ] **Event delegation**: Minimera event listeners
- [ ] **Web Workers**: Flytta tunga beräkningar från main thread

```typescript
// ✅ Lazy load tunga komponenter
const AIQuizDraft = React.lazy(() => import('./AIQuizDraft'));
const QuizPreview = React.lazy(() => import('./QuizPreview'));

// ✅ Code splitting per route
const QuizCreation = dynamic(() => import('./QuizCreation'), {
  loading: () => <QuizCreationSkeleton />,
  ssr: false // Om komponenten är tungt för server-rendering
});
```

### CLS (Cumulative Layout Shift) ≤ 0.1
**Definition**: Summa av oväntade layout-förflyttningar

#### Förhindra layout shifts
- [ ] **Image dimensions**: Alltid ange width/height
- [ ] **Font loading**: Använd font-display: swap försiktigt
- [ ] **Skeleton screens**: Placeholders för dynamic content
- [ ] **Reserve space**: För ads, embeds, dynamic content

```css
/* ✅ Font loading optimization */
@font-face {
  font-family: 'Inter';
  font-display: optional; /* Förhindrar layout shift */
  src: url('/fonts/inter.woff2') format('woff2');
}

/* ✅ Aspect ratio för images */
.image-container {
  aspect-ratio: 16 / 9; /* Reserverar space innan bild laddas */
}
```

## Next.js Image Optimization

### Konfiguration
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 dagar
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optimering för vanliga Quiz-bild storlekar
    domains: ['example.com'], // Om bilder kommer från extern källa
  },
}
```

### Implementation guidelines
```typescript
// ✅ Quiz hero images (stora, above-the-fold)
<Image
  src="/quiz-hero.jpg"
  alt="Quiz bakgrund"
  width={1200}
  height={600}
  priority
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// ✅ Quiz question images (medium, lazy loaded)
<Image
  src={question.imageUrl}
  alt={question.imageAlt}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, 400px"
/>

// ✅ Små ikoner och avatars
<Image
  src="/icons/quiz-icon.svg"
  alt=""
  width={24}
  height={24}
  loading="lazy"
/>
```

## Bundle Size Optimization

### Current bundle analysis
```bash
# Kör bundle analyzer
npm run analyze

# Målsättningar (gzipped)
# - Main bundle: ≤ 200 kB
# - Page specific: ≤ 50 kB per sida
# - Total First Load: ≤ 250 kB
```

### Optimeringsstrategier
```typescript
// ✅ Conditional imports
const DevTools = process.env.NODE_ENV === 'development' 
  ? await import('./DevTools')
  : null;

// ✅ Tree shaking för bibliotek
import { Button } from '@/components/ui/Button'; // ✅ Specifik import
import * as Components from '@/components/ui'; // ❌ Importerar allt

// ✅ Dynamic imports för tunga features
const ChartComponent = dynamic(() => import('recharts'), {
  loading: () => <div>Laddar diagram...</div>,
  ssr: false
});
```

### Webpack optimizations
```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimera för production
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
          }
        },
      };
    }
    return config;
  },
};
```

## PWA Implementation

### Service Worker Strategy
```javascript
// next.config.js PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 timmar
        },
      },
    },
  ],
});
```

### Manifest.json konfiguration
```json
{
  "name": "Skolapp v3",
  "short_name": "Skolapp",
  "description": "Modern PWA för svenska skolor",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "orientation": "portrait-primary",
  "categories": ["education", "productivity"],
  "shortcuts": [
    {
      "name": "Skapa Quiz",
      "short_name": "Skapa",
      "url": "/teacher/quiz/create",
      "description": "Skapa nytt quiz för dina elever"
    },
    {
      "name": "Gå med i Quiz",
      "short_name": "Gå med",
      "url": "/quiz/join",
      "description": "Gå med i ett quiz som elev"
    }
  ],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png", 
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

### Offline-first strategies
```typescript
// Critical offline functionality
const offlineCapabilities = {
  // ✅ Läs quiz som redan är startade
  activeQuiz: 'Cache först, fallback till network',
  
  // ✅ Spara svar lokalt under quiz
  quizAnswers: 'Lokal storage med sync när online',
  
  // ✅ Visa hemskärm och grundläggande navigation  
  navigation: 'Service Worker cache',
  
  // ❌ Skapa nya quiz (kräver server)
  quizCreation: 'Kräver internet-anslutning',
  
  // ❌ Ansluta till nya quiz (kräver validering)
  quizJoining: 'Kräver internet-anslutning'
};
```

## Monitoring & Measurement

### Lighthouse CI Setup
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/quiz/join",
        "http://localhost:3000/teacher/quiz/create"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:performance": ["error", {"minScore": 0.85}],
        "categories:pwa": ["error", {"minScore": 1.0}],
        "categories:best-practices": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### Performance Budget
```json
// lighthouse-budgets.json
[
  {
    "path": "/*",
    "timings": [
      {
        "metric": "largest-contentful-paint",
        "budget": 2500
      },
      {
        "metric": "first-input-delay", 
        "budget": 100
      },
      {
        "metric": "cumulative-layout-shift",
        "budget": 0.1
      }
    ],
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 200
      },
      {
        "resourceType": "image",
        "budget": 500
      },
      {
        "resourceType": "total",
        "budget": 1000
      }
    ]
  }
]
```

### Real User Monitoring (RUM)
```typescript
// utils/performance.ts
export function reportWebVitals(metric: any) {
  // Skicka till analytics (Google Analytics, Vercel Analytics, etc.)
  if (typeof window !== 'undefined') {
    // Exempel med Vercel Analytics
    window.gtag?.('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: metric.name,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
}

// pages/_app.tsx
export { reportWebVitals };
```

## Performance Testing Checklist

### Pre-deployment testing
- [ ] **Lighthouse audit på alla kritiska sidor** (mobil + desktop)
- [ ] **Bundle size analysis** - ingen oväntat stora chunk
- [ ] **Network throttling test** (3G slow + fast)
- [ ] **Offline functionality test** - PWA features fungerar
- [ ] **Cache strategies** - rätt resurser cachas korrekt

### Post-deployment monitoring
- [ ] **Real user metrics** - Core Web Vitals från riktiga användare
- [ ] **Error tracking** - JavaScript errors och performance exceptions
- [ ] **Resource loading** - CDN performance och fallbacks
- [ ] **PWA install rate** - hur många installerar appen

### Performance regression detection
- [ ] **Automated Lighthouse** i CI/CD pipeline
- [ ] **Bundle size alerts** vid stora ökningar
- [ ] **Core Web Vitals alerts** vid försämring
- [ ] **User experience monitoring** - bounce rate och session duration

## Optimering prioritering

### Hög prioritet (Påverkar användarupplevelse direkt)
1. **LCP för quiz join page** - Första intryck för elever
2. **FID för quiz creation** - Lärare arbetar interaktivt
3. **Offline quiz completion** - Elever kan tappa anslutning
4. **Bundle size för mobile** - Många på begränsad data

### Medium prioritet (Förbättrar upplevelsen)
1. **Image optimization** för quiz-bilder
2. **Font loading strategy** för konsekvent rendering
3. **Cache strategies** för återkommande besökare
4. **Progressive enhancement** för äldre enheter

### Låg prioritet (Nice-to-have)
1. **Advanced PWA features** (push notifications, background sync)
2. **Micro-interactions performance**
3. **Development tooling performance**
4. **Advanced analytics och monitoring**