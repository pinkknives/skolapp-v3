# Bug Triage & Fix Process

## Prioriteringsmodell

### P0 - Blockerare (Fix inom 24h)
**Definition**: Krascher, blank vyer, kärnfunktionalitet fungerar inte alls

**Exempel**:
- [ ] App kraschar vid start
- [ ] Blank skärm istället för quiz-content
- [ ] Publicering av quiz fungerar inte
- [ ] Elever kan inte ansluta till quiz alls
- [ ] Data går förlorat vid quiz-genomförande

**Process**:
1. Skapa hotfix-branch: `hotfix/p0-beskrivning`
2. Fix implementeras omedelbart
3. Testing på minst 2 enheter
4. Merge till main samma dag

### P1 - Större fel (Fix inom 1 vecka)
**Definition**: Fel states, felaktig layout som hindrar användning

**Exempel**:
- [ ] Loading-indikatorer som fastnar
- [ ] Disabled-states som inte aktiveras korrekt
- [ ] Layout som förhindrar interaktion på mobil
- [ ] Formulär som inte validerar korrekt
- [ ] Felaktiga felmeddelanden

**Process**:
1. Skapa branch: `fix/p1-kort-beskrivning`
2. Prioriteras i nästa sprint
3. Code review krävs
4. Testing på relevanta enheter

### P2 - Mindre fel (Fix inom 1 månad)
**Definition**: Visuella glapp, fel text, inkonsekvent spacing/typografi

**Exempel**:
- [ ] Felaktiga färger eller typsnitt
- [ ] Inkonsekvent spacing mellan element
- [ ] Stavfel eller fel översättningar
- [ ] Misaligned ikoner eller knappar
- [ ] Hover-states som saknas

**Process**:
1. Samla flera P2-fixes i samma PR
2. Skapa branch: `fix/p2-batch-beskrivning`
3. Kan vänta till nästa mindre release
4. Fokus på design system compliance

## PR-format för buggfixar

### Rubrikformat
```
Fix: [Beskrivning] (P[0-2])
```

**Exempel**:
- `Fix: Quiz creation crashes on iOS Safari (P0)`
- `Fix: Loading state stuck after publish quiz (P1)`
- `Fix: Inconsistent button spacing in mobile view (P2)`

### PR-beskrivning mall

```markdown
## Bug Fix: [Titel]

**Priority**: P[0-2]
**Affects**: [Enheter/webbläsare/användargrupper]

### Repro
1. [Steg för att återskapa problemet]
2. [Specifika förhållanden]
3. [Förväntat vs faktiskt resultat]

### Root Cause
[Vad som orsakade problemet]

### Fix
[Vad som ändrades för att lösa problemet]

### Verification
- [ ] Bug reproduceras innan fix
- [ ] Bug fixad efter implementation
- [ ] Inga regressioner introducerade
- [ ] Testat på relevanta enheter/webbläsare

### Screenshots
**Före**:
[Skärmdump av problemet]

**Efter**:
[Skärmdump av lösningen]
```

## Bug Discovery Process

### 1. Identifiering
- [ ] Manuell testning enligt flow-checklistor
- [ ] Automatiserad error tracking (Sentry/LogRocket)
- [ ] User feedback från beta-testare
- [ ] Performance monitoring alerts

### 2. Dokumentation
- [ ] Skapa issue i GitHub med rätt prioritet
- [ ] Lägg till relevanta labels (browser, device, component)
- [ ] Assign till rätt utvecklare baserat på område
- [ ] Lägg till i project board för spårning

### 3. Reproduktion
- [ ] Verifiera bug kan reproduceras konsekvent
- [ ] Testa på minst 2 olika enheter/webbläsare
- [ ] Dokumentera exakta repro-steg
- [ ] Identifiera edge cases

### 4. Impact Assessment
- [ ] Hur många användare påverkas?
- [ ] Finns det workarounds?
- [ ] Påverkar det kärnfunktionalitet?
- [ ] Är det regression från tidigare version?

## Regressionsförhindrade

### Pre-commit hooks
- [ ] ESLint check måste passa
- [ ] TypeScript compilation måste lyckas
- [ ] Unit tests måste passa (när implementerade)

### Pre-merge krav
- [ ] Code review från minst 1 annan utvecklare
- [ ] Manual testing på 2 enheter för P0/P1
- [ ] Performance regression check
- [ ] Accessibility check för UI-ändringar

### Post-deploy monitoring
- [ ] Error rate monitoring första 24h
- [ ] Performance metrics tracking
- [ ] User feedback monitoring
- [ ] Rollback plan aktiverad

## Vanliga bugtyper & förebyggande

### Performance-relaterade
**Vanliga problem**:
- Stora bundle sizes
- Ineffektiva re-renders
- Memory leaks i komponenter

**Förebyggande**:
- [ ] Bundle analysis i CI/CD
- [ ] React DevTools profiling
- [ ] Lighthouse CI integration

### Browser-kompatibilitet
**Vanliga problem**:
- Safari-specifika CSS-problem
- ES6+ features utan polyfills
- Service Worker registration fails

**Förebyggande**:
- [ ] Browserslist konfiguration uppdaterad
- [ ] Cross-browser testing matrix
- [ ] Progressive enhancement approach

### Mobile-specifika
**Vanliga problem**:
- Touch targets för små (<44px)
- Viewport configuration problem
- iOS Safari address bar height

**Förebyggande**:
- [ ] Mobile-first design approach
- [ ] Touch target guidelines
- [ ] iOS Safari testing obligatoriskt

### Accessibility
**Vanliga problem**:
- Saknade focus indicators
- Ingen keyboard navigation
- Screen reader compatibility

**Förebyggande**:
- [ ] axe-core integration i development
- [ ] Keyboard testing i alla flows
- [ ] Screen reader testing

## Metrics & KPIs

### Bug tracking metrics
- [ ] **Time to fix** per prioritetsnivå
- [ ] **Regression rate** (nya buggar från fixes)
- [ ] **Reopened bugs** (fixes som inte fungerar)
- [ ] **Bug discovery rate** (hitta fel före release)

### Quality metrics
- [ ] **Test coverage** för komponenter med flest buggar
- [ ] **Performance budget** compliance
- [ ] **Accessibility score** måste vara ≥90
- [ ] **User satisfaction** från feedback

### Rapportering
- **Veckovis**: Bug burn-down chart
- **Monthly**: Quality metrics dashboard
- **Per release**: Retrospektiv om bug patterns
- **Quarterly**: Process improvement assessment