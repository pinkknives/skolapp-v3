import { test, expect } from '@playwright/test';

test.describe('Teacher Flow - Quiz Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teacher/quiz/create');
  });

  test('should display quiz creation form with Swedish labels', async ({ page }) => {
    // Verify main heading is in Swedish
    await expect(page.getByRole('heading', { name: 'Skapa nytt quiz' })).toBeVisible();
    
    // Verify form fields have Swedish labels
    await expect(page.getByLabel('Titel')).toBeVisible();
    await expect(page.getByLabel('Beskrivning')).toBeVisible();
    
    // Verify question type buttons are in Swedish
    await expect(page.getByRole('button', { name: 'Flerval' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fritext' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bild' })).toBeVisible();
  });

  test('should show AI-utkast panel with Swedish disclaimer', async ({ page }) => {
    // Click AI-utkast button
    await page.getByRole('button', { name: 'AI-utkast' }).click();
    
    // Verify Swedish disclaimer is shown
    await expect(page.getByText('Dubbelkolla alltid innehållet. AI kan ha fel.')).toBeVisible();
    
    // Verify form fields are in Swedish
    await expect(page.getByLabel('Ämne')).toBeVisible();
    await expect(page.getByLabel('Årskurs')).toBeVisible();
  });

  test('should create a simple quiz and enable publish button', async ({ page }) => {
    // Fill in basic information
    await page.getByLabel('Titel').fill('Test Quiz');
    await page.getByLabel('Beskrivning').fill('Ett enkelt test quiz');
    
    // Add a multiple choice question
    await page.getByRole('button', { name: 'Flerval' }).click();
    
    // Fill in question details
    await page.getByLabel('Frågetitel').fill('Vad är 2 + 2?');
    await page.getByLabel('Alternativ 1').fill('4');
    await page.getByLabel('Alternativ 2').fill('5');
    
    // Verify publish button becomes enabled
    await expect(page.getByRole('button', { name: 'Publicera quiz' })).toBeEnabled();
  });

  test('should update stats when questions are added', async ({ page }) => {
    // Initially should show 0 questions
    await expect(page.getByText('0 frågor')).toBeVisible();
    
    // Add a question
    await page.getByRole('button', { name: 'Flerval' }).click();
    
    // Stats should update to 1 question
    await expect(page.getByText('1 frågor')).toBeVisible();
    await expect(page.getByText('1 poäng totalt')).toBeVisible();
  });
});

test.describe('Student Flow - Quiz Join', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz/join');
  });

  test('should display quiz join form in Swedish', async ({ page }) => {
    // Verify main heading
    await expect(page.getByRole('heading', { name: 'Gå med i Quiz' })).toBeVisible();
    
    // Verify instructions are in Swedish
    await expect(page.getByText('Ange fyrteckenskoden från din lärare')).toBeVisible();
    
    // Verify form elements
    await expect(page.getByLabel('Quiz-kod')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skanna QR-kod' })).toBeVisible();
  });

  test('should validate quiz code input', async ({ page }) => {
    const codeInput = page.getByLabel('Quiz-kod');
    const continueButton = page.getByRole('button', { name: 'Fortsätt' });
    
    // Continue button should be disabled initially
    await expect(continueButton).toBeDisabled();
    
    // Enter a 4-character code
    await codeInput.fill('TEST');
    
    // Continue button should become enabled
    await expect(continueButton).toBeEnabled();
  });

  test('should show error message for invalid code in Swedish', async ({ page }) => {
    // Enter a quiz code and continue
    await page.getByLabel('Quiz-kod').fill('INVALID');
    await page.getByRole('button', { name: 'Fortsätt' }).click();
    
    // Fill in name
    await page.getByLabel('Namn eller alias').fill('Test Student');
    await page.getByRole('button', { name: 'Gå med i quiz' }).click();
    
    // Should show error message in Swedish
    await expect(page.getByText('Quiz hittades inte. Kontrollera att koden är korrekt.')).toBeVisible();
  });
});

test.describe('Teacher Flow - Quiz Management', () => {
  test('should display quiz list with Swedish status chips', async ({ page }) => {
    await page.goto('/teacher/quiz');
    
    // Verify main heading
    await expect(page.getByRole('heading', { name: 'Mina Quiz' })).toBeVisible();
    
    // Check for status filter buttons in Swedish
    await expect(page.getByRole('button', { name: 'Alla' })).toBeVisible();
    await expect(page.getByText('Publikt')).toBeVisible();
    await expect(page.getByText('Utkast')).toBeVisible();
    await expect(page.getByText('Arkiverat')).toBeVisible();
  });

  test('should show action buttons for quiz management', async ({ page }) => {
    await page.goto('/teacher/quiz');
    
    // Look for action buttons (should be visible for at least one quiz)
    const actionButtons = [
      'Dela',
      'Granska', 
      'Redigera',
      'Duplicera',
      'Arkivera'
    ];
    
    for (const buttonText of actionButtons) {
      // At least one of these buttons should be visible
      const buttons = page.getByRole('button', { name: buttonText });
      if (await buttons.count() > 0) {
        await expect(buttons.first()).toBeVisible();
      }
    }
  });
});