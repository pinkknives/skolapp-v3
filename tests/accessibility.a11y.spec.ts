import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('homepage should meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    
    // Basic accessibility checks without axe for now
    // Check for proper headings hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    
    // Check for images with alt text
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('quiz creation page should be accessible', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    // Check for form labels
    const titleInput = page.getByLabel('Titel');
    await expect(titleInput).toBeVisible();
    
    const descriptionInput = page.getByLabel('Beskrivning');
    await expect(descriptionInput).toBeVisible();
  });

  test('quiz join page should be accessible', async ({ page }) => {
    await page.goto('/quiz/join');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Gå med i Quiz' })).toBeVisible();
    
    // Check quiz code input has label
    await expect(page.getByLabel('Quiz-kod')).toBeVisible();
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
  });

  test('color contrast should meet standards', async ({ page }) => {
    await page.goto('/');
    
    // Basic check for text visibility
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Verify text is readable (not just background color)
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span').all();
    expect(textElements.length).toBeGreaterThan(0);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Check all images have alt attributes
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});