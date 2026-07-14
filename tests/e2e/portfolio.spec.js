import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const output = new URL('../../artifacts/', import.meta.url);

test.beforeAll(async () => {
  await mkdir(output, { recursive: true });
});

test('renders without console errors or horizontal overflow', async ({ page }, testInfo) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('h1')).toContainText('do the work');
  await expect(page.locator('#work .project')).toHaveCount(4);
  await expect(page.locator('#contact')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);

  await page.screenshot({
    path: new URL(`portfolio-${testInfo.project.name}.png`, output).pathname,
    fullPage: true,
  });
});

test('mobile navigation opens, links, and closes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle.locator('.sr-only')).toHaveText('Close navigation');
  await expect(page.locator('.site-nav')).toHaveClass(/is-open/);
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await expect(page.locator('.site-nav a').first()).toBeFocused();
  const openMenuAudit = await new AxeBuilder({ page }).analyze();
  const openMenuBlocking = openMenuAudit.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  expect(openMenuBlocking).toEqual([]);
  await page.locator('.site-nav a[href="#work"]').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle.locator('.sr-only')).toHaveText('Open navigation');
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(page).toHaveURL(/#work$/);
});

test('primary content stays visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity', '1');
  await expect(page.locator('#work .project').first()).toHaveCSS('opacity', '1');
  await context.close();
});

test('all internal section links resolve to existing targets', async ({ page }) => {
  await page.goto('/');
  const hashes = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  for (const hash of new Set(hashes)) {
    expect(await page.locator(hash).count(), `Missing target for ${hash}`).toBe(1);
  }
});

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  expect(blocking, blocking.map((violation) => `${violation.id}: ${violation.help}`).join('\n')).toEqual([]);
});
