import { test, expect, Page } from '@playwright/test';

// Test data for consistent quiz creation across tests
const TEST_QUIZ = {
  title: 'E2E Test Quiz',
  description: 'Ett test quiz för end-to-end testing',
  questions: [
    {
      title: 'Vad är 2 + 2?',
      type: 'multiple-choice',
      options: ['3', '4', '5', '6'],
      correct: 1 // Index of correct answer (4)
    },
    {
      title: 'Vad heter Sveriges huvudstad?',
      type: 'multiple-choice', 
      options: ['Göteborg', 'Stockholm', 'Malmö', 'Uppsala'],
      correct: 1 // Stockholm
    }
  ]
};

// Helper function to create a complete quiz
async function createCompleteQuiz(page: Page, quizData = TEST_QUIZ) {
  // Fill basic information
  await page.getByLabel('Titel').fill(quizData.title);
  await page.getByLabel('Beskrivning').fill(quizData.description);
  
  // Add questions
  for (const question of quizData.questions) {
    await page.getByRole('button', { name: 'Flerval' }).click();
    await page.getByLabel('Frågetitel').last().fill(question.title);
    
    // Fill in options
    for (let i = 0; i < question.options.length; i++) {
      await page.getByLabel(`Alternativ ${i + 1}`).last().fill(question.options[i]);
    }
    
    // Mark correct answer if needed
    if (question.correct !== undefined) {
      await page.getByRole('radio').nth(question.correct).check();
    }
  }
  
  return quizData;
}

test.describe('E2E: Complete Quiz Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teacher/quiz/create');
  });

  test('should create, preview, and publish a complete quiz', async ({ page }) => {
    // Create complete quiz
    const quizData = await createCompleteQuiz(page);
    
    // Verify stats are updated correctly
    await expect(page.getByText(`${quizData.questions.length} frågor`)).toBeVisible();
    await expect(page.getByText(`${quizData.questions.length} poäng totalt`)).toBeVisible();
    
    // Preview the quiz
    await page.getByRole('button', { name: 'Förhandsgranska' }).click();
    await expect(page.getByRole('heading', { name: quizData.title })).toBeVisible();
    await expect(page.getByText(quizData.description)).toBeVisible();
    
    // Go back to editing
    await page.getByRole('button', { name: 'Tillbaka till redigering' }).click();
    
    // Publish the quiz
    await page.getByRole('button', { name: 'Publicera quiz' }).click();
    
    // Verify success message in Swedish
    await expect(page.getByText('Quiz publicerat!')).toBeVisible();
    
    // Should redirect to quiz management with published status
    await expect(page.getByText('Publikt')).toBeVisible();
  });

  test('should create quiz from AI draft with Swedish disclaimer', async ({ page }) => {
    // Open AI panel
    await page.getByRole('button', { name: 'AI-utkast' }).click();
    
    // Verify Swedish disclaimer
    await expect(page.getByText('Dubbelkolla alltid innehållet. AI kan ha fel.')).toBeVisible();
    
    // Fill AI form
    await page.getByLabel('Ämne').fill('Matematik');
    await page.getByLabel('Årskurs').selectOption('5');
    await page.getByLabel('Antal frågor').selectOption('3');
    
    // Generate questions
    await page.getByRole('button', { name: 'Generera frågor' }).click();
    
    // Wait for generation (mock response)
    await expect(page.getByText('Frågor genererade!')).toBeVisible({ timeout: 10000 });
    
    // Select questions and import
    await page.getByRole('button', { name: 'Välj alla' }).click();
    await page.getByRole('button', { name: 'Importera valda frågor' }).click();
    
    // Verify questions are imported
    await expect(page.getByText('3 frågor')).toBeVisible();
    
    // Close AI panel
    await page.getByRole('button', { name: 'Stäng' }).click();
  });
});

