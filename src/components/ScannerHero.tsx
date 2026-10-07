import React, { useState, useMemo } from 'react';
import { FinancingType, PropertyDeal } from '../types';
import { computeUnderwriting, formatCurrency, formatPercent } from '../utils/calculator';
import { MarketPulseWidget } from './MarketPulseWidget';
import { AgentPetAvatar, PetType } from './dashboard/AgentPetAvatar';
import { MuseCompCard } from './common/MuseCompCard';

interface ScannerHeroProps {
  currentDeal: PropertyDeal;
  onSelectDeal: (deal: PropertyDeal) => void;
  allDeals: PropertyDeal[];
  onOpenLenderMemo: () => void;
  onNavigateToHoaAudit: () => void;
  onNavigateToUnderwriter: () => void;
  onEnterDashboard?: () => void;
}

export const ScannerHero: React.FC<ScannerHeroProps> = ({
  currentDeal,
  onSelectDeal,
  allDeals,
  onOpenLenderMemo,
  onNavigateToHoaAudit,
  onNavigateToUnderwriter,
  onEnterDashboard,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [strategy, setStrategy] = useState<FinancingType>('dscr');

  // Sliders state initialized to currentDeal
  const [adr, setAdr] = useState<number>(currentDeal.baseAdr);
  const [occupancy, setOccupancy] = useState<number>(currentDeal.baseOccupancy);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Sync state if currentDeal changes
  React.useEffect(() => {
    setAdr(currentDeal.baseAdr);
    setOccupancy(currentDeal.baseOccupancy);
  }, [currentDeal]);

  // Recalculate metrics in real-time
  const metrics = useMemo(() => {
    return computeUnderwriting(currentDeal, adr, occupancy, strategy);
  }, [currentDeal, adr, occupancy, strategy]);

  const handlePencilDeal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsScanning(true);
    setScanSuccess(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);

      // Check if user URL matches any known location, else pick another deal
      const inputLower = urlInput.toLowerCase();
      let matched = allDeals.find(d => 
        inputLower.includes(d.location.toLowerCase().split(',')[0]) ||
        inputLower.includes(d.mlsNumber)
      );

      if (!matched) {
        // Toggle or load current deal
        matched = currentDeal;
      }
      onSelectDeal(matched);

      setTimeout(() => {
        setScanSuccess(false);
      }, 2500);
    }, 850);
  };

  const handleBenchmarkClick = (deal: PropertyDeal) => {
    setUrlInput(`https://www.mls.com/listing/${deal.mlsNumber}/${deal.title.toLowerCase().replace(/\s+/g, '-')}`);
    onSelectDeal(deal);
  };

  // Find max monthly revenue for bar chart normalization
  const maxMonthRev = useMemo(() => {
    return Math.max(...currentDeal.seasonality.map(m => m.revenue), 15000);
  }, [currentDeal]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. Hero Input & Editorial Typography */}
      <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 pt-10 sm:pt-14 pb-6 text-center flex flex-col items-center">
        {/* Top Rectangle Pill Bar */}
        <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-1.5 rounded-lg bg-white/95 dark:bg-[#161615]/95 border border-[#E2E0D9] dark:border-[#2A2926] shadow-2xs mb-6 text-xs font-mono text-[#575550] dark:text-[#A8A59E] hover:border-[#111110]/40 dark:hover:border-[#73716B] transition-all backdrop-blur-xs">
          <div className="flex items-center gap-2 font-sans font-semibold text-[#111110] dark:text-[#F4F3EF]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
            </span>
            <span>Institutional Real Estate Intelligence</span>
          </div>
          <span className="text-[#D4D1C8] dark:text-[#383733]">·</span>
          <span className="font-sans text-[11px] sm:text-xs text-[#575550] dark:text-[#A8A59E]">Autonomous Acquisition &amp; Debt Modeling</span>
          <span className="text-[#D4D1C8] dark:text-[#383733] hidden sm:inline">·</span>
          <span className="text-[#D97706] dark:text-[#F59E0B] font-semibold text-[11px] sm:text-xs flex items-center gap-1">
            <span>Verified Market Comps</span>
          </span>
        </div>

        {/* Editorial Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-[64px] md:leading-[1.1] font-extrabold tracking-[-0.03em] text-[#111110] dark:text-[#F4F3EF] max-w-4xl mb-5 text-balance">
          Stop guessing on Airbnb cash flow. <br />
          <span className="italic font-normal text-[#92400E] dark:text-[#F59E0B]">Underwrite the truth</span> in seconds.
        </h1>

        <p className="text-base md:text-lg text-[#666562] dark:text-[#9A9893] max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
          Autonomous deal discovery, multi-tier DSCR financing models, and instant AI CC&amp;R covenant audits before you tour.
        </p>

        {/* URL Input Form Container */}
        <form
          onSubmit={handlePencilDeal}
          className="w-full max-w-3xl bg-white dark:bg-[#161615] border border-[#E2E0D9] dark:border-[#262624] rounded-xl p-2 shadow-sm flex flex-col sm:flex-row items-center gap-2.5 transition-all focus-within:border-[#111110]/50 dark:focus-within:border-[#F4F3EF]/50"
        >
          <div className="flex items-center w-full gap-3 px-3 text-[#111110] dark:text-[#F4F3EF]">
            <svg className="w-5 h-5 text-[#8F8D88] dark:text-[#9A9893]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input
              className="w-full bg-transparent text-[#111110] dark:text-[#F4F3EF] placeholder-[#8F8D88] dark:placeholder-[#7A7874] text-sm md:text-base focus:outline-none font-mono py-1.5"
              placeholder="Paste Zillow, Redfin, or MLS listing URL..."
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] px-5 py-2.5 rounded-lg hover:bg-black dark:hover:bg-white transition-all shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-80"
          >
            {isScanning ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11 11 13.5 8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C10 2.5 12 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Ingesting MLS...</span>
              </>
            ) : scanSuccess ? (
              <>
                <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5L10 3L12.5 2.5L13.5 5L15.5 6.5L14.5 9L15.5 11.5L13.5 13L12.5 15.5L10 15L8 16.5L6 15L3.5 15.5L2.5 13L0.5 11.5L1.5 9L0.5 6.5L2.5 5L3.5 2.5L6 3L8 1.5Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Model Verified</span>
              </>
            ) : (
              <>
                <span>Pencil Deal</span>
                <span className="text-[#D97706] dark:text-[#B45309] font-bold text-sm">↵</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Benchmarks with scale-102 hover tactile feedback */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 text-xs font-mono text-[#666562] dark:text-[#9A9893]">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8F8D88] dark:text-[#7A7874]">
            Featured Benchmarks:
          </span>
          {allDeals.map((deal) => (
            <button
              key={deal.id}
              onClick={() => handleBenchmarkClick(deal)}
              className={`px-3.5 py-1.5 border rounded-lg transition-all duration-300 ease-out hover:scale-[1.02] shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                currentDeal.id === deal.id
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] border-[#111110] dark:border-[#F4F3EF] font-bold shadow-sm'
                  : 'bg-white dark:bg-[#1A1A18] border-[#E5E4DF] dark:border-[#262624] text-[#111110] dark:text-[#F4F3EF] hover:border-[#111110]/40 dark:hover:border-[#73716B]'
              }`}
            >
              <span>{deal.title}</span>
              <span className={`text-[10px] font-normal ${currentDeal.id === deal.id ? 'text-[#D97706] dark:text-[#92400E]' : 'text-[#8F8D88] dark:text-[#7A7874]'}`}>
                ${(deal.price / 1000).toFixed(0)}k · {deal.location.split(',')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Autonomous Scribe Animal Mascot & Cyber Shape Squad Strip */}
        <div className="w-full max-w-4xl mt-6 p-3 rounded-2xl bg-white/80 dark:bg-[#181816]/80 backdrop-blur-md border border-[#E5E4DF] dark:border-[#282826] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-left">
            <span className="text-sm">🐾</span>
            <div>
              <div className="text-xs font-semibold text-[#111110] dark:text-[#F4F3EF] flex items-center gap-1.5">
                <span>Autonomous Scribes &amp; Cyber Shapes</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#E8F5EE] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399]">
                  30 COMPANIONS
                </span>
              </div>
              <p className="text-[11px] text-[#787570] dark:text-[#A3A09A]">
                Choose between distinct animal mascots or geometric cyber shapes (dots, prism bot, tesseract).
              </p>
            </div>
          </div>

          {/* Animal mascot & cyber shape avatars row */}
          <div className="flex items-center -space-x-1.5 overflow-x-auto py-1 px-1">
            {[
              { type: 'owl' as PetType, name: 'Archie', role: 'Chief Scribe 🦉' },
              { type: 'cyber-bot' as PetType, name: 'Byte', role: 'Prism Bot 🤖' },
              { type: 'quantum-dots' as PetType, name: 'Dotsy', role: 'Quantum Dots ⠕' },
              { type: 'shiba' as PetType, name: 'Pip', role: 'Comp Scout 🐕' },
              { type: 'hex-shield' as PetType, name: 'Aegis', role: 'Hex Droid 🛡️' },
              { type: 'tesseract' as PetType, name: 'Tess', role: 'Hypercube 🧊' },
              { type: 'cat' as PetType, name: 'Miso', role: 'Debt & DSCR 🐈' },
              { type: 'whale' as PetType, name: 'Bubbles', role: 'Ocean Spout 🐋' },
              { type: 'pulse-core' as PetType, name: 'Aura', role: 'Pulse Core 🔮' },
              { type: 'beaver' as PetType, name: 'Barnaby', role: 'Zoning & CC&R 🦫' },
              { type: 'chrono-gyro' as PetType, name: 'Chrono', role: 'Gyro Droid ⚙️' },
              { type: 'delta-prism' as PetType, name: 'Vector', role: 'Delta Prism 💎' },
              { type: 'badger' as PetType, name: 'Rocky', role: 'Tough Zoning 🦡' },
              { type: 'fox' as PetType, name: 'Rusty', role: 'ADR Yield 🦊' },
              { type: 'astro-star' as PetType, name: 'Nova-Star', role: 'Stellar Tetra ⭐' },
              { type: 'lion' as PetType, name: 'Leo', role: 'Equity Waterfall 🦁' },
              { type: 'sloth' as PetType, name: 'Snooze', role: 'Slow Yield 🦥' },
              { type: 'bee' as PetType, name: 'Buzz', role: 'Hyper-Yield 🐝' },
              { type: 'frog' as PetType, name: 'Finley', role: 'Liquidity Leap 🐸' },
              { type: 'falcon' as PetType, name: 'Swift', role: 'Stealth Scout 🦅' },
              { type: 'flamingo' as PetType, name: 'Coral', role: 'Equity Flamingo 🦩' },
              { type: 'turtle' as PetType, name: 'Shelly', role: 'Capital Shield 🐢' },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={onEnterDashboard}
                title={`${p.name}: ${p.role} · Click to open Agent Chat`}
                className="transition-transform hover:scale-125 hover:z-20 cursor-pointer focus:outline-none"
              >
                <div className="p-0.5 rounded-full bg-white dark:bg-[#222220] ring-1 ring-[#E5E4DF] dark:ring-[#333330] shadow-2xs">
                  <AgentPetAvatar petType={p.type} size="sm" isWorking={idx === 1 || idx === 3} />
                </div>
              </button>
            ))}
          </div>

          {onEnterDashboard && (
            <button
              type="button"
              onClick={onEnterDashboard}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:bg-black dark:hover:bg-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Meet Companions</span>
              <span className="text-[#D97706] font-bold">→</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. HERO DASHBOARD (Active Live Underwriting Terminal) */}
      <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 my-4">
        <div className="bg-white dark:bg-[#141413] border border-[#E5E4DF] dark:border-[#262624] rounded-xl shadow-2xl overflow-hidden">
          {/* Terminal Header Bar */}
          <div className="bg-[#FBF9F5] dark:bg-[#181816] border-b border-[#E6E4DD] dark:border-[#272624] px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
              <span className="font-semibold text-[#1D1C1A] dark:text-[#F5F3ED] font-sans">
                {currentDeal.title}
              </span>
              <span className="text-[#8C8880] dark:text-[#737069]">·</span>
              <span className="text-[#6E6B65] dark:text-[#9E9B93] font-mono">
                {currentDeal.location}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[#6E6B65] dark:text-[#9E9B93] text-xs font-mono">
              <span>MLS #{currentDeal.mlsNumber}</span>
              <span className="text-[#D4D1C8] dark:text-[#383733]">·</span>
              <span>{currentDeal.beds} Beds · {currentDeal.baths} Baths</span>
            </div>
          </div>

          {/* 2-Column Live Underwriting Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E4DF] dark:divide-[#262624]">
            {/* Left Sub-Panel: Scanned Deal & Property Card */}
            <div className="lg:col-span-6 p-6 flex flex-col justify-between space-y-5">
              <div>
                {/* Edge-to-edge Property Image with Overlay Tag and subtle scale-102 tactile hover */}
                <div className="relative rounded-lg overflow-hidden border border-[#E5E4DF] dark:border-[#262624] aspect-[16/9] shadow-sm group transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md cursor-pointer">
                  <img
                    alt={currentDeal.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    src={currentDeal.imageUrl}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111110]/85 via-[#111110]/20 to-transparent"></div>

                  {/* Floating Price Drop Tag */}
                  {currentDeal.priceDrop && (
                    <div className="absolute top-3 left-3 bg-[#D97706] text-white text-[11px] font-sans font-semibold px-2.5 py-1 rounded shadow-sm flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6.5 8.5L9.5 5.5L13.5 11.5M13.5 11.5H9.5M13.5 11.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>Price reduced by {formatCurrency(currentDeal.priceDrop)}</span>
                    </div>
                  )}

                  {/* Photo bottom details */}
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                    <div>
                      <span className="text-[11px] font-sans text-[#FEF3C7] font-medium tracking-wide block">
                        Verified Investment Asset
                      </span>
                      <h4 className="text-xl font-bold font-sans">{currentDeal.title}</h4>
                    </div>
                    <span className="font-mono text-2xl font-extrabold text-white tracking-tight tabular-nums">
                      {formatCurrency(currentDeal.price)}
                    </span>
                  </div>
                </div>

                {/* Property Specs Bar */}
                <div className="mt-4 p-3 rounded-lg bg-[#FBF9F5] dark:bg-[#181816] border border-[#E6E4DD] dark:border-[#272624] flex flex-wrap items-center justify-between gap-2 text-xs text-[#1D1C1A] dark:text-[#F5F3ED]">
                  <span className="font-semibold text-[#6E6B65] dark:text-[#9E9B93]">{currentDeal.location}</span>
                  <span className="text-[#D4D1C8] dark:text-[#383733]">·</span>
                  <span>{currentDeal.beds} Bed / {currentDeal.baths} Bath</span>
                  <span className="text-[#D4D1C8] dark:text-[#383733]">·</span>
                  <span>{currentDeal.sqft.toLocaleString()} sq ft</span>
                  <span className="text-[#D4D1C8] dark:text-[#383733]">·</span>
                  <span className="font-medium text-[#059669] dark:text-[#34D399]">Turnkey STR</span>
                </div>
              </div>

              {/* 12-Month Seasonality Projected Revenue Chart */}
              <div className="p-4 rounded-lg bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-wider text-[11px] block">
                      12-Month Projected Revenue
                    </span>
                    <p className="text-[11px] text-[#666562] dark:text-[#9A9893] font-mono tabular-nums">
                      ${(currentDeal.seasonality[0].revenue / 1000).toFixed(1)}k/mo ({currentDeal.seasonality[0].name.slice(0,3)}) → ${(currentDeal.seasonality.find(s => s.isPeak)?.revenue || 14200)/1000}k/mo (Peak)
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold bg-[#E8F5EE] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399] px-2 py-0.5 rounded">
                    PEAK: {currentDeal.seasonality.find(s => s.isPeak)?.name.toUpperCase() || 'OCT'} RUN
                  </span>
                </div>

                {/* Seasonality Bar Graph */}
                <div className="h-24 w-full flex items-end gap-1.5 pt-2">
                  {currentDeal.seasonality.map((s, idx) => {
                    const heightPercent = Math.max(Math.round((s.revenue / maxMonthRev) * 100), 20);
                    const isPeak = s.isPeak;
                    const isHovered = hoveredMonth === idx;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                        onMouseEnter={() => setHoveredMonth(idx)}
                        onMouseLeave={() => setHoveredMonth(null)}
                      >
                        {/* Hover Tooltip */}
                        {isHovered && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#111110] text-white text-[10px] px-2 py-1 rounded font-mono shadow-md z-20 whitespace-nowrap">
                            <span className="font-bold">{s.name}: </span>
                            <span>{formatCurrency(s.revenue)}</span>
                            <div className="text-[9px] text-[#FEF3C7]">{s.occupancy}% Occ · ${s.adr} ADR</div>
                          </div>
                        )}

                        <div
                          className={`w-full rounded-t transition-all ${
                            isPeak
                              ? 'bg-[#059669] hover:opacity-90'
                              : isHovered
                              ? 'bg-[#D97706]'
                              : s.revenue > 11000
                              ? 'bg-[#D97706]/75 hover:bg-[#D97706]'
                              : 'bg-[#8F8D88]/25 dark:bg-[#8F8D88]/40 hover:bg-[#8F8D88]/50'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <span
                          className={`text-[9px] font-mono ${
                            isPeak ? 'font-bold text-[#059669] dark:text-[#34D399]' : 'text-[#8F8D88] dark:text-[#7A7874]'
                          }`}
                        >
                          {s.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sub-Panel: Live Underwriting & DSCR Engine */}
            <div className="lg:col-span-6 p-6 flex flex-col justify-between space-y-6">
              {/* Strategy Selector Segmented Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#666562] dark:text-[#9A9893] uppercase tracking-wider">
                    Financing Strategy
                  </span>
                  <span className="text-[11px] font-mono text-[#8F8D88] dark:text-[#7A7874]">Model 3.1</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F9F8F5] dark:bg-[#1A1A18] rounded-lg border border-[#E5E4DF] dark:border-[#262624] text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setStrategy('conventional')}
                    className={`py-2 rounded font-medium transition-all cursor-pointer ${
                      strategy === 'conventional'
                        ? 'bg-white dark:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] font-bold shadow-sm border border-[#E5E4DF] dark:border-[#2E2E2B]'
                        : 'text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                    }`}
                  >
                    Conventional
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrategy('dscr')}
                    className={`py-2 rounded font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      strategy === 'dscr'
                        ? 'bg-white dark:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] font-bold shadow-sm border border-[#E5E4DF] dark:border-[#2E2E2B]'
                        : 'text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                    <span>DSCR {metrics.dscrRatio.toFixed(2)}x (Active)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrategy('seller_carry')}
                    className={`py-2 rounded font-medium transition-all cursor-pointer ${
                      strategy === 'seller_carry'
                        ? 'bg-white dark:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] font-bold shadow-sm border border-[#E5E4DF] dark:border-[#2E2E2B]'
                        : 'text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                    }`}
                  >
                    Seller Carry
                  </button>
                </div>
              </div>

              {/* Key Returns Bar */}
              <div className="p-4 rounded-xl bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
                <div className="grid grid-cols-2 gap-4 divide-x divide-[#E5E4DF] dark:divide-[#262624]">
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-[#666562] dark:text-[#9A9893] uppercase tracking-wider block mb-1">
                      Cash-on-Cash Return
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-extrabold text-[#0B3B24] dark:text-[#34D399] tracking-tight tabular-nums">
                        {formatPercent(metrics.cashOnCashReturn)}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#059669] dark:text-[#34D399]">CoC</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#666562] dark:text-[#9A9893] mt-1 block">
                      Tier-1 Yield Zone · {formatPercent(metrics.capRate)} Cap
                    </span>
                  </div>
                  <div className="pl-4">
                    <span className="text-[11px] font-mono font-semibold text-[#666562] dark:text-[#9A9893] uppercase tracking-wider block mb-1">
                      Levered Monthly Flow
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-extrabold text-[#111110] dark:text-[#F4F3EF] tracking-tight tabular-nums">
                        {metrics.netCashFlowMonthly >= 0 ? '+' : ''}{formatCurrency(metrics.netCashFlowMonthly)}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#666562] dark:text-[#9A9893]">/mo</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#0B3B24] dark:text-[#34D399] mt-1 block font-bold tabular-nums">
                      {formatCurrency(metrics.netCashFlowAnnual)} Annual Net
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Scrubbers */}
              <div className="space-y-4">
                {/* ADR Scrubber */}
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">Average Daily Rate (ADR)</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF] bg-[#F9F8F5] dark:bg-[#1E1E1C] px-2 py-0.5 rounded border border-[#E5E4DF] dark:border-[#2E2E2B] tabular-nums">
                      ${adr} / night
                    </span>
                  </div>
                  <input
                    type="range"
                    min={currentDeal.minCompAdr}
                    max={currentDeal.peakHighAdr}
                    value={adr}
                    onChange={(e) => setAdr(Number(e.target.value))}
                    className="w-full accent-[#111110] dark:accent-[#F4F3EF] cursor-pointer h-2 bg-[#F1EFEB] dark:bg-[#252522] rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] mt-1">
                    <span>${currentDeal.minCompAdr} Comp Min</span>
                    <span>${currentDeal.peakHighAdr} Peak High</span>
                  </div>
                </div>

                {/* Occupancy Scrubber */}
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">Stabilized Occupancy</span>
                    <span className="font-bold text-[#111110] dark:text-[#F4F3EF] bg-[#F9F8F5] dark:bg-[#1E1E1C] px-2 py-0.5 rounded border border-[#E5E4DF] dark:border-[#2E2E2B] tabular-nums">
                      {occupancy}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={85}
                    value={occupancy}
                    onChange={(e) => setOccupancy(Number(e.target.value))}
                    className="w-full accent-[#D97706] cursor-pointer h-2 bg-[#F1EFEB] dark:bg-[#252522] rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] mt-1">
                    <span>{currentDeal.breakEvenOccupancy}% Break-even DSCR 1.05x</span>
                    <span>{currentDeal.topMarketOccupancy}% Market Top 10%</span>
                  </div>
                </div>
              </div>

              {/* CC&R Banner Pill */}
              <div
                onClick={onNavigateToHoaAudit}
                className="p-3.5 rounded-lg bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono cursor-pointer hover:border-[#111110]/40 dark:hover:border-[#E5E4DF]/40 transition-colors"
                title="Click to view full HOA & CC&R AI Audit"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0B3B24] dark:bg-[#064E3B] text-white flex items-center justify-center text-[10px] font-bold">
                    <svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="font-bold text-[#111110] dark:text-[#F4F3EF] uppercase tracking-tight">
                    {currentDeal.hoaStatus.statusText} ({currentDeal.hoaStatus.section})
                  </span>
                </div>
                {currentDeal.hoaStatus.warningNote && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FEF3C7] dark:bg-[#78350F]/30 text-[#92400E] dark:text-[#FDE68A] font-bold text-[11px] border border-[#D97706]/20 self-start sm:self-auto">
                    <svg className="w-3.5 h-3.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L14.5 13.5H1.5L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6.5V9.5M8 11.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {currentDeal.hoaStatus.warningNote}
                  </span>
                )}
              </div>

              {/* Autonomous Scribe Audit Verification Badges */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181816] border border-[#E8E6DF] dark:border-[#282725] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#111110] dark:text-[#F4F3EF]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🐾</span>
                    <span>Scribe Mesh Audit Verdicts</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#059669] dark:text-[#34D399] font-bold">
                    ✓ 4 AUDITS PASSED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#20201E] border border-[#E5E4DF] dark:border-[#2A2A28]">
                    <div className="p-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#141413]">
                      <AgentPetAvatar petType="owl" size="xs" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-[#111110] dark:text-[#F4F3EF] block text-[11px] truncate">
                        🦉 Archie (Lead)
                      </span>
                      <span className="text-[10px] text-[#787570] dark:text-[#A3A09A] font-mono">
                        NOI: $52.8k/yr verified
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#20201E] border border-[#E5E4DF] dark:border-[#2A2A28]">
                    <div className="p-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#141413]">
                      <AgentPetAvatar petType="cat" size="xs" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-[#111110] dark:text-[#F4F3EF] block text-[11px] truncate">
                        🐈 Miso (DSCR)
                      </span>
                      <span className="text-[10px] text-[#787570] dark:text-[#A3A09A] font-mono">
                        1.48x debt ratio cleared
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#20201E] border border-[#E5E4DF] dark:border-[#2A2A28]">
                    <div className="p-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#141413]">
                      <AgentPetAvatar petType="beaver" size="xs" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-[#111110] dark:text-[#F4F3EF] block text-[11px] truncate">
                        🦫 Barnaby (Zoning)
                      </span>
                      <span className="text-[10px] text-[#787570] dark:text-[#A3A09A] font-mono">
                        CC&R Article IV green
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#20201E] border border-[#E5E4DF] dark:border-[#2A2A28]">
                    <div className="p-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#141413]">
                      <AgentPetAvatar petType="shiba" size="xs" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-[#111110] dark:text-[#F4F3EF] block text-[11px] truncate">
                        🐕 Pip (Comps)
                      </span>
                      <span className="text-[10px] text-[#787570] dark:text-[#A3A09A] font-mono">
                        52 comps synced
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Launch Terminal, Download Memo & Go to Full Underwriter */}
              <div className="space-y-2">
                {onEnterDashboard && (
                  <button
                    type="button"
                    onClick={onEnterDashboard}
                    className="w-full min-h-[46px] py-3 px-6 rounded-lg bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:bg-neutral-800 dark:hover:bg-white transition-all font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    <span>🐾 Launch Deal Terminal &amp; Agent Chat</span>
                    <span className="text-[#D97706] dark:text-[#B45309] font-bold">→</span>
                  </button>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={onOpenLenderMemo}
                    className="flex-1 min-h-[42px] py-2.5 px-4 rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2B] bg-white dark:bg-[#1E1E1C] hover:bg-[#F9F8F5] dark:hover:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] transition-all font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <span>Lender Memo (PDF)</span>
                    <span className="text-[#D97706]">↓</span>
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateToUnderwriter}
                    className="min-h-[42px] py-2.5 px-4 rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2B] bg-white dark:bg-[#1E1E1C] hover:bg-[#F9F8F5] dark:hover:bg-[#252522] text-[#111110] dark:text-[#F4F3EF] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap active:scale-[0.98]"
                    title="Open Full Financial Modeler"
                  >
                    Studio Calculator
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 LIVE MARKET PULSE (Google Search Grounded Regulations & Trends) */}
      <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10">
        <MarketPulseWidget currentRegion={currentDeal.location} />
      </section>

      {/* 3. SCANNED STR COHORTS & AIRBNB COMPS (Tactile scale-102 property cards) */}
      <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E5E4DF] dark:border-[#262624] gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold text-[#92400E] dark:text-[#FBBF24] uppercase tracking-wider mb-1">
              Active MLS &amp; Airbnb Market Comps
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#111110] dark:text-[#F4F3EF]">
              Scanned Cohort Properties
            </h3>
          </div>
          <p className="text-xs font-mono text-[#666562] dark:text-[#9A9893] max-w-md">
            Click any property to load instant cash flow modeling, CC&amp;R audit citations, and debt DSCR sensitivity.
          </p>
        </div>

        {/* Pinterest / Muse High-Craft Visual Comps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDeals.map((deal) => (
            <MuseCompCard
              key={deal.id}
              deal={deal}
              isSelected={currentDeal.id === deal.id}
              onSelect={(d) => {
                onSelectDeal(d as PropertyDeal);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              onNavigateToUnderwriter={() => {
                onSelectDeal(deal);
                onNavigateToUnderwriter();
              }}
              onNavigateToAudit={() => {
                onSelectDeal(deal);
                onNavigateToHoaAudit();
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
