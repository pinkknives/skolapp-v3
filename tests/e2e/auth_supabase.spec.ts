import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const screenshots = {
  home: 'screenshots/01_home.png',
  loggedIn: 'screenshots/02_logged_in.png',
};

const unique = () => Math.random().toString(36).slice(2, 10);
const PASSWORD = 'TestUser!234'; // endast för E2E, skapas & rensas

test.describe('Supabase Auth E2E', () => {
  const base = process.env.BASE_URL!;
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(supabaseUrl, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });

  let email = `e2e.${Date.now()}_${unique()}@example.com`;
  let userId: string | undefined;

  test.beforeAll(async () => {
    // Skapa test user via Admin API (skip e-mail confirm)
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { e2e: true, createdBy: 'auth_supabase.spec.ts' },
    });
    if (error) throw error;
    userId = data.user?.id;
    console.log('Skapade testuser:', email, userId);
  });

  test.afterAll(async () => {
    if (userId) {
      await admin.auth.admin.deleteUser(userId).catch((e) => {
        console.warn('Kunde inte radera testuser', e?.message || e);
      });
    }
  });

  test('Skapa användare (admin) → logga in via UI → verifiera dashboard', async ({ page }) => {
    expect(base, 'BASE_URL måste vara satt').toBeTruthy();

    // 1) Gå till appen (home page först för screenshot)
    await page.goto(base, { waitUntil: 'load' });
    await page.screenshot({ path: screenshots.home, fullPage: true });

    // 2) Navigera direkt till test login page för mer pålitlig testning
    await page.goto(`${base}/test-login`, { waitUntil: 'load' });
    
    // 3) Fyll i login (kräver data-testid i UI:t)
    await page.waitForSelector('[data-testid="login-email"]', { timeout: 10000 });
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(PASSWORD);
    await page.getByTestId('login-submit').click();

    // 4) Vänta inloggat läge - kontrollera för antingen dashboard eller user profile
    await page.waitForLoadState('networkidle');
    
    // Efter lyckad login borde vi vara på /teacher sidan
    await page.waitForURL('**/teacher', { timeout: 30000 });
    
    // Kontrollera att dashboard är synligt
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 10000 });
    
    // Kontrollera att user profile knappen finns i navbar
    await expect(page.getByTestId('user-profile')).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: screenshots.loggedIn, fullPage: true });

    console.log('✅ Test lyckades - användaren är inloggad och UI visar korrekt tillstånd');
  });
});