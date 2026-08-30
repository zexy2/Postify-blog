import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import { getFallbackPosts } from '../../src/content/fallbackPosts.js';

const fixedNow = new Date('2026-08-29T09:00:00.000Z');
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
const [fallbackPost] = getFallbackPosts('en');

const editorDraft = {
  writingMode: 'guide',
  savedAt: '2026-08-29T08:00:00.000Z',
  formData: {
    title: 'Ship a repeatable React release without hidden steps',
    body: 'Start from a clean worktree. Run the exact release gates. Record the environment and expected output. Verify the deployed result before calling the release complete.',
    bodyHtml: '<p>Start from a clean worktree. Run the exact release gates. Record the environment and expected output.</p><p>Verify the deployed result before calling the release complete.</p>',
    outcome: 'A release another developer can reproduce and verify.',
    testedAt: '2026-08-01',
    environment: 'Node 24 · React 19 · Chromium',
    prerequisites: 'Clean worktree\nProduction-like environment',
    verificationSteps: 'Run unit and lint gates\nBuild the production bundle\nVerify the deployed route',
    caveats: 'Re-check after dependency or hosting changes.',
    sources: 'https://example.com/release-evidence',
    staleAfterDays: '180',
    revisionReason: '',
  },
};

async function stabilize(page, { editor = false, theme = 'light', locale = 'en' } = {}) {
  await page.clock.setFixedTime(fixedNow);
  await page.addInitScript(({ editorDraft, editor, theme, locale }) => {
    localStorage.setItem('postify_language', locale);
    localStorage.setItem('postify_theme', theme);
    if (editor) {
      localStorage.setItem('postify:create-draft:local:en:new', JSON.stringify(editorDraft));
    }
  }, { editorDraft, editor, theme, locale });
}

async function settleVisualSurface(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      caret-color: transparent !important;
    }
    html { scroll-behavior: auto !important; }
  ` });
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

function parseRgb(value) {
  const normalized = String(value).trim();
  const hex = normalized.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((offset) => Number.parseInt(hex[1].slice(offset, offset + 2), 16));
  const match = normalized.match(/rgba?\(([^)]+)\)/i);
  if (!match) throw new Error(`Unsupported CSS color: ${value}`);
  const [r, g, b] = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  return [r, g, b];
}

function contrastRatio(foreground, background) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (rgb) => (0.2126 * channel(rgb[0])) + (0.7152 * channel(rgb[1])) + (0.0722 * channel(rgb[2]));
  const fg = luminance(parseRgb(foreground));
  const bg = luminance(parseRgb(background));
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

test('Core text and status tokens keep accessible contrast in light and dark themes', async ({ page }) => {
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.evaluate((nextTheme) => document.documentElement.setAttribute('data-theme', nextTheme), theme);
    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return Object.fromEntries([
        '--text-muted', '--success', '--warning', '--error',
        '--bg-primary', '--bg-secondary', '--bg-elevated',
      ].map((token) => [token, styles.getPropertyValue(token).trim()]));
    });
    for (const foreground of ['--text-muted', '--success', '--warning', '--error']) {
      for (const background of ['--bg-primary', '--bg-secondary', '--bg-elevated']) {
        expect(contrastRatio(tokens[foreground], tokens[background]), `${theme} ${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});

test('Verified article code block keeps readable code contrast', async ({ page }) => {
  await stabilize(page);
  await page.goto('/posts/node-json-dogrulama');
  const copy = page.getByRole('button', { name: /^copy$|^kopyala$/i }).first();
  await expect(copy).toBeVisible();
  const colors = await copy.locator('xpath=ancestor::div[contains(@class, "codeBlock")]').locator('pre code').evaluate((code) => ({
    foreground: getComputedStyle(code).color,
    background: getComputedStyle(code.closest('pre')).backgroundColor,
  }));
  expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
});

test('Mobile navigation drawer open baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stabilize(page);
  await page.goto('/');
  const menu = page.locator('header button[aria-expanded]').first();
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  const drawer = page.getByRole('dialog').first();
  await expect(drawer).toBeVisible();
  const close = drawer.getByRole('button', { name: /close menu|menüyü kapat/i });
  await expect(close).toBeVisible();
  const closeBox = await close.boundingBox();
  expect(closeBox?.width || 0).toBeGreaterThanOrEqual(44);
  expect(closeBox?.height || 0).toBeGreaterThanOrEqual(44);
  await settleVisualSurface(page);
  await expect(drawer).toHaveScreenshot('mobile-navigation-drawer.png');
});

