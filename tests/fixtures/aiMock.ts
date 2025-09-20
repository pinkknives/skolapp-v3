/**
 * AI Mock Fixtures for E2E Testing
 * 
 * Provides deterministic AI responses for testing AI-assisted quiz creation.
 * Ensures tests are stable and don't rely on external AI services.
 */

import { Page } from '@playwright/test';
import { AiQuestion } from '@/lib/ai/quizProvider';

/**
 * Mock AI response data in Swedish for testing
 */
export const MOCK_AI_QUESTIONS: AiQuestion[] = [
  {
    kind: 'multiple-choice',
    prompt: 'Vilket av följande är ett primtal?',
    choices: [
      { id: '1', text: '15', correct: false },
      { id: '2', text: '17', correct: true },
      { id: '3', text: '21', correct: false },
      { id: '4', text: '25', correct: false }
    ]
  },
  {
    kind: 'multiple-choice', 
    prompt: 'Vad är 8 × 7?',
    choices: [
      { id: '1', text: '54', correct: false },
      { id: '2', text: '56', correct: true },
      { id: '3', text: '58', correct: false },
      { id: '4', text: '64', correct: false }
    ]
  },
  {
    kind: 'free-text',
    prompt: 'Förklara kort vad ett primtal är.',
    expectedAnswer: 'Ett primtal är ett naturligt tal större än 1 som endast har två delare: 1 och sig själv.'
  },
  {
    kind: 'multiple-choice',
    prompt: 'Vilken av dessa ekvationer är korrekt?',
    choices: [
      { id: '1', text: '3 + 4 = 8', correct: false },
      { id: '2', text: '5 × 6 = 30', correct: true },
      { id: '3', text: '9 - 3 = 5', correct: false },
      { id: '4', text: '12 ÷ 4 = 4', correct: false }
    ]
  },
  {
    kind: 'free-text',
    prompt: 'Beräkna summan av de första fem positiva jämna talen.',
    expectedAnswer: '2 + 4 + 6 + 8 + 10 = 30'
  }
];

/**
 * Setup AI route interception for deterministic testing
 */
export async function setupAIMock(page: Page) {
  // Set environment variable for mock mode
  await page.addInitScript(() => {
    window.AI_MODE = 'mock';
  });

  // Intercept API calls to AI provider
  await page.route('**/api/ai/**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        questions: MOCK_AI_QUESTIONS,
        message: 'Frågor genererade!'
      }),
    });
  });

  // Also intercept direct provider calls if any
  await page.route('**/ai/generate**', async (route) => {
    // Simulate network delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questions: MOCK_AI_QUESTIONS
      }),
    });
  });
}

/**
 * Setup AI mock with error responses for testing error handling
 */
export async function setupAIMockWithErrors(page: Page) {
  await page.route('**/api/ai/**', async (route) => {
    await route.fulfill({
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'AI service temporarily unavailable. Please try again.',
        success: false
      }),
    });
  });
}

/**
 * Reset AI mock state between tests
 */
export async function resetAIMock(page: Page) {
  await page.unrouteAll();
  await page.addInitScript(() => {
    delete window.AI_MODE;
  });
}

/**
 * Get mock questions by type for testing
 */
export function getMockQuestionsByType(type: 'multiple-choice' | 'free-text'): AiQuestion[] {
  return MOCK_AI_QUESTIONS.filter(q => q.kind === type);
}

/**
 * Generate mock quiz data for testing complete flow
 */
export const MOCK_QUIZ_DATA = {
  title: 'AI-Genererat Matematik Quiz',
  description: 'Ett quiz skapat med AI-hjälp för att testa komplett flöde',
  subject: 'Matematik',
  grade: '6',
  count: 3,
  difficulty: 'medium' as const
};