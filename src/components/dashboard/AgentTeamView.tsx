import React, { useState, useRef, useEffect } from 'react';
import { useDealStore, sanitizeDeal } from '../../store/useDealStore';
import { AgentPencil, AgentMeshMessage } from '../../types/agent';
import { formatCurrency } from '../../utils/calculator';
import { DEMO_DEALS } from '../../mock/demoDeals';
import { MemoMarkdownRenderer } from './MemoMarkdownRenderer';
import {
  startAudioRecording,
  AudioRecorderHandle,
} from '../../utils/audioUtils';
import {
  AgentPetAvatar,
  getPetName,
  getPetForAgent,
  PetMood,
  PetType,
  ANIMAL_PET_TYPES,
  SHAPE_PET_TYPES,
  ALL_PET_TYPES,
} from './AgentPetAvatar';

// Default custom rules store per agent
const DEFAULT_AGENT_RULES: Record<string, string[]> = {
  'agent-astra': [
    'Enforce 1.25x minimum DSCR debt hurdle',
    'Target conservative ADR pacing curves',
    'Synthesize team audit deliverables',
    'Require 6+ comps within 3-mile radius',
  ],
  'agent-scout': [
    'Filter verified active STR listings',
    'Flag low-season dips exceeding 35%',
    'Benchmark hot tub & amenity premiums',
    'Track competitor occupancy velocity',
  ],
  'agent-cipher': [
    'Model 100% bonus depreciation shield',
    'Stress test +150 bps rate shock',
    'Calculate break-even occupancy floor',
    'Maintain 15% operating reserves',
  ],
  'agent-lex': [
    'Check municipal STR permit limits',
    'Inspect HOA 30-day lease rules',
    'Verify permit transferability on title',
    'Audit county bed-tax compliance',
  ],
};

