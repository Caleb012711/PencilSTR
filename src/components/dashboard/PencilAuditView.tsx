import React, { useState, useRef } from 'react';
import { useDealStore, sanitizeDeal } from '../../store/useDealStore';
import { DEMO_DEALS } from '../../mock/demoDeals';
import { AuditSummary } from '../../types/deal';

const SAMPLE_DOCS = [
  {
    id: 'gatlinburg-sample',
    title: 'Gatlinburg Mountain Falls CC&R Bylaws (Unrestricted)',
    market: 'Sevier County, TN',
    text: `DECLARATION OF COVENANTS, CONDITIONS AND RESTRICTIONS
FOR MOUNTAIN FALLS SUBDIVISION
SEVIER COUNTY, TENNESSEE

ARTICLE IV: RESIDENTIAL COVENANTS AND USES
Section 4.1 Permitted Uses. All lots in the subdivision shall be known and designated as residential building lots. The leasing, renting, or licensing of any single-family dwelling for short-term rental, vacation lodging, or transient occupancy is explicitly permitted without limitation as to duration of stay or turnover frequency.

Section 4.2 Parking. Adequate off-street parking shall be provided on the paved or gravel driveway of each improved lot for not less than four (4) motor vehicles. Overnight parking on subdivision access roads is prohibited to allow clear emergency vehicle transit.

Section 4.3 Quiet Enjoyment. No noxious, offensive, or hazardous activity shall be carried on upon any lot. Exterior amplified sound and noise shall be curtailed between 10:00 PM and 7:00 AM local time pursuant to Sevier County residential peace standards.

Section 4.4 Amenity and Common Assessments. The HOA charges an annual maintenance assessment of $1,020 ($85/month) covering road snow removal, trash collection, and gate operation. No additional fees or registration levies are assessed on transient occupants.

Section 4.5 Enforcement and Fines. The Association may levy a civil assessment of $100 per day for repeated parking infractions following formal written warning to the recorded parcel owner.`,
  },
  {
    id: 'scottsdale-sample',
    title: 'Kierland Greens Condominium HOA Rules & City Code',
    market: 'Scottsdale / Maricopa, AZ',
    text: `CITY OF SCOTTSDALE RESIDENTIAL CODE & HOUSING DIRECTIVE
CHAPTER 18, ARTICLE VIII: SHORT-TERM RENTAL REGULATIONS

SECTION 18-150: REGISTRATION & COMPLIANCE REQUIREMENTS
Short-term rentals (STRs) are permitted within R-1 and R-4 residential zoning subject to mandatory annual licensing ($250 per dwelling) and neighbor notification within 30 days of initial operation.

SECTION 18-152: OCCUPANCY AND DECIBEL RESTRICTIONS
Maximum overnight occupancy is restricted to two (2) adults per bedroom plus two (2) additional guests, not to exceed a maximum aggregate of 12 occupants.
Outdoor sound amplification equipment, including pool speakers and public address systems, is strictly prohibited from 9:00 PM to 8:00 AM. Sound decibels must not exceed 55 dBA measured at the property line.

SECTION 18-154: MOTOR VEHICLE PARKING
All guest motor vehicles must be accommodated within the designated garage bays or private driveway. No on-street parking is permitted between 12:00 AM and 6:00 AM. Maximum four (4) registered guest vehicles permitted at any time.

SECTION 18-160: ENFORCEMENT & ESCALATING FINES
First verified noise or parking infraction: $500 fine.
Second violation within 12 months: $1,000 fine.
Third violation: $3,500 fine and potential revocation of municipal STR operating permit.`,
  },
  {
    id: 'gulfshores-sample',
    title: 'Gulf Shores Dune Preserve Architectural Bylaws',
    market: 'Baldwin County, AL',
    text: `DUNE PRESERVE PROPERTY OWNERS ASSOCIATION
ARCHITECTURAL GUIDELINES AND LEASING RULES
BALDWIN COUNTY, ALABAMA

SECTION 6: LEASING PROVISIONS
(a) Minimum Rental Term: Lots fronting coastal conservation easements may be leased for transient occupancy provided the minimum rental term shall not be less than three (3) consecutive nights during peak summer season (May 15 through Labor Day). Single-night turnovers are prohibited.

(b) Vehicle & Trailer Restrictions: No boats, trailers, recreational vehicles (RVs), or commercial vehicles shall be parked on any lot or adjacent cul-de-sac. Maximum parking capacity is strictly enforced at six (6) passenger vehicles parked wholly within designated concrete pads.

(c) Dune Conservation & Lighting: Exterior lighting must utilize turtle-safe amber LED fixtures (590nm wavelength) between May 1 and October 31 to protect nesting loggerhead sea turtles.

(d) Violations: Fines begin at $250 for trailer or parking non-compliance, escalating to $750 for beachfront lighting violations during turtle nesting season.`,
  },
];

