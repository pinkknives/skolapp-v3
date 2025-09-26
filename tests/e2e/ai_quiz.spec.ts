import { test, expect } from '@playwright/test'
import { setupAIMock, resetAIMock } from '../fixtures/aiMock'

test.setTimeout(60_000)

test.beforeEach(async ({ page }) => {
  await setupAIMock(page)
})

test.afterEach(async ({ page }) => {
  await resetAIMock(page)
})

test('Skapa AI-quiz end-to-end och spara screenshots', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('sk_consent_prompt_shown_v1', '1') } catch {} })

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: 'screenshots/01_home.png', fullPage: true });

  await page.goto('/teacher/quiz/create');
  await page.screenshot({ path: 'screenshots/03_create_page.png', fullPage: true });

  const onboarding = page.locator('.fixed.inset-0:has-text("Välkommen till Quiz-skaparen!")');
  if (await onboarding.count()) {
    await page.getByRole('button', { name: /Hoppa över|Kom igång!|Nästa/i }).click().catch(() => {})
    await onboarding.first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
  }

  const panel = page.getByRole('complementary', { name: 'AI-hjälp' });
  const subject = panel.getByTestId('ai-subject-select');
  const grade = panel.getByTestId('ai-grade-select');
  await expect(subject).toBeVisible({ timeout: 15_000 });
  await expect(grade).toBeVisible({ timeout: 15_000 });
  await subject.selectOption('Matematik');
  await grade.selectOption('Åk 6');

  const countInput = page.getByRole('spinbutton');
  if (await countInput.count()) {
    await countInput.first().fill('5');
  }

  await page.locator('.fixed.inset-0').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

  const startBtn = panel.getByTestId('ai-quiz-start');
  await expect(startBtn).toBeEnabled({ timeout: 10_000 });
  await startBtn.click({ force: true });
  await page.screenshot({ path: 'screenshots/04_started.png', fullPage: true });
});