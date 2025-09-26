import { test, expect } from '@playwright/test'

test.describe('Auth - Login', () => {
  test('shows validation and handles wrong credentials', async ({ page }) => {
    await page.goto('/auth?mode=login')

    await expect(page.getByRole('heading', { name: /logga in/i })).toBeVisible()

    await page.getByRole('button', { name: /logga in/i }).click()
    await expect(page.locator('body')).toContainText(/e-post/i)

    await page.getByLabel(/e-post/i).fill('teacher@example.com')
    await page.getByLabel(/lösenord/i).fill('fel-lösen')
    await page.getByRole('button', { name: /logga in/i }).click()

    await expect(page.locator('body')).toContainText(/fel|ogiltig|kunde inte/i)
  })
})