test('Command palette stays in the viewport and locks background scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await stabilize(page);
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 700));
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(500);

  await page.keyboard.press('Control+K');
  const palette = page.getByRole('dialog', { name: /search|ara/i });
  await expect(palette).toBeVisible();
  const box = await palette.boundingBox();
  expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.y ?? 641) + (box?.height ?? 0)).toBeLessThanOrEqual(640);
  await expect(palette.getByRole('combobox')).toBeFocused();

  await page.mouse.move(4, 4);
  await page.mouse.wheel(0, 700);
  await page.keyboard.press('PageDown');
  expect(await page.evaluate(() => window.scrollY)).toBe(before);

  await page.keyboard.press('Escape');
  await expect(palette).toHaveCount(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

test('Mobile command palette open baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stabilize(page);
  await page.goto('/');
  await page.keyboard.press('Control+K');
  const palette = page.getByRole('dialog', { name: /search|ara/i });
  await expect(palette).toBeVisible();
  const combobox = palette.getByRole('combobox');
  await expect(combobox).toBeFocused();
  const initialActive = await combobox.getAttribute('aria-activedescendant');
  await page.keyboard.press('ArrowDown');
  await expect(combobox).toBeFocused();
  expect(await combobox.getAttribute('aria-activedescendant')).not.toBe(initialActive);
  await page.keyboard.press('ArrowUp');
  await expect(combobox).toHaveAttribute('aria-activedescendant', initialActive);
  const close = palette.getByRole('button', { name: /close search|aramayı kapat/i });
  expect((await close.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
  const options = palette.getByRole('option');
  expect(await options.count()).toBeGreaterThan(0);
  for (const height of await options.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height))) {
    expect(height).toBeGreaterThanOrEqual(44);
  }
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(combobox).toBeFocused();
  await settleVisualSurface(page);
  await expect(palette).toHaveScreenshot('mobile-command-palette.png');
});

