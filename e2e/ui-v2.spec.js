import { test, expect } from '@playwright/test';

test.describe('Postify UI V2', () => {
  test('desktop discovery has the editorial hierarchy and practical navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const primaryNav = page.locator('header nav[aria-label="Primary"]');
    await expect(primaryNav.getByRole('link', { name: /rehberler|guides/i })).toBeVisible();
    await expect(primaryNav.getByRole('link', { name: /kararlar|decisions/i })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
  });

  test('direct article renders a readable editorial surface', async ({ page }) => {
    await page.goto('/posts/ai-muhendisligi');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
    const articleWidth = await page.locator('article').evaluate((element) => element.getBoundingClientRect().width);
    expect(articleWidth).toBeLessThan(1000);
  });

  test('mobile home does not overflow and menu remains operable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const menu = page.locator('header button[aria-expanded]').first();
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
  });

  test('reduced motion preference keeps the page usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
