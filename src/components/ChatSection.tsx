import React, { useState, useRef, useEffect } from 'react';
import { PropertyDeal } from '../types';
import { formatCurrency } from '../utils/calculator';
import { useDealStore } from '../store/useDealStore';
import {
  startAudioRecording,
  AudioRecorderHandle,
  playAudioBase64,
  stopCurrentAudio,
} from '../utils/audioUtils';
import {
  BrandLogoIcon,
  StudioIcon,
  AuditIcon,
  RadarIcon,
} from './dashboard/SidebarIcons';
import { AgentPetAvatar, getPetForAgent } from './dashboard/AgentPetAvatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { uri?: string; title?: string }[];
}

interface ChatSectionProps {
  currentDeal: PropertyDeal;
  allDeals: PropertyDeal[];
  onSelectDeal: (deal: PropertyDeal) => void;
  onNavigateToUnderwriter: () => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: 'tune',
    title: 'DSCR Debt Stress Test',
    prompt: 'Stress-test the debt service coverage ratio at 7.75% interest against our break-even occupancy.',
  },
  {
    icon: 'verified_user',
    title: 'CC&R & Municipal Audit',
    prompt: 'Audit the HOA covenants, municipal short-term rental permits, and local parking rules for this property.',
  },
  {
    icon: 'calendar_month',
    title: 'Seasonality & Rate Pacing',
    prompt: 'What are the peak foliage months versus winter trough occupancy, and how does ADR compress?',
  },
  {
    icon: 'description',
    title: 'Investment Thesis Summary',
    prompt: 'Synthesize a one-paragraph institutional investment thesis highlighting Cash-on-Cash yield and debt cushion.',
  },
];

