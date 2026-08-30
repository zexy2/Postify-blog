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

  test('desktop format navigation activates, filters, and lands on the selected feed', async ({ page }) => {
    await page.setViewportSize({ width: 1304, height: 844 });
    await page.goto('/');

    const primaryNav = page.locator('header nav[aria-label="Primary"]');
    const explore = primaryNav.getByRole('link', { name: /keşfet|explore/i });
    await expect(explore).toHaveAttribute('aria-current', 'page');

    const cases = [
      { link: /rehberler|guides/i, filter: /^rehber$|^guide$/i, type: 'guide' },
      { link: /kararlar|decisions/i, filter: /karar notu|decision note/i, type: 'decision' },
      { link: /saha notları|field notes/i, filter: /saha notu|field note/i, type: 'fieldNote' },
    ];

    for (const item of cases) {
      const link = primaryNav.getByRole('link', { name: item.link });
      await link.click();
      await expect(page).toHaveURL(new RegExp(`[?&]type=${item.type}#knowledge-feed$`));
      await expect(link).toHaveAttribute('aria-current', 'page');
      await expect(explore).not.toHaveAttribute('aria-current', 'page');

      const activeFilter = page.getByRole('group', { name: /filter by content format|içerik biçimine göre filtrele/i })
        .getByRole('button', { name: item.filter });
      await expect(activeFilter).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#knowledge-feed')).toBeInViewport();
      expect(await page.locator('#knowledge-feed [data-card-variant]').count()).toBeGreaterThan(0);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }

    await explore.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(explore).toHaveAttribute('aria-current', 'page');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(4);
  });

  test('footer format navigation lands on the filtered feed and home actions reset to the top', async ({ page }) => {
    for (const width of [390, 1304]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');

      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      const formatNav = footer.getByRole('navigation', { name: /içerik biçimleri|content formats/i });
      const guides = formatNav.getByRole('link', { name: /^rehberler$|^guides$/i });
      await guides.click();

      await expect(page).toHaveURL(/[?&]type=guide#knowledge-feed$/);
      await expect(page.getByRole('button', { name: /^rehber$|^guide$/i })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#knowledge-feed')).toBeInViewport();

      await footer.scrollIntoViewIfNeeded();
      await footer.getByRole('link', { name: /bilgiyi keşfet|explore knowledge/i }).click();
      await expect(page).toHaveURL(/\/$/);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
    }
  });

  test('footer controls stay touch-safe across the tablet navigation range', async ({ page }) => {
    for (const width of [600, 820, 960]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();

      const targets = [
        footer.getByRole('link', { name: 'Postify home' }),
        footer.getByRole('link', { name: /github/i }),
        footer.getByRole('navigation', { name: /içerik biçimleri|content formats/i }).getByRole('link').first(),
        footer.getByRole('navigation', { name: /postify sayfaları|postify pages/i }).getByRole('link').first(),
        footer.getByRole('button', { name: /başa dön|back to top/i }),
      ];

      for (const target of targets) {
        await expect(target).toBeVisible();
        expect((await target.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });

  test('pathname navigation moves focus to main while in-page filters keep their trigger focus', async ({ page }) => {
    await page.setViewportSize({ width: 1304, height: 844 });
    await page.goto('/');

    const about = page.locator('footer').getByRole('link', { name: /about|hakkında/i });
    await about.scrollIntoViewIfNeeded();
    await about.focus();
    await about.press('Enter');
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('#main-content')).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);

    await page.goto('/');
    const guides = page.locator('header nav[aria-label="Primary"]').getByRole('link', { name: /guides|rehberler/i });
    await guides.focus();
    await guides.press('Enter');
    await expect(page).toHaveURL(/[?&]type=guide#knowledge-feed$/);
    await expect(guides).toBeFocused();
    await expect(page.locator('#main-content')).not.toBeFocused();
  });

  test('direct article renders a readable editorial surface', async ({ page }) => {
    await page.goto('/posts/ai-muhendisligi');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
    const articleWidth = await page.locator('article').evaluate((element) => element.getBoundingClientRect().width);
    expect(articleWidth).toBeLessThan(1000);
  });

  test('V3 article surfaces trust before reading and stays mobile-safe', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/posts/ai-muhendisligi');
    const article = page.locator('article').first();
    const heading = article.getByRole('heading', { level: 1 });
    const trust = article.locator('.evidence-badge').first();
    await expect(heading).toBeVisible();
    await expect(trust).toBeVisible();
    const [headingBox, trustBox] = await Promise.all([heading.boundingBox(), trust.boundingBox()]);
    expect(trustBox.y).toBeLessThan(headingBox.y);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(article.getByText(/undefined\s*(dk|min)/i)).toHaveCount(0);
  });

  test('mobile article and editor controls stay touch-safe and contained', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/posts/node-json-dogrulama');

    const feedbackButtons = page.locator('#evidence-feedback button');
    await expect(feedbackButtons.first()).toBeVisible();
    for (const box of await feedbackButtons.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height))) {
      expect(box).toBeGreaterThanOrEqual(44);
    }

    const copyCode = page.getByRole('button', { name: /^kopyala$|^copy$/i }).first();
    await expect(copyCode).toBeVisible();
    expect((await copyCode.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);

    const mobileBookmark = page.getByRole('button', { name: /add to bookmarks|remove from bookmarks|favorilere ekle|favorilerden kaldır/i }).last();
    await expect(mobileBookmark).toBeVisible();
    expect((await mobileBookmark.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);

    const authorLink = page.locator('article').getByRole('link').filter({ hasText: /@postify/i }).first();
    await expect(authorLink).toBeVisible();
    expect((await authorLink.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    const artifactLink = page.getByRole('link', { name: /exact executed \.mjs|çalıştırılan \.mjs/i });
    if (await artifactLink.count()) {
      expect((await artifactLink.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    }

    const outlineCodeLink = page.getByRole('link', { name: 'Code', exact: true });
    const evidenceSourceLink = page.getByRole('link', { name: 'nodejs.org', exact: true });
    for (const target of [outlineCodeLink, evidenceSourceLink]) {
      await expect(target).toBeVisible();
      const box = await target.boundingBox();
      expect(box?.height || 0).toBeGreaterThanOrEqual(44);
      expect(box?.width || 0).toBeGreaterThanOrEqual(44);
    }

    const articleOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(articleOverflow).toBeLessThanOrEqual(1);

    const mobileActionBar = page.locator('[class*="mobileActionBar"]').first();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('footer')).toBeInViewport();
    await expect(mobileActionBar).toHaveCSS('pointer-events', 'none');
    await expect(mobileActionBar).toHaveCSS('opacity', '0');
  });

  test('mobile article toast clears the floating action bar', async ({ page }) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 568, height: 320 }]) {
      await page.setViewportSize(viewport);
      await page.goto('/posts/node-json-dogrulama');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const bookmark = page.getByRole('button', { name: /add to bookmarks|remove from bookmarks|favorilere ekle|favorilerden kaldır/i }).last();
      const actionBar = page.locator('[class*="mobileActionBar"]').first();
      await expect(bookmark).toBeVisible();
      await bookmark.click();

      const toastStatus = page.locator('[data-rht-toaster] [role="status"]').filter({ hasText: /bookmark|favori/i }).first();
      await expect(toastStatus).toBeVisible();
      await page.waitForTimeout(450);

      const [barBox, toastBox] = await Promise.all([
        actionBar.boundingBox(),
        toastStatus.locator('..').boundingBox(),
      ]);
      expect(barBox).not.toBeNull();
      expect(toastBox).not.toBeNull();

      const overlapX = Math.max(0, Math.min(barBox.x + barBox.width, toastBox.x + toastBox.width) - Math.max(barBox.x, toastBox.x));
      const overlapY = Math.max(0, Math.min(barBox.y + barBox.height, toastBox.y + toastBox.height) - Math.max(barBox.y, toastBox.y));
      expect(overlapX * overlapY).toBe(0);
      expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(barBox.y - 8);
    }
  });

  test('V3 public author portfolio stays mobile-safe and knowledge-first', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/users/fallback-editor');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/bilgi portföyü|knowledge portfolio/i)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('mobile home does not overflow and menu remains operable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const touchTargets = [
      page.locator('header a').filter({ hasText: /^Postify$/ }).first(),
      page.getByRole('link', { name: /browse the library|bilgi arşivine göz at/i }),
      page.getByRole('link', { name: /contribute|katkı yap/i }),
      page.getByRole('button', { name: /add to bookmarks|favorilere ekle/i }).first(),
      page.locator('main').getByRole('button', { name: /all formats|tüm formatlar/i }).first(),
    ];
    for (const target of touchTargets) {
      await expect(target).toBeVisible();
      expect((await target.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    }

    const titleLinks = page.locator('#knowledge-feed a[class*="titleLink"]');
    expect(await titleLinks.count()).toBeGreaterThan(0);
    for (const height of await titleLinks.evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height))) {
      expect(height).toBeGreaterThanOrEqual(44);
    }

    for (const railButton of [
      page.getByRole('navigation', { name: /topics|konu başlıkları/i }).getByRole('button').last(),
      page.getByRole('group', { name: /filter by content format|içerik biçimine göre filtrele/i }).getByRole('button').last(),
    ]) {
      await railButton.focus();
      const railBox = await railButton.boundingBox();
      expect(railBox?.x || 0).toBeGreaterThanOrEqual(0);
      expect((railBox?.x || 0) + (railBox?.width || 0)).toBeLessThanOrEqual(390);
    }

    const menu = page.locator('header button[aria-expanded]').first();
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: /^hakkında$|^about$/i })).toBeVisible();
    const closeMenu = page.getByRole('button', { name: /menüyü kapat|close menu/i });
    await expect(closeMenu).toBeVisible();
    const closeBox = await closeMenu.boundingBox();
    expect(closeBox?.width || 0).toBeGreaterThanOrEqual(44);
    expect(closeBox?.height || 0).toBeGreaterThanOrEqual(44);
    await closeMenu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');

    await menu.focus();
    await menu.press('Enter');
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  });



  test('V3 topic index changes discovery context without mobile overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const topicNav = page.locator('nav').filter({ hasText: /konu dizini|topic index/i }).first();
    await expect(topicNav.getByText(/konu dizini|topic index/i)).toBeVisible();
    const topicButtons = topicNav.getByRole('button');
    expect(await topicButtons.count()).toBeGreaterThan(1);
    await expect(topicButtons.first()).toHaveAttribute('aria-pressed', 'true');
    await topicButtons.nth(1).click();
    await expect(topicButtons.nth(1)).toHaveAttribute('aria-pressed', 'true');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('English discovery localizes backend categories and fallback author aliases consistently', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('postify_language', 'en');
      localStorage.setItem('postify_theme', 'light');
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const topicNav = page.getByRole('navigation', { name: 'Topics' });
    for (const label of ['Product design', 'Developer tools']) {
      await expect(topicNav.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible();
    }
    for (const rawLabel of ['Ürün tasarımı', 'Geliştirici araçları']) {
      await expect(topicNav.getByRole('button', { name: new RegExp(rawLabel, 'i') })).toHaveCount(0);
    }

    const search = page.getByRole('searchbox');
    await search.fill('Product design');
    await expect(page.locator('#knowledge-feed').getByText('Product design', { exact: true }).first()).toBeVisible();

    await page.goto('/users/postify');
    await expect(page.getByRole('heading', { level: 1, name: 'Postify Editor' })).toBeVisible();
    await expect(page.getByText('Editorial notes on technology, product decisions, and software development for Postify.')).toBeVisible();
    const stats = page.locator('section[aria-label="Author knowledge summary"]');
    await expect(stats.getByText('9', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('No published stories yet.')).toHaveCount(0);
    await expect(page.locator('#main-content article').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('V3 footer exposes the trust model and stays mobile-safe', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/about');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/kanıt|evidence/i).first()).toBeVisible();
    await expect(footer.getByText(/güncellik|freshness/i).first()).toBeVisible();
    await expect(footer.getByText(/tekrarlanabilirlik|reproducibility/i).first()).toBeVisible();
    await expect(footer.getByRole('link', { name: /bilgiyi keşfet|explore knowledge/i })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('command search lazy-loads, traps focus, and restores the trigger', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: /ara|search/i }).first();
    await trigger.focus();
    await page.keyboard.press('Control+K');
    const dialog = page.getByRole('dialog');
    const close = dialog.getByRole('button', { name: /aramayı kapat|close search/i });
    await expect(dialog).toBeVisible();
    const combobox = dialog.getByRole('combobox');
    await expect(combobox).toBeFocused();
    const initialActive = await combobox.getAttribute('aria-activedescendant');
    await page.keyboard.press('ArrowDown');
    expect(await combobox.getAttribute('aria-activedescendant')).not.toBe(initialActive);
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(combobox).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('command palette locks background scroll and restores the reading position', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 700));
    const before = await page.evaluate(() => window.scrollY);
    const markerBefore = await page.locator('#knowledge-feed').evaluate((element) => element.getBoundingClientRect().top);

    await page.keyboard.press('Control+K');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((dialogBox?.y ?? 845) + (dialogBox?.height ?? 0)).toBeLessThanOrEqual(844);
    const markerOpen = await page.locator('#knowledge-feed').evaluate((element) => element.getBoundingClientRect().top);
    expect(Math.abs(markerOpen - markerBefore)).toBeLessThanOrEqual(1);

    await page.mouse.move(4, 4);
    await page.mouse.wheel(0, 600);
    await page.keyboard.press('PageDown');
    const markerLocked = await page.locator('#knowledge-feed').evaluate((element) => element.getBoundingClientRect().top);
    expect(Math.abs(markerLocked - markerBefore)).toBeLessThanOrEqual(1);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test('command palette stays contained and touch-safe on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.keyboard.press('Control+K');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole('button', { name: /aramayı kapat|close search/i });
    const closeBox = await close.boundingBox();
    expect(closeBox?.width || 0).toBeGreaterThanOrEqual(44);
    expect(closeBox?.height || 0).toBeGreaterThanOrEqual(44);
    const geometry = await dialog.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
    expect(geometry.top).toBeGreaterThanOrEqual(0);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight);
  });

  test('login surface remains clear and operable', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('auth validation is programmatic and mobile controls meet touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/auth/login');

    const loginButton = page.getByRole('button', { name: /^giriş yap$|^login$|^sign in$/i });
    await loginButton.click();
    const email = page.locator('#email');
    const password = page.locator('#password');
    await expect(email).toBeFocused();
    await email.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    const emailFocusOutline = await email.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth));
    expect(emailFocusOutline).toBeGreaterThanOrEqual(2);
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', 'login-email-error');
    await expect(password).toHaveAttribute('aria-invalid', 'true');
    await expect(password).toHaveAttribute('aria-describedby', 'login-password-error');

    const touchTargets = [
      page.getByRole('button', { name: /şifreyi göster|show password/i }),
      page.getByRole('button', { name: 'Google' }),
      page.getByRole('button', { name: 'GitHub' }),
      page.getByRole('button', { name: /menüyü aç\/kapat|toggle menu/i }),
    ];
    for (const target of touchTargets) {
      const box = await target.boundingBox();
      expect(box?.height || 0).toBeGreaterThanOrEqual(44);
    }

    await page.getByRole('button', { name: /menüyü aç\/kapat|toggle menu/i }).click();
    const language = page.getByRole('button', { name: /dili değiştir|change language/i });
    const theme = page.getByRole('button', { name: /karanlık mod|dark mode|aydınlık mod|light mode/i });
    await expect(language).toBeVisible();
    await expect(theme).toBeVisible();
    for (const target of [language, theme]) {
      const box = await target.boundingBox();
      expect(box?.height || 0).toBeGreaterThanOrEqual(44);
    }

    await page.goto('/auth/register');
    const registerLoginLink = page.getByRole('link', { name: /^giriş yap$|^login$/i });
    const registerLoginBox = await registerLoginLink.boundingBox();
    expect(registerLoginBox?.width || 0).toBeGreaterThanOrEqual(44);
    expect(registerLoginBox?.height || 0).toBeGreaterThanOrEqual(44);
    await page.getByRole('button', { name: /hesap oluştur|create account/i }).click();
    await expect(page.locator('#fullName')).toBeFocused();
    for (const selector of ['#fullName', '#username', '#email', '#password', '#confirmPassword']) {
      await expect(page.locator(selector)).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator(selector)).toHaveAttribute('aria-describedby', /register-.*-error/);
    }

    await page.goto('/auth/forgot-password');
    await page.getByRole('button', { name: /kurtarma bağlantısı gönder|send recovery link/i }).click();
    await expect(page.locator('#recovery-email')).toBeFocused();
    await expect(page.locator('#recovery-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#recovery-email')).toHaveAttribute('aria-describedby', 'recovery-form-error');
  });

  test('password recovery routes are real, responsive auth surfaces', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/auth/forgot-password');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/hesap e-postası|account email/i)).toBeVisible();
    let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.goto('/auth/reset-password');
    const newPassword = page.getByLabel(/^yeni şifre$|^new password$/i);
    const confirmPassword = page.getByLabel(/yeni şifreyi doğrula|confirm new password/i);
    await expect(newPassword).toBeVisible();
    await expect(confirmPassword).toBeVisible();

    const updatePasswordButton = page.getByRole('button', { name: /şifreyi güncelle|update password/i });
    await updatePasswordButton.click();
    await expect(newPassword).toBeFocused();
    await expect(newPassword).toHaveAttribute('aria-invalid', 'true');
    await expect(confirmPassword).toHaveAttribute('aria-invalid', 'false');

    await newPassword.fill('secure-pass-123');
    await confirmPassword.fill('different-pass-456');
    await updatePasswordButton.click();
    await expect(confirmPassword).toBeFocused();
    await expect(newPassword).toHaveAttribute('aria-invalid', 'false');
    await expect(confirmPassword).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#recovery-form-error')).toContainText(/eşleşmiyor|do not match/i);

    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('unknown routes render the V3 recovery index without mobile overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/definitely-not-a-postify-route');
    await expect(page.getByText('404', { exact: true })).toBeVisible();
    await expect(page.getByText(/index miss/i)).toBeVisible();
    const recoverySurface = page.locator('section[aria-labelledby="not-found-title"]');
    await expect(recoverySurface.getByRole('link', { name: /explore knowledge|bilgiyi keşfet/i })).toBeVisible();
    const recoveryIndex = page.getByRole('navigation', { name: /önerilen sayfalar|suggested pages/i });
    await expect(recoveryIndex.getByRole('link')).toHaveCount(3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('about page explains the V3 trust model and points writing to the real route', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/trust model|güven modeli/i)).toBeVisible();
    await expect(page.getByText(/outcome first|önce sonuç/i)).toBeVisible();
    await expect(page.getByText(/evidence attached|kanıt yanında/i)).toBeVisible();
    await expect(page.getByText(/freshness visible|güncellik görünür/i)).toBeVisible();
    await expect(page.getByText(/reproducible by design|tekrarlanabilir tasarım/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /write a useful record|faydalı bir kayıt yaz/i })).toHaveAttribute('href', '/posts/create');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('contact page is a correction-first public channel index', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/direct channels|doğrudan kanallar/i)).toBeVisible();
    await expect(page.getByText(/^correction$|^düzeltme$/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /zekiakgul09@gmail.com/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /@zexy2/i })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
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

  test('mobile format navigation closes the drawer and lands on the selected feed', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menu = page.locator('header button[aria-expanded]').first();
    await menu.click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();

    const guides = drawer.getByRole('link', { name: /^rehberler$|^guides$/i });
    await guides.click();

    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page).toHaveURL(/[?&]type=guide#knowledge-feed$/);
    await expect(page.getByRole('button', { name: /^rehber$|^guide$/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#knowledge-feed')).toBeInViewport();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('V3 knowledge card hierarchy exposes featured, standard and compact records without mobile overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const feed = page.locator('#knowledge-feed');
    await expect(feed.getByText(/öncelikli okuma|priority read/i)).toBeVisible();
    await expect(feed.locator('[data-card-variant="featured"]')).toHaveCount(1);
    await expect(feed.locator('[data-card-variant="standard"]')).toHaveCount(3);
    expect(await feed.locator('[data-card-variant="compact"]').count()).toBeGreaterThan(0);
    await expect(feed.getByText(/^kanıt$|^evidence$/i).first()).toBeVisible();
    await expect(feed.getByText(/^güncellik$|^freshness$/i).first()).toBeVisible();
    const articles = feed.locator('article');
    const overflow = await articles.evaluateAll((items) => items.map((item) => item.scrollWidth - item.clientWidth));
    expect(Math.max(...overflow)).toBeLessThanOrEqual(1);
  });

  test('reduced motion makes footer back-to-top immediate', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);

    await page.getByRole('button', { name: /başa dön|back to top/i }).click();
    await page.waitForTimeout(50);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
  });

  test('reduced motion preference keeps the page usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Verified Knowledge V1', () => {
  test('discovery exposes evidence and freshness controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/yazar test etti|author tested/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /güncel kanıt|current evidence/i })).toBeVisible();
  });

  test('article explains evidence and allows device-local feedback', async ({ page }) => {
    await page.goto('/posts/ai-muhendisligi');
    await expect(page.getByRole('heading', { name: /yazar test etti|author tested/i })).toBeVisible();
    await expect(page.getByText(/yazar beyanıdır|author claim/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^çalıştı$|^worked$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sonra dene|try later/i })).toBeVisible();
  });

  test('zero-result search can record a local knowledge gap', async ({ page }) => {
    await page.goto('/');
    const search = page.getByRole('searchbox');
    await search.fill('zzzz-no-such-verified-solution');
    await expect(page.getByRole('button', { name: /bu çözüme ihtiyacım var|i need this solution/i })).toBeVisible();
  });
});

