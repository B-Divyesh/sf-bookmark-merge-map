import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const bookmarkExport = (folder: string, links: string) => `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><H3>${folder}</H3><DL><p>${links}</DL><p></DL><p>`;
const realA = bookmarkExport('Desktop work', '<DT><A HREF="https://real-a.example/one">Private desktop link</A>');
const realB = bookmarkExport('Phone work', '<DT><A HREF="https://real-b.example/two">Private phone link</A>');

async function openDemo(page: Page) {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1, name: 'Compare sample bookmark exports' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.result-row')).toHaveCount(5);
}

async function downloadText(page: Page, buttonName: RegExp | string): Promise<string> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: buttonName }).click();
  const path = await (await pending).path();
  return readFile(path!, 'utf8');
}

async function databaseRecord(page: Page, name: string): Promise<string | null> {
  return page.evaluate(async (databaseName: string) => new Promise<string | null>((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('projects')) { db.close(); resolve(null); return; }
      const get = db.transaction('projects').objectStore('projects').get('active');
      get.onerror = () => reject(get.error);
      get.onsuccess = () => { const result = get.result; db.close(); resolve(result ? JSON.stringify(result) : null); };
    };
  }), name);
}

test('@claim:demo-isolation demo changes never alter the real project', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-a').setInputFiles({ name: 'real-a.html', mimeType: 'text/html', buffer: Buffer.from(realA) });
  await page.locator('#file-b').setInputFiles({ name: 'real-b.html', mimeType: 'text/html', buffer: Buffer.from(realB) });
  const before = await databaseRecord(page, 'bookmark-merge-map');
  expect(before).toContain('real-a.html');
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.locator('.result-row')).toHaveCount(5);
  await page.locator('.result-row').first().getByRole('checkbox').uncheck();
  await expect.poll(() => databaseRecord(page, 'demo:bookmark-merge-map')).not.toBeNull();
  expect(await databaseRecord(page, 'bookmark-merge-map')).toBe(before);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByText('real-a.html')).toBeVisible();
  await expect(page.getByText('real-b.html')).toBeVisible();
  expect(await databaseRecord(page, 'bookmark-merge-map')).toBe(before);
  expect(await databaseRecord(page, 'demo:bookmark-merge-map')).toBeNull();
});

test('?demo=1 opens the isolated sample result and its controls directly', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Bookmark Merge Map');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible();
  await expect(page.locator('.result-row')).toHaveCount(5);
});

test('@claim:privacy-local demo flow sends requests only to this site', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await openDemo(page);
  await page.getByRole('button', { name: /Only B/ }).click();
  await page.getByRole('button', { name: 'Exclude visible' }).click();
  await downloadText(page, /Download merged HTML/);
  await downloadText(page, 'Download review CSV');
  expect([...origins]).toEqual([new URL(page.url()).origin]);
});

test('@claim:offline-reload demo reloads offline after an online visit', async ({ page, context }) => {
  await openDemo(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 10_000 }).toBe(true);
  }
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Compare sample bookmark exports' })).toBeVisible();
  await expect(page.getByText('Offline', { exact: true })).toBeAttached();
});

test('@claim:free-no-account the complete sample flow has no account or payment step', async ({ page }) => {
  await openDemo(page);
  await expect(page.getByText(/sign in|log in|payment|card number/i)).toHaveCount(0);
  expect(await downloadText(page, /Download merged HTML/)).toContain('Merged bookmarks');
});

test('@claim:html-export merged HTML contains one entry per selected sample result', async ({ page }) => {
  await openDemo(page);
  const html = await downloadText(page, /Download merged HTML/);
  expect(html).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
  expect(html.match(/<DT><A /g)).toHaveLength(5);
  expect(html).toContain('https://web.dev/learn/pwa/');
});

test('@claim:csv-export review CSV contains its header and every sample result', async ({ page }) => {
  await openDemo(page);
  const csv = await downloadText(page, 'Download review CSV');
  const lines = csv.trim().split('\n');
  expect(lines[0]).toBe('status,included,title,export_url,canonical_url,chosen_folder,source,original_copies,all_folders,notes');
  expect(lines).toHaveLength(6);
  expect(csv).toContain('conflict,true,Reading archive');
});

test('@claim:input-recovery an unsupported file explains how to recover', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-a').setInputFiles({ name: 'bookmarks.txt', mimeType: 'text/plain', buffer: Buffer.from('not an export') });
  await expect(page.getByRole('status')).toContainText('Choose a file ending in .html or .htm.');
  await page.locator('#file-a').setInputFiles({ name: 'desktop.html', mimeType: 'text/html', buffer: Buffer.from(realA) });
  await expect(page.getByText('desktop.html', { exact: true })).toBeVisible();
});

