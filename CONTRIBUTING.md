# Contributing to Skolapp v3

Welcome to Skolapp v3! This guide will help you understand our development workflow and ensure your contributions align with our standards.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Quality Standards](#code-quality-standards)
- [Language Requirements](#language-requirements)
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