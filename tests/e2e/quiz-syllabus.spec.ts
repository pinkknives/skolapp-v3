import { test, expect } from '@playwright/test'

test.describe('Quiz syllabus flow', () => {
  test.skip('pick subject renders buttons and selection', async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.setItem('sk_consent_prompt_shown_v1', '1') } catch {}
    })
    await page.goto('/teacher/quiz/create')

    // Loading appears then disappears
    await expect(page.getByText(/laddar ämnen/i)).toBeVisible()
    await expect(page.getByText(/laddar ämnen/i)).not.toBeVisible({ timeout: 10000 })

    const onboarding = page.locator('.fixed.inset-0:has-text("Välkommen till Quiz-skaparen!")')
    if (await onboarding.count()) {
      await page.getByRole('button', { name: /Hoppa över|Kom igång!|Nästa/i }).click().catch(() => {})
      await onboarding.first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
    }

    await page.locator('.fixed.inset-0').waitFor({ state: 'hidden' }).catch(() => {})
  })
})
