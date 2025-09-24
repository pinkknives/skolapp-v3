# Flödestester - Checklistor

## Lärarflöden

### Quiz-skapande

#### Från tomt quiz
- [ ] Klicka "Skapa nytt quiz"
- [ ] Fyll i grundläggande info (titel, beskrivning)
- [ ] Välja genomförandeläge (Självtempo/Lärarstyrt/Granskningsläge)
- [ ] Ställ in avancerade inställningar
- [ ] Autospara syns: "Sparar…" → "Sparad" indikator
- [ ] Status uppdateras korrekt (Utkast)

#### Från mall (om implementerad)
- [ ] Välj mall från galleri
- [ ] Anpassa mallens innehåll
- [ ] Spara som nytt quiz
- [ ] Verifierar att mall inte påverkas

#### Från AI-utkast
- [ ] Öppna AI-panel
- [ ] Fyll i prompt (ämne, årskurs, antal frågor)
- [ ] Klicka "Generera frågor"
- [ ] Vänta på AI-response
- [ ] Granska föreslagna frågor
- [ ] Välj vilka frågor att inkludera
- [ ] Frågor infogas i wizard utan sidbytning
- [ ] AI-disclaimer visas: "Dubbelkolla alltid innehållet. AI kan ha fel."

### Frågehantering

#### Frågetyper
- [ ] **Flerval**
  - [ ] Lägg till frågetitel
  - [ ] Lägg till minst 2 svarsalternativ
  - [ ] Markera korrekt svar
  - [ ] Ställ in poäng (standard: 1)
  - [ ] Ställ in tidsgräns (valfritt)

- [ ] **Fritext**
  - [ ] Lägg till frågetitel
  - [ ] Ställ in rubrik-kriteria
  - [ ] Ställ in poäng
  - [ ] Ställ in tidsgräns (valfritt)

- [ ] **Bild**
  - [ ] Ladda upp bild (drag & drop eller file picker)
  - [ ] Lägg till bildtext/fråga
  - [ ] Lägg till svarsalternativ
  - [ ] Markera korrekt svar
  - [ ] Förhandsgranska bildstorlek

#### Drag & Drop ordning
- [ ] Dra frågor för att ändra ordning
- [ ] Ordningsändring sparas automatiskt
- [ ] Frågenummer uppdateras korrekt
- [ ] Förhandsgranskning reflekterar ny ordning

### Förhandsgranskning

#### Mobilvy
- [ ] Klicka "Förhandsgranska" → "Mobilvy"
- [ ] Quiz visas i mobilformat
- [ ] Alla frågor renderas korrekt
- [ ] Navigering fungerar (Nästa/Föregående)
- [ ] Timer syns om aktiverad

#### Desktopvy/Klassrumsvy
- [ ] Klicka "Förhandsgranska" → "Klassvy"
- [ ] Quiz visas i stort format (projektorlämpligt)
- [ ] Frågor läsbara från avstånd
- [ ] QR-kod för anslutning visas
- [ ] Delningskod visas tydligt

### Publicering & Delning

#### Publicera quiz
- [ ] Klicka "Publicera quiz"
- [ ] Valideringsmeddelanden om något saknas
- [ ] Lyckat meddelande visas
- [ ] Status ändras från "Utkast" → "Publicerad"
- [ ] Fyrteckenskod genereras automatiskt
- [ ] QR-kod genereras automatiskt

#### Dela-panel
- [ ] Klicka "Dela" på publicerat quiz
- [ ] **Kopiera länk**: URL kopieras till clipboard
- [ ] **Kopiera kod**: 4-tecken kod kopieras
- [ ] **Ladda ner QR**: QR-kod sparas som PNG
- [ ] Instruktioner för elever visas på svenska
- [ ] Förhandsgranskning av delningslänk fungerar

#### Avpublicera/Arkivera
- [ ] **Avpublicera**: Status → "Utkast", kod inaktiveras
- [ ] **Arkivera**: Status → "Arkiverad", kod inaktiveras
- [ ] UI uppdateras omedelbart
- [ ] Konfirmationsdialog visas för destruktiva åtgärder

## Elevflöden (gäst)

### Anslutning

