# Skolapp Brand Guidelines

Den här guiden beskriver hur Skolapp-logotypen och ikonen ska användas för att få ett konsekvent och professionellt uttryck i alla kanaler.

## Primära resurser

| Asset | Filnamn | Rekommenderad användning |
| --- | --- | --- |
| Wordmark (SVG) | `public/brand/Skolapp.svg` | Rubriker, navigation, tryck, hero-sektioner |
| Ikon (PNG, 1024×1024) | `public/brand/Skolapp-icon.png` | Favicons, app-ikoner, små ytor |
| Ikon (SVG) | `public/brand/Skolapp-icon.svg` | UI-komponenter i webb och dokumentation |
| Monokrom variant | `public/brand/Skolapp-monochrome.png` | Mörk bakgrund, emboss, watermark |
| Mörk bakgrund | `public/brand/Skolapp-white.png` | Färgade bakgrunder (primärt mörka) |

> **Tips:** För bästa resultat i webben, använd SVG-filerna där det är möjligt. PNG ska bara användas när raster krävs (t.ex. favicons eller gamla klienter).

## Färger

| Namn | Hex | Användning |
| --- | --- | --- |
| Skolapp Teal | `#377B7B` | Primär logotypsfärg (wordmark, ikon) |
| Skolapp Teal Dark | `#2F6767` | Hover, gradienter, mörkt läge |
| Off White | `#F9F7EA` | Bakgrundsplattor, badge-bakgrund |

## Frizon och minsta storlek

- Lämna minst ett "S" (höjden av bokstaven S i logotypen) luft runt hela wordmarken.
- Wordmarken får aldrig visas mindre än 120px i bredd på webben (ca 32px höjd).
- Ikonen får aldrig bli mindre än 24×24px för att behålla tydlighet.

## Placering och kombinationer

- Placera logotypen i vänster hörn i navigationer (använd `ResponsiveLogo`-komponenten).
- I hero-ytor kan logotypen kompletteras med tagline genom `tagline`-prop i `Logo`-komponenten.
- Använd `LogoMonochrome` på ljusa foton och `LogoWhite` på mörka bakgrunder.

## Komponentexempel

```tsx
import { Logo, ResponsiveLogo } from '@/components/brand/Logo'

export function MarketingHeader() {
  return (
    <header className="flex items-center justify-between">
      <ResponsiveLogo size="lg" tagline="Lär dig smartare" />
      {/* ...navigation */}
    </header>
  )
}
```

## Gör inte

- Förvräng inte logotypens proportioner.
- Lägg inte logotypen på brusiga bakgrunder där kontrasten försämras.
- Ändra inte färger utan att kontrollera kontrast och varumärkesintegritet.

## Kontakt

Behöver du en ny variant? Kontakta designteamet eller uppdatera ikonens SVG i `public/brand` och dokumentera ändringen här.
