/**
 * E2E Test: Authentication
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('./auth/login');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/login|giriş/i);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|şifre/i)).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('./auth/register');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/register|kayıt/i);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('./auth/login');

    // Click register link
    await page.click('a[href*="register"]');
    await expect(page).toHaveURL(/\/auth\/register/);

    // Click login link
    await page.click('a[href*="login"]');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('./auth/login');

    const submitButton = page.getByRole('button', { name: /login|giriş/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('[class*="error"]')).toBeVisible();
  });

  test('should have OAuth buttons', async ({ page }) => {
    await page.goto('./auth/login');

    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
  });
});
