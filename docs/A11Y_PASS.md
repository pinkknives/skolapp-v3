# A11y-pass (WCAG 2.1 AA Compliance)

## Översikt
Säkerställ att Skolapp uppfyller WCAG 2.1 AA-kraven för tillgänglighet, med särskilt fokus på utbildningssammanhang där elever kan ha olika funktionsnedsättningar.

## 1. Fokusringar på alla interaktiva element

### Fokusindikering
- [ ] **Synliga fokusringar**: Alla klickbara element har tydlig fokusring
- [ ] **Kontrast**: Fokusringar har minst 3:1 kontrast mot bakgrund
- [ ] **Tjocklek**: Fokusringar är minst 2px tjocka
- [ ] **Stil**: Konsekvent fokusring-stil genom hela appen

### Element att testa
- [ ] Alla knappar (primära, sekundära, ghost, etc.)
- [ ] Alla formulärfält (input, textarea, select, radio, checkbox)
- [ ] Alla länkar
- [ ] Alla interaktiva ikoner
- [ ] Modal dialogs och deras close-knappar
- [ ] Dropdown menyer och deras alternativ
- [ ] Quiz-alternativ (flerval, checkboxes)
- [ ] Drag & drop handles

### Testmetod
```bash
# Använd Tab-tangenten för att navigera
# Shift+Tab för att navigera bakåt
# Enter/Space för att aktivera
# Esc för att stänga
```

## 2. Labels & ARIA-attribut

### Formulärelement
- [ ] **Alla inputs har labels**: `<label for="id">` eller `aria-label`
- [ ] **Required fields**: `aria-required="true"` eller `required`
- [ ] **Field descriptions**: `aria-describedby` kopplar till hjälptext
- [ ] **Error messages**: `aria-invalid="true"` + `aria-describedby` för fel

### Exempel för quiz-formulär
```tsx
// ✅ Korrekt implementation
<label htmlFor="quiz-title">Quiz-titel *</label>
<input 
  id="quiz-title"
  type="text"
  required
  aria-required="true"
  aria-describedby="title-help title-error"
  aria-invalid={hasError ? "true" : "false"}
/>
<div id="title-help">Ange en beskrivande titel för ditt quiz</div>
{hasError && (
  <div id="title-error" role="alert">
    Titel är obligatorisk
  </div>
)}
```

### ARIA Landmarks
- [ ] `<main>` för huvudinnehåll
- [ ] `<nav>` för navigation 
- [ ] `<aside>` för sidoinnehåll (som AI-panel)
- [ ] `role="region"` för viktiga sektioner med `aria-label`

### Dynamic content
- [ ] **Live regions**: `aria-live="polite"` för status updates
- [ ] **Loading states**: `aria-busy="true"` under laddning
- [ ] **Error announcements**: `role="alert"` för akuta meddelanden

## 3. Kontraster ≥ 4.5:1

### Textkontrast
- [ ] **Normal text** (< 18px): Minst 4.5:1 kontrast
- [ ] **Stor text** (≥ 18px eller ≥ 14px bold): Minst 3:1 kontrast
- [ ] **Länkar**: Både färgkodning och underline/bold
- [ ] **Disabled states**: Tydligt visuellt men behöver inte uppfylla kontrast

### Verktyg för kontrastmätning
```bash
# Chrome DevTools: Lighthouse accessibility audit
# axe DevTools extension
# WebAIM Contrast Checker
# Stark extension
```

### Färgpaletten kontroll
```css
/* Kontrollera design tokens mot WCAG-krav */
:root {
  /* Primära färger - kontrollera mot vit/svart bakgrund */
  --primary-600: #1e40af; /* Kontrollera 4.5:1 på vit */
  --neutral-700: #374151; /* Kontrollera 4.5:1 på vit */
  
  /* Semantiska färger */
  --error-600: #dc2626;   /* Kontrollera 4.5:1 på vit */
  --success-600: #059669; /* Kontrollera 4.5:1 på vit */
  --warning-600: #d97706; /* Kontrollera 4.5:1 på vit */
}
```

### Specific areas att kontrollera
- [ ] Quiz-alternativ text mot bakgrund
- [ ] Felmeddelanden
- [ ] Status chips (Utkast, Publicerad, etc.)
- [ ] Navigation links
- [ ] Button text mot button bakgrund
- [ ] Placeholder text i formulärfält

## 4. Tabbordning & ESC-stängning

### Keyboard Navigation Order
- [ ] **Logisk tabbordning**: Följer visuell läsordning (vänster-höger, topp-botten)
- [ ] **No tab traps**: Användare kan ta sig ur alla delar av sidan
- [ ] **Modal focus management**: Focus flyttas till modal när den öppnas
- [ ] **Return focus**: Focus återgår till ursprungselement när modal stängs

### Tab-order för quiz creation
```
1. Huvudnavigation (hem, gå med i quiz, etc.)
2. Quiz-titel input
3. Quiz-beskrivning textarea  
4. Taggar input
5. Tidsgräns input
6. Genomförandeläge radio buttons
7. Avancerade inställningar checkboxes
8. Lägg till fråga-knappar (Flerval, Fritext, Bild)
9. Befintliga frågor (edit/delete knappar)
10. Spara/Publicera knappar
```

### ESC-tangent stängning
- [ ] **Modals**: ESC stänger alla modals
- [ ] **Dropdowns**: ESC stänger dropdown menyer
- [ ] **AI-panel**: ESC stänger AI-draft panel
- [ ] **Quiz preview**: ESC stänger preview modal
- [ ] **Share dialog**: ESC stänger delnings-panel

