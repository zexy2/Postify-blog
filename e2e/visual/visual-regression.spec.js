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

async function stabilize(page, { editor = false } = {}) {
  await page.clock.setFixedTime(fixedNow);
  await page.addInitScript(({ editorDraft, editor }) => {
    localStorage.setItem('postify_language', 'en');
    localStorage.setItem('postify_theme', 'light');
    if (editor) {
      localStorage.setItem('postify:create-draft:local:en:new', JSON.stringify(editorDraft));
    }
  }, { editorDraft, editor });
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

for (const viewport of viewports) {
  test(`Home ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/');
    await expect(page.locator('#knowledge-feed [data-card-variant="featured"]')).toBeVisible();
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
      const boldButton = page.getByRole('button', { name: 'B', exact: true });
      expect((await boldButton.boundingBox())?.height || 0).toBeGreaterThanOrEqual(44);
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
  await expect(page.getByRole('menuitem', { name: /profile|profil/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /logout|çıkış yap/i })).toBeVisible();
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
}

for (const viewport of viewports) {
  test(`Admin dashboard ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/admin-auth.html');
    await expect(page.getByRole('heading', { level: 1, name: /Postify operasyonlarını yönet/i })).toBeVisible();
    await expect(page.getByText('128')).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`admin-dashboard-${viewport.name}.png`);
  });
}

test('Admin management tables remain contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stabilize(page);
  await page.goto('/e2e/visual/admin-auth.html');
  await page.getByRole('tab', { name: /Kullanıcılar/i }).click();
  await expect(page.getByText('Semanur').first()).toBeVisible();
  let width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(width.document).toBeLessThanOrEqual(width.viewport);
  const usersTable = page.locator('table').first();
  expect(await usersTable.evaluate((element) => element.scrollWidth > element.parentElement.clientWidth)).toBe(true);

  await page.getByRole('tab', { name: /Postlar/i }).click();
  await expect(page.getByText(/Node\.js doğrulama/i)).toBeVisible();
  await expect(page.getByText('Semanur').first()).toBeVisible();
  width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(width.document).toBeLessThanOrEqual(width.viewport);
});

for (const viewport of viewports) {
  test(`Bookmarks shelf ${viewport.name} baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await stabilize(page);
    await page.goto('/e2e/visual/bookmarks-auth.html');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('article')).toHaveCount(3);
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`bookmarks-${viewport.name}.png`);
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
      const controls = [...document.querySelectorAll('form input, form button')]
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
