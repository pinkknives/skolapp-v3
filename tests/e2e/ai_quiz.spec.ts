import { test, expect } from '@playwright/test';

test('Skapa AI-quiz end-to-end och spara screenshots', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('sk_consent_prompt_shown_v1', '1') } catch {} })

  // 1) Gå till startsidan
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: 'screenshots/01_home.png', fullPage: true });

  // 2) Navigera till quiz creation page 
  await page.goto('/teacher/quiz/create');
  await page.screenshot({ path: 'screenshots/03_create_page.png', fullPage: true });

  // Dismiss onboarding modal if present
  const onboarding = page.locator('.fixed.inset-0:has-text("Välkommen till Quiz-skaparen!")');
  if (await onboarding.count()) {
    await page.getByRole('button', { name: /Hoppa över|Kom igång!|Nästa/i }).click().catch(() => {})
    await onboarding.first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
  }

  // 3) Använd dockad AI-panel direkt (scope to complementary region)
  const panel = page.getByRole('complementary', { name: 'AI-hjälp' });
  const subject = panel.getByTestId('ai-subject-select');
  const grade = panel.getByTestId('ai-grade-select');
  await expect(subject).toBeVisible({ timeout: 15_000 });
  await expect(grade).toBeVisible({ timeout: 15_000 });
  await subject.selectOption('Matematik');
  await grade.selectOption('Åk 6');

  // Wait for any dynamic loading overlays to disappear
  await page.getByText(/Laddar AI-assistent/i).waitFor({ state: 'detached', timeout: 10000 }).catch(() => {})
  await page.locator('.fixed.inset-0').filter({ hasNotText: /Välkommen till Quiz-skaparen!/ }).waitFor({ state: 'hidden' }).catch(() => {})

  await panel.getByRole('button', { name: /generera/i }).click();
  await page.screenshot({ path: 'screenshots/04_started.png', fullPage: true });

  // 4) Vänta på generering
  const result = page.getByTestId('ai-quiz-result');
  await result.waitFor({ state: 'visible', timeout: 120_000 });
  await page.screenshot({ path: 'screenshots/05_result_visible.png', fullPage: true });

  // 5) Verifiera att minst 1 fråga visas
  const questions = page.locator('[data-testid="ai-quiz-question"]');
  await expect(questions).toHaveCount(1, { timeout: 120_000 }).catch(async () => {
    const count = await questions.count();
    expect(count).toBeGreaterThan(0);
  });

  // 6) Slut-screenshot
  await page.screenshot({ path: 'screenshots/06_done.png', fullPage: true });
});