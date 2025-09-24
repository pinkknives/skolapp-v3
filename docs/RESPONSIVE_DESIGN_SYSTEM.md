# Responsive Design System

Detta dokument beskriver det nya responsiva designsystemet som implementerats för att säkerställa konsekvent layout och bättre användarupplevelse på alla enheter.

## Översikt

Designsystemet består av flera återanvändbara komponenter som hanterar:
- Konsekvent spacing och padding
- Responsiv typografi
- Flexibla grid-layouts
- Enhetlig container-hantering

## Komponenter

### ResponsiveContainer

En flexibel container-komponent som hanterar bredd och padding.

```tsx
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer'

<ResponsiveContainer size="xl" padding="lg">
  {/* Innehåll */}
</ResponsiveContainer>
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (max-width)
- `padding`: 'none' | 'sm' | 'md' | 'lg' (horizontal padding)
- `className`: Ytterligare CSS-klasser

**Storlekar:**
- `sm`: max-w-3xl
- `md`: max-w-5xl
- `lg`: max-w-6xl
- `xl`: max-w-7xl
- `full`: max-w-full

### ResponsiveSection

En sektions-komponent för konsekvent vertikal spacing.

```tsx
import { ResponsiveSection } from '@/components/layout/ResponsiveContainer'

<ResponsiveSection padding="lg" className="bg-white">
  {/* Sektionsinnehåll */}
</ResponsiveSection>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl' (vertical padding)
- `className`: Ytterligare CSS-klasser

**Padding-värden:**
- `none`: Ingen padding
- `sm`: py-8 sm:py-12
- `md`: py-12 sm:py-16
- `lg`: py-16 sm:py-20
- `xl`: py-16 sm:py-20 lg:py-24

### ResponsiveHeading

En responsiv rubrik-komponent med automatisk skalning.

```tsx
import { ResponsiveHeading } from '@/components/layout/ResponsiveContainer'

<ResponsiveHeading level={2} className="text-center">
  Min Rubrik
</ResponsiveHeading>
```

**Props:**
- `level`: 1 | 2 | 3 | 4 | 5 | 6 (HTML heading level)
- `className`: Ytterligare CSS-klasser

**Storlekar:**
- `level={1}`: text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
- `level={2}`: text-2xl sm:text-3xl md:text-4xl lg:text-5xl
- `level={3}`: text-xl sm:text-2xl md:text-3xl lg:text-4xl
- `level={4}`: text-lg sm:text-xl md:text-2xl lg:text-3xl
- `level={5}`: text-base sm:text-lg md:text-xl lg:text-2xl
- `level={6}`: text-sm sm:text-base md:text-lg lg:text-xl

### ResponsiveGrid

En flexibel grid-komponent med responsiva kolumner.

```tsx
import { ResponsiveGrid } from '@/components/layout/ResponsiveContainer'

<ResponsiveGrid 
  cols={{ default: 1, md: 2, lg: 3 }} 
  gap="lg"
  className="mb-8"
>
  {/* Grid items */}
</ResponsiveGrid>
```

**Props:**
- `cols`: Objekt med breakpoint-specifika kolumnantal
- `gap`: 'sm' | 'md' | 'lg' | 'xl' (gap mellan items)
- `className`: Ytterligare CSS-klasser

**Gap-värden:**
- `sm`: gap-4
- `md`: gap-6
- `lg`: gap-6 lg:gap-8
- `xl`: gap-6 lg:gap-8 xl:gap-12

## Breakpoints

Systemet använder Tailwind CSS breakpoints:

- `sm`: 640px och uppåt
- `md`: 768px och uppåt
- `lg`: 1024px och uppåt
- `xl`: 1280px och uppåt

## Användning i Komponenter

### Exempel: Hero Section

```tsx
export function Hero() {
  return (
    <ResponsiveSection className="bg-background">
      <ResponsiveContainer size="xl" padding="lg">
        <div className="text-center">
          <ResponsiveHeading level={1} className="mb-6">
            Huvudrubrik
          </ResponsiveHeading>
          <Typography variant="subtitle1" className="text-lg sm:text-xl">
            Underrubrik
          </Typography>
        </div>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
```

### Exempel: Feature Cards

```tsx
export function Features() {
  return (
    <ResponsiveSection className="bg-white">
      <ResponsiveContainer size="xl" padding="lg">
        <ResponsiveHeading level={2} className="text-center mb-12">
          Funktioner
        </ResponsiveHeading>
        
        <ResponsiveGrid 
          cols={{ default: 1, md: 2, lg: 3 }} 
          gap="lg"
        >
          {features.map(feature => (
            <Card key={feature.id}>
              {/* Card content */}
            </Card>
          ))}
        </ResponsiveGrid>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
```

## Fördelar

1. **Konsekvens**: Alla komponenter följer samma spacing- och typografi-regler
2. **Responsivitet**: Automatisk anpassning till olika skärmstorlekar
3. **Underhållbarhet**: Centraliserad logik för layout-hantering
4. **Flexibilitet**: Enkelt att anpassa för specifika behov
5. **Prestanda**: Optimerade CSS-klasser utan onödig komplexitet

## Migration från Gamla Systemet

### Före
```tsx
<div className="py-20 bg-white">
  <div className="mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
    <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4">
      Rubrik
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Content */}
    </div>
  </div>
</div>
```

### Efter
```tsx
<ResponsiveSection className="bg-white">
  <ResponsiveContainer size="xl" padding="lg">
    <ResponsiveHeading level={2} className="mb-4">
      Rubrik
    </ResponsiveHeading>
    <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
      {/* Content */}
    </ResponsiveGrid>
  </ResponsiveContainer>
</ResponsiveSection>
```

## Best Practices

1. **Använd alltid ResponsiveContainer** för att wrappa innehåll
2. **Välj lämplig storlek** baserat på innehållets bredd
3. **Använd ResponsiveHeading** för alla rubriker
4. **Välj rätt gap-storlek** för grid-layouts
5. **Kombinera med befintliga Tailwind-klasser** när det behövs

## Framtida Förbättringar

- [ ] Stöd för custom breakpoints
- [ ] Animation-integrering
- [ ] Dark mode-optimering
- [ ] Accessibility-förbättringar
- [ ] Performance-optimering för stora grid-layouts