for (const viewport of viewports) {
  test(`Home ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/');
    await expect(page.locator('#knowledge-feed [data-card-variant="featured"]')).toBeVisible({ timeout: 15_000 });
    await settleVisualSurface(page);
    await expect(page.locator('#main-content')).toHaveScreenshot(`home-${viewport.name}.png`);
  });

  test(`Article ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto(`/posts/${fallbackPost.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/author tested|unverified/i).first()).toBeVisible();
    await settleVisualSurface(page);
    await expect(page.locator('#main-content')).toHaveScreenshot(`article-${viewport.name}.png`);
  });

  test(`Editor ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page, { editor: true });
    await page.goto('/e2e/visual/editor.html');
    await expect(page.getByRole('heading', { level: 1, name: /create new post/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /what did you actually test/i })).toBeVisible();
    if (viewport.name === 'mobile') {
      const formOverflow = await page.locator('form').evaluate((form) => form.scrollWidth - form.clientWidth);
      expect(formOverflow).toBeLessThanOrEqual(1);
      const boldButton = page.getByRole('button', { name: /bold|kalın/i });
      expect((await boldButton.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
      const outcomeInput = page.getByPlaceholder(/after this, the reader can/i);
      expect((await outcomeInput.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
      const recheckSelect = page.locator('form select').last();
      expect((await recheckSelect.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    }
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`editor-${viewport.name}.png`);
  });
}

for (const viewport of viewports) {
  test(`Edit knowledge ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/editor-edit.html');
    await expect(page.getByRole('heading', { level: 1, name: /edit knowledge|bilgiyi düzenle/i })).toBeVisible();
    await expect(page.locator('#title')).toHaveValue(/AI feature is a system/i);
    await expect(page.getByText(/what changed\?|ne değişti\?/i)).toBeVisible();
    if (viewport.name === 'mobile') {
      const formOverflow = await page.locator('form').evaluate((form) => form.scrollWidth - form.clientWidth);
      expect(formOverflow).toBeLessThanOrEqual(1);
    }
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`editor-edit-${viewport.name}.png`);
  });
}



test('Editor toolbar and OAuth status follow the active product language', async ({ browser }) => {
  for (const locale of ['en', 'tr']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: locale === 'en' ? 'en-US' : 'tr-TR', timezoneId: 'UTC' });
    await context.addInitScript((language) => {
      localStorage.setItem('postify_language', language);
      localStorage.setItem('postify_theme', 'light');
    }, locale);
    const page = await context.newPage();

    await page.goto('/e2e/visual/editor.html');
    const boldLabel = locale === 'en' ? 'Bold' : 'Kalın';
    const oppositeBold = locale === 'en' ? 'Kalın' : 'Bold';
    await expect(page.getByRole('button', { name: boldLabel, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: oppositeBold, exact: true })).toHaveCount(0);

    await page.goto('/auth/callback');
    const statusCopy = locale === 'en'
      ? 'We are verifying your identity. Keep this window open.'
      : 'Kimliğin doğrulanıyor. Bu pencereyi kapatma.';
    await expect(page.getByText(statusCopy, { exact: true })).toBeVisible();
    await context.close();
  }
});

test('Editor keyboard focus stays visible inside mobile scroll surfaces', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stabilize(page);
  await page.goto('/e2e/visual/editor.html');

  const farToolbarControl = page.getByRole('button', { name: /bullet list|madde işaretli liste/i });
  await farToolbarControl.focus();
  const toolbarBox = await farToolbarControl.boundingBox();
  expect(toolbarBox?.x || 0).toBeGreaterThanOrEqual(0);
  expect((toolbarBox?.x || 0) + (toolbarBox?.width || 0)).toBeLessThanOrEqual(390);

  const title = page.locator('#title');
  await title.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  const titleOutline = await title.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth));
  expect(titleOutline).toBeGreaterThanOrEqual(2);
});

test('Editor canonical source is capability-gated, validated, and mobile-safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/knowledge-backend-status.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ready: true, mode: 'test', capabilities: { canonicalSourceUrl: true } }),
    });
  });
  await page.goto('/e2e/visual/editor.html');

  const canonicalInput = page.locator('#canonical-source-url');
  await expect(canonicalInput).toBeVisible();
  expect((await canonicalInput.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
  await canonicalInput.fill('javascript:alert(1)');
  await page.getByRole('button', { name: /publish|yayınla/i }).click();
  await expect(canonicalInput).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#canonical-source-help')).toContainText(/http:\/\/|https:\/\//i);

  await canonicalInput.fill('https://example.com/original?edition=2#section');
  await expect(canonicalInput).toHaveAttribute('aria-invalid', 'false');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Editor Markdown import/export round-trip stays local and mobile-safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stabilize(page);
  await page.goto('/e2e/visual/editor.html');
  await expect(page.getByRole('heading', { level: 1, name: /create new post|yeni post/i })).toBeVisible();

  const markdownFile = page.locator('input[type="file"][accept*=".md"]');
  await markdownFile.setInputFiles({
    name: 'release-guide.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# Imported release guide\n\n## Steps\n\n- Build\n- Verify\n'),
  });

  await expect(page.locator('#title')).toHaveValue('Imported release guide');
  await expect(page.locator('.ProseMirror')).toContainText('Steps');
  await expect(page.locator('.ProseMirror')).toContainText('Build');
  await expect(page.getByRole('status')).toContainText(/imported|içe aktarıldı/i);

  for (const button of [
    page.getByRole('button', { name: /import \.md|\.md içe al/i }),
    page.getByRole('button', { name: /export \.md|\.md dışa aktar/i }),
  ]) {
    expect((await button.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
  }

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export \.md|\.md dışa aktar/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('imported-release-guide.md');
  const downloadPath = await download.path();
  const exported = await readFile(downloadPath, 'utf8');
  expect(exported).toContain('# Imported release guide');
  expect(exported).toContain('## Steps');
  expect(exported).toContain('- Build');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});


test('Authenticated header account menu desktop baseline', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 300 });
  await stabilize(page);
  await page.goto('/e2e/visual/header-auth.html');
  const account = page.getByRole('button', { name: /account|hesap/i });
  await expect(account).toBeVisible();
  await account.click();
  await expect(page.getByRole('link', { name: /profile|profil/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /logout|çıkış yap/i })).toBeVisible();
  await settleVisualSurface(page);
  await expect(page.locator('header')).toHaveScreenshot('authenticated-header-desktop.png');
});


for (const viewport of viewports) {
  test(`Authenticated profile dashboard ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/profile-auth.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Semanur' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Hesap özeti|Account summary/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /İçerik üretimi|Content production/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Bilgi sağlığı|Knowledge health/i })).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`authenticated-profile-${viewport.name}.png`);
  });
}

for (const viewport of viewports) {
  test(`Authenticated profile editor ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/profile-auth.html');
    await page.getByRole('button', { name: /edit profile|profili düzenle/i }).first().click();
    const editor = page.locator('section[aria-label="Edit profile"], section[aria-label="Profili düzenle"]');
    await expect(editor).toBeVisible();
    if (viewport.name === 'mobile') {
      for (const button of await editor.getByRole('button').all()) {
        const box = await button.boundingBox();
        expect(box?.height || 0).toBeGreaterThanOrEqual(44);
      }
      const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
      expect(width.document).toBeLessThanOrEqual(width.viewport);
    }
    await settleVisualSurface(page);
    await expect(editor).toHaveScreenshot(`authenticated-profile-editor-${viewport.name}.png`);
  });
}

for (const viewport of viewports) {
  test(`About ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await settleVisualSurface(page);
    await expect(page.locator('#main-content')).toHaveScreenshot(`about-${viewport.name}.png`);
  });

  test(`Contact ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await settleVisualSurface(page);
    await expect(page.locator('#main-content')).toHaveScreenshot(`contact-${viewport.name}.png`);
  });

  test(`Author portfolio ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/users/fallback-editor');
    await expect(page.getByRole('heading', { level: 1, name: /Postify/i })).toBeVisible();
    await expect(page.locator('#main-content article').first()).toBeVisible();
    await settleVisualSurface(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveScreenshot(`author-${viewport.name}.png`, { fullPage: false });
  });


  test(`Author not found ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/users/missing-author');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const recovery = page.getByRole('link', { name: /explore useful knowledge|işe yarayan bilgileri keşfet/i });
    await expect(recovery).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    if (viewport.name === 'mobile') expect((await recovery.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    await settleVisualSurface(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveScreenshot(`author-not-found-${viewport.name}.png`, { fullPage: false });
  });

  test(`Author service unavailable ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/author-error.html');
    await expect(page.getByRole('heading', { level: 1, name: /temporarily unavailable|şu anda alınamıyor/i })).toBeVisible();
    const retry = page.getByRole('button', { name: /try again|tekrar dene/i });
    await expect(retry).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    if (viewport.name === 'mobile') expect((await retry.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`author-error-${viewport.name}.png`);
  });

  test(`Author published-work unavailable ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/author-posts-error.html');
    await expect(page.getByRole('heading', { level: 1, name: /Ada Example/i })).toBeVisible();
    const message = page.getByText(/published work is temporarily unavailable|yayınlanan çalışmalar şu anda alınamıyor/i);
    await expect(message).toBeVisible();
    const retry = page.getByRole('button', { name: /try again|tekrar dene/i });
    await expect(retry).toBeVisible();
    if (viewport.name === 'mobile') expect((await retry.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`author-posts-error-${viewport.name}.png`);
  });
}

for (const viewport of viewports) {
  test(`Admin empty dashboard ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/admin-empty.html');
    await expect(page.getByText(/no new users yet|henüz yeni kullanıcı yok/i)).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`admin-empty-dashboard-${viewport.name}.png`);
  });
}

