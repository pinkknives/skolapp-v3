import { test, expect } from '@playwright/test'

test.describe('Live session smoke', () => {
  test('teacher demo page renders controls', async ({ page }) => {
    await page.goto('/demo/live-quiz/teacher')
    await expect(page.locator('body')).toContainText(/Live|Quiz|Starta|Nästa|Pausa/i)
  })

  test('student demo page renders join UI', async ({ page }) => {
    await page.goto('/demo/live-quiz/student')
    await expect(page.locator('body')).toContainText(/PIN|Anslut|Elev/i)
  })
})


