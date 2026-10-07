import React, { useState } from 'react';

interface PricingSectionProps {
  onStartPlan: (planName: string, price: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onStartPlan }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const discount = isAnnual ? 0.8 : 1.0;

  return (
    <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 py-16 text-[#111110] dark:text-[#F4F3EF] transition-colors duration-200" id="pricing">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <span className="text-xs font-sans font-semibold text-[#0B3B24] dark:text-[#34D399] uppercase tracking-wider block mb-2">
          Membership &amp; Licensing
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#111110] dark:text-[#F4F3EF] tracking-tight mb-3">
          Simple pricing for serious deal hunters.
        </h2>
        <p className="text-sm text-[#666562] dark:text-[#A3A19B] leading-relaxed font-sans mb-6">
          Choose the tier that matches your acquisition pace and pipeline scale.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center gap-3 p-1 bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] rounded-full shadow-sm">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              !isAnnual
                ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] shadow-sm'
                : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isAnnual
                ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] shadow-sm'
                : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            <span>Annual (Save 20%)</span>
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1: Scout */}
        <div className="bg-white dark:bg-[#141413] p-7 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm flex flex-col justify-between h-full hover:border-[#111110]/30 dark:hover:border-[#73716B] transition-all">
          <div>
            <div className="mb-6">
              <span className="text-xs font-sans font-semibold text-[#666562] dark:text-[#A3A19B] uppercase tracking-wider block mb-2">
                Scout
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl font-extrabold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                  ${Math.round(29 * discount)}
                </span>
                <span className="text-xs font-mono text-[#666562] dark:text-[#A3A19B]">/ month</span>
              </div>
              <p className="text-xs text-[#666562] dark:text-[#A3A19B] mt-2 leading-relaxed">
                Ideal for solo deal seekers evaluating their initial vacation rental acquisition.
              </p>
            </div>
            <div className="space-y-3.5 text-xs font-mono text-[#111110] dark:text-[#EAE8E3] border-t border-[#E5E4DF] dark:border-[#262624] pt-5 mb-8">
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>50 Property URL Scans / mo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>DSCR &amp; Conventional Models</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Standard STR City Ordinance Check</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#8F8D88] dark:text-[#666562]">
                <svg className="w-4 h-4 text-[#A8A29E]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                <span>No Automated PDF memos</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onStartPlan('Scout', `$${Math.round(29 * discount)}/mo`)}
            className="w-full py-3.5 rounded border border-[#E5E4DF] dark:border-[#2E2E2A] bg-[#F9F8F5] dark:bg-[#1E1E1C] hover:bg-white dark:hover:bg-[#282825] hover:border-[#111110] dark:hover:border-[#73716B] text-[#111110] dark:text-[#F4F3EF] font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center shadow-sm cursor-pointer"
          >
            Start Free
          </button>
        </div>

        {/* Tier 2: Operator (FEATURED) */}
        <div className="bg-white dark:bg-[#161615] rounded-xl border-2 border-[#D97706] shadow-xl flex flex-col justify-between h-full relative transform lg:-translate-y-2">
          <div className="p-7 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-sans font-bold text-[#92400E] dark:text-[#FBBF24] uppercase tracking-wider block">
                  Operator
                </span>
                <span className="text-[10px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FBBF24]">
                  Recommended
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-mono text-4xl font-extrabold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                  ${Math.round(79 * discount)}
                </span>
                <span className="text-xs font-mono text-[#666562] dark:text-[#A3A19B]">/ month</span>
              </div>
              <p className="text-xs text-[#666562] dark:text-[#A3A19B] leading-relaxed">
                For active portfolio builders submitting competitive offers on weekly sweeps.
              </p>
              <div className="space-y-3.5 text-xs font-mono text-[#111110] dark:text-[#EAE8E3] border-t border-[#E5E4DF] dark:border-[#262624] pt-5 my-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0B3B24] dark:bg-[#059669] text-white flex items-center justify-center text-[9px] font-bold">
                    <svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="font-bold">Unlimited Real-time URL Scans</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0B3B24] dark:bg-[#059669] text-white flex items-center justify-center text-[9px] font-bold">
                    <svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span>Daily MLS Price Cut Radar Alerts</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0B3B24] dark:bg-[#059669] text-white flex items-center justify-center text-[9px] font-bold">
                    <svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span>Full CC&amp;R &amp; Zoning AI Audit Engine</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0B3B24] dark:bg-[#059669] text-white flex items-center justify-center text-[9px] font-bold">
                    <svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span>Seller &amp; Creative Financing Modules</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0B3B24] dark:bg-[#059669] text-white flex items-center justify-center text-[9px] font-bold">
                    <svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span>1-Click Lender Memo PDF Export</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onStartPlan('Operator', `$${Math.round(79 * discount)}/mo`)}
              className="w-full py-3.5 rounded bg-[#111110] hover:bg-black dark:bg-[#D97706] dark:hover:bg-[#B45309] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all text-center shadow-md cursor-pointer"
            >
              Get Started →
            </button>
          </div>
        </div>

        {/* Tier 3: Desk / Fund */}
        <div className="bg-white dark:bg-[#141413] p-7 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm flex flex-col justify-between h-full hover:border-[#111110]/30 dark:hover:border-[#73716B] transition-all">
          <div>
            <div className="mb-6">
              <span className="text-xs font-sans font-semibold text-[#666562] dark:text-[#A3A19B] uppercase tracking-wider block mb-2">
                Syndicate &amp; Fund
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl font-extrabold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                  ${Math.round(199 * discount)}
                </span>
                <span className="text-xs font-mono text-[#666562] dark:text-[#A3A19B]">/ month</span>
              </div>
              <p className="text-xs text-[#666562] dark:text-[#A3A19B] mt-2 leading-relaxed">
                Multi-seat team access for syndicates, private equity funds, and boutique brokerages.
              </p>
            </div>
            <div className="space-y-3.5 text-xs font-mono text-[#111110] dark:text-[#EAE8E3] border-t border-[#E5E4DF] dark:border-[#262624] pt-5 mb-8">
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>5 Dedicated Team Seats</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Custom Wholesaler Feed Ingestion</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>White-label Client Investment Memos</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Direct REST &amp; Webhook API Access</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onStartPlan('Desk / Fund', `$${Math.round(199 * discount)}/mo`)}
            className="w-full py-3.5 rounded border border-[#E5E4DF] dark:border-[#2E2E2A] bg-[#F9F8F5] dark:bg-[#1E1E1C] hover:bg-white dark:hover:bg-[#282825] hover:border-[#111110] dark:hover:border-[#73716B] text-[#111110] dark:text-[#F4F3EF] font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center shadow-sm cursor-pointer"
          >
            Contact Team
          </button>
        </div>
      </div>
    </section>
  );
};
