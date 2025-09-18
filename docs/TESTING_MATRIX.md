# Testmatris & Smoke-pass - Skolapp v3

## Enheter & Webbläsare

### Mobila enheter
- **iPhone (Safari)** - iOS 15+
  - [ ] iPhone SE (375x667)
  - [ ] iPhone 12/13/14 (390x844)
  - [ ] iPhone 14 Pro Max (430x932)

- **Android (Chrome)** - Android 10+
  - [ ] Samsung Galaxy S21 (360x800)
  - [ ] Google Pixel 6 (411x891)
  - [ ] OnePlus 9 (412x915)

### Desktop
- **Chrome** (senaste 2 versioner)
  - [ ] Windows 10/11
  - [ ] macOS
  - [ ] Ubuntu 22.04

- **Edge** (senaste version)
  - [ ] Windows 10/11

- **Safari** (senaste version)
  - [ ] macOS

## Nätverksförhållanden

### Normalt nätverk
- [ ] WiFi (>50 Mbps)
- [ ] 4G (>10 Mbps)

### Throttling
- [ ] 3G Slow (400 Kbps, 400ms RTT)
- [ ] 3G Fast (1.6 Mbps, 150ms RTT)
- [ ] Offline → Online övergång

### PWA Offline-test
- [ ] Kritiska vyer tillgängliga offline:
  - [ ] Hemskärm
  - [ ] Quiz-anslutning (cachad)
  - [ ] Pågående quiz (sparad lokalt)
  - [ ] Resultatvisning (cachad)

## Språk & Lokalisering

### Svenska UI överallt
- [ ] Alla sidor visar svensk text
- [ ] Felmeddelanden på svenska
- [ ] Tooltips och hjälptexter på svenska
- [ ] Datum/tid-format svensk standard
- [ ] Fallbacks saknas (förväntat - endast svenska stöds)

## Roller & Användarflöden

### Lärare
- [ ] Skapa konto/logga in
- [ ] Skapa quiz (alla metoder)
- [ ] Hantera quiz (publicera/avpublicera/arkivera)
- [ ] Granska resultat
- [ ] Dela quiz (kod/QR/länk)

### Elev (gäst)
- [ ] Anslut till quiz med kod
- [ ] Anslut till quiz med QR
- [ ] Genomföra quiz (alla frågetyper)
- [ ] Se resultat/kvittens

## Resultat

### Pass/Fail kriterier
- **Pass**: All kärnfunktionalitet fungerar utan blockerande fel
- **Fail**: Krascher, blank skärm, eller kritiska flöden fungerar inte

### Dokumentation
- [ ] Screenshots för varje enhet/webbläsare kombination
- [ ] Performance-mätningar (LCP, FID, CLS)
- [ ] Identifierade buggar med prioritet (P0/P1/P2)