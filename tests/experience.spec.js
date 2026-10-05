import { test, expect } from '@playwright/test';

async function openExperience(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const skip = page.getByRole('button', { name: /skip intro/i });
  if (await skip.isVisible()) await skip.click();
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 15000 });
}

async function scrollMechanics(page, progress) {
  await page.evaluate(p => {
    document.documentElement.style.scrollBehavior = 'auto';
    const section = document.querySelector('#mechanics');
    const sticky = section.querySelector('.mechanics-sticky');
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + p * (section.offsetHeight - sticky.offsetHeight));
  }, progress);
  await expect.poll(async () => Number(await page.locator('#mechanics').getAttribute('data-progress'))).toBeCloseTo(progress, 2);
}

test('opens a working local 3D scene with no runtime errors or missing local assets', async ({ page }) => {
  const errors = [];
  const missing = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith('http://127.0.0.1') && response.status() >= 400) missing.push(response.url()); });
  await openExperience(page);
  await expect(page.getByRole('heading', { name: /Time is a story/ })).toBeVisible();
  await expect(page.locator('#hero-watch-stage')).toHaveClass(/has-webgl/);
  await expect(page.locator('#hero-watch-stage canvas')).toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/intro-active/);
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});

test('watch disassembles and reassembles through reversible scroll positions', async ({ page }) => {
  await openExperience(page);
  await scrollMechanics(page, .05);
  await expect(page.locator('#assembly-state')).toHaveText('ASSEMBLED');
  await scrollMechanics(page, .5);
  await expect(page.locator('#assembly-state')).toHaveText('DISASSEMBLED');
  await expect(page.locator('#assembly-percent')).toHaveText('0');
  await expect(page.locator('#anatomy-stage')).toHaveClass(/has-webgl/);
  await expect.poll(async () => Number(await page.locator('#anatomy-stage').getAttribute('data-layer-separation'))).toBeGreaterThan(4);
  await scrollMechanics(page, .97);
  await expect(page.locator('#assembly-state')).toHaveText('ASSEMBLED');
  await expect(page.locator('#assembly-percent')).toHaveText('100');
  await expect.poll(async () => Number(await page.locator('#anatomy-stage').getAttribute('data-layer-separation'))).toBeLessThan(.02);
  await scrollMechanics(page, .5);
  await expect(page.locator('#assembly-state')).toHaveText('DISASSEMBLED');
  await scrollMechanics(page, .05);
  await expect(page.locator('#assembly-state')).toHaveText('ASSEMBLED');
});

test('manual disassembly works and scrolling restores the scroll-driven animation', async ({ page }) => {
  await openExperience(page);
  await scrollMechanics(page, .06);
  const button = page.locator('#assembly-toggle');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#assembly-state')).toHaveText('DISASSEMBLED');
  await button.click();
  await expect(page.locator('#assembly-state')).toHaveText('ASSEMBLED');
  await scrollMechanics(page, .5);
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#assembly-state')).toHaveText('DISASSEMBLED');
});

test('milestone tabs support click and keyboard navigation with correct sources', async ({ page }) => {
  await openExperience(page);
  const india = page.getByRole('tab', { name: /1961/ });
  await india.click();
  await expect(india).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#timeline-title')).toHaveText('Precision for the people.');
  await india.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /2022/ })).toBeFocused();
  await expect(page.locator('#timeline-title')).toHaveText('The story changes hands.');
  await expect(page.locator('#timeline-source')).toHaveAttribute('href', 'https://inc42.com/company/argos-watches/');
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: /1601/ })).toHaveAttribute('aria-selected', 'true');
});

test('mobile menu, focus recovery, local photographs, and layout remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExperience(page);
  const menu = page.getByRole('button', { name: 'Open navigation' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu a').first()).toBeFocused();
  await page.locator('#mobile-menu a').last().focus();
  await page.keyboard.press('Tab');
  await expect(menu).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.locator('#mobile-menu a[href="#argos"]').click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await page.locator('.argos-cards').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.argos-cards img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  await expect(page.locator('a[href="https://www.argoswatch.in/collections/olympus-ii"]').first()).toHaveAttribute('rel', 'noopener noreferrer');
});

test('reduced-motion and unavailable WebGL preserve content and controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
      return original.call(this, type, ...args);
    };
  });
  await openExperience(page);
  await expect(page.locator('#hero-watch-stage')).toHaveClass(/no-webgl/);
  await expect(page.locator('#hero-watch-stage .watch-fallback')).toBeVisible();
  await scrollMechanics(page, .5);
  await expect(page.locator('#assembly-state')).toHaveText('DISASSEMBLED');
  await page.locator('#assembly-toggle').click();
  await expect(page.locator('#assembly-state')).toHaveText('ASSEMBLED');
  await expect(page.locator('#sound-button')).toHaveAttribute('aria-pressed', 'false');
});
