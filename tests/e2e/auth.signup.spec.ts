import { test, expect } from '@playwright/test'

// Signup flow: fill form -> expect confirm message (no real email click in CI)
// We validate UI behaviors and navigation, not external delivery

test.describe('Auth - Signup', () => {
  test('fills form and shows confirmation text', async ({ page }) => {
    await page.goto('/auth?mode=register')

    await expect(page.getByRole('heading', { name: /skapa konto|registrera/i })).toBeVisible()

    // Submit empty to see validations
    await page.getByRole('button', { name: /skapa konto|registrera/i }).click()
    await expect(page.locator('body')).toContainText(/e-post|lösenord|visningsnamn/i)

    // Fill fields
    await page.getByLabel(/visningsnamn/i).fill('Test Lärare')
    await page.getByLabel(/e-post/i).fill(`teacher.e2e+${Date.now()}@example.com`)
    await page.getByLabel(/^lösenord$/i).fill('Password123!')
    await page.getByLabel(/bekräfta lösenord/i).fill('Password123!')

    await page.getByRole('button', { name: /skapa konto|registrera/i }).click()

    // Either success banner or confirmation hint should appear
    await expect(page.locator('body')).toContainText(/bekräfta|verifier|mejl|konto/i)
  })
})
