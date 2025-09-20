# Visual Testing Framework Documentation

## Overview
The visual testing framework provides automated screenshot capture for all pages and core user flows in Skolapp v3. This creates a foundation for visual regression testing and documentation of the UI.

## Setup

### Prerequisites
- Node.js 18+
- Playwright browsers installed: `npx playwright install --with-deps chromium`

### Environment Variables
Copy `.env.local.example` to `.env.local` and configure:

```bash
# Test accounts for visual testing
TEST_TEACHER_EMAIL=teacher@test.skolapp.dev
TEST_TEACHER_PASSWORD=testpassword123
TEST_STUDENT_EMAIL=student@test.skolapp.dev
TEST_STUDENT_PASSWORD=testpassword123

# Base URL for testing
BASE_URL=http://localhost:3000
```

## Running Visual Tests

### Local Development
```bash
# Start the development server
npm run dev

# Run all visual tests
npm run test:visual

# Run desktop only
npm run test:visual:desktop

# Run mobile only
npm run test:visual:mobile

# Run with browser visible for debugging
npm run test:visual:headed
```

### CI/CD
Visual tests run automatically on pull requests via the `visual-snapshots.yml` workflow.

## Test Coverage

### Page Screenshots
The following pages are captured in both desktop (1280×800) and mobile (390×844) viewports:

#### Public Pages
- `/` - Home page
- `/join` - Student join page
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/register` - Registration page
- `/pricing` - Pricing page
- `/quiz/join` - Quiz join alternative
- `/non-existent-page` - 404 error page

#### Protected Pages (captured in unauthenticated state)
- `/quiz/new` - Quiz creation wizard
- `/quiz/take` - Quiz taking interface
- `/teacher` - Teacher dashboard
- `/teacher/quiz` - Teacher quiz management
- `/teacher/quiz/create` - Teacher quiz creation
- `/student` - Student dashboard

### Core Flow Screenshots
- **Teacher Flow**: Quiz creation with basic information input
- **Student Flow**: Quiz joining and code entry
- **Error Handling**: 404 pages, invalid quiz IDs, unauthorized access
- **Wizard Steps**: Quiz creation wizard navigation

## Configuration

### Playwright Configuration
Visual tests use separate Playwright projects:

```typescript
{
  name: 'chromium-desktop-light',
  use: { 
    viewport: { width: 1280, height: 800 },
    colorScheme: 'light' 
  }
},
{
  name: 'chromium-mobile-light',
  use: { 
    viewport: { width: 390, height: 844 },
    colorScheme: 'light'
  }
}
```

### Screenshot Settings
- Format: PNG
- Mode: Full page capture
- Animations: Disabled for consistency
- Wait strategy: Network idle + image loading

## Output

### Local
- Screenshots: `test-results/`
- HTML Report: `playwright-report/`

### CI
Artifacts are uploaded to GitHub Actions:
- `playwright-report` - Interactive HTML report
- `visual-screenshots` - PNG screenshot files
- `test-results` - Test execution results

## Authentication Testing

The framework includes helpers for authenticated flows:

```typescript
import { loginAsTeacher, loginAsStudent } from './helpers/auth';

// Teacher authentication
await loginAsTeacher(page);

// Student authentication  
await loginAsStudent(page);
```

## Future Enhancements

### Visual Regression Testing
Enable baseline comparison with:
```typescript
await expect(page).toHaveScreenshot('page-name.png');
```

### Dark Mode Support
Uncomment dark mode projects in `playwright.config.ts`:
```typescript
{
  name: 'chromium-desktop-dark',
  use: { colorScheme: 'dark' }
}
```

### Additional Viewports
Add tablet or other device testing:
```typescript
{
  name: 'tablet-light',
  use: { 
    viewport: { width: 1024, height: 768 },
    colorScheme: 'light'
  }
}
```

## Troubleshooting

### Browser Installation Issues
If Playwright browser installation fails:
```bash
# Clean install
rm -rf ~/.cache/ms-playwright
npx playwright install --with-deps chromium

# Alternative: Use system browser (less reliable)
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome npx playwright test
```

### Test Failures
1. Check if the application is running on `http://localhost:3000`
2. Verify test accounts exist and are valid
3. Check for recent UI changes that might affect selectors
4. Review trace files in `test-results/` for debugging

### CI Issues
1. Ensure secrets are configured in GitHub repository settings
2. Check browser dependencies are correctly installed in CI
3. Verify application builds and starts correctly
4. Monitor CI timeout settings (default: 10 minutes)

## Development Guidelines

### Adding New Visual Tests
1. Place tests in `tests/visual/`
2. Use descriptive test names in Swedish
3. Include `waitForPageReady()` before screenshots
4. Test both authenticated and unauthenticated states

### Data Test IDs
Add `data-testid` attributes to key interactive elements:
```tsx
<button data-testid="login-submit">Logga in</button>
<input data-testid="quiz-title" />
<button data-testid="open-ai-panel">Öppna AI-panel</button>
```

### Swedish Language Compliance
All tests should verify Swedish language consistency:
- UI labels and buttons
- Error messages
- Help text
- Navigation elements