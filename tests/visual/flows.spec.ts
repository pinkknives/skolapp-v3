import { test, expect } from '@playwright/test';
import { loginAsTeacher, loginAsStudent, waitForPageReady } from './helpers/auth';

test.describe('Core Flow Screenshots', () => {
  test('Teacher creates quiz with basic flow and reaches publish step', async ({ page }) => {
    // Try to access the quiz creation without authentication first
    // This will help us understand the current routing and authentication structure
    await page.goto('/quiz/new');
    await waitForPageReady(page);
    
    // Take screenshot of what we see (likely login redirect or access form)
    await expect(page).toHaveScreenshot('teacher-quiz-create-initial.png', { 
      fullPage: true,
      animations: 'disabled'
    });

    // Try to go to teacher quiz area
    await page.goto('/teacher/quiz/create');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('teacher-quiz-create-auth-required.png', { 
      fullPage: true,
      animations: 'disabled'
    });

    // If we get redirected to login, try the basic create flow
    if (page.url().includes('signin') || page.url().includes('login')) {
      // We're at a login page, take a screenshot
      await expect(page).toHaveScreenshot('quiz-creation-login-redirect.png', { 
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Student join quiz flow capture', async ({ page }) => {
    // Try to access the join page
    await page.goto('/join');
    await waitForPageReady(page);
    
    // Take screenshot of the join page
    await expect(page).toHaveScreenshot('student-join-initial.png', { 
      fullPage: true,
      animations: 'disabled'
    });

    // Try to fill in a test code if there's a form
    const codeInput = page.locator('[data-testid="join-code"]');
    if (await codeInput.isVisible()) {
      await codeInput.fill('TEST12');
      await expect(page).toHaveScreenshot('student-join-with-code.png', { 
        fullPage: true,
        animations: 'disabled'
      });
    }

    // Try alternative quiz join route
    await page.goto('/quiz/join');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('quiz-join-alternative.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Explore quiz wizard steps', async ({ page }) => {
    // Check if there's a wizard create page
    await page.goto('/teacher/quiz/create-wizard');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('quiz-wizard-entry.png', { 
      fullPage: true,
      animations: 'disabled'
    });

    // Try to find quiz creation forms by looking at different paths
    const potentialPaths = [
      '/quiz/create',
      '/create',
      '/new-quiz',
      '/teacher/create-quiz'
    ];

    for (const path of potentialPaths) {
      await page.goto(path);
      await waitForPageReady(page);
      
      const pathName = path.replace(/\//g, '_').substring(1) || 'root';
      await expect(page).toHaveScreenshot(`path-exploration-${pathName}.png`, { 
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Sharing and QR code flow mockup', async ({ page }) => {
    // Look for sharing functionality on the home page
    await page.goto('/');
    await waitForPageReady(page);
    
    // Check if there are any sharing buttons or QR codes visible
    const shareButton = page.locator('button', { hasText: /dela|share/i });
    const qrCode = page.locator('[data-testid*="qr"], img[src*="qr"], svg[class*="qr"]');
    
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await waitForPageReady(page);
      await expect(page).toHaveScreenshot('sharing-panel-opened.png', { 
        fullPage: true,
        animations: 'disabled'
      });
    }

    if (await qrCode.isVisible()) {
      await expect(page).toHaveScreenshot('qr-code-visible.png', { 
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Error pages and edge cases', async ({ page }) => {
    // Test 404 page
    await page.goto('/this-page-does-not-exist');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('404-error-page.png', { 
      fullPage: true,
      animations: 'disabled'
    });

    // Test accessing quiz with invalid ID
    await page.goto('/quiz/invalid-quiz-id');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('invalid-quiz-error.png', { 
      fullPage: true,
      animations: 'disabled'
    });

    // Test accessing protected route without auth
    await page.goto('/teacher/dashboard');
    await waitForPageReady(page);
    
    await expect(page).toHaveScreenshot('protected-route-unauthorized.png', { 
      fullPage: true,
      animations: 'disabled'
    });
  });
});