# Contributing to Skolapp v3

Welcome to Skolapp v3! This guide will help you understand our development workflow and ensure your contributions align with our standards.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Quality Standards](#code-quality-standards)
- [Language Requirements](#language-requirements)
- [Testing](#testing)
- [CI/CD Guidelines](#cicd-guidelines)
- [Dependency Management](#dependency-management)
- [Performance & PWA](#performance--pwa)
- [Pull Request Process](#pull-request-process)

## Development Setup

### Prerequisites

- Node.js ≥18.0.0
- npm (latest stable)

### Installation

```bash
git clone https://github.com/pinkknives/skolapp-v3.git
cd skolapp-v3
npm ci
```

### Environment Setup

Copy `.env.local.example` to `.env.local` and configure required environment variables.

## Code Quality Standards

### ESLint Configuration

We use ESLint v9 with flat configuration format. The configuration is in `eslint.config.js`.

**Key Rules:**
- No inline styles (use Tailwind classes or design tokens)
- TypeScript strict mode
- Prefer const over let
- No var declarations
- Warning on unused variables and explicit any types

### Pre-commit Checks

Before committing, ensure:

```bash
npm run lint
npm run type-check
npm run build
```

## Language Requirements

### Swedish First Policy

**All user-facing text must be in Swedish (sv-SE).**

#### Acceptable English Terms

The following English terms are whitelisted and acceptable:

1. **Technical terms**: API, JSON, URL, HTTP, TypeScript, React, etc.
2. **Icon names**: When importing from lucide-react (Edit, Delete, Save, etc.)
3. **Code identifiers**: Function names, variables, component names
4. **File paths and extensions**: .tsx, .ts, src/, components/, etc.

#### Language Validation

Run the language check:

```bash
./scripts/check-swedish-language.sh
```

This script:
- Checks for English UI text that should be Swedish
- Uses a comprehensive whitelist for acceptable English terms
- Validates Swedish character support (å, ä, ö)

#### Swedish Translation Examples

❌ **Bad:**
```tsx
<Button>Save Quiz</Button>
<h1>Create New Quiz</h1>
```

✅ **Good:**
```tsx
<Button>Spara Quiz</Button>
<h1>Skapa nytt quiz</h1>
```

## Testing

Skolapp v3 uses a comprehensive testing strategy with both unit/component tests (RTL) and end-to-end tests (Playwright).

### Component Testing (React Testing Library)

We use Vitest and React Testing Library for component testing with a focus on accessibility and Swedish language support.

#### Running RTL Tests

```bash
# Run all component tests
npm run test

# Watch mode for development
npm run test:watch

# Interactive UI mode
npm run test:ui

# Run specific test file
npm run test tests/components/QuestionTypeButton.test.tsx

# Coverage report
npm run test:coverage
```

#### RTL Testing Standards

- **Swedish language**: All test names and test content should be in Swedish
- **Accessibility-first**: Use `getByRole`, `getByLabelText`, `getByDisplayValue` over test IDs
- **ARIA testing**: Verify `aria-pressed`, `aria-describedby`, `role="alert"` attributes
- **Keyboard support**: Test Enter, Space, Tab navigation
- **Focus management**: Verify proper focus order and focus trapping
- **Form validation**: Test label associations (`for`/`id`) and error states

#### Test File Structure

```
tests/
├── components/          # Component unit tests
│   ├── QuestionTypeButton.test.tsx
│   ├── ActionsMenu.test.tsx
│   └── Input.test.tsx
└── setup.ts            # Global test setup with @testing-library/jest-dom
```

### End-to-End Testing

We use Playwright for comprehensive E2E testing across browsers.

#### Running E2E Tests

```bash
# Run all E2E tests across browsers
npm run test:e2e

# Run all browsers (Chromium, Firefox, WebKit)
npm run test:e2e:all

# Run AI-assisted quiz tests with deterministic mocks
npm run e2e:ai

# Run specific browser tests
npm run e2e:chromium
npm run e2e:firefox
npm run e2e:webkit

# Debug mode with browser visible
npm run test:headed

# Interactive UI mode for debugging
npm run test:ui
```

#### AI Testing

AI functionality uses deterministic mocks to ensure stable tests:

- **Mock Provider**: Returns consistent Swedish quiz questions
- **Environment**: Set `AI_MODE=mock` to activate mocking
- **Route Interception**: Intercepts `/api/ai/**` calls with static responses
- **Test Data**: 2 multiple-choice + 2 free-text questions in Swedish

#### Test Structure

- **`tests/core-flows.spec.ts`** - Basic quiz creation and student flows
- **`tests/quiz-wizard.e2e.spec.ts`** - Complete quiz wizard flow (non-AI)
- **`tests/e2e/quiz-ai-flow.spec.ts`** - Complete AI-assisted quiz flow
- **`tests/fixtures/aiMock.ts`** - AI mock responses and setup utilities

### Testing Debugging

#### Common Issues

**Component tests failing to find elements:**
```bash
# Check if element exists with different role
screen.debug() # Shows current DOM structure
# Use queryBy* methods to check if element exists
expect(screen.queryByText('Text')).toBeInTheDocument()
```

**E2E tests timing out:**
```bash
# Increase timeout for slow operations
await expect(page.getByText('Loading...')).toBeVisible({ timeout: 10000 })
# Use soft assertions for optional elements
await expect.soft(page.getByText('Optional')).toBeVisible()
```

**Browser installation issues:**
```bash
# Reinstall browsers
npx playwright install --with-deps
# Force browser download
npx playwright install chromium --force
```

For detailed testing documentation, see [`docs/E2E_TESTING.md`](docs/E2E_TESTING.md).

## CI/CD Guidelines

### GitHub Actions Standards

#### Deprecation Prevention

We automatically check for deprecated GitHub Actions:

```bash
./scripts/check-deprecated-actions.sh
```

**Required versions:**
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/cache@v4`
- `actions/upload-artifact@v4`

#### Performance Optimization

All workflows include Next.js build caching:

```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ${{ github.workspace }}/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
```

### Quality Gates

Every PR must pass:

1. **Lint & Type Check**: ESLint + TypeScript validation
2. **Build Check**: Successful production build
3. **Accessibility Testing**: Lighthouse CI with WCAG 2.1 AA compliance
4. **Performance Budget**: Bundle size < 200KB gzipped
5. **Cross-browser Testing**: Chromium, Firefox, WebKit
6. **Swedish Language Validation**: No English in Swedish UI context
7. **Security Scan**: npm audit with no moderate+ vulnerabilities
8. **Deprecated Check**: No deprecated packages or GitHub Actions

## Dependency Management

### Package Updates

#### Deprecated Package Policy

We proactively prevent deprecated packages:

```bash
./scripts/check-deprecated-packages.sh
```

#### Security Requirements

- Run `npm audit` before adding dependencies
- No moderate or higher severity vulnerabilities
- Keep dependencies updated quarterly

#### Known Replacements

- ❌ `rimraf@2-3` → ✅ `rimraf@^4.0.0`
- ❌ `rollup-plugin-terser` → ✅ `@rollup/plugin-terser`
- ❌ `eslint@8` → ✅ `eslint@^9.0.0`

### Adding New Dependencies

1. Check if functionality exists in current dependencies
2. Verify security status: `npm audit`
3. Check bundle impact: `npm run analyze`
4. Ensure TypeScript support
5. Document rationale in PR

## Performance & PWA

### Bundle Size Budget

- **Main bundle**: ≤200KB gzipped
- **Total initial JS**: ≤500KB gzipped
- **LCP target**: <2.5s on mid-tier mobile

### Caching Strategy

Next.js builds use multi-layer caching:

1. **Dependencies**: `~/.npm` (NPM cache)
2. **Build cache**: `.next/cache` (incremental builds)
3. **Source changes**: Hash-based invalidation

### Performance Monitoring

Check bundle size impact:

```bash
npm run analyze
```

Run Lighthouse CI:

```bash
npm run lighthouse
```

## Pull Request Process

### PR Checklist

Before submitting:

- [ ] **Swedish copy**: All UI text in Swedish
- [ ] **Design tokens**: No inline styles, use Tailwind/tokens
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Performance**: Bundle size check completed
- [ ] **PWA**: Service worker unaffected
- [ ] **GDPR**: Consent handling respected
- [ ] **Tests**: Relevant tests included
- [ ] **Documentation**: Updated if needed

### Review Process

1. **Automated checks**: All CI checks must pass
2. **Manual review**: Code quality and design review
3. **Testing**: Manual testing in staging environment
4. **Approval**: At least one maintainer approval required

### Commit Messages

Use conventional commits format:

- `feat:` New feature
- `fix:` Bug fix  
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Examples:
```
feat: add Swedish language validation script
fix: update deprecated GitHub Actions to v4
docs: update contributing guidelines for CI
```

## Troubleshooting

### Common Issues

#### ESLint v9 Migration

If you encounter ESLint issues:

1. Ensure `eslint.config.js` uses flat config format
2. Install `@eslint/eslintrc` for compatibility
3. Remove old `.eslintrc.json` if present

#### Swedish Language Validation

If language check fails:

1. Check if term should be in whitelist: `scripts/english-whitelist.sh`
2. Ensure UI strings use Swedish translations
3. Verify Swedish characters (å, ä, ö) are used appropriately

#### Build Cache Issues

If builds are slow despite caching:

1. Check cache hit rate in CI logs
2. Verify cache key includes source file hashes
3. Clear cache if corrupted: delete `.next/cache`

#### API Smoke Tests

The API smoke tests (`npm run api:smoke`) validate connectivity to external services. Common issues:

**OpenAI API Issues:**
- **401 Unauthorized**: Check `OPENAI_API_KEY` is correctly set
- **403 Forbidden**: Verify API key has sufficient permissions
- **Timeout**: OpenAI may be experiencing high load, retry after delay
- **Model not found**: Ensure `OPENAI_MODEL` matches available models (default: gpt-4o-mini)

**Ably API Issues:**
- **401 Unauthorized**: Check `ABLY_SERVER_API_KEY` format (should be `appId.keyId:keySecret`)
- **403 Forbidden**: Verify API key has publish capabilities
- **Channel errors**: Test channel names are auto-generated to avoid conflicts

**Skolverket API Issues:**
- **Network errors**: APIs may be temporarily unavailable
- **CORS issues**: Some endpoints may not support browser-based requests
- **Rate limiting**: Skolverket APIs may have rate limits for public access

**Running individual tests:**
```bash
npm run api:openai     # Test OpenAI only
npm run api:ably       # Test Ably only
npm run api:skolverket # Test Skolverket APIs only
```

**CI Environment:**
- API smoke tests only run with repository secrets (not on forks)
- Tests are designed to fail fast (5-minute timeout)
- Skolverket tests use graceful fallback in limited network environments

### Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions

## Code of Conduct

- Be respectful and inclusive
- Follow Swedish language requirements for UI
- Prioritize accessibility and performance
- Write clean, maintainable code
- Test thoroughly before submitting

Thank you for contributing to Skolapp v3! 🇸🇪