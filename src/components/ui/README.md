# UI Components Documentation

Denna dokumentation beskriver Skolapp v3:s formulärkomponenter med förbättrade design tokens, tillgänglighet och dark mode-stöd.

## Översikt

Alla formulärkomponenter följer Skolapp:s designsystem med:
- **Design tokens** för konsekvent styling
- **44px+ touch targets** för mobil tillgänglighet  
- **Full ljus/mörk läge-paritet**
- **WCAG 2.1 AA-kompatibilitet**
- **Fokusringar** som respekterar `prefers-reduced-motion`

## Komponenter

### FormField
Wrapper-komponent för konsekvent labeling och felhantering.

```tsx
import { FormField } from '@/components/ui/FormField'

<FormField
  label="Användarnamn"
  helperText="Ange ditt användarnamn"
  errorMessage="Användarnamn är obligatoriskt"
  required
>
  <Input {...props} />
</FormField>
```

### Input
Grundläggande textinput med stöd för olika typer och tillstånd.

```tsx
import { Input } from '@/components/ui/Input'

<Input
  label="E-post"
  type="email"
  placeholder="din@email.se"
  helperText="Vi skickar aldrig spam"
  errorMessage="Ogiltig e-postadress"
  required
/>

<Input
  label="Lösenord"
  type="password"
  showPasswordToggle
  size="lg"
/>
```

**Props:**
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `variant`: `'default' | 'error' | 'success'`
- `showPasswordToggle`: visa/dölj-knapp för lösenordsfält

### Textarea
Flerlinjig textinput för längre texter.

```tsx
import { Textarea } from '@/components/ui/Textarea'

<Textarea
  label="Beskrivning"
  placeholder="Beskriv ditt quiz..."
  rows={4}
  helperText="Berätta vad eleverna kommer att lära sig"
/>
```

### Select
Dropdown-meny med förkonfigurerade alternativ.

```tsx
import { Select } from '@/components/ui/Select'

const options = [
  { value: '', label: 'Välj kategori' },
  { value: 'matematik', label: 'Matematik' },
  { value: 'svenska', label: 'Svenska' },
]

<Select
  label="Kategori"
  options={options}
  placeholder="Välj kategori"
  helperText="Välj vilken kategori som passar bäst"
/>
```

### Checkbox
Enkel kryssruta för ja/nej-val.

```tsx
import { Checkbox } from '@/components/ui/Checkbox'

<Checkbox
  label="Jag accepterar användarvillkoren"
  size="md"
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
/>
```

**Storlekar:** `'sm' | 'md' | 'lg'`

### Radio
Radioknapp för val mellan flera alternativ.

```tsx
import { Radio } from '@/components/ui/Radio'

<div>
  <Radio
    name="gender"
    value="man"
    label="Man"
    checked={gender === 'man'}
    onChange={(e) => setGender(e.target.value)}
  />
  <Radio
    name="gender"
    value="kvinna"
    label="Kvinna"
    checked={gender === 'kvinna'}
    onChange={(e) => setGender(e.target.value)}
  />
</div>
```

### Switch
Toggle-kontroll för aktivering/inaktivering.

```tsx
import { Switch } from '@/components/ui/Switch'

<Switch
  label="Aktivera notifikationer"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
  size="md"
/>
```

## Design Tokens

Alla komponenter använder CSS custom properties för konsekvent styling:

### Färger
```css
/* Ljust läge */
--field-bg: 255 255 255;
--field-border: var(--color-neutral-300);
--field-text: var(--color-neutral-900);

/* Mörkt läge */
.dark {
  --field-bg: var(--color-neutral-100);
  --field-border: var(--color-neutral-300);
  --field-text: var(--color-neutral-900);
}
```

### Storlekar
```css
--field-height-sm: 2.75rem; /* 44px */
--field-height-md: 3rem;    /* 48px */
--field-height-lg: 3.5rem;  /* 56px */
```

### Fokusringar
```css
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
```

## CSS-klasser

Grundläggande klasser som används av alla komponenter:

- `.field-base` - Basklassen för alla fält
- `.field-sm/md/lg` - Storleksvarianterna
- `.label-base` - Konsekvent labelformatering
- `.help-text` - Hjälptext under fält
- `.error-text` - Felmeddelanden med `role="alert"`
- `.field-error` - Feltillstånd för fält

## Tillgänglighet (A11y)

Alla komponenter följer WCAG 2.1 AA-riktlinjer:

### Fokushantering
- Tydliga fokusringar i både ljust och mörkt läge
- Respekterar `prefers-reduced-motion`
- Tangentbordsnavigation fungerar korrekt

### ARIA-attribut
- Labels kopplade via `htmlFor`/`id`
- Felmeddelanden via `aria-describedby`
- Felstatus via `aria-invalid`
- Obligatoriska fält markerade

### Touch-targets
- Minst 44×44px klickyta på alla interaktiva element
- Adekvat spacing mellan klickbara områden

## Dark Mode

Alla komponenter har full paritet mellan ljust och mörkt läge:

```tsx
// Aktivera dark mode
document.documentElement.classList.add('dark')

// Inaktivera dark mode  
document.documentElement.classList.remove('dark')
```

Komponenter använder CSS custom properties som automatiskt växlar när `.dark`-klassen läggs till.

## Exempel: Komplett formulär

```tsx
import { Input, Textarea, Select, Checkbox, Button, FormField } from '@/components/ui'

function QuizForm() {
  return (
    <form className="space-y-6">
      <Input
        label="Quiz-titel"
        placeholder="Ange en beskrivande titel"
        required
        helperText="En bra titel hjälper eleverna förstå vad quizet handlar om"
      />
      
      <Textarea
        label="Beskrivning"
        placeholder="Beskriv vad eleverna kommer att lära sig"
        rows={3}
      />
      
      <Select
        label="Kategori"
        options={categoryOptions}
        placeholder="Välj kategori"
      />
      
      <FormField
        label="Inställningar"
        helperText="Anpassa hur quizet ska fungera"
      >
        <div className="space-y-3">
          <Checkbox label="Blanda frågorna" />
          <Checkbox label="Visa rätt svar direkt" />
          <Checkbox label="Tillåt omtagning" />
        </div>
      </FormField>
      
      <Button type="submit" size="lg" className="w-full">
        Skapa quiz
      </Button>
    </form>
  )
}
```

## Testning

Komponenter testas för:
- **Visuell regression** med screenshots
- **Tillgänglighet** med axe-core
- **Interaktion** med Playwright
- **Touch targets** på mobila enheter
- **Dark mode** växling

Se `/tests/` för detaljerade testfall.