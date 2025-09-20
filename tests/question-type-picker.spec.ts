import { expect, test } from '@playwright/test';

test.describe('Question Type Picker', () => {
  test('should display question type buttons with proper accessibility', async ({ page }) => {
    await page.goto('/teacher/quiz/create-wizard');
    
    // Fill required title to enable navigation
    await page.getByRole('textbox', { name: 'Titel*' }).fill('Test Quiz');
    
    // Navigate to step 2
    await page.getByRole('button', { name: 'Nästa' }).click();
    
    // Check question type picker is visible
    await expect(page.getByRole('radiogroup', { name: 'Välj frågetyp' })).toBeVisible();
    
    // Check all three question type buttons exist
    await expect(page.getByTestId('question-type-multiple-choice')).toBeVisible();
    await expect(page.getByTestId('question-type-free-text')).toBeVisible();
    await expect(page.getByTestId('question-type-image')).toBeVisible();
    
    // Check accessibility attributes
    const multipleChoiceButton = page.getByTestId('question-type-multiple-choice');
    await expect(multipleChoiceButton).toHaveAttribute('role', 'button');
    await expect(multipleChoiceButton).toHaveAttribute('aria-label', 'Flerval: Elever väljer bland flera alternativ');
  });

  test('should create questions when clicking question type buttons', async ({ page }) => {
    await page.goto('/teacher/quiz/create-wizard');
    
    // Fill required title and navigate to step 2
    await page.getByRole('textbox', { name: 'Titel*' }).fill('Test Quiz');
    await page.getByRole('button', { name: 'Nästa' }).click();
    
    // Click multiple choice button
    await page.getByTestId('question-type-multiple-choice').click();
    
    // Check question was created
    await expect(page.getByRole('heading', { name: 'Dina frågor (1)' })).toBeVisible();
    await expect(page.getByText('Flerval • 1 poäng')).toBeVisible();
    
    // Click free text button  
    await page.getByTestId('question-type-free-text').click();
    
    // Check second question was created
    await expect(page.getByRole('heading', { name: 'Dina frågor (2)' })).toBeVisible();
    await expect(page.getByText('Fritext • 1 poäng')).toBeVisible();
  });

  test('should show proper selection states', async ({ page }) => {
    await page.goto('/teacher/quiz/create-wizard');
    
    // Fill required title and navigate to step 2
    await page.getByRole('textbox', { name: 'Titel*' }).fill('Test Quiz');
    await page.getByRole('button', { name: 'Nästa' }).click();
    
    const multipleChoiceButton = page.getByTestId('question-type-multiple-choice');
    const freeTextButton = page.getByTestId('question-type-free-text');
    
    // Initially no button should be pressed
    await expect(multipleChoiceButton).not.toHaveAttribute('aria-pressed', 'true');
    await expect(freeTextButton).not.toHaveAttribute('aria-pressed', 'true');
    
    // Click multiple choice button
    await multipleChoiceButton.click();
    
    // Multiple choice should be pressed, others not
    await expect(multipleChoiceButton).toHaveAttribute('aria-pressed', 'true');
    await expect(freeTextButton).not.toHaveAttribute('aria-pressed', 'true');
    
    // Click free text button
    await freeTextButton.click();
    
    // Free text should be pressed
    await expect(freeTextButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/teacher/quiz/create-wizard');
    
    // Fill required title and navigate to step 2
    await page.getByRole('textbox', { name: 'Titel*' }).fill('Test Quiz');
    await page.getByRole('button', { name: 'Nästa' }).click();
    
    const multipleChoiceButton = page.getByTestId('question-type-multiple-choice');
    
    // Focus the button
    await multipleChoiceButton.focus();
    
    // Press Enter to activate
    await page.keyboard.press('Enter');
    
    // Check question was created
    await expect(page.getByRole('heading', { name: 'Dina frågor (1)' })).toBeVisible();
    
    // Test Space key
    const freeTextButton = page.getByTestId('question-type-free-text');
    await freeTextButton.focus();
    await page.keyboard.press(' ');
    
    // Check second question was created
    await expect(page.getByRole('heading', { name: 'Dina frågor (2)' })).toBeVisible();
  });
});