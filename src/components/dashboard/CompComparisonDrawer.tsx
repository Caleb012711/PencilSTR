import React, { useState, useEffect, useMemo } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { Deal } from '../../types/deal';
import { PropertyDeal } from '../../types';
import { MOCK_DEALS, MOCK_CCR_AUDITS } from '../../data/mockDeals';
import { computeUnderwriting } from '../../utils/calculator';
import { calculateUnderwriteMetrics, formatCurrency, formatPercent } from '../../utils/underwriterMath';

// Multi-angle photo sets for interactive scrub per deal
const DEAL_PHOTO_SETS: Record<string, string[]> = {
  'deal-gatlinburg-ridge': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-xWVPskzq-wFfumEirxwgL9t9443B48yZ1GHUFKGSz4FotTqBgn8l9SZG32qmAlwePWypO3PXFUZc5lGnE79JNQQxHnCparlaCGOE0U6ayQ05t9i-d_rRh4r_aHa2NPr8YSRuG9y2ZVrG7ADaO9mWAASOiJmuQWABYtPJhjaqvF-m-f3aC52z9jsorUcsP27wNG5e_6anm2e24ZCVFN2_RdlC-m4xhJ1Qa3gGfZUcrBkivwzRicChQ',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  ],
  'timberline-ridge': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-xWVPskzq-wFfumEirxwgL9t9443B48yZ1GHUFKGSz4FotTqBgn8l9SZG32qmAlwePWypO3PXFUZc5lGnE79JNQQxHnCparlaCGOE0U6ayQ05t9i-d_rRh4r_aHa2NPr8YSRuG9y2ZVrG7ADaO9mWAASOiJmuQWABYtPJhjaqvF-m-f3aC52z9jsorUcsP27wNG5e_6anm2e24ZCVFN2_RdlC-m4xhJ1Qa3gGfZUcrBkivwzRicChQ',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  ],
  'deal-scottsdale-kierland': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCEwT5EgPtKcvO2fJ_Inmxtb-6K6VacHQLT_W0azO5ee6HLnokigI_5nVjHWNvIIXE2sSRO9dFRTCcXAY4jA-6i0MCqGFK9ivAB0kbIHqfnmqBWXOQ8qJRaZLzU-943YBjzpXx6_cOR2Et5BuuquFjoQLbVOipeobJE2SkfqpllhbutrPVsO1ytKTgEu4DYlIfl1AXf-PaygPULmtt3dZndrsyNF7hMrnNka75t_75QHLYGV4HbrBquEw',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  ],
  'kierland-hideaway': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCEwT5EgPtKcvO2fJ_Inmxtb-6K6VacHQLT_W0azO5ee6HLnokigI_5nVjHWNvIIXE2sSRO9dFRTCcXAY4jA-6i0MCqGFK9ivAB0kbIHqfnmqBWXOQ8qJRaZLzU-943YBjzpXx6_cOR2Et5BuuquFjoQLbVOipeobJE2SkfqpllhbutrPVsO1ytKTgEu4DYlIfl1AXf-PaygPULmtt3dZndrsyNF7hMrnNka75t_75QHLYGV4HbrBquEw',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  ],
  'deal-gulf-shores-sandcastle': [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-xWVPskzq-wFfumEirxwgL9t9443B48yZ1GHUFKGSz4FotTqBgn8l9SZG32qmAlwePWypO3PXFUZc5lGnE79JNQQxHnCparlaCGOE0U6ayQ05t9i-d_rRh4r_aHa2NPr8YSRuG9y2ZVrG7ADaO9mWAASOiJmuQWABYtPJhjaqvF-m-f3aC52z9jsorUcsP27wNG5e_6anm2e24ZCVFN2_RdlC-m4xhJ1Qa3gGfZUcrBkivwzRicChQ',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  ],
  'blue-ridge-alpine': [
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  ],
  'broken-bow-timber': [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  ],
};

const getPhotosForDeal = (deal: any): string[] => {
  if (DEAL_PHOTO_SETS[deal.id]) return DEAL_PHOTO_SETS[deal.id];
  return [
    deal.imageUrl,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  ];
};

// Interactive Photo Scrub Component
const PhotoScrubber: React.FC<{ photos: string[]; title: string }> = ({ photos, title }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const nextIdx = Math.min(Math.floor(pct * photos.length), photos.length - 1);
    setActiveIdx(nextIdx);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const nextIdx = Math.min(Math.floor(pct * photos.length), photos.length - 1);
    setActiveIdx(nextIdx);
  };

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-900 group cursor-ew-resize select-none border border-[#E5E4DF] dark:border-[#282825]"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <img
        src={photos[activeIdx] || photos[0]}
        alt={`${title} angle ${activeIdx + 1}`}
        className="w-full h-full object-cover transition-opacity duration-150"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Scrub indicator dashes */}
      <div className="absolute bottom-2.5 left-3 right-3 flex gap-1 z-10">
        {photos.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-150 ${
              i === activeIdx ? 'bg-white shadow-xs' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Scrub Hint on Hover */}
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <span>↔ Scrub Angle</span>
        <span className="text-[#F59E0B] font-bold">
          {activeIdx + 1}/{photos.length}
        </span>
      </div>
    </div>
  );
};

