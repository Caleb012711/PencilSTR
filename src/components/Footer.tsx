import React from 'react';

interface FooterProps {
  onOpenDoc: (docType: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDoc }) => {
  return (
    <footer className="w-full bg-[#F9F8F5] dark:bg-[#121211] border-t border-[#E5E4DF] dark:border-[#262624] mt-auto transition-colors duration-200">
      <div className="w-full max-w-[1360px] mx-auto px-6 md:px-10 h-16 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#666562] dark:text-[#A3A19B]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-tight text-[#111110] dark:text-[#F4F3EF] flex items-center">
            PENCIL<span className="text-[#D97706] ml-1 font-black">STR</span>
          </span>
          <span className="text-[#8F8D88] dark:text-[#7A7874] ml-2">© 2025 PencilSTR Inc. Tactile Production Edition.</span>
        </div>
        <div className="flex items-center gap-6 font-semibold uppercase tracking-wider text-[11px]">
          <button
            onClick={() => onOpenDoc('Privacy Protocol')}
            className="hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <button
            onClick={() => onOpenDoc('Terms of Service')}
            className="hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            Terms
          </button>
          <button
            onClick={() => onOpenDoc('Underwriting Documentation')}
            className="hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            Documentation
          </button>
        </div>
      </div>
    </footer>
  );
};
