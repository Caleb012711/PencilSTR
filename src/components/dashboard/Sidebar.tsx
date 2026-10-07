import React, { useEffect, useMemo } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { calculateUnderwriteMetrics } from '../../utils/underwriterMath';
import {
  BrandLogoIcon,
  OverviewIcon,
  StudioIcon,
  ChatIcon,
  PipelineIcon,
  RadarIcon,
  AuditIcon,
  SettingsIcon,
  SidebarDockToggleIcon,
  SunIcon,
  MoonIcon,
  ExitHomeIcon,
  PinDealIcon,
  AgentTeamIcon,
  DraftingTableIcon,
} from './SidebarIcons';

interface SidebarProps {
  onBackToLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onBackToLanding }) => {
  const {
    currentView,
    setCurrentView,
    sidebarCollapsed,
    setSidebarCollapsed,
    deals,
    artifacts,
    selectedDealId,
    setSelectedDealId,
    isGuestDemo,
    resetToDemoDeals,
    theme,
    toggleTheme,
  } = useDealStore();

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || deals[0];
  const dealMetrics = useMemo(() => {
    return selectedDeal ? calculateUnderwriteMetrics(selectedDeal) : null;
  }, [selectedDeal]);

  // Global keyboard shortcut (⌘B or Ctrl+B) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  // Curated Pinterest-style Navigation Items
  const navItems = [
    {
      id: 'overview' as const,
      label: 'Executive Overview',
      shortLabel: 'Overview',
      icon: OverviewIcon,
      isActive: currentView === 'overview' || currentView === 'portfolio',
    },
    {
      id: 'underwriter' as const,
      label: 'Studio Underwriter',
      shortLabel: 'Studio',
      icon: StudioIcon,
      badge: deals.length > 0 ? `${deals.length}` : undefined,
      badgeColor: 'bg-[#D97706]/15 text-[#D97706] dark:bg-[#D97706]/25 dark:text-[#FBBF24]',
      isActive: currentView === 'underwriter',
    },
    {
      id: 'chat' as const,
      label: 'Analyst Intelligence',
      shortLabel: 'Analyst Chat',
      icon: ChatIcon,
      badge: 'AI',
      badgeColor: 'bg-[#059669]/15 text-[#059669] dark:bg-[#059669]/30 dark:text-[#34D399]',
      isActive: currentView === 'chat',
    },
    {
      id: 'agents' as const,
      label: 'Agent Team',
      shortLabel: 'Pencil Team',
      icon: AgentTeamIcon,
      badge: '🐾 Team',
      badgeColor: 'bg-[#8B5CF6]/15 text-[#8B5CF6] dark:bg-[#A78BFA]/25 dark:text-[#C4B5FD]',
      isActive: currentView === 'agents',
    },
    {
      id: 'drafting' as const,
      label: 'The Drafting Table',
      shortLabel: 'Drafting',
      icon: DraftingTableIcon,
      badge: artifacts.length > 0 ? `${artifacts.length}` : undefined,
      badgeColor: 'bg-[#D97706]/15 text-[#D97706] dark:bg-[#D97706]/25 dark:text-[#FBBF24]',
      isActive: currentView === 'drafting',
    },
    {
      id: 'radar' as const,
      label: 'Autonomous Radar',
      shortLabel: 'Radar',
      icon: RadarIcon,
      badge: 'Live',
      badgeColor: 'bg-[#2563EB]/15 text-[#2563EB] dark:bg-[#3B82F6]/25 dark:text-[#60A5FA]',
      isActive: currentView === 'radar',
    },
    {
      id: 'crm' as const,
      label: 'Pipeline Board',
      shortLabel: 'Pipeline',
      icon: PipelineIcon,
      isActive: currentView === 'crm',
    },
    {
      id: 'audit' as const,
      label: 'HOA & CC&R Audit',
      shortLabel: 'Audit',
      icon: AuditIcon,
      isActive: currentView === 'audit',
    },
    {
      id: 'settings' as const,
      label: 'Settings & Models',
      shortLabel: 'Settings',
      icon: SettingsIcon,
      isActive: currentView === 'settings',
    },
  ];

  return (
    <aside
      className={`hidden md:flex bg-[#FAF9F6] dark:bg-[#121211] border-r border-[#E5E4DF] dark:border-[#222220] text-[#1C1917] dark:text-[#F5F5F4] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex-col justify-between shrink-0 select-none relative z-30 ${
        sidebarCollapsed ? 'w-[74px]' : 'w-64'
      }`}
      aria-label="Application Navigation"
    >
      {/* Top Header & Brand Zone */}
      <div className="flex flex-col">
        {/* Brand Header Bar: Single, pristine toggle control without duplicate hamburger */}
        <div
          className={`h-16 border-b border-[#E5E4DF] dark:border-[#222220] flex items-center transition-all px-3 ${
            sidebarCollapsed ? 'justify-center' : 'justify-between px-4'
          }`}
        >
          {/* Logo & Brand Wordmark */}
          <button
            onClick={() => {
              if (sidebarCollapsed) {
                setSidebarCollapsed(false);
              } else {
                setCurrentView('overview');
              }
            }}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            title={sidebarCollapsed ? 'Expand sidebar (⌘B)' : 'PencilSTR Studio'}
          >
            <BrandLogoIcon className="w-8 h-8 drop-shadow-xs" />

            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-[17px] tracking-tight font-sans text-[#111110] dark:text-[#F4F3EF] leading-tight flex items-center">
                  PENCIL<span className="text-[#D97706] ml-1 font-black">STR</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#8F8D88] dark:text-[#7A7874] uppercase">
                  Capital Studio
                </span>
              </div>
            )}
          </button>

          {/* Single, Sleek Collapse/Expand Control (Pinterest / Linear Style) */}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-[#EBEAE6] dark:hover:bg-[#1E1E1C] text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
              title="Collapse sidebar (⌘B)"
              aria-label="Collapse sidebar"
            >
              <SidebarDockToggleIcon collapsed={false} className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active Board / Active Deal Widget */}
        {selectedDeal && (
          <div className="p-2 border-b border-[#E5E4DF] dark:border-[#222220]">
            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setCurrentView('underwriter')}
                className="w-full text-left group p-2.5 rounded-xl bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] hover:border-[#D97706]/40 dark:hover:border-[#D97706]/50 shadow-2xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
                aria-label={`Active deal: ${selectedDeal.title}, $${selectedDeal.price.toLocaleString()}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#D97706] dark:text-[#FBBF24]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
                    ACTIVE BOARD
                  </span>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#20201D] text-[#787570] dark:text-[#A3A19B] border border-[#EBEAE6] dark:border-[#2A2A26]">
                    #{selectedDeal.mlsNumber}
                  </span>
                </div>
                <div className="text-xs font-semibold truncate text-[#111110] dark:text-[#F4F3EF] group-hover:text-[#D97706] transition-colors">
                  {selectedDeal.title}
                </div>
                <div className="text-[10px] font-mono text-[#787570] dark:text-[#A3A19B] mt-0.5 truncate flex items-center justify-between">
                  <span>${selectedDeal.price.toLocaleString()}</span>
                  <span className="text-[#059669] dark:text-[#34D399] font-bold">
                    {dealMetrics ? `${dealMetrics.capRate.toFixed(1)}% Cap` : `${selectedDeal.city}, ${selectedDeal.state}`}
                  </span>
                </div>
              </button>
            ) : (
              /* Sleek, Non-Glitched Collapsed Deal Badge */
              <div className="flex justify-center py-1">
                <button
                  type="button"
                  onClick={() => setCurrentView('underwriter')}
                  className="relative group p-2 rounded-xl bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] hover:border-[#D97706] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
                  title={`${selectedDeal.title} · $${selectedDeal.price.toLocaleString()}`}
                  aria-label={`Active pinned deal: ${selectedDeal.title}`}
                >
                  <PinDealIcon className="w-4 h-4 text-[#D97706]" isActive />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#059669] border border-white dark:border-[#121211]" />

                  {/* Pinterest-style Floating Hover Card */}
                  <div className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex group-focus-visible:flex flex-col w-48 p-2.5 rounded-xl bg-[#1C1917] text-white dark:bg-[#F5F5F4] dark:text-[#1C1917] shadow-xl pointer-events-none text-left">
                    <div className="text-[9px] font-mono text-[#D97706] font-bold mb-0.5">
                      ACTIVE PINNED DEAL
                    </div>
                    <div className="text-xs font-semibold truncate">{selectedDeal.title}</div>
                    <div className="text-[10px] font-mono opacity-80 mt-1">
                      ${selectedDeal.price.toLocaleString()} · {selectedDeal.city}
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Navigation Stack - Tactile Pinterest-Style Buttons */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setCurrentView(item.id)}
                  aria-label={item.label}
                  className={`w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
                    sidebarCollapsed
                      ? 'justify-center h-11 w-11 mx-auto'
                      : 'gap-3 px-3 py-2.5 text-left'
                  } ${
                    isActive
                      ? 'bg-[#1C1917] text-white dark:bg-[#F5F5F4] dark:text-[#1C1917] shadow-sm font-semibold scale-[1.01]'
                      : 'text-[#57534E] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#1C1C1A] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]'
                  } active:scale-[0.98]`}
                >
                  {/* Custom Pinterest-Inspired SVG Icon */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Icon
                      isActive={isActive}
                      className={`w-[19px] h-[19px] transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? 'text-[#F59E0B] dark:text-[#D97706]'
                          : 'text-[#78716C] dark:text-[#A8A29E]'
                      }`}
                    />

                    {/* Collapsed Pill Badge Indicator */}
                    {sidebarCollapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D97706] ring-2 ring-[#FAF9F6] dark:ring-[#121211]" />
                    )}
                  </div>

                  {/* Expanded Text & Badge */}
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <span className="text-[13px] font-medium tracking-tight truncate font-sans">
                        {item.shortLabel}
                      </span>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ml-1.5 shrink-0 ${
                            item.badgeColor ||
                            (isActive
                              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                              : 'bg-[#E5E4DF] dark:bg-[#282825] text-[#1C1917] dark:text-[#F5F5F4]')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Floating Pinterest Tooltip for Collapsed State */}
                {sidebarCollapsed && (
                  <div className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex group-focus-visible:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1917] text-white dark:bg-[#F5F5F4] dark:text-[#1C1917] text-xs font-sans font-medium shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-150">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-white/20 dark:bg-black/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Clean Theme, Demo Mode, and Home Exit */}
      <div className="p-2.5 border-t border-[#E5E4DF] dark:border-[#222220] space-y-1.5">
        {/* Guest Demo Switcher */}
        {isGuestDemo && !sidebarCollapsed && (
          <div className="px-3 py-2 bg-[#FEF3C7]/60 dark:bg-[#92400E]/20 rounded-xl border border-[#D97706]/20 flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-[#92400E] dark:text-[#FBBF24] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
              Guest Demo
            </span>
            <button
              onClick={resetToDemoDeals}
              className="text-[#92400E] dark:text-[#FBBF24] hover:underline cursor-pointer font-bold text-[10px] focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none rounded"
            >
              Reset
            </button>
          </div>
        )}

        {/* Dedicated Pinterest-style Theme Switcher */}
        <div className="relative group">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-xl text-xs font-sans border border-[#E5E4DF] dark:border-[#282825] bg-white dark:bg-[#181816] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#111110]/30 dark:hover:border-[#73716B] transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
              sidebarCollapsed
                ? 'justify-center h-10 w-10 mx-auto'
                : 'justify-between px-3 py-2'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle visual theme"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#D97706]">
                {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              </span>
              {!sidebarCollapsed && (
                <span className="font-medium text-xs">
                  {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#20201D] text-[#78716C] dark:text-[#A8A29E] border border-[#E5E4DF] dark:border-[#282825]">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            )}
          </button>

          {sidebarCollapsed && (
            <div className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex group-focus-visible:flex items-center px-2.5 py-1 rounded-md bg-[#1C1917] text-white dark:bg-[#F5F5F4] dark:text-[#1C1917] text-xs font-sans shadow-lg pointer-events-none whitespace-nowrap">
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </div>
          )}
        </div>

        {/* Sleek Exit to Home Button */}
        <div className="relative group">
          <button
            onClick={onBackToLanding}
            className={`w-full flex items-center rounded-xl text-xs font-sans text-[#78716C] dark:text-[#A8A29E] hover:bg-[#EFECE6] dark:hover:bg-[#1C1C1A] hover:text-[#1C1917] dark:hover:text-[#F5F5F4] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none ${
              sidebarCollapsed
                ? 'justify-center h-10 w-10 mx-auto'
                : 'gap-2.5 px-3 py-2'
            }`}
            title="Exit to Landing Homepage"
            aria-label="Exit to Landing Homepage"
          >
            <ExitHomeIcon className="w-4 h-4 shrink-0 text-[#78716C] dark:text-[#A8A29E]" />
            {!sidebarCollapsed && <span className="font-medium">Exit to Home</span>}
          </button>

          {sidebarCollapsed && (
            <div className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex group-focus-visible:flex items-center px-2.5 py-1 rounded-md bg-[#1C1917] text-white dark:bg-[#F5F5F4] dark:text-[#1C1917] text-xs font-sans shadow-lg pointer-events-none whitespace-nowrap">
              Exit to Home
            </div>
          )}
        </div>

        {/* Collapsed Dock Expand Trigger at bottom for quick toggle */}
        {sidebarCollapsed && (
          <div className="relative group pt-1">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-10 h-8 mx-auto flex items-center justify-center rounded-lg hover:bg-[#EBEAE6] dark:hover:bg-[#1E1E1C] text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none"
              title="Expand sidebar (⌘B)"
              aria-label="Expand sidebar"
            >
              <SidebarDockToggleIcon collapsed={true} className="w-4 h-4" />
            </button>
            <div className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex group-focus-visible:flex items-center px-2.5 py-1 rounded-md bg-[#1C1917] text-white dark:bg-[#F5F5F4] dark:text-[#1C1917] text-xs font-sans shadow-lg pointer-events-none whitespace-nowrap">
              Expand sidebar (⌘B)
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