test('@claim:new-file-exports downloads keep original URLs and do not change the source record', async ({ page }) => {
  await openDemo(page);
  const before = await databaseRecord(page, 'demo:bookmark-merge-map');
  const html = await downloadText(page, /Download merged HTML/);
  expect(html).toContain('https://example.com/guide?utm_source=desktop');
  expect(await databaseRecord(page, 'demo:bookmark-merge-map')).toBe(before);
});

test('@claim:tracking-grouping campaign links group reversibly while exported URLs keep their original form', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('.result-row')).toHaveCount(5);
  await page.getByRole('checkbox', { name: /Group common campaign links/ }).uncheck();
  await expect(page.locator('.result-row')).toHaveCount(6);
  await page.getByRole('checkbox', { name: /Group common campaign links/ }).check();
  await expect(page.locator('.result-row')).toHaveCount(5);
  expect(await downloadText(page, /Download merged HTML/)).toContain('?utm_source=desktop');
});

test('@claim:project-recovery real files and review choices survive reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-a').setInputFiles({ name: 'desktop.html', mimeType: 'text/html', buffer: Buffer.from(realA) });
  await page.locator('#file-b').setInputFiles({ name: 'phone.html', mimeType: 'text/html', buffer: Buffer.from(realB) });
  await page.getByRole('button', { name: 'Compare 1 + 1 bookmarks' }).click();
  await page.getByRole('checkbox', { name: 'Include Private desktop link' }).uncheck();
  await page.reload();
  await expect(page.getByText('Recovered your last bookmark comparison from this browser.')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Include Private desktop link' })).not.toBeChecked();
});

test('@claim:bookmark-reading reads folder paths, titles, and URLs from both exports', async ({ page }) => {
  await openDemo(page);
  const firstArchive = page.locator('.result-row').filter({ hasText: 'https://example.org/archive' });
  await expect(firstArchive).toContainText('Reading archive');
  await expect(firstArchive).toContainText('Field notes');
  await expect(page.locator('.result-row').filter({ hasText: 'https://web.dev/learn/pwa/' })).toContainText('Saved on phone');
});

test('@claim:default-inclusion keeps every distinct sample destination selected by default', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('.result-row input[type="checkbox"]:checked')).toHaveCount(5);
  await expect(page.getByText('Needs review')).toHaveCount(2);
  await expect(page.getByText('Only in B')).toHaveCount(1);
});

test('@claim:no-live-pages comparison does not open bookmark pages or update browser bookmarks', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await openDemo(page);
  const before = await databaseRecord(page, 'demo:bookmark-merge-map');
  await page.getByRole('button', { name: /Review 2/ }).click();
  expect([...origins]).toEqual([new URL(page.url()).origin]);
  expect(await databaseRecord(page, 'demo:bookmark-merge-map')).toBe(before);
  expect(await page.evaluate(() => 'bookmarks' in navigator)).toBe(false);
});

test('routes set titles, focus headings, support back, and show a designed 404', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page).toHaveTitle('Privacy — Bookmark Merge Map');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveTitle('Bookmark Merge Map — merge two bookmark exports');
  await expect(page.getByRole('heading', { level: 1, name: 'Merge two bookmark exports' })).toBeFocused();
  await page.goto('/this-route-does-not-exist');
  await expect(page).toHaveTitle('Page not found — Bookmark Merge Map');
  await expect(page.getByRole('heading', { level: 1, name: 'This page is not on the map' })).toBeVisible();
});

test('all product routes have metadata, one h1, a shared shell, and working internal links', async ({ page, request }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.jpg/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('.site-header .brand')).toBeVisible();
  }
  for (const path of ['/demo', '/privacy', '/terms', '/404.html', '/assets/social-card.jpg', '/icons/apple-touch-icon.png']) expect((await request.get(path)).ok()).toBe(true);
});

test('keyboard, mobile layout, reduced motion, and accessibility checks pass', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const demoBox = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
  expect(demoBox).not.toBeNull();
  expect(demoBox!.y + demoBox!.height).toBeLessThanOrEqual((await page.viewportSize())!.height);
  const duration = await page.locator('.primary-button').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.001);
  let axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  await openDemo(page);
  axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('excluded rows remain legible and all pointer targets meet 44px', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: /Only B/ }).click();
  await page.getByRole('button', { name: 'Exclude visible' }).click();
  await expect(page.locator('.result-row.excluded')).toHaveCSS('opacity', '1');
  const undersized = await page.locator('a, button, select, label.file-pick, label.include-control, label.tracking-toggle').evaluateAll((items) => items.filter((item) => {
    const style = getComputedStyle(item); if (style.display === 'none' || style.visibility === 'hidden') return false;
    const box = item.getBoundingClientRect(); return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44);
  }).map((item) => ({ text: item.textContent?.trim(), tag: item.tagName, width: item.getBoundingClientRect().width, height: item.getBoundingClientRect().height })));
  expect(undersized).toEqual([]);
});