test('Admin empty management tabs are explicit and mobile-safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stabilize(page);
  await page.goto('/e2e/visual/admin-empty.html');
  await page.getByRole('tab', { name: /users|kullanıcılar/i }).click();
  await expect(page.getByText(/no users yet|henüz kullanıcı bulunmuyor/i)).toBeVisible();
  await settleVisualSurface(page);
  await expect(page.locator('#root')).toHaveScreenshot('admin-empty-users-mobile.png');
  await page.getByRole('tab', { name: /content|içerikler|postlar/i }).click();
  await expect(page.getByText(/no content items yet|henüz içerik bulunmuyor|henüz post bulunmuyor/i)).toBeVisible();
  await settleVisualSurface(page);
  await expect(page.locator('#root')).toHaveScreenshot('admin-empty-posts-mobile.png');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

for (const viewport of viewports) {
  test(`Admin error recovery ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/admin-retry.html');
    const alert = page.getByRole('alert');
    await expect(alert).toContainText(/administration data could not be loaded|yönetim verileri yüklenemedi/i);
    const retry = alert.getByRole('button', { name: /try again|tekrar dene/i });
    await expect(retry).toBeVisible();
    if (viewport.name === 'mobile') expect((await retry.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`admin-error-${viewport.name}.png`);
    await retry.click();
    await expect(alert).toHaveCount(0);
    await expect(page.getByText(/no new users yet|henüz yeni kullanıcı yok/i)).toBeVisible();
  });
}

for (const viewport of viewports) {
  test(`Admin dashboard ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/admin-auth.html');
    await expect(page.getByRole('heading', { level: 1, name: /manage Postify operations|Postify operasyonlarını yönet/i })).toBeVisible();
    await expect(page.getByText('128')).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`admin-dashboard-${viewport.name}.png`);
  });
}

