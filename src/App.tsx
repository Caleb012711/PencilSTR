import React, { useState } from 'react';
import { MOCK_DEALS } from './data/mockDeals';
import { PropertyDeal } from './types';
import { Navbar } from './components/Navbar';
import { ScannerHero } from './components/ScannerHero';
import { InstitutionalBand } from './components/InstitutionalBand';
import { FeatureModules } from './components/FeatureModules';
import { CaseStudiesSection } from './components/CaseStudiesSection';
import { PricingSection } from './components/PricingSection';
import { ObsidianCta } from './components/ObsidianCta';
import { Footer } from './components/Footer';
import { UnderwriterStudio } from './components/UnderwriterStudio';
import { HoaAuditStudio } from './components/HoaAuditStudio';
import { ChatSection } from './components/ChatSection';
import { LenderMemoModal } from './components/LenderMemoModal';
import { PipelineDrawer } from './components/PipelineDrawer';
import { TrialModal } from './components/TrialModal';
import { DocsModal } from './components/DocsModal';
import { DashboardShell } from './components/dashboard/DashboardShell';
import { AuthModal } from './components/dashboard/AuthModal';
import { ModelSelectorModal } from './components/dashboard/ModelSelectorModal';
import { LaunchVideoModal } from './components/common/LaunchVideoModal';
import { useDealStore } from './store/useDealStore';

