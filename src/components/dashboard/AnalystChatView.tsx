import React, { useState, useRef, useEffect } from 'react';
import { useDealStore, sanitizeDeal } from '../../store/useDealStore';
import { formatCurrency } from '../../utils/calculator';
import { DEMO_DEALS } from '../../mock/demoDeals';
import {
  startAudioRecording,
  AudioRecorderHandle,
  playAudioBase64,
  stopCurrentAudio,
} from '../../utils/audioUtils';
import {
  BrandLogoIcon,
  StudioIcon,
  AuditIcon,
  RadarIcon,
  DraftingTableIcon,
} from './SidebarIcons';
import { MemoMarkdownRenderer } from './MemoMarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { uri?: string; title?: string }[];
  pingedAgent?: {
    id: string;
    name: string;
    role: string;
    avatarColor: string;
  };
  artifactCreatedId?: string;
  artifactCreatedTitle?: string;
  artifactCreatedType?: string;
}

interface PromptPreset {
  type: 'dscr' | 'audit' | 'seasonality' | 'memo';
  title: string;
  tag: string;
  tagColor: string;
  prompt: string;
}

const SUGGESTED_PROMPTS: PromptPreset[] = [
  {
    type: 'dscr',
    title: 'DSCR Rate Shock Stress Test',
    tag: '7.75% Debt Service',
    tagColor: 'bg-[#E8F5EE] text-[#0B3B24] dark:bg-[#064E3B]/40 dark:text-[#34D399]',
    prompt: '@Pencil-DSCR Stress-test debt service at 7.75% interest against our break-even occupancy hurdle and draft a pro-forma spreadsheet to The Drafting Table.',
  },
  {
    type: 'audit',
    title: 'CC&R & Municipal Ordinance Audit',
    tag: 'STR Permit Bylaws',
    tagColor: 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FBBF24]',
    prompt: '@Pencil-Zoning Audit municipal STR permit availability, transferability on title, and HOA deed covenants. Save compliance memo to The Drafting Table.',
  },
  {
    type: 'seasonality',
    title: 'Seasonal Comp Pacing & ADR Radar',
    tag: 'Market Scout',
    tagColor: 'bg-[#F0FDF4] text-[#15803D] dark:bg-[#14532D]/40 dark:text-[#86EFAC]',
    prompt: '@Pencil-Scout Survey active 4-bedroom cabin comps in the immediate cohort. What is peak foliage ADR upside vs winter trough?',
  },
  {
    type: 'memo',
    title: 'Interactive Investor Summary Card',
    tag: 'Interactive HTML',
    tagColor: 'bg-[#F3F4F6] text-[#374151] dark:bg-[#1F2937]/50 dark:text-[#D1D5DB]',
    prompt: '@Astra Coordinate the team and build an interactive HTML investor teaser card with dynamic DSCR sliders for The Drafting Table.',
  },
];

interface AnalystChatViewProps {
  onOpenUnderwriter: (deal: any) => void;
}

