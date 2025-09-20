import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers/auth';

const routes = [
  { path: '/', name: 'home' },
  { path: '/join', name: 'join' },
  { path: '/auth/signin', name: 'auth-signin' },
  { path: '/auth/signup', name: 'auth-signup' },
  { path: '/register', name: 'register' },
  { path: '/pricing', name: 'pricing' },
  // Quiz related pages (may need authentication)
  { path: '/quiz/new', name: 'quiz-new-step1' },
  { path: '/quiz/take', name: 'quiz-take' },
  { path: '/quiz/join', name: 'quiz-join' },
  // Teacher pages (may need authentication)
  { path: '/teacher', name: 'teacher-dashboard' },
  { path: '/teacher/quiz', name: 'teacher-quiz' },
  { path: '/teacher/quiz/create', name: 'teacher-quiz-create' },
  // Student pages (may need authentication)
  { path: '/student', name: 'student-dashboard' },
  // Test error pages
  { path: '/non-existent-page', name: '404-error' },
];

test.describe('Page Screenshots - All Public and Main Routes', () => {
  // Test routes that don't require authentication
  const publicRoutes = routes.filter(r => 
    !r.path.includes('/teacher/') && 
    !r.path.includes('/student/') && 
    !r.path.includes('/quiz/new') &&
    !r.path.includes('/quiz/take') &&
    !r.name.includes('teacher-') &&
    !r.name.includes('student-')
  );

  for (const route of publicRoutes) {
    test(`page: ${route.name}`, async ({ page }) => {
      // Handle 404 pages differently
      if (route.name === '404-error') {
        await page.goto(route.path);
        // Wait for the 404 page to load
        await page.waitForSelector('h1, [role="heading"]', { timeout: 5000 });
      } else {
        await page.goto(route.path, { waitUntil: 'networkidle' });
      }
      
      await waitForPageReady(page);
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`${route.name}.png`, { 
        fullPage: true,
        animations: 'disabled'
      });
    });
  }
});

test.describe('Page Screenshots - Protected Routes (with mock authentication)', () => {
  // Test protected routes - we'll use a simple mock approach
  const protectedRoutes = routes.filter(r => 
    r.path.includes('/teacher/') || 
    r.path.includes('/student/') || 
    r.path.includes('/quiz/new') ||
    r.path.includes('/quiz/take') ||
    r.name.includes('teacher-') ||
    r.name.includes('student-')
  );

  for (const route of protectedRoutes) {
    test(`protected page: ${route.name}`, async ({ page }) => {
      // For now, just capture what the page looks like without authentication
      // This will likely show login redirects or access denied messages
      await page.goto(route.path, { waitUntil: 'networkidle' });
      await waitForPageReady(page);
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`${route.name}-unauthenticated.png`, { 
        fullPage: true,
        animations: 'disabled'
      });
    });
  }
});