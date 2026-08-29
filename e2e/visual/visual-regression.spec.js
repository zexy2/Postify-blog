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
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      caret-color: transparent !important;
    }
    html { scroll-behavior: auto !important; }
  ` });
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
    await settleVisualSurface(page);
    await expect(page.locator('#root')).toHaveScreenshot(`editor-${viewport.name}.png`);
  });
}
