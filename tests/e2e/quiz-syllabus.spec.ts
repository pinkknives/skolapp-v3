import { test, expect } from '@playwright/test'

test.describe('Quiz syllabus flow', () => {
  test('pick subject renders buttons and selection', async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.setItem('sk_consent_prompt_shown_v1', '1') } catch {}
    })
    await page.goto('/teacher/quiz/create')
    await expect(page.getByText(/laddar ämnen/i)).toBeVisible()
    await expect(page.getByText(/uppdatering pågår/i)).not.toBeVisible({ timeout: 10000 })

    // Dismiss onboarding if present
    const onboarding = page.locator('.fixed.inset-0:has-text("Välkommen till Quiz-skaparen!")')
    if (await onboarding.count()) {
      await page.getByRole('button', { name: /Hoppa över|Kom igång!|Nästa/i }).click().catch(() => {})
      // Try to close fully by clicking until overlay gone
      await onboarding.first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
    }

    // Ensure no modal overlay blocks clicks
    await page.locator('.fixed.inset-0').filter({ hasText: 'AI' }).waitFor({ state: 'hidden' }).catch(() => {})

    // Click the first subject-like button in syllabus widget area
    const first = page.locator('button').filter({ hasText: /./ }).filter({ hasNotText: /Spara|Publicera|Tips|AI|Frågor|Lägg till|Utkast|Tema|Stäng/i }).first()
    await first.click()
    await expect(page).toHaveURL(/teacher\/quiz\/create/)
  })
})
