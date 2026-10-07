import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { Deal } from '../../types/deal';
import { PropertyDeal } from '../../types';
import { DashboardHeader } from './DashboardHeader';
import { Sidebar } from './Sidebar';
import { PipelineKanbanView } from './PipelineKanbanView';
import { ExecutiveOverviewView } from './ExecutiveOverviewView';
import { AutonomousRadarView } from './AutonomousRadarView';
import { UnderwriterLabView } from './UnderwriterLabView';
import { PencilAuditView } from './PencilAuditView';
import { PortfolioIntelligenceView } from './PortfolioIntelligenceView';
import { SettingsIntegrationsView } from './SettingsIntegrationsView';
import { AnalystChatView } from './AnalystChatView';
import { AgentTeamView } from './AgentTeamView';
import { DraftingTableView } from './DraftingTableView';
import { DealDetailDrawer } from './DealDetailDrawer';
import { IngestListingModal } from './IngestListingModal';
import { AuthModal } from './AuthModal';
import { ModelSelectorModal } from './ModelSelectorModal';
import { LenderMemoModal } from '../LenderMemoModal';
import { CommandPalette } from '../common/CommandPalette';
import { LaunchVideoModal } from '../common/LaunchVideoModal';
import { CompComparisonDrawer } from './CompComparisonDrawer';
import { TelemetryDock } from './TelemetryDock';
import { DEMO_DEALS } from '../../mock/demoDeals';
import { sanitizeDeal } from '../../store/useDealStore';
import {
  BrandLogoIcon,
  OverviewIcon,
  ChatIcon,
  StudioIcon,
  SettingsIcon,
  AgentTeamIcon,
  DraftingTableIcon,
  RadarIcon,
  PipelineIcon,
  AuditIcon,
  SunIcon,
  MoonIcon,
  ExitHomeIcon,
} from './SidebarIcons';

