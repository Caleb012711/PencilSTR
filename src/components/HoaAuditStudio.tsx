import React, { useState } from 'react';
import { MOCK_CLAUSES } from '../data/mockDeals';
import { CcrClauseAudit, PropertyDeal } from '../types';

interface HoaAuditStudioProps {
  currentDeal: PropertyDeal;
  allDeals: PropertyDeal[];
  onSelectDeal: (deal: PropertyDeal) => void;
  onOpenLenderMemo: () => void;
}

export const HoaAuditStudio: React.FC<HoaAuditStudioProps> = ({
  currentDeal,
  allDeals,
  onSelectDeal,
  onOpenLenderMemo,
}) => {
  const [customText, setCustomText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedContingency, setCopiedContingency] = useState(false);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>('c1');

  const defaultClauses: CcrClauseAudit[] = MOCK_CLAUSES[currentDeal.id] || MOCK_CLAUSES['timberline-ridge'];
  const [clauses, setClauses] = useState<CcrClauseAudit[]>(defaultClauses);

  // Sync if deal changes
  React.useEffect(() => {
    setClauses(MOCK_CLAUSES[currentDeal.id] || MOCK_CLAUSES['timberline-ridge']);
  }, [currentDeal]);

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const newClause: CcrClauseAudit = {
        clauseId: `custom-${Date.now()}`,
        title: 'Custom Ingested CC&R Excerpt Audit',
        sectionCode: 'User Submitted Text §1.0',
        status: customText.toLowerCase().includes('prohibit') || customText.toLowerCase().includes('30 day') ? 'warning' : 'clear',
        summary: 'AI parsed user text for transient occupancy covenants, minimum duration, and nuisance thresholds.',
        verbatimExcerpt: `"${customText.slice(0, 300)}..."`,
        riskAssessment: customText.toLowerCase().includes('prohibit')
          ? 'High Risk: Potential prohibition terms detected in language.'
          : 'Low Risk: No standard prohibition covenants flagged.',
        operatorRecommendation: 'Require seller representation warranty in Purchase Agreement Exhibit C.'
      };
      setClauses([newClause, ...clauses]);
      setExpandedClauseId(newClause.clauseId);
      setCustomText('');
    }, 1200);
  };

  const contingencyText = `CONTINGENCY FOR SHORT-TERM RENTAL OPERATION (§STR-2025):
Buyer's obligation to consummate the purchase of ${currentDeal.title} (${currentDeal.location}, MLS #${currentDeal.mlsNumber}) is expressly conditioned upon Buyer's independent verification and written approval, within fourteen (14) calendar days of mutual agreement, that:
(1) The applicable Declaration of Covenants, Conditions and Restrictions (CC&Rs) ${currentDeal.hoaStatus.section} permit unencumbered transient residential leasing of 1-night minimums without HOA board discretion or permit lotteries;
(2) All municipal and county transient occupancy permits are in good standing and transferable to Buyer at closing;
(3) In the event of any restriction discovered during the audit period, Buyer may terminate this agreement with immediate 100% refund of all earnest money deposits.`;

  const copyContingency = () => {
    navigator.clipboard.writeText(contingencyText);
    setCopiedContingency(true);
    setTimeout(() => setCopiedContingency(false), 2500);
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-6 md:px-10 py-10 text-[#111110] dark:text-[#F4F3EF] transition-colors duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5E4DF] dark:border-[#262624]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans font-semibold text-[#92400E] dark:text-[#FBBF24] uppercase tracking-wider">
              Covenant &amp; Zoning Verification
            </span>
            <span className="text-xs font-mono text-[#8F8D88] dark:text-[#7A7874]">· Title &amp; Deed Analysis</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#111110] dark:text-[#F4F3EF]">
            HOA CC&amp;R &amp; Municipal Ordinance Audit
          </h1>
          <p className="text-sm font-mono text-[#666562] dark:text-[#A3A19B] mt-1">
            Analyzing {currentDeal.title} · {currentDeal.location}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentDeal.id}
            onChange={(e) => {
              const target = allDeals.find(d => d.id === e.target.value);
              if (target) onSelectDeal(target);
            }}
            className="bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] rounded px-3 py-2 text-xs font-mono font-semibold text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#73716B] cursor-pointer"
          >
            {allDeals.map((d) => (
              <option key={d.id} value={d.id} className="bg-white dark:bg-[#1A1A18] text-[#111110] dark:text-[#F4F3EF]">
                {d.title} ({d.location})
              </option>
            ))}
          </select>

          <button
            onClick={onOpenLenderMemo}
            className="px-4 py-2 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-mono font-bold uppercase tracking-wider hover:bg-black dark:hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Attach to Lender Memo</span>
            <span className="text-[#D97706] font-bold">→</span>
          </button>
        </div>
      </div>

      {/* Top Audit Status Bar */}
      <div className="bg-white dark:bg-[#141413] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#E8F5EE] dark:bg-[#064E3B]/40 text-[#0B3B24] dark:text-[#34D399] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#111110] dark:text-[#F4F3EF]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 2.5L13.5 6.5M3 11L7 15M2 14.5H5M5.5 6.5L11 12M3.5 8.5L7.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#111110] dark:text-[#F4F3EF] font-sans">
                  Sovereign Conviction Status: Tier-1 STR Legal Clearance
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E8F5EE] dark:bg-[#064E3B]/40 text-[#0B3B24] dark:text-[#34D399]">
                  98/100 PASSED
                </span>
              </div>
              <p className="text-xs font-mono text-[#666562] dark:text-[#A3A19B] mt-1">
                Zero deed restrictions found prohibiting transient short-term rentals under 30 nights. Section {currentDeal.hoaStatus.section} affirmative allowance confirmed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FBBF24] border border-[#D97706]/30 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L14.5 13.5H1.5L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6.5V9.5M8 11.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span>{currentDeal.hoaStatus.warningNote || 'Max 4 Vehicles Tag'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Clauses List + Raw Ingestion & Contingency Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Clause-by-clause findings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider">
              Audited Deed Clauses &amp; Ordinances ({clauses.length})
            </span>
            <span className="text-[11px] font-mono text-[#8F8D88] dark:text-[#7A7874]">Click clause to inspect legal text</span>
          </div>

          {clauses.map((clause) => {
            const isExpanded = expandedClauseId === clause.clauseId;
            const isClear = clause.status === 'clear' || clause.status === 'active';
            const isWarning = clause.status === 'warning' || clause.status === 'prohibited';

            return (
              <div
                key={clause.clauseId}
                className={`bg-white dark:bg-[#141413] rounded-xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-[#111110] dark:border-[#F4F3EF] shadow-md' : 'border-[#E5E4DF] dark:border-[#262624] shadow-sm hover:border-[#111110]/40 dark:hover:border-[#73716B]'
                }`}
              >
                <div
                  onClick={() => setExpandedClauseId(isExpanded ? null : clause.clauseId)}
                  className="p-5 flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                        isClear
                          ? 'bg-[#0B3B24] dark:bg-[#059669] text-white'
                          : isWarning
                          ? 'bg-[#92400E] dark:bg-[#D97706] text-white'
                          : 'bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FBBF24]'
                      }`}
                    >
                      {isClear ? "Clear" : "!"}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#111110] dark:text-[#F4F3EF] font-sans">
                        {clause.title}
                      </h3>
                      <span className="text-[11px] font-mono text-[#8F8D88] dark:text-[#7A7874] block mt-0.5">
                        {clause.sectionCode}
                      </span>
                      <p className="text-xs text-[#666562] dark:text-[#A3A19B] mt-1.5 font-sans leading-relaxed">
                        {clause.summary}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      isClear
                        ? 'bg-[#E8F5EE] dark:bg-[#064E3B]/40 text-[#0B3B24] dark:text-[#34D399]'
                        : isWarning
                        ? 'bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FBBF24]'
                        : 'bg-[#F9F8F5] dark:bg-[#1A1A18] text-[#666562] dark:text-[#A3A19B]'
                    }`}
                  >
                    {clause.status}
                  </span>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#E5E4DF] dark:border-[#262624] bg-[#F9F8F5] dark:bg-[#181817] space-y-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8F8D88] dark:text-[#7A7874] block mb-1">
                        Verbatim Deed Language
                      </span>
                      <p className="p-3 bg-white dark:bg-[#141413] border border-[#E5E4DF] dark:border-[#262624] rounded text-[#111110] dark:text-[#F4F3EF] italic leading-relaxed">
                        {clause.verbatimExcerpt}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-white dark:bg-[#141413] border border-[#E5E4DF] dark:border-[#262624] rounded">
                        <span className="text-[10px] uppercase font-bold text-[#666562] dark:text-[#A3A19B] block mb-1">
                          Risk Assessment
                        </span>
                        <p className="text-[#111110] dark:text-[#F4F3EF]">{clause.riskAssessment}</p>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#141413] border border-[#E5E4DF] dark:border-[#262624] rounded">
                        <span className="text-[10px] uppercase font-bold text-[#0B3B24] dark:text-[#34D399] block mb-1">
                          Operator Protocol
                        </span>
                        <p className="text-[#111110] dark:text-[#F4F3EF]">{clause.operatorRecommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Ingest Raw CC&R & Purchase Contingency Generator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Custom Ingestion Box */}
          <div className="bg-white dark:bg-[#141413] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
            <span className="text-[11px] font-mono font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider block mb-2">
              Ingest CC&amp;R PDF or Clause Text
            </span>
            <p className="text-xs text-[#666562] dark:text-[#A3A19B] mb-3">
              Paste covenants, deed restrictions, or HOA bylaws to verify hidden minimum night traps or commercial prohibitions.
            </p>

            <form onSubmit={handleSimulateScan}>
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste deed text here (e.g., 'Article IV Section 2: No lot shall be leased for terms less than 30 consecutive days...')"
                className="w-full bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] rounded p-3 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#73716B]"
              ></textarea>
              <button
                type="submit"
                disabled={isAnalyzing || !customText}
                className="mt-3 w-full py-2.5 rounded bg-[#111110] hover:bg-black dark:bg-[#F4F3EF] dark:hover:bg-white text-white dark:text-[#111110] text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C10.2 2.5 12.1 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Parsing CC&amp;R Clauses...</span>
                  </>
                ) : (
                  <>
                    <span>Audit Custom Text</span>
                    <span className="text-[#D97706]">↵</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Legal Contingency Generator */}
          <div className="bg-white dark:bg-[#141413] p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-mono font-bold text-[#0B3B24] dark:text-[#34D399] uppercase tracking-wider block">
                Purchase Agreement Contingency
              </span>
              <button
                onClick={copyContingency}
                className="text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF] hover:text-[#D97706] dark:hover:text-[#FBBF24] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedContingency ? (
          <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-[#78716C]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 11V3.5C3 3.2 3.2 3 3.5 3H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        )}
                <span>{copiedContingency ? 'Copied to Clipboard!' : 'Copy Clause'}</span>
              </button>
            </div>
            <p className="text-xs text-[#666562] dark:text-[#A3A19B] mb-3">
              Standard protective addendum drafted to protect earnest money if undisclosed HOA rental limits are revealed during title review.
            </p>

            <pre className="p-3 bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] rounded text-[11px] font-mono text-[#111110] dark:text-[#F4F3EF] whitespace-pre-wrap leading-relaxed">
              {contingencyText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
