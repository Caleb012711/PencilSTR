import React from 'react';
import { PropertyDeal } from '../types';

interface CaseStudiesSectionProps {
  allDeals: PropertyDeal[];
  onSelectDeal: (deal: PropertyDeal) => void;
  onNavigateToUnderwriter: () => void;
}

export const CaseStudiesSection: React.FC<CaseStudiesSectionProps> = ({
  allDeals,
  onSelectDeal,
  onNavigateToUnderwriter,
}) => {
  const ridgeDeal = allDeals.find(d => d.id === 'timberline-ridge') || allDeals[0];
  const kierlandDeal = allDeals.find(d => d.id === 'kierland-hideaway') || allDeals[1];

  const handleOpenDeal = (deal: PropertyDeal) => {
    onSelectDeal(deal);
    onNavigateToUnderwriter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 py-12 transition-colors duration-200">
      <div className="bg-white dark:bg-[#141413] p-8 md:p-10 rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-sans font-semibold text-[#92400E] dark:text-[#FBBF24] uppercase tracking-wider block mb-2">
            Audited Case Studies
          </span>
          <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-[#111110] dark:text-[#F4F3EF] tracking-tight">
            From raw MLS link to closed DSCR loan package in 18 minutes.
          </h3>
          <p className="text-xs md:text-sm text-[#666562] dark:text-[#A3A19B] mt-2 leading-relaxed font-sans">
            PencilSTR generated bulletproof underwriting memorandums and CC&amp;R validation packets that secured sub-7.2% institutional debt for our operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deal Card 1: The Ridge Alpine */}
          <div
            onClick={() => handleOpenDeal(ridgeDeal)}
            className="rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2A] bg-[#F9F8F5] dark:bg-[#1A1A18] overflow-hidden shadow-sm hover:shadow-md hover:border-[#111110]/30 dark:hover:border-[#73716B] transition-all cursor-pointer group"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                alt="A modern luxury timber architectural cabin with blackened wood cladding, floor-to-ceiling glass windows, warm ambient interior lighting glowing inside, nestled in a misty mountain forest in Gatlinburg Tennessee"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                src={ridgeDeal.imageUrl}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111110]/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-base font-bold font-sans">The Ridge Alpine</p>
                <p className="text-xs font-mono text-neutral-300">Gatlinburg, TN · 4 Bed / 3.5 Bath</p>
              </div>
              <div className="absolute top-3 right-3 bg-[#0B3B24] dark:bg-[#059669] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                19.4% CoC
              </div>
            </div>
            <div className="p-4 grid grid-cols-4 gap-2 text-center text-xs font-mono bg-white dark:bg-[#161615] border-t border-[#E5E4DF] dark:border-[#262624]">
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] block uppercase">Purchase</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">$625,000</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] block uppercase">Cap Rate</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">10.8%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] block uppercase">Net NOI</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">$67,500</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] block uppercase">DSCR Loan</span>
                <span className="font-bold text-[#059669] dark:text-[#34D399]">7.15% Fixed</span>
              </div>
            </div>
          </div>

          {/* Deal Card 2: Kierland Hideaway */}
          <div
            onClick={() => handleOpenDeal(kierlandDeal)}
            className="rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2A] bg-[#F9F8F5] dark:bg-[#1A1A18] overflow-hidden shadow-sm hover:shadow-md hover:border-[#111110]/30 dark:hover:border-[#73716B] transition-all cursor-pointer group"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                alt="A luxury mid-century modern desert villa in Scottsdale Arizona with illuminated swimming pool, desert landscaping with saguaro cacti, limestone walls, warm evening lights glowing."
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                src={kierlandDeal.imageUrl}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111110]/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-base font-bold font-sans">Kierland Hideaway</p>
                <p className="text-xs font-mono text-neutral-300">Scottsdale, AZ · 5 Bed / 4.5 Bath</p>
              </div>
              <div className="absolute top-3 right-3 bg-[#0B3B24] dark:bg-[#059669] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                17.1% CoC
              </div>
            </div>
            <div className="p-4 grid grid-cols-4 gap-2 text-center text-xs font-mono bg-white dark:bg-[#161615] border-t border-[#E5E4DF] dark:border-[#262624]">
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] block uppercase">Purchase</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">$890,000</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] block uppercase">Cap Rate</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">9.6%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] block uppercase">Net NOI</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">$85,440</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#7A7874] block uppercase">DSCR Loan</span>
                <span className="font-bold text-[#059669] dark:text-[#34D399]">7.25% Fixed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
