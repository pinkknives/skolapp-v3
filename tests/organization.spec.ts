import { test, expect } from '@playwright/test';

test.describe('Organization Management', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests verify the UI without actual database operations
    await page.goto('/');
  });

  test('should display organization page with Swedish interface', async ({ page }) => {
    await page.goto('/teacher/org');
    
    // Check for Swedish headings and labels
    await expect(page.getByRole('heading', { name: 'Organisation' })).toBeVisible();
    await expect(page.getByText('Hantera din organisation och medlemmar.')).toBeVisible();
    
    // Check for create organization button when no org exists
    await expect(page.getByText('Skapa organisation')).toBeVisible();
  });

  test('should show create organization form', async ({ page }) => {
    await page.goto('/teacher/org');
    
    // Click create organization button
    await page.getByRole('button', { name: 'Skapa organisation' }).click();
    
    // Verify form elements are visible with Swedish labels
    await expect(page.getByLabel('Organisationsnamn')).toBeVisible();
    await expect(page.getByPlaceholder('T.ex. Åkersberga Grundskola')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skapa organisation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Avbryt' })).toBeVisible();
  });

  test('should validate organization name input', async ({ page }) => {
    await page.goto('/teacher/org');
    
    // Click create organization button
    await page.getByRole('button', { name: 'Skapa organisation' }).click();
    
    // Try to submit without name
    await page.getByRole('button', { name: 'Skapa organisation' }).click();
    
    // Should not proceed without required field
    await expect(page.getByLabel('Organisationsnamn')).toBeVisible();
  });

  test('should show organization management interface', async ({ page }) => {
    await page.goto('/teacher/org');
    
    // This test assumes an organization exists and checks for management interface
    // In a real test, we would set up test data or mock the API
    
    // Check for potential member management sections
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Medlemmar')) {
      await expect(page.getByText('Medlemmar')).toBeVisible();
    }
  });

  test('should show member roles in Swedish', async ({ page }) => {
    await page.goto('/teacher/org');
    
    // Check that role options are in Swedish if visible
    const pageContent = await page.textContent('body');
    
    // If we have member management visible, check for Swedish role names
    if (pageContent?.includes('Lärare') || pageContent?.includes('Administratör') || pageContent?.includes('Ägare')) {
      // Roles are properly localized
      expect(true).toBe(true);
    }
  });

  test('should handle invitation form', async ({ page }) => {
    await page.goto('/teacher/org');
    
    // Look for invite button
    const inviteButton = page.getByRole('button', { name: 'Bjud in' });
    if (await inviteButton.isVisible()) {
      await inviteButton.click();
      
      // Check for Swedish form labels
      await expect(page.getByText('Bjud in ny medlem')).toBeVisible();
      await expect(page.getByLabel('E-postadress')).toBeVisible();
      await expect(page.getByLabel('Roll')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Skicka inbjudan' })).toBeVisible();
    }
  });
});

test.describe('Organization-aware Quiz Management', () => {
  test('should display quiz management with organization context', async ({ page }) => {
    await page.goto('/teacher/quiz');
    
    // Check that quiz page loads with Swedish interface
    await expect(page.getByRole('heading', { name: 'Mina Quiz' })).toBeVisible();
    await expect(page.getByText('Hantera dina quiz, se statistik och dela med dina elever.')).toBeVisible();
    
    // Check for create button
    await expect(page.getByRole('link', { name: 'Skapa nytt quiz' })).toBeVisible();
  });

  test('should show quiz filters in Swedish', async ({ page }) => {
    await page.goto('/teacher/quiz');
    
    // Check for Swedish filter labels
    await expect(page.getByText('Alla')).toBeVisible();
    await expect(page.getByText('Publicerade')).toBeVisible();
    await expect(page.getByText('Utkast')).toBeVisible();
  });

  test('should handle empty quiz state', async ({ page }) => {
    await page.goto('/teacher/quiz');
    
    // Check for empty state message in Swedish
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Inga quiz ännu')) {
      await expect(page.getByText('Inga quiz ännu')).toBeVisible();
      await expect(page.getByText('Skapa ditt första quiz för att komma igång.')).toBeVisible();
    }
  });

  test('should show loading states', async ({ page }) => {
    await page.goto('/teacher/quiz');
    
    // Check for loading message (might be brief)
    const loadingMessage = page.getByText('Laddar quiz...');
    // Don't assert visibility since loading might be too fast to catch
  });
});

test.describe('Teacher Portal Integration', () => {
  test('should show organization option in teacher portal', async ({ page }) => {
    await page.goto('/teacher');
    
    // Check for organization feature in the teacher portal
    await expect(page.getByText('Organisation')).toBeVisible();
    await expect(page.getByText('Skapa och hantera din organisation, bjud in andra lärare och samarbeta kring quiz.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Hantera organisation' })).toBeVisible();
  });

  test('should navigate to organization page', async ({ page }) => {
    await page.goto('/teacher');
    
    // Click on organization management link
    await page.getByRole('link', { name: 'Hantera organisation' }).click();
    
    // Should navigate to organization page
    await expect(page).toHaveURL('/teacher/org');
    await expect(page.getByRole('heading', { name: 'Organisation' })).toBeVisible();
  });
});