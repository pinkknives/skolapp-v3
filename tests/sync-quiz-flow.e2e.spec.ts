import { test, expect } from '@playwright/test'

/**
 * Sync Quiz E2E Flow Tests
 * 
 * Tests the complete sync quiz lifecycle:
 * 1. Teacher creates sync quiz session
 * 2. Student joins sync session
 * 3. Teacher controls quiz flow (start/next/reveal/end)
 * 4. Student participates in real-time
 * 5. Results display
 * 
 * This tests the core sync quiz functionality with real-time coordination.
 */

const SYNC_QUIZ_DATA = {
  title: 'Live Matematik Quiz',
  description: 'Ett live quiz om grundläggande matematik',
  questions: [
    {
      title: 'Vad är 8 × 7?',
      type: 'multiple-choice',
      options: ['54', '56', '58', '60'],
      correct: 1
    },
    {
      title: 'Vad är kvadratroten ur 81?',
      type: 'multiple-choice', 
      options: ['7', '8', '9', '10'],
      correct: 2
    }
  ]
}

test.describe('Sync Quiz Real-time Flow', () => {
  let sessionCode: string

  // Skip these tests for now since they require the full infrastructure
  // TODO: Implement these tests when the sync quiz feature is fully integrated
  test.skip('Complete sync quiz flow with teacher and student coordination', async ({ browser }) => {
    // Create two browser contexts - one for teacher, one for student
    const teacherContext = await browser.newContext()
    const studentContext = await browser.newContext()
    
    const teacherPage = await teacherContext.newPage()
    const studentPage = await studentContext.newPage()

    try {
      // Step 1: Teacher creates and configures sync quiz
      await teacherPage.goto('/teacher/quiz/create')
      
      // Fill in quiz details
      await teacherPage.fill('[data-testid="quiz-title"]', SYNC_QUIZ_DATA.title)
      await teacherPage.fill('[data-testid="quiz-description"]', SYNC_QUIZ_DATA.description)
      
      // Add questions
      for (const question of SYNC_QUIZ_DATA.questions) {
        await teacherPage.click('[data-testid="add-question"]')
        await teacherPage.fill('[data-testid="question-title"]', question.title)
        
        if (question.type === 'multiple-choice') {
          for (let i = 0; i < question.options.length; i++) {
            await teacherPage.fill(`[data-testid="option-${i}"]`, question.options[i])
            if (i === question.correct) {
              await teacherPage.check(`[data-testid="correct-${i}"]`)
            }
          }
        }
      }
      
      // Publish quiz
      await teacherPage.click('[data-testid="publish-quiz"]')
      await expect(teacherPage.getByText('Quiz publicerat')).toBeVisible()
      
      // Step 2: Teacher creates sync session
      await teacherPage.click('[data-testid="create-session"]')
      await teacherPage.click('[data-testid="sync-mode"]') // Select sync mode
      await teacherPage.click('[data-testid="create-live-session"]')
      
      // Get session code
      const sessionCodeElement = await teacherPage.locator('[data-testid="session-code"]')
      sessionCode = await sessionCodeElement.textContent() || ''
      expect(sessionCode).toMatch(/^[A-Z0-9]{6}$/)
      
      // Step 3: Student joins session
      await studentPage.goto('/quiz/join')
      await studentPage.fill('[data-testid="session-code"]', sessionCode)
      await studentPage.click('[data-testid="submit-code"]')
      
      await studentPage.fill('[data-testid="display-name"]', 'Test Student')
      await studentPage.click('[data-testid="join-session"]')
      
      // Verify student reaches sync quiz interface
      await expect(studentPage.getByText('Live Quiz')).toBeVisible()
      await expect(studentPage.getByText('Väntar på att quizet ska starta')).toBeVisible()
      
      // Step 4: Teacher starts quiz
      await teacherPage.click('[data-testid="start-quiz"]')
      
      // Verify first question appears for both
      await expect(teacherPage.getByText('Fråga 1 av 2')).toBeVisible()
      await expect(studentPage.getByText('Fråga 1 av 2')).toBeVisible()
      await expect(studentPage.getByText(SYNC_QUIZ_DATA.questions[0].title)).toBeVisible()
      
      // Step 5: Student answers first question
      await studentPage.click(`[data-testid="option-${SYNC_QUIZ_DATA.questions[0].correct}"]`)
      await studentPage.click('[data-testid="submit-answer"]')
      
      // Verify answer submitted
      await expect(studentPage.getByText('Svar inskickat')).toBeVisible()
      
      // Teacher sees answer distribution
      await expect(teacherPage.getByText('1 av 1 har svarat')).toBeVisible()
      
      // Step 6: Teacher reveals answer
      await teacherPage.click('[data-testid="reveal-answer"]')
      
      // Student sees correct answer feedback
      await expect(studentPage.getByText('Rätt svar!')).toBeVisible()
      
      // Step 7: Teacher moves to next question
      await teacherPage.click('[data-testid="next-question"]')
      
      // Verify second question
      await expect(teacherPage.getByText('Fråga 2 av 2')).toBeVisible()
      await expect(studentPage.getByText('Fråga 2 av 2')).toBeVisible()
      await expect(studentPage.getByText(SYNC_QUIZ_DATA.questions[1].title)).toBeVisible()
      
      // Step 8: Student answers second question (wrong answer)
      await studentPage.click(`[data-testid="option-${(SYNC_QUIZ_DATA.questions[1].correct + 1) % 4}"]`)
      await studentPage.click('[data-testid="submit-answer"]')
      
      // Step 9: Teacher reveals and ends quiz
      await teacherPage.click('[data-testid="reveal-answer"]')
      await teacherPage.click('[data-testid="end-quiz"]')
      
      // Verify quiz completion
      await expect(studentPage.getByText('Quiz avslutat')).toBeVisible()
      await expect(teacherPage.getByText('Quiz avslutat')).toBeVisible()
      
      // Step 10: Verify results summary
      await expect(teacherPage.getByText('1 av 2 rätta svar')).toBeVisible() // 50% score
      
    } finally {
      await teacherContext.close()
      await studentContext.close()
    }
  })

  test.skip('Student reconnection during sync quiz', async ({ browser }) => {
    // Test that students can reconnect and resume from correct question
    const teacherContext = await browser.newContext()
    const studentContext = await browser.newContext()
    
    const teacherPage = await teacherContext.newPage()
    const studentPage = await studentContext.newPage()

    try {
      // Set up quiz and join student (similar to above test)
      // ... setup code ...
      
      // Start quiz
      await teacherPage.click('[data-testid="start-quiz"]')
      
      // Student answers first question
      await studentPage.click('[data-testid="option-1"]')
      await studentPage.click('[data-testid="submit-answer"]')
      
      // Simulate disconnection by closing page
      await studentPage.close()
      
      // Teacher moves to next question
      await teacherPage.click('[data-testid="next-question"]')
      
      // Student reconnects
      const newStudentPage = await studentContext.newPage()
      await newStudentPage.goto(`/quiz/sync/${sessionCode}`)
      
      // Should be on question 2, not question 1
      await expect(newStudentPage.getByText('Fråga 2 av 2')).toBeVisible()
      await expect(newStudentPage.getByText(SYNC_QUIZ_DATA.questions[1].title)).toBeVisible()
      
    } finally {
      await teacherContext.close()
      await studentContext.close()
    }
  })

  test.skip('Teacher pause and resume functionality', async ({ browser }) => {
    // Test teacher can pause and resume sync quiz
    const teacherContext = await browser.newContext()
    const studentContext = await browser.newContext()
    
    const teacherPage = await teacherContext.newPage()
    const studentPage = await studentContext.newPage()

    try {
      // Set up and start quiz
      // ... setup code ...
      
      await teacherPage.click('[data-testid="start-quiz"]')
      
      // Teacher pauses quiz
      await teacherPage.click('[data-testid="pause-quiz"]')
      
      // Student sees paused message
      await expect(studentPage.getByText('Quiz pausat')).toBeVisible()
      
      // Student cannot submit answers while paused
      await expect(studentPage.locator('[data-testid="submit-answer"]')).toBeDisabled()
      
      // Teacher resumes quiz
      await teacherPage.click('[data-testid="resume-quiz"]')
      
      // Student can continue
      await expect(studentPage.getByText('Quiz pausat')).not.toBeVisible()
      await expect(studentPage.locator('[data-testid="submit-answer"]')).toBeEnabled()
      
    } finally {
      await teacherContext.close()
      await studentContext.close()
    }
  })
})