interface DashboardShellProps {
  onBackToLanding: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ onBackToLanding }) => {
  const {
    currentView,
    setCurrentView,
    deals,
    artifacts,
    agents,
    selectedDealId,
    setSelectedDealId,
    isIngestModalOpen,
    setIngestModalOpen,
    isAuthModalOpen,
    setAuthModalOpen,
    isLenderMemoModalOpen,
    setLenderMemoModalOpen,
    isModelSelectorOpen,
    setModelSelectorOpen,
    isLaunchVideoOpen,
    setLaunchVideoOpen,
    theme,
    toggleTheme,
  } = useDealStore();

  const [activeDrawerDeal, setActiveDrawerDeal] = useState<Deal | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const rawDeal = deals.find((d) => d.id === selectedDealId) || deals[0] || DEMO_DEALS[0];
  const currentDeal = sanitizeDeal(rawDeal);

  const handleOpenDealDrawer = (deal: Deal) => {
    setActiveDrawerDeal(deal);
  };

  const handleOpenUnderwriter = (deal: Deal | PropertyDeal) => {
    setSelectedDealId(deal.id);
    setCurrentView('underwriter');
  };

  const handleOpenAudit = (deal: Deal | PropertyDeal) => {
    setSelectedDealId(deal.id);
    setCurrentView('audit');
  };

  const allNavItems = [
    { id: 'overview' as const, label: 'Executive Overview', icon: OverviewIcon, badge: undefined },
    { id: 'underwriter' as const, label: 'Quantitative Studio', icon: StudioIcon, badge: `${deals.length}` },
    { id: 'chat' as const, label: 'Analyst Intelligence', icon: ChatIcon, badge: 'AI' },
    { id: 'agents' as const, label: 'Agent Team (Scribes)', icon: AgentTeamIcon, badge: `${agents.length}` },
    { id: 'drafting' as const, label: 'The Drafting Table', icon: DraftingTableIcon, badge: `${artifacts.length}` },
    { id: 'radar' as const, label: 'Autonomous Radar', icon: RadarIcon, badge: 'Live' },
    { id: 'crm' as const, label: 'Pipeline Board', icon: PipelineIcon, badge: undefined },
    { id: 'audit' as const, label: 'HOA & CC&R Audit', icon: AuditIcon, badge: undefined },
    { id: 'portfolio' as const, label: 'Portfolio Intelligence', icon: OverviewIcon, badge: undefined },
    { id: 'settings' as const, label: 'Settings & Models', icon: SettingsIcon, badge: undefined },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] font-sans selection:bg-[#FEF3C7] selection:text-[#111110] transition-colors duration-200">
      {/* Collapsible Left Navigation Sidebar for Desktop */}
      <Sidebar onBackToLanding={onBackToLanding} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Top Header */}
        <DashboardHeader onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

        {/* Dynamic Screen View with safe bottom padding for mobile bottom bar */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
          {currentView === 'overview' && (
            <ExecutiveOverviewView
              onOpenDealDrawer={handleOpenDealDrawer}
              onOpenUnderwriter={handleOpenUnderwriter}
              onOpenAudit={handleOpenAudit}
            />
          )}

          {currentView === 'crm' && (
            <PipelineKanbanView
              onOpenDealDrawer={handleOpenDealDrawer}
              onOpenUnderwriter={handleOpenUnderwriter}
              onOpenAudit={handleOpenAudit}
            />
          )}

          {currentView === 'radar' && (
            <AutonomousRadarView onOpenUnderwriter={handleOpenUnderwriter} />
          )}

          {currentView === 'underwriter' && (
            <UnderwriterLabView
              onOpenLenderMemo={(deal) => {
                setSelectedDealId(deal.id);
                setLenderMemoModalOpen(true);
              }}
            />
          )}

          {currentView === 'audit' && <PencilAuditView />}

          {currentView === 'chat' && (
            <AnalystChatView onOpenUnderwriter={handleOpenUnderwriter} />
          )}

          {currentView === 'agents' && <AgentTeamView />}

          {currentView === 'drafting' && <DraftingTableView />}

          {currentView === 'portfolio' && <PortfolioIntelligenceView />}

          {currentView === 'settings' && <SettingsIntegrationsView />}
        </main>

        {/* Persistent Telemetry Dock (Grok / Codex telemetry & controls) */}
        <TelemetryDock />

        {/* Mobile Ergonomic Bottom Tab Navigation Bar - 5 Primary Tabs */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#141413]/95 backdrop-blur-md border-t border-[#E5E4DF] dark:border-[#262624] grid grid-cols-5 items-center h-16 pb-safe md:hidden transition-colors duration-200 select-none shadow-lg">
          <button
            onClick={() => setCurrentView('overview')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
              currentView === 'overview' || currentView === 'portfolio'
                ? 'text-[#111110] dark:text-[#F4F3EF] font-bold'
                : 'text-[#8F8D88] dark:text-[#7A7874] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            <OverviewIcon isActive={currentView === 'overview' || currentView === 'portfolio'} className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Overview</span>
            {(currentView === 'overview' || currentView === 'portfolio') && (
              <span className="w-1 h-1 rounded-full bg-[#111110] dark:bg-[#F4F3EF] mt-0.5"></span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('underwriter')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative cursor-pointer ${
              currentView === 'underwriter' || currentView === 'crm' || currentView === 'radar' || currentView === 'audit'
                ? 'text-[#D97706] font-bold'
                : 'text-[#8F8D88] dark:text-[#7A7874] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            <StudioIcon isActive={currentView === 'underwriter' || currentView === 'crm' || currentView === 'radar' || currentView === 'audit'} className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Studio</span>
            {deals.length > 0 && (
              <span className="absolute top-1.5 right-4 w-3.5 h-3.5 rounded-full bg-[#D97706] text-white text-[8px] font-mono font-bold flex items-center justify-center">
                {deals.length}
              </span>
            )}
            {(currentView === 'underwriter' || currentView === 'crm' || currentView === 'radar' || currentView === 'audit') && (
              <span className="w-1 h-1 rounded-full bg-[#D97706] mt-0.5"></span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('chat')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative cursor-pointer ${
              currentView === 'chat'
                ? 'text-[#059669] font-bold'
                : 'text-[#8F8D88] dark:text-[#7A7874] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            <ChatIcon isActive={currentView === 'chat'} className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Chat</span>
            {currentView === 'chat' && (
              <span className="w-1 h-1 rounded-full bg-[#059669] mt-0.5"></span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('agents')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative cursor-pointer ${
              currentView === 'agents'
                ? 'text-[#8B5CF6] font-bold'
                : 'text-[#8F8D88] dark:text-[#7A7874] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            <AgentTeamIcon isActive={currentView === 'agents'} className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Scribes</span>
            {currentView === 'agents' && (
              <span className="w-1 h-1 rounded-full bg-[#8B5CF6] mt-0.5"></span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('drafting')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative cursor-pointer ${
              currentView === 'drafting'
                ? 'text-[#D97706] font-bold'
                : 'text-[#8F8D88] dark:text-[#7A7874] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            <DraftingTableIcon className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Drafting</span>
            {artifacts.length > 0 && (
              <span className="absolute top-1.5 right-4 w-3.5 h-3.5 rounded-full bg-[#D97706] text-white text-[8px] font-mono font-bold flex items-center justify-center">
                {artifacts.length}
              </span>
            )}
            {currentView === 'drafting' && (
              <span className="w-1 h-1 rounded-full bg-[#D97706] mt-0.5"></span>
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Slide-Over Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <aside className="relative w-72 max-w-[80vw] bg-white dark:bg-[#141413] border-r border-[#E5E4DF] dark:border-[#262624] h-full flex flex-col justify-between z-10 shadow-2xl p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624]">
                <div className="flex items-center gap-2">
                  <BrandLogoIcon className="w-7 h-7" />
                  <span className="font-extrabold text-sm font-sans text-[#111110] dark:text-[#F4F3EF]">
                    PENCIL<span className="text-[#D97706]">STR</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>

              {/* Navigation Items List */}
              <nav className="space-y-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#FAF9F5] dark:bg-[#20201D] text-[#111110] dark:text-[#F4F3EF] font-bold shadow-2xs'
                          : 'text-[#666562] dark:text-[#A3A19B] hover:bg-[#FAF9F5] dark:hover:bg-[#1A1A18]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon isActive={isActive} className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#D97706]/15 text-[#D97706] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Controls */}
            <div className="pt-4 border-t border-[#E5E4DF] dark:border-[#262624] space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans text-[#666562] dark:text-[#A3A19B] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                  <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
                </span>
                <span className="text-[10px] font-mono uppercase">{theme}</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onBackToLanding();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans text-[#666562] dark:text-[#A3A19B] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] transition-colors cursor-pointer"
              >
                <ExitHomeIcon className="w-4 h-4" />
                <span>Exit to Landing Page</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Slide-out Deal Detail Drawer */}
      <DealDetailDrawer
        deal={activeDrawerDeal}
        isOpen={!!activeDrawerDeal}
        onClose={() => setActiveDrawerDeal(null)}
        onNavigateToUnderwriter={handleOpenUnderwriter}
        onNavigateToAudit={handleOpenAudit}
      />

      {/* Ingest Listing Modal */}
      <IngestListingModal
        isOpen={isIngestModalOpen}
        onClose={() => setIngestModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Authentication & Guest Demo Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* OpenRouter Model Selector Modal */}
      <ModelSelectorModal
        isOpen={isModelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
      />

      {/* Institutional Lender Memo Modal */}
      {isLenderMemoModalOpen && (
        <LenderMemoModal
          deal={currentDeal as any}
          onClose={() => setLenderMemoModalOpen(false)}
        />
      )}

      {/* Universal Command Palette (⌘K) */}
      <CommandPalette
        onExitToLanding={onBackToLanding}
        onNavigateView={(view) => setCurrentView(view)}
        onSelectDeal={(deal) => {
          setSelectedDealId(deal.id);
          setCurrentView('underwriter');
        }}
        onOpenLenderMemo={() => setLenderMemoModalOpen(true)}
      />

      {/* Comp Comparison Drawer & Matrix */}
      <CompComparisonDrawer onNavigateToUnderwriter={handleOpenUnderwriter} />

      {/* 1-Minute Launch Video Reel Studio Modal */}
      <LaunchVideoModal
        isOpen={isLaunchVideoOpen}
        onClose={() => setLaunchVideoOpen(false)}
        onJumpToSection={(section) => setCurrentView(section as any)}
      />
    </div>
  );
};
