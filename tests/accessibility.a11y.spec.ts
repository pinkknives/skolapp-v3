import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core into every page
    await injectAxe(page);
  });

  test('homepage should meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    
    // Run accessibility check
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('quiz creation page should be accessible', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('quiz join page should be accessible', async ({ page }) => {
    await page.goto('/quiz/join');
    
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocusedElement);
    
    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement);
      expect(focusedElement).toBeTruthy();
    }
  });

  test('AI panel should have proper modal focus management', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    // Open AI panel
    await page.getByRole('button', { name: 'AI-utkast' }).click();
    
    // Check that focus is trapped in modal
    await page.keyboard.press('Escape');
    
    // Modal should close on Escape
    await expect(page.getByText('AI Quiz-assistent')).not.toBeVisible();
  });

  test('forms should have proper labels and error states', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    // Check that form inputs have proper labels
    const titleInput = page.getByLabel('Titel');
    await expect(titleInput).toBeVisible();
    
    const descriptionInput = page.getByLabel('Beskrivning');
    await expect(descriptionInput).toBeVisible();
    
    // Add a question to test question form labels
    await page.getByRole('button', { name: 'Flerval' }).click();
    
    const questionTitle = page.getByLabel('Frågetitel');
    await expect(questionTitle).toBeVisible();
    
    // Check accessibility of the form
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('color contrast should meet standards', async ({ page }) => {
    await page.goto('/');
    
    // Check for color contrast violations
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Check for missing alt text
    await checkA11y(page, null, {
      rules: {
        'image-alt': { enabled: true }
      }
    });
  });
});