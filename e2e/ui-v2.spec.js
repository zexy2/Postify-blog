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
    await expect(page.getByRole('link', { name: /hakkında|about/i })).toBeVisible();
  });



  test('command search lazy-loads and stays keyboard operable', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+K');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
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
  test('automatic verification is visible only for a passed execution artifact', async ({ page }) => {
    await page.goto('/posts/node-json-dogrulama');
    await expect(page.getByRole('heading', { name: 'Postify verified', exact: true })).toBeVisible();
    await expect(page.getByText(/execution passed|çalıştırma geçti/i)).toBeVisible();
    await expect(page.getByText(/Node 20\+/i)).toBeVisible();
  });

  test('machine readable verification and knowledge artifacts are shipped', async ({ request }) => {
    const run = await request.get('/verification-runs.json');
    expect(run.ok()).toBeTruthy();
    const runJson = await run.json();
    expect(runJson.runs['node-json-parse-v1'].status).toBe('passed');
    const knowledge = await request.get('/knowledge/node-json-dogrulama.tr.json');
    expect(knowledge.ok()).toBeTruthy();
    const artifact = await knowledge.json();
    expect(artifact.evidence.automaticVerification.status).toBe('passed');
  });

  test('postify verified discovery filter resolves to genuinely executed knowledge', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /postify verified/i }).click();
    await expect(page.getByRole('heading', { name: /Node.js örneğini|Verify a Node.js example/i })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Postify verified', exact: true })).toBeVisible();

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
