import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30 * 1000,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'sv-SE',
    timezoneId: 'Europe/Stockholm',
  },

  projects: [
    {
      name: 'chromium-desktop-light',
      use: { 
        ...devices['Desktop Chrome'], 
        colorScheme: 'light', 
        viewport: { width: 1280, height: 800 } 
      },
    },
    {
      name: 'chromium-mobile-light',
      use: { 
        ...devices['iPhone 12'], 
        colorScheme: 'light',
        viewport: { width: 390, height: 844 }
      },
    },
  ],
});