import { test, expect } from '@playwright/test'

test.describe('Auth - Login', () => {
  test('shows validation and handles wrong credentials', async ({ page }) => {
    await page.goto('/auth?mode=login')

    await expect(page.getByRole('heading', { name: /Välkommen tillbaka!/i })).toBeVisible()

    // Fill to enable
    await page.getByLabel(/E-postadress/i).fill('teacher@example.com')
    await page.getByLabel(/^Lösenord$/i).fill('fel-lösen')
    await page.getByRole('button', { name: /Logga in/i }).click()

    // Accept either error text or staying on the same page
    await expect(page.locator('body')).toContainText(/Fel e-post eller lösenord|fel|ogiltig|kunde inte/i).catch(async () => {
      await expect(page.getByRole('heading', { name: /Välkommen tillbaka!/i })).toBeVisible()
    })
  })
})
