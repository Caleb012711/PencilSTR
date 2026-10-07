import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { Deal } from '../../types/deal';
import {
  Search,
  Command,
  Building2,
  TrendingUp,
  MessageSquare,
  Bot,
  FileSpreadsheet,
  Radar,
  Kanban,
  ShieldAlert,
  PieChart,
  Settings,
  Sun,
  Moon,
  Cpu,
  PlusCircle,
  FileText,
  RotateCcw,
  LogOut,
  Terminal,
  CornerDownLeft,
  X,
  MapPin,
  Sparkles,
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigateView?: (view: ReturnType<typeof useDealStore.getState>['currentView']) => void;
  onSelectDeal?: (deal: Deal) => void;
  onExitToLanding?: () => void;
  onLaunchTerminal?: () => void;
  onOpenLenderMemo?: () => void;
}

type PaletteCategory = 'navigation' | 'deals' | 'actions';

interface PaletteItem {
  id: string;
  category: PaletteCategory;
  categoryLabel: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'amber' | 'emerald' | 'violet' | 'neutral' | 'blue';
  icon: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onNavigateView,
  onSelectDeal,
  onExitToLanding,
  onLaunchTerminal,
  onOpenLenderMemo,
}) => {
  const {
    isCommandPaletteOpen: storeIsOpen,
    setCommandPaletteOpen: storeSetOpen,
    currentView,
    setCurrentView,
    deals,
    selectedDealId,
    setSelectedDealId,
    theme,
    toggleTheme,
    selectedModel,
    setModelSelectorOpen,
    setIngestModalOpen,
    setLenderMemoModalOpen,
    setLaunchVideoOpen,
    resetToDemoDeals,
  } = useDealStore();

  const isControlled = propIsOpen !== undefined;
  const isOpen = isControlled ? propIsOpen : storeIsOpen;

  const handleClose = useCallback(() => {
    if (propOnClose) {
      propOnClose();
    }
    storeSetOpen(false);
  }, [propOnClose, storeSetOpen]);

  const handleOpen = useCallback(() => {
    storeSetOpen(true);
  }, [storeSetOpen]);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset query and selection when palette opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Auto focus search input
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);

      // Prevent body scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Global hotkey listeners for Cmd+K / Ctrl+K and '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Cmd+K or Ctrl+K shortcut
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
        return;
      }

      // 2. '/' shortcut (only if not currently typing in an input/textarea)
      if (e.key === '/') {
        const target = e.target as HTMLElement | null;
        const isEditable =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable ||
            target.getAttribute('role') === 'textbox');

        if (!isEditable && !isOpen) {
          e.preventDefault();
          handleOpen();
          return;
        }
      }

      // 3. Escape key to dismiss palette
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleOpen]);

  // Command Action Handlers
  const handleSelectView = useCallback(
    (view: ReturnType<typeof useDealStore.getState>['currentView']) => {
      handleClose();
      if (onNavigateView) {
        onNavigateView(view);
      } else {
        setCurrentView(view);
      }
      if (onLaunchTerminal) {
        onLaunchTerminal();
      }
    },
    [handleClose, onNavigateView, setCurrentView, onLaunchTerminal]
  );

  const handleSelectDealItem = useCallback(
    (deal: Deal) => {
      handleClose();
      setSelectedDealId(deal.id);
      if (onSelectDeal) {
        onSelectDeal(deal);
      } else {
        setCurrentView('underwriter');
      }
      if (onLaunchTerminal) {
        onLaunchTerminal();
      }
    },
    [handleClose, setSelectedDealId, onSelectDeal, setCurrentView, onLaunchTerminal]
  );

  const handleToggleTheme = useCallback(() => {
    handleClose();
    toggleTheme();
  }, [handleClose, toggleTheme]);

  const handleOpenModelSelector = useCallback(() => {
    handleClose();
    setModelSelectorOpen(true);
  }, [handleClose, setModelSelectorOpen]);

  const handleOpenIngestModal = useCallback(() => {
    handleClose();
    setIngestModalOpen(true);
  }, [handleClose, setIngestModalOpen]);

  const handleOpenMemoModal = useCallback(() => {
    handleClose();
    if (onOpenLenderMemo) {
      onOpenLenderMemo();
    } else {
      setLenderMemoModalOpen(true);
    }
  }, [handleClose, onOpenLenderMemo, setLenderMemoModalOpen]);

  const handleResetDemo = useCallback(() => {
    handleClose();
    resetToDemoDeals();
  }, [handleClose, resetToDemoDeals]);

  const handleExitLanding = useCallback(() => {
    handleClose();
    if (onExitToLanding) {
      onExitToLanding();
    }
  }, [handleClose, onExitToLanding]);

  const handleTerminalLaunch = useCallback(() => {
    handleClose();
    if (onLaunchTerminal) {
      onLaunchTerminal();
    } else {
      setCurrentView('overview');
    }
  }, [handleClose, onLaunchTerminal, setCurrentView]);

  // Construct All Available Palette Items
  const allItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [
      // --- NAVIGATION ITEMS ---
      {
        id: 'nav-overview',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Executive Overview',
        subtitle: 'Portfolio KPI dashboard, market cap rates, cash flow metrics',
        badge: 'Executive',
        badgeColor: 'neutral',
        icon: <TrendingUp className="w-4 h-4 text-[#D97706]" />,
        shortcut: '1',
        keywords: ['kpi', 'executive', 'summary', 'overview', 'portfolio', 'dashboard', 'cap rate'],
        onSelect: () => handleSelectView('overview'),
      },
      {
        id: 'nav-underwriter',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Studio Underwriter',
        subtitle: 'Dynamic DSCR debt service modeler, cash flow & ADR sensitivity',
        badge: 'Core Engine',
        badgeColor: 'amber',
        icon: <FileSpreadsheet className="w-4 h-4 text-[#D97706]" />,
        shortcut: '2',
        keywords: ['underwriter', 'studio', 'dscr', 'debt', 'cashflow', 'adr', 'sensitivity', 'mortgage', 'proforma'],
        onSelect: () => handleSelectView('underwriter'),
      },
      {
        id: 'nav-chat',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Analyst Chat',
        subtitle: 'Autonomous AI Investment Committee dialog & covenant stress testing',
        badge: 'AI Analyst',
        badgeColor: 'emerald',
        icon: <MessageSquare className="w-4 h-4 text-[#059669]" />,
        shortcut: '3',
        keywords: ['chat', 'analyst', 'ai', 'conversation', 'copilot', 'investment committee', 'stress test'],
        onSelect: () => handleSelectView('chat'),
      },
      {
        id: 'nav-agents',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Agent Team',
        subtitle: 'Autonomous Pencil scribes, mesh architecture & continuous work streams',
        badge: 'Mesh',
        badgeColor: 'violet',
        icon: <Bot className="w-4 h-4 text-[#8B5CF6]" />,
        shortcut: '4',
        keywords: ['agents', 'mesh', 'scribes', 'war room', 'team', 'astra', 'solomon', 'lyra', 'orion'],
        onSelect: () => handleSelectView('agents'),
      },
      {
        id: 'nav-drafting',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Drafting Table',
        subtitle: 'Audited lender credit memos, financial spreadsheets & artifact repository',
        badge: 'Artifacts',
        badgeColor: 'amber',
        icon: <Sparkles className="w-4 h-4 text-[#D97706]" />,
        shortcut: '5',
        keywords: ['drafting', 'artifacts', 'vault', 'documents', 'memo', 'spreadsheet', 'html', 'code'],
        onSelect: () => handleSelectView('drafting'),
      },
      {
        id: 'nav-radar',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Autonomous Radar',
        subtitle: 'Real-time MLS cohort comps scanner, yield filters & market signals',
        badge: 'Live Scanner',
        badgeColor: 'emerald',
        icon: <Radar className="w-4 h-4 text-[#059669]" />,
        shortcut: '6',
        keywords: ['radar', 'market', 'scanner', 'autonomous', 'live', 'yield', 'comps', 'mls'],
        onSelect: () => handleSelectView('radar'),
      },
      {
        id: 'nav-crm',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Pipeline Kanban',
        subtitle: 'Full deal lifecycle tracking from Ingest to Under Contract & Closed',
        badge: 'Pipeline',
        badgeColor: 'neutral',
        icon: <Kanban className="w-4 h-4 text-[#D97706]" />,
        shortcut: '7',
        keywords: ['pipeline', 'kanban', 'crm', 'board', 'funnel', 'stages', 'inbox', 'due diligence'],
        onSelect: () => handleSelectView('crm'),
      },
      {
        id: 'nav-audit',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'HOA & CC&R Audit',
        subtitle: '100-page declaration parsing, municipal bylaws & deed restrictions',
        badge: 'Legal AI',
        badgeColor: 'blue',
        icon: <ShieldAlert className="w-4 h-4 text-[#2563EB]" />,
        shortcut: '8',
        keywords: ['hoa', 'audit', 'cc&r', 'deed', 'bylaws', 'ordinance', 'legal', 'compliance', 'zoning', 'str'],
        onSelect: () => handleSelectView('audit'),
      },
      {
        id: 'nav-portfolio',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Portfolio Intelligence',
        subtitle: 'Realized operational actuals, pro-forma variance & asset health',
        badge: 'Portfolio',
        badgeColor: 'neutral',
        icon: <PieChart className="w-4 h-4 text-[#D97706]" />,
        shortcut: '9',
        keywords: ['portfolio', 'actuals', 'performance', 'variance', 'revenue', 'historical', 'p&l'],
        onSelect: () => handleSelectView('portfolio'),
      },
      {
        id: 'nav-settings',
        category: 'navigation',
        categoryLabel: 'Navigation & Workspaces',
        title: 'Settings & Integrations',
        subtitle: 'OpenRouter credentials, LLM model switches & operator preferences',
        badge: 'Config',
        badgeColor: 'neutral',
        icon: <Settings className="w-4 h-4 text-[#8F8D88] dark:text-[#A3A19B]" />,
        shortcut: '0',
        keywords: ['settings', 'config', 'api', 'keys', 'models', 'preferences', 'openrouter', 'integrations'],
        onSelect: () => handleSelectView('settings'),
      },

      // --- DEAL SEARCH & SELECTION ITEMS ---
      ...deals.map((deal) => {
        const isSelected = deal.id === selectedDealId;
        const stageLabel = deal.stage
          ? deal.stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : 'Active';

        return {
          id: `deal-${deal.id}`,
          category: 'deals' as PaletteCategory,
          categoryLabel: 'Properties & Underwritten Deals',
          title: deal.title,
          subtitle: `${deal.city}, ${deal.state} · MLS #${deal.mlsNumber} · $${deal.price.toLocaleString()} · ${deal.beds}B/${deal.baths}BA`,
          badge: isSelected ? 'Active Deal' : stageLabel,
          badgeColor: isSelected ? ('amber' as const) : ('neutral' as const),
          icon: <Building2 className="w-4 h-4 text-[#D97706]" />,
          keywords: [
            deal.title,
            deal.city,
            deal.state,
            deal.mlsNumber,
            deal.address,
            deal.marketName,
            deal.stage,
            `${deal.beds} bed`,
            `${deal.baths} bath`,
            `$${deal.price}`,
          ],
          onSelect: () => handleSelectDealItem(deal),
        };
      }),

      // --- SYSTEM ACTIONS ITEMS ---
      {
        id: 'sys-theme-toggle',
        category: 'actions',
        categoryLabel: 'System Actions & Modals',
        title: `Toggle Theme (${theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'})`,
        subtitle: `Current active palette: ${theme === 'dark' ? 'Obsidian Dark' : 'Alabaster Light'}`,
        badge: 'Appearance',
        badgeColor: 'neutral',
        icon:
          theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#F59E0B]" />
          ) : (
            <Moon className="w-4 h-4 text-[#6366F1]" />
          ),
        shortcut: 'T',
        keywords: ['theme', 'dark', 'light', 'mode', 'appearance', 'toggle', 'obsidian', 'alabaster'],
        onSelect: handleToggleTheme,
      },
      {
        id: 'sys-model-selector',
        category: 'actions',
        categoryLabel: 'System Actions & Modals',
        title: 'Open AI Model Selector',
        subtitle: `Selected model: ${selectedModel.split('/').pop() || selectedModel}`,
        badge: 'AI Engine',
        badgeColor: 'emerald',
        icon: <Cpu className="w-4 h-4 text-[#059669]" />,
        shortcut: 'M',
        keywords: ['model', 'ai', 'openrouter', 'llm', 'nemotron', 'claude', 'gpt-4o', 'deepseek', 'temperature'],
        onSelect: handleOpenModelSelector,
      },
      {
        id: 'sys-ingest-listing',
        category: 'actions',
        categoryLabel: 'System Actions & Modals',
        title: 'Ingest Listing (MLS / Zillow URL)',
        subtitle: 'Auto-scrape photos, tax data, amenities & historical STR projections',
        badge: 'Ingest',
        badgeColor: 'amber',
        icon: <PlusCircle className="w-4 h-4 text-[#D97706]" />,
        shortcut: 'I',
        keywords: ['ingest', 'listing', 'url', 'scrape', 'zillow', 'redfin', 'realtor', 'import', 'add deal'],
        onSelect: handleOpenIngestModal,
      },
      {
        id: 'sys-export-lender-memo',
        category: 'actions',
        categoryLabel: 'System Actions & Modals',
        title: 'Export Lender Memo',
        subtitle: 'Compile institutional 1-click DSCR PDF credit memo with stress tests',
        badge: 'PDF Memo',
        badgeColor: 'amber',
        icon: <FileText className="w-4 h-4 text-[#D97706]" />,
        shortcut: 'E',
        keywords: ['export', 'lender', 'memo', 'credit', 'pdf', 'dscr', 'report', 'packet', 'summary'],
        onSelect: handleOpenMemoModal,
      },
      {
        id: 'sys-launch-video',
        category: 'actions',
        categoryLabel: 'System Actions & Modals',
        title: 'Watch 1-Minute Launch Video (5 Styles)',
        subtitle: 'Light Mode 60s reel with voiceover in 5 alternate styles (Institutional, Tech, Editorial, Quant, Craft)',
        badge: 'Cinema',
        badgeColor: 'amber',
        icon: <Sparkles className="w-4 h-4 text-[#D97706]" />,
        shortcut: 'V',
        keywords: ['video', 'launch', 'brag', 'reel', 'demo', 'audio', 'openrouter', 'cinema', 'watch', 'styles'],
        onSelect: () => {
          handleClose();
          setLaunchVideoOpen(true);
        },
      },
      {
        id: 'sys-reset-demo-data',
        category: 'actions',
        categoryLabel: 'System Actions & Modals',
        title: 'Reset Demo Data',
        subtitle: 'Re-initialize the 5 institutional baseline deals and cohort actuals',
        badge: 'Sandbox',
        badgeColor: 'neutral',
        icon: <RotateCcw className="w-4 h-4 text-[#EF4444]" />,
        keywords: ['reset', 'demo', 'default', 'restore', 'sandbox', 'clean'],
        onSelect: handleResetDemo,
      },
      {
        id: 'sys-launch-terminal',
        category: 'actions',
        categoryLabel: 'System Actions & Modals',
        title: 'Launch Underwriting Terminal',
        subtitle: 'Open the full institutional operator workspace and multi-agent suite',
        badge: 'Workspace',
        badgeColor: 'amber',
        icon: <Terminal className="w-4 h-4 text-[#D97706]" />,
        keywords: ['launch', 'terminal', 'workspace', 'open', 'enter', 'app', 'dashboard'],
        onSelect: handleTerminalLaunch,
      },
      {
        id: 'sys-exit-landing',
        category: 'actions',
        categoryLabel: 'System Actions & Modals',
        title: 'Exit to Landing Page',
        subtitle: 'Return to public marketing overview, feature matrix & pricing breakdown',
        badge: 'Public Site',
        badgeColor: 'neutral',
        icon: <LogOut className="w-4 h-4 text-[#8F8D88] dark:text-[#A3A19B]" />,
        keywords: ['exit', 'landing', 'home', 'public', 'back', 'marketing', 'leave'],
        onSelect: handleExitLanding,
      },
    ];

    return items;
  }, [
    deals,
    selectedDealId,
    theme,
    selectedModel,
    handleSelectView,
    handleSelectDealItem,
    handleToggleTheme,
    handleOpenModelSelector,
    handleOpenIngestModal,
    handleOpenMemoModal,
    handleResetDemo,
    handleTerminalLaunch,
    handleExitLanding,
  ]);

  // Filter items based on user search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;

    return allItems.filter((item) => {
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.subtitle?.toLowerCase().includes(q)) return true;
      if (item.badge?.toLowerCase().includes(q)) return true;
      if (item.categoryLabel.toLowerCase().includes(q)) return true;
      if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [allItems, query]);

  // Clamp selectedIndex when filtered items change
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (filteredItems.length === 0) return 0;
      if (prev >= filteredItems.length) return 0;
      return prev;
    });
  }, [filteredItems.length]);

  // Scroll active item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation within the input/dialog
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredItems.length === 0) return;
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredItems.length === 0) return;
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeItem = filteredItems[selectedIndex];
      if (activeItem) {
        activeItem.onSelect();
      }
    }
  };

  if (!isOpen) return null;

  // Group items by category while preserving flat indices for keyboard navigation
  const groupedCategories: {
    category: PaletteCategory;
    label: string;
    items: { item: PaletteItem; index: number }[];
  }[] = [];

  const categoryOrder: { category: PaletteCategory; label: string }[] = [
    { category: 'navigation', label: 'Navigation & Workspaces' },
    { category: 'deals', label: 'Properties & Underwritten Deals' },
    { category: 'actions', label: 'System Actions & Modals' },
  ];

  categoryOrder.forEach(({ category, label }) => {
    const matched = filteredItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.category === category);

    if (matched.length > 0) {
      groupedCategories.push({
        category,
        label,
        items: matched,
      });
    }
  });

  const getBadgeStyle = (color?: PaletteItem['badgeColor']) => {
    switch (color) {
      case 'amber':
        return 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#92400E]/25 dark:text-[#FBBF24] border-[#FDE68A] dark:border-[#B45309]/40';
      case 'emerald':
        return 'bg-[#E8F5EE] text-[#065F46] dark:bg-[#064E3B]/25 dark:text-[#34D399] border-[#A7F3D0] dark:border-[#059669]/40';
      case 'violet':
        return 'bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#5B21B6]/25 dark:text-[#C4B5FD] border-[#DDD6FE] dark:border-[#7C3AED]/40';
      case 'blue':
        return 'bg-[#EFF6FF] text-[#1E40AF] dark:bg-[#1E40AF]/25 dark:text-[#93C5FD] border-[#BFDBFE] dark:border-[#3B82F6]/40';
      default:
        return 'bg-[#FAF9F6] text-[#666562] dark:bg-[#1C1C1A] dark:text-[#A3A19B] border-[#E5E4DF] dark:border-[#282825]';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="PencilSTR Institutional Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 md:p-6 pt-12 sm:pt-20 md:pt-24 bg-black/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      {/* Modal Dialog Card */}
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#141413] border border-[#E5E4DF] dark:border-[#262624] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] transition-all duration-200 ring-1 ring-black/5 dark:ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="relative flex items-center px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#E5E4DF] dark:border-[#222220] bg-[#FAF9F6]/80 dark:bg-[#181816]/80">
          <Search className="w-5 h-5 text-[#D97706] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={filteredItems[selectedIndex]?.id}
            placeholder="Type a command, jump to a view, or search deals by name, city, MLS #..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent text-sm sm:text-base font-sans text-[#111110] dark:text-[#F4F3EF] placeholder-[#8F8D88] dark:placeholder-[#787570] focus:outline-none"
          />

          {/* Quick Clear or Close */}
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-lg text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#E5E4DF]/60 dark:hover:bg-[#282825] transition-colors cursor-pointer text-xs font-mono"
                title="Clear Search"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#E5E4DF]/60 dark:hover:bg-[#282825] transition-colors cursor-pointer"
              aria-label="Close command palette"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List Area */}
        <div
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-4 max-h-[56vh] divide-y divide-transparent scrollbar-thin"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7]/60 dark:bg-[#92400E]/20 border border-[#D97706]/30 mx-auto flex items-center justify-center text-[#D97706] mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF] mb-1">
                No commands or properties matched "{query}"
              </h3>
              <p className="text-xs text-[#8F8D88] dark:text-[#787570] max-w-sm mx-auto">
                Try searching for a view like <span className="font-mono text-[#D97706]">underwriter</span>, a city like <span className="font-mono text-[#D97706]">Gatlinburg</span>, an MLS #, or a system action like <span className="font-mono text-[#D97706]">theme</span>.
              </p>
            </div>
          ) : (
            groupedCategories.map((group) => (
              <div key={group.category} className="space-y-1">
                {/* Category Header */}
                <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-bold tracking-wider uppercase text-[#8F8D88] dark:text-[#73716B] flex items-center justify-between">
                  <span>{group.label}</span>
                  <span className="text-[9px] font-normal">{group.items.length} items</span>
                </div>

                {/* Items in this Category */}
                <div className="space-y-0.5">
                  {group.items.map(({ item, index }) => {
                    const isSelected = index === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                        id={item.id}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={item.onSelect}
                        className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-100 select-none ${
                          isSelected
                            ? 'bg-[#FEF3C7]/80 dark:bg-[#272318] text-[#111110] dark:text-[#F4F3EF] ring-1 ring-[#D97706]/40 dark:ring-[#F59E0B]/30 shadow-2xs'
                            : 'text-[#444340] dark:text-[#D1CFCA] hover:bg-[#FAF9F5] dark:hover:bg-[#1C1C1A]'
                        }`}
                      >
                        {/* Left: Icon + Title/Subtitle */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#D97706]/15 text-[#D97706]'
                                : 'bg-[#F2F1EC] dark:bg-[#20201D] text-[#8F8D88] dark:text-[#A3A19B]'
                            }`}
                          >
                            {item.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs sm:text-[13px] font-medium tracking-tight truncate ${
                                  isSelected
                                    ? 'text-[#111110] dark:text-white font-bold'
                                    : 'text-[#222220] dark:text-[#E8E7E3]'
                                }`}
                              >
                                {item.title}
                              </span>

                              {item.badge && (
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md border font-semibold shrink-0 uppercase tracking-tight ${getBadgeStyle(
                                    item.badgeColor
                                  )}`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>

                            {item.subtitle && (
                              <p className="text-[11px] text-[#8F8D88] dark:text-[#787570] truncate mt-0.5 font-sans">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Enter hint or shortcut badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-[#D97706] font-semibold bg-[#FEF3C7] dark:bg-[#92400E]/30 px-1.5 py-0.5 rounded border border-[#D97706]/30">
                              <span>Select</span>
                              <CornerDownLeft className="w-3 h-3" />
                            </span>
                          ) : item.shortcut ? (
                            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#20201D] text-[#8F8D88] dark:text-[#787570] border border-[#E5E4DF] dark:border-[#282825]">
                              {item.shortcut}
                            </kbd>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Institutional Status & Keyboard Shortcuts Footer */}
        <div className="px-4 py-2.5 sm:py-3 border-t border-[#E5E4DF] dark:border-[#222220] bg-[#FAF9F6] dark:bg-[#161615] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8F8D88] dark:text-[#787570]">
          {/* Navigation Hints */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#282825] text-[#111110] dark:text-[#F4F3EF] text-[10px] shadow-2xs">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#282825] text-[#111110] dark:text-[#F4F3EF] text-[10px] shadow-2xs">
                ↓
              </kbd>
              <span className="hidden xs:inline ml-0.5">navigate</span>
            </span>

            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#282825] text-[#111110] dark:text-[#F4F3EF] text-[10px] shadow-2xs">
                ↵
              </kbd>
              <span className="hidden xs:inline ml-0.5">select</span>
            </span>

            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#282825] text-[#111110] dark:text-[#F4F3EF] text-[10px] shadow-2xs">
                esc
              </kbd>
              <span className="hidden xs:inline ml-0.5">close</span>
            </span>
          </div>

          {/* Global Hotkey Badges */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#282825] text-[#111110] dark:text-[#F4F3EF] text-[10px] shadow-2xs">
                ⌘K
              </kbd>
              <span>/</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#282825] text-[#111110] dark:text-[#F4F3EF] text-[10px] shadow-2xs">
                /
              </kbd>
            </span>
            <span className="text-[10px] text-[#D97706] font-semibold">
              {filteredItems.length} command{filteredItems.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
