/**
 * E2E Test: Home Page
 */

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('should display the header with logo', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('Postify')).toBeVisible();
  });

  test('should display post cards', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-bento-item] article', { timeout: 10000 });
    
    const posts = page.locator('[data-bento-item] article');
    await expect(posts.first()).toBeVisible();
  });

  test('should navigate to post detail on click', async ({ page }) => {
    await page.waitForSelector('[data-bento-item] article');
    
    const firstPost = page.locator('[data-bento-item] article').first();
    await firstPost.locator('a[href*="/posts/"]').first().click();
    
    await expect(page).toHaveURL(/\/posts\/\d+/);
  });

  test('should filter posts with search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|ara/i);
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('test');
    await page.waitForTimeout(500); // Debounce delay
    
    // Posts should be filtered
    await expect(page.locator('[data-bento-item] article')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    const themeButton = page.locator('button[aria-label*="theme"], button:has(svg)').first();
    
    // Get initial theme
    const htmlBefore = await page.evaluate(() => document.documentElement.dataset.theme);
    
    await themeButton.click();
    
    // Theme should change
    const htmlAfter = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(htmlAfter).not.toBe(htmlBefore);
  });
});
