import { test, expect } from '@playwright/test'

// Basic smoke test for AI panel presence and a11y attributes
// Requires NEXT_PUBLIC_FEATURE_QUIZ_AI_DOCKED=true during CI

test('AI panel renders with aria-label and live region on create page', async ({ page }) => {
  await page.goto('/teacher/quiz/create')

  const aside = page.locator('aside[aria-label="AI-hjälp"]')
  await expect(aside).toBeVisible()

  const live = aside.getByTestId('ai-live-region')
  await expect(live).toHaveAttribute('aria-live', 'polite')
})
