import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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
test('has no serious accessibility violations before or after compare', async ({ page }) => {
  await page.goto('/');
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await page.getByRole('button', { name: 'Use sample maps' }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
