/**
 * E2E Tests: Quiz Wizard with AI + Complete Flow
 * 
 * Tests the complete AI-assisted quiz creation flow from creation to student results.
 * Ensures Swedish localization, accessibility, and cross-browser compatibility.
 * 
 * Test Plan:
 * 1. Login as teacher (test account/seed)
 * 2. Go to Create new quiz → AI draft (or "Skapa frågor med AI" in question step)
 * 3. Open AI panel, enter subject/grade/count and trigger generation (mock)
 * 4. Approve 2-3 questions (at least 1 MC + 1 free text)
 * 5. Publish quiz → open Sharing → get code
 * 6. Student flow: go to "Gå med i quiz", enter code, answer questions, submit
 * 7. Teacher flow: check result view; verify summary exists
 * 8. Cleanup (delete/take down created quiz)
 */

import { test, expect, Page, Browser } from '@playwright/test';
import { setupAIMock, resetAIMock, MOCK_QUIZ_DATA, MOCK_AI_QUESTIONS } from '../fixtures/aiMock';

// Test data
const TEACHER_ACCOUNT = {
  email: 'test.teacher@skolapp.se',
  name: 'Test Lärare'
};

const STUDENT_DATA = {
  name: 'Test Elev'
};

/**
 * Helper: Simulate teacher login
 */
async function loginAsTeacher(page: Page) {
  // For testing purposes, we'll navigate directly to teacher pages
  // In a real app, this would include actual authentication flow
  await page.goto('/teacher/quiz/create');
  
  // Verify we're on the teacher dashboard/create page
  await expect(page.getByRole('heading', { name: /skapa/i })).toBeVisible();
}

/**
 * Helper: Create and publish quiz using AI
 */
async function createAIQuizAndPublish(page: Page): Promise<string> {
  // Step 1: Open AI panel
  await page.getByTestId('ai-draft-button').click();
  
  // Step 2: Verify Swedish disclaimer is visible
  await expect(page.getByTestId('ai-disclaimer')).toBeVisible();
  await expect(page.getByText('Dubbelkolla alltid innehållet. AI kan ha fel.')).toBeVisible();
  
  // Step 3: Fill AI form with test data
  await page.getByTestId('ai-subject-select').selectOption(MOCK_QUIZ_DATA.subject);
  await page.getByTestId('ai-grade-select').selectOption(MOCK_QUIZ_DATA.grade);
  await page.getByLabel('Antal frågor').fill(MOCK_QUIZ_DATA.count.toString());
  
  // Step 4: Generate questions
  await page.getByTestId('ai-generate-questions').click();
  
  // Step 5: Wait for AI response (mocked)
  await expect(page.getByText('Frågor genererade!')).toBeVisible({ timeout: 15000 });
  
  // Step 6: Review generated questions - should have both MC and free text
  const mcQuestions = MOCK_AI_QUESTIONS.filter(q => q.kind === 'multiple-choice');
  const freeTextQuestions = MOCK_AI_QUESTIONS.filter(q => q.kind === 'free-text');
  
  // Verify at least one of each type is available
  expect(mcQuestions.length).toBeGreaterThan(0);
  expect(freeTextQuestions.length).toBeGreaterThan(0);
  
  // Step 7: Select questions to import (using select all for simplicity)
  await page.getByTestId('ai-select-all-questions').click();
  await page.getByTestId('ai-import-questions').click();
  
  // Step 8: Close AI panel
  await page.getByTestId('ai-modal-close').click();
  
  // Step 9: Fill basic quiz information
  await page.getByLabel('Titel').fill(MOCK_QUIZ_DATA.title);
  await page.getByLabel('Beskrivning').fill(MOCK_QUIZ_DATA.description);
  
  // Step 10: Verify questions imported (at least 3 for our test)
  await expect(page.getByText(/3 frågor|fler frågor/)).toBeVisible();
  
  // Step 11: Publish the quiz
  await page.getByRole('button', { name: 'Publicera quiz' }).click();
  
  // Step 12: Verify publication success
  await expect(page.getByText('Quiz publicerat!')).toBeVisible();
  
  // Step 13: Extract the quiz code for student joining
  const codeElement = page.getByTestId('quiz-code');
  await expect(codeElement).toBeVisible();
  const quizCode = await codeElement.textContent();
  
  if (!quizCode) {
    throw new Error('Could not extract quiz code');
  }
  
  return quizCode.trim();
}