interface LegalClauseInfo {
  status: 'PERMITTED' | 'CONDITIONAL' | 'PROHIBITED';
  section: string;
  verbatim: string;
  parking: string;
  quietHours: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
}

const getDealLegalInfo = (deal: any): LegalClauseInfo => {
  // Check audit citations
  if (deal.audit?.citations && deal.audit.citations.length > 0) {
    const c = deal.audit.citations[0];
    return {
      status: (deal.audit.str_status || 'PERMITTED') as any,
      section: c.clause_section || 'CC&R Article IV',
      verbatim: c.exact_quote,
      parking: deal.audit.parking_limit_vehicles || 'Max 4 passenger vehicles (paved apron only)',
      quietHours: deal.audit.quiet_hours || '10:00 PM – 7:00 AM local time',
      riskRating: deal.audit.risk_rating || 'LOW',
    };
  }

  // Check MOCK_CCR_AUDITS
  const audits = MOCK_CCR_AUDITS[deal.id];
  if (audits && audits.length > 0) {
    const a = audits[0];
    return {
      status: deal.hoaStatus?.statusText?.includes('UNRESTRICTED') ? 'PERMITTED' : (deal.audit?.str_status || 'PERMITTED'),
      section: a.sectionCode,
      verbatim: a.verbatimExcerpt.replace(/^"|"$/g, ''),
      parking: 'Max 4 vehicles (driveway apron only)',
      quietHours: '10:00 PM – 7:00 AM',
      riskRating: 'LOW',
    };
  }

  // Fallbacks by ID or location
  if (deal.title?.toLowerCase().includes('ridge') || deal.id?.includes('ridge') || deal.id?.includes('timberline')) {
    return {
      status: 'PERMITTED',
      section: 'Declaration §4.1 (Transient Leasing)',
      verbatim:
        'Leases of any duration including nightly, weekly, or seasonal transient rental occupancies are expressly authorized as permitted residential uses of the Property.',
      parking: 'Max 4 passenger vehicles (paved apron only)',
      quietHours: '10:00 PM to 7:00 AM local time',
      riskRating: 'LOW',
    };
  }

  if (deal.title?.toLowerCase().includes('kierland') || deal.id?.includes('kierland') || deal.id?.includes('scottsdale')) {
    return {
      status: 'CONDITIONAL',
      section: 'Scottsdale Rev. Code Ord. 4655 §18-120',
      verbatim:
        'Short-term rental operators must install and continuously maintain working outdoor noise monitoring equipment capable of recording decibel levels above 55 dBA during night hours.',
      parking: 'Maximum 4 vehicles; no street parking between 1:00 AM - 6:00 AM',
      quietHours: '10:00 PM exterior noise cap (55 dBA decibel monitor mandatory)',
      riskRating: 'MEDIUM',
    };
  }

  if (deal.title?.toLowerCase().includes('gulf') || deal.id?.includes('gulf')) {
    return {
      status: 'PERMITTED',
      section: 'Gulf Shores City Code Ord. 19-02',
      verbatim:
        'Nightly vacation lodging is authorized on R-3 designated parcels with valid annual business license and lodging tax bond.',
      parking: 'Strict 4 vehicles maximum (coastal fire code access restriction)',
      quietHours: '11:00 PM on beach boardwalk',
      riskRating: 'LOW',
    };
  }

  return {
    status: 'PERMITTED',
    section: 'County Unincorporated STR Code §14',
    verbatim:
      'Transient residential occupancies are recognized as permitted by right subject to life-safety smoke detection and annual tax registration.',
    parking: 'Max 4 vehicles dedicated off-street',
    quietHours: '10:00 PM – 7:00 AM',
    riskRating: 'LOW',
  };
};

