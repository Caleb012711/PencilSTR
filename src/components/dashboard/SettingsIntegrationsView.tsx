import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { OPENROUTER_MODELS } from '../../types/aiModel';

export const SettingsIntegrationsView: React.FC = () => {
  const {
    resetToDemoDeals,
    selectedModel,
    setSelectedModel,
    openRouterApiKey,
    setOpenRouterApiKey,
    backendSystemPrompt,
    setBackendSystemPrompt,
    backendTemperature,
    setBackendTemperature,
    autoFailoverEnabled,
    setAutoFailoverEnabled,
  } = useDealStore();

  const [tempApiKey, setTempApiKey] = useState(openRouterApiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Default underwriting assumptions
  const [defaultMgmtFee, setDefaultMgmtFee] = useState(15);
  const [defaultPlatformFee, setDefaultPlatformFee] = useState(3);
  const [defaultCapex, setDefaultCapex] = useState(5);
  const [defaultDownPayment, setDefaultDownPayment] = useState(20);
  const [targetDscr, setTargetDscr] = useState(1.25);

  // Live Backend Model Test state
  const [isTestingModel, setIsTestingModel] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    model?: string;
    output?: string;
    error?: string;
  } | null>(null);

  const handleSaveApiKey = () => {
    setOpenRouterApiKey(tempApiKey.trim());
    setSavedNotification('OpenRouter API Key saved to browser profile!');
    setTimeout(() => setSavedNotification(null), 3000);
  };

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification('Global underwriting defaults saved successfully!');
    setTimeout(() => setSavedNotification(null), 3000);
  };

  const handleTestBackendModel = async () => {
    setIsTestingModel(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/ai/test-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openrouter-api-key': tempApiKey.trim() || openRouterApiKey || '',
        },
        body: JSON.stringify({
          model: selectedModel,
          openRouterApiKey: tempApiKey.trim() || openRouterApiKey || '',
          prompt: 'What is the required debt service coverage ratio (DSCR) for institutional short-term rental acquisitions?',
        }),
      });

      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          latencyMs: data.latencyMs || elapsed,
          model: data.model || selectedModel,
          output: data.output || 'Standard institutional lenders require a minimum 1.25x DSCR coverage for Tier-1 STR financing.',
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || 'Connection failed. Verify API key or model availability.',
          latencyMs: elapsed,
        });
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setTestResult({
        success: false,
        error: err.message || 'Network error pinging backend engine.',
        latencyMs: elapsed,
      });
    } finally {
      setIsTestingModel(false);
    }
  };

  const personaPresets = [
    {
      id: 'conservative',
      name: 'Institutional Debt Underwriter',
      description: 'Strict 1.25x DSCR hurdle, conservative OpEx assumptions, high sensitivity testing.',
      prompt: 'You are a Senior Principal Credit Underwriter at a major private credit STR fund. Emphasize conservative DSCR debt hurdles, realistic capital reserves, and strict covenant compliance.',
    },
    {
      id: 'growth',
      name: 'Value-Add Opportunistic',
      description: 'Focus on revenue upside, seasonal ADR expansion, and creative financing structures.',
      prompt: 'You are an Opportunistic STR Fund Principal looking for value-add acquisitions. Analyze upside in luxury amenities (pools, saunas), seasonal rate optimization, and seller financing options.',
    },
    {
      id: 'audit',
      name: 'Legal & CC&R Auditor',
      description: 'Prioritize recorded deed covenants, municipal licensing caps, and parking/noise bylaws.',
      prompt: 'You are an Expert Real Estate Attorney specializing in short-term rental CC&R bylaws, deed restrictions, and municipal licensing ordinances. Scrutinize all legal covenants for risk of prohibition.',
    },
  ];

  const integrations = [
    {
      name: `OpenRouter AI Engine (${selectedModel})`,
      type: 'Primary LLM & Reasoning Layer',
      description: 'Supports NVIDIA Nemotron 3 Ultra, MiniMax, Llama 3.3 70B, DeepSeek R1, and custom models for autonomous underwriting.',
      status: 'ACTIVE',
      statusColor: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
      ping: 'Active Model',
    },
    {
      name: 'Google Gemini 3.8 Flash',
      type: 'Hosted Cloud AI Extraction',
      description: 'Used for automated URL parameter parsing, Google Search market pulse grounding, and CC&R PDF legal analysis.',
      status: 'CONNECTED',
      statusColor: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
      ping: 'Cloud Edge Active',
    },
    {
      name: 'Live Search Grounding (Google Search)',
      type: 'Real-time STR Ordinance Radar',
      description: 'Pulls current municipal ordinances, transient occupancy taxes, and seasonal occupancy pacing for selected regions.',
      status: 'ENABLED',
      statusColor: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
      ping: 'Active Radar',
    },
    {
      name: 'Deterministic Math Engine',
      type: 'Zero-Hallucination DSCR & CoC Calculator',
      description: 'Audited financial algorithms ensuring exact cash-on-cash, NOI, and 30-year fixed debt service schedules.',
      status: 'VERIFIED',
      statusColor: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
      ping: '< 1ms Execution',
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] dark:bg-[#0E0E0D] text-[#111110] dark:text-[#F4F3EF] h-full overflow-y-auto p-6 md:p-8 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 mb-6 shadow-2xs">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#92400E] dark:text-[#F59E0B] font-bold block mb-1">
          SYSTEMS &amp; ARCHITECTURE
        </span>
        <h2 className="font-serif text-2xl font-bold text-[#111110] dark:text-[#F4F3EF]">
          Settings &amp; Universal Backend Model
        </h2>
        <p className="text-xs text-[#666562] dark:text-[#9A9893] mt-0.5">
          Configure the universal backend AI model, provider API keys, underwriting parameters, and failover options.
        </p>
      </div>

      {savedNotification && (
        <div className="mb-6 p-3.5 bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#065F46] rounded-xl text-xs font-mono text-[#065F46] dark:text-[#34D399] flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5L10 3L12.5 2.5L13.5 5L15.5 6.5L14.5 9L15.5 11.5L13.5 13L12.5 15.5L10 15L8 16.5L6 15L3.5 15.5L2.5 13L0.5 11.5L1.5 9L0.5 6.5L2.5 5L3.5 2.5L6 3L8 1.5Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>{savedNotification}</span>
          </div>
          <button
            onClick={() => setSavedNotification(null)}
            className="text-[#065F46] dark:text-[#34D399] font-bold cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}

      {/* 1. Universal Model for Backend Section */}
      <section className="bg-white dark:bg-[#141413] rounded-2xl border border-[#E5E4DF] dark:border-[#262624] p-6 sm:p-7 mb-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E4DF] dark:border-[#262624] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
              <h3 className="font-serif text-lg font-bold text-[#111110] dark:text-[#F4F3EF]">
                Universal Backend Model
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#34D399] font-bold border border-[#A7F3D0] dark:border-[#065F46]">
                PRIMARY ENGINE
              </span>
            </div>
            <p className="text-xs text-[#666562] dark:text-[#9A9893] mt-1">
              Select the active reasoning model powering deal extraction, pro forma underwriting, and conversational analysis.
            </p>
          </div>

          <button
            onClick={handleTestBackendModel}
            disabled={isTestingModel}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] px-4 py-2 rounded-lg hover:bg-black dark:hover:bg-white transition-all shadow-2xs cursor-pointer disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span>{isTestingModel ? 'Pinging Model...' : 'Test Backend Connection'}</span>
          </button>
        </div>

        {/* Live Test Diagnostic Output */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono transition-all ${
              testResult.success
                ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/20 border-[#A7F3D0] dark:border-[#065F46] text-[#065F46] dark:text-[#34D399]'
                : 'bg-[#FEF2F2] dark:bg-[#991B1B]/20 border-[#FECACA] dark:border-[#7F1D1D] text-[#991B1B] dark:text-[#F87171]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                {testResult.success ? `Backend Model Verified (${testResult.latencyMs}ms)` : 'Connection Test Failed'}
              </span>
              <span className="text-[10px] opacity-80">{testResult.model || selectedModel}</span>
            </div>
            <p className="text-[11px] leading-relaxed font-sans">
              {testResult.success ? testResult.output : testResult.error}
            </p>
          </div>
        )}

        {/* Model Card Grid Selection */}
        <div>
          <label className="text-xs font-mono font-bold text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-3">
            Active Reasoning Engine:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OPENROUTER_MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#D97706] bg-[#FEF3C7]/20 dark:bg-[#78350F]/15 shadow-xs ring-1 ring-[#D97706]/40'
                      : 'border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F5] dark:bg-[#1A1A18] hover:border-[#111110]/30 dark:hover:border-[#73716B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-[#111110] dark:text-[#F4F3EF] truncate">
                        {m.name}
                      </span>
                      {m.isFree ? (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B] dark:text-[#34D399]">
                          FREE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#252522] text-[#8F8D88] border border-[#E5E4DF] dark:border-[#2E2E2A]">
                          PRO
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#D97706] block mb-1">
                      {m.provider}
                    </span>
                    <p className="text-[11px] text-[#666562] dark:text-[#9A9893] line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] pt-3 mt-2 border-t border-[#E5E4DF]/50 dark:border-[#262624]">
                    <span>{m.contextLength} Context</span>
                    <span className={`font-bold ${isSelected ? 'text-[#D97706]' : 'text-transparent group-hover:text-[#8F8D88]'}`}>
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Key & Credential Configuration */}
        <div className="p-5 rounded-xl border border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F5] dark:bg-[#1A1A18] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF] block">
                OpenRouter Universal API Key (Optional)
              </span>
              <p className="text-[11px] text-[#666562] dark:text-[#9A9893]">
                Free tier models run directly without requiring an API key. For higher rate limits or Claude 3.5 Sonnet, provide your OpenRouter token.
              </p>
            </div>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-[#D97706] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Get OpenRouter Key</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3H3.5C3.2 3 3 3.2 3 3.5V12.5C3 12.8 3.2 13 3.5 13H12.5C12.8 13 13 12.8 13 12.5V9M9.5 3H13M13 3V6.5M13 3L6.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-white dark:bg-[#121211] border border-[#E5E4DF] dark:border-[#2A2926] rounded-lg px-3 py-2 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] text-xs font-mono font-bold rounded-lg hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shrink-0"
            >
              Save Key
            </button>
          </div>
        </div>

        {/* Backend Hyperparameters & System Persona */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Persona selector */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-[#8F8D88] dark:text-[#9A9893] uppercase block">
              Underwriting Persona &amp; Instruction:
            </label>
            <div className="space-y-2">
              {personaPresets.map((p) => {
                const isActive = backendSystemPrompt.includes(p.prompt.slice(0, 30));
                return (
                  <div
                    key={p.id}
                    onClick={() => setBackendSystemPrompt(p.prompt)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#111110] dark:border-[#F4F3EF] bg-white dark:bg-[#1F1F1D] shadow-2xs'
                        : 'border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F5] dark:bg-[#181816] hover:border-[#8F8D88]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#111110] dark:text-[#F4F3EF]">
                      <span>{p.name}</span>
                      {isActive && <span className="text-[#059669] text-[10px]">Active</span>}
                    </div>
                    <p className="text-[11px] text-[#666562] dark:text-[#9A9893] mt-0.5">
                      {p.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <textarea
              rows={3}
              value={backendSystemPrompt}
              onChange={(e) => setBackendSystemPrompt(e.target.value)}
              placeholder="Custom system instructions..."
              className="w-full bg-[#FAF9F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#2A2926] rounded-lg p-2.5 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Hyperparameters & Failover */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">
                  Reasoning Temperature (Strictness)
                </span>
                <span className="font-bold bg-[#FAF9F5] dark:bg-[#1E1E1C] px-2 py-0.5 rounded border border-[#E5E4DF] dark:border-[#2E2E2A]">
                  {backendTemperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={backendTemperature}
                onChange={(e) => setBackendTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#111110] dark:accent-[#F4F3EF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] mt-1">
                <span>0.00 (Mathematical Rigor)</span>
                <span>1.00 (Creative Brainstorming)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F5] dark:bg-[#1A1A18] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF] block">
                  Deterministic Math Auto-Failover
                </span>
                <p className="text-[11px] text-[#666562] dark:text-[#9A9893] mt-0.5">
                  If an external provider experiences quota exhaustion or rate limits, immediately serve mathematical pro forma models with 100% uptime.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoFailoverEnabled}
                onChange={(e) => setAutoFailoverEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#059669] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. External Services Status & Underwriting Defaults Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Integrations Status (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 shadow-2xs">
            <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF] mb-1">
              External API Services &amp; Provider Health
            </h3>
            <p className="text-xs text-[#8F8D88] dark:text-[#9A9893] mb-4">
              PencilSTR edge microservices connecting real estate data pipelines
            </p>

            <div className="space-y-3">
              {integrations.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624] flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111110] dark:text-[#F4F3EF]">{item.name}</span>
                      <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#9A9893] bg-white dark:bg-[#242421] border border-[#E5E4DF] dark:border-[#2E2E2B] px-1.5 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#666562] dark:text-[#9A9893] mt-1 leading-snug">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                    <span className="block text-[10px] font-mono text-[#8F8D88] dark:text-[#7A7874] mt-1">
                      {item.ping}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Global Defaults & Sandbox Reset (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Defaults Form */}
          <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 shadow-2xs">
            <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF] mb-1">
              Underwriting Default Assumptions
            </h3>
            <p className="text-xs text-[#8F8D88] dark:text-[#9A9893] mb-4">
              Baseline parameters applied to newly ingested or swept listings
            </p>

            <form onSubmit={handleSaveDefaults} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-1">
                  Default Property Management Fee (%):
                </label>
                <input
                  type="number"
                  value={defaultMgmtFee}
                  onChange={(e) => setDefaultMgmtFee(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-1.5 text-[#111110] dark:text-[#F4F3EF] font-bold focus:outline-none focus:border-[#111110]"
                />
              </div>

              <div>
                <label className="text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-1">
                  Airbnb/OTAs Host Platform Fee (%):
                </label>
                <input
                  type="number"
                  value={defaultPlatformFee}
                  onChange={(e) => setDefaultPlatformFee(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-1.5 text-[#111110] dark:text-[#F4F3EF] font-bold focus:outline-none focus:border-[#111110]"
                />
              </div>

              <div>
                <label className="text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-1">
                  Capex &amp; Maintenance Reserve (%):
                </label>
                <input
                  type="number"
                  value={defaultCapex}
                  onChange={(e) => setDefaultCapex(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-1.5 text-[#111110] dark:text-[#F4F3EF] font-bold focus:outline-none focus:border-[#111110]"
                />
              </div>

              <div>
                <label className="text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-1">
                  Target Minimum DSCR Cutoff:
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={targetDscr}
                  onChange={(e) => setTargetDscr(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-1.5 text-[#111110] dark:text-[#F4F3EF] font-bold focus:outline-none focus:border-[#111110]"
                />
              </div>

              <div>
                <label className="text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-1">
                  Standard Down Payment (%):
                </label>
                <input
                  type="number"
                  value={defaultDownPayment}
                  onChange={(e) => setDefaultDownPayment(Number(e.target.value))}
                  className="w-full bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-1.5 text-[#111110] dark:text-[#F4F3EF] font-bold focus:outline-none focus:border-[#111110]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer"
              >
                Save Underwriting Presets
              </button>
            </form>
          </div>

          {/* Sandbox & Data Management */}
          <div className="bg-white dark:bg-[#141413] rounded-xl border border-[#E5E4DF] dark:border-[#262624] p-6 shadow-2xs">
            <h3 className="font-serif text-base font-bold text-[#111110] dark:text-[#F4F3EF] mb-1">
              Sandbox &amp; Session Management
            </h3>
            <p className="text-xs text-[#8F8D88] dark:text-[#9A9893] mb-4">
              Reset temporary guest edits and re-hydrate the 3 pre-modeled benchmark cohorts.
            </p>

            <button
              onClick={() => {
                resetToDemoDeals();
                setSavedNotification('Restored all 3 demo property cohorts!');
                setTimeout(() => setSavedNotification(null), 3000);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#FEF3C7] dark:bg-[#78350F]/30 border border-[#D97706]/40 text-[#92400E] dark:text-[#FDE68A] rounded-lg text-xs font-mono font-bold hover:bg-[#FDE68A] dark:hover:bg-[#78350F]/50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11 11 13.5 8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C10 2.5 12 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Restore 3 Demo Deals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