/**
 * Helper: Student joins and completes quiz
 */
async function studentJoinAndCompleteQuiz(page: Page, quizCode: string) {
  // Step 1: Navigate to join page
  await page.goto('/quiz/join');
  
  // Step 2: Verify Swedish UI
  await expect(page.getByRole('heading', { name: 'Gå med i Quiz' })).toBeVisible();
  await expect(page.getByText('Ange fyrteckenskoden från din lärare')).toBeVisible();
  
  // Step 3: Enter quiz code
  await page.getByLabel('Quiz-kod').fill(quizCode);
  await page.getByRole('button', { name: 'Fortsätt' }).click();
  
  // Step 4: Enter student name
  await page.getByLabel('Namn eller alias').fill(STUDENT_DATA.name);
  await page.getByRole('button', { name: 'Gå med i quiz' }).click();
  
  // Step 5: Start quiz (wait for questions to load)
  await expect(page.getByRole('heading')).toBeVisible({ timeout: 10000 });
  
  // Step 6: Answer questions
  // For simplicity, we'll answer the first correct option for MC questions
  // and provide basic answers for free text
  const questionElements = page.getByRole('radiogroup').or(page.getByRole('textbox'));
  const questionCount = await questionElements.count();
  
  for (let i = 0; i < questionCount; i++) {
    // Check if it's a multiple choice (radio) or free text question
    const isRadio = await page.getByRole('radiogroup').nth(i).isVisible().catch(() => false);
    
    if (isRadio) {
      // Select first radio option
      await page.getByRole('radio').first().check();
    } else {
      // Fill text answer
      await page.getByRole('textbox').nth(i).fill('Detta är mitt svar på frågan.');
    }
    
    // Move to next question if not the last one
    if (i < questionCount - 1) {
      await page.getByRole('button', { name: /nästa|fortsätt/i }).click();
    }
  }
  
  // Step 7: Submit quiz
  await page.getByRole('button', { name: /skicka in|avsluta/i }).click();
  
  // Step 8: Verify completion
  await expect(page.getByText(/tack|klart|slutfört/i)).toBeVisible({ timeout: 10000 });
}

/**
 * Helper: Teacher views results
 */
async function teacherViewResults(page: Page) {
  // Navigate to quiz management/results
  await page.goto('/teacher/quiz');
  
  // Look for the published quiz in the list
  await expect(page.getByText(MOCK_QUIZ_DATA.title)).toBeVisible();
  await expect(page.getByText('Publikt')).toBeVisible();
  
  // Click on results/view button for the quiz
  await page.getByRole('button', { name: /resultat|visa/i }).first().click();
  
  // Verify results summary is visible
  await expect(page.getByText(/sammanfattning|resultat/i)).toBeVisible();
  await expect(page.getByText(STUDENT_DATA.name)).toBeVisible();
}

/**
 * Helper: Cleanup created quiz
 */
async function cleanupQuiz(page: Page) {
  await page.goto('/teacher/quiz');
  
  // Find and delete the test quiz
  const quizRow = page.locator('tr', { hasText: MOCK_QUIZ_DATA.title });
  if (await quizRow.isVisible()) {
    await quizRow.getByRole('button', { name: /ta bort|radera/i }).click();
    await page.getByRole('button', { name: /bekräfta|ja/i }).click();
  }
}

