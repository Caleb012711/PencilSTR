import React, { useState, useMemo } from 'react';
import { FinancingType, PropertyDeal } from '../types';
import { calculateMonthlyMortgage, computeUnderwriting, formatCurrency, formatPercent } from '../utils/calculator';

interface UnderwriterStudioProps {
  currentDeal: PropertyDeal;
  allDeals: PropertyDeal[];
  onSelectDeal: (deal: PropertyDeal) => void;
  onOpenLenderMemo: () => void;
  onSaveDeal: (deal: PropertyDeal) => void;
  isSaved: boolean;
}

export const UnderwriterStudio: React.FC<UnderwriterStudioProps> = ({
  currentDeal,
  allDeals,
  onSelectDeal,
  onOpenLenderMemo,
  onSaveDeal,
  isSaved,
}) => {
  const [strategy, setStrategy] = useState<FinancingType>('dscr');

  // Input states
  const [purchasePrice, setPurchasePrice] = useState<number>(currentDeal.price);
  const [adr, setAdr] = useState<number>(currentDeal.baseAdr);
  const [occupancy, setOccupancy] = useState<number>(currentDeal.baseOccupancy);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(
    currentDeal.financingPreset.dscr.downPaymentPercent
  );
  const [interestRate, setInterestRate] = useState<number>(
    currentDeal.financingPreset.dscr.interestRate
  );
  const [managementFeeRate, setManagementFeeRate] = useState<number>(
    currentDeal.expenses.managementFeeRate * 100
  );
  const [renovationBudget, setRenovationBudget] = useState<number>(0);

  // Executive summary AI thesis state
  const [executiveThesis, setExecutiveThesis] = useState<string | null>(null);
  const [isGeneratingThesis, setIsGeneratingThesis] = useState(false);
  const [thesisCopied, setThesisCopied] = useState(false);

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
  const [relinquishedSalePrice, setRelinquishedSalePrice] = useState<number>(550000);
  const [relinquishedDebtPayoff, setRelinquishedDebtPayoff] = useState<number>(220000);

  const handleGenerateExecutiveThesis = async () => {
    setIsGeneratingThesis(true);
    try {
      const res = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal: {
            title: adjustedDeal.title,
            location: adjustedDeal.location,
            price: adjustedDeal.price,
            baseAdr: adr,
            baseOccupancy: occupancy,
            breakEvenOccupancy: currentDeal.breakEvenOccupancy,
            hoaStatus: currentDeal.hoaStatus,
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

  // Update when currentDeal changes
  React.useEffect(() => {
    setPurchasePrice(currentDeal.price);
    setAdr(currentDeal.baseAdr);
    setOccupancy(currentDeal.baseOccupancy);
    const preset = currentDeal.financingPreset[strategy];
    setDownPaymentPct(preset.downPaymentPercent);
    setInterestRate(preset.interestRate);
    setManagementFeeRate(currentDeal.expenses.managementFeeRate * 100);
  }, [currentDeal, strategy]);

  // Handle strategy switch
  const handleStrategyChange = (newStrategy: FinancingType) => {
    setStrategy(newStrategy);
    const preset = currentDeal.financingPreset[newStrategy];
    setDownPaymentPct(preset.downPaymentPercent);
    setInterestRate(preset.interestRate);
  };

  // Build adjusted deal object for calculation
  const adjustedDeal: PropertyDeal = useMemo(() => {
    return {
      ...currentDeal,
      price: purchasePrice + renovationBudget,
      expenses: {
        ...currentDeal.expenses,
        managementFeeRate: managementFeeRate / 100,
      }
    };
  }, [currentDeal, purchasePrice, renovationBudget, managementFeeRate]);

  // Live metrics
  const metrics = useMemo(() => {
    return computeUnderwriting(
      adjustedDeal,
      adr,
      occupancy,
      strategy,
      downPaymentPct,
      interestRate
    );
  }, [adjustedDeal, adr, occupancy, strategy, downPaymentPct, interestRate]);

  // Sensitivity Matrix calculations
  const adrMultipliers = [-0.15, -0.075, 0, 0.075, 0.15];
  const occVariations = [occupancy - 10, occupancy - 5, occupancy, occupancy + 5, occupancy + 10];

  const loanAmount = adjustedDeal.price * (1 - downPaymentPct / 100);
  const downPaymentDollars = adjustedDeal.price * (downPaymentPct / 100);

  // Cost Segregation calculations
  const buildingBasis = purchasePrice * 0.8;
  const personalPropertyValue = buildingBasis * (personalPropertyRatio / 100);
  const firstYearBonusDepreciation = personalPropertyValue;
  const estimatedCashTaxShield = firstYearBonusDepreciation * (investorTaxBracket / 100);
  const netEffectivePurchasePrice = purchasePrice - estimatedCashTaxShield;

  // Apply DSCR preset
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

  const handleExportProFormaCsv = () => {
    const rows = [
      ['PENCILSTR STUDIO FINANCIAL PRO FORMA', ''],
      ['Property', currentDeal.title],
      ['Location', currentDeal.location],
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
      ['Break-Even Occupancy', `${currentDeal.breakEvenOccupancy}%`],
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

  return (
    <div className="w-full max-w-[1360px] mx-auto px-6 md:px-10 py-10 text-[#111110] dark:text-[#F4F3EF] transition-colors duration-200">
      {/* Top Header & Property Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5E4DF] dark:border-[#262624]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans font-semibold text-[#0B3B24] dark:text-[#34D399] uppercase tracking-wider">
              Financial Architecture
            </span>
            <span className="text-xs font-mono text-[#8F8D88] dark:text-[#9A9893]">· MLS #{currentDeal.mlsNumber}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#111110] dark:text-[#F4F3EF]">
            {currentDeal.title}
          </h1>
          <p className="text-sm font-mono text-[#666562] dark:text-[#9A9893] mt-1">
            {currentDeal.location} · {currentDeal.beds} Bed / {currentDeal.baths} Bath · {currentDeal.sqft.toLocaleString()} sqft
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Select another deal */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8F8D88] dark:text-[#7A7874] hidden sm:inline">Cohort:</span>
            <select
              value={currentDeal.id}
              onChange={(e) => {
                const target = allDeals.find(d => d.id === e.target.value);
                if (target) onSelectDeal(target);
              }}
              className="bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded px-3 py-2 text-xs font-mono font-semibold text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] cursor-pointer"
            >
              {allDeals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.location})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateExecutiveThesis}
            disabled={isGeneratingThesis}
            className="px-3.5 py-2 rounded bg-white dark:bg-[#1E1E1C] border border-[#D97706]/40 text-[#92400E] dark:text-[#FBBF24] hover:bg-[#FEF3C7]/40 dark:hover:bg-[#92400E]/20 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Analyze deal data with Gemini and generate an investment thesis"
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
            onClick={() => onSaveDeal(currentDeal)}
            className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isSaved
                ? 'bg-[#0B3B24] text-white'
                : 'bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F9F8F5] dark:hover:bg-[#252522]'
            }`}
          >
            {isSaved ? (
      <svg className="w-4 h-4 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2.5H12C12.5 2.5 13 3 13 3.5V14L8 11.5L3 14V3.5C3 3 3.5 2.5 4 2.5Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 7L7.5 8.5L10 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    ) : (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2.5H12C12.5 2.5 13 3 13 3.5V14L8 11.5L3 14V3.5C3 3 3.5 2.5 4 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )}
            <span>{isSaved ? 'In Pipeline' : 'Save Deal'}</span>
          </button>

          <button
            onClick={onOpenLenderMemo}
            className="px-4 py-2 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-mono font-bold uppercase tracking-wider hover:bg-black dark:hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 2.5H9.5L12.5 5.5V13.5H3.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 2.5V5.5H12.5M6 8H10M6 10.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span>Lender Memo (PDF)</span>
          </button>
        </div>
      </div>

      {/* Helpful Features Dropbar */}
      <div className="mb-6 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#262624] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#111110] dark:text-[#F4F3EF]">
            <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M6 10L10 6M9 6L10 7M7 10L6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span className="font-bold uppercase tracking-wider text-[11px]">Helpful Features:</span>
          </div>

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
              className="px-2.5 py-1 rounded-md text-[11px] font-sans bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-all cursor-pointer"
              title="Download Pro Forma CSV"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#666562] dark:text-[#A3A19B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
          <span>Studio Active</span>
        </div>
      </div>

      {/* Helpful Feature Interactive Panels */}
      {activeHelpfulFeature !== 'none' && (
        <div className="mb-8 rounded-xl bg-[#F2EFE9] dark:bg-[#1B1B18] border border-[#E5E4DF] dark:border-[#2A2926] p-5 animate-in fade-in duration-150">
          {activeHelpfulFeature === 'cost_seg' && (
            <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6.5L8 2.5L14 6.5M3 13.5H13M4 6.5V11.5M7 6.5V11.5M10 6.5V11.5M13 6.5V11.5M2 13.5V14.5H14V13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
                Under Treasury Reg. § 1.469-1T(e)(3)(ii)(A), short-term rentals with average guest stay &le; 7 days are active trade or business. Material participation allows immediate 100% bonus depreciation on 5-year property to offset W-2 or active income.
              </p>
            </div>
          )}

          {activeHelpfulFeature === 'dscr_presets' && (
            <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7H14M6 10H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { ratio: 1.20, label: '1.20x Private Credit', tag: 'Aggressive Debt' },
                  { ratio: 1.25, label: '1.25x Agency Target', tag: 'Standard Institutional' },
                  { ratio: 1.35, label: '1.35x Tier-1 Fund', tag: 'Conservative Buffer' },
                  { ratio: 1.50, label: '1.50x Fortress Bank', tag: 'High-Yield Equity' },
                ].map((preset) => (
                  <div
                    key={preset.ratio}
                    className="p-3.5 rounded-xl border bg-[#FAF9F6] dark:bg-[#1A1A18] border-[#E5E4DF] dark:border-[#262624]"
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
                      Calibrates loan balance so annual debt service equals NOI ÷ {preset.ratio}x.
                    </p>
                    <button
                      onClick={() => applyDscrPreset(preset.ratio)}
                      className="w-full py-1.5 rounded-lg bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shadow-2xs"
                    >
                      Apply {preset.ratio}x Ratio
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeHelpfulFeature === 'rate_shock' && (
            <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 11.5L6.5 7.5L9.5 10.5L13.5 4.5M13.5 4.5H9.5M13.5 4.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

          {activeHelpfulFeature === 'exchange_1031' && (
            <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5.5H13.5M13.5 5.5L10.5 2.5M13.5 10.5H2.5M2.5 10.5L5.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

          {activeHelpfulFeature === 'break_even' && (
            <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L13.5 4.5V8.5C13.5 11.8 11.2 13.8 8 14.5C4.8 13.8 2.5 11.8 2.5 8.5V4.5L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 8.5L7.2 10.2L10.5 6.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
                    {currentDeal.breakEvenOccupancy}%
                  </span>
                  <span className="text-xs text-[#8F8D88] block mt-1">
                    {Math.round((365 * currentDeal.breakEvenOccupancy) / 100 / 12)} nights / month required
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
                    +{(occupancy - currentDeal.breakEvenOccupancy).toFixed(1)}%
                  </span>
                  <span className="text-xs text-[#065F46]/80 dark:text-[#34D399]/80 block mt-1">
                    +{Math.round((365 * (occupancy - currentDeal.breakEvenOccupancy)) / 100 / 12)} extra nights of debt cushion
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeHelpfulFeature === 'sensitivity' && (
            <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 6.5H13.5M2.5 10.5H13.5M6.5 2.5V13.5M10.5 2.5V13.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF]">
                    Sensitivity Matrix: Cash-on-Cash Return Across ADR &amp; Occupancy
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
                      {occVariations.map((occ) => (
                        <th key={occ} className="py-2 text-center">
                          {occ}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adrMultipliers.map((mult) => {
                      const simAdr = Math.round(adr * (1 + mult));
                      return (
                        <tr key={mult} className="border-b border-[#E5E4DF]/50 dark:border-[#262624]/50">
                          <td className="py-2 font-bold text-[#111110] dark:text-[#F4F3EF]">
                            ${simAdr}/nt {mult === 0 && <span className="text-[#D97706]">(Base)</span>}
                          </td>
                          {occVariations.map((occ) => {
                            const simRev = simAdr * 365 * (occ / 100);
                            const simOpex = metrics.operatingExpenses;
                            const simNoi = simRev - simOpex;
                            const simDebt = metrics.annualDebtService;
                            const simCash = simNoi - simDebt;
                            const simCoc = downPaymentDollars > 0 ? (simCash / downPaymentDollars) * 100 : 0;
                            const isBase = mult === 0 && occ === occupancy;

                            return (
                              <td
                                key={occ}
                                className={`py-2 text-center rounded transition-colors ${
                                  isBase
                                    ? 'bg-[#FEF3C7] dark:bg-[#78350F]/40 font-bold border border-[#D97706]'
                                    : simCoc >= 12
                                    ? 'text-[#065F46] dark:text-[#34D399]'
                                    : 'text-[#991B1B] dark:text-[#F87171]'
                                }`}
                              >
                                {simCoc.toFixed(1)}%
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
        </div>
      )}

      {/* Gemini AI Executive Summary Thesis Callout */}
      {(isGeneratingThesis || executiveThesis) && (
        <div className="mb-8 p-5 rounded-xl border border-[#D97706]/30 bg-gradient-to-r from-[#FEF3C7]/30 via-white to-[#FAF9F6] dark:from-[#92400E]/15 dark:via-[#161615] dark:to-[#121211] shadow-sm transition-all duration-300">
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
      <svg className="w-3 h-3 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) : (
      <svg className="w-3 h-3 text-[#78716C]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 11V3.5C3 3.2 3.2 3 3.5 3H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
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
              <svg className="w-4.5 h-4.5 animate-spin text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11 11 13.5 8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C10 2.5 12 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Synthesizing multi-scenario DSCR coverage, NOI margins, and municipal risks with Gemini...</span>
            </div>
          ) : (
            <p className="text-xs sm:text-sm font-sans leading-relaxed text-[#111110] dark:text-[#F4F3EF] font-medium text-balance">
              {executiveThesis}
            </p>
          )}
        </div>
      )}

      {/* Main Grid: Inputs + Pro Forma Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Underwriting Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Strategy Tabs */}
          <div className="bg-white dark:bg-[#141413] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
            <span className="text-[11px] font-mono font-bold text-[#666562] dark:text-[#9A9893] uppercase tracking-wider block mb-2">
              Debt Structure &amp; Underwriting Model
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F9F8F5] dark:bg-[#1A1A18] rounded-lg border border-[#E5E4DF] dark:border-[#262624] text-xs font-mono">
              <button
                type="button"
                onClick={() => handleStrategyChange('dscr')}
                className={`py-2 rounded font-medium transition-all cursor-pointer ${
                  strategy === 'dscr'
                    ? 'bg-white dark:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] font-bold shadow-sm border border-[#E5E4DF] dark:border-[#2E2E2B]'
                    : 'text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                }`}
              >
                DSCR Loan
              </button>
              <button
                type="button"
                onClick={() => handleStrategyChange('conventional')}
                className={`py-2 rounded font-medium transition-all cursor-pointer ${
                  strategy === 'conventional'
                    ? 'bg-white dark:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] font-bold shadow-sm border border-[#E5E4DF] dark:border-[#2E2E2B]'
                    : 'text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                }`}
              >
                Conventional
              </button>
              <button
                type="button"
                onClick={() => handleStrategyChange('seller_carry')}
                className={`py-2 rounded font-medium transition-all cursor-pointer ${
                  strategy === 'seller_carry'
                    ? 'bg-white dark:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] font-bold shadow-sm border border-[#E5E4DF] dark:border-[#2E2E2B]'
                    : 'text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                }`}
              >
                Seller Carry
              </button>
            </div>
            <p className="text-[11px] font-mono text-[#8F8D88] dark:text-[#7A7874] mt-3">
              {strategy === 'dscr' && 'Underwritten strictly on property cash flow without W2 or personal income verification.'}
              {strategy === 'conventional' && 'Standard agency conforming 30-year fixed loan requiring full borrower tax returns.'}
              {strategy === 'seller_carry' && 'Custom seller-financed loan structure with balloon period and negotiated terms.'}
            </p>
          </div>

          {/* Acquisition & Capital Stack Parameters */}
          <div className="bg-white dark:bg-[#141413] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm space-y-4">
            <span className="text-[11px] font-mono font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider block border-b border-[#E5E4DF] dark:border-[#262624] pb-2">
              Capital Stack &amp; Acquisition Inputs
            </span>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#666562] dark:text-[#9A9893]">Purchase Contract Price</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{formatCurrency(purchasePrice)}</span>
              </div>
              <input
                type="range"
                min={300000}
                max={1500000}
                step={5000}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full accent-[#111110] dark:accent-[#F4F3EF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#666562] dark:text-[#9A9893]">Renovation &amp; Furnishing CapEx</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{formatCurrency(renovationBudget)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100000}
                step={2500}
                value={renovationBudget}
                onChange={(e) => setRenovationBudget(Number(e.target.value))}
                className="w-full accent-[#111110] dark:accent-[#F4F3EF] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-mono text-[#666562] dark:text-[#9A9893] block mb-1">Down Payment %</label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    max={50}
                    step={1}
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full bg-[#F9F8F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded px-3 py-1.5 text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110]"
                  />
                  <span className="absolute right-3 top-1.5 text-xs font-mono text-[#8F8D88] dark:text-[#7A7874]">%</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#666562] dark:text-[#9A9893] block mb-1">Interest Rate %</label>
                <div className="relative">
                  <input
                    type="number"
                    min={4.0}
                    max={12.0}
                    step={0.05}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-[#F9F8F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded px-3 py-1.5 text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110]"
                  />
                  <span className="absolute right-3 top-1.5 text-xs font-mono text-[#8F8D88] dark:text-[#7A7874]">%</span>
                </div>
              </div>
            </div>

            {/* Capital Stack Visual Bar */}
            <div className="pt-3 border-t border-[#E5E4DF] dark:border-[#262624]">
              <div className="flex justify-between text-[11px] font-mono mb-1.5">
                <span className="text-[#8F8D88] dark:text-[#9A9893] uppercase">Capital Stack Distribution</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{formatCurrency(metrics.totalCashRequired)} Total Cash Needed</span>
              </div>
              <div className="w-full h-3 rounded-full flex overflow-hidden border border-[#E5E4DF] dark:border-[#262624]">
                <div
                  className="bg-[#111110] dark:bg-[#F4F3EF] h-full transition-all"
                  style={{ width: `${100 - downPaymentPct}%` }}
                  title={`Loan Principal: ${formatCurrency(loanAmount)}`}
                ></div>
                <div
                  className="bg-[#D97706] h-full transition-all"
                  style={{ width: `${downPaymentPct * 0.8}%` }}
                  title={`Down Payment: ${formatCurrency(downPaymentDollars)}`}
                ></div>
                <div
                  className="bg-[#059669] h-full transition-all"
                  style={{ width: `${downPaymentPct * 0.2}%` }}
                  title="Reserves & Closing Costs"
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#666562] dark:text-[#9A9893] mt-1.5">
                <span>Principal: {formatCurrency(loanAmount)}</span>
                <span>Down: {formatCurrency(downPaymentDollars)}</span>
                <span>Reserves: {formatCurrency(currentDeal.capitalStack.reserves)}</span>
              </div>
            </div>
          </div>

          {/* Operational STR Drivers */}
          <div className="bg-white dark:bg-[#141413] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm space-y-4">
            <span className="text-[11px] font-mono font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider block border-b border-[#E5E4DF] dark:border-[#262624] pb-2">
              Operational STR Drivers
            </span>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#666562] dark:text-[#9A9893]">Average Daily Rate (ADR)</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">${adr} / night</span>
              </div>
              <input
                type="range"
                min={250}
                max={900}
                step={5}
                value={adr}
                onChange={(e) => setAdr(Number(e.target.value))}
                className="w-full accent-[#111110] dark:accent-[#F4F3EF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#666562] dark:text-[#9A9893]">Annualized Occupancy</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{occupancy}%</span>
              </div>
              <input
                type="range"
                min={35}
                max={90}
                step={1}
                value={occupancy}
                onChange={(e) => setOccupancy(Number(e.target.value))}
                className="w-full accent-[#D97706] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#666562] dark:text-[#9A9893]">Management Fee (Co-host / Self)</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{managementFeeRate}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={1}
                value={managementFeeRate}
                onChange={(e) => setManagementFeeRate(Number(e.target.value))}
                className="w-full accent-[#059669] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] mt-1">
                <span>0% (Self-Managed)</span>
                <span>15% (Co-Host Standard)</span>
                <span>25% (Full-Service Turnkey)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pro Forma Income Statement & Returns (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Return Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-[#141413] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#9A9893] block">
                Cash on Cash
              </span>
              <div className="text-2xl font-mono font-extrabold text-[#0B3B24] dark:text-[#34D399] tracking-tight mt-1 tabular-nums">
                {formatPercent(metrics.cashOnCashReturn)}
              </div>
              <span className="text-[10px] font-mono text-[#059669] dark:text-[#34D399] block mt-0.5">Annualized ROI</span>
            </div>

            <div className="bg-white dark:bg-[#141413] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#9A9893] block">
                DSCR Ratio
              </span>
              <div className="text-2xl font-mono font-extrabold text-[#111110] dark:text-[#F4F3EF] tracking-tight mt-1 tabular-nums">
                {metrics.dscrRatio.toFixed(2)}x
              </div>
              <span className={`text-[10px] font-mono block mt-0.5 ${metrics.dscrRatio >= 1.25 ? 'text-[#059669] dark:text-[#34D399]' : 'text-[#D97706] dark:text-[#FBBF24]'}`}>
                {metrics.dscrRatio >= 1.25 ? 'Meets 1.25x Min' : 'Below 1.25x Min'}
              </span>
            </div>

            <div className="bg-white dark:bg-[#141413] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#9A9893] block">
                Cap Rate
              </span>
              <div className="text-2xl font-mono font-extrabold text-[#111110] dark:text-[#F4F3EF] tracking-tight mt-1 tabular-nums">
                {formatPercent(metrics.capRate)}
              </div>
              <span className="text-[10px] font-mono text-[#666562] dark:text-[#9A9893] block mt-0.5">Unlevered Yield</span>
            </div>

            <div className="bg-white dark:bg-[#141413] p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#9A9893] block">
                Monthly Net
              </span>
              <div className="text-2xl font-mono font-extrabold text-[#111110] dark:text-[#F4F3EF] tracking-tight mt-1 tabular-nums">
                {metrics.netCashFlowMonthly >= 0 ? '+' : ''}{formatCurrency(metrics.netCashFlowMonthly)}
              </div>
              <span className="text-[10px] font-mono text-[#0B3B24] dark:text-[#34D399] block mt-0.5 font-bold tabular-nums">
                {formatCurrency(metrics.netCashFlowAnnual)} /yr
              </span>
            </div>
          </div>

          {/* Pro Forma Ledger Table */}
          <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F9F8F5] dark:bg-[#1A1A18] border-b border-[#E5E4DF] dark:border-[#262624] flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider">
                Full Pro Forma Ledger (Year 1)
              </span>
              <span className="text-[#8F8D88] dark:text-[#9A9893]">Tabular Figures (USD)</span>
            </div>

            <div className="divide-y divide-[#E5E4DF] dark:divide-[#262624] text-xs font-mono">
              {/* REVENUE SECTION */}
              <div className="p-3 bg-[#F9F8F5]/40 dark:bg-[#1A1A18]/40 font-bold text-[#666562] dark:text-[#9A9893] uppercase text-[10px] tracking-wider">
                Operating Revenue
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#111110] dark:text-[#F4F3EF]">Gross Rental Revenue ({Math.round(365 * (occupancy/100))} nights @ ${adr})</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{formatCurrency(metrics.grossAnnualRevenue)}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#111110] dark:text-[#F4F3EF]">Guest Cleaning Fees Collected (Pass-Through)</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{formatCurrency(metrics.cleaningRevenue)}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center bg-[#E8F5EE]/40 dark:bg-[#064E3B]/30 font-bold">
                <span className="text-[#0B3B24] dark:text-[#34D399]">Gross Potential Revenue (GPI)</span>
                <span className="text-[#0B3B24] dark:text-[#34D399] tabular-nums">{formatCurrency(metrics.totalRevenue)}</span>
              </div>

              {/* EXPENSES SECTION */}
              <div className="p-3 bg-[#F9F8F5]/40 dark:bg-[#1A1A18]/40 font-bold text-[#666562] dark:text-[#9A9893] uppercase text-[10px] tracking-wider">
                Operating Expenses
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#666562] dark:text-[#9A9893]">OTA Platform Fees (Airbnb / VRBO 3%)</span>
                <span className="text-[#111110] dark:text-[#F4F3EF] tabular-nums">-{formatCurrency(metrics.grossAnnualRevenue * 0.03)}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#666562] dark:text-[#9A9893]">Property Management Fee ({managementFeeRate}%)</span>
                <span className="text-[#111110] dark:text-[#F4F3EF] tabular-nums">-{formatCurrency(metrics.grossAnnualRevenue * (managementFeeRate / 100))}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#666562] dark:text-[#9A9893]">Cleaning Turnover Expense</span>
                <span className="text-[#111110] dark:text-[#F4F3EF] tabular-nums">-{formatCurrency(metrics.cleaningRevenue)}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#666562] dark:text-[#9A9893]">Property Taxes (Annual)</span>
                <span className="text-[#111110] dark:text-[#F4F3EF] tabular-nums">-{formatCurrency(currentDeal.expenses.propertyTaxesAnnual)}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#666562] dark:text-[#9A9893]">Commercial STR &amp; Hazard Insurance</span>
                <span className="text-[#111110] dark:text-[#F4F3EF] tabular-nums">-{formatCurrency(currentDeal.expenses.insuranceAnnual)}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#666562] dark:text-[#9A9893]">Utilities, High-Speed WiFi, Hot Tub Service</span>
                <span className="text-[#111110] dark:text-[#F4F3EF] tabular-nums">-{formatCurrency(currentDeal.expenses.utilitiesMonthly * 12)}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#666562] dark:text-[#9A9893]">Maintenance Reserve &amp; CapEx (5%)</span>
                <span className="text-[#111110] dark:text-[#F4F3EF] tabular-nums">-{formatCurrency(metrics.grossAnnualRevenue * 0.05)}</span>
              </div>
              <div className="px-5 py-2.5 flex justify-between items-center bg-[#FEF3C7]/40 dark:bg-[#78350F]/30 font-bold">
                <span className="text-[#92400E] dark:text-[#FDE68A]">Total Operating Expenses</span>
                <span className="text-[#92400E] dark:text-[#FDE68A] tabular-nums">-{formatCurrency(metrics.operatingExpenses)}</span>
              </div>

              {/* NET OPERATING INCOME */}
              <div className="px-5 py-3 flex justify-between items-center bg-[#F9F8F5] dark:bg-[#1A1A18] font-extrabold text-sm border-t-2 border-[#E5E4DF] dark:border-[#262624]">
                <span className="text-[#111110] dark:text-[#F4F3EF]">Net Operating Income (NOI)</span>
                <span className="text-[#0B3B24] dark:text-[#34D399] tabular-nums text-base">{formatCurrency(metrics.noi)}</span>
              </div>

              {/* DEBT SERVICE */}
              <div className="px-5 py-2.5 flex justify-between items-center hover:bg-[#F9F8F5]/60 dark:hover:bg-[#1A1A18]/60">
                <span className="text-[#666562] dark:text-[#9A9893]">Annual Principal &amp; Interest ({interestRate}% Fixed)</span>
                <span className="text-[#111110] dark:text-[#F4F3EF] font-bold tabular-nums">-{formatCurrency(metrics.annualDebtService)}</span>
              </div>

              {/* BOTTOM LINE */}
              <div className="px-5 py-4 flex justify-between items-center bg-[#111110] dark:bg-[#20201D] text-white font-extrabold text-sm rounded-b-xl">
                <div>
                  <span className="block uppercase tracking-wider text-[11px] text-[#FEF3C7] dark:text-[#FDE68A]">Levered Cash Flow Before Tax</span>
                  <span className="text-xs font-normal text-neutral-300">Monthly P&amp;I: {formatCurrency(metrics.monthlyDebtService)}/mo</span>
                </div>
                <div className="text-right">
                  <span className="text-lg text-white tabular-nums block font-mono">
                    {metrics.netCashFlowAnnual >= 0 ? '+' : ''}{formatCurrency(metrics.netCashFlowAnnual)}
                  </span>
                  <span className="text-xs text-[#059669] dark:text-[#34D399] font-mono">
                    +{formatCurrency(metrics.netCashFlowMonthly)}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sensitivity Matrix Table */}
          <div className="bg-white dark:bg-[#141413] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider block">
                  Sensitivity Matrix: CoC Yield Stress Test
                </span>
                <p className="text-[11px] text-[#8F8D88] dark:text-[#9A9893] font-mono">
                  Matrix cross-referencing ADR changes against Occupancy drops
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#0B3B24] dark:text-[#34D399] font-bold bg-[#E8F5EE] dark:bg-[#064E3B]/40 px-2 py-0.5 rounded">
                Dynamic Matrix
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-center">
                <thead>
                  <tr className="border-b border-[#E5E4DF] dark:border-[#262624] bg-[#F9F8F5] dark:bg-[#1A1A18]">
                    <th className="py-2 px-2 text-left font-semibold text-[#8F8D88] dark:text-[#9A9893]">Occupancy \ ADR</th>
                    {adrMultipliers.map((m, idx) => {
                      const testAdr = Math.round(adr * (1 + m));
                      return (
                        <th key={idx} className="py-2 px-2 font-semibold text-[#111110] dark:text-[#F4F3EF]">
                          ${testAdr}
                          <span className="block text-[9px] text-[#8F8D88] dark:text-[#7A7874]">
                            {m === 0 ? 'Base' : m > 0 ? `+${(m*100).toFixed(0)}%` : `${(m*100).toFixed(0)}%`}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E4DF] dark:divide-[#262624]">
                  {occVariations.map((occVal, rIdx) => {
                    const isBaseOcc = occVal === occupancy;
                    return (
                      <tr key={rIdx} className={isBaseOcc ? 'bg-[#FEF3C7]/20 dark:bg-[#78350F]/20 font-bold' : ''}>
                        <td className="py-2 px-2 text-left text-[#666562] dark:text-[#9A9893] font-semibold">
                          {occVal}% {isBaseOcc && " (Base)"}
                        </td>
                        {adrMultipliers.map((mVal, cIdx) => {
                          const testAdr = Math.round(adr * (1 + mVal));
                          const testMetrics = computeUnderwriting(
                            adjustedDeal,
                            testAdr,
                            occVal,
                            strategy,
                            downPaymentPct,
                            interestRate
                          );
                          const isHighYield = testMetrics.cashOnCashReturn >= 18;
                          const isNegative = testMetrics.cashOnCashReturn < 0;

                          return (
                            <td
                              key={cIdx}
                              className={`py-2 px-2 tabular-nums ${
                                isNegative
                                  ? 'text-red-600 dark:text-red-400 font-bold'
                                  : isHighYield
                                  ? 'text-[#0B3B24] dark:text-[#34D399] font-bold bg-[#E8F5EE]/40 dark:bg-[#064E3B]/30'
                                  : 'text-[#111110] dark:text-[#F4F3EF]'
                              }`}
                            >
                              {testMetrics.cashOnCashReturn.toFixed(1)}%
                              <span className="block text-[9px] text-[#8F8D88] dark:text-[#7A7874]">
                                {testMetrics.dscrRatio.toFixed(2)}x
                              </span>
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
  );
};
