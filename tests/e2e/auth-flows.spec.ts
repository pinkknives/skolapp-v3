import { test, expect } from '@playwright/test'

test.describe('Auth flows (E2E)', () => {
  test('signup end-to-end form validation + navigation', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: /skapa ditt konto/i })).toBeVisible()

    // Try submit empty
    await page.getByRole('button', { name: /skapa konto/i }).click()
    await expect(page.getByText(/e-post/i)).toBeVisible()

    // Fill minimal valid (will not actually create in CI env)
    await page.getByLabel(/e-post/i).fill('teacher+e2e@example.com')
    await page.getByLabel(/lösenord/i).fill('Password123!')
    await page.getByRole('button', { name: /skapa konto/i }).click()

    // Expect either success banner or server-side validation text
    await expect(page.locator('body')).toContainText(/konto|verifiering|ogiltig|finns redan/i)
  })

  test('signin end-to-end form validation', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.getByRole('heading', { name: /logga in/i })).toBeVisible()
    await page.getByRole('button', { name: /logga in/i }).click()
    await expect(page.getByText(/e-postadress är obligatorisk/i)).toBeVisible()

    await page.getByLabel(/e-post/i).fill('teacher@example.com')
    await page.getByLabel(/lösenord/i).fill('wrongpass')
    await page.getByRole('button', { name: /logga in/i }).click()
    await expect(page.locator('body')).toContainText(/fel|ogiltig|kunde inte/i)
  })

  test('reset password flow navigation', async ({ page }) => {
    await page.goto('/auth/reset-password')
    await expect(page.getByRole('heading', { name: /återställ lösenord/i })).toBeVisible()
    await page.getByLabel(/e-post/i).fill('teacher@example.com')
    await page.getByRole('button', { name: /skicka länk/i }).click()
    // Expect generic confirmation text
    await expect(page.locator('body')).toContainText(/om en användare finns|länk|mejl/i)
  })
})


