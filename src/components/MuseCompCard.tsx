import React, { useMemo } from 'react';
import { PropertyDeal } from '../types';
import { Deal } from '../types/deal';
import { useDealStore } from '../store/useDealStore';
import { computeUnderwriting } from '../utils/calculator';
import { calculateUnderwriteMetrics, formatCurrency, formatPercent } from '../utils/underwriterMath';

export interface MuseCompCardProps {
  deal: PropertyDeal | Deal;
  isSelected?: boolean;
  onSelectDeal?: (deal: any) => void;
  onOpenUnderwriter?: (deal: any) => void;
  onOpenAudit?: (deal: any) => void;
  variant?: 'hero' | 'executive';
}

export const MuseCompCard: React.FC<MuseCompCardProps> = ({
  deal,
  isSelected = false,
  onSelectDeal,
  onOpenUnderwriter,
  onOpenAudit,
  variant = 'hero',
}) => {
  const { comparedDealIds, toggleCompareDeal, setCompDrawerOpen } = useDealStore();
  const isCompared = comparedDealIds.includes(deal.id);

  // Compute metrics with fallbacks
  const metrics = useMemo(() => {
    // Check if it's a PropertyDeal with financingPreset or Deal
    if ('financingPreset' in deal) {
      return computeUnderwriting(deal, deal.baseAdr, deal.baseOccupancy, 'dscr');
    }
    return calculateUnderwriteMetrics(deal);
  }, [deal]);

  const locationText = useMemo(() => {
    if ('location' in deal && deal.location) return deal.location;
    const d = deal as Deal;
    return [d.city, d.state].filter(Boolean).join(', ') || 'Smoky Mountains Cohort';
  }, [deal]);

  const hoaText = useMemo(() => {
    if ('hoaStatus' in deal && deal.hoaStatus) {
      return deal.hoaStatus.statusText;
    }
    const d = deal as Deal;
    return d.audit?.str_status || 'PERMITTED';
  }, [deal]);

  const isHoaPermitted = useMemo(() => {
    if ('hoaStatus' in deal && deal.hoaStatus) {
      return deal.hoaStatus.isUnrestricted;
    }
    const d = deal as Deal;
    return d.audit?.str_status !== 'PROHIBITED';
  }, [deal]);

  const pricePerSqFt = useMemo(() => {
    if (deal.price && deal.sqft) {
      return Math.round(deal.price / deal.sqft);
    }
    return 0;
  }, [deal.price, deal.sqft]);

  const handleCardClick = () => {
    if (onSelectDeal) {
      onSelectDeal(deal);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompareDeal(deal.id);
  };

  const handleUnderwriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenUnderwriter) {
      onOpenUnderwriter(deal);
    } else if (onSelectDeal) {
      onSelectDeal(deal);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleAuditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenAudit) {
      onOpenAudit(deal);
    } else if (onSelectDeal) {
      onSelectDeal(deal);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl border bg-white dark:bg-[#151514] overflow-hidden shadow-xs transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-[#111110] dark:border-[#F4F3EF] ring-2 ring-[#111110]/10 dark:ring-[#F4F3EF]/20'
          : isCompared
          ? 'border-[#D97706]/70 dark:border-[#F59E0B]/70 ring-2 ring-[#D97706]/15'
          : 'border-[#E5E4DF] dark:border-[#262624] hover:border-[#111110]/40 dark:hover:border-[#73716B]'
      }`}
    >
      <div>
        {/* Photo Container with overlay tags */}
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          <img
            src={deal.imageUrl}
            alt={deal.imageAlt || deal.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 pointer-events-none" />

          {/* Top Left: MLS # / Price Drop */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
              #{deal.mlsNumber}
            </span>
            {deal.priceDrop && deal.priceDrop > 0 ? (
              <span className="bg-[#D97706] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6.5 8.5L9.5 5.5L13.5 11.5M13.5 11.5H9.5M13.5 11.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>-{formatCurrency(deal.priceDrop)}</span>
              </span>
            ) : null}
          </div>

          {/* Top Right: Compare Toggle & Active Marker */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {isSelected && (
              <span className="bg-[#059669] text-white text-[10px] font-mono font-bold px-2 py-1 rounded-lg shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Active</span>
              </span>
            )}

            {/* Tactile Compare Toggle Button */}
            <button
              type="button"
              onClick={handleToggleCompare}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 ${
                isCompared
                  ? 'bg-[#059669] text-white ring-1 ring-white/30 hover:bg-[#047857]'
                  : 'bg-white/90 dark:bg-[#181816]/90 backdrop-blur-md text-[#111110] dark:text-[#F4F3EF] hover:bg-white dark:hover:bg-[#222220] border border-[#E5E4DF]/80 dark:border-[#333330]'
              }`}
              title={isCompared ? 'Remove from side-by-side comparison tray' : 'Add to side-by-side comparison tray'}
            >
              <span className={isCompared ? 'text-white font-bold' : 'text-[#D97706] font-bold'}>
                {isCompared ? '✓' : '+'}
              </span>
              <span>{isCompared ? 'Compared' : 'Compare'}</span>
            </button>
          </div>

          {/* Bottom Photo Specs */}
          <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between z-10">
            <div className="pr-2">
              <span className="text-[10px] font-mono text-[#FEF3C7] tracking-wider uppercase block font-semibold truncate">
                {deal.marketName || 'Verified STR Cohort'}
              </span>
              <h4 className="font-serif font-bold text-base line-clamp-1 group-hover:text-[#FBBF24] transition-colors">
                {deal.title}
              </h4>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-lg font-extrabold text-white tabular-nums block">
                {formatCurrency(deal.price)}
              </span>
              {pricePerSqFt > 0 && (
                <span className="text-[10px] font-mono text-[#D4D1C8] block">
                  ${pricePerSqFt}/sqft
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Location & Specs Row */}
          <div className="flex items-center justify-between text-xs font-mono text-[#666562] dark:text-[#9A9893]">
            <span className="truncate max-w-[55%]">{locationText}</span>
            <span className="font-semibold text-[#111110] dark:text-[#F4F3EF] shrink-0">
              {deal.beds}b / {deal.baths}ba · {deal.sqft.toLocaleString()} sqft
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-xl border border-[#EBEAE6] dark:border-[#262624] text-center">
            <div>
              <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                CoC Return
              </span>
              <span className="font-mono text-sm font-bold text-[#0B3B24] dark:text-[#34D399] tabular-nums">
                {formatPercent(metrics.cashOnCashReturn)}
              </span>
            </div>
            <div className="border-x border-[#EBEAE6] dark:border-[#262624]">
              <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                ADR Base
              </span>
              <span className="font-mono text-sm font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                ${deal.baseAdr}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                Net Cash
              </span>
              <span className="font-mono text-sm font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                +${Math.round(metrics.netCashFlowMonthly).toLocaleString()}/mo
              </span>
            </div>
          </div>

          {/* CC&R Clearance & DSCR Coverage Badge Row */}
          <div className="flex items-center justify-between text-xs font-mono pt-0.5">
            <div className="flex items-center gap-1.5 truncate max-w-[60%]">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isHoaPermitted ? 'bg-[#059669]' : 'bg-[#DC2626]'
                }`}
              />
              <span className="font-semibold text-[#111110] dark:text-[#F4F3EF] text-[11px] truncate">
                {hoaText}
              </span>
            </div>

            {/* DSCR Badge (highlighting >= 1.25x in emerald) */}
            <div
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold tabular-nums shrink-0 ${
                metrics.dscrRatio >= 1.25
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              }`}
            >
              DSCR {metrics.dscrRatio.toFixed(2)}x
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex items-center gap-2">
        <button
          type="button"
          onClick={handleUnderwriteClick}
          className={`flex-1 min-h-[38px] py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98] ${
            isSelected
              ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110]'
              : 'bg-[#F1EFEB] dark:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#111110] hover:text-white dark:hover:bg-white dark:hover:text-[#111110]'
          }`}
        >
          <span>{isSelected ? 'Currently Modeling' : 'Underwrite'}</span>
          <span className="font-sans">→</span>
        </button>

        <button
          type="button"
          onClick={handleAuditClick}
          className="min-h-[38px] px-3.5 py-2 rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2B] bg-white dark:bg-[#1A1A18] text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#F9F8F5] dark:hover:bg-[#20201D] text-xs font-mono font-semibold transition-colors cursor-pointer shadow-2xs active:scale-[0.98]"
          title="View HOA & CC&R Legal Audit"
        >
          Audit
        </button>
      </div>
    </div>
  );
};
