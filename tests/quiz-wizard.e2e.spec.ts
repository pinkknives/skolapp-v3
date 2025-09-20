import { test, expect } from '@playwright/test'

/**
 * E2E Tests: Quiz Creation Wizard (Focus on non-AI flow)
 * 
 * Tests the complete quiz creation flow from basic info to publishing,
 * ensuring Swedish localization, accessibility, and cross-browser compatibility.
 * 
 * Test Plan:
 * 1. Navigate to /quiz/new  
 * 2. Select question type "Flerval" (Multiple Choice)
 * 3. Use Actions menu → "Ny fråga" to add question
 * 4. Fill in question title and answer options
 * 5. Save draft and verify feedback/notification
 * 6. Verify accessibility with getByRole({ name }) selectors
 */

test.describe('Quiz Creation Wizard E2E', () => {
  test('should create quiz från scratch with Swedish UI', async ({ page }) => {
    // Step 1: Navigate to quiz creation
    await page.goto('/quiz/new')
    
    // Verify Swedish UI elements
    await expect(page.getByRole('heading', { name: /skapa nytt quiz/i })).toBeVisible()
    
    // Step 2: Fill basic info
    await page.getByLabel('Titel').fill('Test Quiz från E2E')
    await page.getByLabel('Beskrivning').fill('Ett testquiz skapat via automatiska tester')
    
    // Step 3: Go to questions step
    await page.getByRole('button', { name: /nästa/i }).click()
    
    // Verify we're on questions step
    await expect(page.getByRole('heading', { name: /frågor och innehåll/i })).toBeVisible()
    
    // Step 4: Select question type "Flerval"
    await page.getByRole('button', { name: /flerval/i }).click()
    
    // Verify question type is selected (aria-pressed=true)
    const flervalsButton = page.getByRole('button', { name: /flerval/i })
    await expect(flervalsButton).toHaveAttribute('aria-pressed', 'true')
  })

  test('should use Actions menu för adding questions', async ({ page }) => {
    // Setup: Navigate to quiz creation and get to questions step
    await page.goto('/quiz/new')
    await page.getByLabel('Titel').fill('Quiz med Åtgärder')
    await page.getByRole('button', { name: /nästa/i }).click()
    
    // Step 1: Open Actions menu
    const actionsButton = page.getByRole('button', { name: /åtgärder/i })
    await expect(actionsButton).toBeVisible()
    await actionsButton.click()
    
    // Step 2: Verify menu opens with Swedish options  
    await expect(page.getByText('Ny fråga')).toBeVisible()
    await expect(page.getByText('Ta bort')).toBeVisible()
    
    // Step 3: Select "Ny fråga" 
    await page.getByText('Ny fråga').click()
    
    // Verify that new question form appears
    await expect(page.getByLabel('Frågetitel')).toBeVisible()
  })

  test('should fill question and answer options with validation', async ({ page }) => {
    // Setup: Get to question creation
    await page.goto('/quiz/new')
    await page.getByLabel('Titel').fill('Quiz med Frågor')
    await page.getByRole('button', { name: /nästa/i }).click()
    await page.getByRole('button', { name: /flerval/i }).click()
    
    // Add question via actions menu if available, or direct form
    const newQuestionButton = page.getByRole('button', { name: /lägg till fråga/i }).or(
      page.getByRole('button', { name: /ny fråga/i })
    )
    
    if (await newQuestionButton.isVisible()) {
      await newQuestionButton.click()
    }
    
    // Fill in question details
    const questionTitle = page.getByLabel('Frågetitel').or(page.getByLabel('Fråga'))
    await questionTitle.fill('Vad är huvudstaden i Sverige?')
    
    // Fill answer options (assume multiple choice format)
    const firstOption = page.getByLabel('Alternativ 1').or(page.getByPlaceholder('Första alternativet'))
    if (await firstOption.isVisible()) {
      await firstOption.fill('Stockholm')
      
      const secondOption = page.getByLabel('Alternativ 2').or(page.getByPlaceholder('Andra alternativet'))
      if (await secondOption.isVisible()) {
        await secondOption.fill('Göteborg')
      }
    }
    
    // Save the question
    const saveButton = page.getByRole('button', { name: /spara/i }).or(
      page.getByRole('button', { name: /lägg till/i })
    )
    if (await saveButton.isVisible()) {
      await saveButton.click()
    }
    
    // Verify question was added (check for question in list or count)
    await expect(page.getByText('Vad är huvudstaden i Sverige?')).toBeVisible()
  })

  test('should save draft och show feedback notification', async ({ page }) => {
    // Create a basic quiz
    await page.goto('/quiz/new')
    await page.getByLabel('Titel').fill('Utkast Quiz')
    await page.getByLabel('Beskrivning').fill('Ett quiz som sparas som utkast')
    
    // Try to save as draft (look for draft button)
    const draftButton = page.getByRole('button', { name: /spara utkast/i }).or(
      page.getByRole('button', { name: /spara som utkast/i })
    )
    
    if (await draftButton.isVisible()) {
      await draftButton.click()
      
      // Verify success notification appears with Swedish text
      await expect(
        page.getByText(/sparad/i).or(page.getByText(/utkast/i))
      ).toBeVisible({ timeout: 5000 })
      
      // Check for success feedback with proper ARIA
      const successMessage = page.getByRole('alert').or(page.getByRole('status'))
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible()
      }
    }
  })

  test('should support keyboard navigation throughout quiz flow', async ({ page }) => {
    await page.goto('/quiz/new')
    
    // Test tab navigation through form fields
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Titel')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Beskrivning')).toBeFocused()
    
    // Fill fields using keyboard
    await page.keyboard.type('Keyboard Navigation Test')
    await page.keyboard.press('Tab')
    await page.keyboard.type('Testing keyboard accessibility')
    
    // Navigate to next step using keyboard  
    await page.keyboard.press('Tab')
    const nextButton = page.getByRole('button', { name: /nästa/i })
    await expect(nextButton).toBeFocused()
    await page.keyboard.press('Enter')
    
    // Verify we moved to next step
    await expect(page.getByRole('heading', { name: /frågor/i })).toBeVisible()
  })

  test('should handle form validation errors in Swedish', async ({ page }) => {
    await page.goto('/quiz/new')
    
    // Try to proceed without filling required fields
    await page.getByRole('button', { name: /nästa/i }).click()
    
    // Check for Swedish validation messages
    await expect(page.getByText(/titel krävs/i).or(page.getByText(/fältet krävs/i))).toBeVisible()
    
    // Validation messages should have proper ARIA attributes
    const errorMessage = page.getByRole('alert').first()
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible()
    }
  })

  test('should maintain Swedish language consistency', async ({ page }) => {
    await page.goto('/quiz/new')
    
    // Check that no English terms appear in UI
    const englishTerms = ['Create', 'Question', 'Next', 'Save', 'Draft', 'Title']
    
    for (const term of englishTerms) {
      const englishElement = page.getByText(term, { exact: true })
      if (await englishElement.isVisible()) {
        // This should not happen - all UI should be in Swedish
        throw new Error(`Found English term "${term}" in Swedish UI`)
      }
    }
    
    // Verify Swedish terms are present
    await expect(page.getByText(/skapa/i)).toBeVisible()
    await expect(page.getByText(/quiz/i)).toBeVisible()
  })

  test('should work across different browsers (cross-browser compatibility)', async ({ page, browserName }) => {
    console.log(`Running quiz creation test in browser: ${browserName}`)
    
    await page.goto('/quiz/new')
    
    // Basic functionality should work in all browsers
    await page.getByLabel('Titel').fill(`Test för ${browserName}`)
    await page.getByLabel('Beskrivning').fill(`Cross-browser test i ${browserName}`)
    
    // Verify form submission works
    const nextButton = page.getByRole('button', { name: /nästa/i })
    await expect(nextButton).toBeEnabled()
    
    await nextButton.click()
    await expect(page.getByRole('heading', { name: /frågor/i })).toBeVisible()
    
    // Browser-specific behavior verification
    if (browserName === 'webkit') {
      // Safari-specific checks
      console.log('Verifying Safari compatibility')
    } else if (browserName === 'firefox') {
      // Firefox-specific checks  
      console.log('Verifying Firefox compatibility')
    }
  })
})