test('Admin tabs support arrow, Home, and End keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stabilize(page);
  await page.goto('/e2e/visual/admin-auth.html');
  const dashboard = page.getByRole('tab', { name: /dashboard/i });
  const users = page.getByRole('tab', { name: /users|kullanıcılar/i });
  const posts = page.getByRole('tab', { name: /content|içerikler|postlar/i });

  await dashboard.focus();
  await page.keyboard.press('ArrowRight');
  await expect(users).toBeFocused();
  await expect(users).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(posts).toBeFocused();
  await expect(posts).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(dashboard).toBeFocused();
  await expect(dashboard).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(posts).toBeFocused();
  await expect(posts).toHaveAttribute('aria-selected', 'true');
});

test('Admin console follows the active product language in English and Turkish', async ({ browser }) => {
  for (const locale of ['en', 'tr']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: locale === 'en' ? 'en-US' : 'tr-TR', timezoneId: 'UTC' });
    await context.addInitScript((language) => {
      localStorage.setItem('postify_language', language);
      localStorage.setItem('postify_theme', 'light');
    }, locale);
    const page = await context.newPage();
    await page.goto('/e2e/visual/admin-auth.html');
    if (locale === 'en') {
      await expect(page.getByRole('heading', { level: 1, name: 'Manage Postify operations.' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();
      await expect(page.getByText('Recently registered users')).toBeVisible();
      await expect(page.getByText('Toplam kullanıcı')).toHaveCount(0);
    } else {
      await expect(page.getByRole('heading', { level: 1, name: 'Postify operasyonlarını yönet.' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Kullanıcılar' })).toBeVisible();
      await expect(page.getByText('Son kayıt olan kullanıcılar')).toBeVisible();
      await expect(page.getByText('Total users')).toHaveCount(0);
    }
    await context.close();
  }
});

test('Admin management tables remain contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stabilize(page);
  await page.goto('/e2e/visual/admin-auth.html');
  await page.getByRole('tab', { name: /users|kullanıcılar/i }).click();
  await expect(page.getByText('Semanur').first()).toBeVisible();
  let width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(width.document).toBeLessThanOrEqual(width.viewport);
  const usersTable = page.locator('table').first();
  expect(await usersTable.evaluate((element) => element.scrollWidth > element.parentElement.clientWidth)).toBe(true);
  const roleSelects = page.getByRole('combobox');
  expect(await roleSelects.count()).toBeGreaterThan(0);
  for (const height of await roleSelects.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height))) {
    expect(height).toBeGreaterThanOrEqual(44);
  }
  await expect(roleSelects.first()).toHaveAttribute('aria-label', /role|rolü/i);

  await page.getByRole('tab', { name: /content|içerikler|postlar/i }).click();
  await expect(page.getByText(/Node\.js doğrulama/i)).toBeVisible();
  await expect(page.getByText('Semanur').first()).toBeVisible();
  width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(width.document).toBeLessThanOrEqual(width.viewport);
  const postActions = page.locator('tbody button');
  expect(await postActions.count()).toBeGreaterThan(0);
  for (const height of await postActions.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height))) {
    expect(height).toBeGreaterThanOrEqual(44);
  }
  for (const name of await postActions.evaluateAll((items) => items.map((item) => item.getAttribute('aria-label')))) {
    expect(name).toBeTruthy();
  }
});

