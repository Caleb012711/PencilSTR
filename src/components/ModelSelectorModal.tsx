import React, { useState } from 'react';
import { useDealStore } from '../store/useDealStore';
import { OPENROUTER_MODELS, AIModelOption } from '../types/models';

export const ModelSelectorModal: React.FC = () => {
  const {
    isModelSelectorOpen,
    setModelSelectorOpen,
    selectedModel,
    setSelectedModel,
    openRouterApiKey,
    setOpenRouterApiKey,
  } = useDealStore();

  const [activeTab, setActiveTab] = useState<'free' | 'all'>('free');
  const [tempApiKey, setTempApiKey] = useState(openRouterApiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  if (!isModelSelectorOpen) return null;

  const currentModelObj = OPENROUTER_MODELS.find((m) => m.id === selectedModel) || OPENROUTER_MODELS[0];

  const handleSaveApiKey = () => {
    setOpenRouterApiKey(tempApiKey.trim());
    setTestResult({
      success: true,
      message: tempApiKey.trim() ? 'OpenRouter API Key saved successfully!' : 'Defaulting to PencilSTR built-in engine.',
    });
    setTimeout(() => {
      setTestResult(null);
    }, 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const startTime = performance.now();
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          openRouterApiKey: tempApiKey || openRouterApiKey,
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Connected to ${data.model} in ${latencyMs}ms (${data.provider})`,
          latencyMs,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection test failed. Check your API key or model availability.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error pinging model provider.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const filteredModels = OPENROUTER_MODELS.filter((m) => {
    if (activeTab === 'free') {
      return m.isFree;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-[#E5E4DF] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5E4DF] bg-[#FAF9F6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111110] text-white flex items-center justify-center font-mono font-bold text-xs">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#111110]">
                  AI Reasoning Model Selector
                </h3>
                <span className="text-[10px] font-mono bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] px-1.5 py-0.5 rounded font-bold">
                  OpenRouter Compatible
                </span>
              </div>
              <p className="text-xs text-[#666562]">
                Configure autonomous listing scraping and CC&amp;R legal extraction models.
              </p>
            </div>
          </div>

          <button
            onClick={() => setModelSelectorOpen(false)}
            className="p-1 rounded-full hover:bg-[#E5E4DF] text-[#8F8D88] hover:text-[#111110] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Model Indicator */}
          <div className="p-3.5 rounded-xl bg-[#FEF3C7]/60 border border-[#D97706]/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse"></span>
              <span className="text-[#92400E] font-bold">ACTIVE MODEL:</span>
              <span className="font-bold text-[#111110]">{currentModelObj.name}</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#E5E4DF] text-[#666562]">
                {currentModelObj.provider}
              </span>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1 bg-[#111110] text-white rounded text-[11px] font-bold hover:bg-black transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? (
      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11 11 13.5 8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C10 2.5 12 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) : (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M4 8H12M8 4V12" stroke="currentColor" strokeWidth="1.3"/></svg>
    )}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Test Result Alert */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
                testResult.success
                  ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]'
                  : 'bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]'
              }`}
            >
              <span>{testResult.message}</span>
              <button onClick={() => setTestResult(null)} className="font-bold cursor-pointer">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
          )}

          {/* OpenRouter API Key Input */}
          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E4DF] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase font-bold text-[#111110] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 7H14.5M12.5 7V9.5M14.5 7V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <span>OpenRouter API Key (Optional for Free Models)</span>
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-[#0B3B24] hover:underline flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3H3.5C3.2 3 3 3.2 3 3.5V12.5C3 12.8 3.2 13 3.5 13H12.5C12.8 13 13 12.8 13 12.5V9M9.5 3H13M13 3V6.5M13 3L6.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="flex-1 bg-white border border-[#E5E4DF] rounded-lg px-3 py-2 text-xs font-mono text-[#111110] focus:outline-none focus:border-[#111110]"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-[#111110] text-white rounded-lg text-xs font-mono font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Save Key
              </button>
            </div>
            <p className="text-[11px] font-mono text-[#8F8D88]">
              Your key is stored locally in your browser. Leave blank to use PencilSTR built-in engine.
            </p>
          </div>

          {/* Model Catalog Tabs */}
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E4DF] mb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('free')}
                  className={`pb-2 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'free'
                      ? 'border-[#111110] text-[#111110]'
                      : 'border-transparent text-[#8F8D88] hover:text-[#111110]'
                  }`}
                >
                  Free Models (Nemotron, MiniMax &amp; Gemini)
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`pb-2 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'border-[#111110] text-[#111110]'
                      : 'border-transparent text-[#8F8D88] hover:text-[#111110]'
                  }`}
                >
                  All Supported Models ({OPENROUTER_MODELS.length})
                </button>
              </div>
            </div>

            {/* Models Grid */}
            <div className="space-y-2.5">
              {filteredModels.map((m: AIModelOption) => {
                const isSelected = selectedModel === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#FEF3C7]/40 border-[#111110] ring-1 ring-[#111110]'
                        : 'bg-white border-[#E5E4DF] hover:border-[#8F8D88] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs text-[#111110]">{m.name}</span>
                        {m.badge && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              m.isFree
                                ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                                : 'bg-[#FAF9F6] text-[#666562] border border-[#E5E4DF]'
                            }`}
                          >
                            {m.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#8F8D88]">
                          Context: {m.contextWindow}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666562] line-clamp-1">{m.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-[#111110] text-white flex items-center justify-center text-xs">
                          <svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-[#8F8D88] group-hover:text-[#111110]">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E4DF] bg-[#FAF9F6] flex justify-between items-center text-xs font-mono">
          <span className="text-[#8F8D88]">
            Selected: <strong className="text-[#111110]">{currentModelObj.name}</strong>
          </span>
          <button
            onClick={() => setModelSelectorOpen(false)}
            className="px-5 py-2 bg-[#111110] text-white rounded-lg font-bold hover:bg-black transition-colors cursor-pointer"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