test.describe('E2E: AI-Assisted Quiz Creation Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup AI mocking for deterministic tests
    await setupAIMock(page);
  });

  test.afterEach(async ({ page }) => {
    // Reset mocking state
    await resetAIMock(page);
  });

  test('should complete full AI quiz flow: create → publish → student join → results', async ({ page }) => {
    // Step 1: Teacher login and create AI-assisted quiz
    await loginAsTeacher(page);
    const quizCode = await createAIQuizAndPublish(page);
    
    // Step 2: Student joins and completes quiz
    const studentPage = await page.context().newPage();
    await studentJoinAndCompleteQuiz(studentPage, quizCode);
    await studentPage.close();
    
    // Step 3: Teacher views results
    await teacherViewResults(page);
    
    // Step 4: Cleanup
    await cleanupQuiz(page);
  });

  test('should handle AI modal accessibility features', async ({ page }) => {
    await loginAsTeacher(page);
    
    // Open AI panel
    await page.getByTestId('ai-draft-button').click();
    
    // Verify focus management
    await expect(page.getByTestId('ai-subject-select')).toBeFocused();
    
    // Test Escape key closes modal
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('ai-disclaimer')).not.toBeVisible();
    
    // Reopen for further tests
    await page.getByTestId('ai-draft-button').click();
    
    // Test tab navigation
    await page.keyboard.press('Tab'); // Should move to grade select
    await expect(page.getByTestId('ai-grade-select')).toBeFocused();
    
    // Test form validation
    await page.getByTestId('ai-generate-questions').click();
    // Should not proceed without required fields
    await expect(page.getByTestId('ai-disclaimer')).toBeVisible();
  });

  test('should support cross-browser quiz flow', async ({ page, browserName }) => {
    // This test runs in different browsers due to Playwright config
    console.log(`Running in browser: ${browserName}`);
    
    await loginAsTeacher(page);
    
    // Simplified flow for cross-browser testing
    await page.getByTestId('ai-draft-button').click();
    await expect(page.getByTestId('ai-disclaimer')).toBeVisible();
    await expect(page.getByText('Dubbelkolla alltid innehållet. AI kan ha fel.')).toBeVisible();
    
    // Verify Swedish UI elements are consistent
    await expect(page.getByText('AI Quiz-assistent')).toBeVisible();
    await expect(page.getByTestId('ai-modal-close')).toBeVisible();
  });

  test('should validate Swedish language consistency', async ({ page }) => {
    await loginAsTeacher(page);
    
    // Check for English strings that shouldn't be there
    const englishTerms = ['Generate', 'Create', 'Questions', 'Submit', 'Error', 'Loading'];
    
    for (const term of englishTerms) {
      // These should not appear in visible text
      const englishText = page.getByText(term, { exact: true });
      await expect(englishText).not.toBeVisible();
    }
    
    // Verify key Swedish terms are present
    await expect(page.getByText('Skapa nytt quiz')).toBeVisible();
    await expect(page.getByText('Frågor')).toBeVisible();
    await expect(page.getByText('Publicera quiz')).toBeVisible();
  });
});

test.describe('E2E: Error Handling and Edge Cases', () => {
  test('should handle quiz code errors gracefully', async ({ page }) => {
    await page.goto('/quiz/join');
    
    // Test invalid quiz code
    await page.getByLabel('Quiz-kod').fill('XXXX');
    await page.getByRole('button', { name: 'Fortsätt' }).click();
    
    await page.getByLabel('Namn eller alias').fill('Test Student');
    await page.getByRole('button', { name: 'Gå med i quiz' }).click();
    
    // Should show Swedish error message
    await expect(page.getByText('Quiz hittades inte. Kontrollera att koden är korrekt.')).toBeVisible();
    
    // Error should have proper ARIA attributes
    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
  });

  test('should support keyboard navigation throughout quiz flow', async ({ page }) => {
    await page.goto('/quiz/join');
    
    // Test keyboard navigation in join form
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Quiz-kod')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Skanna QR-kod' })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Fortsätt' })).toBeFocused();
  });
});