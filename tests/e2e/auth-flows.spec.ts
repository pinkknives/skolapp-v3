import { test, expect } from '@playwright/test'

test.describe('Auth flows (smoke)', () => {
  test('signup page renders', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: /skapa ditt konto/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /fortsätt med google/i })).toBeVisible()
  })

  test('signin page renders and validates', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.getByRole('heading', { name: /logga in/i })).toBeVisible()
    await page.getByRole('button', { name: /logga in/i }).click()
    await expect(page.getByText(/e-postadress är obligatorisk/i)).toBeVisible()
  })

  test('reset password page reachable', async ({ page }) => {
    await page.goto('/auth/reset-password')
    await expect(page).toHaveURL(/\/auth\/reset-password/)
    await expect(page.getByRole('heading', { name: /återställ lösenord/i })).toBeVisible()
  })
})


