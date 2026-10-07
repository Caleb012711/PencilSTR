import React from 'react';
import { Deal } from '../../types/deal';
import { calculateUnderwriteMetrics } from '../../utils/underwriterMath';

interface DealDetailDrawerProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUnderwriter: (deal: Deal) => void;
  onNavigateToAudit: (deal: Deal) => void;
}

export const DealDetailDrawer: React.FC<DealDetailDrawerProps> = ({
  deal,
  isOpen,
  onClose,
  onNavigateToUnderwriter,
  onNavigateToAudit,
}) => {
  if (!isOpen || !deal) return null;

  const metrics = calculateUnderwriteMetrics(deal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#141413] text-[#111110] dark:text-[#F4F3EF] h-full shadow-2xl flex flex-col justify-between border-l border-[#E5E4DF] dark:border-[#262624] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between bg-[#FAF9F6] dark:bg-[#1A1A18]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] px-2 py-0.5 rounded font-bold">
              MLS #{deal.mlsNumber}
            </span>
            <span className="text-xs font-mono text-[#8F8D88] dark:text-[#9A9893]">Stage: {deal.stage.toUpperCase()}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#E5E4DF] dark:hover:bg-[#282825] text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Photo Banner */}
          <div className="relative h-60 rounded-xl overflow-hidden bg-[#EBEAE6] dark:bg-[#1F1F1D] border border-[#E5E4DF] dark:border-[#262624]">
            <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#181816]/95 backdrop-blur-xs px-3 py-1 rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2B]">
              <span className="text-sm font-serif font-bold text-[#111110] dark:text-[#F4F3EF]">
                ${deal.price.toLocaleString()}
              </span>
              {deal.priceDrop && deal.priceDrop > 0 ? (
                <span className="text-xs font-mono text-[#DC2626] dark:text-[#F87171] ml-2">
                  (-${(deal.priceDrop / 1000).toFixed(0)}k Drop)
                </span>
              ) : null}
            </div>

            <div className="absolute top-3 right-3">
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                  (deal.audit?.str_status || 'PERMITTED') === 'PERMITTED'
                    ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/80 text-[#065F46] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]'
                    : deal.audit?.str_status === 'CONDITIONAL'
                    ? 'bg-[#FFFBEB] dark:bg-[#78350F]/80 text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#92400E]'
                    : 'bg-[#FEF2F2] dark:bg-[#7F1D1D]/80 text-[#991B1B] dark:text-[#FCA5A5] border border-[#FECACA] dark:border-[#991B1B]'
                }`}
              >
                HOA: {deal.audit?.str_status || 'PERMITTED'}
              </span>
            </div>
          </div>

          {/* Title & Location */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#111110] dark:text-[#F4F3EF]">{deal.title}</h3>
            <p className="text-xs font-mono text-[#666562] dark:text-[#9A9893] mt-1">
              {deal.address}, {deal.city}, {deal.state} {deal.zip}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] font-semibold mt-2 pt-2 border-t border-[#E5E4DF] dark:border-[#262624]">
              <span>{deal.beds} Beds</span>
              <span>•</span>
              <span>{deal.baths} Baths</span>
              <span>•</span>
              <span>{(deal.sqft || 2800).toLocaleString()} SqFt</span>
              <span>•</span>
              <span>Built {deal.yearBuilt || 2021}</span>
            </div>
          </div>

          {/* Key Return Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#ECFDF5] dark:bg-[#064E3B]/30 rounded-xl border border-[#A7F3D0] dark:border-[#065F46]">
              <span className="text-[10px] font-mono text-[#065F46] dark:text-[#34D399] uppercase block font-semibold">
                Cash-on-Cash
              </span>
              <span className="font-serif text-xl font-bold text-[#0B3B24] dark:text-[#34D399]">
                {metrics.cashOnCashReturn.toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-xl border border-[#E5E4DF] dark:border-[#262624]">
              <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#9A9893] uppercase block">
                DSCR Ratio
              </span>
              <span className="font-serif text-xl font-bold text-[#0B3B24] dark:text-[#34D399]">
                {metrics.dscrRatio.toFixed(2)}x
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-xl border border-[#E5E4DF] dark:border-[#262624]">
              <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#9A9893] uppercase block">
                Monthly Net Cash
              </span>
              <span className="font-serif text-xl font-bold text-[#111110] dark:text-[#F4F3EF]">
                ${Math.round(metrics.netCashFlowMonthly).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Pro Forma Revenue & Expenses Stack */}
          <div className="bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-4 text-xs font-mono space-y-2">
            <div className="font-bold text-[#111110] dark:text-[#F4F3EF] border-b border-[#E5E4DF] dark:border-[#262624] pb-1.5 flex justify-between">
              <span>Financial Overview</span>
              <span className="text-[#8F8D88] dark:text-[#9A9893] uppercase">{deal.financing?.strategy || 'dscr'}</span>
            </div>
            <div className="flex justify-between text-[#666562] dark:text-[#9A9893]">
              <span>Projected ADR</span>
              <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${deal.baseAdr || 485} / night</span>
            </div>
            <div className="flex justify-between text-[#666562] dark:text-[#9A9893]">
              <span>Occupancy Rate</span>
              <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">{deal.baseOccupancy || 65}%</span>
            </div>
            <div className="flex justify-between text-[#666562] dark:text-[#9A9893]">
              <span>Gross Projected Revenue</span>
              <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${Math.round(metrics.grossAnnualRevenue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#666562] dark:text-[#9A9893]">
              <span>Annual Operating Expenses</span>
              <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${Math.round(metrics.operatingExpenses).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#666562] dark:text-[#9A9893]">
              <span>Net Operating Income (NOI)</span>
              <span className="font-bold text-[#0B3B24] dark:text-[#34D399]">${Math.round(metrics.noi).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#666562] dark:text-[#9A9893]">
              <span>Annual Debt Service</span>
              <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">${Math.round(metrics.annualDebtService).toLocaleString()}</span>
            </div>
          </div>

          {/* CC&R Summary */}
          <div className="bg-white dark:bg-[#1A1A18] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-4 text-xs font-mono space-y-2">
            <div className="font-bold text-[#111110] dark:text-[#F4F3EF] border-b border-[#E5E4DF] dark:border-[#262624] pb-1.5 flex justify-between">
              <span>HOA &amp; Municipal Bylaw Audit</span>
              <span className="text-[#065F46] dark:text-[#34D399] font-bold">{deal.audit?.risk_rating || 'LOW'} RISK</span>
            </div>
            <p className="text-[#666562] dark:text-[#9A9893]">
              Parking: <span className="text-[#111110] dark:text-[#F4F3EF] font-semibold">{deal.audit?.parking_limit_vehicles || 'Driveway only'}</span>
            </p>
            <p className="text-[#666562] dark:text-[#9A9893]">
              Quiet Hours: <span className="text-[#111110] dark:text-[#F4F3EF] font-semibold">{deal.audit?.quiet_hours || '10:00 PM to 7:00 AM'}</span>
            </p>
            {deal.audit?.citations?.[0] && (
              <blockquote className="border-l-2 border-[#111110] dark:border-[#F4F3EF] pl-2 text-[11px] text-[#333230] dark:text-[#D1D0C9] italic mt-1">
                &quot;{deal.audit.citations[0].exact_quote}&quot;
              </blockquote>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F6] dark:bg-[#1A1A18] flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onNavigateToUnderwriter(deal);
            }}
            className="flex-1 py-2.5 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer text-center"
          >
            Launch Underwriter Lab
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToAudit(deal);
            }}
            className="flex-1 py-2.5 bg-white dark:bg-[#242421] border border-[#E5E4DF] dark:border-[#2E2E2B] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#FAF9F6] dark:hover:bg-[#2C2C28] rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer text-center"
          >
            View CC&amp;R Audit
          </button>
        </div>
      </div>
    </div>
  );
};
