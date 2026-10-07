import React, { useState, useId } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { Deal, FinancingType } from '../../types/deal';
import { calculateUnderwriteMetrics } from '../../utils/underwriterMath';
import { sanitizeDeal } from '../../store/useDealStore';
import { DEMO_DEALS } from '../../mock/demoDeals';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface UnderwriterLabViewProps {
  onOpenLenderMemo: (deal: Deal) => void;
}

export const UnderwriterLabView: React.FC<UnderwriterLabViewProps> = ({ onOpenLenderMemo }) => {
  const { deals, selectedDealId, setSelectedDealId, updateDeal } = useDealStore();
  const equityGradId = useId();
  const balanceGradId = useId();

  const rawDeal = deals.find((d) => d.id === selectedDealId) || deals[0] || DEMO_DEALS[0];
  const currentDeal = sanitizeDeal(rawDeal);

  // Local interactive slider states (hydrated from selected deal)
  const [purchasePrice, setPurchasePrice] = useState(currentDeal.price || 625000);
  const [adr, setAdr] = useState(currentDeal.baseAdr || 485);
  const [occupancy, setOccupancy] = useState(currentDeal.baseOccupancy || 64);
  const [downPaymentPct, setDownPaymentPct] = useState(currentDeal.financing?.downPaymentPct ?? 20);
  const [interestRate, setInterestRate] = useState(currentDeal.financing?.interestRate ?? 7.15);
  const [strategy, setStrategy] = useState<FinancingType>(currentDeal.financing?.strategy || 'dscr');
  const [managementFeePct, setManagementFeePct] = useState(
    (currentDeal.expenses?.managementFeeRate ?? 0.15) * 100
  );

  // Creative financing parameters
  const [interestOnlyYears, setInterestOnlyYears] = useState(
    currentDeal.financing?.sellerCarryTerms?.interestOnlyYears ?? 2
  );
  const [balloonYears, setBalloonYears] = useState(
    currentDeal.financing?.sellerCarryTerms?.balloonYears ?? 5
  );

  // Expandable line-item expense state
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(true);

  // Helpful Features Dropbar State
  type HelpfulFeatureKey =
    | 'none'
    | 'cost_seg'
    | 'dscr_presets'
    | 'sensitivity'
    | 'break_even'
    | 'rate_shock'
    | 'exchange_1031'
    | 'export_csv';
  const [activeHelpfulFeature, setActiveHelpfulFeature] = useState<HelpfulFeatureKey>('none');
  const [investorTaxBracket, setInvestorTaxBracket] = useState<number>(37);
  const [personalPropertyRatio, setPersonalPropertyRatio] = useState<number>(25);

  // 1031 Exchange State
  const [relinquishedSalePrice, setRelinquishedSalePrice] = useState<number>(550000);
  const [relinquishedDebtPayoff, setRelinquishedDebtPayoff] = useState<number>(220000);

  // Cost Segregation & Bonus Depreciation Calculations
  const buildingBasis = purchasePrice * 0.8;
  const personalPropertyValue = buildingBasis * (personalPropertyRatio / 100);
  const firstYearBonusDepreciation = personalPropertyValue;
  const estimatedCashTaxShield = firstYearBonusDepreciation * (investorTaxBracket / 100);
  const netEffectivePurchasePrice = purchasePrice - estimatedCashTaxShield;

  // Apply DSCR target loan calculation
  const applyDscrPreset = (targetRatio: number) => {
    if (metrics.noi <= 0) return;
    const maxAnnualDebtService = metrics.noi / targetRatio;
    const maxMonthlyDebt = maxAnnualDebtService / 12;
    const r = interestRate / 100 / 12;
    const n = 360;
    const factor = (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    const maxLoan = maxMonthlyDebt * factor;
    const requiredDownPaymentDollars = Math.max(0, purchasePrice - maxLoan);
    const requiredDownPct = Math.min(
      90,
      Math.max(10, Math.round((requiredDownPaymentDollars / purchasePrice) * 100))
    );
    setDownPaymentPct(requiredDownPct);
  };

  // Export CSV
  const handleExportProFormaCsv = () => {
    const rows = [
      ['PENCILSTR STUDIO FINANCIAL PRO FORMA', ''],
      ['Property', currentDeal.title],
      ['Location', `${currentDeal.city}, ${currentDeal.state}`],
      ['MLS #', currentDeal.mlsNumber],
      ['Purchase Price', `$${purchasePrice.toLocaleString()}`],
      ['Stabilized ADR', `$${adr}`],
      ['Base Occupancy', `${occupancy}%`],
      ['Financing Strategy', strategy.toUpperCase()],
      ['Down Payment', `${downPaymentPct}% ($${Math.round((purchasePrice * downPaymentPct) / 100).toLocaleString()})`],
      ['Interest Rate', `${interestRate}%`],
      ['', ''],
      ['ANNUAL PERFORMANCE', ''],
      ['Gross Annual Revenue', `$${Math.round(metrics.grossAnnualRevenue).toLocaleString()}`],
      ['Operating Expenses', `$${Math.round(metrics.operatingExpenses).toLocaleString()}`],
      ['Net Operating Income (NOI)', `$${Math.round(metrics.noi).toLocaleString()}`],
      ['Annual Debt Service', `$${Math.round(metrics.annualDebtService).toLocaleString()}`],
      ['Net Annual Cash Flow', `$${Math.round(metrics.netCashFlowAnnual).toLocaleString()}`],
      ['Monthly Cash Flow', `$${Math.round(metrics.netCashFlowMonthly).toLocaleString()}`],
      ['Cash-on-Cash Return', `${metrics.cashOnCashReturn.toFixed(1)}%`],
      ['Unlevered Cap Rate', `${metrics.capRate.toFixed(1)}%`],
      ['DSCR Ratio', `${metrics.dscrRatio.toFixed(2)}x`],
      ['Break-Even Occupancy', `${metrics.breakEvenOccupancy}%`],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PencilSTR_Studio_${currentDeal.mlsNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Executive summary AI thesis state
  const [executiveThesis, setExecutiveThesis] = useState<string | null>(null);
  const [isGeneratingThesis, setIsGeneratingThesis] = useState(false);
  const [thesisCopied, setThesisCopied] = useState(false);

  const handleGenerateExecutiveThesis = async () => {
    setIsGeneratingThesis(true);
    try {
      const res = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal: {
            title: currentDeal.title,
            location: `${currentDeal.city}, ${currentDeal.state}`,
            price: purchasePrice,
            baseAdr: adr,
            baseOccupancy: occupancy,
            breakEvenOccupancy: metrics.breakEvenOccupancy,
            hoaStatus: { statusText: currentDeal.audit?.str_status || 'PERMITTED' },
            financing: {
              strategy,
              interestRate,
              downPaymentPct,
            },
          },
          metrics: {
            adr,
            occupancy,
            cashOnCashReturn: metrics.cashOnCashReturn,
            capRate: metrics.capRate,
            dscrRatio: metrics.dscrRatio,
            netCashFlowMonthly: metrics.netCashFlowMonthly,
            netCashFlowAnnual: metrics.netCashFlowAnnual,
            noi: metrics.noi,
            strategy,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.thesis) {
        setExecutiveThesis(data.thesis);
      }
    } catch (err) {
      console.error('Failed to generate executive thesis:', err);
    } finally {
      setIsGeneratingThesis(false);
    }
  };

  const handleCopyThesis = () => {
    if (!executiveThesis) return;
    navigator.clipboard.writeText(executiveThesis);
    setThesisCopied(true);
    setTimeout(() => setThesisCopied(false), 2000);
  };

  // Sync state when selected deal changes
  React.useEffect(() => {
    if (currentDeal) {
      setPurchasePrice(currentDeal.price || 625000);
      setAdr(currentDeal.baseAdr || 485);
      setOccupancy(currentDeal.baseOccupancy || 64);
      setDownPaymentPct(currentDeal.financing?.downPaymentPct ?? 20);
      setInterestRate(currentDeal.financing?.interestRate ?? 7.15);
      setStrategy(currentDeal.financing?.strategy || 'dscr');
      setManagementFeePct((currentDeal.expenses?.managementFeeRate ?? 0.15) * 100);
      setInterestOnlyYears(currentDeal.financing?.sellerCarryTerms?.interestOnlyYears ?? 2);
      setBalloonYears(currentDeal.financing?.sellerCarryTerms?.balloonYears ?? 5);
    }
  }, [currentDeal.id]);

  // Real-time calculation engine execution
  const metrics = calculateUnderwriteMetrics(currentDeal, {
    purchasePrice,
    adr,
    occupancy,
    financing: {
      strategy,
      downPaymentPct,
      interestRate,
      amortizationYears: 30,
      sellerCarryTerms: {
        interestOnlyYears,
        balloonYears,
      },
    },
    expenses: {
      managementFeeRate: managementFeePct / 100,
    },
  });

  // 10-Year Amortization & Equity Projection data
  const loanAmount = purchasePrice * (1 - downPaymentPct / 100);
  const monthlyRate = interestRate / 100 / 12;
  const amortizationData = [];
  let remainingBal = loanAmount;
  let cumEquity = purchasePrice * (downPaymentPct / 100);

  for (let year = 1; year <= 10; year++) {
    for (let m = 1; m <= 12; m++) {
      const isInterestOnly = strategy === 'seller_carry' && year <= interestOnlyYears;
      if (!isInterestOnly) {
        const interestPmt = remainingBal * monthlyRate;
        const principalPmt = metrics.monthlyDebtService - interestPmt;
        remainingBal = Math.max(0, remainingBal - principalPmt);
      }
    }
    const propValue = purchasePrice * Math.pow(1.03, year);
    cumEquity = propValue - remainingBal;

    amortizationData.push({
      year: `Yr ${year}`,
      loanBalance: Math.round(remainingBal),
      propertyEquity: Math.round(cumEquity),
      propertyValue: Math.round(propValue),
    });
  }

  // Monthly Cash Flow Waterfall Data
  const grossMonthly = metrics.grossAnnualRevenue / 12;
  const opexMonthly = metrics.operatingExpenses / 12;
  const waterfallData = [
    { name: 'Gross Rent', amount: Math.round(grossMonthly), fill: '#0B3B24' },
    { name: 'Opex Stack', amount: -Math.round(opexMonthly), fill: '#D97706' },
    { name: 'Debt (PITI)', amount: -Math.round(metrics.monthlyDebtService), fill: '#666562' },
    { name: 'Net Free Cash', amount: Math.round(metrics.netCashFlowMonthly), fill: '#059669' },
  ];

  // Seasonality chart data from deal
  const seasonalityData = (currentDeal.seasonality || []).map((s) => ({
    name: s.month,
    revenue: s.revenue,
    occupancy: s.occupancy,
    adr: s.adr,
    isPeak: s.isPeak,
  }));

  // Sensitivity Stress-Test Grid Generator
  const adrDeltas = [-20, -10, 0, 10, 20];
  const occDeltas = [-15, -10, 0, 10, 15];

  const handleSaveToDeal = () => {
    updateDeal(currentDeal.id, {
      price: purchasePrice,
      baseAdr: adr,
      baseOccupancy: occupancy,
      financing: {
        ...currentDeal.financing,
        strategy,
        downPaymentPct,
        interestRate,
        sellerCarryTerms: {
          interestOnlyYears,
          balloonYears,
        },
      },
      expenses: {
        ...currentDeal.expenses,
        managementFeeRate: managementFeePct / 100,
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-y-auto transition-colors duration-200">
      {/* Top Property Selector & Action Bar */}
      <div className="bg-white dark:bg-[#141413] border-b border-[#E5E4DF] dark:border-[#262624] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#73716B]">
            Cohort Model:
          </label>
          <select
            value={currentDeal.id}
            onChange={(e) => setSelectedDealId(e.target.value)}
            className="bg-[#FAF9F6] dark:bg-[#1F1F1D] border border-[#E5E4DF] dark:border-[#2E2E2A] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF] cursor-pointer"
          >
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} (${d.price.toLocaleString()} • {d.city}, {d.state})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleGenerateExecutiveThesis}
            disabled={isGeneratingThesis}
            className="flex items-center gap-1.5 bg-white dark:bg-[#1E1E1C] border border-[#D97706]/40 text-[#92400E] dark:text-[#FBBF24] hover:bg-[#FEF3C7]/40 dark:hover:bg-[#92400E]/20 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Generate Gemini AI Investment Thesis"
          >
            {isGeneratingThesis ? (
              <span className="w-4 h-4 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin shrink-0"></span>
            ) : (
              <svg className="w-4 h-4 text-[#D97706] shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.5" y="2" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5.5 5.5H10.5M5.5 8H10.5M5.5 10.5H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
            <span>{isGeneratingThesis ? 'Synthesizing...' : 'Executive Summary'}</span>
          </button>

          <button
            onClick={handleSaveToDeal}
            className="px-3.5 py-1.5 bg-[#FAF9F6] dark:bg-[#1F1F1D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#EBEAE6] dark:hover:bg-[#282825] rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            Save Assumptions
          </button>

          <button
            onClick={() => onOpenLenderMemo(currentDeal)}
            className="flex items-center gap-1.5 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] px-4 py-1.5 rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 2.5H9.5L12.5 5.5V13.5H3.5V2.5Z" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 2.5V5.5H12.5M6 8H10M6 10.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span>Download Lender Memo (PDF)</span>
          </button>
        </div>
      </div>

      {/* Helpful Features Dropbar (User Request) */}
      <div className="bg-[#FAF9F5] dark:bg-[#181816] border-b border-[#E5E4DF] dark:border-[#262624] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono sticky top-[69px] z-10 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#111110] dark:text-[#F4F3EF]">
            <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M6 10L10 6M9 6L10 7M7 10L6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span className="font-bold uppercase tracking-wider text-[11px]">Helpful Features:</span>
          </div>

          {/* Feature Dropdown Selector */}
          <select
            value={activeHelpfulFeature}
            onChange={(e) => {
              const val = e.target.value as HelpfulFeatureKey;
              if (val === 'export_csv') {
                handleExportProFormaCsv();
              } else {
                setActiveHelpfulFeature(val);
              }
            }}
            className="bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#111110] dark:text-[#F4F3EF] rounded-lg px-3 py-1.5 text-xs font-sans font-semibold focus:outline-none focus:ring-1 focus:ring-[#111110] dark:focus:ring-[#F4F3EF] cursor-pointer shadow-2xs"
          >
            <option value="none">Select helpful tool...</option>
            <option value="cost_seg">Cost Segregation &amp; 100% Bonus Depreciation Tax Shield</option>
            <option value="dscr_presets">DSCR Debt Hurdle Presets (1.20x to 1.50x)</option>
            <option value="sensitivity">Sensitivity Stress Test Matrix (±10%, ±20%)</option>
            <option value="break_even">Break-Even Occupancy &amp; Rate Hurdle Solver</option>
            <option value="rate_shock">Interest Rate Shock &amp; Debt Yield Stress</option>
            <option value="exchange_1031">1031 Tax-Deferred Exchange Target Solver</option>
            <option value="export_csv">Export Financial Pro Forma (CSV Download)</option>
          </select>

          {/* Quick Shortcut Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => setActiveHelpfulFeature(activeHelpfulFeature === 'cost_seg' ? 'none' : 'cost_seg')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans transition-all cursor-pointer ${
                activeHelpfulFeature === 'cost_seg'
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              Cost Seg
            </button>

            <button
              onClick={() => setActiveHelpfulFeature(activeHelpfulFeature === 'dscr_presets' ? 'none' : 'dscr_presets')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans transition-all cursor-pointer ${
                activeHelpfulFeature === 'dscr_presets'
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              DSCR Presets
            </button>

            <button
              onClick={() => setActiveHelpfulFeature(activeHelpfulFeature === 'sensitivity' ? 'none' : 'sensitivity')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans transition-all cursor-pointer ${
                activeHelpfulFeature === 'sensitivity'
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              Stress Test
            </button>

            <button
              onClick={() => setActiveHelpfulFeature(activeHelpfulFeature === 'break_even' ? 'none' : 'break_even')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans transition-all cursor-pointer ${
                activeHelpfulFeature === 'break_even'
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              Break-Even
            </button>

            <button
              onClick={() => setActiveHelpfulFeature(activeHelpfulFeature === 'rate_shock' ? 'none' : 'rate_shock')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans transition-all cursor-pointer ${
                activeHelpfulFeature === 'rate_shock'
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              Rate Shock
            </button>

            <button
              onClick={() => setActiveHelpfulFeature(activeHelpfulFeature === 'exchange_1031' ? 'none' : 'exchange_1031')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans transition-all cursor-pointer ${
                activeHelpfulFeature === 'exchange_1031'
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              1031 Exchange
            </button>

            <button
              onClick={handleExportProFormaCsv}
              className="px-2.5 py-1 rounded-md text-[11px] font-sans bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-all cursor-pointer inline-flex items-center gap-1"
              title="Download Pro Forma CSV"
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V10M8 10L5 7M8 10L11 7M2 13H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#666562] dark:text-[#A3A19B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
          <span>Studio Engine Active</span>
        </div>
      </div>

      {/* Helpful Feature Interactive Panels */}
      {activeHelpfulFeature !== 'none' && (
        <div className="bg-[#F2EFE9] dark:bg-[#1B1B18] border-b border-[#E5E4DF] dark:border-[#2A2926] px-6 py-4 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto">
            {/* 1. Cost Segregation Panel */}
            {activeHelpfulFeature === 'cost_seg' && (
              <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6.5L8 2.5L14 6.5M3 13.5H13M4 6.5V11.5M7 6.5V11.5M10 6.5V11.5M13 6.5V11.5M2 13.5V14.5H14V13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF]">
                      Cost Segregation &amp; 100% Bonus Depreciation Tax Shield
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#34D399] font-bold">
                      STR TAX LOOPHOLE
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveHelpfulFeature('none')}
                    className="p-1 rounded text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                    <span className="text-[10px] font-mono text-[#8F8D88] uppercase block mb-1">
                      Depreciable Basis (80%)
                    </span>
                    <span className="text-base font-bold font-mono text-[#111110] dark:text-[#F4F3EF]">
                      ${Math.round(buildingBasis).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8F8D88] block mt-0.5">Excludes 20% land</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-[#8F8D88] uppercase">
                        Personal Property %
                      </span>
                      <span className="font-bold text-xs font-mono">{personalPropertyRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="35"
                      step="1"
                      value={personalPropertyRatio}
                      onChange={(e) => setPersonalPropertyRatio(Number(e.target.value))}
                      className="w-full accent-[#D97706] cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-[#059669] font-bold block mt-1">
                      ${Math.round(personalPropertyValue).toLocaleString()} Accelerated
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-[#8F8D88] uppercase">
                        Marginal Tax Bracket
                      </span>
                      <span className="font-bold text-xs font-mono">{investorTaxBracket}%</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[24, 32, 35, 37].map((b) => (
                        <button
                          key={b}
                          onClick={() => setInvestorTaxBracket(b)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                            investorTaxBracket === b
                              ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110]'
                              : 'bg-white dark:bg-[#242422] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562]'
                          }`}
                        >
                          {b}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/20 border border-[#A7F3D0] dark:border-[#065F46]">
                    <span className="text-[10px] font-mono text-[#065F46] dark:text-[#34D399] uppercase font-bold block mb-1">
                      Year 1 Cash Tax Savings
                    </span>
                    <span className="text-xl font-bold font-mono text-[#065F46] dark:text-[#34D399] block">
                      +${Math.round(estimatedCashTaxShield).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#065F46]/80 dark:text-[#34D399]/80 block mt-0.5">
                      Net Price: ${Math.round(netEffectivePurchasePrice).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#666562] dark:text-[#9A9893] leading-relaxed">
                  Under Treasury Reg. § 1.469-1T(e)(3)(ii)(A), short-term rentals with an average guest stay of 7 days or less are non-passive business activities. Material participation allows upfront 100% bonus depreciation on 5-year property (appliances, furnishings, HVAC, hot tub) to offset W-2 or active business income.
                </p>
              </div>
            )}

            {/* 2. DSCR Lender Presets Panel */}
            {activeHelpfulFeature === 'dscr_presets' && (
              <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7H14M6 10H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF]">
                      DSCR Debt Qualification Presets &amp; Maximum Loan Solver
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveHelpfulFeature('none')}
                    className="p-1 rounded text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  {[
                    { ratio: 1.20, label: '1.20x Private Credit', tag: 'Aggressive Debt' },
                    { ratio: 1.25, label: '1.25x Agency Target', tag: 'Standard Institutional' },
                    { ratio: 1.35, label: '1.35x Tier-1 Fund', tag: 'Conservative Buffer' },
                    { ratio: 1.50, label: '1.50x Fortress Bank', tag: 'High-Yield Equity' },
                  ].map((preset) => {
                    const isCurrent = Math.abs(metrics.dscrRatio - preset.ratio) < 0.05;
                    return (
                      <div
                        key={preset.ratio}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-[#FEF3C7]/20 border-[#D97706] ring-1 ring-[#D97706]/40'
                            : 'bg-[#FAF9F6] dark:bg-[#1A1A18] border-[#E5E4DF] dark:border-[#262624]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-xs text-[#111110] dark:text-[#F4F3EF]">
                            {preset.label}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded bg-[#E5E4DF] dark:bg-[#282825]">
                            {preset.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666562] dark:text-[#9A9893] mb-3">
                          Calibrates loan balance so annual debt service equals exactly NOI ÷ {preset.ratio}x.
                        </p>
                        <button
                          onClick={() => applyDscrPreset(preset.ratio)}
                          className="w-full py-1.5 rounded-lg bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shadow-2xs"
                        >
                          Apply {preset.ratio}x Ratio
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Sensitivity Matrix Panel */}
            {activeHelpfulFeature === 'sensitivity' && (
              <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 6.5H13.5M2.5 10.5H13.5M6.5 2.5V13.5M10.5 2.5V13.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF]">
                      Sensitivity Matrix: Cash-on-Cash Return across ADR &amp; Occupancy
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveHelpfulFeature('none')}
                    className="p-1 rounded text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E4DF] dark:border-[#262624] text-[10px] text-[#8F8D88]">
                        <th className="py-2 text-left">ADR \ Occ</th>
                        {[-15, -10, 0, 10, 15].map((oDelta) => {
                          const occVal = Math.min(100, Math.max(30, Math.round(occupancy + oDelta)));
                          return (
                            <th key={oDelta} className="py-2 text-center">
                              {occVal}%
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {[-20, -10, 0, 10, 20].map((aDelta) => {
                        const adrVal = Math.round(adr * (1 + aDelta / 100));
                        return (
                          <tr key={aDelta} className="border-b border-[#E5E4DF]/50 dark:border-[#262624]/50">
                            <td className="py-2 font-bold text-[#111110] dark:text-[#F4F3EF]">
                              ${adrVal}/nt {aDelta === 0 && <span className="text-[#D97706]">(Base)</span>}
                            </td>
                            {[-15, -10, 0, 10, 15].map((oDelta) => {
                              const occVal = Math.min(100, Math.max(30, Math.round(occupancy + oDelta)));
                              const simGross = adrVal * 365 * (occVal / 100);
                              const simOpex = metrics.operatingExpenses;
                              const simNoi = simGross - simOpex;
                              const simDscr = metrics.annualDebtService > 0 ? simNoi / metrics.annualDebtService : 1.5;
                              const simCash = simNoi - metrics.annualDebtService;
                              const initialEquity = (purchasePrice * downPaymentPct) / 100 + purchasePrice * 0.03;
                              const simCoc = initialEquity > 0 ? (simCash / initialEquity) * 100 : 0;
                              const isBase = aDelta === 0 && oDelta === 0;

                              return (
                                <td
                                  key={oDelta}
                                  className={`py-2 text-center rounded transition-colors ${
                                    isBase
                                      ? 'bg-[#FEF3C7] dark:bg-[#78350F]/40 font-bold border border-[#D97706]'
                                      : simDscr >= 1.25
                                      ? 'text-[#065F46] dark:text-[#34D399]'
                                      : 'text-[#991B1B] dark:text-[#F87171]'
                                  }`}
                                >
                                  <div>{simCoc.toFixed(1)}%</div>
                                  <div className="text-[9px] opacity-75">{simDscr.toFixed(2)}x DSCR</div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Break-Even Solver Panel */}
            {activeHelpfulFeature === 'break_even' && (
              <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L13.5 4.5V8.5C13.5 11.8 11.2 13.8 8 14.5C4.8 13.8 2.5 11.8 2.5 8.5V4.5L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 8.5L7.2 10.2L10.5 6.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF]">
                      Break-Even Risk Analysis &amp; Occupancy Cushion
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveHelpfulFeature('none')}
                    className="p-1 rounded text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                    <span className="text-[10px] font-mono text-[#8F8D88] uppercase block mb-1">
                      Zero-Cash-Flow Break-Even
                    </span>
                    <span className="text-2xl font-bold font-mono text-[#111110] dark:text-[#F4F3EF]">
                      {metrics.breakEvenOccupancy}%
                    </span>
                    <span className="text-xs text-[#8F8D88] block mt-1">
                      {Math.round((365 * metrics.breakEvenOccupancy) / 100 / 12)} nights / month required
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                    <span className="text-[10px] font-mono text-[#8F8D88] uppercase block mb-1">
                      Stabilized Base Occupancy
                    </span>
                    <span className="text-2xl font-bold font-mono text-[#059669]">
                      {occupancy}%
                    </span>
                    <span className="text-xs text-[#8F8D88] block mt-1">
                      {Math.round((365 * occupancy) / 100 / 12)} nights / month projected
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/20 border border-[#A7F3D0] dark:border-[#065F46]">
                    <span className="text-[10px] font-mono text-[#065F46] dark:text-[#34D399] uppercase font-bold block mb-1">
                      Safety Cushion Margin
                    </span>
                    <span className="text-2xl font-bold font-mono text-[#065F46] dark:text-[#34D399]">
                      +{(occupancy - metrics.breakEvenOccupancy).toFixed(1)}%
                    </span>
                    <span className="text-xs text-[#065F46]/80 dark:text-[#34D399]/80 block mt-1">
                      +{Math.round((365 * (occupancy - metrics.breakEvenOccupancy)) / 100 / 12)} extra nights of debt cushion
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Rate Shock & Debt Yield Stress Panel */}
            {activeHelpfulFeature === 'rate_shock' && (
              <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 11.5L6.5 7.5L9.5 10.5L13.5 4.5M13.5 4.5H9.5M13.5 4.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF]">
                      Interest Rate Shock &amp; DSCR Debt Cushion Testing
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveHelpfulFeature('none')}
                    className="p-1 rounded text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E4DF] dark:border-[#262624] text-[10px] text-[#8F8D88]">
                        <th className="py-2 text-left">Shock Scenario</th>
                        <th className="py-2 text-left">Coupon Rate</th>
                        <th className="py-2 text-right">Monthly P&amp;I</th>
                        <th className="py-2 text-right">Annual Debt</th>
                        <th className="py-2 text-right">DSCR Ratio</th>
                        <th className="py-2 text-right">Annual Free Cash</th>
                        <th className="py-2 text-center">Lender Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 50, 100, 150, 200, 300].map((bps) => {
                        const shockRate = interestRate + bps / 100;
                        const r = (shockRate / 100) / 12;
                        const n = 360;
                        const monthlyPmt = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                        const annualDebt = monthlyPmt * 12;
                        const shockDscr = annualDebt > 0 ? metrics.noi / annualDebt : 2;
                        const shockCash = metrics.noi - annualDebt;
                        const isBase = bps === 0;

                        return (
                          <tr
                            key={bps}
                            className={`border-b border-[#E5E4DF]/50 dark:border-[#262624]/50 ${
                              isBase ? 'bg-[#FEF3C7]/40 dark:bg-[#78350F]/20 font-bold' : ''
                            }`}
                          >
                            <td className="py-2.5 text-[#111110] dark:text-[#F4F3EF]">
                              {isBase ? 'Current Underwrite' : `+${bps} bps Rate Hike`}
                            </td>
                            <td className="py-2.5 font-bold">{shockRate.toFixed(2)}%</td>
                            <td className="py-2.5 text-right font-mono">${Math.round(monthlyPmt).toLocaleString()}</td>
                            <td className="py-2.5 text-right font-mono">${Math.round(annualDebt).toLocaleString()}</td>
                            <td className={`py-2.5 text-right font-mono font-bold ${
                              shockDscr >= 1.25
                                ? 'text-[#065F46] dark:text-[#34D399]'
                                : shockDscr >= 1.10
                                ? 'text-[#D97706]'
                                : 'text-[#DC2626]'
                            }`}>
                              {shockDscr.toFixed(2)}x
                            </td>
                            <td className={`py-2.5 text-right font-mono ${
                              shockCash >= 0 ? 'text-[#065F46] dark:text-[#34D399]' : 'text-[#DC2626]'
                            }`}>
                              ${Math.round(shockCash).toLocaleString()}
                            </td>
                            <td className="py-2.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                shockDscr >= 1.25
                                  ? 'bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#34D399]'
                                  : shockDscr >= 1.10
                                  ? 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/30 dark:text-[#FBBF24]'
                                  : 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#7F1D1D]/30 dark:text-[#F87171]'
                              }`}>
                                {shockDscr >= 1.25 ? 'QUALIFIED' : shockDscr >= 1.10 ? 'BORDERLINE' : 'DEFAULT RISK'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. 1031 Exchange Target Solver Panel */}
            {activeHelpfulFeature === 'exchange_1031' && (
              <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5.5H13.5M13.5 5.5L10.5 2.5M13.5 10.5H2.5M2.5 10.5L5.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF]">
                      IRC § 1031 Tax-Deferred Like-Kind Exchange Target Calculator
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveHelpfulFeature('none')}
                    className="p-1 rounded text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                    <label className="text-[10px] font-mono text-[#8F8D88] uppercase block mb-1">
                      Relinquished Sale Price
                    </label>
                    <input
                      type="number"
                      step="10000"
                      value={relinquishedSalePrice}
                      onChange={(e) => setRelinquishedSalePrice(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] rounded px-2.5 py-1 text-sm font-mono font-bold"
                    />
                    <span className="text-[10px] text-[#8F8D88] block mt-1">Sale price of previous property</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                    <label className="text-[10px] font-mono text-[#8F8D88] uppercase block mb-1">
                      Relinquished Debt Payoff
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={relinquishedDebtPayoff}
                      onChange={(e) => setRelinquishedDebtPayoff(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] rounded px-2.5 py-1 text-sm font-mono font-bold"
                    />
                    <span className="text-[10px] text-[#8F8D88] block mt-1">Mortgage paid off at sale</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                    <span className="text-[10px] font-mono text-[#8F8D88] uppercase block mb-1">
                      Net Equity to Reinvest
                    </span>
                    <span className="text-base font-bold font-mono text-[#111110] dark:text-[#F4F3EF]">
                      ${Math.max(0, relinquishedSalePrice - relinquishedDebtPayoff).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8F8D88] block mt-0.5">
                      Must be 100% rolled to avoid Cash Boot
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    purchasePrice >= relinquishedSalePrice && loanAmount >= relinquishedDebtPayoff
                      ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/20 border-[#A7F3D0] dark:border-[#065F46]'
                      : 'bg-[#FEF3C7] dark:bg-[#78350F]/20 border-[#FDE68A] dark:border-[#78350F]'
                  }`}>
                    <span className="text-[10px] font-mono uppercase font-bold block mb-1 text-[#065F46] dark:text-[#34D399]">
                      {purchasePrice >= relinquishedSalePrice && loanAmount >= relinquishedDebtPayoff
                        ? '100% Tax Deferral Met'
                        : 'Partial Boot Exposure'}
                    </span>
                    <span className="text-xl font-bold font-mono text-[#065F46] dark:text-[#34D399]">
                      $0 Taxable Boot
                    </span>
                    <span className="text-[10px] text-[#065F46]/80 dark:text-[#34D399]/80 block mt-0.5">
                      Target ${purchasePrice.toLocaleString()} &gt;= Relinquished ${relinquishedSalePrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624] text-[11px] text-[#666562] dark:text-[#A3A19B] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8.5L10 10.5M6 2H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <span><strong>Statutory Deadlines:</strong> 45-day identification notice (3-property rule) and 180-day closing exchange window through Qualified Intermediary (QI).</span>
                  </div>
                  <span className="font-mono text-[#059669] font-bold shrink-0 ml-2">Active QI Escrow Ready</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Gemini AI Executive Summary Thesis Callout */}
        {(isGeneratingThesis || executiveThesis) && (
          <div className="p-5 rounded-xl border border-[#D97706]/30 bg-gradient-to-r from-[#FEF3C7]/30 via-white to-[#FAF9F6] dark:from-[#92400E]/15 dark:via-[#161615] dark:to-[#121211] shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-[#D97706]/20 mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D97706] shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1.5L9.8 5.5L14 6.2L11 9.3L11.7 13.5L8 11.4L4.3 13.5L5 9.3L2 6.2L6.2 5.5L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                <span className="font-serif text-xs font-bold text-[#92400E] dark:text-[#FBBF24] tracking-wide">
                  Executive Investment Thesis
                </span>
                <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-[#D97706]/15 text-[#92400E] dark:text-[#FDE68A] font-medium">
                  Gemini Intelligence
                </span>
              </div>
              <div className="flex items-center gap-2">
                {executiveThesis && (
                  <button
                    type="button"
                    onClick={handleCopyThesis}
                    className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
                    title="Copy thesis to clipboard"
                  >
                    {thesisCopied ? (
          <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-[#78716C]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 11V3.5C3 3.2 3.2 3 3.5 3H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        )}
                    <span>{thesisCopied ? 'Copied' : 'Copy Thesis'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setExecutiveThesis(null)}
                  className="text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] p-1 rounded transition-colors cursor-pointer"
                  title="Dismiss thesis"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
            {isGeneratingThesis ? (
              <div className="py-4 flex items-center justify-center gap-2 text-xs font-mono text-[#8F8D88] dark:text-[#9A9893]">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <span>Synthesizing multi-scenario DSCR coverage, NOI margins, and municipal risks with Gemini...</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-[#111110] dark:text-[#F4F3EF] font-medium text-balance">
                {executiveThesis}
              </p>
            )}
          </div>
        )}
        {/* KPI Institutional Returns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-[#161615] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#73716B] block mb-0.5">
              Cash-on-Cash Return
            </span>
            <span className="font-mono tabular-nums text-2xl font-extrabold text-[#0B3B24] dark:text-[#34D399]">
              {metrics.cashOnCashReturn.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-[#666562] dark:text-[#A3A19B] block mt-1">
              Annualized Yield
            </span>
          </div>

          <div className="bg-white dark:bg-[#161615] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#73716B]">
                DSCR Ratio
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-1 rounded ${
                  metrics.dscrBadge === 'green'
                    ? 'bg-[#ECFDF5] text-[#065F46] dark:bg-[#065F46]/30 dark:text-[#34D399]'
                    : metrics.dscrBadge === 'amber'
                    ? 'bg-[#FFFBEB] text-[#92400E] dark:bg-[#92400E]/30 dark:text-[#FBBF24]'
                    : 'bg-[#FEF2F2] text-[#991B1B] dark:bg-[#991B1B]/30 dark:text-[#F87171]'
                }`}
              >
                {metrics.dscrBadge.toUpperCase()}
              </span>
            </div>
            <span
              className={`font-mono tabular-nums text-2xl font-extrabold ${
                metrics.dscrBadge === 'green'
                  ? 'text-[#0B3B24] dark:text-[#34D399]'
                  : metrics.dscrBadge === 'amber'
                  ? 'text-[#D97706] dark:text-[#FBBF24]'
                  : 'text-[#DC2626] dark:text-[#F87171]'
              }`}
            >
              {metrics.dscrRatio.toFixed(2)}x
            </span>
            <span className="text-[10px] font-mono text-[#666562] dark:text-[#A3A19B] block mt-1">
              Target &gt; 1.25x
            </span>
          </div>

          <div className="bg-white dark:bg-[#161615] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#73716B] block mb-0.5">
              Monthly Free Cash
            </span>
            <span className="font-mono tabular-nums text-2xl font-extrabold text-[#111110] dark:text-[#F4F3EF]">
              ${Math.round(metrics.netCashFlowMonthly).toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[#666562] dark:text-[#A3A19B] block mt-1">
              After All PITI &amp; Opex
            </span>
          </div>

          <div className="bg-white dark:bg-[#161615] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#73716B] block mb-0.5">
              Net Operating Income
            </span>
            <span className="font-mono tabular-nums text-2xl font-extrabold text-[#111110] dark:text-[#F4F3EF]">
              ${Math.round(metrics.noi).toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[#666562] dark:text-[#A3A19B] block mt-1">
              Cap: {metrics.capRate.toFixed(2)}%
            </span>
          </div>

          <div className="bg-white dark:bg-[#161615] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#73716B] block mb-0.5">
              Break-Even Occ.
            </span>
            <span className="font-mono tabular-nums text-2xl font-extrabold text-[#111110] dark:text-[#F4F3EF]">
              {metrics.breakEvenOccupancy.toFixed(0)}%
            </span>
            <span className="text-[10px] font-mono text-[#0B3B24] dark:text-[#34D399] block mt-1 font-semibold">
              +{(occupancy - metrics.breakEvenOccupancy).toFixed(0)}% Safety Cushion
            </span>
          </div>

          <div className="bg-white dark:bg-[#161615] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#73716B] block mb-0.5">
              Total Cash to Close
            </span>
            <span className="font-mono tabular-nums text-2xl font-extrabold text-[#111110] dark:text-[#F4F3EF]">
              ${Math.round(metrics.totalCashRequired).toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[#666562] dark:text-[#A3A19B] block mt-1">
              Down + Cls + Reserves
            </span>
          </div>
        </div>

        {/* Split Screen Layout: Left = Photos/Specs/Seasonality/Opex, Right = Sliders/Amortization/Sensitivity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Property Photo & Specs Card */}
            <div className="bg-white dark:bg-[#161615] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs space-y-4">
              <div className="relative h-52 rounded-lg overflow-hidden bg-[#EBEAE6] dark:bg-[#20201D]">
                <img
                  src={currentDeal.imageUrl}
                  alt={currentDeal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#111110]/90 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  MLS #{currentDeal.mlsNumber}
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      currentDeal.audit?.str_status === 'PERMITTED'
                        ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                        : currentDeal.audit?.str_status === 'CONDITIONAL'
                        ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                        : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                    }`}
                  >
                    HOA: {currentDeal.audit?.str_status || 'PERMITTED'}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-[#141413]/95 backdrop-blur-xs px-2.5 py-1 rounded border border-[#E5E4DF] dark:border-[#262624]">
                  <span className="font-mono font-bold text-sm text-[#111110] dark:text-[#F4F3EF]">
                    ${purchasePrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF]">
                  {currentDeal.title}
                </h3>
                <p className="text-xs font-mono text-[#666562] dark:text-[#A3A19B] mt-0.5">
                  {currentDeal.address}, {currentDeal.city}, {currentDeal.state} {currentDeal.zip}
                </p>
                <div className="flex items-center gap-3 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] font-semibold mt-3 pt-3 border-t border-[#E5E4DF] dark:border-[#262624]">
                  <span>{currentDeal.beds} Beds</span>
                  <span>•</span>
                  <span>{currentDeal.baths} Baths</span>
                  <span>•</span>
                  <span>{currentDeal.sqft.toLocaleString()} SqFt</span>
                  <span>•</span>
                  <span>Built {currentDeal.yearBuilt || 2021}</span>
                </div>
              </div>
            </div>

            {/* Submarket Seasonality Bar Chart */}
            <div className="bg-white dark:bg-[#161615] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#111110] dark:text-[#F4F3EF]">
                    Submarket Seasonality Curve
                  </h4>
                  <p className="text-[10px] font-mono text-[#8F8D88] dark:text-[#73716B]">
                    Historical Monthly Revenue Profile
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-[#ECFDF5] dark:bg-[#065F46]/30 text-[#065F46] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#059669]/40 px-2 py-0.5 rounded font-bold">
                  Peak: Oct ($15.4k)
                </span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonalityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                    <XAxis dataKey="name" stroke="#8F8D88" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis
                      stroke="#8F8D88"
                      tick={{ fontSize: 10, fontFamily: 'monospace' }}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#1C1C1A',
                        borderColor: '#2E2E2A',
                        color: '#F4F3EF',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#059669"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expandable Line-Item Operating Expense Stack */}
            <div className="bg-white dark:bg-[#161615] rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs overflow-hidden">
              <button
                onClick={() => setIsExpenseDrawerOpen(!isExpenseDrawerOpen)}
                className="w-full p-4 bg-[#FAF9F6] dark:bg-[#141413] flex items-center justify-between border-b border-[#E5E4DF] dark:border-[#262624] text-left cursor-pointer"
              >
                <div>
                  <span className="font-serif text-sm font-bold text-[#111110] dark:text-[#F4F3EF] block">
                    Operating Expense Stack
                  </span>
                  <span className="text-[10px] font-mono text-[#666562] dark:text-[#A3A19B]">
                    Total: ${Math.round(metrics.operatingExpenses).toLocaleString()}/yr (${Math.round(metrics.operatingExpenses / 12).toLocaleString()}/mo)
                  </span>
                </div>
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </button>

              {isExpenseDrawerOpen && (
                <div className="p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#666562] dark:text-[#A3A19B]">
                    <span>Property Taxes (Annual)</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${currentDeal.expenses.taxesAnnual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#666562] dark:text-[#A3A19B]">
                    <span>STR Hazard &amp; Liability Insurance</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${currentDeal.expenses.insuranceAnnual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#666562] dark:text-[#A3A19B]">
                    <span>Utilities &amp; Electric (Annual)</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${(currentDeal.expenses.utilitiesMonthly * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#666562] dark:text-[#A3A19B]">
                    <span>High-Speed Wifi &amp; Tech Stack</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${(currentDeal.expenses.wifiMonthly * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#666562] dark:text-[#A3A19B]">
                    <span>HOA Assessments (Annual)</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${(currentDeal.expenses.hoaFeeMonthly * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#666562] dark:text-[#A3A19B]">
                    <span>Airbnb 3% Host Booking Cut</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${Math.round(metrics.grossAnnualRevenue * 0.03).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#666562] dark:text-[#A3A19B]">
                    <span>Property Management Fee ({managementFeePct}%)</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${Math.round(metrics.grossAnnualRevenue * (managementFeePct / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#666562] dark:text-[#A3A19B]">
                    <span>Capex &amp; Maintenance Reserve (5%)</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${Math.round(metrics.grossAnnualRevenue * 0.05).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Financing & Scrub Sliders */}
            <div className="bg-white dark:bg-[#161615] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624]">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF]">
                    Debt Structure &amp; Scrub Sliders
                  </h3>
                  <p className="text-xs text-[#8F8D88] dark:text-[#73716B]">
                    Adjust loan mechanisms and revenue drivers in real time
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#059669] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#065F46]/30 border border-[#A7F3D0] dark:border-[#059669]/40 px-2 py-0.5 rounded font-bold">
                  DSCR: {metrics.dscrRatio.toFixed(2)}x
                </span>
              </div>

              {/* Debt Structure Switcher */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#73716B] block mb-1.5">
                  Financing Strategy
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#FAF9F6] dark:bg-[#1F1F1D] p-1 rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2A]">
                  {[
                    { id: 'dscr', label: 'DSCR Loan' },
                    { id: 'conventional', label: 'Conventional' },
                    { id: 'seller_carry', label: 'Seller Finance' },
                    { id: 'subject_to', label: 'Subject-To Wrap' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStrategy(s.id as FinancingType)}
                      className={`py-1.5 px-2 rounded text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                        strategy === s.id
                          ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] shadow-2xs'
                          : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creative Financing Specific Sliders if Seller Finance is chosen */}
              {strategy === 'seller_carry' && (
                <div className="p-3 bg-[#FEF3C7]/40 dark:bg-[#92400E]/20 border border-[#D97706]/30 rounded-lg grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-[#92400E] dark:text-[#FBBF24] uppercase block mb-1">
                      Interest-Only: <span className="font-bold">{interestOnlyYears} Yrs</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={interestOnlyYears}
                      onChange={(e) => setInterestOnlyYears(Number(e.target.value))}
                      className="w-full accent-[#D97706]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#92400E] dark:text-[#FBBF24] uppercase block mb-1">
                      Balloon Maturity: <span className="font-bold">{balloonYears} Yrs</span>
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      value={balloonYears}
                      onChange={(e) => setBalloonYears(Number(e.target.value))}
                      className="w-full accent-[#D97706]"
                    />
                  </div>
                </div>
              )}

              {/* Purchase Price & Down Payment Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#8F8D88] dark:text-[#73716B] uppercase">Purchase Price</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">
                      ${purchasePrice.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300000"
                    max="2000000"
                    step="10000"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full accent-[#111110] dark:accent-[#F4F3EF]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#8F8D88] dark:text-[#73716B] uppercase">Down Payment</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">
                      {downPaymentPct}% (${Math.round(purchasePrice * (downPaymentPct / 100)).toLocaleString()})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full accent-[#111110] dark:accent-[#F4F3EF]"
                  />
                </div>
              </div>

              {/* Interest Rate & Management Fee Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#8F8D88] dark:text-[#73716B] uppercase">Interest Rate</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">{interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="10.5"
                    step="0.125"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-[#111110] dark:accent-[#F4F3EF]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#8F8D88] dark:text-[#73716B] uppercase">PM Co-Host Cut</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">{managementFeePct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={managementFeePct}
                    onChange={(e) => setManagementFeePct(Number(e.target.value))}
                    className="w-full accent-[#111110] dark:accent-[#F4F3EF]"
                  />
                </div>
              </div>

              {/* Revenue Sliders: ADR and Occupancy */}
              <div className="pt-4 border-t border-[#E5E4DF] dark:border-[#262624] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#8F8D88] dark:text-[#73716B] uppercase">Average Daily Rate</span>
                    <span className="font-bold text-[#059669] dark:text-[#34D399]">${adr} / nt</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1200"
                    step="10"
                    value={adr}
                    onChange={(e) => setAdr(Number(e.target.value))}
                    className="w-full accent-[#059669]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#8F8D88] dark:text-[#73716B] uppercase">Annual Occupancy</span>
                    <span className="font-bold text-[#059669] dark:text-[#34D399]">{occupancy}%</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="90"
                    step="1"
                    value={occupancy}
                    onChange={(e) => setOccupancy(Number(e.target.value))}
                    className="w-full accent-[#059669]"
                  />
                </div>
              </div>
            </div>

            {/* 10-Year Equity & Debt Amortization Curve */}
            <div className="bg-white dark:bg-[#161615] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF]">
                    10-Year Equity &amp; Debt Amortization Curve
                  </h3>
                  <p className="text-xs text-[#8F8D88] dark:text-[#73716B]">
                    Principal paydown + conservative 3% annual market appreciation
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                    <span>Equity Built</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                    <span>Remaining Loan</span>
                  </span>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={amortizationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={equityGradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id={balanceGradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                    <XAxis dataKey="year" stroke="#8F8D88" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis
                      stroke="#8F8D88"
                      tick={{ fontSize: 11, fontFamily: 'monospace' }}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                      contentStyle={{
                        backgroundColor: '#1C1C1A',
                        borderColor: '#2E2E2A',
                        color: '#F4F3EF',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="propertyEquity"
                      name="Equity"
                      stroke="#059669"
                      fillOpacity={1}
                      fill={`url(#${equityGradId})`}
                    />
                    <Area
                      type="monotone"
                      dataKey="loanBalance"
                      name="Loan Balance"
                      stroke="#D97706"
                      fillOpacity={1}
                      fill={`url(#${balanceGradId})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Waterfall Bar Chart */}
            <div className="bg-white dark:bg-[#161615] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
              <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF] mb-1">
                Monthly Net Cash Flow Waterfall
              </h3>
              <p className="text-xs text-[#8F8D88] dark:text-[#73716B] mb-4">
                Gross rent versus operating expense stack and institutional debt service
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                    <XAxis dataKey="name" stroke="#8F8D88" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis
                      stroke="#8F8D88"
                      tick={{ fontSize: 11, fontFamily: 'monospace' }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`$${Math.abs(Number(val)).toLocaleString()}`, '']}
                      contentStyle={{
                        backgroundColor: '#1C1C1A',
                        borderColor: '#2E2E2A',
                        color: '#F4F3EF',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Sensitivity Stress Test Matrix */}
            <div className="bg-white dark:bg-[#161615] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF]">
                  Live Sensitivity Matrix (CoC Yield vs ADR &amp; Occupancy)
                </h3>
                <span className="text-[10px] font-mono text-[#059669] dark:text-[#34D399] font-bold">
                  BASE: {metrics.cashOnCashReturn.toFixed(1)}% CoC
                </span>
              </div>
              <p className="text-xs text-[#8F8D88] dark:text-[#73716B] mb-4">
                Stress-test cash returns across potential market demand and rate compressions.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F6] dark:bg-[#141413]">
                      <th className="py-2 px-3 text-left font-bold text-[#8F8D88] dark:text-[#73716B]">
                        ADR \ Occ
                      </th>
                      {occDeltas.map((occD) => (
                        <th key={occD} className="py-2 px-3 font-bold text-[#111110] dark:text-[#F4F3EF]">
                          {(occupancy * (1 + occD / 100)).toFixed(0)}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E4DF] dark:divide-[#262624]">
                    {adrDeltas.map((adrD) => {
                      const testAdr = Math.round(adr * (1 + adrD / 100));
                      return (
                        <tr key={adrD}>
                          <td className="py-2.5 px-3 text-left font-semibold text-[#111110] dark:text-[#F4F3EF] bg-[#FAF9F6] dark:bg-[#141413]">
                            ${testAdr} ({adrD > 0 ? `+${adrD}` : adrD}%)
                          </td>
                          {occDeltas.map((occD) => {
                            const testOcc = Math.round(occupancy * (1 + occD / 100));
                            const testMetrics = calculateUnderwriteMetrics(currentDeal, {
                              purchasePrice,
                              adr: testAdr,
                              occupancy: testOcc,
                              financing: { strategy, downPaymentPct, interestRate },
                            });
                            const coc = testMetrics.cashOnCashReturn;

                            return (
                              <td
                                key={occD}
                                className={`py-2.5 px-3 font-bold ${
                                  coc >= 20
                                    ? 'bg-[#ECFDF5] text-[#0B3B24] dark:bg-[#065F46]/30 dark:text-[#34D399]'
                                    : coc >= 14
                                    ? 'bg-[#F0FDF4] text-[#15803D] dark:bg-[#15803D]/25 dark:text-[#4ADE80]'
                                    : coc >= 9
                                    ? 'bg-[#FFFBEB] text-[#B45309] dark:bg-[#92400E]/25 dark:text-[#FBBF24]'
                                    : 'bg-[#FEF2F2] text-[#DC2626] dark:bg-[#991B1B]/25 dark:text-[#F87171]'
                                }`}
                              >
                                {coc.toFixed(1)}%
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
