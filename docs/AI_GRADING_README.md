# AI-assisterad rättning (Human-in-the-loop) – MVP

## Översikt

Denna funktionalitet ger läraren AI-stöd för rättning av fritext- och bildsvar, samt förtydliganden/förslag på återkoppling – men där läraren alltid granskar och godkänner innan resultat fastställs.

## Funktioner

### Stödda frågetyper
- **Fritextsvar**: AI föreslår poäng + motivering + exempel på förbättrad formulering
- **Bildfrågor** (enkel nivå): AI föreslår tolkning/taggning (t.ex. "rätt figur/ej"), med osäkerhetsgrad
- **Flervalsfrågor**: auto-rättning (redan implementerat), men AI kan föreslå förklaringar

### Human-in-the-loop workflow
1. Läraren öppnar TeacherReviewMode för ett quiz
2. För fritextsvar och bildfrågor visas en "AI-förslag" knapp
3. Klicka för att öppna AI-förslag modalen
4. AI analyserar alla elevsvar för den aktuella frågan
5. Läraren ser AI-förslag i modal med:
   - Föreslagen poäng
   - Motivering från AI
   - Säkerhetsgrad (confidence)
6. Läraren kan:
   - **Godkänn**: Acceptera AI:s förslag
   - **Redigera**: Justera poäng/motivering
   - **Avvisa**: Sätt egen poäng (vanligtvis 0)

### Batch-åtgärder
- "Godkänn alla med hög säkerhet" (≥90%, ≥80%, ≥70%)
- Batch-godkännande för säkra träffar sparar tid
- Alla batch-åtgärder loggas för revision

## Säkerhet och GDPR-kompatibilitet

### Dataskydd
- **Korttidsläge**: Inga elev-PII lämnar systemet (endast lokal demo-AI)
- **Långtidsläge**: Externa AI-tjänster endast med korrekt samtycke
- Elev-identifierare anonymiseras innan AI-anrop
- Automatisk maskning av potentiella personnummer och namn

### Transparens och audit
- All AI-användning loggas (assessment ID, confidence, beslut)
- Lärarbeslut loggas (godkänn/redigera/avvisa)
- Batch-åtgärder spåras med threshold och antal
- Tydlig varning: "AI kan ha fel – du fastställer resultatet"

### Compliance
- GDPR: I korttidsläge skickas inga elev-PII till externa tjänster
- I långtidsläge krävs föräldrasamtycke för elever under 13
- Alla AI-anrop respekterar användarens datalagringsläge

## Teknisk arkitektur

### AI-klient med adapterlager
```typescript
// Huvudklient som väljer adapter baserat på användarinställningar
AIGradingClient
├── LocalDemoAdapter (för korttidsläge och demo)
├── CloudLLMAdapter (för långtidsläge med samtycke)
└── Auto-grading för flervalsfrågor
```

### Datamodeller
```typescript
AIAssessment {
  id, answerId, questionId, questionType,
  suggestedScore, maxScore, rationale,
  confidence, timestamp, aiModel
}

TeacherDecision {
  id, assessmentId, answerId, decision,
  finalScore, finalRationale, teacherNote,
  timestamp, teacherId
}
```

### Komponenter
- `AISuggestionsPanel`: Modal för AI-förslag och lärarbeslut
- `AIGradingClient`: Huvudklient för AI-rättning
- `AIGradingAuditService`: Audit-loggning och statistik

## Begränsningar i MVP

1. **Bildrättning**: Endast förenklad mock-logik (låg confidence)
2. **AI-modeller**: Endast lokal demo-adapter implementerad
3. **Språkstöd**: Endast svenska i MVP
4. **Rubrik-stöd**: Grundläggande, kan utökas
5. **Offline-läge**: Ej implementerat för AI-funktioner

## Prestandaoptimering

- Lazy-loading av AI-panel (endast när behövs)
- Code-splitting för AI-komponenter  
- Batch-bearbetning med fördröjning mellan calls
- Cachning av AI-bedömningar per session

## Tillgänglighet (WCAG 2.1 AA)

- Full tangentbordsnavigering i AI-panelen
- Tydliga focus-rings och semantisk HTML
- Skärmläsarstöd för AI-confidence nivåer
- Kontrastförhållanden följer WCAG standarder

## Användning

### För lärare
1. Skapa eller öppna ett quiz i lärarläge
2. Växla till "TeacherReviewMode" för att granska svar
3. För fritextsvar - klicka "AI-förslag" för att få hjälp
4. Granska varje AI-förslag noggrant
5. Godkänn, redigera eller avvisa varje förslag
6. Använd batch-funktioner för snabbare arbete

### Varningar för lärare
- **Dubbelkolla alltid**: AI kan ha fel, särskilt för komplexa svar
- **Pedagogisk bedömning**: AI ersätter inte lärarens expertis
- **Kontextuell förståelse**: AI kan missa nyanser som läraren ser
- **Säkerhetsgrad**: Lägre confidence kräver mer granskning

## Framtida utbyggnad

1. **Avancerade AI-modeller**: Integration med OpenAI, Claude, etc.
2. **Förbättrad bildrättning**: OCR och visuell innehållsanalys  
3. **Rubrik-builder**: Verktyg för att skapa detaljerade bedömningskriterier
4. **Progressionsanalys**: AI-driven analys av elevprogression
5. **Flerspråksstöd**: Engelska och andra språk
6. **Offline AI**: Lokala modeller för full offline-funktionalitet

## Tekniska detaljer

### Installation och setup
Inga extra beroenden krävs - allt är byggt in i systemet.

### Konfiguration
AI-funktioner aktiveras automatiskt baserat på:
- Användarens abonnemangsplan
- Datalagringsläge (korttid/långtid)
- Föräldrasamtycke (för minderåriga)

### Felsökning
- Kontrollera att användaren har rätt behörigheter
- Verifiera att datalagringsläget är korrekt konfigurerat
- Se audit-loggar för detaljer om AI-anrop och beslut

### Prestanda
- Initial laddning: +~5kB JavaScript för AI-komponenter
- AI-bedömning: 800-1200ms per fritextsvar (demo-adapter)
- Minnesfotavtryck: Minimal - audit-logg begränsad till 10k entries

---

*Denna dokumentation gäller för MVP-versionen. Kontakta utvecklingsteamet för teknisk support eller funktionsförfrågningar.*