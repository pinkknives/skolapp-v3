import { test, expect } from '@playwright/test'

test.describe('Library page', () => {
  test('renders and lists items empty state or content', async ({ page }) => {
    await page.goto('/teacher/library')
    await expect(page.getByRole('heading', { name: /bibliotek/i })).toBeVisible()
    await expect(page.locator('body')).toContainText(/Mallar|Inga mallar ännu|Sök/i)
  })
})


