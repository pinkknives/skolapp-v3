# HeroUI Guide för Skolapp v3

Denna guide beskriver hur vi använder HeroUI-komponenter i Skolapp v3 och vilka komponenter som är tillgängliga.

## Översikt

Skolapp v3 använder [HeroUI (NextUI)](https://heroui.com/) som primärt UI-bibliotek för avancerade komponenter. HeroUI erbjuder moderna, tillgängliga och anpassningsbara React-komponenter.

## Installation

HeroUI är redan installerat via `@heroui/react` paketet:

```bash
npm install @heroui/react
```

## Konfiguration

HeroUI är konfigurerat i `tailwind.config.js` och `src/app/providers.tsx`:

```tsx
// providers.tsx
import { HeroUIProvider } from "@heroui/react";

export default function Providers({ children }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}
```

## Tillgängliga komponenter

### ✅ Använda komponenter

#### **1. Formulär-komponenter**
```tsx
import { 
  Input, 
  Textarea, 
  Select, 
  SelectItem, 
  RadioGroup, 
  Radio,
  Checkbox,
  Switch,
  InputOTP
} from '@heroui/react'

// Input
<Input
  label="E-postadress"
  placeholder="Ange din e-post"
  type="email"
  variant="bordered"
/>

// Textarea
<Textarea
  label="Beskrivning"
  placeholder="Beskriv ditt quiz..."
  variant="bordered"
  minRows={3}
/>

// Select
<Select
  label="Välj ämne"
  placeholder="Välj ett ämne"
  variant="bordered"
>
  <SelectItem key="matematik" value="matematik">Matematik</SelectItem>
  <SelectItem key="svenska" value="svenska">Svenska</SelectItem>
</Select>

// RadioGroup
<RadioGroup
  label="Genomförandeläge"
  defaultValue="self-paced"
  orientation="vertical"
>
  <Radio value="self-paced">Självtempo</Radio>
  <Radio value="teacher-controlled">Lärarstyrt tempo</Radio>
</RadioGroup>

// Checkbox
<Checkbox defaultSelected>Blanda frågorna</Checkbox>

// Switch
<Switch defaultSelected>AI-assistent aktiverad</Switch>

// InputOTP
<InputOTP
  value="1234"
  onChange={setValue}
  length={4}
  variant="bordered"
/>
```

#### **2. Navigation-komponenter**
```tsx
import { 
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection
} from '@heroui/react'

// Button
<Button color="primary" variant="solid">
  Skapa quiz
</Button>

// Dropdown
<Dropdown>
  <DropdownTrigger>
    <Button variant="bordered">Öppna meny</Button>
  </DropdownTrigger>
  <DropdownMenu aria-label="Actions">
    <DropdownItem key="new">Nytt quiz</DropdownItem>
    <DropdownItem key="copy">Kopiera</DropdownItem>
    <DropdownItem key="delete" className="text-danger" color="danger">
      Radera
    </DropdownItem>
  </DropdownMenu>
</Dropdown>
```

#### **3. Visuella komponenter**
```tsx
import { 
  Snippet,
  User,
  Kbd
} from '@heroui/react'

// Snippet
<Snippet symbol="$" variant="bordered">
  npm install @heroui/react
</Snippet>

// User
<User
  name="Anna Andersson"
  description="Lärare"
  avatarProps={{
    src: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  }}
/>

// Kbd
<Kbd keys={["command"]}>K</Kbd>
```

### ❌ Komponenter som INTE används

#### **1. Tooltip**
Vi använder Radix Primitives istället för HeroUI Tooltip:
```tsx
// Använd istället
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
```

## Användningsregler

### ✅ Gör så här

```tsx
// Använd HeroUI för avancerade formulär-komponenter
<Input
  label="Titel"
  placeholder="Ange quiz-titel"
  variant="bordered"
  isRequired
/>

// Använd HeroUI för dropdown-menyer
<Dropdown>
  <DropdownTrigger>
    <Button variant="bordered">Åtgärder</Button>
  </DropdownTrigger>
  <DropdownMenu>
    <DropdownItem key="edit">Redigera</DropdownItem>
    <DropdownItem key="delete" color="danger">Radera</DropdownItem>
  </DropdownMenu>
</Dropdown>

// Använd HeroUI för användarprofiler
<User
  name="Erik Eriksson"
  description="Elev"
  avatarProps={{ src: user.avatar }}
/>
```

### ❌ Gör INTE så här

```tsx
// Använd inte HeroUI för enkla komponenter som vi har egna för
<Button> // Använd vår Button-komponent istället
<Card>   // Använd vår Card-komponent istället

// Använd inte HeroUI Tooltip
<Tooltip> // Använd vår Tooltip-komponent istället
```

## Styling och anpassning

### Variants
```tsx
// Input variants
<Input variant="flat" />      // Standard
<Input variant="bordered" />  // Med kantlinje
<Input variant="faded" />     // Tona ner
<Input variant="underlined" /> // Understruken

// Button variants
<Button variant="solid" />    // Fylld
<Button variant="bordered" /> // Kantlinje
<Button variant="light" />    // Ljus
<Button variant="flat" />     // Flat
<Button variant="faded" />    // Tona ner
<Button variant="shadow" />   // Skugga
<Button variant="ghost" />    // Spöke
```

### Colors
```tsx
// Färgpaletter
<Button color="primary" />    // Primär (teal)
<Button color="secondary" />  // Sekundär
<Button color="success" />    // Grön
<Button color="warning" />    // Gul
<Button color="danger" />     // Röd
<Button color="default" />    // Standard
```

### Sizes
```tsx
// Storlekar
<Button size="sm" />    // Liten
<Button size="md" />    // Medium (standard)
<Button size="lg" />    // Stor
```

## Tillgänglighet

### ARIA-labels
```tsx
// Lägg alltid till beskrivande labels
<Input
  label="E-postadress"
  aria-label="Ange din e-postadress"
  isRequired
/>

<Dropdown>
  <DropdownTrigger>
    <Button aria-label="Öppna åtgärdsmeny">
      Åtgärder
    </Button>
  </DropdownTrigger>
  <DropdownMenu aria-label="Åtgärder för quiz">
    <DropdownItem key="edit">Redigera quiz</DropdownItem>
  </DropdownMenu>
</Dropdown>
```

### Keyboard Navigation
```tsx
// HeroUI-komponenter stöder automatiskt keyboard navigation
<RadioGroup
  label="Välj alternativ"
  orientation="vertical"
>
  <Radio value="option1">Alternativ 1</Radio>
  <Radio value="option2">Alternativ 2</Radio>
</RadioGroup>
```

## Prestanda

### Tree-shaking
```tsx
// ✅ Bra - importera endast de komponenter du behöver
import { Input, Button, Select } from '@heroui/react'

// ❌ Dåligt - importera hela biblioteket
import * as HeroUI from '@heroui/react'
```

### Lazy Loading
```tsx
// För stora komponenter
const DynamicSelect = dynamic(() => import('@heroui/react').then(mod => ({ default: mod.Select })), {
  loading: () => <div className="w-full h-10 bg-neutral-200 rounded" />
})
```

## Integration med vårt designsystem

### Färger
HeroUI-komponenter använder automatiskt våra design tokens:
- **Primary**: Teal-färger (#377b7b)
- **Success**: Grön för framgång
- **Warning**: Gul för varningar
- **Danger**: Röd för fel

### Spacing
HeroUI-komponenter följer vårt spacing-system:
- **Padding**: Konsekvent med våra design tokens
- **Margins**: Använd våra spacing-klasser

### Typography
HeroUI-komponenter använder våra font-inställningar:
- **Font Family**: System fonts
- **Font Sizes**: Konsekvent med vårt typography-system

## Testning

### Komponent-tester
```tsx
// Test att HeroUI-komponenter renderas korrekt
import { render, screen } from '@testing-library/react'
import { Input } from '@heroui/react'

test('renders input with label', () => {
  render(<Input label="Test" data-testid="test-input" />)
  expect(screen.getByTestId('test-input')).toBeInTheDocument()
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

### Accessibility-tester
```tsx
// Test tillgänglighet
import { axe, toHaveNoViolations } from 'jest-axe'

test('input should not have accessibility violations', async () => {
  const { container } = render(<Input label="Test" />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Vanliga användningsfall

### 1. Quiz-skapande formulär
```tsx
function QuizForm() {
  return (
    <div className="space-y-6">
      <Input
        label="Quiz-titel"
        placeholder="Ange en titel"
        variant="bordered"
        isRequired
      />
      
      <Textarea
        label="Beskrivning"
        placeholder="Beskriv ditt quiz"
        variant="bordered"
        minRows={3}
      />
      
      <Select
        label="Ämne"
        placeholder="Välj ämne"
        variant="bordered"
      >
        <SelectItem key="math" value="math">Matematik</SelectItem>
        <SelectItem key="science" value="science">Naturvetenskap</SelectItem>
      </Select>
      
      <RadioGroup
        label="Genomförandeläge"
        defaultValue="self-paced"
      >
        <Radio value="self-paced">Självtempo</Radio>
        <Radio value="teacher-controlled">Lärarstyrt</Radio>
      </RadioGroup>
    </div>
  )
}
```

### 2. Användarhantering
```tsx
function UserList() {
  return (
    <div className="space-y-4">
      {users.map(user => (
        <User
          key={user.id}
          name={user.name}
          description={user.role}
          avatarProps={{ src: user.avatar }}
        />
      ))}
    </div>
  )
}
```

### 3. Åtgärdsmenyer
```tsx
function QuizActions({ onEdit, onDelete, onShare }) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" isIconOnly>
          <MoreVertical />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="edit" onPress={onEdit}>
          Redigera
        </DropdownItem>
        <DropdownItem key="share" onPress={onShare}>
          Dela
        </DropdownItem>
        <DropdownItem key="delete" color="danger" onPress={onDelete}>
          Radera
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
```

## Resurser

- [HeroUI Documentation](https://heroui.com/) - Officiell dokumentation
- [HeroUI Components](https://heroui.com/docs/components/input) - Komponentlista
- [HeroUI Examples](http://localhost:3000/test-components) - Live-exempel i appen
- [HeroUI GitHub](https://github.com/heroui-org/heroui) - Källkod

## Utveckling

### Lägga till nya komponenter
1. Kontrollera att komponenten finns i [HeroUI](https://heroui.com/)
2. Importera komponenten i din fil
3. Testa komponenten i både ljust och mörkt tema
4. Uppdatera denna guide om det är en ny komponent

### Skapa wrapper-komponenter
```tsx
// För återkommande HeroUI-kombinationer
export function QuizSelect({ value, onChange, ...props }) {
  return (
    <Select
      value={value}
      onSelectionChange={onChange}
      variant="bordered"
      {...props}
    >
      <SelectItem key="math" value="math">Matematik</SelectItem>
      <SelectItem key="science" value="science">Naturvetenskap</SelectItem>
    </Select>
  )
}
```