test.describe('E2E: Complete Student Quiz Flow', () => {
  let quizCode: string;
  
  test.beforeAll(async ({ browser }) => {
    // Setup: Create a published quiz as teacher
    const page = await browser.newPage();
    await page.goto('/teacher/quiz/create');
    
    // Create and publish quiz
    await createCompleteQuiz(page);
    await page.getByRole('button', { name: 'Publicera quiz' }).click();
    
    // Extract quiz code for student to join
    const codeElement = await page.getByTestId('quiz-code').textContent();
    quizCode = codeElement || 'TEST';
    
    await page.close();
  });

  test('should join quiz, answer questions, and view results', async ({ page }) => {
    // Student joins quiz
    await page.goto('/quiz/join');
    
    // Verify Swedish UI
    await expect(page.getByRole('heading', { name: 'Gå med i Quiz' })).toBeVisible();
    await expect(page.getByText('Ange fyrteckenskoden från din lärare')).toBeVisible();
    
    // Enter quiz code
    await page.getByLabel('Quiz-kod').fill(quizCode);
    await page.getByRole('button', { name: 'Fortsätt' }).click();
    
    // Enter student name
    await page.getByLabel('Namn eller alias').fill('Test Elev');
    await page.getByRole('button', { name: 'Gå med i quiz' }).click();
    
    // Should be in quiz waiting room or start immediately
    await expect(page.getByRole('heading', { name: TEST_QUIZ.title })).toBeVisible();
    
    // Start quiz if not auto-started
    const startButton = page.getByRole('button', { name: 'Starta quiz' });
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    
    // Answer questions
    for (let i = 0; i < TEST_QUIZ.questions.length; i++) {
      const question = TEST_QUIZ.questions[i];
      
      // Verify question is displayed in Swedish
      await expect(page.getByRole('heading', { name: question.title })).toBeVisible();
      
      // Select correct answer
      await page.getByRole('radio').nth(question.correct).check();
      
      // Go to next question or finish
      if (i < TEST_QUIZ.questions.length - 1) {
        await page.getByRole('button', { name: 'Nästa fråga' }).click();
      } else {
        await page.getByRole('button', { name: 'Lämna in quiz' }).click();
      }
    }
    
    // Confirm submission
    await page.getByRole('button', { name: 'Ja, lämna in' }).click();
    
    // View results with accessibility features
    await expect(page.getByRole('heading', { name: 'Ditt resultat' })).toBeVisible();
    await expect(page.getByText(/Du fick \d+ av \d+ rätt/)).toBeVisible();
    
    // Verify aria-live region for results announcement
    const resultsRegion = page.getByRole('status');
    await expect(resultsRegion).toHaveAttribute('aria-live', 'polite');
    
    // Check focus management on results page
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeFocused();
  });

  test('should handle quiz validation errors in Swedish', async ({ page }) => {
    await page.goto('/quiz/join');
    
    // Try invalid quiz code
    await page.getByLabel('Quiz-kod').fill('INVALID');
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
    
    // Test that disabled button is skipped appropriately
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Skanna QR-kod' })).toBeFocused();
  });
});

test.describe('E2E: Teacher Quiz Management & Results', () => {
  test('should manage quiz lifecycle and review results', async ({ page }) => {
    await page.goto('/teacher/quiz');
    
    // Verify Swedish quiz management interface
    await expect(page.getByRole('heading', { name: 'Mina Quiz' })).toBeVisible();
    
    // Check status filter buttons in Swedish
    await expect(page.getByRole('button', { name: 'Alla' })).toBeVisible();
    await expect(page.getByText('Publikt')).toBeVisible();
    await expect(page.getByText('Utkast')).toBeVisible();
    await expect(page.getByText('Arkiverat')).toBeVisible();
    
    // Test quiz actions - look for action buttons
    const actionButtons = [
      'Dela',
      'Granska', 
      'Redigera',
      'Duplicera',
      'Arkivera'
    ];
    
    for (const buttonText of actionButtons) {
      const buttons = page.getByRole('button', { name: buttonText });
      if (await buttons.count() > 0) {
        await expect(buttons.first()).toBeVisible();
        
        // Test specific actions
        if (buttonText === 'Granska') {
          await buttons.first().click();
          // Should navigate to results/review page
          await expect(page.getByRole('heading', { name: /Resultat|Granskning/ })).toBeVisible();
          await page.goBack();
        }
      }
    }
    
    // Test create new quiz action
    await page.getByRole('button', { name: 'Skapa nytt quiz' }).click();
    await expect(page.getByRole('heading', { name: 'Skapa nytt quiz' })).toBeVisible();
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/teacher/quiz/create');
    
    // Create a quiz and verify animations respect reduced motion
    await page.getByLabel('Titel').fill('Motion Test Quiz');
    await page.getByRole('button', { name: 'Flerval' }).click();
    
    // Check that question form appears without excessive animation
    await expect(page.getByLabel('Frågetitel')).toBeVisible();
    
    // Verify no problematic motion-based CSS classes or excessive transitions
    const questionCard = page.getByTestId('question-card').first();
    const transitionDuration = await questionCard.evaluate(el => 
      getComputedStyle(el).transitionDuration
    );
    
    // Should use reduced motion (very short or no transitions)
    expect(transitionDuration).toMatch(/0s|0\.1s|0\.2s/);
  });

  test('should maintain focus during dynamic content updates', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    // Focus on add question button
    await page.getByRole('button', { name: 'Flerval' }).focus();
    await expect(page.getByRole('button', { name: 'Flerval' })).toBeFocused();
    
    // Add question and verify focus management
    await page.getByRole('button', { name: 'Flerval' }).click();
    
    // Focus should move to the new question's title field
    await expect(page.getByLabel('Frågetitel')).toBeFocused();
    
    // Test delete question focus management
    const deleteButton = page.getByRole('button', { name: 'Ta bort fråga' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Focus should return to a logical element (add question button)
      await expect(page.getByRole('button', { name: 'Flerval' })).toBeFocused();
    }
  });
});