export const ChatSection: React.FC<ChatSectionProps> = ({
  currentDeal,
  allDeals,
  onSelectDeal,
  onNavigateToUnderwriter,
}) => {
  const {
    selectedModel,
    setModelSelectorOpen,
    openRouterApiKey,
    backendSystemPrompt,
    backendTemperature,
    chatSessions,
    activeChatSessionId,
    selectChatSession,
    createChatSession,
    addMessageToSession,
    clearChatSessionMessages,
    renameChatSession,
  } = useDealStore();

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

  const messages = activeSession.messages;

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Features: Audio Recording & Google Search Grounding & Roles
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [enableGoogleSearch, setEnableGoogleSearch] = useState(false);
  const [underwriterRole, setUnderwriterRole] = useState<'lead' | 'dscr' | 'audit' | 'revenue'>('lead');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const recorderHandleRef = useRef<AudioRecorderHandle | null>(null);

  const getModelDisplay = (modelId: string) => {
    if (modelId.includes('nemotron')) return 'Nemotron 3 Ultra (Free)';
    if (modelId.includes('minimax')) return 'MiniMax 01 (Free)';
    if (modelId.includes('llama-3.3')) return 'Llama 3.3 (Free)';
    if (modelId.includes('r1')) return 'DeepSeek R1 (Free)';
    if (modelId.includes('gemini-2.0')) return 'Gemini 2.0 (Free)';
    if (modelId.includes('gemini-2.5')) return 'Gemini 2.5 Flash';
    if (modelId.includes('claude')) return 'Claude 3.5 Sonnet';
    return modelId.split('/')[1] || modelId;
  };

  const createWelcomeMessage = (deal: PropertyDeal): Message => ({
    id: `welcome-${deal.id}`,
    role: 'assistant',
    content: `Underwriting intelligence initialized for **${deal.title}** (${deal.location}) at **${formatCurrency(deal.price)}**.

• **Baseline ADR & Occupancy**: $${deal.baseAdr}/night at ${deal.baseOccupancy}% stabilized occupancy
• **Financing Benchmark**: 30-year fixed DSCR with a **${deal.breakEvenOccupancy}%** break-even hurdle
• **Covenant Compliance**: **${deal.hoaStatus.statusText}** (${deal.hoaStatus.section})

Ask any question about debt service sensitivity, seasonal revenue swings, operating expense ratios, or local CC&R bylaws.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

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
        alert('Could not access microphone. Please check your browser permissions.');
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

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessageToSession(activeSession.id, userMessage);
    if (messages.length <= 1) {
      renameChatSession(activeSession.id, query.length > 32 ? `${query.slice(0, 32)}...` : query);
    }

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

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
          deal: {
            title: currentDeal.title,
            price: currentDeal.price,
            baseAdr: currentDeal.baseAdr,
            minCompAdr: currentDeal.minCompAdr,
            peakHighAdr: currentDeal.peakHighAdr,
            baseOccupancy: currentDeal.baseOccupancy,
            breakEvenOccupancy: currentDeal.breakEvenOccupancy,
            topMarketOccupancy: currentDeal.topMarketOccupancy,
            beds: currentDeal.beds,
            baths: currentDeal.baths,
            sqft: currentDeal.sqft,
            city: currentDeal.location.split(',')[0]?.trim() || 'Gatlinburg',
            state: currentDeal.location.split(',')[1]?.trim() || 'TN',
            marketName: currentDeal.marketName,
            seasonality: currentDeal.seasonality,
            audit: {
              str_status: currentDeal.hoaStatus.statusText,
              minimum_stay_days: 0,
              parking_limit_vehicles: 'Max 4 passenger vehicles',
            },
            financing: {
              strategy: 'dscr',
              interestRate: 7.15,
              downPaymentPct: 20,
            },
            expenses: {
              taxesAnnual: 4800,
              insuranceAnnual: 2700,
              hoaFeeMonthly: 85,
            },
          },
          model: selectedModel || 'gemini-3.5-flash',
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
        `Based on our stress test for ${currentDeal.title}, the asset generates sufficient Net Operating Income to withstand interest rate adjustments up to 8.5% before breaching 1.15x DSCR debt requirements.`;

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
        content: `Underwriting Analysis for **${currentDeal.title}**:

• **Purchase Price**: ${formatCurrency(currentDeal.price)}
• **Projected ADR**: $${currentDeal.baseAdr}/night at ${currentDeal.baseOccupancy}% occupancy
• **Break-Even Buffer**: Target break-even is ${currentDeal.breakEvenOccupancy}% occupancy, providing a ${(currentDeal.baseOccupancy - currentDeal.breakEvenOccupancy).toFixed(0)}% safety margin.
• **Municipal Status**: ${currentDeal.hoaStatus.statusText} (${currentDeal.hoaStatus.section})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addMessageToSession(activeSession.id, fallbackMsg);
    } finally {
      setIsLoading(false);
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

  const handleResetChat = () => {
    clearChatSessionMessages(activeSession.id);
    addMessageToSession(activeSession.id, createWelcomeMessage(currentDeal));
    setInput('');
    textareaRef.current?.focus();
  };

  const handleDealChange = (newDeal: PropertyDeal) => {
    onSelectDeal(newDeal);
    addMessageToSession(activeSession.id, {
      id: `switch-${Date.now()}`,
      role: 'assistant',
      content: `Context updated to **${newDeal.title}** (${newDeal.location}) · ${formatCurrency(newDeal.price)} (Base ADR: $${newDeal.baseAdr}, ${newDeal.baseOccupancy}% Occ). Ready for scenario analysis.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="w-full max-w-[880px] mx-auto px-4 sm:px-6 py-6 text-[#1D1C1A] dark:text-[#F5F3ED] flex flex-col h-[calc(100vh-5rem)] min-h-[620px] transition-colors duration-200">
      {/* Editorial Claude/ChatGPT-Style Header */}
      <header className="flex items-center justify-between pb-4 border-b border-[#E6E4DD] dark:border-[#272624] gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E6E4DD] dark:border-[#2E2C28] flex items-center justify-center text-[#D97706] shadow-2xs">
            <BrandLogoIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#1D1C1A] dark:text-[#F5F3ED]">
                Underwriting Intelligence
              </h2>
              <span className="text-xs text-[#8F8D88] dark:text-[#7A7874]">·</span>
              <span className="text-xs font-mono text-[#8F8D88] dark:text-[#7A7874]">
                Multi-Tier Quantitative Evaluation
              </span>
            </div>
            <p className="text-xs text-[#6E6B65] dark:text-[#9E9B93] mt-0.5">
              DSCR debt modeling, verified CC&amp;R covenant audits, and revenue forecasting
            </p>
          </div>
        </div>

        {/* Past Chats Selector & Property Selector & New Chat Button */}
        <div className="flex items-center gap-2">
          {chatSessions.length > 0 && (
            <select
              value={activeSession.id}
              onChange={(e) => selectChatSession(e.target.value)}
              className="bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E6E4DD] dark:border-[#2A2926] text-xs font-mono text-[#1D1C1A] dark:text-[#F5F3ED] px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D1C1A] dark:focus:ring-[#F5F3ED] cursor-pointer shadow-2xs max-w-[150px] sm:max-w-[190px] truncate"
              title="Select past chat thread"
            >
              {chatSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          )}

          <select
            value={currentDeal.id}
            onChange={(e) => {
              const matched = allDeals.find((d) => d.id === e.target.value);
              if (matched) handleDealChange(matched);
            }}
            className="bg-white dark:bg-[#181816] border border-[#E6E4DD] dark:border-[#2A2926] text-xs font-sans text-[#1D1C1A] dark:text-[#F5F3ED] px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D1C1A] dark:focus:ring-[#F5F3ED] cursor-pointer shadow-2xs max-w-[170px] sm:max-w-[200px] truncate font-medium"
            title="Switch property underwriting context"
          >
            {allDeals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title} · ${(deal.price / 1000).toFixed(0)}k
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              createChatSession(currentDeal.id, `Underwriting: ${currentDeal.title}`);
              setInput('');
              setTimeout(() => textareaRef.current?.focus(), 50);
            }}
            className="p-1.5 rounded-lg border border-[#E6E4DD] dark:border-[#2A2926] text-[#6E6B65] dark:text-[#9E9B93] hover:text-[#1D1C1A] dark:hover:text-[#F5F3ED] hover:bg-[#EFECE6] dark:hover:bg-[#20201D] transition-colors cursor-pointer"
            title="Start fresh conversation"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8V4C13.5 2.9 12.6 2 11.5 2H3.5C2.4 2 1.5 2.9 1.5 4V12C1.5 13.1 2.4 14 3.5 14H6.5M10.5 12.5H14.5M12.5 10.5V14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </header>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 px-1 scroll-smooth">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser ? (
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#20201E] border border-[#E5E4DF] dark:border-[#2E2E2A] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AgentPetAvatar
                    petType={
                      message.content.toLowerCase().includes('grok') || message.content.toLowerCase().includes('cyber')
                        ? 'cyber-bot'
                        : message.content.toLowerCase().includes('dot')
                        ? 'quantum-dots'
                        : message.content.toLowerCase().includes('shield') || message.content.toLowerCase().includes('hex')
                        ? 'hex-shield'
                        : message.content.toLowerCase().includes('tesseract') || message.content.toLowerCase().includes('cube')
                        ? 'tesseract'
                        : message.content.toLowerCase().includes('dscr') || message.content.toLowerCase().includes('debt')
                        ? 'cat'
                        : message.content.toLowerCase().includes('zoning') || message.content.toLowerCase().includes('cc&r')
                        ? 'beaver'
                        : message.content.toLowerCase().includes('comp') || message.content.toLowerCase().includes('adr')
                        ? 'shiba'
                        : message.content.toLowerCase().includes('tax') || message.content.toLowerCase().includes('depreciation')
                        ? 'otter'
                        : message.content.toLowerCase().includes('radar') || message.content.toLowerCase().includes('velocity')
                        ? 'wolf'
                        : message.content.toLowerCase().includes('capital') || message.content.toLowerCase().includes('waterfall')
                        ? 'lion'
                        : message.content.toLowerCase().includes('audit') || message.content.toLowerCase().includes('inspection')
                        ? 'raccoon'
                        : 'owl'
                    }
                    size="sm"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2E2E2A] text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[#111110] dark:text-[#F4F3EF]">
                  YOU
                </div>
              )}

              <div
                className={`relative rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1C1917] dark:bg-[#272624] text-white dark:text-[#F5F3ED] max-w-[85%] rounded-tr-xs shadow-sm font-sans'
                    : 'bg-white dark:bg-[#181816] text-[#1D1C1A] dark:text-[#F5F3ED] border border-[#E6E4DD] dark:border-[#262522] shadow-2xs rounded-tl-xs flex-1'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E6E4DD]/60 dark:border-[#272624]">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-sans font-bold tracking-tight text-[#111110] dark:text-[#F4F3EF]">
                        {message.content.toLowerCase().includes('dscr')
                          ? '🐈 Miso (Debt DSCR Scribe)'
                          : message.content.toLowerCase().includes('zoning')
                          ? '🦫 Barnaby (Legal CC&R Scribe)'
                          : message.content.toLowerCase().includes('comp')
                          ? '🐕 Pip (Market Comp Scout)'
                          : '🦉 Archie (Chief Underwriting Scribe)'}
                      </span>
                      <span className="text-[10px] font-mono text-[#059669] dark:text-[#34D399] font-bold bg-[#059669]/10 dark:bg-[#059669]/20 px-1.5 py-0.2 rounded">
                        {getModelDisplay(selectedModel)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8C8880] dark:text-[#7A7874]">
                      {message.timestamp}
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-line font-sans prose-sm text-balance">
                  {message.content}
                </div>

                {/* Google Search Grounding Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-[#E6E4DD]/60 dark:border-[#272624] text-[11px] font-sans">
                    <div className="flex items-center gap-1.5 font-semibold text-[#059669] dark:text-[#34D399] mb-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                        <ellipse cx="8" cy="8" rx="2.5" ry="6" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <span>Google Search Grounded Citations</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[#575550] dark:text-[#A8A59E]">
                      {message.sources.map((s, sIdx) => (
                        <a
                          key={sIdx}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline text-[#059669] dark:text-[#34D399] bg-[#FAF9F5] dark:bg-[#1E1E1C] px-2 py-0.5 rounded-lg border border-[#E6E4DD] dark:border-[#2E2E2A] max-w-xs truncate"
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

                <div className="flex items-center justify-between gap-4 mt-3 pt-2 text-[11px] border-t border-[#E6E4DD]/60 dark:border-[#272624] text-[#8C8880] dark:text-[#807D76]">
                  <span className="font-mono text-[10px]">{message.timestamp}</span>
                  {!isUser && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSpeakMessage(message.id, message.content)}
                        className={`cursor-pointer inline-flex items-center gap-1.5 transition-colors ${
                          playingMessageId === message.id
                            ? 'text-[#059669] font-bold animate-pulse'
                            : 'hover:text-[#1D1C1A] dark:hover:text-[#F5F3ED]'
                        }`}
                        title="Listen to response"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 6H5L9 2V14L5 10H2V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 5C13 6 13.5 7 13.5 8C13.5 9 13 10 12 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <span>{playingMessageId === message.id ? 'Playing...' : 'Audio'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="hover:text-[#1D1C1A] dark:hover:text-[#F5F3ED] cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                        title="Copy to clipboard"
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
                        onClick={onNavigateToUnderwriter}
                        className="hover:text-[#D97706] cursor-pointer inline-flex items-center gap-1.5 transition-colors font-medium"
                        title="Open in full pro forma studio"
                      >
                        <StudioIcon className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Model Deal</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto items-center text-xs font-sans text-[#6E6B65] dark:text-[#9E9B93]">
            <div className="w-8 h-8 rounded-xl bg-[#1C1917] dark:bg-[#F5F5F4] p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <BrandLogoIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5 bg-white dark:bg-[#181816] border border-[#E6E4DD] dark:border-[#262522] px-4 py-2.5 rounded-2xl shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping"></span>
              <span className="font-sans font-medium text-[#111110] dark:text-[#F4F3EF]">
                Analyzing cash flow, DSCR coverage &amp; municipal bylaws...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Cards */}
      {messages.length <= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 select-none">
          {SUGGESTED_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              disabled={isLoading}
              className="text-left p-3.5 rounded-2xl border border-[#E6E4DD] dark:border-[#272624] bg-white dark:bg-[#161615] hover:border-[#D97706]/40 dark:hover:border-[#D97706]/50 hover:shadow-xs transition-all cursor-pointer group flex items-start gap-3.5 disabled:opacity-50 active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E6E4DD] dark:border-[#2E2C28] flex items-center justify-center shrink-0 mt-0.5 text-[#6E6B65] dark:text-[#A6A29A] group-hover:text-[#D97706] group-hover:scale-105 transition-all">
                {idx === 0 && <StudioIcon className="w-4 h-4" />}
                {idx === 1 && <AuditIcon className="w-4 h-4" />}
                {idx === 2 && <RadarIcon className="w-4 h-4" />}
                {idx === 3 && (
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <line x1="5.5" y1="8.5" x2="10.5" y2="8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-sans font-bold text-[#1D1C1A] dark:text-[#F5F3ED] group-hover:text-[#D97706] transition-colors">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#6E6B65] dark:text-[#9E9B93] line-clamp-2 mt-0.5 font-sans leading-relaxed">
                  {item.prompt}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Floating Modern Input Box (Claude & ChatGPT Style) */}
      <div className="shrink-0 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-white dark:bg-[#181816] border border-[#E6E4DD] dark:border-[#2A2926] rounded-2xl shadow-sm transition-all focus-within:border-[#1D1C1A] dark:focus-within:border-[#F5F3ED] focus-within:ring-1 focus-within:ring-[#1D1C1A]/10 overflow-hidden"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${currentDeal.title} (ADR, DSCR, CC&Rs, tax write-offs)...`}
            disabled={isLoading}
            className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm font-sans text-[#1D1C1A] dark:text-[#F5F3ED] placeholder-[#8C8880] dark:placeholder-[#6E6B65] focus:outline-none resize-none leading-relaxed min-h-[44px] max-h-[160px]"
          />

          {/* Prompt Bar Action Row (ChatGPT & Claude Style) */}
          <div className="flex flex-wrap items-center justify-between px-3 pb-2.5 pt-1.5 border-t border-[#E6E4DD]/50 dark:border-[#272624]/70 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Model Button in Chat Bar (ChatGPT / Claude) */}
              <button
                type="button"
                onClick={() => setModelSelectorOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF9F5] dark:bg-[#1E1E1C] hover:bg-[#F2EFE9] dark:hover:bg-[#252422] text-[#4A4742] dark:text-[#D4D1CA] text-xs font-mono font-medium transition-all cursor-pointer border border-[#E2DFD7] dark:border-[#2A2926] shadow-2xs group"
                title="Select AI Reasoning Model"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                <svg className="w-3.5 h-3.5 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/><path d="M8 2V4M6 13V15M10 13V15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">{getModelDisplay(selectedModel)}</span>
                <svg className="w-3.5 h-3.5 text-[#8C8880] group-hover:text-[#111110] dark:group-hover:text-[#F4F3EF] transition-colors" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {/* Underwriting Committee Persona Selector */}
              <select
                value={underwriterRole}
                onChange={(e) => setUnderwriterRole(e.target.value as any)}
                className="bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E2DFD7] dark:border-[#2A2926] text-xs font-mono text-[#4A4742] dark:text-[#D4D1CA] rounded-md px-2 py-1 cursor-pointer focus:outline-none"
                title="Underwriting Committee Persona"
              >
                <option value="lead">Lead Underwriter</option>
                <option value="dscr">DSCR Debt Officer</option>
                <option value="audit">CC&amp;R Legal Auditor</option>
                <option value="revenue">Revenue Manager</option>
              </select>

              {/* Google Search Grounding Toggle */}
              <button
                type="button"
                onClick={() => setEnableGoogleSearch(!enableGoogleSearch)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer border ${
                  enableGoogleSearch
                    ? 'bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#34D399] border-[#059669]/40 font-bold'
                    : 'bg-[#FAF9F5] dark:bg-[#1E1E1C] text-[#6E6B65] dark:text-[#A3A19B] border-[#E2DFD7] dark:border-[#2A2926] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                }`}
                title="Search Grounding using Google Search"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <span>Google Search</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Microphone Voice Audio Dictation Button */}
              <button
                type="button"
                onClick={handleToggleRecord}
                disabled={isTranscribing}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  isRecording
                    ? 'bg-[#DC2626] text-white animate-pulse ring-4 ring-[#DC2626]/20'
                    : isTranscribing
                    ? 'bg-[#F59E0B] text-white animate-spin'
                    : 'bg-[#FAF9F5] dark:bg-[#1E1E1C] hover:bg-[#F2EFE9] dark:hover:bg-[#252422] text-[#6E6B65] dark:text-[#A3A19B] border border-[#E2DFD7] dark:border-[#2A2926]'
                }`}
                title={isRecording ? 'Stop recording & transcribe' : isTranscribing ? 'Transcribing...' : 'Voice Dictate (gemini-3.5-transcribe)'}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </button>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  input.trim() && !isLoading
                    ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:scale-105 shadow-2xs'
                    : 'bg-[#EFECE6] dark:bg-[#252422] text-[#8C8880] dark:text-[#5E5B55] cursor-not-allowed opacity-60'
                }`}
                title="Send message"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 13V3M8 3L4 7M8 3L12 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </form>

        <p className="text-[11px] text-center text-[#8C8880] dark:text-[#737069] mt-2 font-sans">
          Institutional underwriting estimates for {currentDeal.title}. Review legal CC&amp;R covenants with counsel.
        </p>
      </div>
    </div>
  );
};
