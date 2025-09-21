import { test, expect, Locator } from '@playwright/test';

// Extend expect with custom matcher
expect.extend({
  async toHaveCountGreaterThan(locator: Locator, expected: number) {
    const count = await locator.count();
    const pass = count > expected;
    return {
      pass,
      message: () => `Expected count > ${expected}, received ${count}`,
    };
  },
});

test('Skapa AI-quiz end-to-end och spara screenshots', async ({ page }) => {
  const base = process.env.BASE_URL!;
  expect(base, 'BASE_URL måste vara satt via secret eller input').toBeTruthy();

  // 1) Gå till appen
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: 'screenshots/01_home.png', fullPage: true });

  // 2) Logga in om login finns (valfritt block)
  if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
    const hasLogin = await page.locator('[data-testid="login-email"]').first().count().catch(() => 0);
    if (hasLogin) {
      await page.fill('[data-testid="login-email"]', process.env.TEST_USER_EMAIL!);
      await page.fill('[data-testid="login-password"]', process.env.TEST_USER_PASSWORD!);
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/02_logged_in.png', fullPage: true });
    }
  }

  // 3) Navigera till AI-quiz
  // Om det finns en tydlig länk/knapp dit, klicka den; annars antas startknapp finnas på sidan.
  // Lägg data-testid i UI:t: ai-quiz-start, ai-quiz-status, ai-quiz-result, ai-quiz-question
  await expect(page.locator('[data-testid="ai-quiz-start"]')).toBeVisible({ timeout: 15_000 });

  // 4) Starta AI-quiz
  await page.click('[data-testid="ai-quiz-start"]');
  await page.screenshot({ path: 'screenshots/03_started.png', fullPage: true });

  // 5) Vänta på generering (pollar statusindikator eller spinner/text)
  const status = page.locator('[data-testid="ai-quiz-status"]');
  await expect(status).toBeVisible({ timeout: 60_000 }).catch(() => {}); // ok om saknas
  // Vänta som mest 2 min på resultat
  const result = page.locator('[data-testid="ai-quiz-result"]');
  await result.waitFor({ state: 'visible', timeout: 120_000 });
  await page.screenshot({ path: 'screenshots/04_result_visible.png', fullPage: true });

  // 6) Verifiera att minst 1 fråga visas
  const questions = page.locator('[data-testid="ai-quiz-question"]');
  await expect(questions).toHaveCountGreaterThan(0);
  const count = await questions.count();
  console.log(`Hittade ${count} AI-genererade frågor`);

  // 7) Extra assert: textinnehåll på första frågan
  const firstQ = (await questions.first().textContent())?.trim() || '';
  expect(firstQ.length).toBeGreaterThan(5);

  // 8) Slut-screenshot
  await page.screenshot({ path: 'screenshots/05_done.png', fullPage: true });
});