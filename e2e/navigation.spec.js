/**
 * E2E Test: Navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('./');

    // Navigate to analytics
    await page.click('a[href*="analytics"]');
    await expect(page).toHaveURL(/\/Postify-blog\/analytics$/);

    // Navigate back to home
    await page.click('header a[href="/Postify-blog"]');
    await expect(page).toHaveURL(/\/Postify-blog\/?$/);
  });

  test('should protect bookmarks for signed-out users', async ({ page }) => {
    await page.goto('./bookmarks');
    await expect(page).toHaveURL(/\/Postify-blog\/auth\/login$/);
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('./unknown-page');
    
    await expect(page.getByText('404')).toBeVisible();
  });

  test('should have responsive navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('./');

    // Header should still be visible
    await expect(page.locator('header')).toBeVisible();
  });
});