#### Med kod
- [ ] Gå till /quiz/join
- [ ] Ange 4-teckens kod
- [ ] **Korrekt kod**: Dirigeras till namngivning
- [ ] **Fel kod**: Tydligt felmeddelande på svenska
  - "Quiz hittades inte. Kontrollera att koden är korrekt."
- [ ] **Inaktiv kod**: Meddelande om att quiz inte längre är tillgängligt

#### Med QR-kod
- [ ] Skanna QR-kod med telefon
- [ ] Landar direkt på rätt quiz
- [ ] Samma namngivningsprocess som med kod
- [ ] QR-koder fungerar från olika avstånd/vinklar

#### Namngivning
- [ ] Ange namn eller alias
- [ ] Validering: namn krävs (minst 1 tecken)
- [ ] Klicka "Gå med i quiz"
- [ ] Dirigeras till quiz-lobby eller direkt till första frågan

### Quiz-genomförande

#### Alla frågetyper
- [ ] **Flerval**: Kan välja ett alternativ, "Nästa" aktiveras
- [ ] **Fritext**: Kan skriva svar, "Nästa" aktiveras
- [ ] **Bild**: Bild visas korrekt, kan välja alternativ

#### Offline-hantering
- [ ] **Kort avbrott** (< 30s): Seamless återanslutning
- [ ] **Längre avbrott** (> 30s): Sparar svar lokalt
- [ ] **Återhämtning**: Ingen datatapp, fortsätter där användaren slutade
- [ ] **Offline-indikator**: Visar när anslutning är förlorad

#### Progressmarkering
- [ ] Progressbar/indikator uppdateras
- [ ] "Fråga X av Y" visas korrekt
- [ ] Timer visas om aktiverad för fråga
- [ ] "Föregående" knapp fungerar (om tillåten)

### Slutförande & Resultat

#### Kvittens/Resultat (enkel)
- [ ] Bekräftelse att quiz är slutförd
- [ ] Summering av antal svar
- [ ] Tack-meddelande på svenska
- [ ] Möjlighet att lämna quiz eller gå tillbaka till början

## Efter körning / Review

### Lärargranskningsläge (post-run)

#### Översikt
- [ ] Lista över alla deltagare
- [ ] Sammanfattande statistik (genomsnitt, completion rate)
- [ ] Export-funktioner (CSV/PDF)

#### Stega igenom frågor
- [ ] Navigera mellan frågor
- [ ] Se alla elevsvar för varje fråga
- [ ] Anonymiseringsalternativ
- [ ] Kommentarer/feedback per svar (om implementerat)

#### Funktionalitet
- [ ] Översikt funkar smidigt
- [ ] Data visas korrekt och uppdaterat
- [ ] Export genererar korrekta filer
- [ ] Ingen prestanda-degradering med många svar

## Mina quiz

### Statuschips
- [ ] **Utkast**: Grå/neutral färg, rätt antal visas
- [ ] **Publicerad**: Grön/success färg, rätt antal visas  
- [ ] **Arkiverad**: Röd/warning färg, rätt antal visas
- [ ] Filtrering fungerar korrekt för varje status

### Snabbåtgärder
- [ ] **Redigera**: Öppnar quiz i edit-läge
- [ ] **Duplicera**: Skapar kopia med "(kopia)" suffix
- [ ] **Dela**: Öppnar dela-panel (endast för publicerade)
- [ ] **Arkivera**: Flyttar till arkiverade, bekräftelse-dialog

### Listvy
- [ ] Quiz visas i kronologisk ordning (senaste först)
- [ ] Alla metadata visas korrekt (titel, beskrivning, antal frågor)
- [ ] Åtgärdsknappar är kontextuella (olika för olika status)
- [ ] Sökfunktion fungerar (om implementerad)

## Verifiering

För varje checklist-punkt:
- ✅ **Pass**: Fungerar som förväntat
- ❌ **Fail**: Fungerar inte eller fel beteende 
- ⚠️ **Issue**: Fungerar men med mindre problem
- 🚫 **Blocked**: Kan inte testas (beroende saknas)

## Rapportering

Dokumentera alla:
- Fel med skärmdumpar och repro-steg
- Performance-problem (långsamma laddningstider)
- UX-förbättringsförslag
- Saknad funktionalitet som upptäcks under testning