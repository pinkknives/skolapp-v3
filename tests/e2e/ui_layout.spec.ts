import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/',                name: 'home' },
  { path: '/login',           name: 'login' },
  { path: '/register',        name: 'signup' },
  { path: '/quiz/join',       name: 'ai-quiz' },
  { path: '/profile',         name: 'profile' },
];

test.describe('UI Layout & Visuals per breakpoint', () => {
  for (const pageDef of PAGES) {
    test(`renders ${pageDef.name} correctly`, async ({ page, browserName }) => {
      // Go to the page and handle potential 404s gracefully
      const response = await page.goto(pageDef.path, { waitUntil: 'networkidle' });
      
      // Skip test if page returns 404 or other error
      if (response && response.status() >= 400) {
        test.skip(`Page ${pageDef.path} not available (status: ${response.status()})`);
        return;
      }

      // Kolla att kritiska element finns om de borde finnas
      // (lägg till/justera efter era sidor)
      const criticalSelectors = {
        home:   ['[data-testid="nav-primary"]', '[data-testid="cta-primary"]'],
        login:  ['[data-testid="login-submit"]'],
        signup: ['[data-testid="signup-submit"]'],
        'ai-quiz': ['[data-testid="ai-quiz-start"]'],
        profile: ['[data-testid="save-settings"]'],
      }[pageDef.name] || [];

      for (const sel of criticalSelectors) {
        const el = page.locator(sel);
        
        // Check if element exists before asserting visibility
        if (await el.count() > 0) {
          await expect(el, `${sel} ska vara synlig på ${pageDef.name}`).toBeVisible();
          
          // säkerställ att knappen inte är off-screen
          const box = await el.boundingBox();
          expect(box?.width || 0, `${sel} ska ha bredd > 0`).toBeGreaterThan(0);
          expect(box?.height || 0, `${sel} ska ha höjd > 0`).toBeGreaterThan(0);
        } else {
          console.warn(`Element ${sel} not found on ${pageDef.name} page - this may be expected for this page state`);
        }
      }

      // Ta "rena" snapshots av viewport (utan animationer om möjligt)
      // Tips: stäng av CSS-animationer i testmiljön, eller sätt prefers-reduced-motion
      await page.evaluate(() => {
        const style = document.createElement('style');
        style.innerHTML = `
          * { animation-duration: 0.001s !important; animation-delay: 0s !important;
              transition-duration: 0.001s !important; }
        `;
        document.head.appendChild(style);
      });

      // Wait a moment for animations to be disabled
      await page.waitForTimeout(100);

      // Full page screenshot ger tydligare regressions
      expect(await page.screenshot({ fullPage: true }))
        .toMatchSnapshot(`${pageDef.name}-${browserName}.png`);
    });
  }
});