import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Deal, PipelineStage, UserSession } from '../types/deal';
import { AgentPencil, AgentMeshMessage, AgentStatus } from '../types/agent';
import { ProjectArtifact } from '../types/artifact';
import { DEMO_DEALS } from '../mock/demoDeals';
import { INITIAL_AGENTS, INITIAL_MESH_MESSAGES } from '../mock/initialAgents';
import { INITIAL_ARTIFACTS } from '../mock/initialArtifacts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { uri?: string; title?: string }[];
}

export interface ChatSession {
  id: string;
  dealId: string;
  dealTitle: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-ridge-dscr',
    dealId: 'deal-gatlinburg-ridge',
    dealTitle: 'The Ridge Alpine',
    title: 'DSCR Sensitivity & Break-Even',
    createdAt: 'Today, 9:20 AM',
    updatedAt: 'Today, 9:24 AM',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Stress-test debt service at 7.75% interest against our break-even occupancy hurdle for The Ridge Alpine.',
        timestamp: '9:20 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `### DSCR Debt Sensitivity Stress Test: The Ridge Alpine ($645,000)

• **Base Case DSCR (7.15% Rate)**: **1.38x Coverage** ($4,120 NOI vs $2,985 Debt Service)
• **Stressed Rate (7.75% Rate)**: DSCR adjusts to **1.27x Coverage** ($3,244 Debt Service) — maintains a comfortable **+0.07x cushion** above institutional 1.20x covenant requirements.
• **Break-Even Occupancy Hurdle**: At $520 base ADR, zero-cash-flow occupancy hurdle is **47.8%** (14.5 nights/month). Stabilized 68% occupancy yields a **20.2% margin of safety**.
• **Downside Recommendation**: Property easily absorbs a 15% drop in seasonal ADR before violating lender DSCR triggers. Proceed with conventional DSCR financing.`,
        timestamp: '9:21 AM',
      },
    ],
  },
  {
    id: 'session-smoky-audit',
    dealId: 'deal-gatlinburg-smoky-top',
    dealTitle: 'Smoky Top Haven',
    title: 'CC&R & Municipal Ordinance Audit',
    createdAt: 'Yesterday, 4:15 PM',
    updatedAt: 'Yesterday, 4:19 PM',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Audit the HOA covenants, municipal short-term rental permits, and local parking rules for Smoky Top Haven.',
        timestamp: '4:15 PM',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `### Municipal & CC&R Legal Audit: Smoky Top Haven (MLS #248192)

• **Municipal Zoning**: County Unincorporated — **Permitted by Right** with standard annual life-safety inspection and transient occupancy tax remittance.
• **HOA / CC&R Status**: Recorded Declaration of Covenants Article IV explicitly protects transient commercial leases. **Zero minimum stay duration requirements**.
• **Parking Bylaws**: Dedicated asphalt pad accommodates up to 4 passenger vehicles off-street (satisfies Sevier County STR ordinance Section 8.2).
• **Risk Verdict**: **GREEN / PERMITTED**. Asset carries no deed encumbrances that would impair Airbnb or VRBO operational viability.`,
        timestamp: '4:17 PM',
      },
    ],
  },
  {
    id: 'session-scottsdale-seasonality',
    dealId: 'deal-scottsdale-saguaro',
    dealTitle: 'Saguaro Sunset Oasis',
    title: 'Peak Seasonality & ADR Expansion',
    createdAt: '2 days ago',
    updatedAt: '2 days ago',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'What are the peak foliage/spring training months versus summer trough occupancy, and how does ADR compress?',
        timestamp: '2:10 PM',
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: `### Seasonality & Rate Compression: Saguaro Sunset Oasis (Scottsdale, AZ)

• **Peak Window (Jan–April)**: Driven by WM Phoenix Open, Spring Training, and Barrett-Jackson. Projected ADR expands to **$720–$890/night** at 84% occupancy.
• **Summer Trough (June–August)**: ADR compresses to **$340/night** with 44% occupancy.
• **Annualized Blended Yield**: 30-year fixed DSCR is comfortably supported by front-loaded winter cash flows generating a full-year **18.7% Cash-on-Cash** return.
• **Strategic Recommendation**: Implement dynamic pricing software with minimum 3-night weekend minimums during peak Q1 dates.`,
        timestamp: '2:12 PM',
      },
    ],
  },
];

/**
 * Sanitizes and repairs a deal object to guarantee all institutional properties
 * (financing, expenses, audit, seasonality) exist and are non-null.
 */
export function sanitizeDeal(raw: any, index = 0): Deal {
  const fallback = DEMO_DEALS[index % DEMO_DEALS.length] || DEMO_DEALS[0];

  if (!raw || typeof raw !== 'object') {
    return { ...fallback };
  }

  const price = Number(raw.price) > 0 ? Number(raw.price) : fallback.price;
  const baseAdr = Number(raw.baseAdr) > 0 ? Number(raw.baseAdr) : fallback.baseAdr;
  const baseOccupancy = Number(raw.baseOccupancy) > 0 ? Number(raw.baseOccupancy) : fallback.baseOccupancy;

  const financing = {
    strategy: raw.financing?.strategy || fallback.financing.strategy || 'dscr',
    downPaymentPct: Number(raw.financing?.downPaymentPct ?? fallback.financing.downPaymentPct ?? 20),
    interestRate: Number(raw.financing?.interestRate ?? fallback.financing.interestRate ?? 7.15),
    amortizationYears: Number(raw.financing?.amortizationYears ?? fallback.financing.amortizationYears ?? 30),
    points: Number(raw.financing?.points ?? fallback.financing.points ?? 1.25),
    sellerCarryTerms: {
      interestOnlyYears: Number(raw.financing?.sellerCarryTerms?.interestOnlyYears ?? 2),
      balloonYears: Number(raw.financing?.sellerCarryTerms?.balloonYears ?? 5),
    },
    existingLoanBalance: Number(raw.financing?.existingLoanBalance ?? price * 0.65),
    existingMonthlyPayment: Number(raw.financing?.existingMonthlyPayment ?? 2100),
    sellerGapRate: Number(raw.financing?.sellerGapRate ?? 6.0),
    sellerGapTermYears: Number(raw.financing?.sellerGapTermYears ?? 15),
  };

  const expenses = {
    taxesAnnual: Number(raw.expenses?.taxesAnnual ?? fallback.expenses.taxesAnnual ?? 4800),
    insuranceAnnual: Number(raw.expenses?.insuranceAnnual ?? fallback.expenses.insuranceAnnual ?? 2800),
    utilitiesMonthly: Number(raw.expenses?.utilitiesMonthly ?? fallback.expenses.utilitiesMonthly ?? 390),
    wifiMonthly: Number(raw.expenses?.wifiMonthly ?? fallback.expenses.wifiMonthly ?? 85),
    hoaFeeMonthly: Number(raw.expenses?.hoaFeeMonthly ?? fallback.expenses.hoaFeeMonthly ?? 100),
    platformFeeRate: Number(raw.expenses?.platformFeeRate ?? fallback.expenses.platformFeeRate ?? 0.03),
    managementFeeRate: Number(raw.expenses?.managementFeeRate ?? fallback.expenses.managementFeeRate ?? 0.15),
    cleaningFeePerStay: Number(raw.expenses?.cleaningFeePerStay ?? fallback.expenses.cleaningFeePerStay ?? 185),
    maintenanceCapExRate: Number(raw.expenses?.maintenanceCapExRate ?? fallback.expenses.maintenanceCapExRate ?? 0.05),
  };

  const audit = {
    str_status: raw.audit?.str_status || fallback.audit.str_status || 'PERMITTED',
    risk_rating: raw.audit?.risk_rating || fallback.audit.risk_rating || 'LOW',
    minimum_stay_days: Number(raw.audit?.minimum_stay_days ?? fallback.audit.minimum_stay_days ?? 0),
    parking_limit_vehicles: String(raw.audit?.parking_limit_vehicles || fallback.audit.parking_limit_vehicles || 'Max 4 Vehicles'),
    quiet_hours: String(raw.audit?.quiet_hours || fallback.audit.quiet_hours || '10:00 PM to 7:00 AM local time'),
    amenity_fees: String(raw.audit?.amenity_fees || fallback.audit.amenity_fees || 'None'),
    fines_schedule: String(raw.audit?.fines_schedule || fallback.audit.fines_schedule || '$150 municipal citation'),
    citations: Array.isArray(raw.audit?.citations) && raw.audit.citations.length > 0
      ? raw.audit.citations
      : fallback.audit.citations,
    document_name: raw.audit?.document_name || fallback.audit.document_name || 'HOA_Master_CC&Rs.pdf',
    last_audited_at: raw.audit?.last_audited_at || fallback.audit.last_audited_at || new Date().toISOString(),
  };

  const seasonality = Array.isArray(raw.seasonality) && raw.seasonality.length === 12
    ? raw.seasonality
    : fallback.seasonality;

  return {
    id: String(raw.id || fallback.id),
    userId: String(raw.userId || 'guest-demo'),
    mlsNumber: String(raw.mlsNumber || fallback.mlsNumber || '248190'),
    title: String(raw.title || fallback.title),
    address: String(raw.address || fallback.address),
    city: String(raw.city || fallback.city),
    state: String(raw.state || fallback.state),
    zip: String(raw.zip || fallback.zip),
    marketName: String(raw.marketName || fallback.marketName),
    elevation: raw.elevation || fallback.elevation,
    price,
    originalPrice: Number(raw.originalPrice) || price + 25000,
    priceDrop: Number(raw.priceDrop) || 25000,
    beds: Number(raw.beds) || fallback.beds || 4,
    baths: Number(raw.baths) || fallback.baths || 3.5,
    sqft: Number(raw.sqft) || fallback.sqft || 2800,
    yearBuilt: Number(raw.yearBuilt) || fallback.yearBuilt || 2021,
    imageUrl: String(raw.imageUrl || fallback.imageUrl),
    imageAlt: String(raw.imageAlt || fallback.imageAlt || raw.title || 'STR Property'),
    imageGallery: Array.isArray(raw.imageGallery) && raw.imageGallery.length > 0
      ? raw.imageGallery
      : (fallback.imageGallery && fallback.imageGallery.length > 0 ? fallback.imageGallery : [String(raw.imageUrl || fallback.imageUrl)]),
    aspectRatio: raw.aspectRatio || fallback.aspectRatio || 'landscape',
    compScore: raw.compScore !== undefined ? Number(raw.compScore) : fallback.compScore,
    distanceMiles: raw.distanceMiles !== undefined ? Number(raw.distanceMiles) : fallback.distanceMiles,
    viewType: raw.viewType || fallback.viewType,
    permitDetails: raw.permitDetails || fallback.permitDetails,
    turnkey: raw.turnkey !== undefined ? Boolean(raw.turnkey) : true,
    stage: (raw.stage as PipelineStage) || fallback.stage || 'inbox',
    baseAdr,
    minCompAdr: Number(raw.minCompAdr) || Math.round(baseAdr * 0.7),
    peakHighAdr: Number(raw.peakHighAdr) || Math.round(baseAdr * 1.25),
    baseOccupancy,
    breakEvenOccupancy: Number(raw.breakEvenOccupancy) || 48,
    topMarketOccupancy: Number(raw.topMarketOccupancy) || 78,
    seasonality,
    financing,
    expenses,
    audit,
    actuals: raw.actuals || fallback.actuals,
    notes: raw.notes || fallback.notes,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

interface DealState {
  userSession: UserSession | null;
  isGuestDemo: boolean;
  deals: Deal[];
  selectedDealId: string | null;
  currentView: 'overview' | 'crm' | 'radar' | 'underwriter' | 'audit' | 'chat' | 'agents' | 'drafting' | 'portfolio' | 'settings';
  searchQuery: string;
  isIngestModalOpen: boolean;
  isAuthModalOpen: boolean;
  isLenderMemoModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  isLaunchVideoOpen: boolean;
  sidebarCollapsed: boolean;

  // Agent Team System (Pencil Drafters & Mesh Architecture)
  agents: AgentPencil[];
  activeAgentId: string; // 'mesh' for war-room or agent id
  meshMessages: AgentMeshMessage[];
  spawnAgent: (agentData: Partial<AgentPencil>) => AgentPencil;
  deleteAgent: (agentId: string) => void;
  updateAgentStatus: (agentId: string, status: AgentStatus, currentTask?: string) => void;
  updateAgent: (agentId: string, updates: Partial<AgentPencil>) => void;
  setActiveAgentId: (agentId: string) => void;
  addMeshMessage: (message: AgentMeshMessage) => void;
  clearMeshMessages: () => void;

  // The Drafting Table (Agent Artifacts: Documents, Spreadsheets, HTML Code, Audits)
  artifacts: ProjectArtifact[];
  activeArtifactId: string | null;
  createArtifact: (artifact: Omit<ProjectArtifact, 'id' | 'createdAt' | 'updatedAt'>) => ProjectArtifact;
  updateArtifact: (id: string, updates: Partial<ProjectArtifact>) => void;
  deleteArtifact: (id: string) => void;
  setActiveArtifactId: (id: string | null) => void;

  // Dark Mode Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // OpenRouter & AI Model Configuration
  openRouterApiKey: string;
  selectedModel: string;
  isModelSelectorOpen: boolean;
  backendSystemPrompt: string;
  backendTemperature: number;
  autoFailoverEnabled: boolean;

  // Past Chats & Sessions
  chatSessions: ChatSession[];
  activeChatSessionId: string;
  createChatSession: (dealId?: string, dealTitle?: string) => string;
  selectChatSession: (sessionId: string) => void;
  deleteChatSession: (sessionId: string) => void;
  renameChatSession: (sessionId: string, newTitle: string) => void;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  clearChatSessionMessages: (sessionId: string) => void;

  // Actions
  loginAsGuest: () => void;
  setUserSession: (session: UserSession | null) => void;
  logout: () => void;
  setCurrentView: (view: 'overview' | 'crm' | 'radar' | 'underwriter' | 'audit' | 'chat' | 'agents' | 'drafting' | 'portfolio' | 'settings') => void;
  setSearchQuery: (query: string) => void;
  setSelectedDealId: (dealId: string | null) => void;
  moveDealStage: (dealId: string, newStage: PipelineStage) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  addDeal: (deal: Deal) => void;
  deleteDeal: (dealId: string) => void;
  resetToDemoDeals: () => void;
  setIngestModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setLenderMemoModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setLaunchVideoOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setOpenRouterApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  setModelSelectorOpen: (open: boolean) => void;
  setBackendSystemPrompt: (prompt: string) => void;
  setBackendTemperature: (temp: number) => void;
  setAutoFailoverEnabled: (enabled: boolean) => void;

  // Comp Comparison Drawer & Matrix
  comparedDealIds: string[];
  toggleCompareDeal: (dealId: string) => void;
  clearComparedDeals: () => void;
  isCompDrawerOpen: boolean;
  setCompDrawerOpen: (open: boolean) => void;
}

export const useDealStore = create<DealState>()(
  persist(
    (set, get) => ({
      userSession: {
        uid: 'guest-operator-01',
        email: 'operator@pencilstr.internal',
        displayName: 'Guest Institutional Operator',
        isGuest: true,
        role: 'operator',
      },
      isGuestDemo: true,
      deals: DEMO_DEALS.map((d, i) => sanitizeDeal(d, i)),
      selectedDealId: DEMO_DEALS[0]?.id || 'deal-gatlinburg-ridge',
      currentView: 'overview',
      searchQuery: '',
      isIngestModalOpen: false,
      isAuthModalOpen: false,
      isLenderMemoModalOpen: false,
      isCommandPaletteOpen: false,
      isLaunchVideoOpen: false,
      sidebarCollapsed: false,

      // Comp Comparison Drawer & Matrix
      comparedDealIds: [],
      toggleCompareDeal: (dealId: string) => {
        set((state) => {
          const exists = state.comparedDealIds.includes(dealId);
          return {
            comparedDealIds: exists
              ? state.comparedDealIds.filter((id) => id !== dealId)
              : [...state.comparedDealIds, dealId],
          };
        });
      },
      clearComparedDeals: () => set({ comparedDealIds: [], isCompDrawerOpen: false }),
      isCompDrawerOpen: false,
      setCompDrawerOpen: (open: boolean) => set({ isCompDrawerOpen: open }),

      // Theme
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('deal-storage', JSON.stringify({ state: { theme: next } }));
          } catch (e) {}
        }
        set({ theme: next });
      },
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('deal-storage', JSON.stringify({ state: { theme } }));
          } catch (e) {}
        }
        set({ theme });
      },

      // Default OpenRouter configuration with Free Nemotron model
      openRouterApiKey: '',
      selectedModel: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
      isModelSelectorOpen: false,
      backendSystemPrompt: 'You are the Lead Underwriting Specialist and AI Investment Committee Director at PencilSTR. You provide institutional-grade, mathematically rigorous, and legally audited short-term rental underwriting.',
      backendTemperature: 0.2,
      autoFailoverEnabled: true,

      // Past Chats & Sessions
      chatSessions: INITIAL_CHAT_SESSIONS,
      activeChatSessionId: INITIAL_CHAT_SESSIONS[0].id,

      // Agent Team State (Autonomous Pencil Scribes & Drafters Mesh)
      agents: INITIAL_AGENTS,
      activeAgentId: 'agent-astra',
      meshMessages: INITIAL_MESH_MESSAGES,

      spawnAgent: (agentData) => {
        const id = `agent-${Date.now()}`;
        const newAgent: AgentPencil = {
          id,
          name: agentData.name || `Pencil-${Date.now().toString().slice(-4)}`,
          callsign: agentData.callsign || 'SPECIALIST',
          role: agentData.role || 'Specialized Real Estate Scribe',
          description: agentData.description || 'Autonomous domain-specific underwriting drafter.',
          avatarColor: agentData.avatarColor || '#3B82F6',
          isLead: false,
          status: 'idle',
          model: agentData.model || 'Gemini 3.8 Flash',
          tasksCompleted: 0,
          createdAt: 'Just now',
          isCustom: true,
          systemPrompt: agentData.systemPrompt || 'You are an autonomous real estate underwriting scribe specialized in domain analysis.',
          memoryContext: agentData.memoryContext || ['Spawned by Astra (Lead Scribe)'],
        };

        set((state) => ({
          agents: [...state.agents, newAgent],
        }));

        return newAgent;
      },

      deleteAgent: (agentId) => {
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== agentId),
          activeAgentId: state.activeAgentId === agentId ? 'agent-astra' : state.activeAgentId,
        }));
      },

      updateAgentStatus: (agentId, status, currentTask) => {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status, currentTask: currentTask ?? a.currentTask } : a
          ),
        }));
      },

      updateAgent: (agentId, updates) => {
        set((state) => ({
          agents: state.agents.map((a) => (a.id === agentId ? { ...a, ...updates } : a)),
        }));
      },

      setActiveAgentId: (agentId) => set({ activeAgentId: agentId }),

      addMeshMessage: (message) => {
        set((state) => ({
          meshMessages: [...state.meshMessages, message],
        }));
      },

      clearMeshMessages: () => set({ meshMessages: [] }),

      // The Drafting Table (Agent Artifacts & Project Deliverables)
      artifacts: INITIAL_ARTIFACTS,
      activeArtifactId: INITIAL_ARTIFACTS[0].id,

      createArtifact: (artifactData) => {
        const id = `art-${Date.now()}`;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newArtifact: ProjectArtifact = {
          ...artifactData,
          id,
          createdAt: `Today, ${now}`,
          updatedAt: `Today, ${now}`,
        };

        set((state) => ({
          artifacts: [newArtifact, ...state.artifacts],
          activeArtifactId: id,
        }));

        return newArtifact;
      },

      updateArtifact: (id, updates) => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        set((state) => ({
          artifacts: state.artifacts.map((art) =>
            art.id === id ? { ...art, ...updates, updatedAt: `Today, ${now}` } : art
          ),
        }));
      },

      deleteArtifact: (id) => {
        set((state) => {
          const filtered = state.artifacts.filter((art) => art.id !== id);
          return {
            artifacts: filtered,
            activeArtifactId: state.activeArtifactId === id ? (filtered[0]?.id || null) : state.activeArtifactId,
          };
        });
      },

      setActiveArtifactId: (id) => set({ activeArtifactId: id }),

      loginAsGuest: () => {
        set({
          userSession: {
            uid: 'guest-operator-01',
            email: 'operator@pencilstr.internal',
            displayName: 'Guest Institutional Operator',
            isGuest: true,
            role: 'operator',
          },
          isGuestDemo: true,
          deals: DEMO_DEALS.map((d, i) => sanitizeDeal(d, i)),
          selectedDealId: DEMO_DEALS[0]?.id || 'deal-gatlinburg-ridge',
          currentView: 'crm',
        });
      },

      setUserSession: (session) => {
        set({
          userSession: session,
          isGuestDemo: session?.isGuest ?? false,
        });
      },

      logout: () => {
        set({
          userSession: null,
          isGuestDemo: false,
        });
      },

      setCurrentView: (view) => set({ currentView: view }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedDealId: (dealId) => set({ selectedDealId: dealId }),

      moveDealStage: (dealId, newStage) => {
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === dealId ? { ...d, stage: newStage, updatedAt: new Date().toISOString() } : d
          ),
        }));
      },

      updateDeal: (dealId, updates) => {
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === dealId ? sanitizeDeal({ ...d, ...updates }) : d
          ),
        }));
      },

      addDeal: (deal) => {
        const sanitized = sanitizeDeal(deal);
        set((state) => ({
          deals: [sanitized, ...state.deals],
          selectedDealId: sanitized.id,
        }));
      },

      deleteDeal: (dealId) => {
        set((state) => {
          const newDeals = state.deals.filter((d) => d.id !== dealId);
          const finalDeals = newDeals.length > 0 ? newDeals : DEMO_DEALS.map((d, i) => sanitizeDeal(d, i));
          return {
            deals: finalDeals,
            selectedDealId: finalDeals[0]?.id ?? null,
          };
        });
      },

      resetToDemoDeals: () => {
        const pristine = DEMO_DEALS.map((d, i) => sanitizeDeal(d, i));
        set({
          deals: pristine,
          selectedDealId: pristine[0]?.id || 'deal-gatlinburg-ridge',
        });
      },

      setIngestModalOpen: (open) => set({ isIngestModalOpen: open }),
      setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
      setLenderMemoModalOpen: (open) => set({ isLenderMemoModalOpen: open }),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      setLaunchVideoOpen: (open) => set({ isLaunchVideoOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setOpenRouterApiKey: (key) => set({ openRouterApiKey: key }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setModelSelectorOpen: (open) => set({ isModelSelectorOpen: open }),
      setBackendSystemPrompt: (prompt) => set({ backendSystemPrompt: prompt }),
      setBackendTemperature: (temp) => set({ backendTemperature: temp }),
      setAutoFailoverEnabled: (enabled) => set({ autoFailoverEnabled: enabled }),

      createChatSession: (dealId, dealTitle) => {
        const id = `session-${Date.now()}`;
        const targetDeal = get().deals.find((d) => d.id === dealId) || get().deals[0];
        const newSession: ChatSession = {
          id,
          dealId: targetDeal?.id || 'deal-gatlinburg-ridge',
          dealTitle: targetDeal?.title || 'Active Property',
          title: dealTitle || `Underwriting: ${targetDeal?.title || 'New Deal'}`,
          createdAt: 'Just now',
          updatedAt: 'Just now',
          messages: [
            {
              id: `welcome-${id}`,
              role: 'assistant',
              content: `Underwriting intelligence initialized for **${targetDeal?.title}** (${targetDeal?.city}, ${targetDeal?.state}) at **$${targetDeal?.price?.toLocaleString()}**.\n\n• **Baseline ADR & Occupancy**: $${targetDeal?.baseAdr}/night at ${targetDeal?.baseOccupancy}% stabilized occupancy\n• **Financing Strategy**: 30-year fixed DSCR with a **${targetDeal?.breakEvenOccupancy}%** break-even hurdle\n• **Covenant Compliance**: **${targetDeal?.audit?.str_status || 'PERMITTED'}** (MLS #${targetDeal?.mlsNumber})\n\nAsk any question about debt service sensitivity, seasonal revenue swings, operating expense ratios, or local CC&R bylaws.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };

        set((state) => ({
          chatSessions: [newSession, ...state.chatSessions],
          activeChatSessionId: id,
          selectedDealId: targetDeal?.id || state.selectedDealId,
        }));
        return id;
      },