for (const viewport of viewports) {
  test(`Empty bookmarks ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/bookmarks-empty.html');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const action = page.getByRole('link', { name: /explore useful knowledge|işe yarayan bilgileri keşfet/i });
    await expect(action).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    if (viewport.name === 'mobile') expect((await action.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`bookmarks-empty-${viewport.name}.png`);
  });
}

for (const viewport of viewports) {
  test(`Bookmarks shelf ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/bookmarks-auth.html');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('article')).toHaveCount(3);
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    if (viewport.name === 'mobile') {
      expect((await page.getByRole('button', { name: /clear all|tümünü temizle/i }).boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
      const removeButtons = page.getByRole('button', { name: /remove from bookmarks|favorilerden kaldır/i });
      for (const height of await removeButtons.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height))) {
        expect(height).toBeGreaterThanOrEqual(44);
      }
    }
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`bookmarks-${viewport.name}.png`);
  });
}

for (const viewport of viewports) {
  test(`Knowledge unavailable ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/knowledge-unavailable.html');
    await expect(page.getByRole('heading', { level: 1, name: /account sync is not active yet|hesap senkronu henüz aktif değil/i })).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`knowledge-unavailable-${viewport.name}.png`);
  });
}

for (const viewport of viewports) {
  test(`Knowledge health ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/knowledge-auth.html');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/Bakım kuyruğu|Maintenance queue/i)).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    if (viewport.name === 'mobile') {
      const maintenanceActions = page.locator('article').getByRole('link', { name: /edit evidence|kanıtı düzenle/i }).or(page.locator('article').getByRole('button', { name: /re-verify|yeniden doğrula/i }));
      for (const height of await maintenanceActions.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height))) {
        expect(height).toBeGreaterThanOrEqual(44);
      }
    }
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`knowledge-${viewport.name}.png`);
  });
}


const publicSystemVisualRoutes = [
  ['/auth/login', 'login'],
  ['/auth/register', 'register'],
  ['/auth/forgot-password', 'forgot-password'],
  ['/auth/reset-password', 'reset-password'],
  ['/auth/callback', 'auth-callback'],
  ['/definitely-not-a-postify-route', 'not-found'],
];

for (const [route, snapshotName] of publicSystemVisualRoutes) {
  test(`${snapshotName} desktop baseline`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await stabilize(page);
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const firstAuthInput = page.locator('form input').first();
    if (await firstAuthInput.count()) {
      await expect(firstAuthInput).toBeEnabled();
    }
    await settleVisualSurface(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveScreenshot(`${snapshotName}-desktop.png`, { fullPage: false });
  });

  test(`${snapshotName} mobile layout contract`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await stabilize(page);
    await page.goto(route);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const firstAuthInput = page.locator('form input').first();
    if (await firstAuthInput.count()) {
      await expect(firstAuthInput).toBeEnabled();
    }
    await settleVisualSurface(page);
    await page.evaluate(() => window.scrollTo(0, 0));

    await expect(heading).toBeVisible();
    const geometry = await page.evaluate(() => {
      const headingNode = document.querySelector('main h1, #main-content h1, h1');
      const headingRect = headingNode?.getBoundingClientRect();
      const controls = [...document.querySelectorAll('form input, form button, main a[href^="/auth/"], #main-content a[href^="/auth/"]')]
        .filter((node, index, items) => items.indexOf(node) === index)
        .filter((node) => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        })
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, right: rect.right, height: rect.height };
        });

      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        heading: headingRect ? { left: headingRect.left, right: headingRect.right } : null,
        controls,
      };
    });
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    expect(geometry.heading).not.toBeNull();
    expect(geometry.heading.left).toBeGreaterThanOrEqual(0);
    expect(geometry.heading.right).toBeLessThanOrEqual(geometry.viewportWidth);
    for (const control of geometry.controls) {
      expect(control.height).toBeGreaterThanOrEqual(44);
      expect(control.left).toBeGreaterThanOrEqual(0);
      expect(control.right).toBeLessThanOrEqual(geometry.viewportWidth);
    }
  });
}


