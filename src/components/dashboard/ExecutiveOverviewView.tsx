import React, { useState, useMemo } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { Deal } from '../../types/deal';
import { calculateUnderwriteMetrics, formatCurrency, formatPercent } from '../../utils/underwriterMath';
import { RadarIcon, AuditIcon, StudioIcon, PinDealIcon } from './SidebarIcons';
import { MuseCompCard } from '../common/MuseCompCard';

interface ExecutiveOverviewViewProps {
  onOpenDealDrawer: (deal: Deal) => void;
  onOpenUnderwriter: (deal: Deal) => void;
  onOpenAudit: (deal: Deal) => void;
}

export const ExecutiveOverviewView: React.FC<ExecutiveOverviewViewProps> = ({
  onOpenDealDrawer,
  onOpenUnderwriter,
  onOpenAudit,
}) => {
  const {
    deals,
    setCurrentView,
    setIngestModalOpen,
    setModelSelectorOpen,
    selectedModel,
    resetToDemoDeals,
  } = useDealStore();

  // Dynamic Horizon & Market Filter Controls
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>('all');
  const [selectedStrategyFilter, setSelectedStrategyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'coc' | 'dscr' | 'price_desc' | 'price_asc'>('default');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Scratchpad interactive state for quick deal napkin math
  const [scratchPrice, setScratchPrice] = useState(650000);
  const [scratchDownPct, setScratchDownPct] = useState(20);
  const [scratchRate, setScratchRate] = useState(7.15);
  const [scratchAdr, setScratchAdr] = useState(495);
  const [scratchOcc, setScratchOcc] = useState(65);
  const [activeScenario, setActiveScenario] = useState<'baseline' | 'stress_adr' | 'stress_occ' | 'stress_rate'>('baseline');

  // Scenario presets handler
  const handleApplyScenario = (scenario: 'baseline' | 'stress_adr' | 'stress_occ' | 'stress_rate') => {
    setActiveScenario(scenario);
    if (scenario === 'baseline') {
      setScratchPrice(650000);
      setScratchDownPct(20);
      setScratchRate(7.15);
      setScratchAdr(495);
      setScratchOcc(65);
    } else if (scenario === 'stress_adr') {
      setScratchAdr(445); // -10% ADR
    } else if (scenario === 'stress_occ') {
      setScratchOcc(52); // -13% Occupancy
    } else if (scenario === 'stress_rate') {
      setScratchRate(8.4); // +125bps interest rate
    }
  };

  // Scratch calculations
  const scratchDownDollars = scratchPrice * (scratchDownPct / 100);
  const scratchLoan = scratchPrice - scratchDownDollars;
  const scratchMonthlyRate = scratchRate / 100 / 12;
  const scratchPayments = 360;
  const scratchMonthlyPAndI =
    scratchLoan > 0 && scratchMonthlyRate > 0
      ? (scratchLoan * scratchMonthlyRate * Math.pow(1 + scratchMonthlyRate, scratchPayments)) /
        (Math.pow(1 + scratchMonthlyRate, scratchPayments) - 1)
      : 0;
  const scratchGrossRev = 365 * (scratchOcc / 100) * scratchAdr;
  const scratchMonthlyGross = scratchGrossRev / 12;
  const scratchOpex = scratchGrossRev * 0.35 + 4800 + 2800; // 35% fees + taxes + ins
  const scratchMonthlyNoi = (scratchGrossRev - scratchOpex) / 12;
  const scratchMonthlyNet = scratchMonthlyNoi - scratchMonthlyPAndI;
  const scratchDscr = scratchMonthlyPAndI > 0 ? (scratchMonthlyGross * 0.65) / scratchMonthlyPAndI : 0;
  const scratchCoC =
    scratchDownDollars + 35000 > 0 ? ((scratchMonthlyNet * 12) / (scratchDownDollars + 35000)) * 100 : 0;

  // Filtered & Sorted Deals
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (selectedMarketFilter !== 'all') {
      result = result.filter(
        (d) =>
          d.marketName.toLowerCase().includes(selectedMarketFilter.toLowerCase()) ||
          d.state.toLowerCase() === selectedMarketFilter.toLowerCase() ||
          d.city.toLowerCase().includes(selectedMarketFilter.toLowerCase())
      );
    }

    if (selectedStrategyFilter !== 'all') {
      result = result.filter((d) => d.financing?.strategy === selectedStrategyFilter);
    }

    if (sortBy === 'coc') {
      result.sort((a, b) => calculateUnderwriteMetrics(b).cashOnCashReturn - calculateUnderwriteMetrics(a).cashOnCashReturn);
    } else if (sortBy === 'dscr') {
      result.sort((a, b) => calculateUnderwriteMetrics(b).dscrRatio - calculateUnderwriteMetrics(a).dscrRatio);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return result;
  }, [deals, selectedMarketFilter, selectedStrategyFilter, sortBy]);

  // Aggregate metrics derived from active filtered view
  const totalAum = filteredDeals.reduce((sum, d) => sum + (d.price || 0), 0);
  const allMetrics = filteredDeals.map((d) => calculateUnderwriteMetrics(d));
  const avgCoc = filteredDeals.length > 0 ? allMetrics.reduce((s, m) => s + m.cashOnCashReturn, 0) / filteredDeals.length : 0;
  const avgDscr = filteredDeals.length > 0 ? allMetrics.reduce((s, m) => s + m.dscrRatio, 0) / filteredDeals.length : 0;
  const totalMonthlyNet = allMetrics.reduce((s, m) => s + m.netCashFlowMonthly, 0);

  const stagesList = [
    { id: 'inbox', label: 'Inbox', color: 'bg-blue-500' },
    { id: 'underwriting', label: 'Underwriting', color: 'bg-amber-500' },
    { id: 'due_diligence', label: 'Due Diligence', color: 'bg-purple-500' },
    { id: 'offer_sent', label: 'Offer Sent', color: 'bg-emerald-500' },
    { id: 'under_contract', label: 'Under Contract', color: 'bg-indigo-500' },
    { id: 'acquired', label: 'Acquired', color: 'bg-green-600' },
  ];

  const submarketBenchmarks = [
    {
      region: 'Smoky Mountains, TN',
      type: 'Cabins & Chalets',
      benchmarkAdr: '$485',
      avgOcc: '66%',
      capRate: '9.4%',
      status: 'UNRESTRICTED',
      statusClass:
        'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    {
      region: 'Scottsdale, AZ',
      type: 'Luxury Pool Villas',
      benchmarkAdr: '$590',
      avgOcc: '64%',
      capRate: '8.7%',
      status: 'STRICT DECIBEL / CONDITIONAL',
      statusClass:
        'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    },
    {
      region: 'Gulf Shores, AL',
      type: 'Gulf Coastline STRs',
      benchmarkAdr: '$620',
      avgOcc: '68%',
      capRate: '9.8%',
      status: '3-NIGHT PEAK MINIMUM',
      statusClass:
        'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
  ];

  const handleCopySummary = () => {
    const summary = `PENCILSTR PORTFOLIO EXECUTIVE SUMMARY
Total Filtered Targets: ${filteredDeals.length} deals
Total Pipeline AUM: ${formatCurrency(totalAum)}
Blended Cash-on-Cash: ${formatPercent(avgCoc)}
Average DSCR Ratio: ${avgDscr.toFixed(2)}x (Prime Hurdle: 1.25x)
Net Monthly Free Cash: ${formatCurrency(totalMonthlyNet)}
Generated via PencilSTR Institutional Underwriting Terminal`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-y-auto transition-colors duration-200">
      {/* Top Banner / Ticker */}
      <div className="border-b border-[#E5E4DF] dark:border-[#262624] bg-white dark:bg-[#141413] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
            <span className="text-xs font-sans font-semibold text-[#1D1C1A] dark:text-[#F5F3ED]">
              Executive Portfolio Overview
            </span>
            <span className="text-xs text-[#8C8880] dark:text-[#737069]">·</span>
            <span className="text-xs text-[#6E6B65] dark:text-[#9E9B93] font-sans">
              Real-time Underwriting Intelligence
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF]">
            Portfolio Acquisition Executive Overview
          </h2>
        </div>

        {/* Quick Engine Switcher, Export Summary & Ingest */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold bg-white dark:bg-[#181816] hover:bg-[#FAF9F6] dark:hover:bg-[#20201D] border border-[#E5E4DF] dark:border-[#282825] text-[#111110] dark:text-[#F4F3EF] px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Copy Underwriting Executive Summary to Clipboard"
          >
            {copiedSummary ? (
              <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-[#78716C] dark:text-[#A8A29E]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 11V3.5C3 3.22386 3.22386 3 3.5 3H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
            <span className="hidden sm:inline">{copiedSummary ? 'Summary Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={() => setModelSelectorOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold bg-[#FAF9F6] dark:bg-[#181816] hover:bg-[#EBEAE6] dark:hover:bg-[#20201D] border border-[#E5E4DF] dark:border-[#282825] text-[#111110] dark:text-[#F4F3EF] px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Configure OpenRouter Reasoning Model"
          >
            <svg className="w-3.5 h-3.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="8" cy="8" r="2.2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className="hidden sm:inline">Engine:</span>
            <span className="text-[#059669] dark:text-[#34D399]">
              {selectedModel.includes('nemotron')
                ? 'Nemotron 3 Ultra (Free)'
                : selectedModel.includes('minimax')
                ? 'MiniMax 01 (Free)'
                : selectedModel.includes('llama-3.3')
                ? 'Llama 3.3 (Free)'
                : selectedModel.split('/')[1] || 'Free AI'}
            </span>
          </button>

          <button
            onClick={() => setIngestModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:bg-black dark:hover:bg-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5 text-[#F59E0B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>+ Ingest Listing</span>
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Dynamic Horizon & Pipeline Filter Bar */}
        <div className="bg-white dark:bg-[#161615] p-3 sm:p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#8F8D88] dark:text-[#73716B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3.5H14L9.5 8.5V13L6.5 11.5V8.5L2 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[#8F8D88] dark:text-[#73716B] uppercase text-[10px] font-bold">Horizon Filter:</span>
            </div>

            {/* Market Filter */}
            <select
              value={selectedMarketFilter}
              onChange={(e) => setSelectedMarketFilter(e.target.value)}
              className="bg-[#FAF9F6] dark:bg-[#1F1F1D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#111110] dark:text-[#F4F3EF] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF] cursor-pointer"
            >
              <option value="all">All Markets ({deals.length} deals)</option>
              <option value="smoky">Smoky Mountains, TN</option>
              <option value="scottsdale">Scottsdale, AZ</option>
              <option value="gulf">Gulf Shores, AL</option>
            </select>

            {/* Strategy Filter */}
            <select
              value={selectedStrategyFilter}
              onChange={(e) => setSelectedStrategyFilter(e.target.value)}
              className="bg-[#FAF9F6] dark:bg-[#1F1F1D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#111110] dark:text-[#F4F3EF] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF] cursor-pointer"
            >
              <option value="all">All Debt Strategies</option>
              <option value="dscr">DSCR Loan (Institutional 80% LTV)</option>
              <option value="seller_carry">Seller Financing / Second Carry</option>
              <option value="subto">Subject-To (Low Rate Assumption)</option>
              <option value="cash">All Cash / Equity</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8F8D88] dark:text-[#73716B] uppercase text-[10px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF9F6] dark:bg-[#1F1F1D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#111110] dark:text-[#F4F3EF] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF] cursor-pointer"
              >
                <option value="default">Default Order</option>
                <option value="coc">Highest CoC Return</option>
                <option value="dscr">Highest DSCR Coverage</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>

            {(selectedMarketFilter !== 'all' || selectedStrategyFilter !== 'all' || sortBy !== 'default') && (
              <button
                onClick={() => {
                  setSelectedMarketFilter('all');
                  setSelectedStrategyFilter('all');
                  setSortBy('default');
                }}
                className="text-[11px] text-[#D97706] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Row 1: Key Performance Metrics 4-Card Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#161615] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs relative overflow-hidden group">
            <div className="flex items-center justify-between text-[#8F8D88] dark:text-[#73716B] text-[11px] font-mono uppercase mb-1">
              <span>Pipeline AUM</span>
              <svg className="w-4.5 h-4.5 text-[#8F8D88] dark:text-[#73716B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6.5L8 2.5L14 6.5M3 13.5H13M4 6.5V11.5M7 6.5V11.5M10 6.5V11.5M13 6.5V11.5M2 13.5V14.5H14V13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="font-serif text-3xl font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF]">
              {formatCurrency(totalAum)}
            </div>
            <div className="text-[11px] font-mono text-[#666562] dark:text-[#A3A19B] mt-1.5 flex items-center justify-between">
              <span>{filteredDeals.length} Qualified Targets</span>
              <span className="text-[#059669] dark:text-[#34D399] font-semibold">Live Pipeline</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#059669]"></div>
          </div>

          <div className="bg-white dark:bg-[#161615] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs relative overflow-hidden group">
            <div className="flex items-center justify-between text-[#8F8D88] dark:text-[#73716B] text-[11px] font-mono uppercase mb-1">
              <span>Blended CoC Yield</span>
              <svg className="w-4.5 h-4.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 11.5L6.5 7.5L9.5 10.5L13.5 4.5M13.5 4.5H9.5M13.5 4.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="font-serif text-3xl font-bold tracking-tight text-[#0B3B24] dark:text-[#34D399]">
              {formatPercent(avgCoc)}
            </div>
            <div className="text-[11px] font-mono text-[#666562] dark:text-[#A3A19B] mt-1.5 flex items-center justify-between">
              <span>Annualized Return</span>
              <span className="text-[#0B3B24] dark:text-[#34D399] font-bold">Target &gt; 15%</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B3B24] dark:bg-[#34D399]"></div>
          </div>

          <div className="bg-white dark:bg-[#161615] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs relative overflow-hidden group">
            <div className="flex items-center justify-between text-[#8F8D88] dark:text-[#73716B] text-[11px] font-mono uppercase mb-1">
              <span>Average DSCR Ratio</span>
              <svg className="w-4.5 h-4.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5L10 3L12.5 2.5L13.5 5L15.5 6.5L14.5 9L15.5 11.5L13.5 13L12.5 15.5L10 15L8 16.5L6 15L3.5 15.5L2.5 13L0.5 11.5L1.5 9L0.5 6.5L2.5 5L3.5 2.5L6 3L8 1.5Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="font-serif text-3xl font-bold tracking-tight text-[#92400E] dark:text-[#FBBF24]">
              {avgDscr.toFixed(2)}x
            </div>
            <div className="text-[11px] font-mono text-[#666562] dark:text-[#A3A19B] mt-1.5 flex items-center justify-between">
              <span>Lender Hurdle: 1.25x</span>
              <span className={`font-semibold ${avgDscr >= 1.25 ? 'text-[#059669] dark:text-[#34D399]' : 'text-[#D97706]'}`}>
                {avgDscr >= 1.25 ? 'Tier-1 Cleared' : 'Under Observation'}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D97706]"></div>
          </div>

          <div className="bg-white dark:bg-[#161615] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs relative overflow-hidden group">
            <div className="flex items-center justify-between text-[#8F8D88] dark:text-[#73716B] text-[11px] font-mono uppercase mb-1">
              <span>Net Monthly Free Cash</span>
              <svg className="w-4.5 h-4.5 text-[#8F8D88] dark:text-[#73716B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7H14M6 10H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <div className="font-serif text-3xl font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF]">
              {formatCurrency(totalMonthlyNet)}
            </div>
            <div className="text-[11px] font-mono text-[#666562] dark:text-[#A3A19B] mt-1.5 flex items-center justify-between">
              <span>After All PITI &amp; Opex</span>
              <span className="text-[#059669] dark:text-[#34D399] font-semibold">Positive Flow</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3B82F6]"></div>
          </div>
        </div>

        {/* Row 2: Split Section (Napkin Math Scratchpad & Pipeline Stage Progress) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Quick Napkin Underwriting Scratchpad (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#161615] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-[#E5E4DF] dark:border-[#262624] pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24] font-bold">
                  REAL-TIME SIMULATOR
                </span>
                <h3 className="font-serif text-lg font-bold text-[#111110] dark:text-[#F4F3EF]">
                  Napkin Underwriting &amp; Stress Testing
                </h3>
              </div>

              {/* Preset Scenario Tabs */}
              <div className="flex items-center gap-1 bg-[#FAF9F6] dark:bg-[#1F1F1D] p-1 rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2A] text-[10px] font-mono">
                <button
                  onClick={() => handleApplyScenario('baseline')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    activeScenario === 'baseline'
                      ? 'bg-white dark:bg-[#141413] font-bold shadow-2xs text-[#111110] dark:text-[#F4F3EF]'
                      : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110]'
                  }`}
                >
                  Baseline
                </button>
                <button
                  onClick={() => handleApplyScenario('stress_adr')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    activeScenario === 'stress_adr'
                      ? 'bg-white dark:bg-[#141413] font-bold shadow-2xs text-[#D97706]'
                      : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110]'
                  }`}
                  title="Stress test: -10% ADR market compression"
                >
                  -10% ADR
                </button>
                <button
                  onClick={() => handleApplyScenario('stress_occ')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    activeScenario === 'stress_occ'
                      ? 'bg-white dark:bg-[#141413] font-bold shadow-2xs text-[#DC2626]'
                      : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110]'
                  }`}
                  title="Stress test: -13% low season occupancy dip"
                >
                  -13% Occ
                </button>
                <button
                  onClick={() => handleApplyScenario('stress_rate')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    activeScenario === 'stress_rate'
                      ? 'bg-white dark:bg-[#141413] font-bold shadow-2xs text-[#9333EA]'
                      : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110]'
                  }`}
                  title="Stress test: High debt rate spike to 8.4%"
                >
                  Rate Spike
                </button>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#666562] dark:text-[#A3A19B]">Purchase Price</span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">{formatCurrency(scratchPrice)}</span>
                </div>
                <input
                  type="range"
                  min={350000}
                  max={1500000}
                  step={25000}
                  value={scratchPrice}
                  onChange={(e) => setScratchPrice(Number(e.target.value))}
                  className="w-full accent-[#111110] dark:accent-[#F4F3EF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#666562] dark:text-[#A3A19B]">Down Payment %</span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">
                    {scratchDownPct}% ({formatCurrency(scratchDownDollars)})
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={35}
                  step={5}
                  value={scratchDownPct}
                  onChange={(e) => setScratchDownPct(Number(e.target.value))}
                  className="w-full accent-[#111110] dark:accent-[#F4F3EF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#666562] dark:text-[#A3A19B]">Nightly ADR ($)</span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${scratchAdr} / night</span>
                </div>
                <input
                  type="range"
                  min={250}
                  max={850}
                  step={15}
                  value={scratchAdr}
                  onChange={(e) => setScratchAdr(Number(e.target.value))}
                  className="w-full accent-[#059669] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#666562] dark:text-[#A3A19B]">Occupancy Rate %</span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">
                    {scratchOcc}% ({Math.round(365 * (scratchOcc / 100))} nights)
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={85}
                  step={1}
                  value={scratchOcc}
                  onChange={(e) => setScratchOcc(Number(e.target.value))}
                  className="w-full accent-[#059669] cursor-pointer"
                />
              </div>
            </div>

            {/* Instant Return Snapshot */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#121211] border border-[#E5E4DF] dark:border-[#262624] text-center">
              <div>
                <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#73716B] block uppercase">
                  Cash-on-Cash
                </span>
                <span className="font-serif text-xl font-bold text-[#0B3B24] dark:text-[#34D399]">
                  {scratchCoC.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#73716B] block uppercase">
                  DSCR Ratio
                </span>
                <span
                  className={`font-serif text-xl font-bold ${
                    scratchDscr >= 1.25 ? 'text-[#059669] dark:text-[#34D399]' : 'text-[#D97706]'
                  }`}
                >
                  {scratchDscr.toFixed(2)}x
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#73716B] block uppercase">
                  Net Monthly Cash
                </span>
                <span className="font-serif text-xl font-bold text-[#111110] dark:text-[#F4F3EF]">
                  {formatCurrency(scratchMonthlyNet)}
                </span>
              </div>
            </div>

            {/* DSCR Hurdle Visual Gauge */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#666562] dark:text-[#A3A19B]">DSCR Lending Threshold Gauge:</span>
                <span className={`font-bold ${scratchDscr >= 1.25 ? 'text-[#059669] dark:text-[#34D399]' : 'text-[#D97706]'}`}>
                  {scratchDscr >= 1.25 ? 'Cleared Tier-1 Hurdle (≥1.25x)' : 'Sub-Hurdle (<1.25x)'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#EBEAE6] dark:bg-[#262624] rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${
                    scratchDscr >= 1.35
                      ? 'bg-[#059669]'
                      : scratchDscr >= 1.25
                      ? 'bg-[#10B981]'
                      : scratchDscr >= 1.0
                      ? 'bg-[#D97706]'
                      : 'bg-[#DC2626]'
                  }`}
                  style={{ width: `${Math.min(Math.max((scratchDscr / 2.0) * 100, 5), 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#8F8D88] dark:text-[#73716B]">
                <span>0.80x (Distress)</span>
                <span>1.00x (Breakeven)</span>
                <span className="font-bold text-[#059669]">1.25x (Prime Hurdle)</span>
                <span>2.00x (Fortress)</span>
              </div>
            </div>
          </div>

          {/* Right: Pipeline Distribution & Submarket Benchmarks (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#161615] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E4DF] dark:border-[#262624] pb-2">
                <h4 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF]">
                  Acquisition Pipeline Velocity
                </h4>
                <button
                  onClick={() => setCurrentView('crm')}
                  className="text-xs font-mono text-[#D97706] hover:underline cursor-pointer"
                >
                  View Kanban Board →
                </button>
              </div>

              <div className="space-y-2.5">
                {stagesList.map((stage) => {
                  const count = deals.filter((d) => d.stage === stage.id).length;
                  const pct = deals.length > 0 ? (count / deals.length) * 100 : 0;
                  return (
                    <div key={stage.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#666562] dark:text-[#A3A19B]">{stage.label}</span>
                        <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">{count} Deals</span>
                      </div>
                      <div className="w-full h-2 bg-[#EBEAE6] dark:bg-[#262624] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(pct, count > 0 ? 12 : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Deck */}
            <div className="bg-[#FAF9F6] dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-5 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#73716B] font-bold block">
                TERMINAL ACCELERATORS
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans font-semibold">
                <button
                  onClick={() => setCurrentView('radar')}
                  className="p-3 bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] hover:border-[#D97706]/50 rounded-xl text-left transition-all cursor-pointer text-[#111110] dark:text-[#F4F3EF] shadow-2xs group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RadarIcon className="w-5 h-5 text-[#D97706] mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="block text-[13px]">Market Radar</span>
                  <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#787570]">Live Comps &amp; ADR</span>
                </button>
                <button
                  onClick={() => setCurrentView('audit')}
                  className="p-3 bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] hover:border-[#059669]/50 rounded-xl text-left transition-all cursor-pointer text-[#111110] dark:text-[#F4F3EF] shadow-2xs group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <AuditIcon className="w-5 h-5 text-[#059669] mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="block text-[13px]">Audit Bylaws</span>
                  <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#787570]">HOA &amp; CC&amp;R Seals</span>
                </button>
                <button
                  onClick={() => setCurrentView('underwriter')}
                  className="p-3 bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] hover:border-[#D97706]/50 rounded-xl text-left transition-all cursor-pointer text-[#111110] dark:text-[#F4F3EF] shadow-2xs group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <StudioIcon className="w-5 h-5 text-[#D97706] mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="block text-[13px]">Underwriter Lab</span>
                  <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#787570]">DSCR &amp; Debt Math</span>
                </button>
                <button
                  onClick={() => setCurrentView('portfolio')}
                  className="p-3 bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] hover:border-[#9333EA]/50 rounded-xl text-left transition-all cursor-pointer text-[#111110] dark:text-[#F4F3EF] shadow-2xs group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 text-[#9333EA] mb-1.5 transition-transform group-hover:scale-110" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17V12M8 17V8M13 17V10M17 17V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="17" cy="4" r="1.5" fill="currentColor" />
                  </svg>
                  <span className="block text-[13px]">Portfolio Intel</span>
                  <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#787570]">Projections vs Realized</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Live Submarket Benchmarks Table */}
        <div className="bg-white dark:bg-[#161615] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E4DF] dark:border-[#262624] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24] font-bold">
                REGIONAL INTELLIGENCE
              </span>
              <h3 className="font-serif text-lg font-bold text-[#111110] dark:text-[#F4F3EF]">
                Core STR Submarket Yield Benchmarks
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8F8D88] dark:text-[#73716B]">
              Assessor &amp; RentCast Fed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#E5E4DF] dark:border-[#262624] text-[#8F8D88] dark:text-[#73716B]">
                  <th className="pb-2">Submarket Cohort</th>
                  <th className="pb-2">Asset Class</th>
                  <th className="pb-2">Benchmark ADR</th>
                  <th className="pb-2">Avg. Occupancy</th>
                  <th className="pb-2">Cap Rate</th>
                  <th className="pb-2 text-right">Zoning &amp; CC&amp;R Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DF] dark:divide-[#262624]">
                {submarketBenchmarks.map((b, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF9F6] dark:hover:bg-[#1C1C1A] transition-colors">
                    <td className="py-3 font-bold text-[#111110] dark:text-[#F4F3EF]">{b.region}</td>
                    <td className="py-3 text-[#666562] dark:text-[#A3A19B]">{b.type}</td>
                    <td className="py-3 font-semibold text-[#111110] dark:text-[#F4F3EF]">{b.benchmarkAdr}</td>
                    <td className="py-3 font-semibold text-[#111110] dark:text-[#F4F3EF]">{b.avgOcc}</td>
                    <td className="py-3 font-bold text-[#059669] dark:text-[#34D399]">{b.capRate}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${b.statusClass}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 4: Pre-Modeled Institutional Deal Cohorts Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#111110] dark:text-[#F4F3EF]">
                Featured Underwritten Pipeline Cohorts
              </h3>
              <p className="text-xs font-mono text-[#8F8D88] dark:text-[#73716B]">
                Showing {filteredDeals.length} active target{filteredDeals.length === 1 ? '' : 's'} matching horizon filter
              </p>
            </div>
            <button
              onClick={() => setCurrentView('crm')}
              className="text-xs font-mono text-[#D97706] hover:underline cursor-pointer"
            >
              Open Acquisition CRM Board →
            </button>
          </div>

          {filteredDeals.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#161615] rounded-xl border border-[#E5E4DF] dark:border-[#262624] space-y-3">
              <svg className="w-8 h-8 text-[#8F8D88] dark:text-[#73716B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5L14 14M2 2L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <p className="text-sm font-semibold text-[#111110] dark:text-[#F4F3EF]">No deals match current filter criteria</p>
              <button
                onClick={() => {
                  setSelectedMarketFilter('all');
                  setSelectedStrategyFilter('all');
                  setSortBy('default');
                }}
                className="text-xs font-mono text-[#D97706] underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map((deal) => (
                <MuseCompCard
                  key={deal.id}
                  deal={deal}
                  onSelect={(d) => onOpenDealDrawer(d as Deal)}
                  onNavigateToUnderwriter={(d) => onOpenUnderwriter(d as Deal)}
                  onNavigateToAudit={(d) => onOpenAudit(d as Deal)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
