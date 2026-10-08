import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function runAudit() {
  const targetUrl = process.argv[2] || 'https://pencilstr.vercel.app';
  console.log(`[Audit] Launching headless browser for ${targetUrl}...`);

  const outDir = path.join(process.cwd(), 'audit-results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('[Audit] Navigating to target URL...');
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (err) {
    console.warn('[Audit] Timeout waiting for networkidle, continuing with domcontentloaded...');
  }

  // 1. Landing Page Screenshot
  await page.screenshot({ path: path.join(outDir, '01_landing_hero.png'), fullPage: false });
  console.log('[Audit] Captured 01_landing_hero.png');

  // 2. Launch Terminal into Dashboard
  const launchBtn = page.locator('button:has-text("Launch Terminal"), button:has-text("Enter Terminal")').first();
  if (await launchBtn.isVisible()) {
    await launchBtn.click();
    await page.waitForTimeout(1000);
  } else {
    // If query parameter was used
    await page.goto(`${targetUrl}?app=true`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(outDir, '02_dashboard_overview.png'), fullPage: false });
  console.log('[Audit] Captured 02_dashboard_overview.png');

  // Navigation tabs to audit
  const tabs = [
    { name: 'Studio Underwriter', selector: 'button[aria-label="Studio Underwriter"], button:has-text("Studio")' },
    { name: 'Analyst Chat', selector: 'button[aria-label="Analyst Intelligence"], button:has-text("Analyst Chat")' },
    { name: 'Agent Team', selector: 'button[aria-label="Agent Team"], button:has-text("Agent Team"), button:has-text("Pencil Team")' },
    { name: 'The Drafting Table', selector: 'button[aria-label="The Drafting Table"], button:has-text("The Drafting Table"), button:has-text("Drafting")' },
    { name: 'Autonomous Radar', selector: 'button[aria-label="Autonomous Radar"], button:has-text("Autonomous Radar"), button:has-text("Radar")' },
    { name: 'Pipeline Board', selector: 'button[aria-label="Pipeline Board"], button:has-text("Pipeline")' },
    { name: 'HOA Audit', selector: 'button[aria-label="HOA & CC&R Audit"], button:has-text("HOA & CC&R Audit"), button:has-text("Audit")' },
  ];

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    try {
      const btn = page.locator(tab.selector).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(800);
        const fileName = `03_tab_${i + 1}_${tab.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
        await page.screenshot({ path: path.join(outDir, fileName), fullPage: false });
        console.log(`[Audit] Captured ${fileName}`);
      }
    } catch (e: any) {
      console.warn(`[Audit] Could not capture tab ${tab.name}:`, e?.message);
    }
  }

  // Mobile viewport audit
  console.log('[Audit] Testing mobile viewport (iPhone 14)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '04_mobile_view.png'), fullPage: false });
  console.log('[Audit] Captured 04_mobile_view.png');

  await browser.close();
  console.log(`[Audit] Complete. Found ${consoleErrors.length} console error(s).`);
  if (consoleErrors.length > 0) {
    console.log('[Audit Errors]:', consoleErrors.slice(0, 5));
  }
}

runAudit().catch((err) => {
  console.error('[Audit Error]', err);
  process.exit(1);
});
