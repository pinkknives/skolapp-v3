import { test, expect } from '@playwright/test';

/**
 * Critical E2E Flow Tests for Skolapp Quiz Functionality
 * 
 * These tests cover the complete user journeys for quiz functionality:
 * 1. Teacher creates quiz (scratch/AI)
 * 2. Student joins quiz (code/QR)
 * 3. Student answers and submits
 * 4. Results display with accessibility
 * 
 * All tests ensure Swedish language consistency and accessibility compliance.
 */

// Shared test data for consistent quiz flows
const CRITICAL_QUIZ = {
  title: 'Matematik Grundkurs',
  description: 'Ett quiz om grundläggande matematik för årskurs 5',
  questions: [
    {
      title: 'Vad är 15 + 27?',
      type: 'multiple-choice',
      options: ['42', '41', '43', '40'],
      correct: 0
    },
    {
      title: 'Vilket är det minsta primtalet?',
      type: 'multiple-choice',
      options: ['1', '2', '3', '5'],
      correct: 1
    },
    {
      title: 'Hur många sidor har en hexagon?',
      type: 'multiple-choice',
      options: ['5', '6', '7', '8'],
      correct: 1
    }
  ]
};

test.describe('Critical Flow: Complete Quiz Lifecycle', () => {
  let quizCode: string;
  
  test('End-to-End: Teacher creates → Student joins → Completes → Results viewed', async ({ browser }) => {
    // Step 1: Teacher creates and publishes quiz
    const teacherPage = await browser.newPage();
    await teacherPage.goto('/teacher/quiz/create');
    
    // Verify Swedish interface
    await expect(teacherPage.getByRole('heading', { name: 'Skapa nytt quiz' })).toBeVisible();
    
    // Create complete quiz
    await teacherPage.getByLabel('Titel').fill(CRITICAL_QUIZ.title);
    await teacherPage.getByLabel('Beskrivning').fill(CRITICAL_QUIZ.description);
    
    // Add all questions
    for (const [index, question] of CRITICAL_QUIZ.questions.entries()) {
      await teacherPage.getByRole('button', { name: 'Flerval' }).click();
      
      // Fill question details
      const questionTitleInputs = teacherPage.getByLabel('Frågetitel');
      await questionTitleInputs.nth(index).fill(question.title);
      
      // Fill options
      for (let i = 0; i < question.options.length; i++) {
        const optionInputs = teacherPage.getByLabel(`Alternativ ${i + 1}`);
        await optionInputs.nth(index).fill(question.options[i]);
      }
      
      // Mark correct answer
      const radioButtons = teacherPage.getByRole('radio');
      await radioButtons.nth(index * 4 + question.correct).check();
    }
    
    // Verify quiz stats
    await expect(teacherPage.getByText(`${CRITICAL_QUIZ.questions.length} frågor`)).toBeVisible();
    
    // Publish quiz
    await teacherPage.getByRole('button', { name: 'Publicera quiz' }).click();
    
    // Extract quiz code
    const codeElement = await teacherPage.getByTestId('quiz-code');
    quizCode = await codeElement.textContent() || 'TEST';
    
    await teacherPage.close();
    
    // Step 2: Student joins quiz
    const studentPage = await browser.newPage();
    await studentPage.goto('/quiz/join');
    
    // Verify Swedish interface
    await expect(studentPage.getByRole('heading', { name: 'Gå med i Quiz' })).toBeVisible();
    await expect(studentPage.getByText('Ange fyrteckenskoden från din lärare')).toBeVisible();
    
    // Join quiz
    await studentPage.getByLabel('Quiz-kod').fill(quizCode);
    await studentPage.getByRole('button', { name: 'Fortsätt' }).click();
    
    await studentPage.getByLabel('Namn eller alias').fill('Test Elev');
    await studentPage.getByRole('button', { name: 'Gå med i quiz' }).click();
    
    // Should be in quiz
    await expect(studentPage.getByRole('heading', { name: CRITICAL_QUIZ.title })).toBeVisible();
    
    // Step 3: Answer all questions
    const startButton = studentPage.getByRole('button', { name: 'Starta quiz' });
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    
    for (let i = 0; i < CRITICAL_QUIZ.questions.length; i++) {
      const question = CRITICAL_QUIZ.questions[i];
      
      // Verify question display
      await expect(studentPage.getByRole('heading', { name: question.title })).toBeVisible();
      
      // Answer question (select correct answer)
      await studentPage.getByRole('radio').nth(question.correct).check();
      
      // Navigate to next question or finish
      if (i < CRITICAL_QUIZ.questions.length - 1) {
        await studentPage.getByRole('button', { name: 'Nästa fråga' }).click();
      } else {
        await studentPage.getByRole('button', { name: 'Lämna in quiz' }).click();
      }
    }
    
    // Confirm submission
    await studentPage.getByRole('button', { name: 'Ja, lämna in' }).click();
    
    // Step 4: Verify results with accessibility
    await expect(studentPage.getByRole('heading', { name: 'Ditt resultat' })).toBeVisible();
    await expect(studentPage.getByText(/Du fick \d+ av \d+ rätt/)).toBeVisible();
    
    // Verify accessibility features
    const resultsRegion = studentPage.getByRole('status');
    if (await resultsRegion.count() > 0) {
      await expect(resultsRegion).toHaveAttribute('aria-live', 'polite');
    }
    
    // Verify focus management
    const mainContent = studentPage.getByRole('main');
    await expect(mainContent).toBeFocused();
    
    await studentPage.close();
  });
});

