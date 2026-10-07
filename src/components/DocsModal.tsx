import React from 'react';

interface DocsModalProps {
  title: string;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ title, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141413] text-[#111110] dark:text-[#F4F3EF] rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xl max-w-2xl w-full overflow-hidden my-auto max-h-[85vh] flex flex-col">
        <div className="p-6 border-b border-[#E5E4DF] dark:border-[#262624] bg-[#F9F8F5] dark:bg-[#1A1A18] flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#92400E] dark:text-[#FDE68A] block">
              PENCILSTR ARCHITECTURE // PROTOCOL
            </span>
            <h3 className="font-serif text-xl font-bold text-[#111110] dark:text-[#F4F3EF]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E5E4DF] dark:hover:bg-[#252522] text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-xs font-mono text-[#666562] dark:text-[#9A9893] space-y-4 leading-relaxed">
          <p>
            <strong className="text-[#111110] dark:text-[#F4F3EF]">1. Underwriting Engine Methodology:</strong> PencilSTR computes pro-forma cash flows using real-time MLS listing ingestion, AirDNA comp percentiles, municipal zoning permits, and institutional DSCR debt matrices.
          </p>
          <p>
            <strong className="text-[#111110] dark:text-[#F4F3EF]">2. CC&amp;R Legal Audit Protocol:</strong> Our proprietary deed parsing engine scans for minimum duration clauses (such as 30-day lease covenants), parking allowances, noise monitor stipulations, and short-term transient rental restrictions.
          </p>
          <p>
            <strong className="text-[#111110] dark:text-[#F4F3EF]">3. Debt Service Coverage (DSCR):</strong> Qualifying loans require minimum 1.20x to 1.25x NOI / Debt Service coverage ratio. Memos generated are calibrated for submission to Kiavi, Visio Lending, Easy Street Capital, and Host Financial.
          </p>
          <p>
            <strong className="text-[#111110] dark:text-[#F4F3EF]">4. Data Confidentiality &amp; Pipeline Privacy:</strong> All proprietary MLS underwriting models and custom deal benchmarks remain strictly encrypted to your session and account.
          </p>
        </div>

        <div className="p-4 border-t border-[#E5E4DF] dark:border-[#262624] bg-[#F9F8F5] dark:bg-[#1A1A18] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-mono font-bold uppercase hover:bg-black dark:hover:bg-white transition-colors cursor-pointer"
          >
            Acknowledge &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
};
