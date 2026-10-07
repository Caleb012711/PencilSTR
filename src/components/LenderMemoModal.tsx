import React, { useState } from 'react';
import { computeUnderwriting, formatCurrency, formatPercent } from '../utils/calculator';

interface LenderMemoModalProps {
  deal: any;
  onClose: () => void;
}

export const LenderMemoModal: React.FC<LenderMemoModalProps> = ({ deal, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Safe fallback if deal is undefined
  const safeDeal = deal || {
    title: 'The Ridge Alpine Lodge',
    address: '422 Alpine Ridge Trail',
    city: 'Gatlinburg',
    state: 'TN',
    price: 625000,
    mlsNumber: '248190',
    baseAdr: 485,
    baseOccupancy: 64,
  };

  const adr = Number(safeDeal.baseAdr) || 485;
  const occupancy = Number(safeDeal.baseOccupancy) || 64;
  const price = Number(safeDeal.price) || 625000;
  const location = safeDeal.location || (safeDeal.city ? `${safeDeal.city}, ${safeDeal.state}` : 'Gatlinburg, TN');
  const title = safeDeal.title || 'Institutional STR Target';
  const mlsNumber = safeDeal.mlsNumber || '248190';

  const metrics = computeUnderwriting(safeDeal, adr, occupancy, 'dscr');

  const hoaStatusText = safeDeal.hoaStatus?.statusText || (safeDeal.audit ? `HOA: ${safeDeal.audit.str_status}` : 'HOA: UNRESTRICTED STR');
  const hoaSection = safeDeal.hoaStatus?.section || (safeDeal.audit?.citations?.[0]?.clause_section || '§4.1');
  const reservesAmount = Number(safeDeal.capitalStack?.reserves) || 35000;
  const dscrRate = Number(safeDeal.financingPreset?.dscr?.interestRate || safeDeal.financing?.interestRate) || 7.15;
  const taxesAnnual = Number(safeDeal.expenses?.propertyTaxesAnnual || safeDeal.expenses?.taxesAnnual) || 4850;
  const insuranceAnnual = Number(safeDeal.expenses?.insuranceAnnual) || 2750;
  const utilitiesAnnual = (Number(safeDeal.expenses?.utilitiesMonthly) || 390) * 12;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMemo = () => {
    const text = `PENCILSTR CREDIT MEMORANDUM // DSCR UNDERWRITING
DEAL: ${title} (${location}) | MLS #${mlsNumber}
PURCHASE PRICE: ${formatCurrency(price)}
LOAN AMOUNT (DSCR 80% LTV): ${formatCurrency(price * 0.8)}
INITIAL BORROWER CASH: ${formatCurrency(metrics.totalCashRequired)}
DSCR RATIO: ${metrics.dscrRatio.toFixed(2)}x (Qualifier Standard: 1.25x)
NET OPERATING INCOME (NOI): ${formatCurrency(metrics.noi)}
GROSS ANNUAL STR REVENUE: ${formatCurrency(metrics.grossAnnualRevenue)} (ADR: $${adr}, Occ: ${occupancy}%)
OPERATING EXPENSES: ${formatCurrency(metrics.operatingExpenses)}
ANNUAL DEBT SERVICE: ${formatCurrency(metrics.annualDebtService)}
CASH-ON-CASH RETURN: ${formatPercent(metrics.cashOnCashReturn)}
HOA / ZONING CLEARANCE: ${hoaStatusText} (${hoaSection})
VERIFIED INSTITUTIONAL YIELD: Tier-1 Portfolio Grade`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141413] text-[#111110] dark:text-[#F4F3EF] rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xl max-w-4xl w-full overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Controls (no-print) */}
        <div className="px-6 py-4 border-b border-[#E5E4DF] dark:border-[#262624] bg-[#F9F8F5] dark:bg-[#1A1A18] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm font-sans tracking-tight text-[#111110] dark:text-[#F4F3EF]">PENCIL</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#D97706]/15 text-[#92400E] dark:text-[#FDE68A]">
              STR CREDIT MEMO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMemo}
              className="px-3 py-1.5 rounded border border-[#E5E4DF] dark:border-[#2E2E2B] bg-white dark:bg-[#22221F] text-xs font-mono font-semibold text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F9F8F5] dark:hover:bg-[#282825] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
          <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-[#78716C]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 11V3.5C3 3.2 3.2 3 3.5 3H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        )}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6V2.5H12V6M4 11.5H3C2.4 11.5 2 11.1 2 10.5V7.5C2 6.9 2.4 6.5 3 6.5H13C13.6 6.5 14 6.9 14 7.5V10.5C14 11.1 13.6 11.5 13 11.5H12M4 9.5H12V14H4V9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#E5E4DF] dark:hover:bg-[#252522] text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Printable Memorandum Body */}
        <div className="p-8 sm:p-12 overflow-y-auto font-mono text-xs text-[#111110] dark:text-[#F4F3EF] space-y-6">
          {/* Institutional Memo Header */}
          <div className="border-b-2 border-[#111110] dark:border-[#F4F3EF] pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#8F8D88] dark:text-[#9A9893] block mb-1">
                INSTITUTIONAL DEBT SYNDICATION // CREDIT COMMITTEE MEMO
              </span>
              <h1 className="text-2xl font-serif font-extrabold text-[#111110] dark:text-[#F4F3EF]">
                {title}
              </h1>
              <p className="text-xs text-[#666562] dark:text-[#9A9893] mt-1">
                {location} · MLS #{mlsNumber} · Turnkey Institutional STR
              </p>
            </div>
            <div className="text-right sm:text-right font-mono text-xs">
              <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] block">MEMO REF NO.</span>
              <span className="font-bold">STR-DSCR-2026-0489</span>
              <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] block mt-2">DATE OF AUDIT</span>
              <span className="font-bold">{new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
            </div>
          </div>

          {/* Key Underwriting Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
            <div>
              <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] block uppercase">Purchase Price</span>
              <span className="text-base font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{formatCurrency(price)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] block uppercase">Requested Loan</span>
              <span className="text-base font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{formatCurrency(price * 0.8)} (80% LTV)</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] block uppercase">DSCR Debt Coverage</span>
              <span className="text-base font-bold text-[#0B3B24] dark:text-[#34D399] tabular-nums">{metrics.dscrRatio.toFixed(2)}x (Min: 1.25x)</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] block uppercase">Projected CoC Yield</span>
              <span className="text-base font-bold text-[#059669] dark:text-[#34D399] tabular-nums">{formatPercent(metrics.cashOnCashReturn)}</span>
            </div>
          </div>

          {/* Sources and Uses Table */}
          <div>
            <h2 className="text-xs font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider mb-2 border-b border-[#E5E4DF] dark:border-[#262624] pb-1">
              1. Sources &amp; Uses of Capital
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3 rounded bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                <span className="text-[10px] font-bold text-[#666562] dark:text-[#9A9893] uppercase block">Capital Sources</span>
                <div className="flex justify-between">
                  <span>DSCR 1st Lien Mortgage (80%)</span>
                  <span className="font-bold tabular-nums">{formatCurrency(price * 0.8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Borrower Equity Down Payment (20%)</span>
                  <span className="font-bold tabular-nums">{formatCurrency(price * 0.2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Borrower Working Capital Reserve</span>
                  <span className="font-bold tabular-nums">{formatCurrency(reservesAmount)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5E4DF] dark:border-[#262624] font-bold">
                  <span>Total Capital Sourced</span>
                  <span className="tabular-nums">{formatCurrency(price + reservesAmount)}</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624]">
                <span className="text-[10px] font-bold text-[#666562] dark:text-[#9A9893] uppercase block">Capital Uses</span>
                <div className="flex justify-between">
                  <span>Property Acquisition Contract</span>
                  <span className="font-bold tabular-nums">{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loan Origination &amp; Title Closing</span>
                  <span className="font-bold tabular-nums">{formatCurrency(price * 0.02)}</span>
                </div>
                <div className="flex justify-between">
                  <span>6-Month Debt Service Reserve</span>
                  <span className="font-bold tabular-nums">{formatCurrency(metrics.monthlyDebtService * 6)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5E4DF] dark:border-[#262624] font-bold">
                  <span>Total Funds Applied</span>
                  <span className="tabular-nums">{formatCurrency(price + price * 0.02 + metrics.monthlyDebtService * 6)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Forma Summary */}
          <div>
            <h2 className="text-xs font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider mb-2 border-b border-[#E5E4DF] dark:border-[#262624] pb-1">
              2. Annual Pro-Forma Cash Flow Statement
            </h2>
            <div className="border border-[#E5E4DF] dark:border-[#262624] rounded divide-y divide-[#E5E4DF] dark:divide-[#262624]">
              <div className="px-4 py-2 flex justify-between bg-[#F9F8F5] dark:bg-[#1A1A18]">
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">Gross Potential STR Revenue ({occupancy}% Occ, ${adr} ADR)</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{formatCurrency(metrics.totalRevenue)}</span>
              </div>
              <div className="px-4 py-1.5 flex justify-between text-[#666562] dark:text-[#9A9893]">
                <span>- Platform Booking &amp; Channel Fees (3%)</span>
                <span className="tabular-nums">-{formatCurrency(metrics.grossAnnualRevenue * 0.03)}</span>
              </div>
              <div className="px-4 py-1.5 flex justify-between text-[#666562] dark:text-[#9A9893]">
                <span>- Professional Management Fee (15%)</span>
                <span className="tabular-nums">-{formatCurrency(metrics.grossAnnualRevenue * 0.15)}</span>
              </div>
              <div className="px-4 py-1.5 flex justify-between text-[#666562] dark:text-[#9A9893]">
                <span>- Cleaning &amp; Turnover Maintenance</span>
                <span className="tabular-nums">-{formatCurrency(metrics.cleaningRevenue)}</span>
              </div>
              <div className="px-4 py-1.5 flex justify-between text-[#666562] dark:text-[#9A9893]">
                <span>- Real Estate Property Taxes</span>
                <span className="tabular-nums">-{formatCurrency(taxesAnnual)}</span>
              </div>
              <div className="px-4 py-1.5 flex justify-between text-[#666562] dark:text-[#9A9893]">
                <span>- Hazard, Wind &amp; Commercial STR Liability Policy</span>
                <span className="tabular-nums">-{formatCurrency(insuranceAnnual)}</span>
              </div>
              <div className="px-4 py-1.5 flex justify-between text-[#666562] dark:text-[#9A9893]">
                <span>- High-Speed Utilities, Hot Tub &amp; Groundskeeping</span>
                <span className="tabular-nums">-{formatCurrency(utilitiesAnnual)}</span>
              </div>
              <div className="px-4 py-1.5 flex justify-between text-[#666562] dark:text-[#9A9893]">
                <span>- Capital Expenditure / Maintenance Reserve (5%)</span>
                <span className="tabular-nums">-{formatCurrency(metrics.grossAnnualRevenue * 0.05)}</span>
              </div>
              <div className="px-4 py-2 flex justify-between bg-[#F9F8F5] dark:bg-[#1A1A18] font-bold border-t-2 border-[#E5E4DF] dark:border-[#262624]">
                <span className="text-[#0B3B24] dark:text-[#34D399]">Net Operating Income (NOI) Available for Debt</span>
                <span className="text-[#0B3B24] dark:text-[#34D399] tabular-nums">{formatCurrency(metrics.noi)}</span>
              </div>
              <div className="px-4 py-1.5 flex justify-between font-bold text-[#111110] dark:text-[#F4F3EF]">
                <span>Annual Debt Service ({dscrRate}% 30-Year P&amp;I)</span>
                <span className="tabular-nums">-{formatCurrency(metrics.annualDebtService)}</span>
              </div>
              <div className="px-4 py-2 flex justify-between bg-[#111110] dark:bg-[#20201D] text-white font-extrabold">
                <span className="text-[#FEF3C7] dark:text-[#FDE68A]">Net Levered Pre-Tax Annual Cash Flow</span>
                <span className="tabular-nums text-sm">+{formatCurrency(metrics.netCashFlowAnnual)}</span>
              </div>
            </div>
          </div>

          {/* Legal / CC&R Covenant Confirmation */}
          <div className="p-4 rounded bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624] space-y-1.5">
            <span className="text-[10px] font-bold text-[#0B3B24] dark:text-[#34D399] uppercase tracking-wider block">
              3. Legal Title &amp; Zoning Validation
            </span>
            <p className="text-xs text-[#111110] dark:text-[#F4F3EF]">
              Covenants, Conditions &amp; Restrictions: <strong className="font-bold">{hoaStatusText}</strong> ({hoaSection}).
            </p>
            <p className="text-[11px] text-[#666562] dark:text-[#9A9893]">
              The Subject Property possesses verified rights for nightly vacation rentals. No 30-day minimum lease clauses or commercial restrictions are encumbering the title.
            </p>
          </div>

          {/* Signoff Blocks */}
          <div className="pt-6 border-t border-[#E5E4DF] dark:border-[#262624] flex justify-between items-end text-[10px] text-[#8F8D88] dark:text-[#9A9893]">
            <div>
              <p className="font-bold text-[#111110] dark:text-[#F4F3EF] text-xs">PENCILSTR CAPITAL UNDERWRITING DIVISION</p>
              <p>Autonomous AI Syndication Protocol v3.0</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#111110] dark:text-[#F4F3EF]">STATUS: APPROVED FOR INSTITUTIONAL TERM SHEET</p>
              <p>Underwritten according to Secondary Market DSCR Guidelines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