export default function App() {
  // Global app mode: 'landing' or 'app' (supports ?app=true or #terminal or stored session)
  const [appMode, setAppMode] = useState<'landing' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.search.includes('app=true') ||
        window.location.hash === '#terminal' ||
        window.location.hash === '#dashboard'
      ) {
        return 'app';
      }
    }
    return 'landing'; // When you first load into the site you are on the hero page
  });
  const [activeTab, setActiveTab] = useState<'scanner' | 'underwriter' | 'hoa-audit' | 'chat' | 'pricing'>('scanner');
  const [currentDeal, setCurrentDeal] = useState<PropertyDeal>(MOCK_DEALS[0]);
  const [savedDeals, setSavedDeals] = useState<PropertyDeal[]>([MOCK_DEALS[0]]);
  
  // Modals
  const [showLenderMemo, setShowLenderMemo] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [trialPlan, setTrialPlan] = useState<{ name: string; price: string } | null>(null);
  const [docModalTitle, setDocModalTitle] = useState<string | null>(null);

  const {
    setCurrentView,
    isModelSelectorOpen,
    setModelSelectorOpen,
    isLaunchVideoOpen,
    setLaunchVideoOpen,
    theme,
  } = useDealStore();

  // Unify theme logic so user's selected theme is applied consistently in both landing and dashboard modes
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSelectDeal = (deal: PropertyDeal) => {
    setCurrentDeal(deal);
  };

  const handleToggleSaveDeal = (deal: PropertyDeal) => {
    if (savedDeals.some((d) => d.id === deal.id)) {
      setSavedDeals(savedDeals.filter((d) => d.id !== deal.id));
    } else {
      setSavedDeals([...savedDeals, deal]);
    }
  };

  const handleRemoveDeal = (dealId: string) => {
    setSavedDeals(savedDeals.filter((d) => d.id !== dealId));
  };

  const handleTabChange = (tab: 'scanner' | 'underwriter' | 'hoa-audit' | 'chat' | 'pricing') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Authenticated / Guest Application Suite mode, render DashboardShell
  if (appMode === 'app') {
    return (
      <DashboardShell
        onBackToLanding={() => {
          setAppMode('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] flex flex-col font-sans selection:bg-[#FEF3C7] selection:text-[#111110] transition-colors duration-200">
      {/* Top Minimalist Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        savedDealsCount={savedDeals.length}
        onOpenPipeline={() => setShowPipeline(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onEnterDashboard={() => setAppMode('app')}
      />

      {/* Main View Area */}
      <main className="w-full flex-1">
        {activeTab === 'scanner' && (
          <div className="flex flex-col w-full">
            {/* 1. Hero Input & Live Underwriting Terminal */}
            <ScannerHero
              currentDeal={currentDeal}
              onSelectDeal={handleSelectDeal}
              allDeals={MOCK_DEALS}
              onOpenLenderMemo={() => setShowLenderMemo(true)}
              onNavigateToHoaAudit={() => handleTabChange('hoa-audit')}
              onNavigateToUnderwriter={() => handleTabChange('underwriter')}
              onEnterDashboard={() => setAppMode('app')}
            />

            {/* 2. Institutional Lending Partners */}
            <InstitutionalBand />

            {/* 3. Architecture & Cognition Feature Modules */}
            <FeatureModules
              allDeals={MOCK_DEALS}
              onSelectDeal={handleSelectDeal}
              onNavigateToUnderwriter={() => handleTabChange('underwriter')}
              onNavigateToHoaAudit={() => handleTabChange('hoa-audit')}
            />

            {/* 4. Audited Case Studies Row */}
            <CaseStudiesSection
              allDeals={MOCK_DEALS}
              onSelectDeal={handleSelectDeal}
              onNavigateToUnderwriter={() => handleTabChange('underwriter')}
            />

            {/* 5. Pricing Table */}
            <PricingSection
              onStartPlan={(name, price) => setTrialPlan({ name, price })}
            />

            {/* 6. Obsidian Bottom CTA */}
            <ObsidianCta />
          </div>
        )}

        {activeTab === 'underwriter' && (
          <div className="flex flex-col w-full">
            <UnderwriterStudio
              currentDeal={currentDeal}
              allDeals={MOCK_DEALS}
              onSelectDeal={handleSelectDeal}
              onOpenLenderMemo={() => setShowLenderMemo(true)}
              onSaveDeal={handleToggleSaveDeal}
              isSaved={savedDeals.some((d) => d.id === currentDeal.id)}
            />
            <InstitutionalBand />
          </div>
        )}

        {activeTab === 'hoa-audit' && (
          <div className="flex flex-col w-full">
            <HoaAuditStudio
              currentDeal={currentDeal}
              allDeals={MOCK_DEALS}
              onSelectDeal={handleSelectDeal}
              onOpenLenderMemo={() => setShowLenderMemo(true)}
            />
            <InstitutionalBand />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col w-full">
            <ChatSection
              currentDeal={currentDeal}
              allDeals={MOCK_DEALS}
              onSelectDeal={handleSelectDeal}
              onNavigateToUnderwriter={() => handleTabChange('underwriter')}
            />
            <InstitutionalBand />
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="flex flex-col w-full pt-8">
            <PricingSection
              onStartPlan={(name, price) => setTrialPlan({ name, price })}
            />
            {/* Feature Comparison Matrix for Pricing */}
            <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 pb-16">
              <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 sm:p-8 shadow-sm">
                <h3 className="font-serif text-2xl font-bold text-[#111110] dark:text-[#F4F3EF] mb-6">
                  Comprehensive Feature &amp; Capability Matrix
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="border-b border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F6] dark:bg-[#1A1A18]">
                        <th className="py-3 px-4 font-bold text-[#111110] dark:text-[#F4F3EF]">Capability</th>
                        <th className="py-3 px-4 font-bold text-[#666562] dark:text-[#A3A19B]">Scout ($29)</th>
                        <th className="py-3 px-4 font-bold text-[#0B3B24] dark:text-[#34D399]">Operator ($79)</th>
                        <th className="py-3 px-4 font-bold text-[#111110] dark:text-[#F4F3EF]">Desk / Fund ($199)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E4DF] dark:divide-[#262624]">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#111110] dark:text-[#F4F3EF]">MLS / Zillow URL Scans</td>
                        <td className="py-3 px-4 text-[#666562] dark:text-[#A3A19B]">50 / mo</td>
                        <td className="py-3 px-4 text-[#0B3B24] dark:text-[#34D399] font-bold">Unlimited</td>
                        <td className="py-3 px-4 text-[#111110] dark:text-[#F4F3EF]">Unlimited + Custom Feeds</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#111110] dark:text-[#F4F3EF]">DSCR 1.25x Qualifying Modeler</td>
                        <td className="py-3 px-4 text-[#059669] dark:text-[#34D399]">Included</td>
                        <td className="py-3 px-4 text-[#059669] dark:text-[#34D399] font-bold">Included</td>
                        <td className="py-3 px-4 text-[#059669] dark:text-[#34D399] font-bold">Included</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#111110] dark:text-[#F4F3EF]">100-Page CC&amp;R Legal AI Audit</td>
                        <td className="py-3 px-4 text-[#8F8D88] dark:text-[#7A7874]">Basic Summary Only</td>
                        <td className="py-3 px-4 text-[#0B3B24] dark:text-[#34D399] font-bold">Full Clause Parser</td>
                        <td className="py-3 px-4 text-[#111110] dark:text-[#F4F3EF] font-bold">Full Clause + Legal Counsel API</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#111110] dark:text-[#F4F3EF]">1-Click PDF Lender Memo Generation</td>
                        <td className="py-3 px-4 text-[#8F8D88] dark:text-[#7A7874]">—</td>
                        <td className="py-3 px-4 text-[#0B3B24] dark:text-[#34D399] font-bold">Included</td>
                        <td className="py-3 px-4 text-[#111110] dark:text-[#F4F3EF] font-bold">Custom White-label Branding</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#111110] dark:text-[#F4F3EF]">Direct REST &amp; Webhook API</td>
                        <td className="py-3 px-4 text-[#8F8D88] dark:text-[#7A7874]">—</td>
                        <td className="py-3 px-4 text-[#8F8D88] dark:text-[#7A7874]">—</td>
                        <td className="py-3 px-4 text-[#111110] dark:text-[#F4F3EF] font-bold">Included (10k req/mo)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            <ObsidianCta />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenDoc={(title) => setDocModalTitle(title)} />

      {/* Lender Memo Modal */}
      {showLenderMemo && (
        <LenderMemoModal
          deal={currentDeal}
          onClose={() => setShowLenderMemo(false)}
        />
      )}

      {/* Pipeline Drawer */}
      <PipelineDrawer
        isOpen={showPipeline}
        onClose={() => setShowPipeline(false)}
        savedDeals={savedDeals}
        onSelectDeal={handleSelectDeal}
        onRemoveDeal={handleRemoveDeal}
        onNavigateToUnderwriter={() => handleTabChange('underwriter')}
      />

      {/* Free Trial Modal */}
      {trialPlan && (
        <TrialModal
          planName={trialPlan.name}
          price={trialPlan.price}
          onClose={() => setTrialPlan(null)}
        />
      )}

      {/* Docs / Protocol Modal */}
      {docModalTitle && (
        <DocsModal
          title={docModalTitle}
          onClose={() => setDocModalTitle(null)}
        />
      )}

      {/* Auth / Guest Demo Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setAppMode('app')}
      />

      {/* OpenRouter Model Selector Modal */}
      <ModelSelectorModal
        isOpen={isModelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
      />

      {/* 1-Minute Launch Video Reel Modal */}
      <LaunchVideoModal
        isOpen={isLaunchVideoOpen}
        onClose={() => setLaunchVideoOpen(false)}
        onJumpToSection={(tab) => handleTabChange(tab as any)}
      />
    </div>
  );
}
