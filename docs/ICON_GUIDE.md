# Ikon-guide för Skolapp v3

Denna guide beskriver hur vi använder Lucide Icons i Skolapp v3 och vilka ikoner som är tillgängliga för olika användningsområden.

## Översikt

Skolapp v3 använder [Lucide React](https://lucide.dev/) som primärt ikonbibliotek. Lucide erbjuder över 1,000 vektorbilder som är optimerade för moderna webbapplikationer.

## Installation

Ikoner är redan installerade via `lucide-react` paketet:

```bash
npm install lucide-react
```

## Grundläggande användning

### Direkt import
```tsx
import { BookOpen, Users, BarChart3 } from 'lucide-react'

function MyComponent() {
  return (
    <div>
      <BookOpen size={24} className="text-primary-600" />
      <Users size={20} />
      <BarChart3 size={16} />
    </div>
  )
}
```

### Med Icon-komponenten
```tsx
import { Icon, EducationIcons } from '@/components/ui/Icon'

function MyComponent() {
  return (
    <Icon 
      name={EducationIcons.BookOpen}
      size={24}
      color="primary"
      className="hover:scale-110 transition-transform"
    />
  )
}
```

## Ikon-kategorier

### 🎓 Utbildning & Lärande
```tsx
import { 
  GraduationCap,  // Lärare, utbildning
  BookOpen,       // Quiz, kurser
  PenTool,        // Skrivning, redigering
  Calculator,     // Matematik
  Microscope,     // Naturvetenskap
  Globe,          // Geografi
  Palette,        // Konst
  Music           // Musik
} from 'lucide-react'
```

### 📊 Bedömning & Quiz
```tsx
import { 
  ClipboardCheck, // Bedömning, checklista
  Target,         // Mål, precision
  Award,          // Pris, utmärkelse
  Star,           // Betyg, kvalitet
  ThumbsUp,       // Godkännande
  ThumbsDown,     // Avslag
  CheckCircle,    // Korrekt svar
  XCircle         // Felaktigt svar
} from 'lucide-react'
```

### 🧭 Navigation & Åtgärder
```tsx
import { 
  Home,           // Hem, startsida
  ArrowLeft,      // Tillbaka
  ArrowRight,     // Framåt
  ChevronLeft,    // Kollapsa
  ChevronRight,   // Expandera
  Edit,           // Redigera
  Save,           // Spara
  Download,       // Ladda ner
  Copy,           // Kopiera
  Share2,         // Dela
  Plus,           // Lägg till
  Trash2          // Radera
} from 'lucide-react'
```

### 📱 Status & Feedback
```tsx
import { 
  Check,          // Klar, godkänd
  X,              // Avbryt, stäng
  AlertCircle,    // Varning
  AlertTriangle,  // Kritiskt
  Info,           // Information
  HelpCircle,     // Hjälp
  Bell,           // Notifiering
  MessageCircle   // Kommunikation
} from 'lucide-react'
```

### 📁 Media & Filer
```tsx
import { 
  File,           // Generisk fil
  FileText,       // Textdokument
  Image,          // Bild
  Video,          // Video
  Folder,         // Mapp
  QrCode          // QR-kod
} from 'lucide-react'
```

## Styling och anpassning

### Storlekar
```tsx
// Fasta storlekar
<BookOpen size={16} />  // Liten
<BookOpen size={20} />  // Medium
<BookOpen size={24} />  // Stor
<BookOpen size={32} />  // Extra stor

// Responsiva storlekar
<BookOpen size="1rem" />
<BookOpen size="2em" />
```

### Färger
```tsx
// Med Tailwind CSS
<BookOpen className="text-primary-600" />
<BookOpen className="text-success-600" />
<BookOpen className="text-warning-600" />
<BookOpen className="text-error-600" />

// Med Icon-komponenten
<Icon name="BookOpen" color="primary" />
<Icon name="BookOpen" color="success" />
<Icon name="BookOpen" color="warning" />
<Icon name="BookOpen" color="error" />
```

### Animationer
```tsx
// Hover-effekter
<BookOpen className="hover:scale-110 transition-transform" />

// Rotation
<RefreshCw className="animate-spin" />

// Fade-in
<BookOpen className="animate-fade-in" />
```

## Användningsregler

### ✅ Gör så här

```tsx
// Använd semantiskt korrekta ikoner
<BookOpen /> // För quiz och kurser
<Users />    // För klasser och elever
<BarChart3 /> // För statistik

// Använd konsekventa storlekar
<BookOpen size={20} /> // Standard för knappar
<BookOpen size={24} /> // Standard för rubriker
<BookOpen size={16} /> // Standard för text

// Använd färger som stöder temat
<BookOpen className="text-primary-600 dark:text-primary-400" />
```

### ❌ Gör INTE så här

```tsx
// Använd inte fel ikon för kontext
<Music /> // För matematik (använd Calculator istället)

// Använd inte för stora ikoner i små utrymmen
<BookOpen size={48} /> // I en liten knapp

// Använd inte för många olika ikoner på samma sida
// Håll det enkelt och konsekvent
```

## Tillgänglighet

### ARIA-labels
```tsx
// Lägg till beskrivande labels
<BookOpen 
  size={24} 
  aria-label="Öppna quiz"
  role="img"
/>

// För knappar med ikoner
<button aria-label="Skapa nytt quiz">
  <Plus size={20} />
</button>
```

### Fokus-hantering
```tsx
// Ikoner i klickbara element
<button className="focus:ring-2 focus:ring-primary-500">
  <BookOpen size={20} />
</button>
```

## Prestanda

### Tree-shaking
```tsx
// ✅ Bra - importera endast de ikoner du behöver
import { BookOpen, Users } from 'lucide-react'

// ❌ Dåligt - importera hela biblioteket
import * as LucideIcons from 'lucide-react'
```

### Lazy loading
```tsx
// För stora ikon-samlingar
const DynamicIcon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.BookOpen })), {
  loading: () => <div className="w-6 h-6 bg-neutral-200 rounded" />
})
```

## Utveckling

### Lägga till nya ikoner
1. Kontrollera att ikonen finns i [Lucide](https://lucide.dev/icons)
2. Importera ikonen i komponenten
3. Uppdatera denna guide om det är en ny kategori
4. Testa ikonen i både ljust och mörkt tema

### Skapa ikon-komponenter
```tsx
// För återkommande ikon-kombinationer
export function QuizIcon({ size = 20, className }: IconProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BookOpen size={size} />
      <span>Quiz</span>
    </div>
  )
}
```

## Testning

### Ikon-tester
```tsx
// Test att ikoner renderas korrekt
import { render, screen } from '@testing-library/react'
import { BookOpen } from 'lucide-react'

test('renders book icon', () => {
  render(<BookOpen data-testid="book-icon" />)
  expect(screen.getByTestId('book-icon')).toBeInTheDocument()
})
```

## Resurser

- [Lucide Icons](https://lucide.dev/) - Officiell webbplats
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) - React-paket
- [Figma Plugin](https://www.figma.com/community/plugin/809845580443999341) - För design
- [Icon Usage Examples](http://localhost:3000/test-components) - Live-exempel i appen
