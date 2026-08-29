import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { access, readFile, readdir } from 'node:fs/promises';

const bookmarkExport = (folder: string, links: string) => `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><H3>${folder}</H3><DL><p>${links}</DL><p></DL><p>`;
const realA = bookmarkExport('Desktop work', '<DT><A HREF="https://real-a.example/one">Private desktop link</A>');
const realB = bookmarkExport('Phone work', '<DT><A HREF="https://real-b.example/two">Private phone link</A>');
const mergeA = bookmarkExport('Desktop folder', '<DT><A HREF="https://MERGE.example:443/page?b=2&amp;a=1#notes">Desktop guide</A><DT><A HREF="https://desktop.example/archive">Archive</A>');
const mergeB = bookmarkExport('Phone folder', '<DT><A HREF="https://merge.example/page?a=1&amp;b=2">Phone guide</A><DT><A HREF="https://phone.example/archive">Archive</A>');

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

test('@claim:demo-first-screen opens five sample results with a real result visible at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDemo(page);
  const preview = page.locator('.demo-preview-card').first();
  const title = preview.getByRole('heading', { level: 3, name: 'Trail guide' });
  const url = preview.getByText('https://example.com/guide?utm_source=desktop', { exact: true });
  await expect(title).toBeVisible();
  await expect(url).toBeVisible();
  for (const locator of [title, url]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
  await expect(page.locator('.result-row')).toHaveCount(5);
});

test('@claim:sample-results sample shows shared, one-sided, and conflicting bookmarks', async ({ page }) => {
  await openDemo(page);
  const rows = page.locator('.result-row');
  await expect(rows.filter({ hasText: 'Trail guide' })).toContainText('Shared');
  await expect(rows.filter({ hasText: 'Learn PWA' })).toContainText('Only in B');
  await expect(rows.filter({ hasText: 'https://example.org/archive' })).toContainText('Needs review');
  await expect(rows.filter({ hasText: 'https://example.net/archive' })).toContainText('Needs review');
});

test('@claim:campaign-label-matching common campaign labels group as one bookmark', async ({ page }) => {
  await openDemo(page);
  const guide = page.locator('.result-row').filter({ hasText: 'Trail guide' });
  await expect(guide).toHaveCount(1);
  await expect(guide).toContainText('Shared');
  await expect(guide).toContainText('2 copies collapse to one bookmark');
  await expect(guide).toContainText('https://example.com/guide?utm_source=desktop');
});

test('@claim:merge-two-exports imports two exports and applies title and folder choices', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-a').setInputFiles({ name: 'desktop.html', mimeType: 'text/html', buffer: Buffer.from(mergeA) });
  await page.locator('#file-b').setInputFiles({ name: 'phone.html', mimeType: 'text/html', buffer: Buffer.from(mergeB) });
  await page.getByRole('button', { name: 'Compare 2 + 2 bookmarks' }).click();
  await expect(page.locator('.result-row')).toHaveCount(3);
  const shared = page.locator('.result-row').filter({ hasText: 'https://MERGE.example:443/page?b=2&a=1#notes' });
  await expect(shared).toContainText('Shared');
  await shared.getByLabel('Export title').selectOption({ label: 'Phone guide' });
  await shared.getByLabel('Destination').selectOption({ label: 'Phone folder' });
  const html = await downloadText(page, /Download merged HTML/);
  expect(html.match(/<DT><A /g)).toHaveLength(3);
  expect(html).toContain('<H3>Phone folder</H3>');
  expect(html).toContain('Phone guide');
  expect(html).toContain('https://MERGE.example:443/page?b=2&amp;a=1#notes');
});

test('@claim:demo-reset restores every original sample choice', async ({ page }) => {
  await openDemo(page);
  await page.locator('.result-row').first().getByRole('checkbox').uncheck();
  await expect(page.locator('.result-row input[type="checkbox"]:checked')).toHaveCount(4);
  await page.getByRole('button', { name: 'Reset demo' }).first().click();
  await expect(page.locator('.result-row input[type="checkbox"]:checked')).toHaveCount(5);
  await expect(page.locator('.result-row')).toHaveCount(5);
});

test('@claim:artwork-provenance generated map artwork has a shipped prompt and disclosure', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByText('Map illustration generated for this product with Azure AI Foundry.')).toBeVisible();
  expect((await request.get('/assets/merge-map-640.webp')).ok()).toBe(true);
  const design = await readFile('.factory/design.md', 'utf8');
  const prompt = JSON.parse(await readFile('assets/src/hero-map-a.prompt.json', 'utf8')) as Record<string, unknown>;
  expect(design).toContain('Azure AI Foundry');
  expect(design).toContain('/opt/fleet/lib/gen-image.sh');
  expect(Object.keys(prompt).length).toBeGreaterThan(0);
});

test('@claim:node-version package metadata requires Node.js 20 or newer', async () => {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as { engines?: { node?: string } };
  expect(packageJson.engines?.node).toBe('>=20');
  expect(Number(process.versions.node.split('.')[0])).toBeGreaterThanOrEqual(20);
});

test('@claim:build-output the production build contains every documented deploy artifact', async () => {
  for (const path of ['dist/index.html', 'dist/404.html', 'dist/sw.js', 'dist/staticwebapp.config.json']) await access(path);
  const assets = await readdir('dist/assets');
  expect(assets.some((name) => /^main-.*\.js$/.test(name))).toBe(true);
  expect(assets.some((name) => /\.css$/.test(name))).toBe(true);
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
  const rows = page.locator('.result-row');
  await expect(rows.locator('input[type="checkbox"]:checked')).toHaveCount(5);
  await expect(rows.getByText('Needs review')).toHaveCount(2);
  await expect(rows.getByText('Only in B')).toHaveCount(1);
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
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
});

test('populated demo URLs are non-interactive and every remaining demo link resolves', async ({ page, request }) => {
  await openDemo(page);
  await expect(page.locator('.result-row .url')).toHaveCount(5);
  await expect(page.locator('.result-row a.url')).toHaveCount(0);
  const hrefs = await page.locator('a[href]').evaluateAll((links) => [...new Set(links.map((link) => (link as HTMLAnchorElement).href))]);
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), `${href} should resolve`).toBeGreaterThanOrEqual(200);
    expect(response.status(), `${href} should resolve`).toBeLessThan(400);
  }
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
  const factoryLink = page.getByRole('link', { name: /Built by Param Factory.*opens sociobot\.in/ });
  await expect(factoryLink).toHaveAttribute('href', 'https://sociobot.in/');
  expect((await request.get('https://sociobot.in/')).ok()).toBe(true);
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
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('.demo-preview-card').first().getByText('Trail guide')).toBeVisible();
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
