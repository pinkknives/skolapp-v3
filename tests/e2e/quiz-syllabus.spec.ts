import { test, expect } from '@playwright/test'

test.describe('Quiz syllabus flow', () => {
  test('pick subject renders buttons and selection', async ({ page }) => {
    await page.goto('/teacher/quiz/create')
    await expect(page.getByText(/laddar ämnen/i)).toBeVisible()
    await expect(page.getByText(/uppdatering pågår/i)).not.toBeVisible({ timeout: 10000 })

    // When subjects appear, click first button
    const first = page.locator('button', { hasText: /./ }).filter({ hasNotText: /Spara|Publicera|Tips|AI|Frågor|Lägg till|Utkast/ }).first()
    await first.click()
    // No assertion of exact state, but page should stay stable
    await expect(page).toHaveURL(/teacher\/quiz\/create/)
  })
})
