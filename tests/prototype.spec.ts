import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));

const SCREENSHOT_PAGES = [
  { name: 'home', path: '/' },
  { name: 'grade-pbt-gf30', path: '/products/pbt-glass-filled-30/' },
  { name: 'request-a-quote', path: '/request-a-quote/' },
  { name: 'sell-your-scrap', path: '/sell-your-scrap/' },
];

const isMobile = (projectName: string) => projectName.includes('iphone');

test.describe('screenshots', () => {
  for (const p of SCREENSHOT_PAGES) {
    test(`screenshot ${p.name}`, async ({ page }, info) => {
      await page.goto(p.path);
      await expect(page.locator('h1')).toHaveCount(1);
      await page.screenshot({ path: `screenshots/${info.project.name}-${p.name}.png`, fullPage: true });
    });
  }
});

test('main navigation is reachable (mobile menu opens on phones)', async ({ page }, info) => {
  await page.goto('/');
  const nav = page.locator('#site-nav');
  const toggle = page.locator('[data-menu-toggle]');
  if (isMobile(info.project.name)) {
    await expect(toggle).toBeVisible();
    await expect(nav).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Sell Your Scrap' })).toBeVisible();
    await page.screenshot({ path: `screenshots/${info.project.name}-menu-open.png` });
    await page.keyboard.press('Escape');
    await expect(nav).toBeHidden();
    await expect(toggle).toBeFocused();
  } else {
    await expect(toggle).toBeHidden();
    await expect(nav.getByRole('link', { name: 'Sell Your Scrap' })).toBeVisible();
  }
});

test('RFQ: empty submit is blocked with errors', async ({ page }, info) => {
  await page.goto('/request-a-quote/');
  await page.getByRole('button', { name: 'Send quote request' }).click();
  await expect(page).toHaveURL(/\/request-a-quote\/$/);
  const summary = page.locator('[data-error-summary]');
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(page.locator('#name-error')).toHaveText('This field is required.');
  await expect(page.locator('#rfq-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(summary.locator('li')).toHaveCount(8);
  await page.screenshot({ path: `screenshots/${info.project.name}-rfq-errors.png`, fullPage: true });
});

test('RFQ: grade pre-filled from query, valid submit reaches thank-you', async ({ page }) => {
  await page.goto('/request-a-quote/?grade=pbt-glass-filled-30');
  await expect(page.locator('#rfq-grade')).toHaveValue('pbt-glass-filled-30');
  await page.fill('#rfq-name', 'Test Buyer');
  await page.fill('#rfq-company', 'Test Molders');
  await page.fill('#rfq-city', 'Delhi');
  await page.fill('#rfq-phone', '+91 98765 43210');
  await page.fill('#rfq-email', 'buyer@example.com');
  await page.fill('#rfq-quantity', '500');
  await page.check('#rfq-sample-yes');
  await page.fill('#rfq-address', 'Plot 12, Sector 5, Bawana Industrial Area');
  await page.fill('#rfq-pin', '110039');
  await page.getByRole('button', { name: 'Send quote request' }).click();
  await expect(page).toHaveURL(/\/thank-you\/\?type=quote$/);
  await expect(page.locator('[data-variant="quote"]')).toBeVisible();
});

test('indexing guard matches the PROTOTYPE flag', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', site.PROTOTYPE ? 'noindex, nofollow' : 'index, follow');
});

test('annotations toggle shows labels and persists across pages', async ({ page }) => {
  await page.goto('/');
  const firstAnno = page.locator('main .anno').first();
  await expect(firstAnno).toBeHidden();
  await page.locator('[data-anno-toggle]').click();
  await expect(firstAnno).toBeVisible();
  await page.goto('/quality/');
  await expect(page.locator('[data-anno-toggle]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('main .anno').first()).toBeVisible();
});

test('RFQ: sample address appears only when a sample is requested', async ({ page }, info) => {
  // "Request a sample" links land here with ?sample=yes: address is shown straight away.
  await page.goto('/request-a-quote/?sample=yes');
  const address = page.locator('#sample-address');
  await expect(address).toBeVisible();
  await page.screenshot({ path: `screenshots/${info.project.name}-rfq-sample-address.png`, fullPage: true });

  // Address is required while visible.
  await page.getByRole('button', { name: 'Send quote request' }).click();
  await expect(page.locator('#address-error')).toHaveText('This field is required.');
  await page.fill('#rfq-pin', '12');
  await page.getByRole('button', { name: 'Send quote request' }).click();
  await expect(page.locator('#pin-error')).toHaveText('Enter a 6-digit PIN code, e.g. 110039.');

  // Choosing "No" hides it and it no longer blocks submission.
  await page.check('#rfq-sample-no');
  await expect(address).toBeHidden();
  await page.getByRole('button', { name: 'Send quote request' }).click();
  await expect(page.locator('[data-error-summary]')).not.toContainText('Delivery address');

  // Plain quote link: hidden until "Yes" is chosen.
  await page.goto('/request-a-quote/');
  await expect(address).toBeHidden();
  await page.check('#rfq-sample-yes');
  await expect(address).toBeVisible();
});