test.describe('Verified Knowledge execution', () => {
  test('automatic verification exposes the exact executed article contract', async ({ page, request }) => {
    const execution = await request.get('/verification-runs.json').then((response) => response.json()).then((json) => json.runs['node-json-parse-v1']);
    await page.route('**/runtime-release-status.json', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 1, checks: { 'node-json-parse-v1': { checkId: 'node-json-parse-v1', runtime: 'node', status: 'current', reason: 'exact-latest-lts', checkedAt: new Date().toISOString(), verifiedRuntimeVersion: execution.runtimeVersion, requiredRuntimeMajor: execution.requiredRuntimeMajor, latestLtsVersion: execution.runtimeVersion, latestLtsMajor: execution.requiredRuntimeMajor } } }) });
    });
    await page.goto('/posts/node-json-dogrulama');
    await expect(page.getByRole('heading', { name: 'Postify verified', exact: true })).toBeVisible();
    await expect(page.getByText(/execution passed|çalıştırma geçti/i)).toBeVisible();
    await expect(page.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeVisible();
    await expect(page.getByText(/ci gerçek çıktısı|ci actual stdout/i).locator('..').getByText('PASS')).toBeVisible();
    await expect(page.getByText(/yerelde çalıştır|run locally/i).locator('..').getByText('node node-json-parse-v1.mjs')).toBeVisible();
    const verifierDownload = page.getByRole('link', { name: /çalıştırılan \.mjs dosyasını indir|download the exact executed \.mjs/i });
    await expect(verifierDownload).toHaveAttribute('href', '/verification/node-json-parse-v1.mjs');
    await expect(page.getByText(/makale ve artifact sözleşmesi eşleşti|article and artifact contract matched/i)).toBeVisible();
    const evidence = page.locator('.knowledge-evidence');
    await expect(evidence.locator('small').filter({ hasText: /güvenlik sandbox’ı değildir|not a security sandbox/i })).toBeVisible();
  });

  test('machine readable verification and knowledge artifacts are shipped', async ({ request }) => {
    const run = await request.get('/verification-runs.json');
    expect(run.ok()).toBeTruthy();
    const runJson = await run.json();
    const execution = runJson.runs['node-json-parse-v1'];
    expect(runJson.schemaVersion).toBe(3);
    expect(execution.status).toBe('passed');
    expect(execution.actualStdout).toBe(execution.expectedStdout);
    expect(execution.codeSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(execution.artifactSha256).toBe(execution.codeSha256);
    expect(execution.reproduceCommand).toBe('node node-json-parse-v1.mjs');
    expect(execution.artifactUrl).toBe('/verification/node-json-parse-v1.mjs');
    expect(execution.executionMode).toBe('generated-artifact-file');
    expect(execution.articleContractMatched).toBe(true);
    expect(execution.policy).toBe('node-deterministic-v1');
    const runtimeMajor = Number(String(execution.runtimeVersion).match(/^v(\d+)/)?.[1]);
    expect(runtimeMajor).toBe(24);
    const runtimeResponse = await request.get('/runtime-release-status.json');
    expect(runtimeResponse.ok()).toBeTruthy();
    const runtimeJson = await runtimeResponse.json();
    const runtimeSignal = runtimeJson.checks['node-json-parse-v1'];
    expect(['current', 'recheck-required', 'unknown']).toContain(runtimeSignal.status);
    expect(runtimeSignal.verifiedRuntimeVersion).toBe(execution.runtimeVersion);
    expect(runtimeSignal.requiredRuntimeMajor).toBe(24);
    const verifier = await request.get('/verification/node-json-parse-v1.mjs');
    expect(verifier.ok()).toBeTruthy();
    expect(await verifier.text()).toContain("process.stdout.write('PASS')");
    const backend = await request.get('/knowledge-backend-status.json');
    expect(backend.ok()).toBeTruthy();
    const backendJson = await backend.json();
    const knowledge = await request.get('/knowledge/node-json-dogrulama.tr.json');
    expect(knowledge.ok()).toBeTruthy();
    const artifact = await knowledge.json();
    expect(artifact.evidence.automaticVerification.status).toBe('passed');
    expect(artifact.evidence.runtimeReleaseSignal.status).toBe(runtimeSignal.status);
    if (backendJson.ready === true) {
      expect(String(artifact.id)).not.toMatch(/^fallback-/);
    }
  });

  test('postify verified discovery filter requires both execution and current runtime freshness', async ({ page, request }) => {
    const runtimeJson = await request.get('/runtime-release-status.json').then((response) => response.json());
    const current = runtimeJson.checks?.['node-json-parse-v1']?.status === 'current';
    await page.goto('/');
    await page.getByRole('button', { name: /postify verified/i }).click();
    const article = page.getByRole('heading', { name: /Node.js örneğini|Verify a Node.js example/i });
    if (current) await expect(article).toBeVisible();
    else await expect(article).toHaveCount(0);
  });

  test('runtime advancement withholds Verified while preserving historical execution proof', async ({ page, request }) => {
    const execution = await request.get('/verification-runs.json').then((response) => response.json()).then((json) => json.runs['node-json-parse-v1']);
    const parts = String(execution.runtimeVersion).replace(/^v/, '').split('.').map(Number);
    const newerVersion = `v${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    await page.route('**/runtime-release-status.json', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 1, checks: { 'node-json-parse-v1': { checkId: 'node-json-parse-v1', runtime: 'node', status: 'recheck-required', reason: 'newer-lts-release', checkedAt: new Date().toISOString(), verifiedRuntimeVersion: execution.runtimeVersion, requiredRuntimeMajor: execution.requiredRuntimeMajor, latestLtsVersion: newerVersion, latestLtsMajor: execution.requiredRuntimeMajor } } }) });
    });
    await page.goto('/posts/node-json-dogrulama');
    await expect(page.getByRole('heading', { name: /postify re-check required|postify yeniden kontrol etmeli/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Postify verified', exact: true })).toHaveCount(0);
    await expect(page.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeVisible();
    await expect(page.getByText(newerVersion, { exact: false })).toBeVisible();
  });

});

test.describe('Verified Knowledge pre-migration compatibility', () => {
  test('capability artifact prevents premature evidence backend requests', async ({ page }) => {
    await page.route('**/knowledge-backend-status.json', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 1, ready: false, mode: 'e2e-schema-pending' }) });
    });

    const evidenceRequests = [];
    page.on('request', (req) => {
      if (/post_evidence_summary|post_confirmations|post_failure_reports|post_revision_history|post_revisions|get_post_failure_details|user_knowledge_shelf|knowledge_gaps/.test(req.url())) {
        evidenceRequests.push(req.url());
      }
    });
    await page.goto('/posts/ai-muhendisligi');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForTimeout(400);
    expect(evidenceRequests).toEqual([]);
  });

  test('anonymous worked evidence remains useful and durable on-device', async ({ page }) => {
    await page.goto('/posts/ai-muhendisligi');
    page.once('dialog', async (dialog) => dialog.accept('Node 22 · Chrome'));
    await page.getByRole('button', { name: /^çalıştı$|^worked$/i }).click();
    await expect(page.getByRole('status').filter({ hasText: /kanıt kaydedildi|evidence saved/i })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: /^çalıştı$|^worked$/i })).toHaveAttribute('data-active', 'true');
  });

  test('critical public knowledge flow has no unexpected browser or network errors', async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    const badResponses = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('response', (response) => {
      if (response.status() < 400) return;
      const request = response.request();
      const pathname = new URL(response.url()).pathname;
      const expectedPagesSpaDocument404 = response.status() === 404
        && request.resourceType() === 'document'
        && pathname === '/posts/node-json-dogrulama';
      if (!expectedPagesSpaDocument404) badResponses.push(`${response.status()} ${request.resourceType()} ${response.url()}`);
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(badResponses).toEqual([]);

    consoleErrors.length = 0;
    const articleResponse = await page.goto('/posts/node-json-dogrulama');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.knowledge-evidence')).toBeVisible();
    await expect(page.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeVisible();

    let ignoredExpectedDocument404 = false;
    const unexpectedConsoleErrors = consoleErrors.filter((message) => {
      if (!ignoredExpectedDocument404 && articleResponse?.status() === 404 && /status of 404/i.test(message)) {
        ignoredExpectedDocument404 = true;
        return false;
      }
      return true;
    });

    expect(pageErrors).toEqual([]);
    expect(badResponses).toEqual([]);
    expect(unexpectedConsoleErrors).toEqual([]);
  });

  test('skip link reaches the main content with keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /İçeriğe geç|Skip to content/i });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });
});

test.describe('Action Runbook', () => {
  test('verification steps become a durable device-local runbook without creating a false Postify badge', async ({ page }) => {
    await page.goto('/posts/ai-muhendisligi');
    await expect(page.getByRole('heading', { name: /sadece okuma, kontrolleri uygula|do the checks, not just the reading/i })).toBeVisible();
    const checks = page.getByRole('checkbox');
    await expect(checks).toHaveCount(3);
    await checks.first().focus();
    await page.keyboard.press('Space');
    const runbook = page.getByRole('region', { name: /sadece okuma, kontrolleri uygula|do the checks, not just the reading/i });
    await expect(runbook.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
    await page.reload();
    await expect(page.getByRole('checkbox').first()).toBeChecked();
    const reloadedRunbook = page.getByRole('region', { name: /sadece okuma, kontrolleri uygula|do the checks, not just the reading/i });
    await expect(reloadedRunbook.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
    await expect(page.getByRole('heading', { name: 'Postify verified', exact: true })).toHaveCount(0);
  });

  test('verified code examples expose a working copy action', async ({ page }) => {
    await page.goto('/posts/node-json-dogrulama');
    const copy = page.getByRole('button', { name: /^kopyala$|^copy$/i }).first();
    await expect(copy).toBeVisible();
    await copy.click();
    await expect(page.getByRole('button', { name: /kopyalandı|copied/i }).first()).toBeVisible();
  });
});
