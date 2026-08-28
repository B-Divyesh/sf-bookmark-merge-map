import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
test('sample merge works, exports, and has one main heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Bookmark Merge Map/);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByRole('button', { name: 'Use sample maps' }).click();
  await expect(page.getByRole('heading', { name: 'Every route, accounted for.' })).toBeVisible();
  await expect(page.getByText('Needs review').first()).toBeVisible();
  const htmlDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export merged HTML/ }).click();
  expect((await htmlDownload).suggestedFilename()).toMatch(/merged-bookmarks.*\.html/);
  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export review CSV' }).click();
  expect((await csvDownload).suggestedFilename()).toMatch(/bookmark-review.*\.csv/);
});
test('app reloads offline after first visit', async ({ page, context }) => {
  await page.goto('/');
  await expect.poll(async () => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find the missing paths.');
  await expect(page.getByText(/Offline · your saved map is available/)).toBeAttached();
});
test('service worker uses a versioned release cache and accepts an update check', async ({ page }) => {
  await page.goto('/');
  await expect.poll(async () => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const worker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return {
      active: registration.active?.scriptURL || '',
      caches: await caches.keys()
    };
  });
  expect(worker.active).toContain('/sw.js');
  expect(worker.caches).toContain('bookmark-merge-map-v6');
});
test('offline fallback remains styled with the production CSP', async ({ page }) => {
  const errors: string[] = [];
  const offlineHtml = readFileSync('public/offline.html', 'utf8');
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/offline.html', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    headers: { 'Content-Security-Policy': "default-src 'self'; style-src 'self'" },
    body: offlineHtml
  }));
  await page.goto('/offline.html');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('The map is still on this device.');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 240, 230)');
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(23, 33, 29)');
  await expect(page.locator('body')).toHaveCSS('font-size', '18px');
  expect(errors).toEqual([]);
});
test('has no serious accessibility violations before or after compare', async ({ page }) => {
  await page.goto('/');
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await page.getByRole('button', { name: 'Use sample maps' }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
test('excluded review rows retain accessible contrast after keyboard bulk exclusion', async ({ page }) => {
  await page.goto('/');
  const bookmarkExport = (links: string) => `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p>${links}</DL><p>`;
  await page.locator('#file-a').setInputFiles({
    name: 'desktop.html',
    mimeType: 'text/html',
    buffer: Buffer.from(bookmarkExport('<DT><A HREF="https://desktop.example/only">Desktop-only route</A>'))
  });
  await page.locator('#file-b').setInputFiles({
    name: 'mobile.html',
    mimeType: 'text/html',
    buffer: Buffer.from(bookmarkExport('<DT><A HREF="https://mobile.example/only">Mobile-only route</A>'))
  });
  await page.getByRole('checkbox', { name: /Group common tracking variants/ }).uncheck();
  await page.getByRole('button', { name: /Compare 1 \+ 1 bookmarks/ }).click();

  const onlyA = page.getByRole('button', { name: /Only A/ });
  await onlyA.focus();
  await page.keyboard.press('Enter');
  await expect(onlyA).toHaveAttribute('aria-pressed', 'true');

  const excludeVisible = page.getByRole('button', { name: 'Exclude visible' });
  await excludeVisible.focus();
  await page.keyboard.press('Enter');
  const excludedRow = page.locator('.result-row.excluded').first();
  await expect(excludedRow).toBeVisible();
  await expect(excludedRow).toHaveCSS('opacity', '1');
  await expect(page.getByText('Excluded from export').first()).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
test('tracking grouping preserves reviewed choices and unrelated exclusions across reload and toggles', async ({ page }) => {
  const bookmarkExport = (folder: string, links: string) => `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><H3>${folder}</H3><DL><p>${links}</DL><p></DL><p>`;
  await page.goto('/');
  await page.locator('#file-a').setInputFiles({
    name: 'desktop.html', mimeType: 'text/html',
    buffer: Buffer.from(bookmarkExport('Research / Maps & field', '<DT><A HREF="https://example.com/guide">Desktop guide</A><DT><A HREF="https://desktop.example/only">Desktop only</A>'))
  });
  await page.locator('#file-b').setInputFiles({
    name: 'mobile.html', mimeType: 'text/html',
    buffer: Buffer.from(bookmarkExport('Saved on phone', '<DT><A HREF="https://example.com/guide?utm_source=mobile">Mobile guide</A>'))
  });
  await page.getByRole('button', { name: /Compare 2 \+ 1 bookmarks/ }).click();

  let guide = page.locator('.result-row').filter({ hasText: 'Desktop guide' });
  await guide.getByLabel('Export title').selectOption({ label: 'Mobile guide' });
  guide = page.locator('.result-row').filter({ hasText: 'Mobile guide' });
  await guide.getByLabel('Destination').selectOption({ label: 'Saved on phone' });
  await page.getByRole('checkbox', { name: 'Include Desktop only' }).uncheck();
  await expect(page.getByText('1 distinct route excluded by you')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Recovered your last working map from this browser.')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Include Desktop only' })).not.toBeChecked();
  guide = page.locator('.result-row').filter({ hasText: 'Mobile guide' });
  await expect(guide.getByLabel('Export title')).toHaveValue('Mobile guide');
  await expect(guide.getByLabel('Destination')).toHaveValue('Saved on phone');

  const tracking = page.getByRole('checkbox', { name: /Group common tracking variants/ });
  await tracking.uncheck();
  await expect(page.locator('.proof-strip > div').nth(1).locator('strong')).toHaveText('3');
  await expect(page.getByRole('checkbox', { name: 'Include Desktop only' })).not.toBeChecked();
  await expect(page.getByText(/Choices were kept for unchanged routes/)).toBeVisible();

  await tracking.check();
  await expect(page.getByRole('checkbox', { name: 'Include Desktop only' })).not.toBeChecked();
  guide = page.locator('.result-row').filter({ hasText: 'Mobile guide' });
  await expect(guide.getByLabel('Export title')).toHaveValue('Mobile guide');
  await expect(guide.getByLabel('Destination')).toHaveValue('Saved on phone');
  await expect(page.getByText('1 distinct route excluded by you')).toBeVisible();
});
test('result URL links provide a 44px minimum pointer target', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Use sample maps' }).click();
  const sizes = await page.locator('.result-row a.url').evaluateAll((links) => links.map((link) => {
    const box = link.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  expect(sizes.length).toBeGreaterThan(0);
  expect(sizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
});
test('keeps the release shell private, responsive, focused, and reduced-motion safe', async ({ page }) => {
  const errors: string[] = [];
  const requestOrigins = new Set<string>();
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const expectedOrigin = new URL(page.url()).origin;

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const transitionDurations = await page.locator('.primary-button').first().evaluate((element) =>
    getComputedStyle(element).transitionDuration.split(',').map((duration) => parseFloat(duration) * (duration.includes('ms') ? 1 : 1000))
  );
  expect(transitionDurations.every((duration) => duration <= 1)).toBe(true);
  expect([...requestOrigins]).toEqual([expectedOrigin]);
  expect(errors).toEqual([]);
});