### Focus management code example
```tsx
// Modal focus management
const modal = useRef<HTMLDivElement>(null);
const previousFocus = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (isOpen) {
    // Spara vad som hade focus
    previousFocus.current = document.activeElement as HTMLElement;
    
    // Flytta focus till modal
    modal.current?.focus();
    
    // Lägg till ESC listener
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Återställ focus när modal stängs
      previousFocus.current?.focus();
    };
  }
}, [isOpen, onClose]);
```

## 5. Screen Reader Testing

### Verktyg
- [ ] **NVDA** (Windows) - Gratis screen reader
- [ ] **JAWS** (Windows) - Kommersiell screen reader
- [ ] **VoiceOver** (macOS/iOS) - Inbyggd screen reader
- [ ] **TalkBack** (Android) - Inbyggd screen reader

### Test scenarios
- [ ] **Quiz creation**: Hela processen med screen reader
- [ ] **Quiz joining**: Anslutning och genomförande med enbart tangentbord
- [ ] **Error handling**: Felmeddelanden annonseras korrekt
- [ ] **Dynamic updates**: Status-ändringar kommuniceras

### Semantic HTML
- [ ] **Headings hierarchy**: h1 → h2 → h3 logisk struktur
- [ ] **Lists**: ul/ol för listor, inte div med bullets
- [ ] **Buttons vs links**: button för actions, a för navigation
- [ ] **Form structure**: fieldset/legend för radio/checkbox grupper

## 6. Touch Target Sizes

### Minimum sizes (WCAG AAA recommendation)
- [ ] **Touch targets**: Minst 44x44px
- [ ] **Spacing**: Minst 8px mellan targets
- [ ] **Mobile optimized**: Extra viktigt för mobila enheter

### Areas att kontrollera
- [ ] Quiz-alternativ knappar på mobil
- [ ] Navigation menu items
- [ ] Edit/delete knappar för frågor
- [ ] Checkbox/radio inputs
- [ ] Close buttons på modals

## 7. Error Prevention & Recovery

### Form Validation
- [ ] **Real-time validation**: Visa fel medan användaren skriver
- [ ] **Clear error messages**: Beskriv exakt vad som är fel
- [ ] **Error location**: Placera felmeddelanden nära fältet
- [ ] **Success confirmation**: Tydlig bekräftelse när saker lyckas

### Error message examples
```tsx
// ❌ Dåligt felmeddelande
"Invalid input"

// ✅ Bra felmeddelande  
"Quiz-titel måste vara mellan 3 och 100 tecken"

// ✅ Förslag på lösning
"Quiz-kod hittades inte. Kontrollera att du angett rätt fyra tecken (till exempel: AB3K)"
```

## 8. Testing Automation

### Automated A11y Testing
```bash
# Installera axe-core för automated testing
npm install --save-dev @axe-core/playwright

# Lighthouse CI för accessibility scoring
npm install --save-dev @lhci/cli
```

### Test implementation
```typescript
// playwright.config.ts - lägg till axe testing
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('Quiz creation should be accessible', async ({ page }) => {
  await page.goto('/teacher/quiz/create');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
```

## 9. Checklist per sida

### Homepage (/)
- [ ] Fokusringar synliga
- [ ] Heading hierarchy korrekt (h1 → h2 → h3)
- [ ] Alla CTA-knappar är minst 44px höga
- [ ] Kontrast på alla text-element ≥ 4.5:1
- [ ] Screen reader läser allt logiskt

### Quiz Creation (/teacher/quiz/create)
- [ ] Alla formulärfält har labels
- [ ] Felmeddelanden kopplas till rätt fält med aria-describedby
- [ ] AI-panel har korrekt focus management
- [ ] Question drag & drop är tillgänglig via tangentbord
- [ ] Preview modal har korrekt ESC-hantering

### Quiz Join (/quiz/join)
- [ ] Quiz-kod input har tydlig label
- [ ] Felmeddelanden för fel kod är tydliga
- [ ] QR-scanner är tillgänglig (eller alternativ tillhandahålls)
- [ ] Success-states kommuniceras tydligt

### Quiz Taking (/quiz/take)
- [ ] Alla quiz-alternativ är tillgängliga via tangentbord
- [ ] Progress kommuniceras till screen readers
- [ ] Timer (om aktiv) annonseras regelbundet
- [ ] Navigation mellan frågor fungerar med tangentbord

## 10. Rapportering & Dokumentation

### Test Report Template
```markdown
## A11y Test Report - [Datum]

### Summary
- Pages tested: X
- Total issues found: Y
- Critical (WCAG AA blockers): Z
- Warnings (best practices): W

### Critical Issues
1. [Issue description]
   - Impact: [Who is affected]
   - Fix: [What needs to be done]
   - Priority: High/Medium/Low

### Tools Used
- [ ] axe-DevTools
- [ ] Lighthouse
- [ ] Manual keyboard testing
- [ ] Screen reader testing ([NVDA/VoiceOver/etc])

### Score
- axe-core: X/100
- Lighthouse Accessibility: Y/100
- Manual testing: Pass/Fail per area
```

### Continuous Monitoring
- [ ] Lighthouse CI i GitHub Actions
- [ ] axe-core tests i test suite
- [ ] Monthly manual accessibility review
- [ ] User feedback från användare med funktionsnedsättningar

Målsättning: **100% WCAG 2.1 AA compliance** för alla kritiska användarflöden.