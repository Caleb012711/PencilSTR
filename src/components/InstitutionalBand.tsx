import React from 'react';

export const InstitutionalBand: React.FC = () => {
  return (
    <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 py-8 transition-colors duration-200">
      <div className="border-y border-[#E5E4DF] dark:border-[#262624] py-6">
        <p className="text-[11px] font-mono font-semibold text-[#8F8D88] dark:text-[#7A7874] tracking-[0.2em] uppercase text-center mb-5">
          INSTITUTIONAL LENDING &amp; CAPITAL SYNDICATION PARTNERS
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          <div className="flex items-center gap-2 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-7 h-7 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] flex items-center justify-center font-mono font-bold text-xs">
              K
            </div>
            <span className="text-xs font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF] uppercase font-mono">
              Kiavi Capital
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-7 h-7 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] flex items-center justify-center font-mono font-bold text-xs">
              V
            </div>
            <span className="text-xs font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF] uppercase font-mono">
              Visio Lending
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-7 h-7 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] flex items-center justify-center font-mono font-bold text-xs">
              E
            </div>
            <span className="text-xs font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF] uppercase font-mono">
              Easy Street
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-7 h-7 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] flex items-center justify-center font-mono font-bold text-xs">
              H
            </div>
            <span className="text-xs font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF] uppercase font-mono">
              Host Financial
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-85 hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5L10 3L12.5 2.5L13.5 5L15.5 6.5L14.5 9L15.5 11.5L13.5 13L12.5 15.5L10 15L8 16.5L6 15L3.5 15.5L2.5 13L0.5 11.5L1.5 9L0.5 6.5L2.5 5L3.5 2.5L6 3L8 1.5Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-xs font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF] uppercase font-mono">
              AirDNA Verified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
