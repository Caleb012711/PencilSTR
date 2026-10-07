import React, { useState } from 'react';
import { LIVE_SWEEP_FEED } from '../data/mockDeals';
import { PropertyDeal } from '../types';

interface FeatureModulesProps {
  allDeals: PropertyDeal[];
  onSelectDeal: (deal: PropertyDeal) => void;
  onNavigateToUnderwriter: () => void;
  onNavigateToHoaAudit: () => void;
}

export const FeatureModules: React.FC<FeatureModulesProps> = ({
  allDeals,
  onSelectDeal,
  onNavigateToUnderwriter,
  onNavigateToHoaAudit,
}) => {
  // Shock test state for Module 02
  const [shockRate, setShockRate] = useState<number>(7.15);
  const [loanAmount] = useState<number>(500000);

  // Quick calculate monthly payment for shock test
  const calculateShockPmt = (rate: number) => {
    const r = (rate / 100) / 12;
    const n = 360;
    return Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  };

  const handleFeedClick = (dealId: string) => {
    const matched = allDeals.find(d => d.id === dealId);
    if (matched) {
      onSelectDeal(matched);
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 py-12 transition-colors duration-200">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-sans font-semibold text-[#92400E] dark:text-[#FBBF24] uppercase tracking-wider block mb-2">
          Underwriting Architecture
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#111110] dark:text-[#F4F3EF] tracking-tight mb-3">
          Precision Underwriting Stack.
        </h2>
        <p className="text-sm md:text-base text-[#666562] dark:text-[#A3A19B] leading-relaxed font-sans">
          Engineered for institutional funds and ambitious private operators looking for defensive yield.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Autonomous Market Sweeps */}
        <div className="bg-white dark:bg-[#141413] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm flex flex-col justify-between hover:border-[#111110]/30 dark:hover:border-[#73716B] transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FBBF24] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M8 8L13 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>
              </div>
              <span className="text-xs font-mono font-bold text-[#8F8D88] dark:text-[#7A7874]">
                01
              </span>
            </div>
            <h3 className="text-lg font-bold font-sans text-[#111110] dark:text-[#F4F3EF] mb-1.5">
              Autonomous Market Sweeps
            </h3>
            <p className="text-xs text-[#666562] dark:text-[#A3A19B] leading-relaxed mb-4">
              Background agents continuously scan MLS listings and off-market wholesale lists for price cuts and motivated sellers.
            </p>

            {/* Interactive Mini-Feed Alert Preview */}
            <div className="space-y-2 border-t border-[#E5E4DF] dark:border-[#262624] pt-3.5 mb-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold">
                  Active Market Stream
                </span>
                <span className="text-[10px] font-mono text-[#059669] dark:text-[#34D399] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399]"></span>
                  Live
                </span>
              </div>

              {LIVE_SWEEP_FEED.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleFeedClick(item.dealId)}
                  className="p-2 rounded bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] flex items-center justify-between text-xs font-mono hover:bg-white dark:hover:bg-[#222220] hover:border-[#111110]/40 dark:hover:border-[#73716B] transition-colors cursor-pointer"
                  title="Click to underwrite this deal"
                >
                  <div>
                    <p className="font-bold text-[#111110] dark:text-[#F4F3EF] text-[11px]">{item.location}</p>
                    <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874]">{item.timeAgo} · {item.type}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#E8F5EE] dark:bg-[#064E3B]/40 text-[#0B3B24] dark:text-[#34D399] font-bold text-[10px]">
                    {item.coc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleFeedClick('timberline-ridge')}
            className="pt-3 border-t border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between text-xs font-sans font-semibold text-[#111110] dark:text-[#F4F3EF] hover:text-[#D97706] dark:hover:text-[#FBBF24] transition-colors cursor-pointer w-full text-left"
          >
            <span>Explore live market radar</span>
            <svg className="w-4 h-4 text-[#666562] dark:text-[#A3A19B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Card 2: DSCR & Creative Financing */}
        <div className="bg-white dark:bg-[#141413] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm flex flex-col justify-between hover:border-[#111110]/30 dark:hover:border-[#73716B] transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#E8F5EE] dark:bg-[#064E3B]/40 text-[#0B3B24] dark:text-[#34D399] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4H7.5M9.5 4H13.5M7.5 2.5V5.5M2.5 8.5H5.5M7.5 8.5H13.5M5.5 7V10M2.5 13H9.5M11.5 13H13.5M9.5 11.5V14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <span className="text-xs font-mono font-bold text-[#8F8D88] dark:text-[#7A7874]">
                02
              </span>
            </div>
            <h3 className="text-lg font-bold font-sans text-[#111110] dark:text-[#F4F3EF] mb-1.5">
              DSCR &amp; Creative Financing
            </h3>
            <p className="text-xs text-[#666562] dark:text-[#A3A19B] leading-relaxed mb-4">
              Instantly toggle between Conventional, DSCR, and Seller Financing terms with dynamic stress-testing for occupancy drops.
            </p>

            {/* Capital Stack Bar Preview & Quick Shock Test */}
            <div className="border-t border-[#E5E4DF] dark:border-[#262624] pt-3.5 space-y-2.5 mb-5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[10px] uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold">
                  Capital Stack Breakdown
                </span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] text-[11px]">$660,000 Total</span>
              </div>

              {/* Stacked Visual Bar */}
              <div className="w-full h-2.5 rounded-full flex overflow-hidden border border-[#E5E4DF] dark:border-[#262624]">
                <div className="bg-[#111110] dark:bg-white h-full" style={{ width: '76%' }} title="Loan Principal 76%"></div>
                <div className="bg-[#D97706] h-full" style={{ width: '19%' }} title="Down Payment 19%"></div>
                <div className="bg-[#059669] h-full" style={{ width: '5%' }} title="Reserves 5%"></div>
              </div>

              {/* Legend */}
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-[#666562] dark:text-[#A3A19B]">
                    <span className="w-2 h-2 rounded-full bg-[#111110] dark:bg-white inline-block"></span>
                    Loan Principal (80%)
                  </span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">$500,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-[#666562] dark:text-[#A3A19B]">
                    <span className="w-2 h-2 rounded-full bg-[#D97706] inline-block"></span>
                    Down Payment (20%)
                  </span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">$125,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-[#666562] dark:text-[#A3A19B]">
                    <span className="w-2 h-2 rounded-full bg-[#059669] inline-block"></span>
                    Cash Reserves
                  </span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">$35,000</span>
                </div>
              </div>

              {/* Interactive Shock Test Scrubber */}
              <div className="p-2 rounded bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] mt-2">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-[#666562] dark:text-[#A3A19B] font-semibold">Rate Stress: {shockRate.toFixed(2)}%</span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${calculateShockPmt(shockRate)}/mo P&amp;I</span>
                </div>
                <input
                  type="range"
                  min={6.0}
                  max={9.5}
                  step={0.25}
                  value={shockRate}
                  onChange={(e) => setShockRate(Number(e.target.value))}
                  className="w-full h-1.5 accent-[#0B3B24] dark:accent-[#34D399] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToUnderwriter}
            className="pt-3 border-t border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between text-xs font-sans font-semibold text-[#111110] dark:text-[#F4F3EF] hover:text-[#0B3B24] dark:hover:text-[#34D399] transition-colors cursor-pointer w-full text-left"
          >
            <span className="text-[#0B3B24] dark:text-[#34D399]">Test financing assumptions</span>
            <svg className="w-4 h-4 text-[#666562] dark:text-[#A3A19B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Card 3: 100-Page HOA & Zoning Scans */}
        <div className="bg-white dark:bg-[#141413] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm flex flex-col justify-between hover:border-[#111110]/30 dark:hover:border-[#73716B] transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F9F8F5] dark:bg-[#1A1A18] text-[#111110] dark:text-[#F4F3EF] border border-[#E5E4DF] dark:border-[#2E2E2A] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 2.5L13.5 6.5M3 11L7 15M2 14.5H5M5.5 6.5L11 12M3.5 8.5L7.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="text-xs font-mono font-bold text-[#8F8D88] dark:text-[#7A7874]">
                03
              </span>
            </div>
            <h3 className="text-lg font-bold font-sans text-[#111110] dark:text-[#F4F3EF] mb-1.5">
              100-Page HOA &amp; Zoning Scans
            </h3>
            <p className="text-xs text-[#666562] dark:text-[#A3A19B] leading-relaxed mb-4">
              Specialized legal LLM parses CC&amp;R PDFs to flag restrictive clauses, rental permits, parking restrictions, and quiet hours.
            </p>

            {/* Checklist Preview */}
            <div className="border-t border-[#E5E4DF] dark:border-[#262624] pt-3.5 space-y-2 text-xs font-mono mb-5">
              <span className="text-[10px] uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold block mb-1">
                Clause Audit Verification
              </span>
              <div className="p-2 rounded bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#059669] dark:text-[#34D399] font-bold"><svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                  <span className="font-medium text-[#111110] dark:text-[#F4F3EF] text-[11px]">0-Night Minimum Stay (§4.1)</span>
                </div>
                <span className="text-[10px] font-bold text-[#059669] dark:text-[#34D399] uppercase">Clear</span>
              </div>
              <div className="p-2 rounded bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#059669] dark:text-[#34D399] font-bold"><svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                  <span className="font-medium text-[#111110] dark:text-[#F4F3EF] text-[11px]">County Permit Current (2026)</span>
                </div>
                <span className="text-[10px] font-bold text-[#059669] dark:text-[#34D399] uppercase">Active</span>
              </div>
              <div className="p-2 rounded bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#92400E] dark:text-[#FBBF24] font-bold">!</span>
                  <span className="font-medium text-[#111110] dark:text-[#F4F3EF] text-[11px]">Quiet Hours 10 PM</span>
                </div>
                <span className="text-[10px] font-bold text-[#92400E] dark:text-[#FBBF24] bg-[#FEF3C7] dark:bg-[#78350F]/40 px-1.5 py-0.5 rounded">
                  Noted
                </span>
              </div>
              <div className="p-2 rounded bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#92400E] dark:text-[#FBBF24] font-bold">!</span>
                  <span className="font-medium text-[#111110] dark:text-[#F4F3EF] text-[11px]">Max 4 Vehicles Allowed</span>
                </div>
                <span className="text-[10px] font-bold text-[#92400E] dark:text-[#FBBF24] bg-[#FEF3C7] dark:bg-[#78350F]/40 px-1.5 py-0.5 rounded">
                  Tag
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToHoaAudit}
            className="pt-3 border-t border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between text-xs font-sans font-semibold text-[#111110] dark:text-[#F4F3EF] hover:text-[#92400E] dark:hover:text-[#FBBF24] transition-colors cursor-pointer w-full text-left"
          >
            <span className="text-[#92400E] dark:text-[#FBBF24]">Review CC&amp;R verifications</span>
            <svg className="w-4 h-4 text-[#666562] dark:text-[#A3A19B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
};
