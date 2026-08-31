/**
 * E2E Test: Post Details
 */

import { test, expect } from '@playwright/test';

test.describe('Post Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('[data-bento-item] article');
    await page.locator('[data-bento-item] article').first().locator('a[href*="/posts/"]').first().click();
  });

  test('should display post content', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article, [class*="content"]')).toBeVisible();
  });

  test('should display author information', async ({ page }) => {
    await expect(page.locator('[class*="author"]')).toBeVisible();
  });

  test('should have bookmark button', async ({ page }) => {
    const bookmarkButton = page.locator('button[aria-label*="bookmark"], button:has(svg[class*="bookmark"])').first();
    await expect(bookmarkButton).toBeVisible();
  });

  test('should have share buttons', async ({ page }) => {
    // Look for share section or buttons
    const shareSection = page.locator('[class*="share"], button[aria-label*="share"]');
    await expect(shareSection.first()).toBeVisible();
  });

  test('should display comments section', async ({ page }) => {
    await expect(page.locator('[class*="comment"]')).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.click('header a[href="/"]');
    await expect(page).toHaveURL(/\/$/);
  });
});
