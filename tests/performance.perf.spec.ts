import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('homepage should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds on desktop
    expect(loadTime).toBeLessThan(3000);
    
    // Check for Core Web Vitals
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            resolve(entries[entries.length - 1].startTime);
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
    });
    
    if (lcp) {
      expect(lcp).toBeLessThan(2500); // 2.5s target
    }
  });

  test('quiz creation page should have good performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/teacher/quiz/create', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    // Check that the page is interactive quickly
    await page.getByLabel('Titel').fill('Performance Test');
    const interactionTime = Date.now() - startTime;
    expect(interactionTime).toBeLessThan(1000); // Should be interactive within 1s
  });

  test('quiz join page should load quickly for students', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/quiz/join', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // Students need quick access
    
    // Check that form is immediately interactive
    await page.getByLabel('Quiz-kod').fill('TEST');
    const interactionTime = Date.now() - startTime;
    expect(interactionTime).toBeLessThan(500);
  });

  test('AI panel should not block main thread', async ({ page }) => {
    await page.goto('/teacher/quiz/create');
    
    const startTime = Date.now();
    
    // Open AI panel
    await page.getByRole('button', { name: 'AI-utkast' }).click();
    
    const panelOpenTime = Date.now() - startTime;
    expect(panelOpenTime).toBeLessThan(300); // Should open quickly
    
    // Page should remain responsive
    await page.getByLabel('Titel').fill('Responsiveness Test');
    const responsiveTime = Date.now() - startTime;
    expect(responsiveTime).toBeLessThan(500);
  });

  test('bundle size should be within limits', async ({ page }) => {
    // Navigate to a page and check resource sizes
    await page.goto('/');
    
    const resourceSizes = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry: any) => ({
        name: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize
      }));
    });
    
    // Find main JavaScript bundle
    const jsBundles = resourceSizes.filter(resource => 
      resource.name.includes('.js') && 
      resource.name.includes('_app') ||
      resource.name.includes('main')
    );
    
    // Check that main bundle is reasonable size (uncompressed)
    jsBundles.forEach(bundle => {
      expect(bundle.encodedBodySize).toBeLessThan(400 * 1024); // 400KB uncompressed
    });
  });

  test('images should be optimized', async ({ page }) => {
    await page.goto('/');
    
    const imageResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter((entry: any) => entry.name.match(/\.(jpg|jpeg|png|webp|avif)$/i))
        .map((entry: any) => ({
          name: entry.name,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize
        }));
    });
    
    // Images should be reasonably sized
    imageResources.forEach(image => {
      // No single image should be larger than 500KB
      expect(image.encodedBodySize).toBeLessThan(500 * 1024);
    });
  });

  test('page should have minimal layout shift', async ({ page }) => {
    await page.goto('/');
    
    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Only count layout shifts without user input
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Resolve after page is loaded
        setTimeout(() => resolve(clsValue), 3000);
      });
    });
    
    // CLS should be less than 0.1
    expect(cls).toBeLessThan(0.1);
  });
});