test.describe('Critical Flow: AI-Assisted Quiz Creation', () => {
  test('should create quiz using AI with Swedish disclaimer', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    // Open AI panel
    await page.getByRole('button', { name: 'AI-utkast' }).click();
    
    // Verify Swedish disclaimer is prominent
    await expect(page.getByText('Dubbelkolla alltid innehållet. AI kan ha fel.')).toBeVisible();
    
    // Fill AI form in Swedish
    await page.getByLabel('Ämne').fill('Naturvetenskap');
    await page.getByLabel('Årskurs').selectOption('6');
    await page.getByLabel('Antal frågor').selectOption('5');
    await page.getByLabel('Svårighetsgrad').selectOption('medium');
    
    // Generate questions
    await page.getByRole('button', { name: 'Generera frågor' }).click();
    
    // Wait for AI response (mocked)
    await expect(page.getByText('Frågor genererade!')).toBeVisible({ timeout: 15000 });
    
    // Review generated questions
    await expect(page.getByText('Förhandsgranska genererade frågor')).toBeVisible();
    
    // Select questions to import
    await page.getByRole('button', { name: 'Välj alla' }).click();
    await page.getByRole('button', { name: 'Importera valda frågor' }).click();
    
    // Verify questions imported to main form
    await expect(page.getByText('5 frågor')).toBeVisible();
    
    // Close AI panel
    await page.getByRole('button', { name: 'Stäng' }).click();
    
    // Continue with normal quiz creation flow
    await page.getByLabel('Titel').fill('AI-Genererat Quiz');
    await expect(page.getByRole('button', { name: 'Publicera quiz' })).toBeEnabled();
  });
});

test.describe('Critical Flow: Error Handling & Validation', () => {
  test('should handle quiz errors gracefully in Swedish', async ({ page }) => {
    // Test invalid quiz code
    await page.goto('/quiz/join');
    
    await page.getByLabel('Quiz-kod').fill('XXXX');
    await page.getByRole('button', { name: 'Fortsätt' }).click();
    
    await page.getByLabel('Namn eller alias').fill('Test Student');
    await page.getByRole('button', { name: 'Gå med i quiz' }).click();
    
    // Should show Swedish error
    await expect(page.getByText('Quiz hittades inte. Kontrollera att koden är korrekt.')).toBeVisible();
    
    // Error should have proper accessibility
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
  });
  
  test('should validate quiz creation form in Swedish', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    // Try to publish without required fields
    await page.getByRole('button', { name: 'Publicera quiz' }).click();
    
    // Should show validation errors in Swedish
    await expect(page.getByText('Titel krävs')).toBeVisible();
    await expect(page.getByText('Minst en fråga krävs')).toBeVisible();
    
    // Validation messages should have proper ARIA
    const validationErrors = page.getByRole('alert');
    await expect(validationErrors.first()).toBeVisible();
  });
});

test.describe('Critical Flow: Accessibility & Motion', () => {
  test('should respect reduced motion throughout quiz flow', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/teacher/quiz/create');
    
    // Add question and verify no excessive animations
    await page.getByRole('button', { name: 'Flerval' }).click();
    
    // Check that transitions are minimal
    const questionForm = page.getByTestId('question-form').first();
    if (await questionForm.count() > 0) {
      const styles = await questionForm.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          transition: computed.transitionDuration,
          animation: computed.animationDuration
        };
      });
      
      // Should have very short or no transitions/animations
      expect(styles.transition).toMatch(/0s|0\.1s|0\.2s/);
      expect(styles.animation).toMatch(/0s|none/);
    }
  });
  
  test('should maintain focus order during quiz flow', async ({ page }) => {
    await page.goto('/quiz/join');
    
    // Test logical tab order
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Quiz-kod')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Skanna QR-kod' })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Fortsätt' })).toBeFocused();
    
    // Verify disabled button behavior
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Skanna QR-kod' })).toBeFocused();
  });
  
  test('should have adequate touch targets on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/quiz/join');
    
    // Check button sizes meet 44px minimum
    const interactiveElements = await page.getByRole('button').all();
    
    for (const element of interactiveElements) {
      const boundingBox = await element.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    // Check input field heights
    const inputs = await page.getByRole('textbox').all();
    for (const input of inputs) {
      const boundingBox = await input.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});