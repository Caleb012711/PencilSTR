import { test, expect } from '@playwright/test';

test.describe('PencilSTR Autonomous Platform - Core Desktop & General Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads hero landing page on initial load with brand title and primary navigation', async ({ page }) => {
    await expect(page).toHaveTitle(/PencilSTR/i);
    const header = page.locator('header');
    await expect(header.first()).toBeVisible();
    // Verify hero section is visible on initial load!
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();
    await expect(page.locator('button:has-text("Launch Terminal")').first()).toBeVisible();
  });

  test('navigates to Agent Team view and interacts with the Scribe Mesh', async ({ page, isMobile }) => {
    // If on hero landing page, enter the dashboard
    const launchBtn = page.locator('button:has-text("Launch Terminal")').first();
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    if (isMobile) {
      const agentNav = page.locator('button:has-text("Agents"), button:has-text("Scribes")').first();
      await agentNav.click();
    } else {
      const agentSidebarBtn = page.locator('button[aria-label="Agent Team"], button:has-text("Agent Team")').first();
      await agentSidebarBtn.click();
    }

    // Verify Agent Team view is active
    await expect(page.locator('h2:has-text("Agent Team")').first()).toBeVisible();

    // Verify persistent scribes are present
    await expect(page.locator('text=Astra').first()).toBeVisible();
    await expect(page.locator('text=Pencil-DSCR').first()).toBeVisible();

    // Verify chat input or war room is ready
    const inputArea = page.locator('textarea').first();
    await expect(inputArea).toBeVisible();

    // Type a message and send
    await inputArea.fill('Audit DSCR sensitivity for current underwriting');
    const sendBtn = page.locator('button[data-testid="agent-chat-send-btn"]').first();
    if (await sendBtn.isVisible()) {
      await sendBtn.click();
    } else {
      await inputArea.press('Enter');
    }

    // Expect message to appear
    await expect(page.locator('text=Audit DSCR sensitivity').first()).toBeVisible();
  });

  test('verifies 3 resizable windows, cute animated pet mascots, and rules config on Agent Team page', async ({ page, isMobile }) => {
    // If on hero landing page, enter the dashboard
    const launchBtn = page.locator('button:has-text("Launch Terminal")').first();
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    if (isMobile) {
      const agentNav = page.locator('button:has-text("Agents"), button:has-text("Scribes")').first();
      await agentNav.click();
    } else {
      const agentSidebarBtn = page.locator('button[aria-label="Agent Team"], button:has-text("Agent Team")').first();
      await agentSidebarBtn.click();
    }

    await expect(page.locator('h2:has-text("Agent Team")').first()).toBeVisible();

    if (!isMobile) {
      // 1. Verify Window 1 (Roster)
      await expect(page.locator('text=Persistent Scribes').first()).toBeVisible();
      const leftResizeHandle = page.locator('div[title="Drag to resize Roster window"]');
      await expect(leftResizeHandle).toBeVisible();

      // 2. Verify Window 2 (War Room / Dialogue Canvas)
      await expect(page.locator('button:has-text("Clear Feed")').first()).toBeVisible();
      const rightResizeHandle = page.locator('div[title="Drag to resize Scribe Config window"]');
      await expect(rightResizeHandle).toBeVisible();

      // 3. Verify Window 3 (Scribe Specification & Rules Config)
      await expect(page.locator('text=Scribe Specification & Rules').first()).toBeVisible();
      await expect(page.locator('text=Operational Rules & Guardrails').first()).toBeVisible();
      await expect(page.locator('text=Scope & Autonomy Tier').first()).toBeVisible();

      // Verify Pet Mascot Showcase is visible in Window 3
      const petShowcase = page.locator('div:has-text("Archie"), div:has-text("Pip"), div:has-text("Miso"), div:has-text("Barnaby"), div:has-text("Nova")').first();
      await expect(petShowcase).toBeVisible();

      // Test Minimizing Window 1 (Roster) - Dedicated Vertical Rectangular Pet Pill Dock appears when leftmost bar is closed
      const minimizeRosterBtn = page.locator('button[aria-label="Minimize Roster"]').first();
      await minimizeRosterBtn.click();

      // Verify Expand Roster button appears in minimized rail
      const expandRosterBtn = page.locator('button[aria-label="Expand Roster"]').first();
      await expect(expandRosterBtn).toBeVisible();

      // Verify Dedicated Vertical Rectangular Pet Pill Dock is visible when left window is minimized
      const petPillDock = page.locator('div[title*="Autonomous Scribes Pet Pill Dock"]');
      await expect(petPillDock).toBeVisible();
      await expect(page.locator('text=/WORK|IDLE/').first()).toBeVisible();

      // Test Minimizing Window 2 (Agent Chat)
      const minimizeChatBtn = page.locator('button[data-testid="minimize-agent-chat"], button[aria-label="Minimize Agent Chat"]').last();
      await minimizeChatBtn.click();

      // Verify Expand Agent Chat button appears in minimized rail
      const expandChatBtn = page.locator('button[aria-label="Expand Agent Chat"], button[aria-label="Expand War Room"]').first();
      await expect(expandChatBtn).toBeVisible();

      // Test Minimizing Window 3 (Config)
      const minimizeConfigBtn = page.locator('button[aria-label="Minimize Config"]').first();
      await minimizeConfigBtn.click();

      // Verify Expand Config button appears in minimized rail
      const expandConfigBtn = page.locator('button[aria-label="Expand Config"]').first();
      await expect(expandConfigBtn).toBeVisible();

      // Test Pet Work Simulation Toggle on Vertical Rectangular Pet Pill (while left is minimized)
      const testWorkBtn = page.locator('button:has-text("TEST"), button:has-text("STOP")').first();
      await testWorkBtn.click();
      await expect(page.locator('text=WORK').first()).toBeVisible();
      await testWorkBtn.click(); // toggle back

      // Expand all three back
      await expandRosterBtn.click();
      await expandChatBtn.click();
      await expandConfigBtn.click();

      // Test adding a custom operational rule in Window 3
      const ruleInput = page.locator('input[placeholder="Add custom rule or guardrail..."]').first();
      await ruleInput.fill('Rule: Always verify 5-year historical county occupancy pace');
      const addRuleBtn = page.locator('button:has-text("Add")').first();
      await addRuleBtn.click();

      // Verify custom rule appears in the list
      await expect(page.locator('text=historical county occupancy pace').first()).toBeVisible();
    } else {
      // On mobile, test the 3-way pane switcher (Roster -> War Room -> Config)
      await page.locator('button:has-text("Config")').first().click();
      await expect(page.locator('text=Scribe Specification & Rules').first()).toBeVisible();
      await expect(page.locator('text=Operational Rules & Guardrails').first()).toBeVisible();

      await page.locator('button:has-text("Roster")').first().click();
      await expect(page.locator('text=Persistent Scribes').first()).toBeVisible();
    }
  });

  test('navigates to The Drafting Table and tests deliverables workspace', async ({ page, isMobile }) => {
    // If on hero landing page, enter the dashboard
    const launchBtn = page.locator('button:has-text("Launch Terminal")').first();
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    if (isMobile) {
      const hamburger = page.locator('button[aria-label="Open navigation menu"]').first();
      if (await hamburger.isVisible()) {
        await hamburger.click();
        const draftingLink = page.locator('button:has-text("The Drafting Table")').first();
        await draftingLink.click();
      }
    } else {
      const draftingBtn = page.locator('button[aria-label="The Drafting Table"]').first();
      await draftingBtn.click();
    }

    // Verify Drafting Table header
    await expect(page.locator('h2:has-text("The Drafting Table")')).toBeVisible();

    // Check deliverable filter tabs (Sheets, Memos, Code, Audits)
    const sheetsTab = page.locator('button:has-text("Sheets")').first();
    await expect(sheetsTab).toBeVisible();
    await sheetsTab.click();

    // Verify deliverable cards and table exist
    const artifactTitle = page.locator('h4.font-serif, div.font-serif').first();
    await expect(artifactTitle).toBeVisible();

    // Verify CSV / Export action
    const exportBtn = page.locator('button:has-text("CSV"), button:has-text("Export")').first();
    await expect(exportBtn).toBeVisible();
  });

  test('navigates to Analyst Chat and tests agent ping selector pills', async ({ page, isMobile }) => {
    // If on hero landing page, enter the dashboard
    const launchBtn = page.locator('button:has-text("Launch Terminal")').first();
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    if (isMobile) {
      const chatBtn = page.locator('button:has-text("Chat")').first();
      await chatBtn.click();
    } else {
      const chatSidebarBtn = page.locator('button[aria-label="Analyst Intelligence"]').first();
      await chatSidebarBtn.click();
    }

    // Verify Analyst Chat header
    await expect(page.locator('h2:has-text("Deal Analyst"), h2:has-text("Analyst Intelligence")').first()).toBeVisible();

    // Verify agent ping pills exist (@Astra, @Pencil-DSCR, @Pencil-Zoning)
    const astraPill = page.locator('button:has-text("@Astra")').first();
    await expect(astraPill).toBeVisible();

    // Click pill to tag the agent
    await astraPill.click();

    // Complete the message and send
    const chatInput = page.locator('textarea').first();
    await chatInput.fill('@Astra Generate an executive summary memo for our investment committee');
    const sendBtn = page.locator('button[type="submit"]').first();
    await sendBtn.click();

    // Expect the message in conversation
    await expect(page.locator('text=executive summary memo').first()).toBeVisible();
  });

  test('verifies Agent Chat interactive recipient selection and switching', async ({ page, isMobile }) => {
    // If on hero landing page, enter the dashboard
    const launchBtn = page.locator('button:has-text("Launch Terminal")').first();
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    if (isMobile) {
      const agentNav = page.locator('button:has-text("Agents"), button:has-text("Scribes")').first();
      await agentNav.click();
    } else {
      const agentSidebarBtn = page.locator('button[aria-label="Agent Team"], button:has-text("Agent Team")').first();
      await agentSidebarBtn.click();
    }

    // Verify Agent Team view is active
    await expect(page.locator('h2:has-text("Agent Team")').first()).toBeVisible();

    // Verify "Talking to:" selector strip is visible in Agent Chat
    await expect(page.locator('button:has-text("All Agents (Team)")').first()).toBeVisible();

    // Click on Astra direct selector
    const astraBtn = page.locator('button:has-text("Astra")').first();
    await astraBtn.click();

    // Verify recipient bar updates to Addressing
    await expect(page.locator('text=Addressing:').first()).toBeVisible();

    // Click "Switch to All Agents" button
    const switchBackBtn = page.locator('button:has-text("Switch to All Agents")').first();
    if (await switchBackBtn.isVisible()) {
      await switchBackBtn.click();
      await expect(page.locator('text=All Agents (Team Collaboration)').first()).toBeVisible();
    }
  });

  test('verifies Mascot customizer with distinct animal icons and cyber shape companions', async ({ page, isMobile }) => {
    // Enter the dashboard
    const launchBtn = page.locator('button:has-text("Launch Terminal")').first();
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    if (isMobile) {
      const agentNav = page.locator('button:has-text("Agents"), button:has-text("Scribes")').first();
      await agentNav.click();
      // On mobile switch to Config pane
      await page.locator('button:has-text("Config")').first().click();
    } else {
      const agentSidebarBtn = page.locator('button[aria-label="Agent Team"], button:has-text("Agent Team")').first();
      await agentSidebarBtn.click();
    }

    // Verify Mascot & Shape Chooser section is present
    await expect(page.locator('text=Choose Mascot / Shape Icon').first()).toBeVisible();

    // Verify category switchers exist
    const shapesTab = page.locator('button:has-text("Shapes")').first();
    const animalsTab = page.locator('button:has-text("Animals")').first();
    await expect(shapesTab).toBeVisible();
    await expect(animalsTab).toBeVisible();

    // Switch to Shapes tab
    await shapesTab.click();

    // Verify unique shape companion icons appear (Dotsy, Byte, Tess, Aura, Vector)
    await expect(page.locator('button:has-text("Dotsy")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Byte")').first()).toBeVisible();

    // Click on Dotsy to equip Quantum Dots shape companion
    await page.locator('button:has-text("Dotsy")').first().click();
    await expect(page.locator('text=Quantum Orbit Dots').first()).toBeVisible();

    // Switch back to Animals tab
    await animalsTab.click();
    await expect(page.locator('button:has-text("Archie")').first()).toBeVisible();
  });
});
