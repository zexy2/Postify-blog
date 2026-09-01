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

      const activeFilter = page.getByRole('group', { name: /content format|içerik biçimi/i })
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

  test('filtered deep links and browser history preserve the discovery position', async ({ page }) => {
    for (const width of [390, 1304]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/?type=guide#knowledge-feed');

      const feed = page.locator('#knowledge-feed');
      await expect(feed).toBeVisible();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
      await expect(feed).toBeInViewport();

      const refineToggle = page.getByRole('button', { name: /^filters$|^filtreler$/i });
      await refineToggle.click();
      await expect(refineToggle).toHaveAttribute('aria-expanded', 'true');
      const latest = page.getByRole('button', { name: /^latest$|^en yeni$/i });
      await latest.scrollIntoViewIfNeeded();
      const beforeFilter = await page.evaluate(() => window.scrollY);
      await latest.click();
      await expect(page).toHaveURL(/type=guide.*sort=latest$/);
      await expect.poll(() => page.evaluate((top) => Math.abs(window.scrollY - top), beforeFilter)).toBeLessThanOrEqual(1);
      await page.keyboard.press('Escape');
      await expect(refineToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(refineToggle).toBeFocused();
      await expect(page.getByRole('button', { name: /remove latest|en yeni filtresini kaldır/i })).toBeVisible();

      const card = feed.locator('[data-card-variant]').last();
      await card.scrollIntoViewIfNeeded();
      const beforeArticle = await page.evaluate(() => window.scrollY);
      const articleLink = card.locator('a[href^="/posts/"]').filter({ hasText: /./ }).first();
      await articleLink.click();
      await expect(page).toHaveURL(/\/posts\//);
      await expect(page.locator('[data-mobile-article-tools]')).toBeAttached();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);

      const back = page.getByRole('button', { name: /^back$|^geri$/i }).first();
      await expect(back).toBeVisible();
      await back.click();
      await expect(page).toHaveURL(/type=guide.*sort=latest$/);
      await expect(feed).toBeVisible();
      await expect.poll(() => page.evaluate((top) => Math.abs(window.scrollY - top), beforeArticle), { timeout: 3000 }).toBeLessThanOrEqual(1);
    }
  });

  test('article Back falls home safely when there is no in-app history', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/posts/node-json-dogrulama');
    await expect(page.locator('[data-mobile-article-tools]')).toBeAttached();
    const historyIndex = await page.evaluate(() => window.history.state?.idx ?? 0);
    expect(historyIndex).toBe(0);
    await page.getByRole('button', { name: /^back$|^geri$/i }).first().click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('#knowledge-feed')).toBeVisible();
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
    await expect(article.locator('header').getByText(/\d+\s*(dk|min)/i).first()).toBeVisible();
    await expect(article.locator(':scope > section dl')).toHaveCount(0);
  });

  test('article evidence disclosure stays compact and text-safe', async ({ page }) => {
    for (const config of [
      { width: 390, height: 844, scale: false },
      { width: 320, height: 700, scale: true },
    ]) {
      await page.setViewportSize({ width: config.width, height: config.height });
      await page.goto('/posts/node-json-dogrulama');
      if (config.scale) await page.addStyleTag({ content: 'html{font-size:200%!important}' });

      const evidence = page.locator('.knowledge-evidence');
      await expect(evidence.getByRole('heading', { name: /postify verified/i })).toBeVisible();
      await expect(evidence.getByText(/execution passed|çalıştırma geçti/i)).toBeVisible();
      const details = evidence.locator('details.knowledge-evidence__details');
      const summary = details.locator('summary');
      await expect(details).not.toHaveAttribute('open', '');
      expect((await summary.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
      await expect(evidence.getByText(/executed contract|çalıştırılan sözleşme/i)).toBeHidden();

      await summary.click();
      await expect(details).toHaveAttribute('open', '');
      await expect(evidence.getByText(/executed contract|çalıştırılan sözleşme/i)).toBeVisible();
      for (const link of await evidence.getByRole('link').all()) {
        const box = await link.boundingBox();
        if (!box) continue;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width).toBeLessThanOrEqual(config.width + 1);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });

  test('mobile article and editor controls stay touch-safe and contained', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/posts/node-json-dogrulama');
    const article = page.locator('article').first();

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
    const evidenceDisclosure = article.locator('details.knowledge-evidence__details').first();
    await expect(evidenceDisclosure).toBeVisible();
    await expect(evidenceDisclosure).not.toHaveAttribute('open', '');
    const evidenceSummary = evidenceDisclosure.locator('summary');
    expect((await evidenceSummary.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    const artifactLink = evidenceDisclosure.getByRole('link', { name: /exact executed \.mjs|çalıştırılan \.mjs/i });
    await expect(artifactLink).toBeHidden();
    await evidenceSummary.click();
    await expect(evidenceDisclosure).toHaveAttribute('open', '');
    await expect(artifactLink).toBeVisible();
    expect((await artifactLink.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);

    const outlineDisclosure = article.locator('details').filter({ hasText: /on this page|bu yazıda/i }).first();
    await expect(outlineDisclosure).toBeVisible();
    await expect(outlineDisclosure).not.toHaveAttribute('open', '');
    const outlineSummary = outlineDisclosure.locator('summary');
    expect((await outlineSummary.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    await outlineSummary.click();
    await expect(outlineDisclosure).toHaveAttribute('open', '');

    const outlineCodeLink = outlineDisclosure.getByRole('link', { name: 'Code', exact: true });
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
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#knowledge-feed')).toBeVisible();
    await expect.poll(() => page.locator('[data-rht-toaster]').evaluate((element) => getComputedStyle(element).bottom)).toBe('16px');

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

  test('evidence feedback stays inline and tablet touch-safe', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 900 });
    let nativeDialogs = 0;
    page.on('dialog', async (dialog) => { nativeDialogs += 1; await dialog.dismiss(); });
    await page.goto('/posts/node-json-dogrulama');

    const feedback = page.locator('#evidence-feedback');
    const worked = feedback.getByRole('button', { name: /^çalıştı$|^worked$/i });
    await expect(worked).toBeVisible();
    await worked.click();
    expect(nativeDialogs).toBe(0);

    const environment = feedback.getByLabel(/ortam \/ sürüm|environment \/ version/i);
    await expect(environment).toBeVisible();
    expect((await environment.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    await environment.fill('Node.js 22 · Linux');

    for (const button of await feedback.getByRole('button').all()) {
      const box = await button.boundingBox();
      if (box) expect(box.height).toBeGreaterThanOrEqual(44);
    }

    await feedback.getByRole('button', { name: /kanıtı kaydet|save evidence/i }).click();
    await expect(worked).toHaveAttribute('aria-pressed', 'true');
    await expect(feedback.getByRole('status')).toContainText(/kanıt kaydedildi|evidence saved/i);
    await expect(feedback).toContainText('Node.js 22 · Linux');
    expect(nativeDialogs).toBe(0);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
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
      page.getByRole('searchbox'),
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
      page.getByRole('group', { name: /discovery filters|keşif filtreleri/i }).getByRole('button').last(),
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



  test('V3 topic navigation changes discovery context without mobile overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const topicNav = page.locator('nav').filter({ has: page.getByRole('button', { name: /^tümü$|^all$/i }) }).first();
    await expect(topicNav.getByText(/^konular$|^topics$/i)).toBeVisible();
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

  test('command palette keeps keyboard selection visible in a short viewport', async ({ page }) => {
    await page.setViewportSize({ width: 568, height: 320 });
    await page.goto('/');
    await expect(page.locator('#knowledge-feed')).toBeVisible();
    await page.keyboard.press('Control+K');

    const dialog = page.getByRole('dialog');
    const combobox = dialog.getByRole('combobox');
    const results = page.locator('#command-palette-results');
    await expect(combobox).toBeFocused();
    expect(await dialog.getByRole('option').count()).toBeGreaterThanOrEqual(6);

    for (let index = 0; index < 5; index += 1) await page.keyboard.press('ArrowDown');

    const activeId = await combobox.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    const activeOption = page.locator(`#${activeId}`);
    await expect(activeOption).toHaveAttribute('aria-selected', 'true');
    const geometry = await Promise.all([results.boundingBox(), activeOption.boundingBox()]);
    expect(geometry[1]?.y ?? -1).toBeGreaterThanOrEqual((geometry[0]?.y ?? 0) - 1);
    expect((geometry[1]?.y ?? 0) + (geometry[1]?.height ?? 0)).toBeLessThanOrEqual((geometry[0]?.y ?? 0) + (geometry[0]?.height ?? 0) + 1);
    expect(await results.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/posts\//);
  });

  test('command palette locks background scroll and restores the reading position', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 700));
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
    const markerClosed = await page.locator('#knowledge-feed').evaluate((element) => element.getBoundingClientRect().top);
    expect(Math.abs(markerClosed - markerBefore)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test('command palette stays contained and touch-safe on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#knowledge-feed')).toBeVisible();
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

  test('transient toasts yield to modal overlays', async ({ page }) => {
    await page.setViewportSize({ width: 568, height: 320 });
    await page.goto('/');
    await expect(page.locator('#knowledge-feed')).toBeVisible();

    const toaster = page.locator('[data-rht-toaster]');
    await page.getByRole('button', { name: /add to bookmarks|remove from bookmarks|favorilere ekle|favorilerden kaldır/i }).first().click();
    await expect(toaster.getByRole('status').first()).toBeVisible();

    await page.keyboard.press('Control+K');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(toaster).toHaveCSS('opacity', '0');
    await expect(toaster).toHaveCSS('pointer-events', 'none');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(toaster).toHaveCSS('opacity', '1');

    await page.getByRole('button', { name: /toggle menu|menüyü aç\/kapat/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(toaster).toHaveCSS('opacity', '0');
    await expect(toaster).toHaveCSS('pointer-events', 'none');
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

  test('200% mobile text scaling keeps core actions inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.addInitScript(() => {
      localStorage.setItem('postify_language', 'tr');
      localStorage.setItem('postify_theme', 'light');
    });

    const routes = [
      '/',
      '/about',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/posts/node-json-dogrulama',
      '/definitely-not-a-postify-route',
      '/e2e/visual/profile-auth.html',
      '/e2e/visual/editor.html',
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect.poll(async () => page.locator('a[href], button, input:not([type=hidden]), select, textarea, [role=button]').count()).toBeGreaterThan(0);
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });

      const escapedControls = await page.locator('a[href], button, input:not([type=hidden]), select, textarea, [role=button]').evaluateAll((controls) => {
        const visible = (element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0
            && rect.height > 0
            && style.display !== 'none'
            && style.visibility !== 'hidden'
            && Number(style.opacity) !== 0;
        };
        const insideHorizontalScroller = (element) => {
          for (let parent = element.parentElement; parent; parent = parent.parentElement) {
            const style = getComputedStyle(parent);
            if (['auto', 'scroll'].includes(style.overflowX) && parent.scrollWidth > parent.clientWidth + 2) return true;
          }
          return false;
        };

        return controls.filter(visible).flatMap((element) => {
          const rect = element.getBoundingClientRect();
          if (insideHorizontalScroller(element) || (rect.left >= -1 && rect.right <= window.innerWidth + 1)) return [];
          return [{
            tag: element.tagName,
            label: (element.getAttribute('aria-label') || element.textContent || element.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 80),
            left: Number(rect.left.toFixed(1)),
            right: Number(rect.right.toFixed(1)),
          }];
        });
      });

      expect(escapedControls, `${route} has horizontally clipped controls at 200% text scaling`).toEqual([]);

      if (route === '/posts/node-json-dogrulama') {
        const adjacentTitles = page.locator('nav a[href^="/posts/"] strong');
        for (const title of await adjacentTitles.all()) {
          expect(await title.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  test('Turkish auth validation never leaks translation keys', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('postify_language', 'tr'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/auth/register');

    await page.locator('#fullName').fill('Zeki Test');
    await page.locator('#username').fill('geçersiz kullanıcı');
    await page.locator('#email').fill('zeki@example.com');
    await page.locator('#password').fill('secure-pass-123');
    await page.locator('#confirmPassword').fill('different-pass-456');
    await page.getByRole('button', { name: /^hesap oluştur$/i }).click();

    await expect(page.locator('#register-username-error')).toHaveText('Yalnızca harf, rakam ve alt çizgi kullanın');
    await expect(page.locator('#register-confirm-error')).toHaveText('Şifreler eşleşmiyor');
    await expect(page.locator('body')).not.toContainText('validation.usernameFormat');
    await expect(page.locator('body')).not.toContainText('validation.passwordMismatch');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
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

  test('discovery filters keep advanced controls behind a clear disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1304, height: 844 });
    await page.goto('/');

    const filters = page.getByRole('group', { name: /discovery filters|keşif filtreleri/i });
    const formatGroup = filters.getByRole('group', { name: /content format|içerik biçimi/i });
    const toggle = filters.getByRole('button', { name: /^filters$|^filtreler$/i });

    await expect(formatGroup).toBeVisible();
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(filters.getByRole('group', { name: /evidence and ordering|kanıt ve sıralama/i })).toHaveCount(0);

    const desktop = await formatGroup.evaluate((element) => ({
      rows: new Set([...element.querySelectorAll('button')].map((button) => Math.round(button.getBoundingClientRect().top))).size,
      labelSize: parseFloat(getComputedStyle(element.querySelector('[aria-hidden="true"]')).fontSize),
    }));
    expect(desktop.rows).toBe(1);
    expect(desktop.labelSize).toBeGreaterThanOrEqual(11);

    const beforeOpenHeight = await filters.evaluate((element) => element.getBoundingClientRect().height);
    await toggle.click();
    const dialog = filters.getByRole('dialog', { name: /^filters$|^filtreler$/i });
    const refineGroup = dialog.getByRole('group', { name: /evidence and ordering|kanıt ve sıralama/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog).toBeVisible();
    await expect(refineGroup.getByRole('button', { name: /current evidence|güncel kanıt/i })).toBeVisible();
    await expect(refineGroup.getByRole('button', { name: /best evidence|en güçlü kanıt/i })).toHaveAttribute('aria-pressed', 'true');
    expect(await filters.evaluate((element) => element.getBoundingClientRect().height)).toBe(beforeOpenHeight);

    await refineGroup.getByRole('button', { name: /current evidence|güncel kanıt/i }).click();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(toggle).toBeFocused();
    const activeChip = filters.getByRole('button', { name: /remove current evidence|güncel kanıt filtresini kaldır/i });
    await expect(activeChip).toBeVisible();
    await activeChip.click();
    await expect(activeChip).toHaveCount(0);
  });

  test('mobile discovery keeps the primary format strip compact and opens refinements on demand', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const filters = page.getByRole('group', { name: /discovery filters|keşif filtreleri/i });
    const formatGroup = filters.getByRole('group', { name: /content format|içerik biçimi/i });
    const toggle = filters.getByRole('button', { name: /^filters$|^filtreler$/i });
    await expect(formatGroup.getByRole('button', { name: /tüm biçimler|all formats/i })).toBeVisible();

    const primaryGeometry = await formatGroup.evaluate((element) => {
      const buttons = [...element.querySelectorAll('button')];
      return {
        rows: new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().top))).size,
        minHeight: Math.min(...buttons.map((button) => button.getBoundingClientRect().height)),
      };
    });
    expect(primaryGeometry.rows).toBe(1);
    expect(primaryGeometry.minHeight).toBeGreaterThanOrEqual(44);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const beforeOpenHeight = await filters.evaluate((element) => element.getBoundingClientRect().height);
    await toggle.click();
    const dialog = filters.getByRole('dialog', { name: /^filters$|^filtreler$/i });
    const refineGroup = dialog.getByRole('group', { name: /evidence and ordering|kanıt ve sıralama/i });
    await expect(refineGroup).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const refineGeometry = await dialog.evaluate((element) => {
      const buttons = [...element.querySelectorAll('button')];
      const rect = element.getBoundingClientRect();
      return {
        minHeight: Math.min(...buttons.map((button) => button.getBoundingClientRect().height)),
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      };
    });
    expect(refineGeometry.minHeight).toBeGreaterThanOrEqual(44);
    expect(refineGeometry.left).toBeGreaterThanOrEqual(0);
    expect(refineGeometry.right).toBeLessThanOrEqual(390);
    expect(refineGeometry.top).toBeGreaterThanOrEqual(0);
    expect(refineGeometry.bottom).toBeLessThanOrEqual(844);
    expect(await filters.evaluate((element) => element.getBoundingClientRect().height)).toBe(beforeOpenHeight);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(toggle).toBeFocused();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });


  test('discovery filter popover stays contained at 200% text scaling', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/');
    await page.addStyleTag({ content: 'html{font-size:200%!important}' });

    const filters = page.getByRole('group', { name: /discovery filters|keşif filtreleri/i });
    const toggle = filters.getByRole('button', { name: /^filters$|^filtreler$/i });
    await toggle.click();
    const dialog = filters.getByRole('dialog', { name: /^filters$|^filtreler$/i });
    await expect(dialog).toBeVisible();

    const geometry = await dialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const escaped = [...element.querySelectorAll('button')]
        .filter((button) => button.offsetParent !== null)
        .filter((button) => {
          const box = button.getBoundingClientRect();
          return box.left < -1 || box.right > window.innerWidth + 1;
        }).length;
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, escaped };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(320);
    expect(geometry.top).toBeGreaterThanOrEqual(0);
    expect(geometry.bottom).toBeLessThanOrEqual(700);
    expect(geometry.escaped).toBe(0);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(toggle).toBeFocused();
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
    await page.getByRole('button', { name: /^filters$|^filtreler$/i }).click();
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
    const evidence = page.locator('.knowledge-evidence');
    const evidenceDetails = evidence.locator('details.knowledge-evidence__details');
    await expect(evidenceDetails).not.toHaveAttribute('open', '');
    await expect(evidence.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeHidden();
    await evidenceDetails.locator('summary').click();
    await expect(evidenceDetails).toHaveAttribute('open', '');
    await expect(evidence.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeVisible();
    await expect(page.getByText(/ci gerçek çıktısı|ci actual stdout/i).locator('..').getByText('PASS')).toBeVisible();
    await expect(page.getByText(/yerelde çalıştır|run locally/i).locator('..').getByText('node node-json-parse-v1.mjs')).toBeVisible();
    const verifierDownload = page.getByRole('link', { name: /çalıştırılan \.mjs dosyasını indir|download the exact executed \.mjs/i });
    await expect(verifierDownload).toHaveAttribute('href', '/verification/node-json-parse-v1.mjs');
    await expect(page.getByText(/makale ve artifact sözleşmesi eşleşti|article and artifact contract matched/i)).toBeVisible();
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
    await page.getByRole('button', { name: /^filters$|^filtreler$/i }).click();
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
    await expect(page.getByText(newerVersion, { exact: false })).toBeVisible();
    const evidenceDetails = page.locator('.knowledge-evidence details.knowledge-evidence__details');
    await expect(page.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeHidden();
    await evidenceDetails.locator('summary').click();
    await expect(page.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeVisible();
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
    let nativeDialogs = 0;
    page.on('dialog', async (dialog) => { nativeDialogs += 1; await dialog.dismiss(); });
    await page.goto('/posts/ai-muhendisligi');
    const feedback = page.locator('#evidence-feedback');
    const worked = feedback.getByRole('button', { name: /^çalıştı$|^worked$/i });
    await worked.click();
    await feedback.getByLabel(/ortam \/ sürüm|environment \/ version/i).fill('Node 22 · Chrome');
    await feedback.getByRole('button', { name: /kanıtı kaydet|save evidence/i }).click();
    await expect(feedback.getByRole('status').filter({ hasText: /kanıt kaydedildi|evidence saved/i })).toBeVisible();
    expect(nativeDialogs).toBe(0);
    await page.reload();
    await expect(worked).toHaveAttribute('aria-pressed', 'true');
    await expect(feedback).toContainText('Node 22 · Chrome');
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
    const evidence = page.locator('.knowledge-evidence');
    await expect(evidence).toBeVisible();
    const evidenceDetails = evidence.locator('details.knowledge-evidence__details');
    await expect(evidence.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeHidden();
    await evidenceDetails.locator('summary').click();
    await expect(evidence.getByText(/çalıştırılan sözleşme|executed contract/i)).toBeVisible();

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
