import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport UX & Responsive Polish', () => {
  // Enforce mobile viewport
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 / modern smartphone

  test.beforeEach(async ({ page }) => {
    await page.goto('/?app=true');
  });

  test('mobile header shows hamburger button and opens drawer navigation', async ({ page }) => {
    // Check mobile hamburger button
    const menuBtn = page.locator('button[aria-label="Open navigation menu"]').first();
    await expect(menuBtn).toBeVisible();

    // Open drawer
    await menuBtn.click();

    // Verify slide-out drawer items
    await expect(page.locator('div.fixed.inset-0 button:has-text("The Drafting Table")').first()).toBeVisible();
    await expect(page.locator('div.fixed.inset-0 button:has-text("Agent Team")').first()).toBeVisible();
    await expect(page.locator('div.fixed.inset-0 button:has-text("Pipeline Board")').first()).toBeVisible();

    // Close drawer
    const closeBtn = page.locator('div.fixed.inset-0 button[aria-label="Close navigation menu"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test('mobile bottom bar allows instantaneous view switching', async ({ page }) => {
    // Check bottom navigation bar
    const bottomNav = page.locator('nav.fixed.bottom-0').first();
    await expect(bottomNav).toBeVisible();

    // Tap Studio tab
    const studioBtn = page.locator('nav.fixed.bottom-0 button:has-text("Studio")').first();
    await studioBtn.click();
    await expect(page.locator('text=Helpful Features:').first()).toBeVisible();

    // Tap Chat tab
    const chatBtn = page.locator('nav.fixed.bottom-0 button:has-text("Chat")').first();
    await chatBtn.click();
    await expect(page.locator('h2:has-text("Deal Analyst"), h2:has-text("Analyst Intelligence")').first()).toBeVisible();

    // Tap Scribes tab
    const scribesBtn = page.locator('nav.fixed.bottom-0 button:has-text("Scribes")').first();
    await scribesBtn.click();
    await expect(page.locator('h2:has-text("Agent Team")').first()).toBeVisible();
  });

  test('mobile Agent Team view toggles smoothly between Agent Chat feed and Agent Roster', async ({ page }) => {
    // Navigate to Agent Team
    const scribesBtn = page.locator('nav.fixed.bottom-0 button:has-text("Scribes")').first();
    await scribesBtn.click();

    // Verify Agent Chat and Roster toggle buttons
    const rosterTabBtn = page.locator('button:has-text("Roster"):visible').first();
    const chatTabBtn = page.locator('button:has-text("Agent Chat"), button:has-text("War Room")').first();

    await expect(rosterTabBtn).toBeVisible();
    await expect(chatTabBtn).toBeVisible();

    // Switch to Roster tab on mobile
    await rosterTabBtn.click();

    // Verify agent cards are displayed in roster
    await expect(page.locator('text=Astra').first()).toBeVisible();
    await expect(page.locator('text=Pencil-DSCR').first()).toBeVisible();

    // Tap on an agent to switch into 1:1 direct channel
    await page.locator('text=Pencil-DSCR').first().click();

    // Should return to feed with direct line or agent chat
    await expect(page.locator('textarea').first()).toBeVisible();

    // Switch back to Agent Chat mesh
    await chatTabBtn.click();
  });

  test('mobile Drafting Table responsive tabs and deliverable inspection', async ({ page }) => {
    // Open drawer and navigate to The Drafting Table
    const menuBtn = page.locator('button[aria-label="Open navigation menu"]').first();
    await menuBtn.click();
    const draftingLink = page.locator('div.fixed.inset-0 button:has-text("The Drafting Table")').first();
    await draftingLink.click();

    // Verify Drafting Table is visible
    await expect(page.locator('h2:has-text("The Drafting Table")')).toBeVisible();

    // Filter button exists
    const allFilterBtn = page.locator('button:has-text("All")').first();
    await expect(allFilterBtn).toBeVisible();
  });

  test('mobile Deploy Scribe modal works seamlessly', async ({ page }) => {
    // Navigate to Agent Team
    const scribesBtn = page.locator('nav.fixed.bottom-0 button:has-text("Scribes")').first();
    await scribesBtn.click();

    // Click Deploy button
    const deployBtn = page.locator('button:has-text("Deploy")').first();
    await deployBtn.click();

    // Verify modal appears
    await expect(page.locator('h3:has-text("Deploy New Pencil Scribe"), h3:has-text("Deploy")').first()).toBeVisible();

    // Fill form
    await page.locator('input[placeholder*="Pencil-Insurance"]').first().fill('Pencil-TaxShield');
    await page.locator('input[placeholder*="Commercial STR Hazard"]').first().fill('STR Tax Strategist');

    // Submit form
    const submitBtn = page.locator('button:has-text("Deploy Scribe"), button[type="submit"]:has-text("Deploy")').last();
    await submitBtn.click();

    // Switch to Roster to view newly deployed scribe
    const rosterTabBtn = page.locator('button:has-text("Roster"):visible').first();
    await rosterTabBtn.click();

    // Verify new agent is listed in roster
    await expect(page.locator('text=Pencil-TaxShield').first()).toBeVisible();

    // Switch to Config tab on mobile
    const configTabBtn = page.locator('div.lg\\:hidden button:has-text("Config")').first();
    await configTabBtn.click();
    await expect(page.locator('text=Scribe Specification & Rules').first()).toBeVisible();
  });
});
