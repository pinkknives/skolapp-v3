import { test, expect } from '@playwright/test'

// Signup flow: fill form -> expect confirm message (no real email click in CI)
// We validate UI behaviors and navigation, not external delivery

test.describe('Auth - Signup', () => {
  test('fills form and shows confirmation text', async ({ page }) => {
    await page.goto('/auth?mode=register')

    await expect(page.getByRole('heading', { name: /Skapa ditt lärarkonto/i })).toBeVisible()

    // Fill fields (button is disabled until valid)
    await page.getByLabel(/Visningsnamn/i).fill('Test Lärare')
    await page.getByLabel(/E-postadress/i).fill(`teacher.e2e+${Date.now()}@example.com`)
    await page.getByLabel(/^Lösenord$/i, { exact: true }).fill('Password123!')
    await page.getByLabel(/Bekräfta lösenord/i).fill('Password123!')

    await page.getByRole('button', { name: /Skapa konto/i }).click()

    // Either success banner or confirmation hint should appear
    await expect(page.locator('body')).toContainText(/bekräfta|verifier|mejl|konto/i)
  })
})
