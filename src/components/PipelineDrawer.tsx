import React from 'react';
import { PropertyDeal } from '../types';
import { formatCurrency } from '../utils/calculator';

interface PipelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDeals: PropertyDeal[];
  onSelectDeal: (deal: PropertyDeal) => void;
  onRemoveDeal: (dealId: string) => void;
  onNavigateToUnderwriter: () => void;
}

export const PipelineDrawer: React.FC<PipelineDrawerProps> = ({
  isOpen,
  onClose,
  savedDeals,
  onSelectDeal,
  onRemoveDeal,
  onNavigateToUnderwriter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141413] text-[#111110] dark:text-[#F4F3EF] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#E5E4DF] dark:border-[#262624] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between bg-[#F9F8F5] dark:bg-[#1A1A18]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm font-sans tracking-tight text-[#111110] dark:text-[#F4F3EF]">
                PENCIL
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0B3B24]/10 dark:bg-[#064E3B]/40 text-[#0B3B24] dark:text-[#34D399]">
                SAVED PIPELINE
              </span>
            </div>
            <p className="text-xs font-mono text-[#666562] dark:text-[#9A9893] mt-1">
              {savedDeals.length} active cohorts bookmarked
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#E5E4DF] dark:hover:bg-[#252522] text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Deals List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {savedDeals.length === 0 ? (
            <div className="text-center py-12 text-[#8F8D88] dark:text-[#7A7874] font-mono text-xs">
              <svg className="w-9 h-9 mb-2 block text-[#E5E4DF] dark:text-[#2E2E2B] mx-auto" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2.5H12C12.5 2.5 13 3 13 3.5V14L8 11.5L3 14V3.5C3 3 3.5 2.5 4 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p>No properties saved yet.</p>
              <p className="text-[11px] text-[#8F8D88] dark:text-[#7A7874] mt-1">
                Click &quot;Save Deal&quot; in the Underwriter to monitor cohorts here.
              </p>
            </div>
          ) : (
            savedDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] bg-[#F9F8F5] dark:bg-[#1A1A18] hover:bg-white dark:hover:bg-[#22221F] hover:border-[#111110]/40 dark:hover:border-[#E5E4DF]/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-sm space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-16 h-16 rounded object-cover border border-[#E5E4DF] dark:border-[#2E2E2B] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#111110] dark:text-[#F4F3EF] truncate">{deal.title}</h4>
                    <p className="text-[11px] font-mono text-[#666562] dark:text-[#9A9893]">{deal.location}</p>
                    <p className="text-xs font-mono font-extrabold text-[#111110] dark:text-[#F4F3EF] mt-1 tabular-nums">
                      {formatCurrency(deal.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveDeal(deal.id)}
                    className="text-[#8F8D88] dark:text-[#7A7874] hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                    title="Remove from pipeline"
                  >
                    <svg className="w-4 h-4 text-red-500" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5H13M5.5 4.5V3C5.5 2.5 6 2 6.5 2H9.5C10 2 10.5 2.5 10.5 3V4.5M4 4.5L4.8 13C4.9 13.6 5.4 14 6 14H10C10.6 14 11.1 13.6 11.2 13L12 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-[#059669] dark:text-[#34D399] font-bold">
                    {deal.beds}B / {deal.baths}Ba · ${deal.baseAdr} ADR
                  </span>
                  <button
                    onClick={() => {
                      onSelectDeal(deal);
                      onNavigateToUnderwriter();
                      onClose();
                    }}
                    className="text-xs font-bold text-[#111110] dark:text-[#F4F3EF] hover:text-[#D97706] dark:hover:text-[#FBBF24] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Underwrite</span>
                    <span className="text-sm">→</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {savedDeals.length > 0 && (
          <div className="p-6 border-t border-[#E5E4DF] dark:border-[#262624] bg-[#F9F8F5] dark:bg-[#1A1A18] space-y-2">
            <button
              onClick={() => {
                if (savedDeals[0]) onSelectDeal(savedDeals[0]);
                onNavigateToUnderwriter();
                onClose();
              }}
              className="w-full py-3 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-mono text-xs font-bold uppercase tracking-wider hover:bg-black dark:hover:bg-white transition-all cursor-pointer shadow-sm text-center"
            >
              Open Active Pipeline Modeler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
