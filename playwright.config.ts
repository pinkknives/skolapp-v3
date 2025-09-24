import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Global timeout for all tests (5 minutes for CI stability)
  globalTimeout: process.env.CI ? 5 * 60 * 1000 : undefined,
  // Per-test timeout (30 seconds for individual tests, longer for AI tests)
  timeout: 30 * 1000,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'on',
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
    // Respect reduced motion for accessibility testing
    reducedMotion: 'reduce',
    // Set Swedish locale for testing
    locale: 'sv-SE',
    timezoneId: 'Europe/Stockholm',
  },

  projects: [
    // Core desktop browsers for critical flows
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.(e2e|spec)\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.(e2e|spec)\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.(e2e|spec)\.ts/,
    },

    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet devices
    {
      name: 'tablet-chrome',
      use: { ...devices['iPad Pro'] },
    },

    // Accessibility testing
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable accessibility tree in tests
        launchOptions: {
          args: ['--force-renderer-accessibility']
        }
      },
      testMatch: /.*\.a11y\.spec\.ts/,
    },

    // Performance testing
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable performance metrics
        launchOptions: {
          args: ['--enable-precise-memory-info']
        }
      },
      testMatch: /.*\.perf\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  outputDir: 'test-results',
});