      selectChatSession: (sessionId) => {
        const session = get().chatSessions.find((s) => s.id === sessionId);
        set({
          activeChatSessionId: sessionId,
          ...(session?.dealId ? { selectedDealId: session.dealId } : {}),
        });
      },

      deleteChatSession: (sessionId) => {
        set((state) => {
          const remaining = state.chatSessions.filter((s) => s.id !== sessionId);
          const nextSessions = remaining.length > 0 ? remaining : INITIAL_CHAT_SESSIONS;
          const nextActiveId = state.activeChatSessionId === sessionId
            ? nextSessions[0].id
            : state.activeChatSessionId;
          return {
            chatSessions: nextSessions,
            activeChatSessionId: nextActiveId,
          };
        });
      },

      renameChatSession: (sessionId, newTitle) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId ? { ...s, title: newTitle.trim() || s.title } : s
          ),
        }));
      },

      addMessageToSession: (sessionId, message) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  updatedAt: 'Just now',
                  messages: [...s.messages, message],
                }
              : s
          ),
        }));
      },

      clearChatSessionMessages: (sessionId) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.slice(0, 1),
                }
              : s
          ),
        }));
      },
    }),
    {
      name: 'pencilstr_store_v3',
      partialize: (state) => ({
        userSession: state.userSession,
        isGuestDemo: state.isGuestDemo,
        deals: state.deals,
        selectedDealId: state.selectedDealId,
        currentView: state.currentView,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        openRouterApiKey: state.openRouterApiKey,
        selectedModel: state.selectedModel,
        backendSystemPrompt: state.backendSystemPrompt,
        backendTemperature: state.backendTemperature,
        autoFailoverEnabled: state.autoFailoverEnabled,
        chatSessions: state.chatSessions,
        activeChatSessionId: state.activeChatSessionId,
        comparedDealIds: state.comparedDealIds,
      }),
      merge: (persistedState: any, currentState: DealState) => {
        try {
          const rawDeals = persistedState?.deals;
          let sanitizedDeals: Deal[] = DEMO_DEALS.map((d, i) => sanitizeDeal(d, i));
          if (Array.isArray(rawDeals) && rawDeals.length > 0) {
            sanitizedDeals = rawDeals.map((d: any, i: number) => sanitizeDeal(d, i));
          }

          const targetDealId =
            persistedState?.selectedDealId && sanitizedDeals.some((d) => d.id === persistedState.selectedDealId)
              ? persistedState.selectedDealId
              : sanitizedDeals[0]?.id || DEMO_DEALS[0].id;

          const savedTheme = persistedState?.theme || 'dark';
          if (typeof document !== 'undefined') {
            if (savedTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }

          return {
            ...currentState,
            ...persistedState,
            deals: sanitizedDeals,
            selectedDealId: targetDealId,
            theme: savedTheme,
            selectedModel: persistedState?.selectedModel || 'nvidia/llama-3.1-nemotron-70b-instruct:free',
            openRouterApiKey: persistedState?.openRouterApiKey || '',
            backendSystemPrompt: persistedState?.backendSystemPrompt || currentState.backendSystemPrompt,
            backendTemperature: persistedState?.backendTemperature ?? currentState.backendTemperature,
            autoFailoverEnabled: persistedState?.autoFailoverEnabled ?? currentState.autoFailoverEnabled,
            chatSessions: Array.isArray(persistedState?.chatSessions) && persistedState.chatSessions.length > 0
              ? persistedState.chatSessions
              : INITIAL_CHAT_SESSIONS,
            activeChatSessionId: persistedState?.activeChatSessionId || INITIAL_CHAT_SESSIONS[0].id,
            comparedDealIds: Array.isArray(persistedState?.comparedDealIds)
              ? persistedState.comparedDealIds
              : [],
            isCompDrawerOpen: false,
            isModelSelectorOpen: false,
            isCommandPaletteOpen: false,
          };
        } catch (err) {
          console.warn('Recovered from persisted store migration:', err);
          return currentState;
        }
      },
    }
  )
);
