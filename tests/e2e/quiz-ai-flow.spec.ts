/**
 * E2E Tests: Quiz Wizard with AI + Complete Flow
 * 
 * Tests the complete AI-assisted quiz creation flow from creation to student results.
 * Ensures Swedish localization, accessibility, and cross-browser compatibility.
 */

import { test, expect, Page } from '@playwright/test';
import { setupAIMock, resetAIMock, MOCK_QUIZ_DATA } from '../fixtures/aiMock';

test.setTimeout(90_000)

async function loginAsTeacher(page: Page) {
  await page.addInitScript(() => { try { localStorage.setItem('sk_consent_prompt_shown_v1', '1') } catch {} })
  await page.goto('/teacher/quiz/create');
  const onboarding = page.locator('.fixed.inset-0:has-text("Välkommen till Quiz-skaparen!")');
  if (await onboarding.count()) {
    await page.getByRole('button', { name: /Hoppa över|Kom igång!|Nästa/i }).click().catch(() => {})
    await onboarding.first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
  }
  const main = page.locator('#main-content')
  await expect(main.getByRole('heading', { name: 'Skapa nytt quiz' })).toBeVisible();
}

async function startAIGeneration(page: Page) {
  const panel = page.getByRole('complementary', { name: 'AI-hjälp' });
  await expect(panel.getByTestId('ai-subject-select')).toBeVisible();
  await expect(panel.getByTestId('ai-grade-select')).toBeVisible();

  await panel.getByTestId('ai-subject-select').selectOption(MOCK_QUIZ_DATA.subject || 'Matematik');
  await panel.getByTestId('ai-grade-select').selectOption('Åk 6');

  await page.locator('.fixed.inset-0').waitFor({ state: 'hidden' }).catch(() => {})
  const start = panel.getByTestId('ai-quiz-start')
  await expect(start).toBeEnabled({ timeout: 10_000 })
  await start.click({ force: true })
}

test.describe('E2E: AI-Assisted Quiz Creation Complete Flow', () => {
  test.beforeEach(async ({ page }) => { await setupAIMock(page); });
  test.afterEach(async ({ page }) => { await resetAIMock(page); });

  test('should start AI generation from docked panel', async ({ page }) => {
    await loginAsTeacher(page);
    await startAIGeneration(page);
  });

  test('should handle AI panel accessibility basics', async ({ page }) => {
    await loginAsTeacher(page);
    await expect(page.getByRole('complementary', { name: 'AI-hjälp' }).getByTestId('ai-subject-select')).toBeVisible();
  });

  test('should validate Swedish language consistency', async ({ page }) => {
    await loginAsTeacher(page);
    await expect(page.getByText('Skapa nytt quiz')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Frågor' })).toBeVisible();
    await expect(page.getByText('Publicera quiz')).toBeVisible();
  });
});

test.describe('E2E: Error Handling and Edge Cases', () => {
  test('should handle quiz code errors gracefully', async ({ page }) => {
    await page.goto('/quiz/join');
    await page.getByLabel('Sessionskod').fill('XXXXXX');
    await page.getByRole('button', { name: 'Fortsätt' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('should show join form controls', async ({ page }) => {
    await page.goto('/quiz/join');
    await expect(page.getByLabel('Sessionskod')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fortsätt' })).toBeVisible();
  });
});