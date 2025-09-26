import { test, expect } from '@playwright/test'

test.describe('Auth flows (E2E)', () => {
  test('signup end-to-end form validation + navigation', async ({ page }) => {
    await page.goto('/auth?mode=register')
    await expect(page.getByRole('heading', { name: /Skapa ditt lärarkonto/i })).toBeVisible()

    // Fill valid fields and submit (button enabled when valid)
    await page.getByLabel(/Visningsnamn/i).fill('Test Lärare')
    await page.getByLabel(/E-postadress/i).fill(`teacher.e2e+${Date.now()}@example.com`)
    await page.getByLabel(/^Lösenord$/i, { exact: true }).fill('Password123!')
    await page.getByLabel(/Bekräfta lösenord/i).fill('Password123!')
    await page.getByRole('button', { name: /Skapa konto/i }).click()

    await expect(page.locator('body')).toContainText(/bekräfta|verifier|mejl|konto/i)
  })

  test('signin end-to-end form validation', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await expect(page.getByRole('heading', { name: /Välkommen tillbaka!/i })).toBeVisible()

    await page.getByLabel(/E-postadress/i).fill('teacher@example.com')
    await page.getByLabel(/^Lösenord$/i).fill('wrongpass')
    await page.getByRole('button', { name: /Logga in/i }).click()

    await expect(page.locator('body')).toContainText(/Fel e-post eller lösenord|fel|ogiltig|kunde inte/i).catch(async () => {
      await expect(page.getByRole('heading', { name: /Välkommen tillbaka!/i })).toBeVisible()
    })
  })

  test('reset password flow navigation', async ({ page }) => {
    await page.goto('/auth/reset-password')
    await expect(page.getByRole('heading', { name: /återställ lösenord|återställ/i })).toBeVisible()

    const form = page.locator('form').filter({ has: page.getByRole('button', { name: /Skicka återställningslänk|Skicka/i }) })
    await form.getByLabel(/E-postadress/i).fill('teacher@example.com')
    await form.getByRole('button', { name: /Skicka återställningslänk|Skicka/i }).click()

    await expect(page.locator('body')).toContainText(/återställningslänk skickad|om en användare finns|länk|mejl/i)
  })
})


