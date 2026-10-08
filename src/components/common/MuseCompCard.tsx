import React, { useState } from 'react';
import { Deal } from '../../types/deal';
import { PropertyDeal } from '../../types';
import { useDealStore } from '../../store/useDealStore';
import { calculateUnderwriteMetrics, formatCurrency, formatPercent } from '../../utils/underwriterMath';
import { computeUnderwriting } from '../../utils/calculator';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Check,
  TrendingUp,
  Percent,
  DollarSign,
  Maximize2,
  FileText,
  Sliders,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface MuseCompCardProps {
  deal: Deal | PropertyDeal;
  isSelected?: boolean;
  onSelect?: (deal: Deal | PropertyDeal) => void;
  onNavigateToUnderwriter?: (deal: Deal | PropertyDeal) => void;
  onNavigateToAudit?: (deal: Deal | PropertyDeal) => void;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'wide';
  className?: string;
  showActions?: boolean;
}

export const MuseCompCard: React.FC<MuseCompCardProps> = ({
  deal,
  isSelected = false,
  onSelect,
  onNavigateToUnderwriter,
  onNavigateToAudit,
  aspectRatio = 'landscape',
  className = '',
  showActions = true,
}) => {
  const {
    comparedDealIds,
    toggleCompareDeal,
    setSelectedDealId,
    setCurrentView,
  } = useDealStore();

  const isCompared = comparedDealIds.includes(deal.id);

  // Gallery resolution
  const photoGallery: string[] = React.useMemo(() => {
    if (deal.imageGallery && deal.imageGallery.length > 0) {
      return deal.imageGallery;
    }
    return [
      deal.imageUrl,
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    ];
  }, [deal]);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Unified financial metrics calculation
  const metrics = React.useMemo(() => {
    const computed = calculateUnderwriteMetrics(deal);
    return {
      dscr: computed.dscrRatio,
      coc: computed.cashOnCashReturn,
      capRate: computed.capRate,
      noiMonthly: computed.noi / 12,
      netCashMonthly: computed.netCashFlowMonthly,
      monthlyDebt: computed.monthlyDebtService,
      breakEvenOcc: computed.breakEvenOccupancy,
    };
  }, [deal]);

  // DSCR Health Tier Semantics
  const dscrTier = React.useMemo(() => {
    if (metrics.dscr >= 1.25) {
      return {
        label: 'BANKABLE',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        dotColor: 'bg-emerald-400',
        textColor: 'text-emerald-400',
      };
    }
    if (metrics.dscr >= 1.0) {
      return {
        label: 'SEASONING MARGIN',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dotColor: 'bg-amber-400',
        textColor: 'text-amber-400',
      };
    }
    return {
      label: 'DEFICIT RISK',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dotColor: 'bg-rose-400',
      textColor: 'text-rose-400',
    };
  }, [metrics.dscr]);

  // Permit / HOA Status Semantics
  const permitStatus = React.useMemo(() => {
    if ('audit' in deal && deal.audit) {
      const status = deal.audit.str_status;
      if (status === 'PERMITTED') {
        return {
          text: deal.permitDetails?.badgeText || 'STR PERMITTED',
          color: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
          icon: ShieldCheck,
        };
      }
      if (status === 'CONDITIONAL') {
        return {
          text: 'CONDITIONAL STR',
          color: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
        };
      }
      return {
        text: 'PROHIBITED',
        color: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
        icon: ShieldAlert,
      };
    }
    // PropertyDeal fallback
    const prop = deal as PropertyDeal;
    if (prop.hoaStatus?.isUnrestricted) {
      return {
        text: prop.permitDetails?.badgeText || 'UNRESTRICTED §4.1',
        color: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
        icon: ShieldCheck,
      };
    }
    return {
      text: prop.hoaStatus?.statusText || 'REGULATED',
      color: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
    };
  }, [deal]);

  const PermitIcon = permitStatus.icon;

  // Aspect ratio classes
  const aspectClass =
    aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-[16/9]'
      : 'aspect-[16/10]';

  // Handle Scrubbing
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (photoGallery.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const nextIdx = Math.min(Math.floor(pct * photoGallery.length), photoGallery.length - 1);
    setActivePhotoIdx(nextIdx);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent trigger if clicking buttons or compare
    if ((e.target as HTMLElement).closest('button')) return;
    if (onSelect) {
      onSelect(deal);
    } else {
      setSelectedDealId(deal.id);
    }
  };

  const handleLaunchUnderwriter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDealId(deal.id);
    if (onNavigateToUnderwriter) {
      onNavigateToUnderwriter(deal);
    } else {
      setCurrentView('underwriter');
    }
  };

  const handleLaunchAudit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDealId(deal.id);
    if (onNavigateToAudit) {
      onNavigateToAudit(deal);
    } else {
      setCurrentView('audit');
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompareDeal(deal.id);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActivePhotoIdx(0);
      }}
      className={`group relative rounded-2xl overflow-hidden bg-white dark:bg-[#111318] border transition-all duration-300 cursor-pointer select-none ${
        isSelected || isCompared
          ? 'border-[#059669] ring-2 ring-[#059669]/30 shadow-xl -translate-y-1'
          : 'border-[#E5E4DF] dark:border-[#242933] hover:border-[#059669]/60 hover:shadow-xl hover:-translate-y-1'
      } ${className}`}
    >
      {/* Visual Canvas Container with Multi-Angle Scrubbing */}
      <div
        className={`relative ${aspectClass} w-full overflow-hidden bg-neutral-900 cursor-ew-resize`}
        onMouseMove={handleMouseMove}
      >
        <img
          src={photoGallery[activePhotoIdx] || deal.imageUrl}
          alt={deal.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Cinematic Scrim Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50 pointer-events-none" />

        {/* TOP BAR: Floating Corner Glass Badges */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 z-10 pointer-events-none">
          {/* Top-Left: DSCR + ADR Badge */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div className="backdrop-blur-md bg-black/65 border border-white/20 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${dscrTier.dotColor} animate-pulse`} />
              <span className="font-mono text-xs font-bold tracking-tight">
                DSCR {metrics.dscr.toFixed(2)}x
              </span>
            </div>

            <div className="backdrop-blur-md bg-black/50 border border-white/15 text-white/95 px-2 py-1 rounded-lg font-mono text-[11px] font-semibold tracking-tight shadow-sm">
              ${deal.baseAdr} ADR
            </div>

            {deal.compScore && (
              <div className="hidden sm:flex backdrop-blur-md bg-[#059669]/40 border border-emerald-400/30 text-emerald-200 px-2 py-1 rounded-lg font-mono text-[10px] font-bold tracking-tight">
                {deal.compScore}% COMP
              </div>
            )}
          </div>

          {/* Top-Right: STR Permit Seal & Compare Checkbox */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <div
              className={`backdrop-blur-md px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm ${permitStatus.color}`}
            >
              <PermitIcon className="w-3 h-3 shrink-0" />
              <span>{permitStatus.text}</span>
            </div>

            {/* Quick-Compare Floating Button */}
            <button
              onClick={handleToggleCompare}
              title={isCompared ? 'Remove from Comparison' : 'Add to Comparison Drawer'}
              className={`p-1.5 rounded-lg border backdrop-blur-md transition-all duration-200 cursor-pointer ${
                isCompared
                  ? 'bg-[#059669] text-white border-emerald-400 shadow-md'
                  : 'bg-black/55 text-white/80 border-white/20 hover:bg-black/80 hover:text-white opacity-0 group-hover:opacity-100'
              }`}
            >
              {isCompared ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Layers className="w-3.5 h-3.5 stroke-[2]" />
              )}
            </button>
          </div>
        </div>

        {/* PHOTO SCRUB DASHES (Bottom of Image) */}
        {photoGallery.length > 1 && (
          <div className="absolute bottom-2 inset-x-3 flex gap-1 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {photoGallery.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all duration-150 ${
                  i === activePhotoIdx ? 'bg-white shadow-xs' : 'bg-white/35'
                }`}
              />
            ))}
          </div>
        )}

        {/* SCRUB INSTRUCTION HINT ON HOVER */}
        {photoGallery.length > 1 && isHovered && (
          <div className="absolute top-11 right-3 pointer-events-none bg-black/60 backdrop-blur-xs text-white/90 text-[9px] font-mono px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 animate-fadeIn">
            <span>↔ Scrub</span>
            <span className="text-[#F59E0B] font-bold">
              {activePhotoIdx + 1}/{photoGallery.length}
            </span>
          </div>
        )}

        {/* BOTTOM VIGNETTE OVERLAY: Deal Title & Location */}
        <div className="absolute bottom-3 inset-x-3 z-10 pointer-events-none space-y-1">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] font-bold text-[#F59E0B] tracking-wider uppercase drop-shadow-xs">
                {deal.marketName || (('city' in deal) ? `${deal.city}, ${deal.state}` : '')}
                {deal.elevation ? ` • ${deal.elevation}` : ''}
              </p>
              <h3 className="font-serif font-bold text-lg text-white tracking-tight drop-shadow-md line-clamp-1">
                {deal.title}
              </h3>
            </div>

            {/* Price Chip */}
            <div className="text-right shrink-0">
              <div className="font-mono text-base font-extrabold text-white tracking-tight drop-shadow-md">
                ${deal.price.toLocaleString()}
              </div>
              {deal.priceDrop && deal.priceDrop > 0 ? (
                <div className="font-mono text-[10px] font-bold text-emerald-400 drop-shadow-xs">
                  -${(deal.priceDrop / 1000).toFixed(0)}k Drop
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* CARD BODY: Quantitative Micro-Strip & Specifications */}
      <div className="p-3.5 space-y-3 bg-white dark:bg-[#111318]">
        {/* Physical Specs & MLS Strip */}
        <div className="flex items-center justify-between text-xs text-[#5F5D59] dark:text-[#9E9C96]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">
              {deal.beds}b / {deal.baths}ba
            </span>
            <span>•</span>
            <span className="font-mono">{deal.sqft.toLocaleString()} sqft</span>
            {deal.viewType && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-[11px] truncate max-w-[140px] text-[#8F8D88]">
                  {deal.viewType}
                </span>
              </>
            )}
          </div>
          <span className="font-mono text-[11px] text-[#8F8D88] dark:text-[#6B6964]">
            #{deal.mlsNumber}
          </span>
        </div>

        {/* 3-Cell Financial Returns Micro-Grid */}
        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-[#F9F8F5] dark:bg-[#181B22] border border-[#E5E4DF] dark:border-[#242933]">
          <div className="text-left px-1">
            <div className="text-[10px] font-mono text-[#8F8D88] uppercase tracking-wider">
              CoC Return
            </div>
            <div className="font-mono text-xs font-bold text-[#059669] dark:text-[#10B981] tabular-nums">
              {metrics.coc.toFixed(1)}%
            </div>
          </div>

          <div className="text-left px-1 border-x border-[#E5E4DF] dark:border-[#242933]">
            <div className="text-[10px] font-mono text-[#8F8D88] uppercase tracking-wider">
              Occ Rate
            </div>
            <div className="font-mono text-xs font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
              {deal.baseOccupancy}%
            </div>
          </div>

          <div className="text-left px-1">
            <div className="text-[10px] font-mono text-[#8F8D88] uppercase tracking-wider">
              Cap Rate
            </div>
            <div className="font-mono text-xs font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
              {metrics.capRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* HOVER EXPANDABLE SECONDARY METRICS DRAWER */}
        <div
          className={`grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E4DF]/60 dark:border-[#242933]/60 text-xs font-mono transition-all duration-300 ${
            isHovered
              ? 'opacity-100 max-h-24'
              : 'opacity-0 max-h-0 overflow-hidden py-0 border-t-0'
          }`}
        >
          <div className="flex items-center justify-between text-[#5F5D59] dark:text-[#9E9C96]">
            <span>Break-Even:</span>
            <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
              {metrics.breakEvenOcc.toFixed(0)}% Occ
            </span>
          </div>

          <div className="flex items-center justify-between text-[#5F5D59] dark:text-[#9E9C96]">
            <span>Monthly Free:</span>
            <span
              className={`font-bold tabular-nums ${
                metrics.netCashMonthly >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              +${Math.round(metrics.netCashMonthly).toLocaleString()}/mo
            </span>
          </div>

          <div className="flex items-center justify-between text-[#5F5D59] dark:text-[#9E9C96]">
            <span>Monthly Debt:</span>
            <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
              ${Math.round(metrics.monthlyDebt).toLocaleString()}/mo
            </span>
          </div>

          <div className="flex items-center justify-between text-[#5F5D59] dark:text-[#9E9C96]">
            <span>Monthly NOI:</span>
            <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
              ${Math.round(metrics.noiMonthly).toLocaleString()}/mo
            </span>
          </div>
        </div>

        {/* INTERACTIVE ACTIONS STRIP */}
        {showActions && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleLaunchUnderwriter}
              className="flex-1 py-1.5 px-3 rounded-lg bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-sans text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 stroke-[2]" />
              <span>Underwrite Deal</span>
            </button>

            <button
              onClick={handleLaunchAudit}
              title="Audit HOA Covenants & Zoning"
              className="py-1.5 px-2.5 rounded-lg border border-[#E5E4DF] dark:border-[#242933] text-[#5F5D59] dark:text-[#9E9C96] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#F1EFEB] dark:hover:bg-[#181B22] transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleCompare}
              title={isCompared ? 'Remove from Comparison' : 'Compare Side-by-Side'}
              className={`py-1.5 px-2.5 rounded-lg border transition-colors cursor-pointer ${
                isCompared
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-[#059669] dark:text-[#10B981]'
                  : 'border-[#E5E4DF] dark:border-[#242933] text-[#5F5D59] dark:text-[#9E9C96] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#F1EFEB] dark:hover:bg-[#181B22]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