for (const viewport of viewports) {
  test(`Error recovery ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/error-boundary.html');
    await expect(page.getByRole('heading', { level: 1, name: /something went wrong|bir hata oluştu/i })).toBeVisible();
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`error-recovery-${viewport.name}.png`);
  });
}


for (const viewport of viewports) {
  test(`Dark theme Home ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page, { theme: 'dark' });
    await page.goto('/');
    await expect(page.locator('#knowledge-feed [data-card-variant="featured"]')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await settleVisualSurface(page);
    await expect(page.locator('#main-content')).toHaveScreenshot(`home-dark-${viewport.name}.png`);
  });

  test(`Dark theme Article ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page, { theme: 'dark' });
    await page.goto(`/posts/${fallbackPost.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await settleVisualSurface(page);
    await expect(page.locator('#main-content')).toHaveScreenshot(`article-dark-${viewport.name}.png`);
  });

  test(`Dark theme Editor ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page, { editor: true, theme: 'dark' });
    await page.goto('/e2e/visual/editor.html');
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(page.getByRole('heading', { level: 1, name: /create new post/i })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`editor-dark-${viewport.name}.png`);
  });

  test(`Dark theme authenticated profile ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page, { theme: 'dark' });
    await page.goto('/e2e/visual/profile-auth.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Semanur' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`authenticated-profile-dark-${viewport.name}.png`);
  });


}


for (const viewport of viewports) {
  for (const [name, route, ready] of [
    ['Bookmarks', '/e2e/visual/bookmarks-auth.html', /bookmarks|favorilerim/i],
    ['Knowledge health', '/e2e/visual/knowledge-auth.html', /knowledge health|bilgi sağlığı/i],
    ['Admin dashboard', '/e2e/visual/admin-auth.html', /manage Postify operations|Postify operasyonlarını yönet/i],
  ]) {
    test(`Dark theme ${name} ${viewport.name} baseline`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await stabilize(page, { theme: 'dark' });
      await page.goto(route);
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      if (name === 'Bookmarks') {
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      } else if (name === 'Knowledge health') {
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.getByText(/Maintenance queue|Bakım kuyruğu/i)).toBeVisible();
      } else {
        await expect(page.getByRole('heading', { level: 1, name: ready })).toBeVisible();
      }
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await settleVisualSurface(page);
      await expect(page.locator('#root')).toHaveScreenshot(`${name.toLowerCase().replaceAll(' ', '-')}-dark-${viewport.name}.png`);
    });
  }
}
for (const [route, name] of publicSystemVisualRoutes) {
  test(`Dark theme ${name} desktop baseline`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await stabilize(page, { theme: 'dark' });
    await page.goto(route);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const firstAuthInput = page.locator('form input').first();
    if (await firstAuthInput.count()) await expect(firstAuthInput).toBeEnabled();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await settleVisualSurface(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveScreenshot(`${name}-dark-desktop.png`, { fullPage: false });
  });

  test(`Dark theme ${name} mobile layout contract`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await stabilize(page, { theme: 'dark' });
    await page.goto(route);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const firstAuthInput = page.locator('form input').first();
    if (await firstAuthInput.count()) await expect(firstAuthInput).toBeEnabled();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const geometry = await page.evaluate(() => {
      const h1 = document.querySelector('main h1, #main-content h1, h1')?.getBoundingClientRect();
      const controls = [...document.querySelectorAll('form input, form button, main a[href^="/auth/"], #main-content a[href^="/auth/"]')]
        .filter((node, index, items) => items.indexOf(node) === index)
        .filter((node) => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        })
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, right: rect.right, height: rect.height };
        });
      return {
        viewportWidth: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        heading: h1 ? { left: h1.left, right: h1.right } : null,
        controls,
      };
    });
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    expect(geometry.heading).not.toBeNull();
    expect(geometry.heading.left).toBeGreaterThanOrEqual(0);
    expect(geometry.heading.right).toBeLessThanOrEqual(geometry.viewportWidth);
    for (const control of geometry.controls) {
      expect(control.height).toBeGreaterThanOrEqual(44);
      expect(control.left).toBeGreaterThanOrEqual(0);
      expect(control.right).toBeLessThanOrEqual(geometry.viewportWidth);
    }
  });
}

for (const viewport of viewports) {
  for (const [name, route] of [
    ['about', '/about'],
    ['contact', '/contact'],
    ['author', '/users/postify'],
  ]) {
    test(`Dark theme ${name} public surface ${viewport.name} baseline`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await stabilize(page, { theme: 'dark' });
      await page.goto(route);
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      if (name === 'author') {
        await expect(heading).toHaveText('Postify Editor');
        await expect(page.locator('#main-content article').first()).toBeVisible();
      }
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await settleVisualSurface(page);
      if (name === 'author') {
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(page).toHaveScreenshot(`author-dark-${viewport.name}.png`, { fullPage: false });
      } else {
        await expect(page.locator('#main-content')).toHaveScreenshot(`${name}-dark-${viewport.name}.png`);
      }
    });
  }
}
