import { Page, expect } from '@playwright/test';

/**
 * Helper function to log in as a teacher for visual testing
 * Uses test accounts configured in environment variables
 */
export async function loginAsTeacher(page: Page) {
  await page.goto('/auth/signin');
  
  // Wait for the login form to be visible
  await page.waitForSelector('[data-testid="email"]', { timeout: 10000 });
  
  await page.getByTestId('email').fill(process.env.TEST_TEACHER_EMAIL || 'teacher@test.skolapp.dev');
  await page.getByTestId('password').fill(process.env.TEST_TEACHER_PASSWORD || 'testpassword123');
  await page.getByTestId('login-submit').click();
  
  // Wait for successful login - expect to be redirected to dashboard, quizzes, or home
  await expect(page).toHaveURL(/dashboard|quizzes|teacher|\/$/);
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to log in as a student for visual testing
 * Uses test accounts configured in environment variables
 */
export async function loginAsStudent(page: Page) {
  await page.goto('/auth/signin');
  
  // Wait for the login form to be visible
  await page.waitForSelector('[data-testid="email"]', { timeout: 10000 });
  
  await page.getByTestId('email').fill(process.env.TEST_STUDENT_EMAIL || 'student@test.skolapp.dev');
  await page.getByTestId('password').fill(process.env.TEST_STUDENT_PASSWORD || 'testpassword123');
  await page.getByTestId('login-submit').click();
  
  // Wait for successful login - expect to be redirected to dashboard or home
  await expect(page).toHaveURL(/dashboard|student|\/$/);
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to wait for page to be ready for screenshots
 * Ensures all animations are complete and images are loaded
 */
export async function waitForPageReady(page: Page) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for any pending animations to complete
  await page.waitForTimeout(500);
  
  // Ensure all images are loaded
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
          img.onload = img.onerror = resolve;
        }))
    );
  });
}