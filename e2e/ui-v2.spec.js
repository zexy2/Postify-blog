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


  test('login surface remains clear and operable', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('unknown routes render the quiet 404 recovery surface', async ({ page }) => {
    await page.goto('/definitely-not-a-postify-route');
    await expect(page.getByText('404', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /home|ana sayfa|keşfet/i }).first()).toBeVisible();
  });


  test('about page explains the product without portfolio clutter', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/farklı sorunlar|different problems/i)).toBeVisible();
    await expect(page.getByText(/React 19 & Vite|Supabase Data & Auth/i)).toHaveCount(0);
  });

  test('contact page exposes direct channels without bento clutter', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /zekiakgul09@gmail.com/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /@zexy2/i })).toBeVisible();
  });

  test('mobile discovery filters stay in one scrollable row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const allFormats = page.getByRole('button', { name: /tüm biçimler|all formats/i });
    await expect(allFormats).toBeVisible();
    const filter = allFormats.locator('..');
    const wrap = await filter.evaluate((element) => getComputedStyle(element).flexWrap);
    expect(wrap).toBe('nowrap');
  });

  test('reduced motion preference keeps the page usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
