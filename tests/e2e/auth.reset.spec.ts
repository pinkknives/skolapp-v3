import { test, expect } from '@playwright/test'

test.describe('Auth - Reset Password', () => {
  test('submits email and shows generic confirmation', async ({ page }) => {
    await page.goto('/auth/reset-password')

    await expect(page.getByRole('heading', { name: /återställ/i })).toBeVisible()

    await page.getByLabel(/e-post/i).fill('teacher@example.com')
    await page.getByRole('button', { name: /skicka/i }).click()

    await expect(page.locator('body')).toContainText(/om en användare finns|länk|mejl/i)
  })
})
