import { ProjectArtifact } from '../types/artifact';

export const INITIAL_ARTIFACTS: ProjectArtifact[] = [
  {
    id: 'art-1',
    title: '10-Year Pro-Forma Cash Flow & DSCR Amortization Stack',
    type: 'spreadsheet',
    dealId: 'deal-gatlinburg-ridge',
    dealTitle: 'The Ridge Alpine',
    authorAgentId: 'agent-dscr',
    authorAgentName: 'Pencil-DSCR',
    authorAgentColor: '#059669',
    createdAt: 'Today, 10:18 AM',
    updatedAt: 'Today, 10:18 AM',
    description: 'Tabular pro-forma operating statement, expense stacks, debt service coverage, and unlevered NOI schedules.',
    tags: ['DSCR', 'Spreadsheet', 'Cash Flow', 'Debt'],
    isPinned: true,
    content: 'Category,Item,Monthly ($),Annual ($),Frequency,Notes\nRevenue,Gross Rental Income,7250,87000,Monthly,Based on $485 ADR @ 64% Occ\nRevenue,Cleaning Fee Reimbursements,750,9000,Monthly,Pass-through to guest\nExpense,Property Management (15%),1088,13050,Monthly,Turnkey STR operator fee\nExpense,County Property Taxes,325,3900,Monthly,Sevier County rate assessment\nExpense,Hazard & STR Commercial Insurance,280,3360,Monthly,STR liability endorsement\nExpense,Utilities & Gigabit Wi-Fi,450,5400,Monthly,Electric water gas starlink\nExpense,Repairs & Maintenance Capex Reserve,350,4200,Monthly,5% gross revenue reserve\nDebt Service,Principal & Interest (7.15%),2985,35820,Monthly,30-yr fixed DSCR loan @ 80% LTV\nNet Cash Flow,Pre-Tax Cash Flow,2022,24270,Monthly,14.8% Cash-on-Cash Return',
    spreadsheetData: {
      columns: ['Category', 'Item', 'Frequency', 'Monthly ($)', 'Annual ($)', 'Notes'],
      rows: [
        { id: 'r1', category: 'Revenue', item: 'Gross Nightly Rental Revenue', frequency: 'Monthly', monthly: 7250, annual: 87000, notes: 'Based on $485 ADR at 64% base occupancy' },
        { id: 'r2', category: 'Revenue', item: 'Cleaning Fee Collections', frequency: 'Monthly', monthly: 750, annual: 9000, notes: 'Direct pass-through fee from guests' },
        { id: 'r3', category: 'Operating Expense', item: 'Professional Property Management', frequency: 'Monthly', monthly: 1088, annual: 13050, notes: '15% gross ADR management fee' },
        { id: 'r4', category: 'Operating Expense', item: 'County Real Estate Taxes', frequency: 'Monthly', monthly: 325, annual: 3900, notes: 'Sevier County assessed rate' },
        { id: 'r5', category: 'Operating Expense', item: 'STR Commercial Hazard & Fire Insurance', frequency: 'Monthly', monthly: 280, annual: 3360, notes: 'Includes $2M commercial liability policy' },
        { id: 'r6', category: 'Operating Expense', item: 'Utilities (Electric, Water, High-Speed Starlink)', frequency: 'Monthly', monthly: 450, annual: 5400, notes: 'Hot tub electric heating factored' },
        { id: 'r7', category: 'Operating Expense', item: 'Maintenance & Capex Reserve', frequency: 'Monthly', monthly: 350, annual: 4200, notes: '5% gross revenue reserve for furniture and hot tub upkeep' },
        { id: 'r8', category: 'Debt Service', item: 'Mortgage Principal & Interest (7.15%)', frequency: 'Monthly', monthly: 2985, annual: 35820, notes: '30-year fixed DSCR loan ($516,000 borrowed)' },
        { id: 'r9', category: 'Net Cash Flow', item: 'Free Pre-Tax Cash Flow to Equity', frequency: 'Monthly', monthly: 2022, annual: 24270, notes: '14.8% Cash-on-Cash return on $164k total cash invested' },
      ],
      summaryMetric: { label: 'Net Operating Income (NOI)', value: '$60,090 / yr (1.68x DSCR)' },
    },
  },
  {
    id: 'art-2',
    title: 'Executive STR Investor Summary Card (Interactive HTML)',
    type: 'html',
    dealId: 'deal-gatlinburg-ridge',
    dealTitle: 'The Ridge Alpine',
    authorAgentId: 'agent-astra',
    authorAgentName: 'Astra (Principal Scribe)',
    authorAgentColor: '#8B5CF6',
    createdAt: 'Today, 10:22 AM',
    updatedAt: 'Today, 10:22 AM',
    description: 'Self-contained interactive investor teaser card with dynamic DSCR rate sensitivity calculator and pro-forma breakdown.',
    tags: ['HTML', 'Interactive', 'Investor Brief', 'Presentation'],
    isPinned: true,
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0E0E0D; color: #F4F3EF; padding: 24px; }
    .card { background: #161615; border: 1px solid #282825; border-radius: 16px; padding: 24px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background: rgba(139, 92, 246, 0.15); color: #C4B5FD; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; font-family: monospace; text-transform: uppercase; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
    p.sub { color: #8C8880; font-size: 13px; margin-bottom: 20px; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .metric-box { background: #1F1F1D; border: 1px solid #2D2D2A; border-radius: 12px; padding: 14px; text-align: center; }
    .metric-label { font-size: 10px; color: #8C8880; text-transform: uppercase; font-family: monospace; margin-bottom: 4px; }
    .metric-val { font-size: 18px; font-weight: 800; color: #34D399; font-family: monospace; }
    .slider-zone { background: #1C1C1A; border: 1px solid #2B2B28; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .slider-title { font-size: 12px; font-weight: 600; color: #D4D1CA; margin-bottom: 8px; display: flex; justify-content: space-between; }
    input[type=range] { width: 100%; accent-color: #D97706; cursor: pointer; }
    .footer-note { font-size: 11px; color: #787570; text-align: center; margin-top: 16px; font-family: monospace; }
    .tag-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .tag { font-size: 11px; background: #262624; color: #A3A19B; padding: 3px 8px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">PencilSTR Drafting Artifact</span>
    <h1>The Ridge Alpine — Acquisition Memo</h1>
    <p class="sub">Gatlinburg, TN · 4 Beds · 3.5 Baths · Luxury Mountain View Cabin</p>
    
    <div class="tag-row">
      <span class="tag">Unrestricted Zoning</span>
      <span class="tag">Active Transferable STR Permit</span>
      <span class="tag">Private Hot Tub & Sauna</span>
    </div>

    <div class="metrics">
      <div class="metric-box">
        <div class="metric-label">Purchase Price</div>
        <div class="metric-val" style="color: #F4F3EF;">$645,000</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Projected ADR</div>
        <div class="metric-val">$485 / nt</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">DSCR Coverage</div>
        <div class="metric-val" id="dscrDisplay">1.38x</div>
      </div>
    </div>

    <div class="slider-zone">
      <div class="slider-title">
        <span>Stress Test Interest Rate:</span>
        <span id="rateLabel" style="color: #F59E0B; font-family: monospace;">7.15%</span>
      </div>
      <input type="range" id="rateSlider" min="6.0" max="9.5" step="0.25" value="7.15" oninput="updateCalculations(this.value)">
      <div style="display: flex; justify-content: space-between; font-size: 10px; color: #787570; margin-top: 4px; font-family: monospace;">
        <span>6.0% (Bull Case)</span>
        <span>7.15% (Base)</span>
        <span>9.5% (Severe Stress)</span>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.25); border-radius: 10px; padding: 12px 16px;">
      <div>
        <div style="font-size: 11px; color: #6EE7B7; font-weight: 700;">Zero-Cash-Flow Break-Even Occupancy</div>
        <div style="font-size: 10px; color: #A7F3D0; margin-top: 2px;">Property remains cash-flow positive even if market slumps by 25%.</div>
      </div>
      <div style="font-size: 18px; font-weight: 800; color: #34D399; font-family: monospace;">47.8%</div>
    </div>

    <p class="footer-note">Authored autonomously by Astra &amp; Pencil-DSCR · PencilSTR Institutional Terminal</p>
  </div>

  <script>
    function updateCalculations(rate) {
      document.getElementById('rateLabel').innerText = Number(rate).toFixed(2) + '%';
      var loan = 516000;
      var monthlyRate = (rate / 100) / 12;
      var debtPmt = (loan * (monthlyRate * Math.pow(1 + monthlyRate, 360))) / (Math.pow(1 + monthlyRate, 360) - 1);
      var annualDebt = debtPmt * 12;
      var annualNoi = 60090;
      var dscr = (annualNoi / annualDebt).toFixed(2);
      var display = document.getElementById('dscrDisplay');
      display.innerText = dscr + 'x';
      if (dscr >= 1.25) {
        display.style.color = '#34D399';
      } else if (dscr >= 1.10) {
        display.style.color = '#F59E0B';
      } else {
        display.style.color = '#EF4444';
      }
    }
  </script>
</body>
</html>`,
  },
  {
    id: 'art-3',
    title: 'Investment Committee Acquisition Brief — The Ridge Alpine',
    type: 'document',
    dealId: 'deal-gatlinburg-ridge',
    dealTitle: 'The Ridge Alpine',
    authorAgentId: 'agent-astra',
    authorAgentName: 'Astra (Principal Scribe)',
    authorAgentColor: '#8B5CF6',
    createdAt: 'Today, 9:45 AM',
    updatedAt: 'Today, 9:45 AM',
    description: 'Comprehensive acquisition thesis covering capital allocation, pro-forma cap rates, debt covenants, and downside mitigants.',
    tags: ['Document', 'Investment Brief', 'Committee Memo', 'Acquisition'],
    isPinned: false,
    content: `### Executive Summary & Acquisition Rationale

**Asset**: The Ridge Alpine (Gatlinburg, TN)  
**Contract Asking Price**: $645,000 ($286/sqft)  
**Target Underwrite Cap Rate**: 9.3% Unlevered / 14.8% Levered Cash-on-Cash  
**Investment Thesis**: Value-add luxury short-term rental situated 8 minutes from the Great Smoky Mountains National Park entrance. Property commands an exceptional $485 stabilized ADR driven by unobstructed Mount LeConte views, private deck hot tub, and two king suites.

---

### Key Financial Parameters

• **Total Capital Required**: $164,250 (20% down payment + $25,000 interior refresh & cedar barrel sauna addition + $10,250 closing reserves)  
• **Target Gross Annual Revenue**: $87,000 (Conservative baseline @ 64% occupancy)  
• **Net Operating Income (NOI)**: $60,090 / year  
• **Debt Service Coverage (DSCR)**: **1.38x Coverage** ($2,985/mo debt service @ 7.15% interest)  
• **Downside Break-Even Threshold**: Zero cash-flow occupancy hurdle is **47.8%** (14.5 nights/month), providing a 25.3% margin of safety against market downturns.

---

### Municipal & Covenant Audit (Cleared by Pencil-Zoning)

• **Jurisdiction**: Sevier County Unincorporated Overlay  
• **Permit Status**: Permitted short-term rental under existing land-use classification.  
• **Moratorium Risk**: **Zero Exposure**. The property is located outside city municipal caps.  
• **HOA Restrictions**: $0 monthly dues. No minimum rental stay declarations.

---

### Strategic Action Plan

1. Submit offer at **$635,000** with 14-day inspection and conventional DSCR financing contingency.  
2. Execute immediate contract with local turnkey STR operator @ 15% net fee.  
3. Install outdoor sauna and arcade gaming console to unlock peak $680/night autumn pricing.`,
  },
  {
    id: 'art-4',
    title: 'Sevier County STR Municipal Code & Deed Covenant Audit',
    type: 'audit_memo',
    dealId: 'deal-gatlinburg-smoky-top',
    dealTitle: 'Smoky Top Haven',
    authorAgentId: 'agent-zoning',
    authorAgentName: 'Pencil-Zoning',
    authorAgentColor: '#D97706',
    createdAt: 'Yesterday, 3:30 PM',
    updatedAt: 'Yesterday, 3:30 PM',
    description: 'Detailed compliance report on zoning restrictions, septic tank permits, fire code requirements, and local lodging tax rates.',
    tags: ['Audit', 'CC&R', 'Zoning', 'Legal', 'Permits'],
    isPinned: false,
    content: `### CC&R & Municipal Compliance Verification

**Property**: Smoky Top Haven ($720,000)  
**Auditor**: Pencil-Zoning (Municipal Legal Drafter)  
**Audit Date**: October 2026

---

### Statutory Checklist

• **Zoning Classification**: A-1 Agricultural/Rural Residential (Short-Term Rentals Permitted by Right)  
• **STR Permit Availability**: Verified. Application fee $250 annually with Sevier County Planning Commission.  
• **Septic System Sizing**: Permitted for 8 occupants (4 bedrooms @ 2 persons/room). State health department permit #TN-2018-8422 verified on file.  
• **Parking Capacity**: 4 dedicated off-street parking spots (Exceeds local 1 space per bedroom code).  
• **Fire Life Safety**: Interconnected photoelectric smoke detectors and fire extinguishers installed on every livable floor.

---

### Deed Restrictions & HOA Bylaws

> "No commercial nuisance shall be maintained upon the premises; provided, however, that customary short-term family and seasonal rentals shall not be deemed a violation of this covenant."

• **HOA Annual Assessment**: $600 / year (Covers private community road grading and snow removal).  
• **Quiet Hours**: 10:00 PM – 8:00 AM enforced by local county noise ordinance.

**Final Verdict**: **APPROVED FOR COMMERCIAL SHORT-TERM RENTAL OPERATION**.`,
  },
];