test.describe('E2E: Swedish Language & Accessibility Validation', () => {
  test('should maintain Swedish throughout complete quiz flow', async ({ page }) => {
    // Teacher creates quiz
    await page.goto('/teacher/quiz/create');
    await expect(page.getByRole('heading', { name: 'Skapa nytt quiz' })).toBeVisible();
    
    // Check for any accidental English text in core UI
    const englishWords = ['Create', 'Delete', 'Edit', 'Save', 'Cancel', 'Submit', 'Login', 'Home'];
    for (const word of englishWords) {
      const englishElements = page.getByText(word, { exact: true });
      expect(await englishElements.count()).toBe(0);
    }
    
    // Student joins quiz
    await page.goto('/quiz/join');
    await expect(page.getByRole('heading', { name: 'Gå med i Quiz' })).toBeVisible();
    
    // Verify Swedish error messages
    await page.getByLabel('Quiz-kod').fill('INVALID');
    await page.getByRole('button', { name: 'Fortsätt' }).click();
    await page.getByLabel('Namn eller alias').fill('Test');
    await page.getByRole('button', { name: 'Gå med i quiz' }).click();
    
    await expect(page.getByText('Quiz hittades inte. Kontrollera att koden är korrekt.')).toBeVisible();
  });

  test('should have proper ARIA attributes for quiz results', async ({ page }) => {
    await page.goto('/quiz/results/mock-session-id');
    
    // Results should have proper ARIA structure
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Score should be announced with aria-live
    const scoreRegion = page.getByRole('status');
    if (await scoreRegion.count() > 0) {
      await expect(scoreRegion).toHaveAttribute('aria-live', 'polite');
    }
    
    // Progress indicators should have proper labels
    const progressBars = page.getByRole('progressbar');
    if (await progressBars.count() > 0) {
      await expect(progressBars.first()).toHaveAttribute('aria-label');
    }
    
    // Question review should be accessible
    const questionResults = page.getByRole('listitem');
    if (await questionResults.count() > 0) {
      await expect(questionResults.first()).toHaveAttribute('aria-describedby');
    }
  });

  test('should respect user prefers-reduced-motion setting', async ({ page }) => {
    // Test with reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/teacher/quiz/create');
    
    // Add animation and verify it's reduced
    await page.getByRole('button', { name: 'Flerval' }).click();
    
    // Check computed styles respect reduced motion
    const animatedElement = page.getByTestId('question-form');
    if (await animatedElement.count() > 0) {
      const style = await animatedElement.evaluate(el => getComputedStyle(el));
      
      // Should have minimal or no animation
      expect(style.animationDuration).toMatch(/0s|none/);
      expect(style.transitionDuration).toMatch(/0s|0\.1s|0\.2s/);
    }
  });

  test('should have adequate touch targets for mobile', async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/quiz/join');
    
    // Check that interactive elements meet 44px minimum
    const buttons = await page.getByRole('button').all();
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    // Check input fields
    const inputs = await page.getByRole('textbox').all();
    for (const input of inputs) {
      const box = await input.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});