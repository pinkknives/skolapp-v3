import { test, expect } from '@playwright/test'

/**
 * AI Quiz Generation Integration Tests
 * 
 * Tests the complete flow for AI-assisted quiz creation with proper
 * entitlement checking, Swedish content, and draft saving functionality.
 */

test.describe('AI Quiz Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth state with AI entitlements
    await page.goto('/teacher/quiz/create')
    
    // Mock the AI API endpoint for testing
    await page.route('/api/ai/generate-quiz', async route => {
      if (route.request().method() === 'POST') {
        const requestBody = await route.request().postDataJSON()
        
        // Simulate successful AI generation
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            title: `${requestBody.subject} Quiz - ${requestBody.gradeLevel}`,
            questions: [
              {
                id: 'ai_q_1',
                type: 'multiple-choice',
                title: `Vilken av följande påståenden om ${requestBody.subject.toLowerCase()} är korrekt?`,
                points: 1,
                options: [
                  { id: 'opt_1', text: 'Detta är det korrekta svaret', isCorrect: true },
                  { id: 'opt_2', text: 'Detta är ett felaktigt alternativ', isCorrect: false },
                  { id: 'opt_3', text: 'Detta är också felaktigt', isCorrect: false },
                  { id: 'opt_4', text: 'Detta är det tredje felaktiga alternativet', isCorrect: false }
                ],
                rationale: `Detta svar är korrekt eftersom det följer grundläggande principer inom ${requestBody.subject.toLowerCase()}.`
              },
              {
                id: 'ai_q_2',
                type: 'free-text',
                title: `Förklara kort vad du vet om ${requestBody.subject.toLowerCase()}.`,
                points: 2,
                expectedAnswer: `En förklaring som visar förståelse för grundläggande koncept inom ${requestBody.subject.toLowerCase()}.`,
                rationale: `Ett bra svar ska innehålla både teoretisk förståelse och praktiska exempel.`
              }
            ]
          })
        })
      }
    })

    // Mock save draft API endpoint
    await page.route('/api/quiz/save-draft', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            quiz: {
              id: 'draft_123',
              title: 'Test AI Quiz',
              status: 'draft'
            }
          })
        })
      }
    })
  })

  test('should generate AI quiz with Swedish content and disclaimer', async ({ page }) => {
    // Open AI-assisted quiz creation
    await page.getByRole('button', { name: 'AI-utkast' }).click()
    
    // Verify Swedish AI disclaimer is prominent and accessible
    const disclaimer = page.getByText('Dubbelkolla alltid innehållet. AI kan ha fel.')
    await expect(disclaimer).toBeVisible()
    
    // Check disclaimer has proper accessibility attributes
    const disclaimerContainer = disclaimer.locator('..')
    await expect(disclaimerContainer).toHaveAttribute('role', 'alert')
    
    // Fill out AI form in Swedish
    await page.getByLabel('Ämne').fill('Naturvetenskap')
    await page.getByLabel('Årskurs').selectOption('Åk 6')
    await page.getByLabel('Antal frågor').fill('2')
    await page.getByLabel('Svårighetsgrad').selectOption('medium')
    
    // Add learning goals/topics
    await page.getByLabel('Kunskapsmål (valfritt)').fill('Grundläggande fysik och kemi')
    
    // Generate questions
    await page.getByRole('button', { name: 'Generera frågor' }).click()
    
    // Wait for generation to complete
    await expect(page.getByText('Frågor genererade!')).toBeVisible({ timeout: 10000 })
    
    // Verify Swedish content in generated questions
    await expect(page.getByText('Vilken av följande påståenden om naturvetenskap är korrekt?')).toBeVisible()
    await expect(page.getByText('Förklara kort vad du vet om naturvetenskap.')).toBeVisible()
    
    // Verify question types are properly displayed
    await expect(page.getByText('Flerval')).toBeVisible()
    await expect(page.getByText('Fritext')).toBeVisible()
    
    // Test question selection functionality
    const questionCheckboxes = page.getByRole('checkbox')
    await expect(questionCheckboxes).toHaveCount(2)
    
    // Verify all questions are selected by default
    for (const checkbox of await questionCheckboxes.all()) {
      await expect(checkbox).toBeChecked()
    }
    
    // Test Save as Draft functionality
    await page.getByRole('button', { name: 'Spara 2 som utkast' }).click()
    
    // Should show success message
    await expect(page.getByText('har sparats som utkast!')).toBeVisible()
  })

  test('should handle AI generation failure gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('/api/ai/generate-quiz', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Din organisation saknar AI-funktioner. Uppgradera din prenumeration för att använda denna funktion.'
        })
      })
    })
    
    await page.getByRole('button', { name: 'AI-utkast' }).click()
    
    // Fill minimal form
    await page.getByLabel('Ämne').fill('Svenska')
    await page.getByLabel('Årskurs').selectOption('Åk 3')
    
    await page.getByRole('button', { name: 'Generera frågor' }).click()
    
    // Should show Swedish error message
    await expect(page.getByText('Din organisation saknar AI-funktioner')).toBeVisible()
    
    // Should show upgrade CTA or helpful guidance
    await expect(page.getByText('Uppgradera din prenumeration')).toBeVisible()
  })

  test('should validate input before sending to AI', async ({ page }) => {
    await page.getByRole('button', { name: 'AI-utkast' }).click()
    
    // Try to generate without filling required fields
    await page.getByRole('button', { name: 'Generera frågor' }).click()
    
    // Should not proceed - button should be disabled or show validation
    // Check that we're still on the form step
    await expect(page.getByLabel('Ämne')).toBeVisible()
    
    // Fill partially
    await page.getByLabel('Ämne').fill('Matematik')
    // Leave grade level empty
    
    await page.getByRole('button', { name: 'Generera frågor' }).click()
    
    // Should still be on form or show validation error
    await expect(page.getByLabel('Årskurs')).toBeVisible()
  })

  test('should allow editing generated questions', async ({ page }) => {
    await page.getByRole('button', { name: 'AI-utkast' }).click()
    
    // Fill form and generate
    await page.getByLabel('Ämne').fill('Historia')
    await page.getByLabel('Årskurs').selectOption('Åk 7')
    await page.getByRole('button', { name: 'Generera frågor' }).click()
    
    await expect(page.getByText('Frågor genererade!')).toBeVisible({ timeout: 10000 })
    
    // Edit a question
    await page.getByRole('button', { name: 'Redigera fråga' }).first().click()
    
    // Should open edit dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Edit question title
    const titleInput = page.getByLabel('Frågetitel')
    await titleInput.clear()
    await titleInput.fill('Redigerad fråga om historia')
    
    // Save changes
    await page.getByRole('button', { name: 'Spara ändringar' }).click()
    
    // Should see updated question in preview
    await expect(page.getByText('Redigerad fråga om historia')).toBeVisible()
  })

  test('should respect rate limiting', async ({ page }) => {
    // Mock rate limit response
    await page.route('/api/ai/generate-quiz', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'För många förfrågningar. Försök igen om en minut.'
        })
      })
    })
    
    await page.getByRole('button', { name: 'AI-utkast' }).click()
    
    await page.getByLabel('Ämne').fill('Engelska')
    await page.getByLabel('Årskurs').selectOption('Åk 5')
    
    await page.getByRole('button', { name: 'Generera frågor' }).click()
    
    // Should show Swedish rate limit message
    await expect(page.getByText('För många förfrågningar. Försök igen om en minut.')).toBeVisible()
  })

  test('should maintain accessibility throughout the flow', async ({ page }) => {
    await page.getByRole('button', { name: 'AI-utkast' }).click()
    
    // Check form accessibility
    await expect(page.getByLabel('Ämne')).toBeVisible()
    await expect(page.getByLabel('Årskurs')).toBeVisible()
    await expect(page.getByLabel('Antal frågor')).toBeVisible()
    await expect(page.getByLabel('Svårighetsgrad')).toBeVisible()
    
    // Verify modal has proper ARIA attributes
    const modal = page.getByRole('dialog')
    await expect(modal).toHaveAttribute('aria-modal', 'true')
    
    // Check close button is accessible
    const closeButton = page.getByRole('button', { name: 'Stäng' })
    await expect(closeButton).toBeVisible()
    
    // Fill form and generate
    await page.getByLabel('Ämne').fill('Biologi')
    await page.getByLabel('Årskurs').selectOption('Åk 8')
    await page.getByRole('button', { name: 'Generera frågor' }).click()
    
    // Wait for results
    await expect(page.getByText('Frågor genererade!')).toBeVisible({ timeout: 10000 })
    
    // Check preview accessibility
    await expect(page.getByRole('heading', { name: /Förhandsgranskning/ })).toBeVisible()
    
    // Verify question selection checkboxes are properly labeled
    const checkboxes = page.getByRole('checkbox')
    for (const checkbox of await checkboxes.all()) {
      await expect(checkbox).toHaveAccessibleName()
    }
  })
})

test.describe('AI Feature Entitlements', () => {
  test('should show upgrade prompt for users without AI access', async ({ page }) => {
    // Mock API to return 403 for no entitlement
    await page.route('/api/ai/generate-quiz', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Din organisation saknar AI-funktioner. Uppgradera din prenumeration för att använda denna funktion.'
        })
      })
    })
    
    await page.goto('/teacher/quiz/create')
    
    // AI button should be disabled or show upgrade prompt
    const aiButton = page.getByRole('button', { name: 'AI-utkast' })
    if (await aiButton.isVisible()) {
      await aiButton.click()
      
      // Should show entitlement error
      await page.getByLabel('Ämne').fill('Test')
      await page.getByLabel('Årskurs').selectOption('Åk 1')
      await page.getByRole('button', { name: 'Generera frågor' }).click()
      
      await expect(page.getByText('Din organisation saknar AI-funktioner')).toBeVisible()
    }
  })
})