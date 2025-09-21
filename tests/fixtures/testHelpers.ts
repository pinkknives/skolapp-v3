/**
 * E2E Test Data Helpers
 * 
 * Provides utilities for creating, managing, and cleaning up test data
 * including users, quizzes, and sessions with proper metadata tagging.
 */

import { Page, expect } from '@playwright/test';
import { supabaseBrowser } from '@/lib/supabase-browser';

// Test user metadata marker
export const E2E_USER_METADATA = { e2e: true, created_at: new Date().toISOString() };

/**
 * Generate unique test data with timestamps to avoid collisions
 */
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  return {
    userEmail: `e2e-user-${timestamp}-${random}@test.skolapp.se`,
    userPassword: 'TestPassword123!',
    quizTitle: `E2E Test Quiz ${timestamp}`,
    sessionPin: `${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp,
    random
  };
}

/**
 * Create a test user with E2E metadata
 */
export async function createTestUser(page: Page, userData?: { email: string; password: string }) {
  const data = userData || generateTestData();
  
  // Navigate to signup page
  await page.goto('/auth/signup');
  
  // Fill signup form
  await page.fill('[data-testid="email-input"]', data.userEmail);
  await page.fill('[data-testid="password-input"]', data.userPassword);
  await page.fill('[data-testid="confirm-password-input"]', data.userPassword);
  
  // Submit form
  await page.click('[data-testid="signup-button"]');
  
  // Wait for redirect to dashboard or confirmation
  await page.waitForURL(/\/(dashboard|teacher|auth\/confirm)/, { timeout: 10000 });
  
  return data;
}

/**
 * Login with test user credentials
 */
export async function loginTestUser(page: Page, credentials: { email: string; password: string }) {
  await page.goto('/auth/login');
  
  await page.fill('[data-testid="email-input"]', credentials.email);
  await page.fill('[data-testid="password-input"]', credentials.password);
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login
  await page.waitForURL(/\/(dashboard|teacher)/, { timeout: 10000 });
}

/**
 * Create a test quiz with proper metadata
 */
export async function createTestQuiz(page: Page, quizData?: {
  title?: string;
  description?: string;
  subject?: string;
  grade?: string;
}) {
  const data = {
    title: quizData?.title || generateTestData().quizTitle,
    description: quizData?.description || 'E2E test quiz description',
    subject: quizData?.subject || 'Matematik',
    grade: quizData?.grade || '6'
  };
  
  // Navigate to quiz creation
  await page.goto('/teacher/quiz/create');
  
  // Fill basic quiz information
  await page.fill('[data-testid="quiz-title-input"]', data.title);
  await page.fill('[data-testid="quiz-description-input"]', data.description);
  
  // Select subject and grade if selectors exist
  if (await page.locator('[data-testid="subject-select"]').isVisible()) {
    await page.selectOption('[data-testid="subject-select"]', data.subject);
  }
  if (await page.locator('[data-testid="grade-select"]').isVisible()) {
    await page.selectOption('[data-testid="grade-select"]', data.grade);
  }
  
  return data;
}

/**
 * Add a multiple choice question to quiz
 */
export async function addMultipleChoiceQuestion(
  page: Page, 
  questionData: {
    prompt: string;
    choices: { text: string; correct: boolean }[];
  }
) {
  // Click add question button
  await page.click('[data-testid="add-question-button"]');
  
  // Select multiple choice type
  await page.click('[data-testid="question-type-multiple-choice"]');
  
  // Fill question prompt
  await page.fill('[data-testid="question-prompt-input"]', questionData.prompt);
  
  // Fill choices
  for (let i = 0; i < questionData.choices.length; i++) {
    const choice = questionData.choices[i];
    await page.fill(`[data-testid="choice-${i}-input"]`, choice.text);
    
    if (choice.correct) {
      await page.click(`[data-testid="choice-${i}-correct"]`);
    }
  }
}

/**
 * Create a complete test quiz with questions
 */
export async function createCompleteTestQuiz(page: Page) {
  const quizData = await createTestQuiz(page);
  
  // Add a multiple choice question
  await addMultipleChoiceQuestion(page, {
    prompt: 'Vad är 2 + 2?',
    choices: [
      { text: '3', correct: false },
      { text: '4', correct: true },
      { text: '5', correct: false }
    ]
  });
  
  // Save quiz
  await page.click('[data-testid="save-quiz-button"]');
  
  // Wait for save confirmation
  await expect(page.locator('[data-testid="save-success"]')).toBeVisible({ timeout: 5000 });
  
  return quizData;
}

/**
 * Create a live quiz session for testing
 */
export async function createLiveSession(page: Page, quizId?: string) {
  if (quizId) {
    await page.goto(`/teacher/quiz/${quizId}`);
  }
  
  // Start live session
  await page.click('[data-testid="start-live-session-button"]');
  
  // Wait for session to be created
  await page.waitForSelector('[data-testid="session-pin"]', { timeout: 10000 });
  
  // Get session PIN
  const sessionPin = await page.textContent('[data-testid="session-pin"]');
  
  return { sessionPin };
}

/**
 * Join a live session as a student
 */
export async function joinLiveSession(page: Page, sessionPin: string, displayName: string = 'E2E Test Student') {
  await page.goto('/live/join');
  
  // Enter session PIN
  await page.fill('[data-testid="session-pin-input"]', sessionPin);
  await page.click('[data-testid="find-session-button"]');
  
  // Wait for session details
  await page.waitForSelector('[data-testid="session-info"]', { timeout: 5000 });
  
  // Enter display name
  await page.fill('[data-testid="display-name-input"]', displayName);
  await page.click('[data-testid="join-session-button"]');
  
  // Wait for lobby
  await page.waitForSelector('[data-testid="session-lobby"]', { timeout: 5000 });
}

/**
 * Wait for a specific state in live session
 */
export async function waitForSessionState(page: Page, state: 'lobby' | 'active' | 'question' | 'results') {
  const selectors = {
    lobby: '[data-testid="session-lobby"]',
    active: '[data-testid="session-active"]', 
    question: '[data-testid="current-question"]',
    results: '[data-testid="session-results"]'
  };
  
  await page.waitForSelector(selectors[state], { timeout: 10000 });
}

/**
 * Cleanup test data - remove E2E users and their associated data
 */
export async function cleanupTestData() {
  if (typeof window === 'undefined') {
    // Server-side cleanup would go here
    console.log('Server-side cleanup not implemented in browser context');
    return;
  }
  
  try {
    const _supabase = supabaseBrowser();
    
    // This would need to be run with service role permissions
    // For now, we just log what we would clean up
    console.log('E2E cleanup: Would remove users with metadata.e2e = true');
    console.log('E2E cleanup: Would remove associated quizzes, sessions, etc.');
    
    // In practice, this should be handled by a server-side cleanup job
    // or a database function with proper permissions
    
  } catch (_error) {
    console.warn('E2E cleanup failed:', _error);
  }
}

/**
 * Mark test data for cleanup with metadata
 */
export function getE2EMetadata(additionalData?: Record<string, unknown>) {
  return {
    ...E2E_USER_METADATA,
    test_run_id: process.env.GITHUB_RUN_ID || 'local',
    created_by: 'e2e-test',
    ...additionalData
  };
}

/**
 * Wait for element with better error messages
 */
export async function waitForTestId(page: Page, testId: string, options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' }) {
  try {
    await page.waitForSelector(`[data-testid="${testId}"]`, {
      timeout: options?.timeout || 10000,
      state: options?.state || 'visible'
    });
  } catch (_error) {
    throw new Error(`Failed to find element with data-testid="${testId}". Make sure the element exists and has the correct test ID.`);
  }
}

/**
 * Take a screenshot with descriptive name for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  if (process.env.CI) {
    await page.screenshot({ 
      path: `test-results/debug-${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}

/**
 * Network idle helper for stable testing
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 2000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Retry an action with exponential backoff
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}