export const AgentTeamView: React.FC = () => {
  const {
    deals,
    selectedDealId,
    setSelectedDealId,
    agents,
    activeAgentId,
    setActiveAgentId,
    meshMessages,
    addMeshMessage,
    clearMeshMessages,
    spawnAgent,
    deleteAgent,
    updateAgentStatus,
    updateAgent,
    artifacts,
    activeArtifactId,
    setActiveArtifactId,
    createArtifact,
    setCurrentView,
  } = useDealStore();

  const rawDeal = deals.find((d) => d.id === selectedDealId) || deals[0] || DEMO_DEALS[0];
  const currentDeal = sanitizeDeal(rawDeal);

  // Tab mode: 'mesh' (collective team collaboration) or 'direct' (1:1 with specific Scribe)
  const [activeTab, setActiveTab] = useState<'mesh' | 'direct'>('mesh');
  const [selectedDirectAgentId, setSelectedDirectAgentId] = useState<string>('agent-astra');

  // Mobile view pane: 'feed' (agent chat) | 'roster' (window 1) | 'config' (window 3)
  const [mobilePane, setMobilePane] = useState<'feed' | 'roster' | 'config'>('feed');

  // 3-Window Resizable Widths & Full Minimization (Desktop)
  const [leftWidth, setLeftWidth] = useState<number>(310);
  const [rightWidth, setRightWidth] = useState<number>(340);
  const [isLeftMinimized, setIsLeftMinimized] = useState<boolean>(false);
  const [isMiddleMinimized, setIsMiddleMinimized] = useState<boolean>(false);
  const [isRightMinimized, setIsRightMinimized] = useState<boolean>(false);
  const [isResizingLeft, setIsResizingLeft] = useState<boolean>(false);
  const [isResizingRight, setIsResizingRight] = useState<boolean>(false);
  const [simulateWorking, setSimulateWorking] = useState<boolean>(false);

  // Agent Config State
  const [agentRules, setAgentRules] = useState<Record<string, string[]>>(DEFAULT_AGENT_RULES);
  const [newRuleInput, setNewRuleInput] = useState<string>('');
  const [agentMood, setAgentMood] = useState<PetMood>('focused');
  const [autonomyTier, setAutonomyTier] = useState<'full' | 'supervised' | 'advisory'>('full');
  const [editablePrompt, setEditablePrompt] = useState<string>('');
  const [savedPromptNotice, setSavedPromptNotice] = useState<boolean>(false);
  const [mascotTab, setMascotTab] = useState<'animals' | 'shapes'>('animals');
  const [spawnPetType, setSpawnPetType] = useState<PetType>('owl');
  const [agentTools, setAgentTools] = useState<Record<string, boolean>>({
    rentcast: true,
    underwritingEngine: true,
    hoaScanner: true,
    draftingTable: true,
    webRadar: true,
  });

  // Input & message state
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpawnModalOpen, setIsSpawnModalOpen] = useState(false);

  // New Spawn Scribe Form State
  const [spawnName, setSpawnName] = useState('');
  const [spawnCallsign, setSpawnCallsign] = useState('');
  const [spawnRole, setSpawnRole] = useState('');
  const [spawnDescription, setSpawnDescription] = useState('');
  const [spawnColor, setSpawnColor] = useState('#8B5CF6');
  const [spawnPrompt, setSpawnPrompt] = useState('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorderHandleRef = useRef<AudioRecorderHandle | null>(null);
  const timerRef = useRef<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Local pet overrides for instantaneous UI reactivity on customization
  const [agentPetOverrides, setAgentPetOverrides] = useState<Record<string, PetType>>({});

  const activeDirectAgent = agents.find((a) => a.id === selectedDirectAgentId) || agents[0];
  const activePetType =
    agentPetOverrides[activeDirectAgent.id] ||
    (activeDirectAgent.petType as PetType) ||
    getPetForAgent(activeDirectAgent.id);
  const petDetails = getPetName(activePetType);

  // Sync editable prompt when selected agent changes
  useEffect(() => {
    setEditablePrompt(activeDirectAgent.systemPrompt || `You are ${activeDirectAgent.name}, specialized in ${activeDirectAgent.role}.`);
  }, [activeDirectAgent.id]);

  // Resizing mouse event handlers (only active when not minimized)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft && !isLeftMinimized) {
        const newLeft = Math.max(220, Math.min(460, e.clientX));
        setLeftWidth(newLeft);
      }
      if (isResizingRight && !isRightMinimized) {
        const containerWidth = window.innerWidth;
        const newRight = Math.max(260, Math.min(520, containerWidth - e.clientX));
        setRightWidth(newRight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight, isLeftMinimized, isRightMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [meshMessages, isProcessing]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  // Audio Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

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
        console.error('Microphone error:', err);
      }
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    const currentRules = agentRules[activeDirectAgent.id] || [];
    setAgentRules({
      ...agentRules,
      [activeDirectAgent.id]: [...currentRules, newRuleInput.trim()],
    });
    setNewRuleInput('');
  };

  const handleDeleteRule = (index: number) => {
    const currentRules = agentRules[activeDirectAgent.id] || [];
    setAgentRules({
      ...agentRules,
      [activeDirectAgent.id]: currentRules.filter((_, i) => i !== index),
    });
  };

  const handleSavePrompt = () => {
    setSavedPromptNotice(true);
    setTimeout(() => setSavedPromptNotice(false), 2200);
  };

  // Autonomous Multi-Agent Scribe Mesh Execution
  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || isProcessing) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsProcessing(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Post User Directive to Mesh
    const userMsg: AgentMeshMessage = {
      id: `user-${Date.now()}`,
      senderId: 'user',
      senderName: 'You (Operator)',
      senderRole: 'Acquisitions Director',
      targetAgentId: activeTab === 'mesh' ? 'all' : selectedDirectAgentId,
      targetAgentName: activeTab === 'mesh' ? 'Pencil Scribe Mesh' : activeDirectAgent.name,
      content: text,
      timestamp: now,
      type: 'directive',
    };
    addMeshMessage(userMsg);

    // If direct chat mode with a single Scribe:
    if (activeTab === 'direct') {
      updateAgentStatus(activeDirectAgent.id, 'working', `Answering: ${text.slice(0, 30)}...`);

      setTimeout(() => {
        let reply = '';
        let createdArtifactId: string | undefined = undefined;
        let createdArtifactTitle: string | undefined = undefined;

        if (activeDirectAgent.callsign.includes('DEBT')) {
          reply = `### Debt Underwriting Report: ${currentDeal.title}\n\n• **Interest Shock**: At benchmark 7.15% fixed DSCR debt, debt service requires $2,985/month.\n• **DSCR Headroom**: Property NOI generates $4,120/month, resulting in a **1.38x DSCR**.\n• **Break-Even Cushion**: Stabilized break-even occupancy hurdle is **${currentDeal.breakEvenOccupancy}%**.\n• **Conclusion**: Clears tier-1 lender debt coverage criteria with a 15% debt-yield margin.`;

          if (/save|draft|sheet|spreadsheet|table|pro-forma/i.test(text)) {
            const sheet = createArtifact({
              title: `Debt Stress Matrix — ${currentDeal.title}`,
              type: 'spreadsheet',
              dealId: currentDeal.id,
              dealTitle: currentDeal.title,
              authorAgentId: activeDirectAgent.id,
              authorAgentName: activeDirectAgent.name,
              authorAgentColor: activeDirectAgent.avatarColor,
              description: `Autonomous debt sensitivity matrix drafted by ${activeDirectAgent.name} for: "${text}"`,
              tags: ['Spreadsheet', 'Debt', 'DSCR', 'Direct Scribe'],
              content: `Category,Item,Monthly ($),Annual ($),Frequency,Notes\nRevenue,Nightly Rental Revenue,${currentDeal.baseAdr * 15},${currentDeal.baseAdr * 180},Monthly,Stabilized base pace\nOperating Expense,Opex Reserve,1200,14400,Monthly,15% opex stack\nDebt Service,DSCR Debt Service (7.75%),3240,38880,Monthly,Stressed lending rate\nNet Cash Flow,Pre-Tax Free Cash Flow,1850,22200,Monthly,1.31x DSCR hurdle cleared`,
              spreadsheetData: {
                columns: ['Category', 'Item', 'Frequency', 'Monthly ($)', 'Annual ($)', 'Notes'],
                rows: [
                  { id: 'r1', category: 'Revenue', item: 'Nightly Rental Revenue', frequency: 'Monthly', monthly: currentDeal.baseAdr * 15, annual: currentDeal.baseAdr * 180, notes: 'Based on conservative ADR pace' },
                  { id: 'r2', category: 'Operating Expense', item: 'Operating Expense Stack', frequency: 'Monthly', monthly: 1200, annual: 14400, notes: 'Property management, insurance, taxes' },
                  { id: 'r3', category: 'Debt Service', item: 'DSCR Debt Service (7.75% Stressed)', frequency: 'Monthly', monthly: 3240, annual: 38880, notes: 'Stressed interest rate benchmark' },
                  { id: 'r4', category: 'Net Cash Flow', item: 'Free Pre-Tax Cash Flow', frequency: 'Monthly', monthly: 1850, annual: 22200, notes: '1.31x DSCR hurdle maintained' },
                ],
                summaryMetric: { label: 'Stressed Coverage', value: '1.31x DSCR (Qualified)' },
              },
            });
            createdArtifactId = sheet.id;
            createdArtifactTitle = sheet.title;
            reply += `\n\n[Deliverable Published] *Published deliverable to The Drafting Table: "${sheet.title}"*`;
          }
        } else if (activeDirectAgent.callsign.includes('MUNICIPAL')) {
          reply = `### CC&R & Municipal Audit: ${currentDeal.title}\n\n• **Zoning Designation**: Unrestricted county jurisdiction outside high-density moratorium zones.\n• **STR Permit Availability**: Grandfathered short-term rental permits are verified active and transferable upon title recording.\n• **HOA Declarations**: CC&Rs contain no minimum lease duration clause.\n• **Bylaw Risk Score**: **LOW (0.04/1.0)** — Safe to execute escrow without municipal holdback.`;

          if (/save|draft|memo|document|audit/i.test(text)) {
            const memo = createArtifact({
              title: `Municipal Compliance & Title Rider — ${currentDeal.title}`,
              type: 'audit_memo',
              dealId: currentDeal.id,
              dealTitle: currentDeal.title,
              authorAgentId: activeDirectAgent.id,
              authorAgentName: activeDirectAgent.name,
              authorAgentColor: activeDirectAgent.avatarColor,
              description: `Legal zoning audit memorandum drafted for operator inquiry: "${text}"`,
              tags: ['Audit', 'Zoning', 'Legal', 'CC&R'],
              content: `### CC&R & Municipal Audit: ${currentDeal.title}\n\n• **Jurisdiction**: County Planning Commission\n• **STR Status**: ${currentDeal.audit?.str_status || 'PERMITTED'}\n• **HOA Deed Covenant**: Clean title. No restrictive covenants found.\n• **Recommendation**: Standard closing.`,
            });
            createdArtifactId = memo.id;
            createdArtifactTitle = memo.title;
            reply += `\n\n[Deliverable Published] *Published compliance memo to The Drafting Table: "${memo.title}"*`;
          }
        } else if (activeDirectAgent.callsign.includes('RADAR') || activeDirectAgent.callsign.includes('COMP')) {
          reply = `### Market Comps & Pacing Analysis: ${currentDeal.title}\n\n• **Comp Set**: 18 active 4-bedroom short-term rentals within 2.5 miles.\n• **Observed ADR**: Base low-season $380, peak foliage $640. Weighted annual ADR averages **$${currentDeal.baseAdr}**.\n• **Occupancy Velocity**: Market 90-day forward booking pace is **+14% year-over-year**.\n• **Amenity Alpha**: Adding a private cedar barrel sauna is projected to boost ADR by +$45/night.`;
        } else if (activeDirectAgent.callsign.includes('COST-SEG')) {
          reply = `### IRC § 168(k) Cost Segregation Projection: ${currentDeal.title}\n\n• **Depreciable Basis**: Approximately $${Math.round(currentDeal.price * 0.85).toLocaleString()} (excluding land value).\n• **Accelerated 5/7/15-Yr Property**: ~$${Math.round(currentDeal.price * 0.28).toLocaleString()} qualified for 100% bonus depreciation.\n• **Tax Shield**: Generates ~**$${Math.round(currentDeal.price * 0.10).toLocaleString()}** in first-year paper passive loss deductions against high-bracket income.`;
        } else {
          reply = `### Directive Acknowledged: ${activeDirectAgent.name}\n\nI have evaluated **${currentDeal.title}** regarding "${text}".\n\n• **Status**: Active monitoring initialized.\n• **Pro-Forma Metrics**: Purchase price $${currentDeal.price.toLocaleString()}, base ADR $${currentDeal.baseAdr}, DSCR 1.35x.\n• **Next Action**: Cross-referencing institutional covenants with lead orchestrator Astra.`;
        }

        const agentReply: AgentMeshMessage = {
          id: `reply-${Date.now()}`,
          senderId: activeDirectAgent.id,
          senderName: activeDirectAgent.name,
          senderRole: activeDirectAgent.role,
          senderColor: activeDirectAgent.avatarColor,
          targetAgentId: 'user',
          targetAgentName: 'You',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'chat',
          artifactCreatedId: createdArtifactId,
          artifactCreatedTitle: createdArtifactTitle,
        };

        addMeshMessage(agentReply);
        updateAgentStatus(activeDirectAgent.id, 'idle');
        setIsProcessing(false);
      }, 700);

      return;
    }

    // 2. Mesh Collaboration Flow
    updateAgentStatus('agent-astra', 'collaborating', 'Triaging multi-agent mission...');

    // Step 1: Astra Orchestrator Dispatches
    setTimeout(() => {
      const astraDispatch: AgentMeshMessage = {
        id: `astra-dispatch-${Date.now()}`,
        senderId: 'agent-astra',
        senderName: 'Astra',
        senderRole: 'Lead Underwriting Orchestrator',
        senderColor: '#8B5CF6',
        targetAgentId: 'all',
        targetAgentName: 'Mesh Team',
        content: `Directive received: "${text}".\n\nInitiating multi-vector underwriting protocol for **${currentDeal.title}** ($${formatCurrency(currentDeal.price)}). Disagree-and-commit protocol active: Scout verify ADR revenue comps, Cipher audit DSCR cash flow, Lex confirm zoning & CC&R deed restrictions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'chat',
      };
      addMeshMessage(astraDispatch);

      // Step 2: Scout Scrapes Market Comps
      updateAgentStatus('agent-scout', 'working', 'Verifying forward booking pace...');
      setTimeout(() => {
        const scoutMsg: AgentMeshMessage = {
          id: `scout-${Date.now()}`,
          senderId: 'agent-scout',
          senderName: 'Scout',
          senderRole: 'Market Intelligence & Comps',
          senderColor: '#2563EB',
          targetAgentId: 'agent-astra',
          targetAgentName: 'Astra',
          content: `Market data verified for **${currentDeal.title}**:\n• Identified 14 active 4BR comps within 2.5 miles.\n• Median ADR is **$${currentDeal.baseAdr}** with an average 68% annual occupancy.\n• Projected Annual Gross Revenue: **$${Math.round(currentDeal.baseAdr * 365 * 0.68).toLocaleString()}**.\n• Peak foliage and holiday pacing up +12% YoY. Revenue model cleared.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'chat',
          metrics: {
            'Median ADR': `$${currentDeal.baseAdr}`,
            'Comp Set': '14 Properties',
            'Forward Pacing': '+12% YoY',
          },
        };
        addMeshMessage(scoutMsg);
        updateAgentStatus('agent-scout', 'idle');

        // Step 3: Cipher Runs Debt Coverage & Tax Matrix
        updateAgentStatus('agent-cipher', 'working', 'Running DSCR sensitivity matrix...');
        setTimeout(() => {
          const cipherMsg: AgentMeshMessage = {
            id: `cipher-${Date.now()}`,
            senderId: 'agent-cipher',
            senderName: 'Cipher',
            senderRole: 'Financial Structuring & Tax',
            senderColor: '#059669',
            targetAgentId: 'agent-astra',
            targetAgentName: 'Astra',
            content: `Debt coverage and tax analysis:\n• DSCR under 7.5% fixed debt: **1.36x** (exceeds 1.25x minimum hurdle).\n• Break-even occupancy hurdle is safe at **${currentDeal.breakEvenOccupancy}%**.\n• § 168(k) Bonus Depreciation tax shield: Estimated **$${Math.round(currentDeal.price * 0.22).toLocaleString()}** year-one passive loss offset. Capital stack approved.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'chat',
            metrics: {
              'DSCR Ratio': '1.36x',
              'Break-Even Occ': `${currentDeal.breakEvenOccupancy}%`,
              'Bonus Deprec': `$${Math.round(currentDeal.price * 0.22).toLocaleString()}`,
            },
          };
          addMeshMessage(cipherMsg);
          updateAgentStatus('agent-cipher', 'idle');

          // Step 4: Lex Audits Zoning & Deed Restrictions
          updateAgentStatus('agent-lex', 'working', 'Checking municipal registry & CC&Rs...');
          setTimeout(() => {
            const lexMsg: AgentMeshMessage = {
              id: `lex-${Date.now()}`,
              senderId: 'agent-lex',
              senderName: 'Lex',
              senderRole: 'Municipal & HOA Legal Compliance',
              senderColor: '#D97706',
              targetAgentId: 'agent-astra',
              targetAgentName: 'Astra',
              content: `Legal and zoning audit for **${currentDeal.title}**:\n• County Short-Term Rental permit is active and transferable upon sale.\n• Verified CC&Rs: No minimum lease duration covenants.\n• HOA status: Unrestricted overlay.\n• Risk rating: **LOW (0.04)**. Escrow clear to proceed.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'chat',
              metrics: {
                'Zoning Status': 'Permitted',
                'HOA Covenants': 'Unrestricted',
                'Bylaw Risk': '0.04 (Low)',
              },
            };
            addMeshMessage(lexMsg);
            updateAgentStatus('agent-lex', 'idle');

            // Step 5: Astra Synthesizes Final Memorandum & Publishes Deliverable
            setTimeout(() => {
              const createdArtifact = createArtifact({
                title: `Underwriting Synthesis — ${currentDeal.title}`,
                type: 'document',
                dealId: currentDeal.id,
                dealTitle: currentDeal.title,
                authorAgentId: 'agent-astra',
                authorAgentName: 'Astra (Lead Scribe)',
                authorAgentColor: '#8B5CF6',
                description: `Autonomous multi-agent underwriting report synthesized in response to: "${text}"`,
                tags: ['Underwriting', 'Investment Memo', 'Multi-Agent', 'Approved'],
                content: `### Executive Underwriting Memorandum: ${currentDeal.title}\n\n**Purchase Price**: $${currentDeal.price.toLocaleString()}\n**Stabilized Gross Revenue**: $${Math.round(currentDeal.baseAdr * 365 * 0.68).toLocaleString()}\n**Base ADR**: $${currentDeal.baseAdr}\n**DSCR Coverage**: 1.36x\n**Municipal Status**: Grandfathered STR Permit Transferable\n\n#### Consensus Verdict\nThe autonomous Pencil Scribe mesh has completed thorough validation. All underwriting criteria pass institutional thresholds. Recommended action: Submit offer with standard 14-day diligence contingency.`,
              });

              const finalSynthesis: AgentMeshMessage = {
                id: `synthesis-${Date.now()}`,
                senderId: 'agent-astra',
                senderName: 'Astra',
                senderRole: 'Lead Underwriting Orchestrator',
                senderColor: '#8B5CF6',
                targetAgentId: 'user',
                targetAgentName: 'Operator',
                content: `### Scribe Mesh Consensus: Deal Greenlit\n\nAll three autonomous vector audits have confirmed greenlight status for **${currentDeal.title}**.\n\n• **Market Comps (Scout)**: $${currentDeal.baseAdr} ADR validated against 14 active comps.\n• **Financials (Cipher)**: 1.36x DSCR coverage clears lender hurdles.\n• **Legal & HOA (Lex)**: Transferable STR permit verified; unrestricted CC&R covenants.\n\n[Deliverable Generated] *Published full Investment Memorandum to The Drafting Table: "${createdArtifact.title}"*`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'synthesis',
                artifactCreatedId: createdArtifact.id,
                artifactCreatedTitle: createdArtifact.title,
                metrics: {
                  Verdict: 'GREENLIGHT',
                  DSCR: '1.36x',
                  'Permit Status': 'Verified',
                },
              };
              addMeshMessage(finalSynthesis);
              updateAgentStatus('agent-astra', 'idle');
              setIsProcessing(false);
            }, 600);
          }, 500);
        }, 500);
      }, 500);
    }, 400);
  };

  const handleCreateSpawnAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spawnName.trim() || !spawnRole.trim()) return;

    const spawned = spawnAgent({
      name: spawnName.trim(),
      callsign: spawnCallsign.trim() || spawnName.toUpperCase().replace(/\s+/g, '-'),
      role: spawnRole.trim(),
      description: spawnDescription.trim() || 'Custom persistent underwriting scribe.',
      avatarColor: spawnColor,
      petType: spawnPetType,
      systemPrompt: spawnPrompt.trim() || `You are ${spawnName}, a specialized real estate underwriting scribe.`,
      memoryContext: [`Manual operator deploy for ${currentDeal.title}`],
    });

    const spawnNotice: AgentMeshMessage = {
      id: `manual-spawn-${Date.now()}`,
      senderId: 'user',
      senderName: 'Operator',
      senderRole: 'Acquisitions Director',
      targetAgentId: 'all',
      targetAgentName: 'Pencil Scribe Mesh',
      type: 'spawn',
      content: `Operator deployed new autonomous agent: **${spawned.name}** (${spawnRole}). Integrated into the active scribe mesh with pet mascot.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      spawnedAgent: spawned,
    };
    addMeshMessage(spawnNotice);

    setSpawnName('');
    setSpawnCallsign('');
    setSpawnRole('');
    setSpawnDescription('');
    setSpawnPrompt('');
    setIsSpawnModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeRules = agentRules[activeDirectAgent.id] || DEFAULT_AGENT_RULES['agent-astra'] || [];
  const isAllMinimized = isLeftMinimized && isMiddleMinimized && isRightMinimized;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-hidden transition-colors duration-200">
      {/* 1. Top Header Toolbar */}
      <header className="bg-white/80 dark:bg-[#141413]/80 backdrop-blur-md border-b border-[#E5E4DF] dark:border-[#262624] px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 border border-[#8B5CF6]/25 flex items-center justify-center text-[#8B5CF6] shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="6" r="3" fill="currentColor" fillOpacity="0.8" />
              <circle cx="5" cy="14" r="2.5" fill="#059669" />
              <circle cx="15" cy="14" r="2.5" fill="#D97706" />
              <path d="M10 9V11M5 11.5L8.5 7M15 11.5L11.5 7" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
            </svg>
          </div>
          <div className="min-w-0 flex items-center gap-2.5">
            <h2 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF] truncate">
              Agent Team
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] text-[10px] font-mono text-[#787570]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">{agents.length} online</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Pane Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile 3-Way Switcher */}
          <div className="lg:hidden flex items-center bg-[#FAF9F5] dark:bg-[#1E1E1C] p-1 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] text-xs font-mono font-semibold">
            <button
              onClick={() => setMobilePane('roster')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mobilePane === 'roster'
                  ? 'bg-white dark:bg-[#2A2926] text-[#8B5CF6] shadow-2xs'
                  : 'text-[#787570]'
              }`}
            >
              Roster
            </button>
            <button
              onClick={() => setMobilePane('feed')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mobilePane === 'feed'
                  ? 'bg-white dark:bg-[#2A2926] text-[#8B5CF6] shadow-2xs font-bold'
                  : 'text-[#787570]'
              }`}
              data-testid="tab-agent-chat"
              aria-label="Agent Chat"
            >
              Agent Chat
            </button>
            <button
              onClick={() => setMobilePane('config')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                mobilePane === 'config'
                  ? 'bg-white dark:bg-[#2A2926] text-[#8B5CF6] shadow-2xs'
                  : 'text-[#787570]'
              }`}
            >
              Config
            </button>
          </div>

          {/* Desktop Quick 3-Pane Minimization Toggles */}
          <div className="hidden lg:flex items-center bg-[#FAF9F5] dark:bg-[#1E1E1C] p-1 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] text-xs font-mono font-semibold">
            <button
              onClick={() => setIsLeftMinimized(!isLeftMinimized)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                isLeftMinimized
                  ? 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                  : 'bg-white dark:bg-[#2A2926] text-[#8B5CF6] shadow-2xs font-bold'
              }`}
              title={isLeftMinimized ? 'Expand Roster pane' : 'Minimize Roster pane'}
            >
              <span>Roster</span>
              <span className={`text-[8px] px-1 py-0.2 rounded ${isLeftMinimized ? 'bg-[#E5E4DF] dark:bg-[#262624] text-[#787570]' : 'bg-[#8B5CF6]/15 text-[#8B5CF6]'}`}>{isLeftMinimized ? 'OFF' : 'ON'}</span>
            </button>
            <button
              onClick={() => setIsMiddleMinimized(!isMiddleMinimized)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                isMiddleMinimized
                  ? 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                  : 'bg-white dark:bg-[#2A2926] text-[#8B5CF6] shadow-2xs font-bold'
              }`}
              title={isMiddleMinimized ? 'Expand Agent Chat pane' : 'Minimize Agent Chat pane'}
              aria-label={isMiddleMinimized ? 'Expand Agent Chat' : 'Minimize Agent Chat'}
            >
              <span>Agent Chat</span>
              <span className={`text-[8px] px-1 py-0.2 rounded ${isMiddleMinimized ? 'bg-[#E5E4DF] dark:bg-[#262624] text-[#787570]' : 'bg-[#8B5CF6]/15 text-[#8B5CF6]'}`}>{isMiddleMinimized ? 'OFF' : 'ON'}</span>
            </button>
            <button
              onClick={() => setIsRightMinimized(!isRightMinimized)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                isRightMinimized
                  ? 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                  : 'bg-white dark:bg-[#2A2926] text-[#8B5CF6] shadow-2xs font-bold'
              }`}
              title={isRightMinimized ? 'Expand Config pane' : 'Minimize Config pane'}
            >
              <span>Config</span>
              <span className={`text-[8px] px-1 py-0.2 rounded ${isRightMinimized ? 'bg-[#E5E4DF] dark:bg-[#262624] text-[#787570]' : 'bg-[#8B5CF6]/15 text-[#8B5CF6]'}`}>{isRightMinimized ? 'OFF' : 'ON'}</span>
            </button>
            <button
              onClick={() => {
                const next = !isAllMinimized;
                setIsLeftMinimized(next);
                setIsMiddleMinimized(next);
                setIsRightMinimized(next);
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                isAllMinimized
                  ? 'bg-[#8B5CF6] text-white shadow-2xs font-bold'
                  : 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
              }`}
              title="Toggle full screen focus mode for Agent Chat"
            >
              <span>Focus</span>
            </button>
            <button
              onClick={() => {
                setIsLeftMinimized(false);
                setIsMiddleMinimized(false);
                setIsRightMinimized(false);
              }}
              className="px-2 py-1 rounded-lg transition-all cursor-pointer text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]"
              title="Expand all 3 panes"
            >
              <span>All</span>
            </button>
          </div>

          <button
            onClick={() => setIsSpawnModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            title="Deploy a new specialized scribe"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Deploy Scribe</span>
            <span className="sm:hidden text-xs">Deploy</span>
          </button>
        </div>
      </header>

      {/* 2. Main 3-Window Resizable Layout with Full Minimization */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative">
        {/* ========================================================= */}
        {/* WINDOW 1: Scribe Roster & Mascot Station (Left Window)    */}
        {/* ========================================================= */}
        {isLeftMinimized ? (
          /* Minimized Left Rail: Displays Expand button + Vertical Rectangular Pill */
          <aside className="hidden lg:flex flex-col items-center py-3 px-1.5 w-16 bg-white dark:bg-[#141413] border-r border-[#E5E4DF] dark:border-[#262624] shrink-0 justify-between transition-all duration-200">
            <div className="flex flex-col items-center gap-2.5 w-full">
              <button
                onClick={() => setIsLeftMinimized(false)}
                className="p-1.5 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] bg-[#FAF9F5] dark:bg-[#1C1C1A] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F2EFE9] dark:hover:bg-[#252522] transition-colors cursor-pointer shadow-2xs"
                title="Expand Scribe Roster"
                aria-label="Expand Roster"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Vertical Rectangular Pill of Active Scribe Pets in Collapsed Rail */}
              <div
                className="w-full bg-[#FAF9F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#282825] rounded-2xl py-2 px-1 flex flex-col items-center gap-1.5 shadow-2xs"
                title="Autonomous Scribes Pet Pill Dock — Active Scribes Pet Status Dock"
                data-testid="autonomous-scribes-pet-pill-dock"
              >
                {agents.map((ag) => {
                  const isWorking = simulateWorking || ag.status === 'working' || ag.status === 'collaborating' || isProcessing;
                  const isSelected = selectedDirectAgentId === ag.id;
                  return (
                    <button
                      key={ag.id}
                      onClick={() => {
                        setSelectedDirectAgentId(ag.id);
                        setActiveTab('direct');
                      }}
                      className={`relative p-1 rounded-xl transition-all cursor-pointer flex flex-col items-center ${
                        isWorking
                          ? 'bg-[#F59E0B]/20 border border-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                          : isSelected
                          ? 'bg-[#8B5CF6]/15 border border-[#8B5CF6]/60'
                          : 'hover:bg-white dark:hover:bg-[#222220] border border-transparent'
                      }`}
                      title={`${ag.name}: ${isWorking ? 'WORKING NOW' : 'IDLE'} · Click to focus`}
                    >
                      <AgentPetAvatar
                        agentId={ag.id}
                        petType={(ag.petType as PetType) || getPetForAgent(ag.id)}
                        size="sm"
                        isWorking={isWorking}
                      />
                      <span
                        className={`text-[7px] font-mono font-bold mt-0.5 ${
                          isWorking ? 'text-[#D97706] dark:text-[#FBBF24] animate-pulse' : 'text-[#787570]'
                        }`}
                      >
                        {isWorking ? 'WORK' : 'IDLE'}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setSimulateWorking(!simulateWorking)}
                  className={`text-[7px] font-mono font-bold mt-0.5 px-1 py-0.5 rounded border transition-all cursor-pointer ${
                    simulateWorking ? 'bg-[#F59E0B] text-white border-[#F59E0B]' : 'border-[#8B5CF6]/30 text-[#8B5CF6]'
                  }`}
                  title="Toggle work simulation"
                >
                  {simulateWorking ? 'STOP' : 'TEST'}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 pb-1">
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#787570] [writing-mode:vertical-lr] rotate-180 font-bold">
                Roster ({agents.length})
              </span>
            </div>
          </aside>
        ) : (
          /* Full Expanded Left Window */
          <aside
            className={`lg:block ${
              mobilePane === 'roster' ? 'w-full flex flex-col' : 'hidden lg:flex lg:flex-col shrink-0'
            } bg-white dark:bg-[#141413] border-r border-[#E5E4DF] dark:border-[#262624] overflow-hidden transition-all duration-200`}
            style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${leftWidth}px` : undefined }}
          >
            {/* Header with Minimize Button */}
            <div className="p-2.5 sm:p-3 border-b border-[#E5E4DF] dark:border-[#262624] bg-white dark:bg-[#141413] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xs sm:text-sm text-[#111110] dark:text-[#F4F3EF]">
                  Scribe Roster
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] font-bold">
                  {agents.length} Online
                </span>
              </div>
              <button
                onClick={() => setIsLeftMinimized(true)}
                className="hidden lg:flex p-1 rounded-lg text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#FAF9F5] dark:hover:bg-[#20201D] transition-colors cursor-pointer"
                title="Minimize Scribe Roster"
                aria-label="Minimize Roster"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Channel / Roster Selector Tabs */}
            <div className="p-2 sm:p-2.5 border-b border-[#E5E4DF] dark:border-[#262624] grid grid-cols-2 gap-1.5 bg-[#FAF9F5] dark:bg-[#181816]">
              <button
                onClick={() => {
                  setActiveTab('mesh');
                  setMobilePane('feed');
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'mesh'
                    ? 'bg-white dark:bg-[#20201D] text-[#111110] dark:text-[#F4F3EF] shadow-xs border border-[#E5E4DF] dark:border-[#2E2E2A]'
                    : 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
                <span>Scribe Mesh</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('direct');
                  setMobilePane('feed');
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'direct'
                    ? 'bg-white dark:bg-[#20201D] text-[#111110] dark:text-[#F4F3EF] shadow-xs border border-[#E5E4DF] dark:border-[#2E2E2A]'
                    : 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span>Direct Scribe</span>
              </button>
            </div>

            {/* Persistent Agent Cards */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#787570] px-1 flex items-center justify-between">
                <span>Persistent Scribes ({agents.length})</span>
                <span className="text-[#8B5CF6] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                  Always-On
                </span>
              </div>

              {agents.map((agent) => {
                const isSelected = selectedDirectAgentId === agent.id;
                const isWorking = agent.status === 'working' || agent.status === 'collaborating';

                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedDirectAgentId(agent.id);
                      setActiveTab('direct');
                      if (mobilePane === 'roster') setMobilePane('feed');
                    }}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected && activeTab === 'direct'
                        ? 'bg-[#FAF9F5] dark:bg-[#1E1E1C] border-[#8B5CF6] shadow-xs'
                        : 'bg-white dark:bg-[#181816] border-[#E5E4DF] dark:border-[#262624] hover:border-[#8B5CF6]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AgentPetAvatar
                          agentId={agent.id}
                          petType={(agent.petType as PetType) || getPetForAgent(agent.id)}
                          size="md"
                          showBadge={false}
                          isWorking={isWorking}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold text-xs text-[#111110] dark:text-[#F4F3EF] truncate">
                              {agent.name}
                            </span>
                            {agent.isLead && (
                              <span className="text-[8px] font-mono px-1 py-0.2 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] dark:text-[#C4B5FD] font-bold">
                                LEAD
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#787570] dark:text-[#A3A19B] truncate">
                            {agent.role}
                          </div>
                        </div>
                      </div>

                      {/* Clean Status Dot */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isWorking ? 'bg-[#F59E0B] animate-ping' : 'bg-[#059669]'
                          }`}
                        />
                        <span className={`text-[9px] font-mono font-bold hidden sm:inline ${isWorking ? 'text-[#F59E0B]' : 'text-[#787570]'}`}>
                          {isWorking ? 'BUSY' : 'READY'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* RESIZE HANDLE 1 (Left to Middle) - Only visible when Left and Middle are not minimized */}
        {!isLeftMinimized && !isMiddleMinimized && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizingLeft(true);
            }}
            className={`hidden lg:flex w-1.5 hover:w-2 group cursor-col-resize items-center justify-center bg-[#E5E4DF]/60 hover:bg-[#8B5CF6] dark:bg-[#262624] dark:hover:bg-[#8B5CF6] transition-all shrink-0 z-10 ${
              isResizingLeft ? 'bg-[#8B5CF6] w-2' : ''
            }`}
            title="Drag to resize Roster window"
          >
            <div className="w-0.5 h-6 rounded-full bg-[#A3A19B] group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* ========================================================= */}
        {/* WINDOW 2: Agent Chat & Dialogue Canvas (Middle Window)    */}
        {/* ========================================================= */}
        {isMiddleMinimized ? (
          /* Minimized Middle Rail: Displays Expand button + Pet Pill Dock */
          <aside className="hidden lg:flex flex-col items-center py-3 px-1.5 w-16 bg-white dark:bg-[#141413] border-r border-[#E5E4DF] dark:border-[#262624] shrink-0 justify-between transition-all duration-200">
            <div className="flex flex-col items-center gap-2.5 w-full">
              <button
                onClick={() => setIsMiddleMinimized(false)}
                className="p-1.5 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] bg-[#FAF9F5] dark:bg-[#1C1C1A] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F2EFE9] dark:hover:bg-[#252522] transition-colors cursor-pointer shadow-2xs"
                title="Expand Agent Chat"
                aria-label="Expand Agent Chat"
                data-testid="expand-agent-chat"
              >
                <svg className="w-4 h-4 text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 11V3.5C14 2.7 13.3 2 12.5 2H3.5C2.7 2 2 2.7 2 3.5V11C2 11.8 2.7 12.5 3.5 12.5H11L14 15V11Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-[#8B5CF6] px-1.5 py-0.5 rounded-md bg-[#8B5CF6]/15">
                  {meshMessages.length} msgs
                </span>
              </div>

              {/* Vertical Rectangular Pill of Active Scribe Pets in Collapsed Rail */}
              <div
                className="w-full bg-[#FAF9F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#282825] rounded-2xl py-2 px-1 flex flex-col items-center gap-2 shadow-2xs"
                title="Autonomous Scribes Pet Pill Dock — Moving pets indicate active underwriting"
              >
                {agents.map((ag) => {
                  const isWorking = simulateWorking || ag.status === 'working' || ag.status === 'collaborating' || isProcessing;
                  const isSelected = selectedDirectAgentId === ag.id;
                  return (
                    <button
                      key={ag.id}
                      onClick={() => {
                        setSelectedDirectAgentId(ag.id);
                        setActiveTab('direct');
                        setIsMiddleMinimized(false);
                      }}
                      className={`relative p-1 rounded-xl transition-all cursor-pointer flex flex-col items-center ${
                        isWorking
                          ? 'bg-[#F59E0B]/20 border border-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                          : isSelected
                          ? 'bg-[#8B5CF6]/15 border border-[#8B5CF6]/60'
                          : 'hover:bg-white dark:hover:bg-[#222220] border border-transparent'
                      }`}
                      title={`${ag.name}: ${isWorking ? 'WORKING NOW (Calculating & Moving)' : 'IDLE'} · Click to chat`}
                    >
                      <AgentPetAvatar agentId={ag.id} size="sm" isWorking={isWorking} />
                      <span
                        className={`text-[7px] font-mono font-bold mt-0.5 ${
                          isWorking ? 'text-[#D97706] dark:text-[#FBBF24] animate-pulse' : 'text-[#787570]'
                        }`}
                      >
                        {isWorking ? 'WORK' : 'IDLE'}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setSimulateWorking(!simulateWorking)}
                  className={`text-[7px] font-mono font-bold mt-0.5 px-1 py-0.5 rounded border transition-all cursor-pointer ${
                    simulateWorking ? 'bg-[#F59E0B] text-white border-[#F59E0B]' : 'border-[#8B5CF6]/30 text-[#8B5CF6]'
                  }`}
                  title="Toggle work simulation"
                >
                  {simulateWorking ? 'STOP' : 'TEST'}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center pb-2">
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#787570] [writing-mode:vertical-lr] rotate-180 font-bold">
                Agent Chat
              </span>
            </div>
          </aside>
        ) : (
          /* Full Expanded Middle Window: Agent Chat */
          <main
            className={`flex-1 flex flex-col min-w-0 bg-[#FAF9F5] dark:bg-[#0E0E0D] overflow-hidden ${
              mobilePane === 'feed' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Top Canvas Bar Indicator with Minimized Pane Expanders */}
            <div className="bg-white/80 dark:bg-[#141413]/80 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5 border-b border-[#E5E4DF] dark:border-[#262624] flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {/* Quick expand button if left was minimized */}
                {isLeftMinimized && (
                  <button
                    onClick={() => setIsLeftMinimized(false)}
                    className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#E5E4DF] dark:border-[#282825] bg-white dark:bg-[#1E1E1C] text-[#8B5CF6] text-[10px] font-mono font-bold hover:bg-[#FAF9F5] transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Expand Scribe Roster pane"
                    aria-label="Expand Roster"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Roster</span>
                  </button>
                )}

                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse shrink-0"></span>
                <span className="font-serif font-bold text-sm text-[#111110] dark:text-[#F4F3EF]">
                  Agent Chat
                </span>
                <span className="text-[#787570] text-xs font-sans">
                  {activeTab === 'mesh' ? (
                    <>· <span className="font-medium text-[#8B5CF6]">All Agents (Team)</span></>
                  ) : (
                    <>· <span className="font-bold text-[#8B5CF6]">{activeDirectAgent.name}</span> <span className="text-[#787570] hidden sm:inline">({activeDirectAgent.role})</span></>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Quick expand button if right was minimized */}
                {isRightMinimized && (
                  <button
                    onClick={() => setIsRightMinimized(false)}
                    className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#E5E4DF] dark:border-[#282825] bg-white dark:bg-[#1E1E1C] text-[#8B5CF6] text-[10px] font-mono font-bold hover:bg-[#FAF9F5] transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Expand Scribe Config pane"
                    aria-label="Expand Config"
                  >
                    <span>Config</span>
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={() => setMobilePane('config')}
                  className="lg:hidden text-[11px] font-mono text-[#8B5CF6] px-2 py-0.5 rounded-lg border border-[#8B5CF6]/30 cursor-pointer"
                >
                  Inspect Config
                </button>
                <button
                  onClick={clearMeshMessages}
                  className="text-[11px] font-mono text-[#787570] hover:text-[#DC2626] transition-colors cursor-pointer"
                >
                  Clear Feed
                </button>
                {/* Minimize Agent Chat button */}
                <button
                  onClick={() => setIsMiddleMinimized(true)}
                  className="hidden lg:flex p-1 rounded-lg text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#FAF9F5] dark:hover:bg-[#20201D] transition-colors cursor-pointer"
                  title="Minimize Agent Chat"
                  aria-label="Minimize Agent Chat"
                  data-testid="minimize-agent-chat"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* INTERACTIVE AGENT SELECTOR STRIP: Super easy 1-click selection of who to talk to */}
            <div className="bg-[#FAF9F5] dark:bg-[#161615] px-3 sm:px-4 py-2 border-b border-[#E5E4DF] dark:border-[#262624] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#787570] shrink-0 mr-1">
                Talking to:
              </span>

              {/* Team Collaboration Mode (All Agents) */}
              <button
                onClick={() => setActiveTab('mesh')}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'mesh'
                    ? 'bg-[#8B5CF6] text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-[#1E1E1C] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F2EFE9] dark:hover:bg-[#252522] border border-[#E5E4DF] dark:border-[#282825]'
                }`}
                title="Talk with all agents collaboratively in team underwriting"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 10.5C11 12.433 8.761 14 6 14C3.239 14 1 12.433 1 10.5C1 9.3 1.8 8.2 3.1 7.5C3 7 3 6.5 3 6C3 4.3 4.3 3 6 3C7.7 3 9 4.3 9 6C9 6.5 8.9 7 8.7 7.5C10.1 8.2 11 9.3 11 10.5Z" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M12.9 6.5C13.6 7.2 14 8.1 14 9C14 10.2 13.2 11.2 12 11.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span>All Agents (Team)</span>
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded-full ${activeTab === 'mesh' ? 'bg-white/20 text-white' : 'bg-[#8B5CF6]/15 text-[#8B5CF6]'}`}>
                  {agents.length}
                </span>
              </button>

              <span className="h-4 w-px bg-[#E5E4DF] dark:bg-[#282825] shrink-0 mx-0.5" />

              {/* Individual Agents 1:1 Direct Line */}
              {agents.map((ag) => {
                const isSelected = activeTab === 'direct' && selectedDirectAgentId === ag.id;
                const isWorking = simulateWorking || ag.status === 'working' || ag.status === 'collaborating' || isProcessing;

                return (
                  <button
                    key={ag.id}
                    onClick={() => {
                      setSelectedDirectAgentId(ag.id);
                      setActiveTab('direct');
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-bold shadow-xs'
                        : 'bg-white dark:bg-[#1E1E1C] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F2EFE9] dark:hover:bg-[#252522] border border-[#E5E4DF] dark:border-[#282825]'
                    }`}
                    title={`Click to talk directly with ${ag.name} (${ag.role})`}
                  >
                    <div className="relative">
                      <AgentPetAvatar agentId={ag.id} size="sm" isWorking={isWorking} />
                      {isWorking && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
                      )}
                    </div>
                    <span>{ag.name}</span>
                    <span className={`text-[9px] font-mono hidden sm:inline ${isSelected ? 'opacity-80' : 'text-[#787570]'}`}>
                      · {ag.role.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Agent Chat Body: Messages Feed */}
            <div className="flex-1 flex min-w-0 overflow-hidden relative">

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 max-w-4xl w-full mx-auto space-y-3.5 sm:space-y-4">
              {meshMessages.map((msg) => {
                const isUser = msg.senderId === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${
                      isUser ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    {/* Sender Label */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] sm:text-[11px] font-mono text-[#787570] flex-wrap">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: msg.senderColor || '#787570' }}
                      ></span>
                      <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">
                        {msg.senderName}
                      </span>
                      {msg.senderRole && <span className="hidden sm:inline">· {msg.senderRole}</span>}
                      {msg.targetAgentName && (
                        <span className="text-[#8B5CF6] font-semibold">
                          → @{msg.targetAgentName}
                        </span>
                      )}
                      <span>· {msg.timestamp}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-3.5 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm leading-relaxed transition-all ${
                        isUser
                          ? 'bg-[#111110] dark:bg-[#272624] text-white dark:text-[#F4F3EF] rounded-tr-xs shadow-sm max-w-lg'
                          : msg.type === 'spawn'
                          ? 'bg-[#FDF2F8] dark:bg-[#831843]/20 border border-[#F472B6] dark:border-[#9D174D] text-[#831843] dark:text-[#FBCFE8] w-full'
                          : msg.type === 'synthesis'
                          ? 'bg-white dark:bg-[#181816] border-2 border-[#8B5CF6]/50 shadow-sm text-[#111110] dark:text-[#F4F3EF] w-full'
                          : 'bg-white dark:bg-[#161615] text-[#111110] dark:text-[#F4F3EF] border border-[#E5E4DF] dark:border-[#262522] shadow-2xs w-full'
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                          {msg.content}
                        </div>
                      ) : (
                        <MemoMarkdownRenderer content={msg.content} />
                      )}

                      {/* Quick Metric Chips if available */}
                      {msg.metrics && (
                        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#E5E4DF]/70 dark:border-[#272624] flex flex-wrap gap-1.5 sm:gap-2">
                          {Object.entries(msg.metrics).map(([k, v]) => (
                            <div
                              key={k}
                              className="bg-[#FAF9F5] dark:bg-[#1F1F1D] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#E5E4DF] dark:border-[#2D2D29] text-[9px] sm:text-[10px] font-mono"
                            >
                              <span className="text-[#787570] mr-1">{k}:</span>
                              <span className="font-bold text-[#059669] dark:text-[#34D399]">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive Drafting Table Deliverable Card if created */}
                      {msg.artifactCreatedId && (
                        <div className="mt-3 p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#282825] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 2H10L13 5V14H4V2Z" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M10 2V5H13" stroke="currentColor" strokeWidth="1.3" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <div className="font-sans font-bold text-xs truncate">
                                {msg.artifactCreatedTitle || 'Autonomous Deliverable'}
                              </div>
                              <div className="text-[10px] text-[#787570] font-mono">
                                Published to The Drafting Table
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (msg.artifactCreatedId) {
                                setActiveArtifactId(msg.artifactCreatedId);
                                setCurrentView('drafting');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] font-sans font-semibold shrink-0 cursor-pointer shadow-2xs"
                          >
                            Open in Drafting Table
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#8B5CF6] animate-pulse py-2">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
                  <span>Pencil Scribes actively moving and synthesizing underwriting pro forma...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input & Voice Bar */}
          <div className="bg-white dark:bg-[#141413] border-t border-[#E5E4DF] dark:border-[#262624] p-3 sm:p-4 shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              {/* Recipient status bar with 1-click switch */}
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#787570]">Addressing:</span>
                  {activeTab === 'mesh' ? (
                    <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-[#8B5CF6]">
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                      <span>All Agents (Team Collaboration)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-[#111110] dark:text-[#F4F3EF]">
                      <AgentPetAvatar agentId={activeDirectAgent.id} size="sm" isWorking={activeDirectAgent.status === 'working'} />
                      <span className="text-[#8B5CF6] font-bold">{activeDirectAgent.name}</span>
                      <span className="text-[#787570] font-normal text-[11px]">· {activeDirectAgent.role}</span>
                    </span>
                  )}
                </div>

                {activeTab === 'direct' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('mesh')}
                    className="text-[11px] font-sans font-medium text-[#8B5CF6] hover:text-[#7C3AED] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Switch to All Agents</span>
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-[#787570] hidden sm:inline">
                    Synthesizes feedback across all scribes
                  </span>
                )}
              </div>

              {/* Quick Prompt Starters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-mono text-[#787570] no-scrollbar">
                <span className="text-[10px] uppercase font-bold shrink-0 text-[#8B5CF6]">Quick Ideas:</span>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Underwrite full STR pro forma for this deal and verify if DSCR exceeds 1.25x')}
                  className="px-2.5 py-1 rounded-xl bg-[#FAF9F5] dark:bg-[#1A1A18] hover:bg-[#F2EFE9] dark:hover:bg-[#252522] border border-[#E5E4DF] dark:border-[#282825] shrink-0 cursor-pointer text-[#111110] dark:text-[#F4F3EF] transition-colors"
                >
                  Verify DSCR Coverage
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Audit municipal short-term rental permits and CC&R deed restrictions')}
                  className="px-2.5 py-1 rounded-xl bg-[#FAF9F5] dark:bg-[#1A1A18] hover:bg-[#F2EFE9] dark:hover:bg-[#252522] border border-[#E5E4DF] dark:border-[#282825] shrink-0 cursor-pointer text-[#111110] dark:text-[#F4F3EF] transition-colors"
                >
                  Audit Zoning &amp; CC&amp;Rs
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Draft full 10-year pro forma cash flow spreadsheet and save to Drafting Table')}
                  className="px-2.5 py-1 rounded-xl bg-[#FAF9F5] dark:bg-[#1A1A18] hover:bg-[#F2EFE9] dark:hover:bg-[#252522] border border-[#E5E4DF] dark:border-[#282825] shrink-0 cursor-pointer text-[#111110] dark:text-[#F4F3EF] transition-colors"
                >
                  Draft Cash Flow Sheet
                </button>
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative"
              >
                <div className="flex items-end gap-2 bg-[#FAF9F5] dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] rounded-2xl p-2 focus-within:border-[#8B5CF6] focus-within:ring-1 focus-within:ring-[#8B5CF6] transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      activeTab === 'mesh'
                        ? 'Ask all agents anything about this deal (Enter to send, Shift+Enter for new line)...'
                        : `Message ${activeDirectAgent.name} directly about ${activeDirectAgent.role}...`
                    }
                    className="flex-1 bg-transparent border-0 resize-none px-2 py-1 text-xs sm:text-sm text-[#111110] dark:text-[#F4F3EF] focus:outline-none min-h-[36px] max-h-[140px]"
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Audio Dictation Button */}
                    <button
                      type="button"
                      onClick={handleToggleRecord}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isRecording
                          ? 'bg-[#DC2626] text-white animate-pulse'
                          : isTranscribing
                          ? 'bg-[#F59E0B] text-white animate-spin'
                          : 'bg-[#FAF9F5] dark:bg-[#1E1E1C] hover:bg-[#F1EFEB] dark:hover:bg-[#252422] text-[#787570] border border-[#E5E4DF] dark:border-[#2A2926]'
                      }`}
                      title={
                        isRecording
                          ? `Recording (${formatTimer(recordSeconds)})... click to transcribe`
                          : 'Voice Dictate Objective'
                      }
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5.5" y="2" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M3 7.5C3 10.2614 5.23858 12.5 8 12.5C10.7614 12.5 13 10.2614 13 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <line x1="8" y1="12.5" x2="8" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      data-testid="agent-chat-send-btn"
                      disabled={!input.trim() || isProcessing}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        input.trim() && !isProcessing
                          ? 'bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:scale-105 shadow-xs'
                          : 'bg-[#F1EFEB] dark:bg-[#252422] text-[#787570] cursor-not-allowed opacity-60'
                      }`}
                      title="Send objective to Scribes"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 13.5V2.5M8 2.5L3.5 7M8 2.5L12.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
        )}

        {/* RESIZE HANDLE 2 (Middle to Right) - Only visible when Middle and Right are not minimized */}
        {!isMiddleMinimized && !isRightMinimized && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizingRight(true);
            }}
            className={`hidden lg:flex w-1.5 hover:w-2 group cursor-col-resize items-center justify-center bg-[#E5E4DF]/60 hover:bg-[#8B5CF6] dark:bg-[#262624] dark:hover:bg-[#8B5CF6] transition-all shrink-0 z-10 ${
              isResizingRight ? 'bg-[#8B5CF6] w-2' : ''
            }`}
            title="Drag to resize Scribe Config window"
          >
            <div className="w-0.5 h-6 rounded-full bg-[#A3A19B] group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* ========================================================= */}
        {/* WINDOW 3: Scribe Specification & Rules Config (Right Window) */}
        {/* ========================================================= */}
        {isRightMinimized ? (
          /* Minimized Right Rail: Displays Expand button + vertical title + active agent pet */
          <aside className="hidden lg:flex flex-col items-center py-3 px-1 w-11 bg-white dark:bg-[#141413] border-l border-[#E5E4DF] dark:border-[#262624] shrink-0 justify-between transition-all duration-200">
            <div className="flex flex-col items-center gap-2.5 w-full">
              <button
                onClick={() => setIsRightMinimized(false)}
                className="p-1.5 rounded-xl border border-[#E5E4DF] dark:border-[#2A2926] bg-[#FAF9F5] dark:bg-[#1C1C1A] text-[#111110] dark:text-[#F4F3EF] hover:bg-[#F2EFE9] dark:hover:bg-[#252522] transition-colors cursor-pointer shadow-2xs"
                title="Expand Scribe Config"
                aria-label="Expand Config"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div
                className="p-1 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 cursor-pointer"
                onClick={() => setIsRightMinimized(false)}
                title={`Configure ${activeDirectAgent.name}`}
              >
                <AgentPetAvatar agentId={activeDirectAgent.id} size="sm" isWorking={activeDirectAgent.status === 'working'} />
              </div>
            </div>

            <div className="flex flex-col items-center pb-2">
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#787570] [writing-mode:vertical-lr] rotate-180 font-bold">
                Config
              </span>
            </div>
          </aside>
        ) : (
          /* Full Expanded Right Window */
          <aside
            className={`lg:block ${
              mobilePane === 'config' ? 'w-full flex flex-col' : 'hidden lg:flex lg:flex-col shrink-0'
            } bg-white dark:bg-[#141413] border-l border-[#E5E4DF] dark:border-[#262624] overflow-hidden transition-all duration-200`}
            style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${rightWidth}px` : undefined }}
          >
            {/* Config Window Header with Minimize Button */}
            <div className="p-3 border-b border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F5] dark:bg-[#181816] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2V14M2 8H14M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <h3 className="font-serif font-bold text-xs sm:text-sm text-[#111110] dark:text-[#F4F3EF]">
                  Scribe Specification &amp; Rules
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] font-bold">
                  {activeDirectAgent.callsign}
                </span>
                <button
                  onClick={() => setIsRightMinimized(true)}
                  className="hidden lg:flex p-1 rounded-lg text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#E5E4DF]/60 dark:hover:bg-[#282825] transition-colors cursor-pointer"
                  title="Minimize Scribe Config"
                  aria-label="Minimize Config"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
              {/* Cute Animated Pet Mascot Showcase - Moves when working! */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 via-[#FAF9F5] to-white dark:from-[#8B5CF6]/20 dark:via-[#1A1A18] dark:to-[#141413] border border-[#8B5CF6]/30 flex items-center gap-3.5 shadow-2xs">
                <div className="relative">
                  <AgentPetAvatar
                    agentId={activeDirectAgent.id}
                    petType={activePetType}
                    size="lg"
                    mood={agentMood}
                    showBadge
                    isWorking={activeDirectAgent.status === 'working' || activeDirectAgent.status === 'collaborating' || isProcessing}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#111110] dark:text-[#F4F3EF]">
                      {petDetails.name}
                    </span>
                    <span className="text-[9px] font-mono text-[#8B5CF6] font-bold">
                      {petDetails.species}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#787570] font-sans mt-0.5 leading-tight">
                    {petDetails.quirk}
                  </p>

                  {/* Pet Mood Selector */}
                  <div className="mt-2 flex items-center gap-1">
                    {(['focused', 'calculating', 'alert', 'happy'] as PetMood[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setAgentMood(m)}
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md cursor-pointer transition-all ${
                          agentMood === m
                            ? 'bg-[#8B5CF6] text-white font-bold'
                            : 'bg-white/80 dark:bg-[#20201D] text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mascot & Shape Icon Chooser */}
              <div className="space-y-2 p-3 rounded-2xl bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#282826] shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#787570] block">
                    Choose Mascot / Shape Icon
                  </label>
                  {/* Category switcher: Animals vs Cyber Shapes */}
                  <div className="flex items-center gap-1 p-0.5 bg-[#FAF9F5] dark:bg-[#222220] rounded-lg border border-[#E5E4DF] dark:border-[#2E2E2B] text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setMascotTab('animals')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        mascotTab === 'animals'
                          ? 'bg-white dark:bg-[#2E2E2A] text-[#111110] dark:text-[#F4F3EF] font-bold shadow-2xs'
                          : 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                      }`}
                    >
                      🐾 Animals ({ANIMAL_PET_TYPES.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMascotTab('shapes')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        mascotTab === 'shapes'
                          ? 'bg-white dark:bg-[#2E2E2A] text-[#8B5CF6] dark:text-[#A78BFA] font-bold shadow-2xs'
                          : 'text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
                      }`}
                    >
                      ✨ Shapes ({SHAPE_PET_TYPES.length})
                    </button>
                  </div>
                </div>

                {/* Mascot Icon Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl bg-[#FAF9F6] dark:bg-[#141413] border border-[#EBEAE5] dark:border-[#242422]">
                  {(mascotTab === 'animals' ? ANIMAL_PET_TYPES : SHAPE_PET_TYPES).map((pType) => {
                    const info = getPetName(pType);
                    const isSelected = activePetType === pType;
                    return (
                      <button
                        key={pType}
                        type="button"
                        data-testid={`mascot-${pType}`}
                        onClick={() => {
                          setAgentPetOverrides((prev) => ({ ...prev, [activeDirectAgent.id]: pType }));
                          updateAgent(activeDirectAgent.id, { petType: pType });
                        }}
                        title={`${info.name}: ${info.species} (${info.quirk})`}
                        className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#8B5CF6]/15 dark:bg-[#8B5CF6]/25 border-[#8B5CF6] ring-1 ring-[#8B5CF6] scale-105 shadow-xs'
                            : 'bg-white dark:bg-[#1E1E1C] border-[#E5E4DF] dark:border-[#2A2A28] hover:border-[#8B5CF6]/50 hover:scale-102'
                        }`}
                      >
                        <AgentPetAvatar petType={pType} size="xs" />
                        <span className="text-[9px] font-sans font-medium text-[#111110] dark:text-[#F4F3EF] truncate w-full text-center mt-1">
                          {info.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scope & Role Controls */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#787570] block">
                  Scope &amp; Autonomy Tier
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF9F5] dark:bg-[#181816] rounded-xl border border-[#E5E4DF] dark:border-[#282825] text-[10px] font-mono font-semibold">
                  <button
                    onClick={() => setAutonomyTier('full')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      autonomyTier === 'full'
                        ? 'bg-white dark:bg-[#252522] text-[#8B5CF6] shadow-2xs'
                        : 'text-[#787570]'
                    }`}
                  >
                    Autonomous
                  </button>
                  <button
                    onClick={() => setAutonomyTier('supervised')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      autonomyTier === 'supervised'
                        ? 'bg-white dark:bg-[#252522] text-[#059669] shadow-2xs'
                        : 'text-[#787570]'
                    }`}
                  >
                    Supervised
                  </button>
                  <button
                    onClick={() => setAutonomyTier('advisory')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      autonomyTier === 'advisory'
                        ? 'bg-white dark:bg-[#252522] text-[#D97706] shadow-2xs'
                        : 'text-[#787570]'
                    }`}
                  >
                    Advisory
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[#787570]">
                    <span>Underwriting Scope:</span>
                    <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">{activeDirectAgent.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#787570]">
                    <span>AI Inference Core:</span>
                    <span className="font-mono text-[#8B5CF6]">Gemini 2.5 Flash Ultra</span>
                  </div>
                  <div className="flex items-center justify-between text-[#787570]">
                    <span>Target Deal Context:</span>
                    <span className="truncate max-w-[140px] text-[#111110] dark:text-[#F4F3EF]">{currentDeal.title}</span>
                  </div>
                </div>
              </div>

              {/* Operational Rules & Guardrails */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#787570] block">
                    Operational Rules &amp; Guardrails ({activeRules.length})
                  </label>
                  <span className="text-[9px] font-mono text-[#059669] font-bold">ENFORCED</span>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {activeRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#282825] flex items-start justify-between gap-2 text-[11px] group"
                    >
                      <div className="flex items-start gap-1.5 min-w-0">
                        <span className="text-[#8B5CF6] font-mono text-[10px] font-bold mt-0.5">#{idx + 1}</span>
                        <span className="text-[#111110] dark:text-[#F4F3EF] leading-snug">{rule}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteRule(idx)}
                        className="text-[#787570] hover:text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0"
                        title="Remove rule"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Rule Form */}
                <form onSubmit={handleAddRule} className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom rule or guardrail..."
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    className="flex-1 bg-[#FAF9F5] dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] rounded-xl px-2.5 py-1.5 text-xs text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#8B5CF6]"
                  />
                  <button
                    type="submit"
                    disabled={!newRuleInput.trim()}
                    className="px-2.5 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* System Prompt Directive Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#787570] block">
                    System Directive &amp; Memory
                  </label>
                  {savedPromptNotice && (
                    <span className="text-[10px] font-mono text-[#059669] font-bold animate-pulse">
                      Saved!
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={editablePrompt}
                  onChange={(e) => setEditablePrompt(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] rounded-xl p-2.5 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#8B5CF6] leading-relaxed"
                />
                <button
                  type="button"
                  onClick={handleSavePrompt}
                  className="w-full py-1.5 rounded-xl bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] text-xs font-semibold text-[#111110] dark:text-[#F4F3EF] hover:bg-[#FAF9F5] cursor-pointer shadow-2xs transition-colors"
                >
                  Save Prompt Directive
                </button>
              </div>

              {/* Tools & API Permissions Matrix */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#787570] block">
                  Integrated Tools &amp; APIs
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'rentcast', label: 'Rentcast Market Comps API', desc: 'Real-time STR data feed' },
                    { id: 'underwritingEngine', label: 'DSCR & Pro-Forma Engine', desc: 'Exact cash flow math' },
                    { id: 'hoaScanner', label: 'Municipal CC&R Scanner', desc: 'By-law deed audit' },
                    { id: 'draftingTable', label: 'Drafting Table Publisher', desc: 'Deliverables generator' },
                  ].map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() =>
                        setAgentTools((prev) => ({ ...prev, [tool.id]: !prev[tool.id] }))
                      }
                      className="p-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E5E4DF] dark:border-[#282825] flex items-center justify-between cursor-pointer hover:border-[#8B5CF6]/50 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-[#111110] dark:text-[#F4F3EF] text-[11px]">
                          {tool.label}
                        </div>
                        <div className="text-[10px] text-[#787570]">{tool.desc}</div>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                          agentTools[tool.id]
                            ? 'bg-[#059669]/15 text-[#059669]'
                            : 'bg-[#787570]/15 text-[#787570]'
                        }`}
                      >
                        {agentTools[tool.id] ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Triggers */}
              <div className="pt-2 border-t border-[#E5E4DF] dark:border-[#262624] space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('direct');
                    setMobilePane('feed');
                    handleSendMessage(`Request status report and operational audit from ${activeDirectAgent.name}`);
                  }}
                  className="w-full py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  Message {activeDirectAgent.name} in Agent Chat
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 4. Deploy New Scribe Modal */}
      {isSpawnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161615] border border-[#E5E4DF] dark:border-[#282825] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] dark:border-[#262624] mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#111110] dark:text-[#F4F3EF]">
                  Deploy New Pencil Scribe
                </h3>
              </div>
              <button
                onClick={() => setIsSpawnModalOpen(false)}
                className="p-1.5 rounded-lg text-[#787570] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSpawnAgent} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                  Scribe Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pencil-Insurance, Pencil-Renovation, Pencil-1031"
                  value={spawnName}
                  onChange={(e) => setSpawnName(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                    Callsign
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HAZARD-AUDITOR"
                    value={spawnCallsign}
                    onChange={(e) => setSpawnCallsign(e.target.value)}
                    className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                    Avatar Color
                  </label>
                  <select
                    value={spawnColor}
                    onChange={(e) => setSpawnColor(e.target.value)}
                    className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] cursor-pointer"
                  >
                    <option value="#8B5CF6">Purple / Orchestrator</option>
                    <option value="#059669">Emerald / Debt</option>
                    <option value="#D97706">Amber / Legal</option>
                    <option value="#2563EB">Blue / Market</option>
                    <option value="#EC4899">Pink / Capex</option>
                    <option value="#DC2626">Red / Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                  Underwriting Role &amp; Specialty
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial STR Hazard & Fire Insurance Specialist"
                  value={spawnRole}
                  onChange={(e) => setSpawnRole(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>

              {/* Pet Mascot / Cyber Shape Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#111110] dark:text-[#F4F3EF]">
                    Choose Scribe Mascot / Cyber Shape
                  </label>
                  <span className="text-[10px] font-mono text-[#8B5CF6]">
                    {getPetName(spawnPetType).name} ({getPetName(spawnPetType).species})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926]">
                  {ALL_PET_TYPES.map((p) => {
                    const isSelected = spawnPetType === p;
                    const info = getPetName(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSpawnPetType(p)}
                        title={`${info.name}: ${info.species}`}
                        className={`p-1.5 rounded-xl shrink-0 transition-all cursor-pointer flex flex-col items-center ${
                          isSelected
                            ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6] scale-110 shadow-xs'
                            : 'hover:bg-white dark:hover:bg-[#2A2A26] border border-transparent'
                        }`}
                      >
                        <AgentPetAvatar petType={p} size="xs" />
                        <span className="text-[8px] font-mono mt-0.5 max-w-[42px] truncate text-center">
                          {info.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scans wildfire zoning and quotes commercial short-term rental liability policies."
                  value={spawnDescription}
                  onChange={(e) => setSpawnDescription(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#111110] dark:text-[#F4F3EF]">
                  Custom Instructions &amp; System Prompt
                </label>
                <textarea
                  rows={2}
                  placeholder="You are an autonomous underwriter specializing in..."
                  value={spawnPrompt}
                  onChange={(e) => setSpawnPrompt(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2A2926] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E4DF] dark:border-[#262624]">
                <button
                  type="button"
                  onClick={() => setIsSpawnModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#787570] hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-xs cursor-pointer active:scale-95"
                >
                  Deploy Scribe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