test.describe('Sync Quiz Accessibility', () => {
  test.skip('Sync quiz controls are accessible', async ({ page }) => {
    // Test that all sync quiz controls have proper ARIA labels
    await page.goto('/teacher/quiz/session/123') // Mock session ID
    
    // Check teacher controls
    await expect(page.locator('[data-testid="start-quiz"]')).toHaveAttribute('aria-label', 'Starta quiz')
    await expect(page.locator('[data-testid="pause-quiz"]')).toHaveAttribute('aria-label', 'Pausa quiz')
    await expect(page.locator('[data-testid="next-question"]')).toHaveAttribute('aria-label', 'Nästa fråga')
    await expect(page.locator('[data-testid="reveal-answer"]')).toHaveAttribute('aria-label', 'Visa facit')
    
    // Check for screen reader announcements
    await expect(page.locator('[aria-live="polite"]')).toBeVisible()
  })

  test.skip('Student sync quiz interface is accessible', async ({ page }) => {
    // Test student interface accessibility
    await page.goto('/quiz/sync/123') // Mock session ID
    
    // Check question navigation
    await expect(page.locator('[role="main"]')).toBeVisible()
    await expect(page.locator('h1')).toHaveText('Live Quiz')
    
    // Check answer options are properly labeled
    const answerOptions = page.locator('[role="radio"]')
    await expect(answerOptions.first()).toHaveAttribute('aria-label')
    
    // Check status announcements
    await expect(page.locator('[aria-live="assertive"]')).toBeVisible()
  })
})

// Helper functions for test setup
async function createMockSyncQuiz(page: any) {
  // Mock quiz creation logic
  // This would be replaced with actual quiz creation when integrated
}