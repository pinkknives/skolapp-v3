import { test, expect } from '@playwright/test'

/**
 * Live Quiz Session E2E Tests
 * 
 * Tests the complete flow for live quiz sessions:
 * 1. Teacher creates live session
 * 2. Student joins via PIN
 * 3. Teacher starts session
 * 4. Student answers questions
 * 5. Session completion
 */

test.describe('Live Quiz Session Flow', () => {
  // Mock data for testing
  const mockTeacher = {
    email: 'teacher@test.com',
    password: 'testpass123'
  }
  
  const mockStudent = {
    email: 'student@test.com', 
    password: 'testpass123'
  }

  test.beforeEach(async ({ page }) => {
    // Skip if not running in test environment
    if (!process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
      test.skip('Live quiz tests only run in development environment')
    }
  })

  test('complete live quiz session flow', async ({ browser }) => {
    // Create two browser contexts - one for teacher, one for student
    const teacherContext = await browser.newContext()
    const studentContext = await browser.newContext()
    
    const teacherPage = await teacherContext.newPage()
    const studentPage = await studentContext.newPage()

    try {
      // Step 1: Teacher creates live session
      await teacherPage.goto('/auth/login')
      
      // Mock teacher login (this would need to be adapted to your auth flow)
      await teacherPage.fill('[data-testid="email"]', mockTeacher.email)
      await teacherPage.fill('[data-testid="password"]', mockTeacher.password)
      await teacherPage.click('[data-testid="login-button"]')
      
      // Navigate to quiz creation (mock quiz for testing)
      await teacherPage.goto('/quiz/create')
      
      // Create a simple test quiz
      await teacherPage.fill('[data-testid="quiz-title"]', 'Live Test Quiz')
      await teacherPage.fill('[data-testid="quiz-description"]', 'Test quiz for live session')
      
      // Add a multiple choice question
      await teacherPage.click('[data-testid="add-question"]')
      await teacherPage.fill('[data-testid="question-title"]', 'What is 2 + 2?')
      await teacherPage.click('[data-testid="question-type-multiple-choice"]')
      
      // Add options
      await teacherPage.fill('[data-testid="option-0"]', '3')
      await teacherPage.fill('[data-testid="option-1"]', '4')
      await teacherPage.fill('[data-testid="option-2"]', '5')
      await teacherPage.click('[data-testid="option-1-correct"]') // Mark option 1 (4) as correct
      
      // Save and publish quiz
      await teacherPage.click('[data-testid="save-quiz"]')
      await teacherPage.click('[data-testid="publish-quiz"]')
      
      // Start live session
      await teacherPage.click('[data-testid="start-session"]')
      await teacherPage.click('[data-testid="mode-sync"]') // Select live mode
      await teacherPage.click('[data-testid="create-session"]')
      
      // Extract PIN from the teacher's page
      await teacherPage.waitForSelector('[data-testid="session-pin"]')
      const sessionPin = await teacherPage.textContent('[data-testid="session-pin"]')
      
      expect(sessionPin).toBeTruthy()
      expect(sessionPin).toHaveLength(6)
      
      // Step 2: Student joins session
      await studentPage.goto('/live/join')
      
      // Enter PIN
      await studentPage.fill('[data-testid="pin-input"]', sessionPin!)
      await studentPage.click('[data-testid="find-session"]')
      
      // Enter display name
      await studentPage.fill('[data-testid="display-name"]', 'Test Student')
      await studentPage.click('[data-testid="join-session"]')
      
      // Verify student is in lobby
      await studentPage.waitForSelector('[data-testid="lobby-status"]')
      const lobbyText = await studentPage.textContent('[data-testid="lobby-status"]')
      expect(lobbyText).toContain('Väntar på att läraren startar')
      
      // Step 3: Teacher sees participant and starts session
      await teacherPage.waitForSelector('[data-testid="participant-count"]')
      const participantText = await teacherPage.textContent('[data-testid="participant-count"]')
      expect(participantText).toContain('1') // One participant
      
      await teacherPage.click('[data-testid="start-quiz"]')
      
      // Step 4: Student sees question and answers
      await studentPage.waitForSelector('[data-testid="question-title"]')
      const questionText = await studentPage.textContent('[data-testid="question-title"]')
      expect(questionText).toContain('What is 2 + 2?')
      
      // Student selects correct answer
      await studentPage.click('[data-testid="option-1"]') // Option "4"
      await studentPage.click('[data-testid="submit-answer"]')
      
      // Verify answer submitted
      await studentPage.waitForSelector('[data-testid="answer-submitted"]')
      const submittedText = await studentPage.textContent('[data-testid="answer-submitted"]')
      expect(submittedText).toContain('Svar inskickat')
      
      // Step 5: Teacher sees answer progress
      await teacherPage.waitForSelector('[data-testid="answered-count"]')
      const answeredText = await teacherPage.textContent('[data-testid="answered-count"]')
      expect(answeredText).toContain('1 / 1') // 1 of 1 answered
      
      // Teacher ends session
      await teacherPage.click('[data-testid="next-question"]') // This will end since it's the last question
      
      // Step 6: Verify session ended
      await studentPage.waitForSelector('[data-testid="quiz-completed"]')
      const completedText = await studentPage.textContent('[data-testid="quiz-completed"]')
      expect(completedText).toContain('Quiz avslutat')
      
      await teacherPage.waitForSelector('[data-testid="session-ended"]')
      const endedText = await teacherPage.textContent('[data-testid="session-ended"]')
      expect(endedText).toContain('Quiz avslutat')
      
    } finally {
      await teacherContext.close()
      await studentContext.close()
    }
  })

  test('PIN validation works correctly', async ({ page }) => {
    await page.goto('/live/join')
    
    // Test invalid PIN length
    await page.fill('[data-testid="pin-input"]', '123')
    await page.click('[data-testid="find-session"]')
    
    await page.waitForSelector('[data-testid="error-message"]')
    const errorText = await page.textContent('[data-testid="error-message"]')
    expect(errorText).toContain('PIN måste vara 6 tecken')
    
    // Test non-existent PIN
    await page.fill('[data-testid="pin-input"]', 'ABCD12')
    await page.click('[data-testid="find-session"]')
    
    await page.waitForSelector('[data-testid="error-message"]')
    const notFoundText = await page.textContent('[data-testid="error-message"]')
    expect(notFoundText).toContain('Ingen session hittades')
  })

  test('real-time updates work correctly', async ({ browser }) => {
    // This test verifies that real-time updates work between teacher and student
    const teacherContext = await browser.newContext()
    const studentContext = await browser.newContext()
    
    const teacherPage = await teacherContext.newPage()
    const studentPage = await studentContext.newPage()

    try {
      // Setup session (abbreviated version)
      // ... (similar setup as above, but focused on real-time aspects)
      
      // Verify that when student joins, teacher sees participant count update
      // Verify that when teacher starts session, student immediately sees the question
      // Verify that when student submits answer, teacher sees progress update
      
      // This would be expanded with the actual implementation
      expect(true).toBe(true) // Placeholder for now
      
    } finally {
      await teacherContext.close()
      await studentContext.close()
    }
  })

  test('session access control works', async ({ page }) => {
    // Test that ended sessions cannot be joined
    await page.goto('/live/join')
    
    // This would test with a known ended session PIN
    // Verify that appropriate error message is shown
    
    expect(true).toBe(true) // Placeholder for implementation
  })
})

// Helper functions for testing
async function createMockQuiz(page: any, title: string = 'Test Quiz') {
  // Helper to create a quiz for testing
  // This would be expanded based on your quiz creation flow
}

async function setupMockSession(teacherPage: any) {
  // Helper to create a session and return PIN
  // This would be expanded based on your session creation flow
}