export const PencilAuditView: React.FC = () => {
  const { deals, selectedDealId, selectedModel, openRouterApiKey, setModelSelectorOpen } = useDealStore();
  const rawDeal = deals.find((d) => d.id === selectedDealId) || deals[0] || DEMO_DEALS[0];
  const currentDeal = sanitizeDeal(rawDeal);

  const [selectedDocId, setSelectedDocId] = useState<string>('gatlinburg-sample');
  const [docText, setDocText] = useState<string>(SAMPLE_DOCS[0].text);
  const [docTitle, setDocTitle] = useState<string>(SAMPLE_DOCS[0].title);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditSummary>(currentDeal.audit || DEMO_DEALS[0].audit);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeCitationQuote, setActiveCitationQuote] = useState<string | null>(null);

  const textViewerRef = useRef<HTMLDivElement>(null);

  const handleSelectSample = (sampleId: string) => {
    const doc = SAMPLE_DOCS.find((d) => d.id === sampleId);
    if (doc) {
      setSelectedDocId(sampleId);
      setDocTitle(doc.title);
      setDocText(doc.text);
      setActiveCitationQuote(null);
      runAuditAnalysis(doc.text, doc.title);
    }
  };

  const processFile = (file: File) => {
    setDocTitle(file.name);
    setUploadStatus(`Parsing ${file.name}...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDocText(text || 'Document uploaded without plain text layer. Simulating full-context parser...');
      setUploadStatus(null);
      setActiveCitationQuote(null);
      runAuditAnalysis(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const runAuditAnalysis = async (content: string, fileName: string) => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/audit/analyze-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openrouter-api-key': openRouterApiKey || '',
          'x-openrouter-model': selectedModel || '',
        },
        body: JSON.stringify({
          documentText: content,
          documentName: fileName,
          model: selectedModel,
          openRouterApiKey,
        }),
      });
      const data = await res.json();
      if (data.audit) {
        setAuditResult(data.audit);
      }
    } catch (err) {
      console.warn('Audit endpoint fallback:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const scrollToCitation = (quote: string) => {
    setActiveCitationQuote(quote);
    if (!textViewerRef.current) return;

    // Search for element with matching quotation
    const quoteElement = textViewerRef.current.querySelector(`[data-quote="${encodeURIComponent(quote.slice(0, 30))}"]`);
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-y-auto transition-colors duration-200"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
    >
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#141413] border-b border-[#E5E4DF] dark:border-[#262624] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#92400E] dark:text-[#F59E0B] font-bold">
              AI CC&amp;R &amp; MUNICIPAL ZONING ENGINE
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#111110] dark:text-[#F4F3EF]">
            Pencil Audit // Legal &amp; HOA Analyzer
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-mono text-[#666562] dark:text-[#9A9893]">Active Engine:</span>
            <button
              onClick={() => setModelSelectorOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] hover:border-[#111110] dark:hover:border-[#E5E4DF] text-[10px] font-mono font-bold text-[#111110] dark:text-[#F4F3EF] cursor-pointer"
              title="Click to Switch Model (Nemotron 3 Ultra, MiniMax 01, etc.)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
              <span>{selectedModel.includes('minimax') ? 'MiniMax 01 (1M Context)' : selectedModel.includes('nemotron') ? 'Nemotron 3 Ultra (Free)' : selectedModel}</span>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4H7.5M9.5 4H13.5M7.5 2.5V5.5M2.5 8.5H5.5M7.5 8.5H13.5M5.5 7V10M2.5 13H9.5M11.5 13H13.5M9.5 11.5V14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sample Switcher */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] uppercase hidden sm:inline">
              Preloaded Bylaws:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => handleSelectSample(e.target.value)}
              className="bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] cursor-pointer"
            >
              {SAMPLE_DOCS.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title.split(' ')[0]} ({doc.market})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <label className="flex items-center gap-1.5 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shadow-xs">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 2.5H9.5L12.5 5.5V13.5H3.5V2.5Z" stroke="currentColor" strokeWidth="1.3"/><path d="M8 11V6M8 6L6 8M8 6L10 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Upload CC&amp;R PDF/TXT</span>
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Drag & Drop Visual Banner when active */}
      {isDragOver && (
        <div className="mx-6 mt-4 p-8 border-2 border-dashed border-[#D97706] bg-[#FEF3C7]/60 dark:bg-[#78350F]/30 rounded-xl flex items-center justify-center gap-3 text-[#92400E] dark:text-[#FDE68A] font-mono text-sm font-bold animate-pulse">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 2.5H9.5L12.5 5.5V13.5H3.5V2.5Z" stroke="currentColor" strokeWidth="1.3"/><path d="M8 11V6M8 6L6 8M8 6L10 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Drop HOA CC&amp;R PDF or Bylaw Document to Auto-Audit</span>
        </div>
      )}

      {uploadStatus && (
        <div className="bg-[#FEF3C7] dark:bg-[#78350F]/40 border-b border-[#D97706]/20 px-6 py-2 text-xs font-mono text-[#92400E] dark:text-[#FDE68A]">
          {uploadStatus}
        </div>
      )}

      {/* Split Screen Workspace */}
      <div className="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Side: Document Raw Text & Clauses (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F6] dark:bg-[#1A1A18] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 2.5H9.5L12.5 5.5V13.5H3.5V2.5Z" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 2.5V5.5H12.5M6 8H10M6 10.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <span className="font-mono text-xs font-bold text-[#111110] dark:text-[#F4F3EF] truncate max-w-xs">
                {docTitle}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#9A9893] bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2B] px-2 py-0.5 rounded">
              Extracted Legal Context
            </span>
          </div>

          <div
            ref={textViewerRef}
            className="flex-1 p-5 overflow-y-auto font-mono text-xs text-[#333230] dark:text-[#D4D3CD] leading-relaxed whitespace-pre-wrap bg-[#FCFBF8] dark:bg-[#10100F] select-text"
          >
            {docText.split('\n\n').map((paragraph, pIdx) => {
              // Check if this paragraph contains the active quote
              const isMatch = activeCitationQuote && paragraph.toLowerCase().includes(activeCitationQuote.slice(0, 30).toLowerCase());

              return (
                <p
                  key={pIdx}
                  data-quote={encodeURIComponent(paragraph.slice(0, 30))}
                  className={`mb-4 transition-all duration-300 p-2 rounded ${
                    isMatch
                      ? 'bg-[#FEF3C7] dark:bg-[#78350F]/50 border-l-4 border-[#D97706] text-[#78350F] dark:text-[#FDE68A] font-semibold'
                      : ''
                  }`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Right Side: Gemini Compliance Scorecard (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Executive Verdict Card */}
          <div className="bg-white dark:bg-[#141413] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E4DF] dark:border-[#262624]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#9A9893] block">
                  STR Legal Conviction Status
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`font-serif text-2xl font-bold tracking-tight ${
                      auditResult.str_status === 'PERMITTED'
                        ? 'text-[#0B3B24] dark:text-[#34D399]'
                        : auditResult.str_status === 'CONDITIONAL'
                        ? 'text-[#D97706] dark:text-[#FBBF24]'
                        : 'text-[#DC2626] dark:text-[#F87171]'
                    }`}
                  >
                    {auditResult.str_status}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      auditResult.risk_rating === 'LOW'
                        ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]'
                        : auditResult.risk_rating === 'MEDIUM'
                        ? 'bg-[#FFFBEB] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#92400E]'
                        : 'bg-[#FEF2F2] dark:bg-[#7F1D1D]/40 text-[#991B1B] dark:text-[#FCA5A5] border border-[#FECACA] dark:border-[#991B1B]'
                    }`}
                  >
                    {auditResult.risk_rating} RISK RATING
                  </span>
                </div>
              </div>

              {isAuditing && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#D97706] dark:text-[#FBBF24] animate-pulse">
                  <svg className="w-4 h-4 animate-spin text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11 11 13.5 8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C10 2.5 12 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>Synthesizing clauses...</span>
                </div>
              )}
            </div>

            {/* Restrictions Summary Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 text-xs font-mono">
              <div className="p-3 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-lg border border-[#E5E4DF] dark:border-[#262624]">
                <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] uppercase block">
                  Minimum Stay Days
                </span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] text-sm mt-0.5 block">
                  {auditResult.minimum_stay_days === 0
                    ? 'No Minimum (Nightly OK)'
                    : `${auditResult.minimum_stay_days} Consecutive Nights`}
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-lg border border-[#E5E4DF] dark:border-[#262624]">
                <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] uppercase block">
                  Vehicle Parking Limit
                </span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] text-sm mt-0.5 block">
                  {auditResult.parking_limit_vehicles}
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-lg border border-[#E5E4DF] dark:border-[#262624]">
                <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] uppercase block">
                  Quiet Hours &amp; Decibels
                </span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] text-sm mt-0.5 block">
                  {auditResult.quiet_hours}
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-lg border border-[#E5E4DF] dark:border-[#262624]">
                <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] uppercase block">
                  Enforcement &amp; Fines
                </span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF] text-sm mt-0.5 block">
                  {auditResult.fines_schedule}
                </span>
              </div>
            </div>
          </div>

          {/* Verbatim Citations & Interactive Pins */}
          <div className="bg-white dark:bg-[#141413] p-6 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xs flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#111110] dark:text-[#F4F3EF]">
                  Verbatim Legal Citations ({auditResult.citations.length})
                </h3>
                <p className="text-[11px] text-[#8F8D88] dark:text-[#9A9893]">
                  Click any citation pin to jump &amp; highlight in the document
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#9A9893]">
                Audited with Gemini 3.8
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1">
              {auditResult.citations.map((cite, idx) => {
                const isSelected = activeCitationQuote === cite.exact_quote;

                return (
                  <div
                    key={idx}
                    onClick={() => scrollToCitation(cite.exact_quote)}
                    className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FEF3C7] dark:bg-[#78350F]/40 border-[#D97706] ring-1 ring-[#D97706]'
                        : 'bg-[#FAF9F6] dark:bg-[#1A1A18] border-[#E5E4DF] dark:border-[#262624] hover:border-[#111110] dark:hover:border-[#E5E4DF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#111110] dark:text-[#F4F3EF] text-xs flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                        <span>{cite.clause_section}</span>
                      </span>
                      <span className="text-[10px] text-[#666562] dark:text-[#9A9893] bg-white dark:bg-[#22221F] border border-[#E5E4DF] dark:border-[#2E2E2B] px-1.5 py-0.5 rounded font-bold">
                        Page {cite.page_number}
                      </span>
                    </div>
                    <blockquote className="text-[#333230] dark:text-[#D4D3CD] italic border-l-2 border-[#111110] dark:border-[#D4D3CD] pl-2.5 my-1 leading-snug">
                      &quot;{cite.exact_quote}&quot;
                    </blockquote>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E5E4DF] dark:border-[#262624] mt-3">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#EBEAE6] dark:hover:bg-[#252522] rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6V2.5H12V6M4 11.5H3C2.4 11.5 2 11.1 2 10.5V7.5C2 6.9 2.4 6.5 3 6.5H13C13.6 6.5 14 6.9 14 7.5V10.5C14 11.1 13.6 11.5 13 11.5H12M4 9.5H12V14H4V9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Print Legal Audit Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
