import React from 'react';
import { useDealStore } from '../../store/useDealStore';
import { BrandLogoIcon } from './SidebarIcons';

interface DashboardHeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenCommandPalette?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenMobileMenu,
  onOpenCommandPalette,
}) => {
  const {
    currentView,
    setIngestModalOpen,
    setAuthModalOpen,
    setCommandPaletteOpen,
    userSession,
    isGuestDemo,
    logout,
    deals,
    selectedDealId,
  } = useDealStore();

  const handleOpenPalette = () => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      setCommandPaletteOpen(true);
    }
  };

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || deals[0];

  const viewTitles: Record<string, string> = {
    overview: 'Executive Overview',
    radar: 'Autonomous Market Radar',
    crm: 'Pipeline CRM Board',
    underwriter: 'Quantitative Studio',
    audit: 'HOA & CC&R Legal Audit',
    chat: 'Analyst Intelligence Chat',
    agents: 'Agent Team · Scribe Mesh',
    drafting: 'The Drafting Table · Vault',
    portfolio: 'Portfolio Intelligence',
    settings: 'Settings & Integrations',
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-[#FAF9F6]/95 dark:bg-[#121211]/95 backdrop-blur-md border-b border-[#E5E4DF] dark:border-[#222220] h-14 sm:h-16 px-3 sm:px-6 md:px-8 flex items-center justify-between gap-3 transition-colors duration-200">
      {/* Left: Mobile Menu Trigger + Contextual Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile menu trigger button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] bg-white dark:bg-[#1C1C1A] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F9F8F5] dark:hover:bg-[#252522] transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center justify-center"
          aria-label="Open navigation menu"
          title="Open Navigation Menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Brand Icon for Mobile */}
        <div className="flex items-center gap-1.5 md:hidden shrink-0">
          <BrandLogoIcon className="w-6 h-6" />
          <span className="font-extrabold text-xs sm:text-sm font-sans text-[#111110] dark:text-[#F4F3EF]">
            PENCIL<span className="text-[#D97706]">STR</span>
          </span>
          <span className="text-[#8F8D88] dark:text-[#73716B] text-xs font-mono hidden xs:inline">/</span>
        </div>

        {/* Editorial Breadcrumb Path */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-sans truncate">
          <span className="text-[#8F8D88] dark:text-[#787570] font-mono uppercase tracking-wider text-[11px] hidden sm:inline">
            Studio
          </span>
          <span className="text-[#8F8D88] dark:text-[#787570] hidden sm:inline">/</span>
          <span className="font-semibold text-[#111110] dark:text-[#F4F3EF] tracking-tight truncate text-xs sm:text-sm">
            {viewTitles[currentView] || 'Terminal'}
          </span>
          {selectedDeal && (
            <>
              <span className="text-[#8F8D88] dark:text-[#787570] hidden xl:inline">·</span>
              <span className="text-[#D97706] font-mono text-[11px] font-medium hidden xl:inline truncate max-w-[220px]">
                {selectedDeal.title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Middle: Desktop Search Bar (Command Palette Trigger) */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          type="button"
          onClick={handleOpenPalette}
          className="w-full relative flex items-center group bg-white dark:bg-[#181816] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#282825] hover:border-[#D97706]/60 dark:hover:border-[#D97706]/60 rounded-xl pl-9 pr-3 py-2 text-xs font-sans text-left transition-all shadow-2xs cursor-pointer select-none"
          aria-label="Search listings or open command palette"
          title="Open Command Palette (Cmd+K or /)"
        >
          <svg
            className="absolute left-3 w-4 h-4 text-[#8F8D88] dark:text-[#787570] group-hover:text-[#D97706] transition-colors pointer-events-none"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
            <path d="M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span className="text-[#8F8D88] dark:text-[#787570] truncate group-hover:text-[#555450] dark:group-hover:text-[#A3A19B]">
            Search listings, MLS #, city, or commands...
          </span>
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#20201D] text-[#8F8D88] dark:text-[#787570] border border-[#E5E4DF] dark:border-[#282825] group-hover:border-[#D97706]/40">
              <span className="text-[9px]">⌘</span>K
            </kbd>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#20201D] text-[#8F8D88] dark:text-[#787570] border border-[#E5E4DF] dark:border-[#282825] group-hover:border-[#D97706]/40">
              /
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Quick Ingest, Mobile Search, Guest Demo Mode Badge, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={handleOpenPalette}
          className="md:hidden p-1.5 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] bg-white dark:bg-[#1C1C1A] text-[#8F8D88] dark:text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#F9F8F5] dark:hover:bg-[#252522] transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center justify-center"
          aria-label="Open command palette"
          title="Open Command Palette"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
            <path d="M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
        <button
          onClick={() => setIngestModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5 text-[#F59E0B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Ingest Listing</span>
          <span className="sm:hidden text-xs">Ingest</span>
        </button>

        {/* Demo / Sandbox Switcher */}
        {isGuestDemo ? (
          <div className="flex items-center gap-1 bg-[#FEF3C7]/80 dark:bg-[#92400E]/20 border border-[#D97706]/30 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold text-[#92400E] dark:text-[#FBBF24]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
            <span className="hidden md:inline">Guest Demo</span>
            <span className="md:hidden">Demo</span>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="ml-1 text-[10px] underline hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#666562] dark:text-[#A3A19B] hidden sm:inline truncate max-w-[140px]">
              {userSession?.email}
            </span>
            <button
              onClick={logout}
              className="text-[11px] font-mono text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] underline cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
