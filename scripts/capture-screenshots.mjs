import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve(process.cwd(), 'screenshots', 'design');

const STATES = ['filled', 'loading', 'empty', 'error'];
const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'desktop-1280', width: 1280, height: 800 },
];

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      for (const state of STATES) {
        const url = `${BASE_URL}/design?state=${state}`;
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForSelector(`[data-testid="design-${state}-state"]`, {
          timeout: 10000,
        });
        const fileName = `design-${state}-${vp.name}.png`;
        const filePath = path.join(OUT_DIR, fileName);
        await page.screenshot({ path: filePath, fullPage: true });
        const sizeKb = (fs.statSync(filePath).size / 1024).toFixed(1);
        console.log(`[SCREENSHOT] Saved ${fileName} (${vp.width}x${vp.height}) - ${sizeKb} KB`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