export interface CompComparisonDrawerProps {
  onNavigateToUnderwriter?: (deal: Deal | PropertyDeal) => void;
}

export const CompComparisonDrawer: React.FC<CompComparisonDrawerProps> = ({
  onNavigateToUnderwriter,
}) => {
  const {
    comparedDealIds,
    toggleCompareDeal,
    clearComparedDeals,
    isCompDrawerOpen,
    setCompDrawerOpen,
    deals,
    setSelectedDealId,
    setCurrentView,
  } = useDealStore();

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCompDrawerOpen) {
        setCompDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompDrawerOpen, setCompDrawerOpen]);

  // Resolve compared deals from store or mock list
  const comparedDeals = useMemo(() => {
    const list: (Deal | PropertyDeal)[] = [];
    for (const id of comparedDealIds) {
      const foundInStore = deals.find((d) => d.id === id);
      if (foundInStore) {
        list.push(foundInStore);
        continue;
      }
      const foundInMock = MOCK_DEALS.find((d) => d.id === id);
      if (foundInMock) {
        list.push(foundInMock);
      }
    }
    return list;
  }, [comparedDealIds, deals]);

  const handleUnderwriteTarget = (deal: Deal | PropertyDeal) => {
    setSelectedDealId(deal.id);
    setCompDrawerOpen(false);

    if (onNavigateToUnderwriter) {
      onNavigateToUnderwriter(deal);
    } else {
      setCurrentView('underwriter');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const count = comparedDealIds.length;

  return (
    <>
      {/* 1. FLOATING DOCK PILL AT BOTTOM CENTER (when comparedDealIds.length >= 2) */}
      {count >= 2 && !isCompDrawerOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-[#111110]/95 dark:bg-[#181816]/95 text-white backdrop-blur-md border border-[#2E2E2B] dark:border-[#383834] shadow-2xl rounded-full px-4 py-2 flex items-center gap-3.5 ring-1 ring-white/10">
            {/* Overlapping thumbnail avatars */}
            <div className="flex -space-x-2.5 overflow-hidden py-0.5">
              {comparedDeals.slice(0, 4).map((d) => (
                <img
                  key={d.id}
                  src={d.imageUrl}
                  alt={d.title}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#111110] dark:ring-[#181816] object-cover"
                />
              ))}
              {count > 4 && (
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2A2926] text-[10px] font-mono font-bold text-white ring-2 ring-[#111110]">
                  +{count - 4}
                </div>
              )}
            </div>

            {/* Tray Count Info */}
            <div className="hidden sm:flex flex-col text-left font-mono">
              <span className="text-xs font-bold text-white">
                {count} Comps Selected
              </span>
              <span className="text-[10px] text-[#A8A59E]">
                Underwrite &amp; Benchmark
              </span>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setCompDrawerOpen(true)}
              className="px-4 py-1.5 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white font-mono text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Compare {count} Comps Side-by-Side</span>
              <span className="font-sans font-bold">→</span>
            </button>

            {/* Clear Button */}
            <button
              type="button"
              onClick={clearComparedDeals}
              className="p-1 rounded-full text-[#A8A59E] hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs font-mono"
              title="Clear compared comps tray"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 2. SLIDE-OVER COMPARISON MATRIX MODAL */}
      {isCompDrawerOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-center lg:justify-end animate-in fade-in duration-200"
          onClick={() => setCompDrawerOpen(false)}
        >
          <div
            className="w-full max-w-[96vw] lg:max-w-6xl xl:max-w-7xl bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full shadow-2xl flex flex-col border-l border-[#E5E4DF] dark:border-[#262624] animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E4DF] dark:border-[#262624] bg-white dark:bg-[#141413] flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF]">
                      Comp Underwriting Comparison Matrix
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D97706]/15 text-[#D97706]">
                      {count} Targets
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#666562] dark:text-[#9A9893]">
                    Side-by-side quantitative return metrics, break-even hurdles, and CC&amp;R legal covenants
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={clearComparedDeals}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2B] bg-[#FAF9F6] dark:bg-[#1A1A18] hover:bg-[#EBEAE6] text-xs font-mono text-[#666562] dark:text-[#A8A59E] hover:text-[#111110] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setCompDrawerOpen(false)}
                  className="p-2 rounded-xl text-[#8F8D88] hover:text-[#111110] dark:hover:text-white hover:bg-[#EBEAE6] dark:hover:bg-[#20201D] transition-colors cursor-pointer"
                  title="Close comparison matrix (Esc)"
                >
                  <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Matrix Columns Container */}
            <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
              {comparedDeals.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#E5E4DF] dark:bg-[#262624] flex items-center justify-center text-xl">
                    ⚖️
                  </div>
                  <h3 className="font-serif text-lg font-bold">No Comps in Comparison Tray</h3>
                  <p className="text-xs font-mono text-[#666562] dark:text-[#9A9893] max-w-sm">
                    Click &quot;+ Compare&quot; on 2 or more property cards in the Scanner or Dashboard to compare them side-by-side.
                  </p>
                  <button
                    onClick={() => setCompDrawerOpen(false)}
                    className="mt-2 px-4 py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-xl text-xs font-mono font-bold cursor-pointer"
                  >
                    Return to Listings
                  </button>
                </div>
              ) : (
                <div className="min-w-max pb-10">
                  {/* Grid of Columns: Each compared deal is a vertical column */}
                  <div
                    className="grid gap-6"
                    style={{
                      gridTemplateColumns: `repeat(${comparedDeals.length}, minmax(320px, 360px))`,
                    }}
                  >
                    {comparedDeals.map((deal) => {
                      const metrics =
                        'financingPreset' in deal
                          ? computeUnderwriting(deal, deal.baseAdr, deal.baseOccupancy, 'dscr')
                          : calculateUnderwriteMetrics(deal);

                      const photos = getPhotosForDeal(deal);
                      const legal = getDealLegalInfo(deal);
                      const priceSqft = deal.sqft ? Math.round(deal.price / deal.sqft) : 0;
                      const peakAdr =
                        deal.peakHighAdr ||
                        Math.round(deal.baseAdr * 1.25);
                      const minCompAdr =
                        deal.minCompAdr ||
                        Math.round(deal.baseAdr * 0.7);
                      const breakEvenOcc =
                        deal.breakEvenOccupancy ||
                        (metrics as any).breakEvenOccupancy ||
                        48;
                      const safetyMargin = deal.baseOccupancy - breakEvenOcc;

                      const location =
                        'location' in deal && deal.location
                          ? deal.location
                          : `${(deal as Deal).city}, ${(deal as Deal).state}`;

                      return (
                        <div
                          key={deal.id}
                          className="bg-white dark:bg-[#161615] rounded-2xl border border-[#E5E4DF] dark:border-[#262624] overflow-hidden shadow-sm flex flex-col justify-between divide-y divide-[#E5E4DF] dark:divide-[#262624]"
                        >
                          {/* Column Card Header with Photo Scrub */}
                          <div className="p-4 sm:p-5 space-y-3.5">
                            {/* Photo Scrub Container */}
                            <PhotoScrubber photos={photos} title={deal.title} />

                            {/* Title & Location Header */}
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] mb-1">
                                <span>MLS #{deal.mlsNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleCompareDeal(deal.id)}
                                  className="text-[#DC2626] dark:text-[#F87171] hover:underline cursor-pointer"
                                >
                                  Remove ×
                                </button>
                              </div>
                              <h3 className="font-serif font-bold text-lg text-[#111110] dark:text-[#F4F3EF] line-clamp-1">
                                {deal.title}
                              </h3>
                              <p className="text-xs font-mono text-[#666562] dark:text-[#9A9893] truncate mt-0.5">
                                {location} · {deal.beds}b / {deal.baths}ba · {deal.sqft.toLocaleString()} sqft
                              </p>
                            </div>
                          </div>

                          {/* Section: Price & Price/SqFt */}
                          <div className="p-4 sm:p-5 space-y-2 bg-[#FAF9F6] dark:bg-[#141413]">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold block">
                              CAPITAL EXPENDITURE &amp; PRICE
                            </span>
                            <div className="flex items-baseline justify-between">
                              <span className="font-mono text-2xl font-extrabold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                                {formatCurrency(deal.price)}
                              </span>
                              {priceSqft > 0 && (
                                <span className="font-mono text-xs font-semibold text-[#666562] dark:text-[#9A9893]">
                                  ${priceSqft} / sqft
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-[#666562] dark:text-[#9A9893] flex justify-between pt-1 border-t border-[#EBEAE6] dark:border-[#222220]">
                              <span>Equity Down (20%):</span>
                              <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">
                                {formatCurrency(deal.price * 0.2)}
                              </span>
                            </div>
                          </div>

                          {/* Section: Base ADR & Peak ADR */}
                          <div className="p-4 sm:p-5 space-y-2.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24] font-bold block">
                              AVERAGE DAILY RATE DYNAMICS
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-center font-mono">
                              <div className="p-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#EBEAE6] dark:border-[#282825]">
                                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                                  Base ADR
                                </span>
                                <span className="text-base font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                                  ${deal.baseAdr}
                                </span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#EBEAE6] dark:border-[#282825]">
                                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                                  Peak ADR
                                </span>
                                <span className="text-base font-bold text-[#D97706] dark:text-[#FBBF24] tabular-nums">
                                  ${peakAdr}
                                </span>
                              </div>
                            </div>
                            <div className="text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] flex justify-between">
                              <span>Min Comp: ${minCompAdr}/nt</span>
                              <span className="text-[#059669] dark:text-[#34D399]">
                                +{Math.round(((peakAdr - deal.baseAdr) / deal.baseAdr) * 100)}% seasonal spread
                              </span>
                            </div>
                          </div>

                          {/* Section: Occupancy & Break-Even Occupancy */}
                          <div className="p-4 sm:p-5 space-y-2.5 bg-[#FAF9F6] dark:bg-[#141413]">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold block">
                              OCCUPANCY &amp; DEBT HURDLE
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-center font-mono">
                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#EBEAE6] dark:border-[#282825]">
                                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                                  Stabilized
                                </span>
                                <span className="text-base font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                                  {deal.baseOccupancy}%
                                </span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#EBEAE6] dark:border-[#282825]">
                                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                                  Break-Even
                                </span>
                                <span className="text-base font-bold text-[#666562] dark:text-[#A3A19B] tabular-nums">
                                  {breakEvenOcc}%
                                </span>
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-mono text-[#065F46] dark:text-[#34D399] flex items-center justify-between">
                              <span>Safety Margin:</span>
                              <span className="font-bold">+{safetyMargin}% Occupancy Spread</span>
                            </div>
                          </div>

                          {/* Section: DSCR Ratio (highlighting >= 1.25x in emerald) */}
                          <div className="p-4 sm:p-5 space-y-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold block">
                              LENDER DEBT SERVICE COVERAGE (DSCR)
                            </span>
                            <div
                              className={`p-3.5 rounded-xl border font-mono flex items-center justify-between transition-all ${
                                metrics.dscrRatio >= 1.25
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                                  : 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                              }`}
                            >
                              <div>
                                <span className="text-2xl font-extrabold tabular-nums block">
                                  {metrics.dscrRatio.toFixed(2)}x
                                </span>
                                <span className="text-[10px] font-sans font-medium">
                                  {metrics.dscrRatio >= 1.25
                                    ? '✓ Clears Prime DSCR Hurdle (≥1.25x)'
                                    : 'Sub-prime debt ratio (<1.25x)'}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                  metrics.dscrRatio >= 1.25
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-amber-600 text-white'
                                }`}
                              >
                                {metrics.dscrRatio >= 1.25 ? 'QUALIFIED' : 'STRESSED'}
                              </span>
                            </div>
                          </div>

                          {/* Section: Cash-on-Cash Return & Cap Rate */}
                          <div className="p-4 sm:p-5 space-y-2.5 bg-[#FAF9F6] dark:bg-[#141413]">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold block">
                              RETURN PROFILE &amp; CAP RATE
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-center font-mono">
                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#EBEAE6] dark:border-[#282825]">
                                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                                  CoC Return
                                </span>
                                <span className="text-lg font-bold text-[#059669] dark:text-[#34D399] tabular-nums">
                                  {formatPercent(metrics.cashOnCashReturn)}
                                </span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#EBEAE6] dark:border-[#282825]">
                                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] uppercase block">
                                  Cap Rate
                                </span>
                                <span className="text-lg font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">
                                  {formatPercent(metrics.capRate)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Section: Monthly Free Cash Flow */}
                          <div className="p-4 sm:p-5 space-y-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold block">
                              NET MONTHLY FREE CASH FLOW
                            </span>
                            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#EBEAE6] dark:border-[#282825] flex items-center justify-between font-mono">
                              <div>
                                <span className="text-lg font-extrabold text-[#111110] dark:text-[#F4F3EF] tabular-nums block">
                                  +${Math.round(metrics.netCashFlowMonthly).toLocaleString()} / mo
                                </span>
                                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874]">
                                  +${Math.round(metrics.netCashFlowMonthly * 12).toLocaleString()} annual
                                </span>
                              </div>
                              <span className="text-xs text-[#059669] dark:text-[#34D399] font-bold">
                                Distributable
                              </span>
                            </div>
                          </div>

                          {/* Section: HOA / STR Permit status with verbatim legal clause */}
                          <div className="p-4 sm:p-5 space-y-3 bg-[#FAF9F6] dark:bg-[#141413]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F8D88] dark:text-[#7A7874] font-bold">
                                ZONING &amp; CC&amp;R VERDICT
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  legal.status === 'PERMITTED'
                                    ? 'bg-[#E8F5EE] dark:bg-[#064E3B]/60 text-[#059669] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]'
                                    : legal.status === 'CONDITIONAL'
                                    ? 'bg-[#FEF3C7] dark:bg-[#78350F]/60 text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#92400E]'
                                    : 'bg-[#FEE2E2] dark:bg-[#7F1D1D]/60 text-[#991B1B] dark:text-[#FCA5A5] border border-[#FECACA] dark:border-[#991B1B]'
                                }`}
                              >
                                {legal.status}
                              </span>
                            </div>

                            {/* Section citation header */}
                            <div className="text-[11px] font-mono font-semibold text-[#111110] dark:text-[#F4F3EF]">
                              {legal.section}
                            </div>

                            {/* Verbatim Legal Clause Blockquote */}
                            <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1A] border border-[#E5E4DF] dark:border-[#2C2C28] text-xs font-serif italic text-[#37352F] dark:text-[#D5D3CC] leading-relaxed shadow-2xs">
                              &ldquo;{legal.verbatim}&rdquo;
                            </div>

                            <div className="text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] space-y-1">
                              <div>🚗 {legal.parking}</div>
                              <div>🌙 {legal.quietHours}</div>
                            </div>
                          </div>

                          {/* Action Button: "Underwrite Target" */}
                          <div className="p-4 sm:p-5">
                            <button
                              type="button"
                              onClick={() => handleUnderwriteTarget(deal)}
                              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#111110] dark:bg-[#F4F3EF] hover:bg-black dark:hover:bg-white text-white dark:text-[#111110] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                            >
                              <span>Underwrite Target</span>
                              <span className="text-[#D97706] font-bold">→</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
