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

    // 1) Gå till appen
    await page.goto(base, { waitUntil: 'load' });
    await page.screenshot({ path: screenshots.home, fullPage: true });

    // 2) Navigera till login-formuläret (klicka på "Logga in" knappen)
    await page.getByText('Logga in').first().click();
    
    // 3) Vänta på att modal/form visas och fyll i login (kräver data-testid i UI:t)
    await page.waitForSelector('[data-testid="login-email"]', { timeout: 10000 });
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(PASSWORD);
    await page.getByTestId('login-submit').click();

    // 4) Vänta inloggat läge - kontrollera för antingen dashboard eller user profile
    await page.waitForLoadState('networkidle');
    
    // Försök hitta dashboard först, annars user profile
    const dashboardVisible = await page.getByTestId('dashboard').isVisible().catch(() => false);
    const userProfileVisible = await page.getByTestId('user-profile').isVisible().catch(() => false);
    
    expect(dashboardVisible || userProfileVisible, 'Antingen dashboard eller user-profile borde vara synlig efter login').toBeTruthy();
    
    await page.screenshot({ path: screenshots.loggedIn, fullPage: true });

    // 5) Bonus: enkel sanity – kontrollera att någon "profil"-komponent finns
    if (userProfileVisible) {
      await expect(page.getByTestId('user-profile')).toBeVisible();
    }
  });
});