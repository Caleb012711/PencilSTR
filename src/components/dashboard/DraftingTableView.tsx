import React, { useState } from 'react';
import { useDealStore, sanitizeDeal } from '../../store/useDealStore';
import { ProjectArtifact, ArtifactType, SpreadsheetRow } from '../../types/artifact';
import { formatCurrency } from '../../utils/calculator';
import { DEMO_DEALS } from '../../mock/demoDeals';
import { MemoMarkdownRenderer } from './MemoMarkdownRenderer';
import { DraftingTableIcon, StudioIcon } from './SidebarIcons';

export const DraftingTableView: React.FC = () => {
  const {
    deals,
    selectedDealId,
    setSelectedDealId,
    artifacts,
    activeArtifactId,
    setActiveArtifactId,
    createArtifact,
    updateArtifact,
    deleteArtifact,
    agents,
    updateAgentStatus,
    addMeshMessage,
    setCurrentView,
  } = useDealStore();

  const rawDeal = deals.find((d) => d.id === selectedDealId) || deals[0] || DEMO_DEALS[0];
  const currentDeal = sanitizeDeal(rawDeal);

  // Filters
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dealFilter, setDealFilter] = useState<string>('all');

  // Mobile View Mode: 'list' (browsing deliverables) vs 'canvas' (viewing active deliverable)
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'canvas'>('list');

  // Interactive View mode for HTML artifacts: 'preview' or 'code'
  const [htmlViewMode, setHtmlViewMode] = useState<'preview' | 'code'>('preview');

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Selected Scribe for drafting
  const [draftingAgentId, setDraftingAgentId] = useState<string>('auto');

  // Prompt to request new agent deliverable
  const [agentRequestText, setAgentRequestText] = useState('');
  const [isAgentDrafting, setIsAgentDrafting] = useState(false);

  // Modal to manually create/paste an artifact
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ArtifactType>('document');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('agent-astra');

  // Fullscreen HTML Modal
  const [isFullscreenHtml, setIsFullscreenHtml] = useState(false);

  // Editable Spreadsheet state for adding a new row
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowCategory, setNewRowCategory] = useState('Operating Expense');
  const [newRowItem, setNewRowItem] = useState('');
  const [newRowMonthly, setNewRowMonthly] = useState('');
  const [newRowNotes, setNewRowNotes] = useState('');

  const filteredArtifacts = artifacts.filter((art) => {
    const matchesType = selectedTypeFilter === 'all' || art.type === selectedTypeFilter;
    const matchesDeal = dealFilter === 'all' || art.dealId === dealFilter;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesDeal && matchesSearch;
  });

  const activeArtifact =
    artifacts.find((a) => a.id === activeArtifactId) || filteredArtifacts[0] || artifacts[0];

  const handleCopyContent = () => {
    if (!activeArtifact) return;
    navigator.clipboard.writeText(activeArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!activeArtifact || activeArtifact.type !== 'spreadsheet') return;
    const csvData = activeArtifact.content;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeArtifact.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHtml = () => {
    if (!activeArtifact || activeArtifact.type !== 'html') return;
    const blob = new Blob([activeArtifact.content], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeArtifact.title.replace(/\s+/g, '_')}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add row to active spreadsheet deliverable
  const handleAddSpreadsheetRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArtifact || !activeArtifact.spreadsheetData || !newRowItem.trim()) return;

    const monthlyNum = Number(newRowMonthly) || 0;
    const annualNum = monthlyNum * 12;

    const newRow: SpreadsheetRow = {
      id: `row-${Date.now()}`,
      category: newRowCategory,
      item: newRowItem.trim(),
      frequency: 'Monthly',
      monthly: monthlyNum,
      annual: annualNum,
      notes: newRowNotes.trim() || undefined,
    };

    const updatedRows = [...activeArtifact.spreadsheetData.rows, newRow];
    const updatedSpreadsheetData = {
      ...activeArtifact.spreadsheetData,
      rows: updatedRows,
    };

    // Reconstruct CSV content
    const csvLines = [
      activeArtifact.spreadsheetData.columns.join(','),
      ...updatedRows.map(
        (r) =>
          `"${r.category}","${r.item}","${r.frequency}",${r.monthly},${r.annual},"${r.notes || ''}"`
      ),
    ];

    updateArtifact(activeArtifact.id, {
      spreadsheetData: updatedSpreadsheetData,
      content: csvLines.join('\n'),
      updatedAt: 'Just now',
    });

    setNewRowItem('');
    setNewRowMonthly('');
    setNewRowNotes('');
    setIsAddingRow(false);
  };

  // Autonomous agent drafting action
  const handleAgentDraftRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentRequestText.trim() || isAgentDrafting) return;

    const request = agentRequestText.trim();
    setAgentRequestText('');
    setIsAgentDrafting(true);

    // Pick appropriate agent author based on selection or query keywords
    let authorAgent = agents[0];
    if (draftingAgentId !== 'auto') {
      authorAgent = agents.find((a) => a.id === draftingAgentId) || agents[0];
    } else {
      const isDebt = /debt|dscr|amortization|mortgage|interest|loan/i.test(request);
      const isLegal = /zoning|permit|ordinance|hoa|cc&r|bylaw/i.test(request);
      const isScout = /comp|radar|market|pacing|nightly|adr/i.test(request);
      const isTax = /tax|depreciation|cost-seg|1031|deduction/i.test(request);

      authorAgent = isDebt
        ? agents.find((a) => a.id === 'agent-dscr') || agents[1]
        : isLegal
        ? agents.find((a) => a.id === 'agent-zoning') || agents[2]
        : isScout
        ? agents.find((a) => a.id === 'agent-scout') || agents[3]
        : isTax
        ? agents.find((a) => a.id === 'agent-tax') || agents[4]
        : agents.find((a) => a.id === 'agent-astra') || agents[0];
    }

    updateAgentStatus(authorAgent.id, 'working', `Drafting: ${request.slice(0, 30)}...`);

    const isHtml = /html|widget|code|card|interactive|teaser|calculator/i.test(request);
    const isDebt = /debt|dscr|amortization|mortgage|interest|loan|spreadsheet|table|pro-forma/i.test(request);

    setTimeout(() => {
      let createdArtifact: ProjectArtifact;

      if (isHtml) {
        createdArtifact = createArtifact({
          title: `Interactive Pro-Forma Widget — ${currentDeal.title}`,
          type: 'html',
          dealId: currentDeal.id,
          dealTitle: currentDeal.title,
          authorAgentId: authorAgent.id,
          authorAgentName: authorAgent.name,
          authorAgentColor: authorAgent.avatarColor,
          description: `Custom interactive HTML investor widget authored by ${authorAgent.name} for: "${request}"`,
          tags: ['HTML', 'Interactive', 'Dynamic', 'Investor Widget'],
          content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0E0E0D; color: #F4F3EF; padding: 24px; }
    .card { background: #161615; border: 1px solid #282825; border-radius: 16px; padding: 24px; max-width: 540px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background: rgba(217, 119, 6, 0.15); color: #FBBF24; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; font-family: monospace; text-transform: uppercase; margin-bottom: 12px; }
    h2 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
    p.sub { color: #8C8880; font-size: 12px; margin-bottom: 16px; }
    .metric-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .box { background: #1F1F1D; border: 1px solid #2D2D2A; border-radius: 10px; padding: 12px; text-align: center; }
    .lbl { font-size: 10px; color: #8C8880; font-family: monospace; text-transform: uppercase; margin-bottom: 4px; }
    .val { font-size: 16px; font-weight: 800; color: #34D399; font-family: monospace; }
    .interactive-slider { background: #1C1C1A; border: 1px solid #2B2B28; border-radius: 12px; padding: 14px; margin-bottom: 16px; }
    .slider-title { font-size: 12px; font-weight: 600; color: #D4D1CA; margin-bottom: 8px; display: flex; justify-content: space-between; }
    input[type=range] { width: 100%; accent-color: #D97706; cursor: pointer; }
    .footer-note { font-size: 11px; color: #787570; text-align: center; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">PencilSTR Deliverable</span>
    <h2>${currentDeal.title} — Yield Modeler</h2>
    <p class="sub">${currentDeal.city}, ${currentDeal.state} · Authored by ${authorAgent.name}</p>
    
    <div class="metric-row">
      <div class="box">
        <div class="lbl">Asset Price</div>
        <div class="val" style="color: #F4F3EF;">$${currentDeal.price.toLocaleString()}</div>
      </div>
      <div class="box">
        <div class="lbl">Stabilized ADR</div>
        <div class="val">$${currentDeal.baseAdr}</div>
      </div>
      <div class="box">
        <div class="lbl">DSCR Coverage</div>
        <div class="val" id="dscr">1.38x</div>
      </div>
    </div>

    <div class="interactive-slider">
      <div class="slider-title">
        <span>Stressed Interest Rate</span>
        <span id="rateLabel" style="color: #D97706; font-family: monospace;">7.15%</span>
      </div>
      <input type="range" id="rateSlider" min="5.5" max="10.0" step="0.25" value="7.15">
    </div>

    <p class="footer-note">Live client-side deliverable published to The Drafting Table</p>
  </div>

  <script>
    const slider = document.getElementById('rateSlider');
    const label = document.getElementById('rateLabel');
    const dscr = document.getElementById('dscr');
    const basePrice = ${currentDeal.price};
    const loan = basePrice * 0.8;
    const noiAnnual = 52800;

    slider.addEventListener('input', (e) => {
      const rate = parseFloat(e.target.value);
      label.textContent = rate.toFixed(2) + '%';
      const monthlyRate = (rate / 100) / 12;
      const nPayments = 360;
      const monthlyPmt = loan * (monthlyRate * Math.pow(1 + monthlyRate, nPayments)) / (Math.pow(1 + monthlyRate, nPayments) - 1);
      const annualDebt = monthlyPmt * 12;
      const newDscr = (noiAnnual / annualDebt).toFixed(2);
      dscr.textContent = newDscr + 'x';
      dscr.style.color = newDscr >= 1.25 ? '#34D399' : '#EF4444';
    });
  </script>
</body>
</html>`,
        });
      } else if (isDebt) {
        const estimatedMonthlyRevenue = currentDeal.baseAdr * 16;
        const estimatedAnnualRevenue = estimatedMonthlyRevenue * 12;
        const estimatedMonthlyDebt = Math.round((currentDeal.price * 0.8 * 0.0715) / 12);

        createdArtifact = createArtifact({
          title: `10-Year Pro-Forma Stack — ${currentDeal.title}`,
          type: 'spreadsheet',
          dealId: currentDeal.id,
          dealTitle: currentDeal.title,
          authorAgentId: authorAgent.id,
          authorAgentName: authorAgent.name,
          authorAgentColor: authorAgent.avatarColor,
          description: `Comprehensive pro-forma spreadsheet authored by ${authorAgent.name} for: "${request}"`,
          tags: ['Spreadsheet', 'Debt', 'DSCR', 'Pro-Forma'],
          content: `Category,Item,Frequency,Monthly ($),Annual ($),Notes\nRevenue,Gross Nightly STR Revenue,Monthly,${estimatedMonthlyRevenue},${estimatedAnnualRevenue},Based on $${currentDeal.baseAdr} ADR\nRevenue,Guest Cleaning Reimbursements,Monthly,850,10200,Direct pass-through\nOperating Expense,Turnkey Management (15%),Monthly,${Math.round(estimatedMonthlyRevenue * 0.15)},${Math.round(estimatedAnnualRevenue * 0.15)},Full-service STR management\nOperating Expense,County Property Taxes,Monthly,340,4080,Sevier County rate assessment\nOperating Expense,Commercial STR Hazard Insurance,Monthly,290,3480,$2M commercial policy\nDebt Service,DSCR Debt Service (7.15%),Monthly,${estimatedMonthlyDebt},${estimatedMonthlyDebt * 12},30-yr fixed loan @ 80% LTV\nNet Cash Flow,Pre-Tax Free Cash Flow,Monthly,${estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedMonthlyDebt},${(estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedMonthlyDebt) * 12},14.2% Cash-on-Cash Return`,
          spreadsheetData: {
            columns: ['Category', 'Item', 'Frequency', 'Monthly ($)', 'Annual ($)', 'Notes'],
            rows: [
              { id: 'r1', category: 'Revenue', item: 'Gross Nightly STR Revenue', frequency: 'Monthly', monthly: estimatedMonthlyRevenue, annual: estimatedAnnualRevenue, notes: `Based on $${currentDeal.baseAdr} ADR` },
              { id: 'r2', category: 'Revenue', item: 'Guest Cleaning Reimbursements', frequency: 'Monthly', monthly: 850, annual: 10200, notes: 'Direct pass-through' },
              { id: 'r3', category: 'Operating Expense', item: 'Turnkey Management (15%)', frequency: 'Monthly', monthly: Math.round(estimatedMonthlyRevenue * 0.15), annual: Math.round(estimatedAnnualRevenue * 0.15), notes: 'Full-service STR management' },
              { id: 'r4', category: 'Operating Expense', item: 'County Real Estate Taxes', frequency: 'Monthly', monthly: 340, annual: 4080, notes: 'County assessed rate' },
              { id: 'r5', category: 'Operating Expense', item: 'Commercial STR Insurance', frequency: 'Monthly', monthly: 290, annual: 3480, notes: '$2M commercial policy' },
              { id: 'r6', category: 'Debt Service', item: 'DSCR Principal & Interest', frequency: 'Monthly', monthly: estimatedMonthlyDebt, annual: estimatedMonthlyDebt * 12, notes: '30-yr fixed loan @ 80% LTV' },
              { id: 'r7', category: 'Net Cash Flow', item: 'Pre-Tax Free Cash Flow', frequency: 'Monthly', monthly: Math.max(1200, estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedMonthlyDebt), annual: Math.max(14400, (estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedMonthlyDebt) * 12), notes: '14.2% Cash-on-Cash Return' },
            ],
            summaryMetric: { label: 'Net Operating Income (NOI)', value: `$${Math.round(estimatedAnnualRevenue * 0.62).toLocaleString()} / yr (1.38x DSCR)` },
          },
        });
      } else {
        createdArtifact = createArtifact({
          title: `Acquisition Memorandum — ${currentDeal.title}`,
          type: 'document',
          dealId: currentDeal.id,
          dealTitle: currentDeal.title,
          authorAgentId: authorAgent.id,
          authorAgentName: authorAgent.name,
          authorAgentColor: authorAgent.avatarColor,
          description: `Executive memorandum drafted for operator inquiry: "${request}"`,
          tags: ['Document', 'Memorandum', 'Acquisition'],
          content: `### Acquisition Memorandum: ${currentDeal.title}\n\n**Requested Task**: "${request}"\n**Authored By**: ${authorAgent.name} (${authorAgent.role})\n**Date**: ${new Date().toLocaleDateString()}\n\n• **Purchase Valuation**: ${formatCurrency(currentDeal.price)}\n• **Stabilized ADR**: $${currentDeal.baseAdr}/night at ${currentDeal.baseOccupancy}% occupancy\n• **Break-Even Hurdle**: ${currentDeal.breakEvenOccupancy}% occupancy threshold\n• **Municipal Permit Status**: ${currentDeal.audit?.str_status || 'PERMITTED'}\n\n#### Strategic Underwriting Verdict\nThe asset clears our institutional hurdle with an estimated **1.38x DSCR** and **14.2% Cash-on-Cash equity return**. Grandfathered transferable permit verified. Deliverable published and archived in The Drafting Table.`,
        });
      }

      // Notify the scribe agent chat
      addMeshMessage({
        id: `mesh-artifact-${Date.now()}`,
        senderId: authorAgent.id,
        senderName: authorAgent.name,
        senderRole: authorAgent.role,
        senderColor: authorAgent.avatarColor,
        targetAgentId: 'all',
        targetAgentName: 'The Drafting Table',
        type: 'finding',
        content: `**New Deliverable Published to Drafting Table**: "${createdArtifact.title}" (${createdArtifact.type.toUpperCase()}). Available for download and investor presentation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        artifactCreatedId: createdArtifact.id,
        artifactCreatedTitle: createdArtifact.title,
      });

      updateAgentStatus(authorAgent.id, 'idle');
      setIsAgentDrafting(false);
      setActiveArtifactId(createdArtifact.id);
      setMobileViewMode('canvas');
    }, 700);
  };

  const handleManualCreateArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const author = agents.find((a) => a.id === newAuthor) || agents[0];

    let spreadsheetData = undefined;
    if (newType === 'spreadsheet') {
      const lines = newContent.split('\n').filter(Boolean);
      if (lines.length > 1) {
        const cols = lines[0].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        const rows: SpreadsheetRow[] = lines.slice(1).map((line, idx) => {
          const cells = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          return {
            id: `row-${idx}`,
            category: cells[0] || 'Operating Expense',
            item: cells[1] || 'Line Item',
            frequency: cells[2] || 'Monthly',
            monthly: Number(cells[3]) || 0,
            annual: Number(cells[4]) || 0,
            notes: cells[5] || '',
          };
        });
        spreadsheetData = {
          columns: cols,
          rows,
          summaryMetric: { label: 'Total Annual Stack', value: `$${rows.reduce((sum, r) => sum + r.annual, 0).toLocaleString()} / yr` },
        };
      }
    }

    const created = createArtifact({
      title: newTitle.trim(),
      type: newType,
      dealId: currentDeal.id,
      dealTitle: currentDeal.title,
      authorAgentId: author.id,
      authorAgentName: author.name,
      authorAgentColor: author.avatarColor,
      description: newDescription.trim() || 'Project deliverable published to The Drafting Table.',
      tags: [newType.toUpperCase(), 'Custom Project'],
      content: newContent.trim() || 'Empty deliverable.',
      spreadsheetData,
    });

    setNewTitle('');
    setNewDescription('');
    setNewContent('');
    setIsNewModalOpen(false);
    setActiveArtifactId(created.id);
    setMobileViewMode('canvas');
  };

  const getTypeBadge = (type: ArtifactType) => {
    switch (type) {
      case 'spreadsheet':
        return { label: 'SPREADSHEET', color: 'bg-[#059669]/15 text-[#059669] dark:text-[#34D399]' };
      case 'html':
        return { label: 'HTML APPLET', color: 'bg-[#8B5CF6]/15 text-[#8B5CF6] dark:text-[#C4B5FD]' };
      case 'audit_memo':
        return { label: 'LEGAL AUDIT', color: 'bg-[#D97706]/15 text-[#D97706] dark:text-[#FBBF24]' };
      case 'document':
      default:
        return { label: 'INVESTMENT MEMO', color: 'bg-[#2563EB]/15 text-[#2563EB] dark:text-[#60A5FA]' };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-hidden transition-colors duration-200">
      {/* 1. Header Toolbar */}
      <header className="bg-white dark:bg-[#141413] border-b border-[#E5E4DF] dark:border-[#272624] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D97706]/10 dark:bg-[#D97706]/20 border border-[#D97706]/30 flex items-center justify-center text-[#D97706] shrink-0">
            <DraftingTableIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97706]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-sm sm:text-lg text-[#111110] dark:text-[#F4F3EF] truncate">
                The Drafting Table
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D97706]/15 text-[#92400E] dark:text-[#FBBF24] font-semibold hidden md:inline">
                Agent Deliverables Vault
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#787570] font-sans truncate hidden sm:block">
              Spreadsheets, interactive code, documents &amp; audits authored by autonomous Pencil scribes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile View Mode Switcher Toggle */}
          <div className="md:hidden flex items-center bg-[#FAF9F5] dark:bg-[#1E1E1C] p-1 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] text-xs font-mono font-semibold">
            <button
              onClick={() => setMobileViewMode('list')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mobileViewMode === 'list'
                  ? 'bg-white dark:bg-[#2A2926] text-[#D97706] shadow-2xs'
                  : 'text-[#787570]'
              }`}
            >
              List ({artifacts.length})
            </button>
            <button
              onClick={() => setMobileViewMode('canvas')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mobileViewMode === 'canvas'
                  ? 'bg-white dark:bg-[#2A2926] text-[#D97706] shadow-2xs'
                  : 'text-[#787570]'
              }`}
            >
              Canvas
            </button>
          </div>

          {/* Deal Cohort Filter */}
          <select
            value={dealFilter}
            onChange={(e) => setDealFilter(e.target.value)}
            className="bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] text-xs font-sans text-[#111110] dark:text-[#F4F3EF] px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D97706] cursor-pointer shadow-2xs max-w-[120px] sm:max-w-[190px] truncate font-medium hidden sm:block"
            title="Filter deliverables by property"
          >
            <option value="all">All Deals &amp; Cohorts</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#111110] dark:bg-[#F4F3EF] hover:bg-black dark:hover:bg-white text-white dark:text-[#111110] text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            title="Create or paste a new deliverable"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">New Deliverable</span>
            <span className="sm:hidden text-xs">New</span>
          </button>
        </div>
      </header>

      {/* 2. Responsive Dual-Pane Drafting Desk */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative">
        {/* Left Side: Deliverables Index (Visible on desktop OR when mobileViewMode is 'list') */}
        <aside
          className={`w-full md:w-80 lg:w-88 bg-white dark:bg-[#141413] border-r border-[#E5E4DF] dark:border-[#262624] flex flex-col shrink-0 overflow-hidden ${
            mobileViewMode === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Filter Pills */}
          <div className="p-2.5 sm:p-3 border-b border-[#E5E4DF] dark:border-[#262624] flex items-center gap-1 overflow-x-auto bg-[#FAF9F5] dark:bg-[#181816] no-scrollbar">
            {['all', 'spreadsheet', 'document', 'html', 'audit_memo'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTypeFilter(tab)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-sans font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedTypeFilter === tab
                    ? 'bg-white dark:bg-[#20201D] text-[#111110] dark:text-[#F4F3EF] shadow-2xs border border-[#E5E4DF] dark:border-[#2E2E2A]'
                    : 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                }`}
              >
                {tab === 'all' && `All (${artifacts.length})`}
                {tab === 'spreadsheet' && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="6" y1="2" x2="6" y2="14" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    <span>Sheets</span>
                  </span>
                )}
                {tab === 'document' && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 2H10L13 5V14H4V2Z" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M10 2V5H13" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    <span>Memos</span>
                  </span>
                )}
                {tab === 'html' && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#2563EB]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L2.5 8L5 10M11 6L13.5 8L11 10M9 4L7 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <span>Code</span>
                  </span>
                )}
                {tab === 'audit_memo' && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 3H12V13H4V3Z" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M6 6H10M6 9H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <span>Audits</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b border-[#E5E4DF] dark:border-[#262624]">
            <input
              type="text"
              placeholder="Search deliverables, spreadsheets, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-1.5 text-xs text-[#111110] dark:text-[#F4F3EF] placeholder-[#787570] focus:outline-none focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          {/* Artifact Cards List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredArtifacts.length === 0 ? (
              <div className="py-8 text-center text-xs font-sans text-[#787570]">
                No deliverables found matching filters.
              </div>
            ) : (
              filteredArtifacts.map((art) => {
                const isSelected = activeArtifact?.id === art.id;
                const badge = getTypeBadge(art.type);

                return (
                  <div
                    key={art.id}
                    onClick={() => {
                      setActiveArtifactId(art.id);
                      setMobileViewMode('canvas');
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-[#F9F8F5] dark:bg-[#1E1E1C] border-[#D97706] shadow-sm'
                        : 'bg-white dark:bg-[#181816] border-[#E5E4DF] dark:border-[#282825] hover:border-[#D97706]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono text-[#787570]">
                        {art.createdAt}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-xs text-[#111110] dark:text-[#F4F3EF] line-clamp-1 group-hover:text-[#D97706] transition-colors">
                      {art.title}
                    </h4>

                    <p className="text-[11px] text-[#787570] dark:text-[#A3A19B] line-clamp-2 mt-1 leading-relaxed">
                      {art.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#E5E4DF]/60 dark:border-[#272624] flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-[#787570]">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: art.authorAgentColor }}
                        ></span>
                        <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">
                          {art.authorAgentName}
                        </span>
                      </div>
                      {art.dealTitle && (
                        <span className="text-[#D97706] truncate max-w-[120px]">
                          {art.dealTitle}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: Deep Artifact Canvas Viewer (Visible on desktop OR when mobileViewMode is 'canvas') */}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-[#FAF9F5] dark:bg-[#0E0E0D] overflow-hidden ${
            mobileViewMode === 'canvas' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeArtifact ? (
            <>
              {/* Deliverable Action Header Bar */}
              <div className="bg-white dark:bg-[#141413] px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between gap-2 shrink-0">
                <div className="min-w-0 flex-1">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileViewMode('list')}
                    className="md:hidden inline-flex items-center gap-1 text-xs font-mono text-[#D97706] font-bold mb-1 cursor-pointer"
                  >
                    <span>← All Deliverables</span>
                  </button>

                  <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        getTypeBadge(activeArtifact.type).color
                      }`}
                    >
                      {getTypeBadge(activeArtifact.type).label}
                    </span>
                    <span className="text-[11px] sm:text-xs text-[#787570] font-mono truncate">
                      By <strong className="text-[#111110] dark:text-[#F4F3EF]">{activeArtifact.authorAgentName}</strong>
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-lg text-[#111110] dark:text-[#F4F3EF] truncate">
                    {activeArtifact.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* For HTML deliverables: Switch between Sandbox Preview and Source Code */}
                  {activeArtifact.type === 'html' && (
                    <div className="bg-[#FAF9F5] dark:bg-[#1E1E1C] p-1 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] flex items-center gap-1 text-xs font-mono">
                      <button
                        onClick={() => setHtmlViewMode('preview')}
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all cursor-pointer font-bold text-xs ${
                          htmlViewMode === 'preview'
                            ? 'bg-white dark:bg-[#2A2926] text-[#8B5CF6] shadow-2xs'
                            : 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                        }`}
                      >
                        Sandbox
                      </button>
                      <button
                        onClick={() => setHtmlViewMode('code')}
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all cursor-pointer font-bold text-xs ${
                          htmlViewMode === 'code'
                            ? 'bg-white dark:bg-[#2A2926] text-[#8B5CF6] shadow-2xs'
                            : 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                        }`}
                      >
                        Code
                      </button>
                    </div>
                  )}

                  {/* For HTML deliverables: Fullscreen Preview Toggle & HTML file download */}
                  {activeArtifact.type === 'html' && (
                    <>
                      <button
                        onClick={() => setIsFullscreenHtml(true)}
                        className="p-1.5 sm:p-2 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] bg-[#FAF9F5] dark:bg-[#1E1E1C] transition-colors cursor-pointer"
                        title="Expand Sandbox to Fullscreen"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 6V2H6M14 6V2H10M2 10V14H6M14 10V14H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        onClick={handleDownloadHtml}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-sans font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Download raw .html file"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 2.5V10.5M8 10.5L5.5 8M8 10.5L10.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2.5 13.5H13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span>Export</span>
                      </button>
                    </>
                  )}

                  {/* For Spreadsheets: Download CSV Button & Add Row toggle */}
                  {activeArtifact.type === 'spreadsheet' && (
                    <>
                      <button
                        onClick={() => setIsAddingRow(!isAddingRow)}
                        className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-sans font-semibold transition-all cursor-pointer shadow-2xs ${
                          isAddingRow
                            ? 'bg-[#059669] text-white border-[#059669]'
                            : 'border-[#E5E4DF] dark:border-[#2A2926] bg-[#FAF9F5] dark:bg-[#1E1E1C] text-[#111110] dark:text-[#F4F3EF] hover:bg-white dark:hover:bg-[#252422]'
                        }`}
                        title="Add custom line item row to this spreadsheet"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span>{isAddingRow ? 'Close' : 'Row'}</span>
                      </button>

                      <button
                        onClick={handleDownloadCsv}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-sans font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Download clean CSV spreadsheet"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 2.5V10.5M8 10.5L5.5 8M8 10.5L10.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2.5 13.5H13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span>CSV</span>
                      </button>
                    </>
                  )}

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyContent}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] bg-[#FAF9F5] dark:bg-[#1E1E1C] text-xs font-sans text-[#111110] dark:text-[#F4F3EF] hover:bg-white dark:hover:bg-[#252422] transition-colors cursor-pointer shadow-2xs"
                    title="Copy full deliverable text / code"
                  >
                    {copied ? (
                      <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M3 11V3.5C3 3.22386 3.22386 3 3.5 3H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {/* Delete deliverable */}
                  <button
                    onClick={() => deleteArtifact(activeArtifact.id)}
                    className="p-1.5 sm:p-2 rounded-xl text-[#787570] hover:text-[#DC2626] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] transition-colors cursor-pointer"
                    title="Delete deliverable"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 4H13M5.5 4V2.5C5.5 2.22386 5.72386 2 6 2H10C10.2761 2 10.5 2.22386 10.5 2.5V4M4.5 4L5 13.5C5 13.7761 5.22386 14 5.5 14H10.5C10.7761 14 11 13.7761 11 13.5L11.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto">
                {/* 1. SPREADSHEET VIEWER */}
                {activeArtifact.type === 'spreadsheet' && activeArtifact.spreadsheetData && (
                  <div className="space-y-4">
                    {/* Summary Metric KPI */}
                    {activeArtifact.spreadsheetData.summaryMetric && (
                      <div className="p-3 sm:p-4 rounded-2xl bg-[#E8F5EE] dark:bg-[#064E3B]/25 border border-[#059669]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 shadow-2xs">
                        <div>
                          <span className="text-xs font-semibold text-[#0B3B24] dark:text-[#34D399] block">
                            {activeArtifact.spreadsheetData.summaryMetric.label}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-mono text-[#059669] dark:text-[#6EE7B7]">
                            Calibrated against active debt covenants &amp; Sevier County opex benchmarks
                          </span>
                        </div>
                        <span className="font-mono text-base sm:text-lg font-bold text-[#0B3B24] dark:text-[#34D399]">
                          {activeArtifact.spreadsheetData.summaryMetric.value}
                        </span>
                      </div>
                    )}

                    {/* Inline Add Row Form */}
                    {isAddingRow && (
                      <form
                        onSubmit={handleAddSpreadsheetRow}
                        className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#1A1A18] border border-[#059669]/50 shadow-sm animate-in fade-in duration-150 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DF] dark:border-[#272624]">
                          <span className="font-mono text-xs font-bold text-[#059669] uppercase">
                            Add New Spreadsheet Row
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingRow(false)}
                            className="inline-flex items-center gap-1 text-xs text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>Cancel</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-[#787570] uppercase mb-1">
                              Category
                            </label>
                            <select
                              value={newRowCategory}
                              onChange={(e) => setNewRowCategory(e.target.value)}
                              className="w-full bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                            >
                              <option value="Revenue">Revenue</option>
                              <option value="Operating Expense">Operating Expense</option>
                              <option value="Debt Service">Debt Service</option>
                              <option value="Capex Reserve">Capex Reserve</option>
                              <option value="Net Cash Flow">Net Cash Flow</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-[#787570] uppercase mb-1">
                              Item Description
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Hot Tub Maintenance"
                              value={newRowItem}
                              onChange={(e) => setNewRowItem(e.target.value)}
                              className="w-full bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-[#787570] uppercase mb-1">
                              Monthly Amount ($)
                            </label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 250"
                              value={newRowMonthly}
                              onChange={(e) => setNewRowMonthly(e.target.value)}
                              className="w-full bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-[#787570] uppercase mb-1">
                              Notes / Assumption
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Weekly chemical check"
                              value={newRowNotes}
                              onChange={(e) => setNewRowNotes(e.target.value)}
                              className="w-full bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-sans font-bold rounded-xl shadow-xs cursor-pointer active:scale-95"
                          >
                            Save Row to Sheet
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Interactive Horizontally-Scrollable Table Grid */}
                    <div className="rounded-2xl border border-[#E5E4DF] dark:border-[#282825] bg-white dark:bg-[#161615] overflow-x-auto shadow-xs" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <table className="w-full text-left text-xs font-sans min-w-[540px]">
                        <thead className="bg-[#FAF9F5] dark:bg-[#1E1E1C] border-b border-[#E5E4DF] dark:border-[#282825] text-[#787570] font-mono text-[11px] uppercase">
                          <tr>
                            {activeArtifact.spreadsheetData.columns.map((col) => (
                              <th key={col} className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E4DF]/60 dark:divide-[#262624]">
                          {activeArtifact.spreadsheetData.rows.map((row) => (
                            <tr key={row.id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#1C1C1A] transition-colors">
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-mono font-bold text-[#D97706] whitespace-nowrap">
                                {row.category}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-[#111110] dark:text-[#F4F3EF]">
                                {row.item}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[#787570] font-mono text-[11px] whitespace-nowrap">
                                {row.frequency}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-mono font-semibold text-[#111110] dark:text-[#F4F3EF] whitespace-nowrap tabular-nums">
                                ${row.monthly.toLocaleString()}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-mono font-bold text-[#059669] dark:text-[#34D399] whitespace-nowrap tabular-nums">
                                ${row.annual.toLocaleString()}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] text-[#787570] dark:text-[#A3A19B] max-w-xs truncate">
                                {row.notes || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. HTML / INTERACTIVE CODE VIEWER */}
                {activeArtifact.type === 'html' && (
                  <div className="h-full flex flex-col">
                    {htmlViewMode === 'preview' ? (
                      <div className="rounded-2xl border border-[#E5E4DF] dark:border-[#282825] overflow-hidden bg-[#0E0E0D] shadow-md min-h-[440px] sm:min-h-[520px] flex flex-col">
                        <div className="bg-[#1C1C1A] px-3 sm:px-4 py-2 border-b border-[#2D2D2A] flex items-center justify-between text-[11px] font-mono text-[#787570]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                            <span>Live Sandboxed HTML Applet</span>
                          </span>
                          <span className="text-[#8B5CF6]">Client Execution</span>
                        </div>
                        <iframe
                          srcDoc={activeArtifact.content}
                          title={activeArtifact.title}
                          className="w-full flex-1 min-h-[400px] sm:min-h-[480px] border-none bg-[#0E0E0D]"
                          sandbox="allow-scripts allow-forms allow-same-origin"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[#E5E4DF] dark:border-[#282825] bg-[#141413] text-[#E8F5EE] p-4 sm:p-5 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                        <pre>{activeArtifact.content}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. DOCUMENT & AUDIT MEMO VIEWER */}
                {(activeArtifact.type === 'document' || activeArtifact.type === 'audit_memo') && (
                  <div className="bg-white dark:bg-[#161615] rounded-3xl border border-[#E5E4DF] dark:border-[#282825] p-4 sm:p-6 md:p-8 shadow-xs">
                    <MemoMarkdownRenderer content={activeArtifact.content} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs font-sans text-[#787570] p-6 text-center">
              Select or generate a deliverable from the Drafting Desk.
            </div>
          )}

          {/* 3. Bottom Agent Request Bar: Ask Scribes to Author Deliverables */}
          <div className="p-3 sm:p-4 md:p-5 bg-white/90 dark:bg-[#141413]/90 border-t border-[#E5E4DF] dark:border-[#272624] shrink-0 backdrop-blur-md">
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={handleAgentDraftRequest}
                className="bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] rounded-2xl shadow-sm transition-all focus-within:border-[#D97706]/60 dark:focus-within:border-[#D97706]/60 focus-within:ring-2 focus-within:ring-[#D97706]/10 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center px-3 sm:px-4 py-2 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center shrink-0">
                      <DraftingTableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97706]" />
                    </div>

                    {/* Scribe Selector */}
                    <select
                      value={draftingAgentId}
                      onChange={(e) => setDraftingAgentId(e.target.value)}
                      className="bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2A2926] text-xs font-sans text-[#111110] dark:text-[#F4F3EF] px-2 py-1 rounded-xl focus:outline-none cursor-pointer max-w-[130px] truncate font-medium shrink-0"
                      title="Choose authoring scribe"
                    >
                      <option value="auto">Auto-Route</option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={agentRequestText}
                      onChange={(e) => setAgentRequestText(e.target.value)}
                      placeholder={`Draft deliverable (e.g. "Create 10-yr DSCR cash flow spreadsheet")...`}
                      disabled={isAgentDrafting}
                      className="flex-1 bg-transparent text-xs sm:text-sm font-sans text-[#111110] dark:text-[#F4F3EF] placeholder-[#787570] focus:outline-none min-w-0 py-1"
                    />

                    <button
                      type="submit"
                      disabled={!agentRequestText.trim() || isAgentDrafting}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        agentRequestText.trim() && !isAgentDrafting
                          ? 'bg-[#D97706] hover:bg-[#B45309] text-white shadow-xs active:scale-95'
                          : 'bg-[#F1EFEB] dark:bg-[#252422] text-[#787570] cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isAgentDrafting ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      ) : (
                        <span>Draft</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* 4. Fullscreen HTML Sandbox Modal */}
      {isFullscreenHtml && activeArtifact && activeArtifact.type === 'html' && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0E0E0D] animate-in fade-in duration-150">
          <div className="bg-[#161615] px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#282825] flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shrink-0"></span>
              <span className="font-serif font-bold text-xs sm:text-sm text-[#F4F3EF] truncate">
                {activeArtifact.title} · Fullscreen Applet View
              </span>
            </div>
            <button
              onClick={() => setIsFullscreenHtml(false)}
              className="px-3 py-1 bg-[#252522] hover:bg-[#333330] text-xs font-sans font-bold text-white rounded-xl cursor-pointer shrink-0 ml-2"
            >
              Exit Fullscreen
            </button>
          </div>
          <iframe
            srcDoc={activeArtifact.content}
            title={activeArtifact.title}
            className="flex-1 w-full h-full border-none bg-[#0E0E0D]"
            sandbox="allow-scripts allow-forms allow-same-origin"
          />
        </div>
      )}

      {/* 5. Manual Create Deliverable Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161615] border border-[#E5E4DF] dark:border-[#282825] rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <DraftingTableIcon className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#111110] dark:text-[#F4F3EF]">
                  New Project Deliverable
                </h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleManualCreateArtifact} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                  Deliverable Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Year Pro-Forma Cash Flow Statement"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                    Artifact Format
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D97706] cursor-pointer font-medium"
                  >
                    <option value="document">Investment Memo (Markdown)</option>
                    <option value="spreadsheet">Spreadsheet (CSV / Table)</option>
                    <option value="html">Interactive HTML / Code</option>
                    <option value="audit_memo">Municipal CC&amp;R Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                    Authoring Scribe
                  </label>
                  <select
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D97706] cursor-pointer font-medium"
                  >
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                  Summary Description
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of deliverable contents..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                  Deliverable Content ({newType === 'spreadsheet' ? 'CSV format: Category,Item,Frequency,Monthly,Annual,Notes' : newType === 'html' ? 'HTML / CSS / JS code' : 'Markdown text'})
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder={
                    newType === 'spreadsheet'
                      ? 'Category,Item,Frequency,Monthly,Annual,Notes\nRevenue,Nightly Rental,Monthly,6500,78000,Base ADR pace\nExpense,Management,Monthly,975,11700,15% fee'
                      : newType === 'html'
                      ? '<div><h1>Investor Teaser</h1><p>Property metrics...</p></div>'
                      : '### Investment Memorandum\n\n• Key underwrite points...'
                  }
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E4DF] dark:border-[#262624]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#787570] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#D97706] hover:bg-[#B45309] text-white shadow-xs cursor-pointer active:scale-95"
                >
                  Publish Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
