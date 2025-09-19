# Sharp E2E Tests for Critical Quiz Flows

This document describes the comprehensive end-to-end testing setup for Skolapp's critical quiz functionality.

## Overview

We have implemented sharp E2E tests that cover the complete user journeys:

1. **Teacher creates quiz** (från scratch/AI/template)
2. **Student joins quiz** (via code/QR)
3. **Student answers and submits quiz**
4. **Results display** with accessibility (aria-live, focus, reduced-motion)

## Test Files

### Core Test Suites

- **`tests/core-flows.spec.ts`** - Enhanced core flows with complete E2E scenarios
- **`tests/quiz-critical-flows.e2e.spec.ts`** - Dedicated critical path tests for quiz lifecycle
- **`tests/accessibility.a11y.spec.ts`** - Accessibility compliance testing

### Test Coverage

#### Teacher Flows
- Quiz creation från scratch with Swedish UI validation
- AI-assisted quiz creation with Swedish disclaimer
- Quiz preview and publishing
- Quiz management and status handling

#### Student Flows  
- Quiz joining via code with Swedish validation
- Complete quiz answering flow
- Error handling in Swedish
- Results viewing with accessibility features

#### Accessibility & Performance
- WCAG 2.1 AA compliance
- Reduced motion preference support
- Touch target validation (44px minimum)
- Focus management during dynamic updates
- Swedish language consistency throughout

## Running Tests

### Local Development

```bash
# Run all E2E tests across browsers
npm run e2e

# Run specific browser tests
npm run e2e:chromium
npm run e2e:firefox  
npm run e2e:webkit

# Run with UI mode for debugging
npm run test:ui

# Run with browser visible (headed mode)
npm run test:headed
```

### CI Environment

```bash
# Optimized for CI with failure limits
npm run e2e:ci
```

## Cross-Browser Testing

Tests run on:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)

Each browser gets dedicated CI jobs with artifact collection.

## CI Integration

### QA Suite Workflow

The tests integrate with our existing QA suite:

- `xbrowser_chromium` - Chromium E2E tests
- `xbrowser_firefox` - Firefox E2E tests  
- `xbrowser_webkit` - WebKit E2E tests

### Artifacts

Each CI run generates:
- **Playwright HTML reports** (14-day retention)
- **Test results** (JUnit XML, JSON)
- **Screenshots** (on failure)
- **Videos** (on failure)
- **Traces** (on retry)

## Configuration

### Playwright Config

Key settings in `playwright.config.ts`:

```typescript
{
  // CI optimizations
  globalTimeout: 5 * 60 * 1000,  // 5 minutes total
  timeout: 30 * 1000,            // 30 seconds per test
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Swedish locale
  locale: 'sv-SE',
  timezoneId: 'Europe/Stockholm',
  
  // Accessibility
  reducedMotion: 'reduce',
  
  // Artifacts
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure'
}
```

### Target Performance

- **Total runtime**: 3-5 minutes in CI
- **Retries**: 2x on CI for stability
- **Parallel execution**: Disabled in CI for consistency

## Swedish Language Validation

Tests ensure Swedish throughout:

- UI labels and headings
- Error messages
- Button text
- Instructions and help text
- AI disclaimers

English words are explicitly checked and flagged.

## Accessibility Testing

Comprehensive a11y validation:

- **ARIA attributes**: roles, labels, live regions
- **Focus management**: logical tab order, focus trapping
- **Motion sensitivity**: respects `prefers-reduced-motion`
- **Touch targets**: 44px minimum for mobile
- **Screen reader support**: semantic HTML, announcements

## Error Scenarios

Tests cover error handling:

- Invalid quiz codes
- Network failures
- Form validation errors
- Session timeouts
- Browser compatibility issues

All errors display in Swedish with proper ARIA attributes.

## Maintenance

### Adding New Tests

1. Use existing test patterns from `quiz-critical-flows.e2e.spec.ts`
2. Ensure Swedish language consistency
3. Include accessibility checks
4. Test across all target browsers
5. Add appropriate timeouts and retries

### Debugging Failures

1. Check artifacts in CI (screenshots, videos, traces)
2. Run locally with `npm run test:ui`
3. Use headed mode: `npm run test:headed`
4. Enable debug mode: `DEBUG=pw:* npm run e2e`

### Performance Monitoring

Watch for:
- Test runtime exceeding 5 minutes
- Flaky tests requiring >2 retries
- Bundle size impact on test app startup
- Memory usage during test execution

## Future Enhancements

Planned improvements:
- Visual regression testing
- Performance metrics collection
- Mobile device testing expansion
- Multi-language testing framework
- Advanced AI flow testing