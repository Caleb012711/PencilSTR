import React, { useState, useEffect, useRef } from 'react';
import { useDealStore } from '../store/useDealStore';
import { BrandLogoIcon, SunIcon, MoonIcon } from './dashboard/SidebarIcons';

interface NavbarProps {
  activeTab: 'scanner' | 'underwriter' | 'hoa-audit' | 'chat' | 'pricing';
  onSelectTab: (tab: 'scanner' | 'underwriter' | 'hoa-audit' | 'chat' | 'pricing') => void;
  savedDealsCount: number;
  onOpenPipeline: () => void;
  onOpenAuthModal: () => void;
  onEnterDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  savedDealsCount,
  onOpenPipeline,
  onOpenAuthModal,
  onEnterDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userSession, theme, toggleTheme, setLaunchVideoOpen } = useDealStore();
  const navContainerRef = useRef<HTMLElement | null>(null);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on click/touch outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header
      ref={navContainerRef}
      className="sticky top-3 sm:top-4 w-full z-50 px-3 sm:px-6 transition-all duration-200"
    >
      <div className="h-14 w-full max-w-[1360px] mx-auto px-4 sm:px-6 flex items-center justify-between bg-white/95 dark:bg-[#141413]/95 backdrop-blur-md rounded-2xl border border-[#E5E4DF] dark:border-[#262624] shadow-sm">
        {/* Brand Zone */}
        <button
          onClick={() => {
            onSelectTab('scanner');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none rounded-xl p-1 -m-1"
        >
          <BrandLogoIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs" />
          <span className="font-extrabold tracking-tight text-base sm:text-xl text-[#111110] dark:text-[#F4F3EF] font-sans flex items-center">
            PENCIL<span className="text-[#D97706] ml-1 sm:ml-1.5 font-black tracking-normal">STR</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[13px] font-medium text-[#666562] dark:text-[#A3A19B]">
          <button
            onClick={() => onSelectTab('scanner')}
            aria-current={activeTab === 'scanner' ? 'page' : undefined}
            className={`transition-colors cursor-pointer py-1 rounded-sm focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
              activeTab === 'scanner'
                ? 'text-[#111110] dark:text-[#F4F3EF] font-semibold border-b-2 border-[#111110] dark:border-[#F4F3EF]'
                : 'hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => onSelectTab('underwriter')}
            aria-current={activeTab === 'underwriter' ? 'page' : undefined}
            className={`transition-colors cursor-pointer py-1 rounded-sm focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
              activeTab === 'underwriter'
                ? 'text-[#111110] dark:text-[#F4F3EF] font-semibold border-b-2 border-[#111110] dark:border-[#F4F3EF]'
                : 'hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => onSelectTab('hoa-audit')}
            aria-current={activeTab === 'hoa-audit' ? 'page' : undefined}
            className={`transition-colors cursor-pointer py-1 rounded-sm focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
              activeTab === 'hoa-audit'
                ? 'text-[#111110] dark:text-[#F4F3EF] font-semibold border-b-2 border-[#111110] dark:border-[#F4F3EF]'
                : 'hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            HOA Audit
          </button>
          <button
            onClick={() => onSelectTab('chat')}
            aria-current={activeTab === 'chat' ? 'page' : undefined}
            className={`transition-colors cursor-pointer py-1 rounded-sm flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
              activeTab === 'chat'
                ? 'text-[#111110] dark:text-[#F4F3EF] font-semibold border-b-2 border-[#111110] dark:border-[#F4F3EF]'
                : 'hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            <span>Analyst Chat</span>
          </button>
          <button
            onClick={() => onSelectTab('pricing')}
            aria-current={activeTab === 'pricing' ? 'page' : undefined}
            className={`transition-colors cursor-pointer py-1 rounded-sm focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
              activeTab === 'pricing'
                ? 'text-[#111110] dark:text-[#F4F3EF] font-semibold border-b-2 border-[#111110] dark:border-[#F4F3EF]'
                : 'hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            Pricing
          </button>
        </nav>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          {savedDealsCount > 0 && (
            <button
              onClick={onOpenPipeline}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-xl border border-[#E5E4DF] dark:border-[#2E2E2A] bg-white dark:bg-[#1A1A18] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F9F8F5] dark:hover:bg-[#232320] transition-colors shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
              title="View Saved Pipeline"
            >
              <span>Saved</span>
              <span className="w-4 h-4 rounded-full bg-[#0B3B24] dark:bg-[#059669] text-white flex items-center justify-center text-[10px] font-bold">
                {savedDealsCount}
              </span>
            </button>
          )}

          {/* 1-Minute Launch Video Reel */}
          <button
            type="button"
            onClick={() => setLaunchVideoOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1.5 rounded-xl border border-[#D97706]/35 bg-[#FEF3C7]/60 dark:bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24] hover:bg-[#FEF3C7] dark:hover:bg-[#D97706]/25 transition-all shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
            title="Watch 1-Minute Light Mode Launch Video (5 Alternate Styles)"
          >
            <span className="text-[12px]">🎬</span>
            <span className="hidden sm:inline font-semibold">1-Min Video</span>
          </button>

          {/* Desktop Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#F9F8F5] dark:hover:bg-[#1E1E1C] border border-transparent hover:border-[#E5E4DF] dark:hover:border-[#282825] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none flex items-center justify-center"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-4 h-4 text-[#D97706]" />
            ) : (
              <MoonIcon className="w-4 h-4 text-[#D97706]" />
            )}
          </button>

          <button
            onClick={onOpenAuthModal}
            className="text-xs font-medium text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors hidden sm:inline cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none rounded-lg px-2 py-1"
          >
            {userSession ? 'Account' : 'Log In'}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onEnterDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] px-3.5 sm:px-4 py-2 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
          >
            <span className="text-[13px]">🐾</span>
            <span>Launch Terminal</span>
            <span className="text-[#D97706] font-bold">→</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#111110] dark:text-[#F4F3EF] rounded-xl hover:bg-[#EBEAE6] dark:hover:bg-[#20201D] transition-colors cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-[1360px] mx-auto mt-2 bg-white/95 dark:bg-[#161615]/95 backdrop-blur-md rounded-2xl border border-[#E5E4DF] dark:border-[#262624] p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-2.5">
          <div className="flex flex-col gap-1.5 font-medium text-sm">
            <button
              onClick={() => {
                onEnterDashboard();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3.5 rounded-xl bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-sans font-semibold text-xs flex items-center justify-between shadow-xs cursor-pointer active:scale-98 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
            >
              <div className="flex items-center gap-2">
                <BrandLogoIcon className="w-4 h-4" />
                <span>Launch Deal Terminal</span>
              </div>
              <span className="text-[#D97706] font-bold">→</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('scanner');
                setMobileMenuOpen(false);
              }}
              aria-current={activeTab === 'scanner' ? 'page' : undefined}
              className={`text-left py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
                activeTab === 'scanner'
                  ? 'bg-[#FAF9F5] dark:bg-[#222220] text-[#D97706]'
                  : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              1. Market Scanner
            </button>

            <button
              onClick={() => {
                onSelectTab('underwriter');
                setMobileMenuOpen(false);
              }}
              aria-current={activeTab === 'underwriter' ? 'page' : undefined}
              className={`text-left py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
                activeTab === 'underwriter'
                  ? 'bg-[#FAF9F5] dark:bg-[#222220] text-[#D97706]'
                  : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              2. Quantitative Studio
            </button>

            <button
              onClick={() => {
                onSelectTab('hoa-audit');
                setMobileMenuOpen(false);
              }}
              aria-current={activeTab === 'hoa-audit' ? 'page' : undefined}
              className={`text-left py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
                activeTab === 'hoa-audit'
                  ? 'bg-[#FAF9F5] dark:bg-[#222220] text-[#D97706]'
                  : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              3. HOA &amp; CC&amp;R Audit
            </button>

            <button
              onClick={() => {
                onSelectTab('chat');
                setMobileMenuOpen(false);
              }}
              aria-current={activeTab === 'chat' ? 'page' : undefined}
              className={`text-left py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center justify-between focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
                activeTab === 'chat'
                  ? 'bg-[#FAF9F5] dark:bg-[#222220] text-[#059669]'
                  : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              <span>4. Analyst Chat</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#059669]/10 text-[#059669] dark:text-[#34D399]">
                AI
              </span>
            </button>

            <button
              onClick={() => {
                onSelectTab('pricing');
                setMobileMenuOpen(false);
              }}
              aria-current={activeTab === 'pricing' ? 'page' : undefined}
              className={`text-left py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
                activeTab === 'pricing'
                  ? 'bg-[#FAF9F5] dark:bg-[#222220] text-[#D97706]'
                  : 'text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
            >
              5. Pricing &amp; Plans
            </button>

            <button
              onClick={() => {
                setLaunchVideoOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold bg-[#FEF3C7]/60 dark:bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#D97706]/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>🎬</span>
                <span>1-Minute Launch Reel</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/20">
                5 Styles
              </span>
            </button>
          </div>

          {/* Mobile Theme Toggle Button */}
          <div className="pt-2 border-t border-[#E5E4DF] dark:border-[#262624]">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold text-[#666562] dark:text-[#A3A19B] hover:bg-[#FAF9F5] dark:hover:bg-[#20201D] hover:text-[#111110] dark:hover:text-[#F4F3EF] focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
              aria-label="Toggle visual theme"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <SunIcon className="w-4 h-4 text-[#D97706]" />
                ) : (
                  <MoonIcon className="w-4 h-4 text-[#D97706]" />
                )}
                <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#20201D] text-[#78716C] dark:text-[#A8A29E] border border-[#E5E4DF] dark:border-[#282825]">
                {theme}
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#E5E4DF] dark:border-[#262624] flex justify-between items-center text-xs">
            <button
              onClick={() => {
                onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              className="text-[#666562] dark:text-[#A3A19B] hover:text-[#111110] dark:hover:text-[#F4F3EF] font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none rounded-md px-1.5 py-0.5"
            >
              {userSession ? 'My Account' : 'Log in to account'}
            </button>

            {savedDealsCount > 0 && (
              <button
                onClick={() => {
                  onOpenPipeline();
                  setMobileMenuOpen(false);
                }}
                className="text-[#059669] dark:text-[#34D399] font-bold cursor-pointer flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none rounded-md px-1.5 py-0.5"
              >
                <span>Saved Deals</span>
                <span className="px-1.5 py-0.2 bg-[#059669]/15 text-[#059669] dark:text-[#34D399] rounded-full text-[10px] font-mono">
                  {savedDealsCount}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
