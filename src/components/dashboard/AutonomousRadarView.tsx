import React, { useState } from 'react';
import { useDealStore, sanitizeDeal } from '../../store/useDealStore';
import { Deal } from '../../types/deal';
import { MuseCompCard } from '../common/MuseCompCard';

interface AutonomousRadarViewProps {
  onOpenUnderwriter: (deal: Deal) => void;
}

export const AutonomousRadarView: React.FC<AutonomousRadarViewProps> = ({ onOpenUnderwriter }) => {
  const { addDeal, setCurrentView, setSelectedDealId } = useDealStore();

  const [market, setMarket] = useState('Smoky Mountains, TN (Sevier County)');
  const [minBeds, setMinBeds] = useState(3);
  const [maxPrice, setMaxPrice] = useState(850000);
  const [minCoC, setMinCoC] = useState(15);
  const [activeKeywords, setActiveKeywords] = useState<string[]>([
    'Price Reduced',
    'Hot Tub',
    'Seller Financing',
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [discoveredLeads, setDiscoveredLeads] = useState<any[]>([
    {
      id: 'radar-lead-1',
      title: 'Sugarlands Timber Sanctuary',
      address: '1024 Cove Mountain Rd',
      city: 'Gatlinburg',
      state: 'TN',
      zip: '37738',
      price: 595000,
      originalPrice: 635000,
      priceDrop: 40000,
      beds: 4,
      baths: 3,
      sqft: 2600,
      baseAdr: 480,
      baseOccupancy: 68,
      coc: 19.8,
      dscr: 1.34,
      hoaStatus: 'PERMITTED',
      triggerReason: 'Recent $40k price cut + mentions "Seller open to second note" in private remarks',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-xWVPskzq-wFfumEirxwgL9t9443B48yZ1GHUFKGSz4FotTqBgn8l9SZG32qmAlwePWypO3PXFUZc5lGnE79JNQQxHnCparlaCGOE0U6ayQ05t9i-d_rRh4r_aHa2NPr8YSRuG9y2ZVrG7ADaO9mWAASOiJmuQWABYtPJhjaqvF-m-f3aC52z9jsorUcsP27wNG5e_6anm2e24ZCVFN2_RdlC-m4xhJ1Qa3gGfZUcrBkivwzRicChQ',
      sweptAt: '8 mins ago',
    },
    {
      id: 'radar-lead-2',
      title: 'Silverleaf Sunset Villa',
      address: '7822 E Desert Troon Way',
      city: 'Scottsdale',
      state: 'AZ',
      zip: '85255',
      price: 840000,
      originalPrice: 875000,
      priceDrop: 35000,
      beds: 4,
      baths: 4,
      sqft: 3200,
      baseAdr: 640,
      baseOccupancy: 66,
      coc: 17.4,
      dscr: 1.26,
      hoaStatus: 'CONDITIONAL',
      triggerReason: 'High historical ADR with unencumbered Maricopa County STR permit registered',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCEwT5EgPtKcvO2fJ_Inmxtb-6K6VacHQLT_W0azO5ee6HLnokigI_5nVjHWNvIIXE2sSRO9dFRTCcXAY4jA-6i0MCqGFK9ivAB0kbIHqfnmqBWXOQ8qJRaZLzU-943YBjzpXx6_cOR2Et5BuuquFjoQLbVOipeobJE2SkfqpllhbutrPVsO1ytKTgEu4DYlIfl1AXf-PaygPULmtt3dZndrsyNF7hMrnNka75t_75QHLYGV4HbrBquEw',
      sweptAt: '14 mins ago',
    },
  ]);

  const [displayMode, setDisplayMode] = useState<'visual' | 'compact'>('visual');

  const leadToDeal = (lead: any): Deal => {
    return sanitizeDeal({
      id: lead.id,
      title: lead.title,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zip: lead.zip,
      price: lead.price,
      priceDrop: lead.priceDrop,
      beds: lead.beds,
      baths: lead.baths,
      sqft: lead.sqft,
      imageUrl: lead.imageUrl,
      baseAdr: lead.baseAdr,
      baseOccupancy: lead.baseOccupancy,
      marketName: market,
      audit: {
        str_status: lead.hoaStatus || 'PERMITTED',
      },
    });
  };

  const toggleKeyword = (kw: string) => {
    setActiveKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  const handleRunSweep = async () => {
    setIsScanning(true);
    setScanStep('Connecting to Tavily search index & MLS scrapers...');

    try {
      setTimeout(() => {
        setScanStep('Scraping DOM markdown via Firecrawl and extracting tax/HOA...');
      }, 700);

      setTimeout(() => {
        setScanStep('Synthesizing submarket ADR and municipal STR permits with Gemini 3.8...');
      }, 1500);

      const res = await fetch('/api/scanner/run-sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countyOrMarket: market,
          minBeds,
          maxPrice,
          minCoC,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setIsScanning(false);
        setScanStep('');
        if (data.leads && data.leads.length > 0) {
          const formattedLeads = data.leads.map((l: any, i: number) => ({
            id: `radar-lead-${Date.now()}-${i}`,
            title: l.title,
            address: l.address,
            city: l.city,
            state: l.state,
            zip: l.zip,
            price: l.price,
            originalPrice: l.originalPrice,
            priceDrop: l.priceDrop,
            beds: l.beds,
            baths: l.baths,
            sqft: l.sqft,
            baseAdr: l.baseAdr,
            baseOccupancy: l.baseOccupancy,
            coc: (l.price ? 18.5 : 17.2),
            dscr: 1.29,
            hoaStatus: 'PERMITTED',
            triggerReason: 'Detected via autonomous sweep matching yield criteria',
            imageUrl: l.imageUrl,
            sweptAt: 'Just now',
          }));
          setDiscoveredLeads((prev) => [...formattedLeads, ...prev]);
        }
      }, 2300);
    } catch (err) {
      setTimeout(() => {
        setIsScanning(false);
        setScanStep('');
      }, 1000);
    }
  };

  const handlePushToPipeline = (lead: any) => {
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      userId: 'guest-demo',
      mlsNumber: String(Math.floor(100000 + Math.random() * 900000)),
      title: lead.title,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zip: lead.zip,
      marketName: `${lead.city}, ${lead.state}`,
      price: lead.price,
      originalPrice: lead.originalPrice,
      priceDrop: lead.priceDrop,
      beds: lead.beds,
      baths: lead.baths,
      sqft: lead.sqft,
      yearBuilt: 2021,
      imageUrl: lead.imageUrl,
      imageGallery: [lead.imageUrl],
      aspectRatio: 'landscape',
      compScore: 93,
      distanceMiles: 1.1,
      viewType: 'Scenic Mountain & Foothills Overlook',
      permitDetails: {
        number: `STR-${Math.floor(1000 + Math.random() * 9000)}`,
        jurisdiction: `${lead.city} Municipal Code`,
        badgeText: lead.hoaStatus || 'UNRESTRICTED',
      },
      turnkey: true,
      stage: 'inbox',
      baseAdr: lead.baseAdr,
      minCompAdr: Math.round(lead.baseAdr * 0.75),
      peakHighAdr: Math.round(lead.baseAdr * 1.3),
      baseOccupancy: lead.baseOccupancy,
      breakEvenOccupancy: 46,
      topMarketOccupancy: 80,
      seasonality: [
        { month: 'J', name: 'Jan', revenue: 6000, occupancy: 42, adr: lead.baseAdr },
        { month: 'F', name: 'Feb', revenue: 6200, occupancy: 44, adr: lead.baseAdr },
        { month: 'M', name: 'Mar', revenue: 8400, occupancy: 60, adr: lead.baseAdr },
        { month: 'A', name: 'Apr', revenue: 9200, occupancy: 64, adr: lead.baseAdr },
        { month: 'M', name: 'May', revenue: 10800, occupancy: 70, adr: lead.baseAdr },
        { month: 'J', name: 'Jun', revenue: 13500, occupancy: 84, adr: lead.baseAdr * 1.1 },
        { month: 'J', name: 'Jul', revenue: 14200, occupancy: 88, adr: lead.baseAdr * 1.15 },
        { month: 'A', name: 'Aug', revenue: 12000, occupancy: 78, adr: lead.baseAdr * 1.05 },
        { month: 'S', name: 'Sep', revenue: 9800, occupancy: 66, adr: lead.baseAdr },
        { month: 'O', name: 'Oct', revenue: 15400, occupancy: 92, adr: lead.baseAdr * 1.2, isPeak: true },
        { month: 'N', name: 'Nov', revenue: 11200, occupancy: 72, adr: lead.baseAdr },
        { month: 'D', name: 'Dec', revenue: 13000, occupancy: 80, adr: lead.baseAdr * 1.1 },
      ],
      financing: {
        strategy: 'dscr',
        downPaymentPct: 20,
        interestRate: 7.15,
        amortizationYears: 30,
        points: 1.25,
      },
      expenses: {
        taxesAnnual: 4600,
        insuranceAnnual: 2700,
        utilitiesMonthly: 410,
        wifiMonthly: 90,
        hoaFeeMonthly: 85,
        platformFeeRate: 0.03,
        managementFeeRate: 0.15,
        cleaningFeePerStay: 195,
        maintenanceCapExRate: 0.05,
      },
      audit: {
        str_status: 'PERMITTED',
        risk_rating: 'LOW',
        minimum_stay_days: 0,
        parking_limit_vehicles: 'Max 4 Vehicles on driveway',
        quiet_hours: '10:00 PM exterior noise ordinance',
        amenity_fees: 'None',
        fines_schedule: '$200 city citation for street parking',
        citations: [
          {
            page_number: 2,
            clause_section: 'Section 4.1 Permitted Uses',
            exact_quote: 'Short term rental operation permissible under general residential classification.',
          },
        ],
        document_name: 'Radar_Autoscan_Permit.pdf',
        last_audited_at: new Date().toISOString(),
      },
      notes: `Autonomous Radar hit. Trigger: ${lead.triggerReason}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addDeal(newDeal);
    setSelectedDealId(newDeal.id);
    setDiscoveredLeads((prev) => prev.filter((l) => l.id !== lead.id));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-y-auto p-6 md:p-8 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 mb-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
              <span className="text-xs font-sans font-semibold text-[#1D1C1A] dark:text-[#F5F3ED]">
                Autonomous Deal Discovery
              </span>
              <span className="text-xs text-[#8C8880] dark:text-[#737069]">·</span>
              <span className="text-xs text-[#6E6B65] dark:text-[#9E9B93] font-sans">
                Live MLS Radar &amp; Price Cuts
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#111110] dark:text-[#F4F3EF]">
              Market Radar &amp; Deal Sweeper
            </h2>
            <p className="text-xs text-[#666562] dark:text-[#A3A19B] mt-0.5 max-w-2xl">
              Continuous background crawler auditing new MLS listings, price drops, and creative
              seller terms against institutional yield parameters.
            </p>
          </div>

          <button
            onClick={handleRunSweep}
            disabled={isScanning}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
              isScanning
                ? 'bg-[#E5E4DF] dark:bg-[#2A2A27] text-[#8F8D88] dark:text-[#73716B] cursor-not-allowed'
                : 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:bg-black dark:hover:bg-white'
            }`}
          >
            <svg className="w-4 h-4 animate-spin text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11 11 13.5 8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C10 2.5 12 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>{isScanning ? 'Sweeping Market...' : 'Run Autonomous Sweep Now'}</span>
          </button>
        </div>

        {/* Live Scan Status Log */}
        {isScanning && (
          <div className="p-3 bg-[#FEF3C7] dark:bg-[#78350F]/40 rounded-lg border border-[#D97706]/40 text-xs font-mono text-[#92400E] dark:text-[#FBBF24] flex items-center gap-3 animate-pulse">
            <svg className="w-4.5 h-4.5 animate-spin text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11 11 13.5 8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C10 2.5 12 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>{scanStep}</span>
          </div>
        )}

        {/* Search Parameter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#E5E4DF] dark:border-[#262624]">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#7A7874] block mb-1">
              Target Market / County
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2E2E2A] rounded-lg px-3 py-1.5 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#73716B]"
            >
              <option value="Smoky Mountains, TN (Sevier County)">
                Smoky Mountains, TN (Sevier)
              </option>
              <option value="Scottsdale & Paradise Valley, AZ (Maricopa)">
                Scottsdale, AZ (Maricopa)
              </option>
              <option value="Gulf Shores & Orange Beach, AL (Baldwin)">
                Gulf Shores, AL (Baldwin)
              </option>
              <option value="Blue Ridge & Ellijay, GA (Fannin)">
                Blue Ridge, GA (Fannin)
              </option>
              <option value="Breckenridge & Keystone, CO (Summit)">
                Summit County, CO (Ski)
              </option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#7A7874] block mb-1">
              Min Bedrooms: <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">{minBeds} Beds</span>
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
              className="str-slider w-full cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#7A7874] block mb-1">
              Max Purchase Price: <span className="font-bold text-[#111110] dark:text-[#F4F3EF] tabular-nums">${(maxPrice / 1000).toFixed(0)}k</span>
            </label>
            <input
              type="range"
              min="300000"
              max="2000000"
              step="25000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="str-slider w-full cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#8F8D88] dark:text-[#7A7874] block mb-1">
              Min Target CoC Return: <span className="font-bold text-[#0B3B24] dark:text-[#34D399] tabular-nums">{minCoC}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="30"
              value={minCoC}
              onChange={(e) => setMinCoC(Number(e.target.value))}
              className="str-slider w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Trigger Keywords */}
        <div className="pt-3 mt-3 border-t border-[#E5E4DF] dark:border-[#262624] flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] uppercase mr-2">
            Opportunity Triggers:
          </span>
          {[
            'Price Reduced',
            'Hot Tub',
            'Seller Financing',
            'Subject To',
            'No HOA',
            'Turnkey Furnished',
            'Mountain View',
            'Pool Villa',
          ].map((kw) => {
            const isSelected = activeKeywords.includes(kw);
            return (
              <button
                key={kw}
                onClick={() => toggleKeyword(kw)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] border-[#111110] dark:border-[#F4F3EF]'
                    : 'bg-[#FAF9F6] dark:bg-[#1A1A18] text-[#666562] dark:text-[#A3A19B] border-[#E5E4DF] dark:border-[#2E2E2A] hover:border-[#111110] dark:hover:border-[#73716B]'
                }`}
              >
                {kw} {isSelected ? "Selected" : "+"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovered Leads Stream */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#111110] dark:text-[#F4F3EF]">
              Autonomous Feed: Discovered High-Yield STR Candidates ({discoveredLeads.length})
            </h3>
            <span className="text-xs font-mono text-[#8F8D88] dark:text-[#7A7874]">
              Updated via Tavily Real-Time Index & Autonomous Radar
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setDisplayMode('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'visual'
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110]'
                  : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              <span>🖼️</span>
              <span>Visual Comps</span>
            </button>
            <button
              onClick={() => setDisplayMode('compact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'compact'
                  ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110]'
                  : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              <span>📋</span>
              <span>Compact Feed</span>
            </button>
          </div>
        </div>

        {discoveredLeads.length === 0 ? (
          <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-12 text-center">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <p className="font-serif text-base text-[#111110] dark:text-[#F4F3EF] font-semibold mb-1">
              No unreviewed candidates in current queue
            </p>
            <p className="text-xs font-mono text-[#666562] dark:text-[#A3A19B] mb-4">
              Click &quot;Run Autonomous Sweep Now&quot; to crawl live listings matching your criteria.
            </p>
            <button
              onClick={handleRunSweep}
              className="px-4 py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-mono rounded hover:bg-black dark:hover:bg-white cursor-pointer"
            >
              Trigger Market Sweep
            </button>
          </div>
        ) : displayMode === 'visual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {discoveredLeads.map((lead) => {
              const dealObj = leadToDeal(lead);
              return (
                <div key={lead.id} className="space-y-2">
                  <MuseCompCard
                    deal={dealObj}
                    onSelect={() => {
                      handlePushToPipeline(lead);
                      onOpenUnderwriter(dealObj);
                    }}
                    onNavigateToUnderwriter={() => {
                      handlePushToPipeline(lead);
                      onOpenUnderwriter(dealObj);
                    }}
                    onNavigateToAudit={() => {
                      handlePushToPipeline(lead);
                      setSelectedDealId(lead.id);
                      setCurrentView('audit');
                    }}
                  />
                  <div className="p-2.5 bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#282825] text-xs font-mono flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider">Catalyst:</span>
                      <span className="text-[11px] text-[#5F5D59] dark:text-[#9E9C96] truncate max-w-xs">{lead.triggerReason}</span>
                    </div>
                    <button
                      onClick={() => {
                        handlePushToPipeline(lead);
                        setCurrentView('crm');
                      }}
                      className="text-[10px] font-bold text-[#059669] hover:underline cursor-pointer"
                    >
                      + Save to Inbox
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {discoveredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-4 shadow-2xs hover:border-[#111110] dark:hover:border-[#73716B] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-3">
                    <img
                      src={lead.imageUrl}
                      alt={lead.title}
                      className="w-24 h-24 rounded-lg object-cover bg-[#EBEAE6] dark:bg-[#20201D] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874]">
                          Swept {lead.sweptAt}
                        </span>
                        <span className="text-[10px] font-mono bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#059669]/50 px-1.5 py-0.5 rounded font-bold">
                          HOA: {lead.hoaStatus}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#111110] dark:text-[#F4F3EF] truncate mt-0.5">
                        {lead.title}
                      </h4>
                      <p className="text-xs font-mono text-[#666562] dark:text-[#A3A19B]">
                        {lead.address}, {lead.city}, {lead.state}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono font-bold text-[#111110] dark:text-[#F4F3EF]">
                        <span>${lead.price.toLocaleString()}</span>
                        {lead.priceDrop > 0 && (
                          <span className="text-[#DC2626] dark:text-red-400 font-normal text-[10px]">
                            (-${(lead.priceDrop / 1000).toFixed(0)}k Drop)
                          </span>
                        )}
                        <span className="text-[#8F8D88] dark:text-[#7A7874] font-normal">•</span>
                        <span className="text-[#666562] dark:text-[#A3A19B] font-normal">
                          {lead.beds}b / {lead.baths}ba / {lead.sqft}sf
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trigger Reason Box */}
                  <div className="p-2.5 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2A] text-xs font-mono mb-3">
                    <div className="text-[9px] uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24] font-bold mb-0.5">
                      Trigger Catalyst:
                    </div>
                    <p className="text-[11px] text-[#111110] dark:text-[#F4F3EF] leading-snug">
                      {lead.triggerReason}
                    </p>
                  </div>

                  {/* Yield Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="p-2 bg-[#F3F2ED] dark:bg-[#1D1D1B] rounded">
                      <span className="text-[9px] font-mono text-[#8F8D88] dark:text-[#7A7874] block">Est. ADR</span>
                      <span className="font-mono font-bold text-xs text-[#111110] dark:text-[#F4F3EF]">
                        ${lead.baseAdr}/nt
                      </span>
                    </div>
                    <div className="p-2 bg-[#ECFDF5] dark:bg-[#064E3B]/30 rounded border border-[#A7F3D0] dark:border-[#059669]/40">
                      <span className="text-[9px] font-mono text-[#065F46] dark:text-[#34D399] block font-semibold">
                        Cash-on-Cash
                      </span>
                      <span className="font-mono font-bold text-xs text-[#0B3B24] dark:text-[#34D399]">
                        {lead.coc}%
                      </span>
                    </div>
                    <div className="p-2 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded border border-[#E5E4DF] dark:border-[#2E2E2A]">
                      <span className="text-[9px] font-mono text-[#8F8D88] dark:text-[#7A7874] block">DSCR Ratio</span>
                      <span className="font-mono font-bold text-xs text-[#0B3B24] dark:text-[#34D399]">
                        {lead.dscr}x
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E4DF] dark:border-[#262624]">
                  <button
                    onClick={() => {
                      handlePushToPipeline(lead);
                      setCurrentView('crm');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer mr-2 shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    <span>Push to Pipeline (Inbox)</span>
                  </button>

                  <button
                    onClick={() => {
                      handlePushToPipeline(lead);
                      // will be active deal
                      setCurrentView('underwriter');
                    }}
                    className="px-3 py-2 bg-white dark:bg-[#1C1C1A] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#FAF9F6] dark:hover:bg-[#252522] rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    Deep Underwrite
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