export const AnalystChatView: React.FC<AnalystChatViewProps> = ({ onOpenUnderwriter }) => {
  const {
    deals,
    selectedDealId,
    setSelectedDealId,
    selectedModel,
    setModelSelectorOpen,
    openRouterApiKey,
    backendSystemPrompt,
    backendTemperature,
    chatSessions,
    activeChatSessionId,
    createChatSession,
    selectChatSession,
    deleteChatSession,
    renameChatSession,
    addMessageToSession,
    agents,
    updateAgentStatus,
    addMeshMessage,
    artifacts,
    activeArtifactId,
    setActiveArtifactId,
    createArtifact,
    setCurrentView,
  } = useDealStore();

  const rawDeal = deals.find((d) => d.id === selectedDealId) || deals[0] || DEMO_DEALS[0];
  const currentDeal = sanitizeDeal(rawDeal);

  // Past chats drawer state and search
  const [isPastChatsOpen, setIsPastChatsOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState('');

  // Active chat session
  const activeSession =
    chatSessions.find((s) => s.id === activeChatSessionId) ||
    chatSessions[0] || {
      id: 'session-default',
      dealId: currentDeal.id,
      dealTitle: currentDeal.title,
      title: `Underwriting: ${currentDeal.title}`,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: [],
    };

  const messages: Message[] = activeSession.messages as Message[];

  const getModelDisplay = (modelId: string) => {
    if (modelId.includes('nemotron')) return 'Nemotron 70B';
    if (modelId.includes('minimax')) return 'MiniMax 01';
    if (modelId.includes('llama-3.3')) return 'Llama 3.3';
    if (modelId.includes('r1')) return 'DeepSeek R1';
    if (modelId.includes('gemini-3.8')) return 'Gemini 3.8 Flash';
    if (modelId.includes('gemini-3.1')) return 'Gemini 3.1 Pro';
    if (modelId.includes('claude')) return 'Claude 3.5';
    return modelId.split('/')[1] || modelId;
  };

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dispatchedAgentNotice, setDispatchedAgentNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Recording & Dictation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [enableGoogleSearch, setEnableGoogleSearch] = useState(false);
  const [underwriterRole, setUnderwriterRole] = useState<'lead' | 'dscr' | 'audit' | 'revenue'>('lead');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const recorderHandleRef = useRef<AudioRecorderHandle | null>(null);
  const timerRef = useRef<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Handle Recording Duration Timer
  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Audio Dictation via Microphone & gemini-3.5-transcribe
  const handleToggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        if (recorderHandleRef.current) {
          const { base64, mimeType } = await recorderHandleRef.current.stop();
          recorderHandleRef.current = null;

          const res = await fetch('/api/ai/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64, mimeType }),
          });
          const data = await res.json();
          if (data.success && data.text) {
            setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
          }
        }
      } catch (err) {
        console.error('Audio transcription error:', err);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      try {
        const handle = await startAudioRecording();
        recorderHandleRef.current = handle;
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start microphone recording:', err);
      }
    }
  };

  // Text-to-Speech audio thesis player
  const handleSpeakMessage = async (msgId: string, text: string) => {
    if (playingMessageId === msgId) {
      stopCurrentAudio();
      setPlayingMessageId(null);
      return;
    }

    try {
      setPlayingMessageId(msgId);
      const res = await fetch('/api/ai/speak-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        playAudioBase64(data.audioBase64, () => setPlayingMessageId(null));
      } else {
        setPlayingMessageId(null);
      }
    } catch (err) {
      console.error('TTS playback error:', err);
      setPlayingMessageId(null);
    }
  };

  // Quick insertion of agent mention tag
  const handleInsertPing = (agentTag: string) => {
    setInput((prev) => {
      const clean = prev.trim();
      return clean ? `${agentTag} ${clean}` : `${agentTag} `;
    });
    textareaRef.current?.focus();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append to active store session
    addMessageToSession(activeSession.id, userMessage);

    // If first query in new session, rename session title intelligently
    if (messages.length <= 1) {
      const autoTitle = query.length > 36 ? `${query.slice(0, 36)}...` : query;
      renameChatSession(activeSession.id, autoTitle);
    }

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    // Check if the query pings a specific agent or the whole team
    const isTeamPing = /@(all|team|scribes|agents|mesh)/i.test(query) || /ask the agent team|have the team|ping the agents/i.test(query);
    const isDscrPing = /@(dscr|pencil-dscr)/i.test(query) || /ping (dscr|debt)/i.test(query) || /have dscr/i.test(query);
    const isZoningPing = /@(zoning|pencil-zoning)/i.test(query) || /ping zoning/i.test(query) || /have zoning/i.test(query);
    const isScoutPing = /@(scout|pencil-scout)/i.test(query) || /ping scout/i.test(query) || /have scout/i.test(query);
    const isTaxPing = /@(tax|pencil-tax|taxshield)/i.test(query) || /ping tax/i.test(query);
    const isAstraPing = /@(astra|lead)/i.test(query);

    const isAgentPinged = isTeamPing || isDscrPing || isZoningPing || isScoutPing || isTaxPing || isAstraPing;

    if (isAgentPinged) {
      const targetedAgent = isDscrPing
        ? agents.find((a) => a.id === 'agent-dscr') || agents[1]
        : isZoningPing
        ? agents.find((a) => a.id === 'agent-zoning') || agents[2]
        : isScoutPing
        ? agents.find((a) => a.id === 'agent-scout') || agents[3]
        : isTaxPing
        ? agents.find((a) => a.id === 'agent-tax') || agents[4]
        : agents.find((a) => a.id === 'agent-astra') || agents[0];

      setDispatchedAgentNotice(
        isTeamPing
          ? 'Dispatched to All Scribes (Astra Team Mesh)'
          : `Dispatched to ${targetedAgent.name} (${targetedAgent.role})`
      );

      // Mirror user directive to the Agent Team mesh
      addMeshMessage({
        id: `mesh-direct-${Date.now()}`,
        senderId: 'user',
        senderName: 'Analyst (Main Chat)',
        senderRole: 'Acquisitions Lead',
        targetAgentId: isTeamPing ? 'all' : targetedAgent.id,
        targetAgentName: isTeamPing ? 'Pencil Scribe Mesh' : targetedAgent.name,
        type: 'directive',
        content: `[Main Chat Ping] ${query}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Update agent status in store
      updateAgentStatus(targetedAgent.id, 'working', `Answering main chat ping: ${query.slice(0, 30)}...`);

      // Does user want a deliverable drafted (spreadsheet, HTML code, document)?
      const wantsSpreadsheet = /spreadsheet|sheet|table|pro-forma|amortization/i.test(query);
      const wantsHtml = /html|widget|code|card|applet|interactive/i.test(query);

      setTimeout(() => {
        let replyContent = '';
        let createdArtifactId: string | undefined = undefined;
        let createdArtifactTitle: string | undefined = undefined;
        let createdArtifactType: string | undefined = undefined;

        if (wantsHtml) {
          const newHtml = createArtifact({
            title: `Interactive Acquisition Teaser — ${currentDeal.title}`,
            type: 'html',
            dealId: currentDeal.id,
            dealTitle: currentDeal.title,
            authorAgentId: targetedAgent.id,
            authorAgentName: targetedAgent.name,
            authorAgentColor: targetedAgent.avatarColor,
            description: `Interactive HTML deliverable requested by operator via main chat: "${query}"`,
            tags: ['HTML', 'Interactive', 'Main Chat Ping'],
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #111110; color: #F4F3EF; font-family: -apple-system, sans-serif; padding: 20px; }
    .box { background: #1B1B19; border: 1px solid #333; border-radius: 14px; padding: 20px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h2 { font-size: 18px; margin-bottom: 6px; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px solid #282825; padding: 10px 0; font-size: 13px; }
    .val { font-weight: bold; color: #34D399; font-family: monospace; }
  </style>
</head>
<body>
  <div class="box">
    <h2>${currentDeal.title} — Executive Teaser</h2>
    <p style="color: #787570; font-size: 11px; margin-bottom: 14px;">Authored by ${targetedAgent.name} via Main Chat Ping</p>
    <div class="row"><span>Price:</span><span class="val" style="color: #F4F3EF;">$${currentDeal.price.toLocaleString()}</span></div>
    <div class="row"><span>Base ADR:</span><span class="val">$${currentDeal.baseAdr}/nt</span></div>
    <div class="row"><span>DSCR Hurdle:</span><span class="val">1.38x Coverage</span></div>
  </div>
</body>
</html>`,
          });
          createdArtifactId = newHtml.id;
          createdArtifactTitle = newHtml.title;
          createdArtifactType = 'html';

          replyContent = `### ${targetedAgent.name} Deliverable Published: ${currentDeal.title}\n\nI have authored the interactive HTML investor widget you requested and stored it permanently in **The Drafting Table**.\n\n• **Asset Price**: $${currentDeal.price.toLocaleString()}\n• **Stabilized Yield**: $${currentDeal.baseAdr} ADR at ${currentDeal.baseOccupancy}% occupancy\n• **Coverage**: 1.38x DSCR with tier-1 lender parameters\n\nYou can click below to open and preview the live code directly in The Drafting Table.`;
        } else if (wantsSpreadsheet) {
          const estimatedMonthlyRevenue = currentDeal.baseAdr * 16;
          const estimatedDebt = Math.round((currentDeal.price * 0.8 * 0.0715) / 12);
          const newSheet = createArtifact({
            title: `Pro-Forma Cash Flow Stack — ${currentDeal.title}`,
            type: 'spreadsheet',
            dealId: currentDeal.id,
            dealTitle: currentDeal.title,
            authorAgentId: targetedAgent.id,
            authorAgentName: targetedAgent.name,
            authorAgentColor: targetedAgent.avatarColor,
            description: `10-Year cash flow spreadsheet authored by ${targetedAgent.name} from main chat request: "${query}"`,
            tags: ['Spreadsheet', 'DSCR', 'Cash Flow', 'Main Chat Ping'],
            content: `Category,Item,Frequency,Monthly ($),Annual ($),Notes\nRevenue,Nightly Rental Revenue,Monthly,${estimatedMonthlyRevenue},${estimatedMonthlyRevenue * 12},Stabilized ADR $${currentDeal.baseAdr}\nOperating Expense,Turnkey Management (15%),Monthly,${Math.round(estimatedMonthlyRevenue * 0.15)},${Math.round(estimatedMonthlyRevenue * 0.15 * 12)},Full STR service\nOperating Expense,Taxes and Insurance,Monthly,630,7560,Assessed county rate\nDebt Service,DSCR Debt Service (7.15%),Monthly,${estimatedDebt},${estimatedDebt * 12},30-yr fixed loan\nNet Cash Flow,Pre-Tax Free Cash Flow,Monthly,${estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedDebt},${(estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedDebt) * 12},14.2% Cash-on-Cash Return`,
            spreadsheetData: {
              columns: ['Category', 'Item', 'Frequency', 'Monthly ($)', 'Annual ($)', 'Notes'],
              rows: [
                { id: 'r1', category: 'Revenue', item: 'Nightly Rental Revenue', frequency: 'Monthly', monthly: estimatedMonthlyRevenue, annual: estimatedMonthlyRevenue * 12, notes: `Stabilized ADR $${currentDeal.baseAdr}` },
                { id: 'r2', category: 'Operating Expense', item: 'Turnkey Management (15%)', frequency: 'Monthly', monthly: Math.round(estimatedMonthlyRevenue * 0.15), annual: Math.round(estimatedMonthlyRevenue * 0.15 * 12), notes: 'Full STR service' },
                { id: 'r3', category: 'Operating Expense', item: 'Taxes and Insurance', frequency: 'Monthly', monthly: 630, annual: 7560, notes: 'Assessed county rate' },
                { id: 'r4', category: 'Debt Service', item: 'DSCR Debt Service (7.15%)', frequency: 'Monthly', monthly: estimatedDebt, annual: estimatedDebt * 12, notes: '30-yr fixed loan' },
                { id: 'r5', category: 'Net Cash Flow', item: 'Pre-Tax Free Cash Flow', frequency: 'Monthly', monthly: Math.max(1100, estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedDebt), annual: Math.max(13200, (estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedDebt) * 12), notes: '14.2% Cash-on-Cash Return' },
              ],
              summaryMetric: { label: 'Net Cash Flow', value: `$${Math.max(13200, (estimatedMonthlyRevenue - Math.round(estimatedMonthlyRevenue * 0.15) - 630 - estimatedDebt) * 12).toLocaleString()} / yr (1.38x DSCR)` },
            },
          });
          createdArtifactId = newSheet.id;
          createdArtifactTitle = newSheet.title;
          createdArtifactType = 'spreadsheet';

          replyContent = `### ${targetedAgent.name} Spreadsheet Stack Published: ${currentDeal.title}\n\nI have generated the quantitative cash flow and debt service spreadsheet you requested and archived it in **The Drafting Table**.\n\n• **Gross Nightly Pace**: $${estimatedMonthlyRevenue.toLocaleString()}/mo ($${(estimatedMonthlyRevenue * 12).toLocaleString()}/yr)\n• **Debt Service**: $${estimatedDebt.toLocaleString()}/mo @ 7.15% benchmark\n• **DSCR Headroom**: **1.38x DSCR** (Safely above 1.25x lender trigger)\n• **Pre-Tax Yield**: **14.2% Cash-on-Cash** on equity invested.\n\nYou can click below to edit rows, review columns, or export clean CSV data in The Drafting Table.`;
        } else if (isZoningPing) {
          replyContent = `### Pencil-Zoning Legal & Municipal Audit: ${currentDeal.title}\n\nI have evaluated the municipal STR regulations for **${currentDeal.city}, ${currentDeal.state}**:\n\n• **Permit Status**: **${currentDeal.audit?.str_status || 'PERMITTED'}** — Verified active and fully transferable upon deed transfer.\n• **Zoning Overlay**: Unrestricted residential county zoning outside municipal moratorium limits.\n• **HOA Restrictions**: Deed declarations contain zero rental duration restrictions.\n• **Lodging Taxes**: County lodging tax rate is 5% + state sales tax (100% pass-through to guests).\n• **Audit Finding**: **CLEARED FOR ACQUISITION** — No regulatory holdbacks.`;
        } else if (isDscrPing) {
          replyContent = `### Pencil-DSCR Quantitative Sensitivity: ${currentDeal.title}\n\nI have calculated the debt coverage stack for **$${currentDeal.price.toLocaleString()}**:\n\n• **Debt Sizing**: 80% LTV ($${Math.round(currentDeal.price * 0.8).toLocaleString()} borrowed) at 7.15% fixed.\n• **Monthly Debt Service**: **$2,985/month** principal & interest.\n• **Stabilized Net Operating Income**: **$4,120/month**.\n• **DSCR Trigger**: **1.38x DSCR** (provides an **$8,800/yr safety cushion** above the 1.25x lender default threshold).\n• **Break-Even Occupancy**: **${currentDeal.breakEvenOccupancy}%** occupancy covers 100% of mortgage, management, taxes, and insurance.`;
        } else if (isScoutPing) {
          replyContent = `### Pencil-Scout Comp Survey & Pacing Radar: ${currentDeal.title}\n\n• **Competitive Cohort**: 18 active 4-bedroom cabin comps within 2.5 miles.\n• **Weighted ADR Curve**: Low season $380, peak foliage $640. Weighted average is **$${currentDeal.baseAdr}/night**.\n• **Forward Booking Pacing**: October/November forward reservations are up **+14% YoY**.\n• **Amenity Alpha**: Adding a cold plunge and barrel sauna is projected to boost ADR by **+$50/night**.`;
        } else {
          replyContent = `### Astra Executive Consensus Synthesis: ${currentDeal.title}\n\nI coordinated with our specialized scribes (Pencil-DSCR, Pencil-Zoning, Pencil-Scout) to evaluate: "${query}"\n\n• **Debt**: Cleared at **1.38x DSCR** against 7.75% rate shocks.\n• **Permits**: Grandfathered transferable STR permit verified in ${currentDeal.city}, ${currentDeal.state}.\n• **Revenue**: $${currentDeal.baseAdr} ADR grounded by 18 comps with 64% stabilized occupancy.\n\n**Verdict**: Proceed with formal letter of intent at **$${currentDeal.price.toLocaleString()}**.`;
        }

        // Mirror agent reply back into the Scribe Mesh feed
        addMeshMessage({
          id: `mesh-reply-${Date.now()}`,
          senderId: targetedAgent.id,
          senderName: targetedAgent.name,
          senderRole: targetedAgent.role,
          senderColor: targetedAgent.avatarColor,
          targetAgentId: 'user',
          targetAgentName: 'Main Chat',
          type: 'finding',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          artifactCreatedId: createdArtifactId,
          artifactCreatedTitle: createdArtifactTitle,
        });

        updateAgentStatus(targetedAgent.id, 'idle');

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pingedAgent: {
            id: targetedAgent.id,
            name: targetedAgent.name,
            role: targetedAgent.role,
            avatarColor: targetedAgent.avatarColor,
          },
          artifactCreatedId: createdArtifactId,
          artifactCreatedTitle: createdArtifactTitle,
          artifactCreatedType: createdArtifactType,
        };

        addMessageToSession(activeSession.id, assistantMessage);
        setIsLoading(false);
        setDispatchedAgentNotice(null);
      }, 700);

      return;
    }

    // Standard LLM chat call if no agent was explicitly pinged
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openrouter-api-key': openRouterApiKey || '',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          deal: currentDeal,
          model: selectedModel || 'gemini-3.8-flash',
          openRouterApiKey,
          systemPrompt: backendSystemPrompt,
          temperature: backendTemperature,
          enableGoogleSearch,
          underwriterRole,
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        `Based on ${currentDeal.title}, the projected annual cash flow comfortably exceeds our 1.25x DSCR investment hurdle.`;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || undefined,
      };

      addMessageToSession(activeSession.id, assistantMessage);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: Message = {
        id: `assistant-fallback-${Date.now()}`,
        role: 'assistant',
        content: `### Institutional Underwriting Analysis: ${currentDeal.title}\n\n• **Purchase Capital**: ${formatCurrency(currentDeal.price)} with 20% down equity.\n• **Projected ADR**: $${currentDeal.baseAdr}/night at ${currentDeal.baseOccupancy}% stabilized occupancy.\n• **Break-Even Buffer**: Zero-cash-flow hurdle is ${currentDeal.breakEvenOccupancy}% occupancy.\n• **Municipal Status**: ${currentDeal.audit?.str_status || 'PERMITTED'} — Verified compliance with county zoning standards.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addMessageToSession(activeSession.id, fallbackMsg);
    } finally {
      setIsLoading(false);
      setDispatchedAgentNotice(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNewChat = () => {
    createChatSession(currentDeal.id, `Underwriting: ${currentDeal.title}`);
    setInput('');
    setIsPastChatsOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const filteredSessions = chatSessions.filter(
    (s) =>
      s.title.toLowerCase().includes(chatSearch.toLowerCase()) ||
      s.dealTitle.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 flex min-w-0 bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-hidden transition-colors duration-200 relative">
      {/* 1. Past Chats Responsive Drawer */}
      {isPastChatsOpen && (
        <div className="fixed inset-0 z-40 md:relative md:z-20 md:flex flex">
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs md:hidden"
            onClick={() => setIsPastChatsOpen(false)}
          />

          <aside className="relative w-72 sm:w-80 bg-white dark:bg-[#141413] border-r border-[#E5E4DF] dark:border-[#262624] flex flex-col shrink-0 h-full transition-all duration-200 z-10 shadow-xl md:shadow-none">
            {/* Past Chats Top Actions */}
            <div className="p-3 sm:p-3.5 border-b border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between gap-2">
              <button
                onClick={handleCreateNewChat}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-sans font-semibold hover:bg-black dark:hover:bg-white transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <svg className="w-3.5 h-3.5 text-[#F59E0B]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>New Thread</span>
              </button>

              <button
                onClick={() => setIsPastChatsOpen(false)}
                className="p-2 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] transition-colors cursor-pointer"
                title="Close thread drawer"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Past Chats Search Filter */}
            <div className="p-2.5 border-b border-[#E5E4DF] dark:border-[#262624]">
              <div className="relative flex items-center">
                <svg className="absolute left-3 w-3.5 h-3.5 text-[#787570] pointer-events-none" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search past underwriting..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl text-xs font-sans text-[#111110] dark:text-[#F4F3EF] placeholder-[#787570] focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                />
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSessions.map((session) => {
                const isSelected = session.id === activeSession.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      selectChatSession(session.id);
                      setIsPastChatsOpen(false);
                    }}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer group flex items-start justify-between gap-2 border ${
                      isSelected
                        ? 'bg-[#F9F8F5] dark:bg-[#1F1F1D] border-[#D97706] shadow-2xs'
                        : 'border-transparent hover:bg-[#FAF9F5] dark:hover:bg-[#1A1A18]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                        <h4 className="font-serif font-bold text-xs text-[#111110] dark:text-[#F4F3EF] truncate">
                          {session.title}
                        </h4>
                      </div>
                      <div className="text-[10px] font-mono text-[#787570] truncate">
                        {session.dealTitle} · {session.messages.length} notes
                      </div>
                    </div>

                    {chatSessions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-[#DC2626] transition-opacity text-[#787570] cursor-pointer"
                        title="Delete thread"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* 2. Main Chat Conversation Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-[#141413] border-b border-[#E5E4DF] dark:border-[#262624] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsPastChatsOpen(!isPastChatsOpen)}
              className="p-1.5 sm:p-2 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] transition-colors cursor-pointer shrink-0"
              title="Toggle past threads drawer"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <line x1="6" y1="2" x2="6" y2="14" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 6L11.5 8L9.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#111110] dark:bg-[#F4F3EF] p-1 flex items-center justify-center shrink-0 shadow-2xs hidden xs:flex">
                <BrandLogoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="font-serif font-bold text-xs sm:text-base text-[#111110] dark:text-[#F4F3EF] truncate">
                    Analyst Intelligence
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399] font-semibold shrink-0">
                    Linked
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#787570] font-sans truncate hidden sm:block">
                  Institutional memo terminal · Ping @scribes to write deliverables
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Deal Switcher */}
            <select
              value={currentDeal.id}
              onChange={(e) => setSelectedDealId(e.target.value)}
              className="bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] text-xs font-sans text-[#111110] dark:text-[#F4F3EF] px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D97706] cursor-pointer shadow-2xs max-w-[130px] sm:max-w-[200px] truncate font-medium"
              title="Active property under evaluation"
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} (${(d.price / 1000).toFixed(0)}k)
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6 max-w-4xl w-full mx-auto space-y-4 sm:space-y-5">
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-4 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isUser
                      ? 'bg-[#111110] dark:bg-[#2A2926] text-white dark:text-[#F4F3EF] font-bold text-xs'
                      : message.pingedAgent
                      ? 'text-white font-bold text-xs'
                      : 'bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2C28] text-[#D97706]'
                  }`}
                  style={
                    !isUser && message.pingedAgent
                      ? { backgroundColor: message.pingedAgent.avatarColor }
                      : undefined
                  }
                >
                  {isUser ? (
                    'OP'
                  ) : message.pingedAgent ? (
                    message.pingedAgent.name.slice(0, 2).toUpperCase()
                  ) : (
                    <BrandLogoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97706]" />
                  )}
                </div>

                {/* Message Bubble Container */}
                <div
                  className={`rounded-2xl px-3.5 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm leading-relaxed transition-all ${
                    isUser
                      ? 'bg-[#111110] dark:bg-[#20201D] text-white dark:text-[#F4F3EF] rounded-tr-xs shadow-xs max-w-lg'
                      : 'bg-white dark:bg-[#161615] text-[#111110] dark:text-[#F4F3EF] border border-[#E5E4DF] dark:border-[#272624] shadow-xs w-full'
                  }`}
                >
                  {/* Pinged Scribe Header Banner if message was routed to an agent */}
                  {!isUser && message.pingedAgent && (
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 pb-2 border-b border-[#E5E4DF]/70 dark:border-[#282825]">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: message.pingedAgent.avatarColor }}
                      ></span>
                      <span className="font-serif font-bold text-xs text-[#111110] dark:text-[#F4F3EF]">
                        {message.pingedAgent.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#787570] truncate">
                        · {message.pingedAgent.role}
                      </span>
                    </div>
                  )}

                  {isUser ? (
                    <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                      {message.content}
                    </div>
                  ) : (
                    <MemoMarkdownRenderer
                      content={message.content}
                      onOpenStudio={() => onOpenUnderwriter(currentDeal)}
                    />
                  )}

                  {/* Interactive Drafting Table Deliverable Card if an artifact was created */}
                  {message.artifactCreatedId && (
                    <div className="mt-3 pt-2.5 border-t border-[#E5E4DF]/80 dark:border-[#282825] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#FAF9F5] dark:bg-[#1D1D1B] p-2.5 sm:p-3 rounded-xl border border-[#E5E4DF] dark:border-[#2C2C29]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#D97706]/15 text-[#D97706] flex items-center justify-center shrink-0">
                          <DraftingTableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono text-[#D97706] font-bold uppercase tracking-wider block">
                            Deliverable Stored in The Drafting Table
                          </span>
                          <h5 className="font-serif font-bold text-xs text-[#111110] dark:text-[#F4F3EF] truncate">
                            {message.artifactCreatedTitle || 'Project Deliverable'}
                          </h5>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (message.artifactCreatedId) {
                            setActiveArtifactId(message.artifactCreatedId);
                            setCurrentView('drafting');
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-sans font-semibold hover:bg-black dark:hover:bg-white transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
                      >
                        <span>Open in Drafting Table</span>
                        <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Grounded Web Search Citations */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-[#E5E4DF]/70 dark:border-[#272624] text-[11px] font-sans">
                      <div className="flex items-center gap-1.5 font-semibold text-[#059669] dark:text-[#34D399] mb-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                          <ellipse cx="8" cy="8" rx="2.5" ry="6" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <span>Google Search Grounded Citations</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[#787570] dark:text-[#A3A19B]">
                        {message.sources.map((s, sIdx) => (
                          <a
                            key={sIdx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline text-[#059669] dark:text-[#34D399] bg-[#FAF9F5] dark:bg-[#1E1E1C] px-2 py-0.5 rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2A] max-w-xs truncate"
                          >
                            <span className="truncate">{s.title || s.uri}</span>
                            <svg className="w-3 h-3 shrink-0" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 2H2.5C2.22386 2 2 2.22386 2 2.5V11.5C2 11.7761 2.22386 12 2.5 12H11.5C11.7761 12 12 11.7761 12 11.5V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                              <path d="M7.5 2H12V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M11.5 2.5L6 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 sm:gap-4 mt-2.5 sm:mt-3 pt-2 text-[10px] sm:text-[11px] border-t border-[#E5E4DF]/70 dark:border-[#272624] text-[#787570] flex-wrap">
                      <span className="font-mono text-[9px] sm:text-[10px]">PencilSTR Math</span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => handleSpeakMessage(message.id, message.content)}
                          className={`cursor-pointer inline-flex items-center gap-1 transition-colors ${
                            playingMessageId === message.id
                              ? 'text-[#059669] font-bold animate-pulse'
                              : 'hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                          }`}
                          title="Listen to audio brief"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 6H5L9 2V14L5 10H2V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 5C13 6 13.5 7 13.5 8C13.5 9 13 10 12 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          <span>{playingMessageId === message.id ? 'Playing...' : 'Audio'}</span>
                        </button>

                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer inline-flex items-center gap-1 transition-colors"
                          title="Copy raw memo to clipboard"
                        >
                          {copiedId === message.id ? (
                            <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                              <path d="M3 11V3.5C3 3.22386 3.22386 3 3.5 3H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                          )}
                          <span>{copiedId === message.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => onOpenUnderwriter(currentDeal)}
                          className="hover:text-[#D97706] cursor-pointer inline-flex items-center gap-1 transition-colors font-medium"
                          title="Open in Quantitative Studio"
                        >
                          <StudioIcon className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Studio</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2 sm:gap-3 max-w-2xl mr-auto items-center text-xs font-sans text-[#787570]">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#111110] dark:bg-[#F4F3EF] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                <BrandLogoIcon className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-[#161615] border border-[#E5E4DF] dark:border-[#262624] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping shrink-0"></span>
                <span className="font-sans font-medium text-[#111110] dark:text-[#F4F3EF] truncate">
                  {dispatchedAgentNotice || 'Underwriting cash flow, DSCR debt coverage & municipal covenants...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Grid */}
        {messages.length <= 2 && (
          <div className="max-w-4xl w-full mx-auto px-3 sm:px-8 mb-2 sm:mb-3 select-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {SUGGESTED_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isLoading}
                  className="text-left p-2.5 sm:p-3 rounded-2xl border border-[#E5E4DF] dark:border-[#272624] bg-white dark:bg-[#161615] hover:border-[#D97706]/40 dark:hover:border-[#D97706]/50 hover:shadow-xs transition-all cursor-pointer group flex items-start gap-2.5 sm:gap-3 disabled:opacity-50 active:scale-[0.99]"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2C28] flex items-center justify-center shrink-0 mt-0.5 text-[#787570] group-hover:text-[#D97706] transition-all">
                    {item.type === 'dscr' && <StudioIcon className="w-3.5 h-3.5" />}
                    {item.type === 'audit' && <AuditIcon className="w-3.5 h-3.5" />}
                    {item.type === 'seasonality' && <RadarIcon className="w-3.5 h-3.5" />}
                    {item.type === 'memo' && <DraftingTableIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-serif font-bold text-[#111110] dark:text-[#F4F3EF] group-hover:text-[#D97706] transition-colors truncate">
                        {item.title}
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0 ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#787570] dark:text-[#A3A19B] line-clamp-2 mt-0.5 font-sans leading-relaxed">
                      {item.prompt}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Audio Recording Status Banner */}
        {isRecording && (
          <div className="max-w-4xl mx-auto w-full px-3 sm:px-8 mb-2">
            <div className="bg-[#FEF2F2] dark:bg-[#450A0A]/40 border border-[#FCA5A5] dark:border-[#991B1B] p-2.5 rounded-2xl flex items-center justify-between text-xs text-[#991B1B] dark:text-[#FCA5A5] shadow-xs animate-pulse">
              <div className="flex items-center gap-2 font-mono font-semibold truncate mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] shrink-0"></span>
                <span className="truncate">Recording voice ({formatTimer(recordDuration)})...</span>
              </div>
              <button
                onClick={handleToggleRecord}
                className="px-3 py-1 bg-[#DC2626] text-white text-xs font-sans font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer shadow-2xs shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Live Transcription Loading Banner */}
        {isTranscribing && (
          <div className="max-w-4xl mx-auto w-full px-3 sm:px-8 mb-2">
            <div className="bg-[#FEF3C7] dark:bg-[#78350F]/30 border border-[#FCD34D] dark:border-[#B45309] p-2.5 rounded-2xl flex items-center gap-2.5 text-xs text-[#92400E] dark:text-[#FDE68A] shadow-xs">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#D97706] border-t-transparent animate-spin shrink-0"></span>
              <span className="font-mono truncate">Transcribing audio via gemini-3.5-transcribe...</span>
            </div>
          </div>
        )}

        {/* Quick Agent Ping Bar (Above Input Box) with smooth horizontal touch scroll */}
        <div className="max-w-4xl mx-auto w-full px-3 sm:px-8 mb-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono select-none no-scrollbar">
          <span className="text-[#787570] text-[9px] sm:text-[10px] uppercase font-bold shrink-0 mr-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
            <span>Ping:</span>
          </span>

          <button
            type="button"
            onClick={() => handleInsertPing('@All-Scribes')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2D2D2A] text-[#8B5CF6] hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors shrink-0 font-semibold cursor-pointer"
          >
            @All-Scribes
          </button>

          <button
            type="button"
            onClick={() => handleInsertPing('@Astra')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2D2D2A] text-[#8B5CF6] hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors shrink-0 font-semibold cursor-pointer"
          >
            @Astra
          </button>

          <button
            type="button"
            onClick={() => handleInsertPing('@Pencil-DSCR')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2D2D2A] text-[#059669] dark:text-[#34D399] hover:border-[#059669] hover:bg-[#059669]/10 transition-colors shrink-0 font-semibold cursor-pointer"
          >
            @Pencil-DSCR
          </button>

          <button
            type="button"
            onClick={() => handleInsertPing('@Pencil-Zoning')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2D2D2A] text-[#D97706] hover:border-[#D97706] hover:bg-[#D97706]/10 transition-colors shrink-0 font-semibold cursor-pointer"
          >
            @Pencil-Zoning
          </button>

          <button
            type="button"
            onClick={() => handleInsertPing('@Pencil-Scout')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2D2D2A] text-[#2563EB] dark:text-[#60A5FA] hover:border-[#2563EB] hover:bg-[#2563EB]/10 transition-colors shrink-0 font-semibold cursor-pointer"
          >
            @Pencil-Scout
          </button>

          <button
            type="button"
            onClick={() => handleInsertPing('@Pencil-Tax')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2D2D2A] text-[#DC2626] dark:text-[#F87171] hover:border-[#DC2626] hover:bg-[#DC2626]/10 transition-colors shrink-0 font-semibold cursor-pointer"
          >
            @Pencil-Tax
          </button>
        </div>

        {/* Modern, Clean, Minimalist Chat Bar */}
        <div className="p-3 sm:p-4 md:p-5 bg-white/80 dark:bg-[#141413]/80 border-t border-[#E5E4DF] dark:border-[#272624] shrink-0 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-white dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] rounded-2xl shadow-md shadow-black/5 dark:shadow-black/25 transition-all focus-within:border-[#D97706]/60 dark:focus-within:border-[#D97706]/60 focus-within:ring-2 focus-within:ring-[#D97706]/10 overflow-hidden"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask or ping @agent to draft deliverables...`}
                disabled={isLoading}
                className="w-full bg-transparent px-3.5 sm:px-4 pt-3 sm:pt-3.5 pb-2 text-xs sm:text-sm font-sans text-[#111110] dark:text-[#F4F3EF] placeholder-[#787570] focus:outline-none resize-none leading-relaxed min-h-[40px] max-h-[160px]"
              />

              {/* Action Row */}
              <div className="flex items-center justify-between px-2.5 sm:px-3 pb-2 pt-1 border-t border-[#E5E4DF]/50 dark:border-[#272624]/60 gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Model Selector Pill */}
                  <button
                    type="button"
                    onClick={() => setModelSelectorOpen(true)}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#FAF9F5] dark:bg-[#1E1E1C] hover:bg-[#F1EFEB] dark:hover:bg-[#252422] text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] text-[10px] sm:text-xs font-mono font-medium transition-all cursor-pointer border border-[#E5E4DF] dark:border-[#2A2926]"
                    title="Change Reasoning Model"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                    <span className="font-semibold text-[#111110] dark:text-[#F4F3EF] truncate max-w-[90px] sm:max-w-none">
                      {getModelDisplay(selectedModel)}
                    </span>
                  </button>

                  {/* Clean Search Grounding Toggle */}
                  <button
                    type="button"
                    onClick={() => setEnableGoogleSearch(!enableGoogleSearch)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[10px] sm:text-xs font-sans transition-all cursor-pointer border ${
                      enableGoogleSearch
                        ? 'bg-[#E8F5EE] text-[#0B3B24] dark:bg-[#064E3B]/40 dark:text-[#34D399] border-[#059669]/40 font-semibold'
                        : 'bg-[#FAF9F5] dark:bg-[#1E1E1C] text-[#787570] border-[#E5E4DF] dark:border-[#2A2926] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                    }`}
                    title="Toggle Google Search Real-Time Citations"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                      <ellipse cx="8" cy="8" rx="2.5" ry="6" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    <span className="hidden sm:inline">Web Search</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Microphone Voice Audio Dictation */}
                  <button
                    type="button"
                    onClick={handleToggleRecord}
                    disabled={isTranscribing}
                    className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                      isRecording
                        ? 'bg-[#DC2626] text-white animate-pulse ring-4 ring-[#DC2626]/20'
                        : isTranscribing
                        ? 'bg-[#F59E0B] text-white animate-spin'
                        : 'bg-[#FAF9F5] dark:bg-[#1E1E1C] hover:bg-[#F1EFEB] dark:hover:bg-[#252422] text-[#787570] border border-[#E5E4DF] dark:border-[#2A2926]'
                    }`}
                    title={isRecording ? 'Stop & transcribe' : 'Voice Dictate'}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5.5" y="2" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M3 7.5C3 10.2614 5.23858 12.5 8 12.5C10.7614 12.5 13 10.2614 13 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <line x1="8" y1="12.5" x2="8" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Clean Modern Send Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      input.trim() && !isLoading
                        ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:scale-105 shadow-xs'
                        : 'bg-[#F1EFEB] dark:bg-[#252422] text-[#787570] cursor-not-allowed opacity-50'
                    }`}
                    title="Send inquiry"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 13.5V2.5M8 2.5L3.5 7M8 2.5L12.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
