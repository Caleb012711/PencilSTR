import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { OPENROUTER_MODELS, AIModelOption } from '../../types/aiModel';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedModel,
    setSelectedModel,
    openRouterApiKey,
    setOpenRouterApiKey,
  } = useDealStore();

  const [activeTab, setActiveTab] = useState<'free' | 'all' | 'custom'>('free');
  const [tempApiKey, setTempApiKey] = useState(openRouterApiKey);
  const [showKey, setShowKey] = useState(false);
  const [customModelId, setCustomModelId] = useState('');
  const [keySavedBanner, setKeySavedBanner] = useState(false);

  // Testing connection state
  const [testingModel, setTestingModel] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    output?: string;
    model?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    setOpenRouterApiKey(tempApiKey.trim());
    setKeySavedBanner(true);
    setTimeout(() => setKeySavedBanner(false), 2500);
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleApplyCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customModelId.trim()) return;
    setSelectedModel(customModelId.trim());
  };

  const handleTestConnection = async (targetModel: string) => {
    setTestingModel(true);
    setTestResult(null);

    const startTime = performance.now();
    try {
      const response = await fetch('/api/ai/test-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openrouter-api-key': tempApiKey.trim() || openRouterApiKey || '',
        },
        body: JSON.stringify({
          model: targetModel,
          openRouterApiKey: tempApiKey.trim() || openRouterApiKey || '',
          prompt: 'In exactly 1 concise sentence, what is the target DSCR ratio for institutional STR financing?',
        }),
      });

      const data = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (response.ok && data.success) {
        setTestResult({
          success: true,
          latencyMs: data.latencyMs || elapsed,
          output: data.output || 'Institutional lenders typically require a minimum DSCR of 1.25x to approve debt coverage.',
          model: data.model || targetModel,
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || 'Connection failed. Please check your OpenRouter API key or network.',
        });
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setTestResult({
        success: false,
        error: err.message || 'Network error pinging OpenRouter.',
        latencyMs: elapsed,
      });
    } finally {
      setTestingModel(false);
    }
  };

  const displayedModels =
    activeTab === 'free'
      ? OPENROUTER_MODELS.filter((m) => m.isFree)
      : OPENROUTER_MODELS;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#141413] text-[#111110] dark:text-[#F4F3EF] rounded-2xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xl max-w-3xl w-full overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F6] dark:bg-[#1A1A18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111110] dark:bg-[#242421] text-[#D97706] dark:text-[#F59E0B] flex items-center justify-center font-mono font-bold text-sm">
              <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/><path d="M8 2V4M6 13V15M10 13V15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#111110] dark:text-[#F4F3EF]">
                  OpenRouter Model Engine
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46]">
                  FREE MODELS AVAILABLE
                </span>
              </div>
              <p className="text-xs text-[#666562] dark:text-[#9A9893]">
                Select NVIDIA Nemotron 3 Ultra, MiniMax, or standard LLMs for automated underwriting &amp; CC&amp;R audits.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E5E4DF] dark:hover:bg-[#282825] text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* API Key Configuration Strip */}
        <div className="p-4 sm:p-6 bg-white dark:bg-[#141413] border-b border-[#E5E4DF] dark:border-[#262624] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF] flex items-center gap-1.5">
              <span>OpenRouter API Key</span>
              <span className="text-[10px] font-normal text-[#8F8D88] dark:text-[#9A9893]">
                (Optional for free models; required for dedicated quotas)
              </span>
            </label>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-mono text-[#D97706] dark:text-[#FBBF24] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Get OpenRouter Key</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3H3.5C3.2 3 3 3.2 3 3.5V12.5C3 12.8 3.2 13 3.5 13H12.5C12.8 13 13 12.8 13 12.5V9M9.5 3H13M13 3V6.5M13 3L6.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-or-v1-..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-2 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] placeholder-[#8F8D88] dark:placeholder-[#7A7874] focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F8D88] hover:text-[#111110] dark:hover:text-[#F4F3EF] text-[16px]  cursor-pointer"
              >
                {showKey ? 'visibility_off' : 'visibility'}
              </button>
            </div>

            <button
              onClick={handleSaveApiKey}
              className="px-3.5 py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shrink-0"
            >
              Save Key
            </button>
          </div>

          {keySavedBanner && (
            <div className="p-2 bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#065F46] rounded text-[11px] font-mono text-[#065F46] dark:text-[#34D399] flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#059669]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5L10 3L12.5 2.5L13.5 5L15.5 6.5L14.5 9L15.5 11.5L13.5 13L12.5 15.5L10 15L8 16.5L6 15L3.5 15.5L2.5 13L0.5 11.5L1.5 9L0.5 6.5L2.5 5L3.5 2.5L6 3L8 1.5Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>OpenRouter API key saved to browser session state!</span>
            </div>
          )}
        </div>

        {/* Model Selection Tabs */}
        <div className="px-6 pt-3 border-b border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F6] dark:bg-[#1A1A18] flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('free')}
            className={`py-2 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'free'
                ? 'border-[#111110] dark:border-[#F4F3EF] text-[#111110] dark:text-[#F4F3EF]'
                : 'border-transparent text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            <span>100% Free Models</span>
            <span className="text-[10px] bg-[#D97706]/15 text-[#92400E] dark:text-[#FDE68A] px-1.5 py-0.2 rounded font-bold">
              Nemotron &amp; MiniMax
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-[#111110] dark:border-[#F4F3EF] text-[#111110] dark:text-[#F4F3EF]'
                : 'border-transparent text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            All Catalog
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-[#111110] dark:border-[#F4F3EF] text-[#111110] dark:text-[#F4F3EF]'
                : 'border-transparent text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            Custom Model ID
          </button>
        </div>

        {/* Scrollable Model List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'custom' ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAF9F6] dark:bg-[#1A1A18] rounded-xl border border-[#E5E4DF] dark:border-[#262624] space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF]">
                  Enter Any OpenRouter Model Identifier
                </h4>
                <p className="text-xs text-[#666562] dark:text-[#9A9893]">
                  You can specify any model available on OpenRouter, such as{' '}
                  <code className="bg-[#EBEAE6] dark:bg-[#282825] px-1 py-0.5 rounded text-[11px]">nvidia/nemotron-3-ultra</code>,{' '}
                  <code className="bg-[#EBEAE6] dark:bg-[#282825] px-1 py-0.5 rounded text-[11px]">minimax/minimax-01</code>, or{' '}
                  <code className="bg-[#EBEAE6] dark:bg-[#282825] px-1 py-0.5 rounded text-[11px]">anthropic/claude-3.5-sonnet</code>.
                </p>

                <form onSubmit={handleApplyCustomModel} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. nvidia/nemotron-3-ultra"
                    value={customModelId}
                    onChange={(e) => setCustomModelId(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-2 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shrink-0"
                  >
                    Select Model
                  </button>
                </form>
              </div>

              {selectedModel && (
                <div className="p-3 bg-white dark:bg-[#1A1A18] rounded-xl border border-[#111110] dark:border-[#E5E4DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#9A9893] block">CURRENT ACTIVE MODEL</span>
                    <span className="text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF]">{selectedModel}</span>
                  </div>
                  <button
                    onClick={() => handleTestConnection(selectedModel)}
                    disabled={testingModel}
                    className="px-3 py-1.5 bg-[#FAF9F6] dark:bg-[#252522] border border-[#E5E4DF] dark:border-[#2E2E2B] hover:bg-[#EBEAE6] dark:hover:bg-[#2E2E2B] rounded text-xs font-mono font-bold text-[#111110] dark:text-[#F4F3EF] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {testingModel ? 'Pinging...' : 'Test Model'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {displayedModels.map((model) => {
                const isSelected = selectedModel === model.id;
                const isNemotron = model.id.includes('nemotron');
                const isMiniMax = model.id.includes('minimax');

                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'border-[#111110] dark:border-[#F4F3EF] bg-[#FAF9F6] dark:bg-[#20201D] shadow-sm ring-1 ring-[#111110] dark:ring-[#F4F3EF]'
                        : 'border-[#E5E4DF] dark:border-[#262624] bg-white dark:bg-[#1A1A18] hover:border-[#8F8D88] dark:hover:border-[#666562]'
                    }`}
                  >
                    {/* Top Row: Provider & Tags */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-[#111110] dark:text-[#F4F3EF]">{model.name}</span>
                        {model.isFree && (
                          <span className="bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#065F46] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                            FREE ($0)
                          </span>
                        )}
                        {(isNemotron || isMiniMax) && (
                          <span className="bg-[#FEF3C7] dark:bg-[#78350F]/40 text-[#92400E] dark:text-[#FDE68A] border border-[#FDE68A] dark:border-[#92400E] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                            {isNemotron ? 'NEMOTRON ULTRA' : 'MINIMAX 1M'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#065F46] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B]/40 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectModel(model.id);
                            }}
                            className="text-[11px] font-mono text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] border border-[#E5E4DF] dark:border-[#2E2E2B] px-2 py-0.5 rounded bg-white dark:bg-[#252522] hover:bg-[#FAF9F6]"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#666562] dark:text-[#9A9893] mb-3 leading-relaxed">
                      {model.description}
                    </p>

                    {/* Bottom Metadata & Test Button */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8F8D88] dark:text-[#9A9893] pt-2 border-t border-[#E5E4DF]/70 dark:border-[#262624]">
                      <div className="flex items-center gap-3">
                        <span>Context: <strong className="text-[#111110] dark:text-[#F4F3EF]">{model.contextLength}</strong></span>
                        <span>•</span>
                        <span>Best for: <strong className="text-[#111110] dark:text-[#F4F3EF]">{model.recommendedFor}</strong></span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestConnection(model.id);
                        }}
                        disabled={testingModel}
                        className="text-[11px] font-mono text-[#111110] dark:text-[#F4F3EF] hover:text-[#D97706] dark:hover:text-[#FBBF24] underline cursor-pointer disabled:opacity-50"
                      >
                        {testingModel ? 'Testing...' : 'Test Connection →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Test Result Display Box */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                testResult.success
                  ? 'bg-[#ECFDF5]/80 dark:bg-[#064E3B]/30 border-[#A7F3D0] dark:border-[#065F46] text-[#065F46] dark:text-[#34D399]'
                  : 'bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 border-[#FECACA] dark:border-[#991B1B] text-[#991B1B] dark:text-[#FCA5A5]'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  <span>{testResult.success ? 'Model Response Verified' : 'Test Unsuccessful'}</span>
                </span>
                {testResult.latencyMs && (
                  <span className="text-[11px] bg-white/60 dark:bg-[#1A1A18] px-2 py-0.5 rounded">
                    {testResult.latencyMs}ms latency
                  </span>
                )}
              </div>

              {testResult.output && (
                <p className="text-[11px] text-[#111110] dark:text-[#F4F3EF] bg-white dark:bg-[#1F1F1D] p-2.5 rounded border border-[#E5E4DF] dark:border-[#262624] leading-relaxed">
                  "{testResult.output}"
                </p>
              )}

              {testResult.error && (
                <p className="text-[11px]">{testResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F6] dark:bg-[#1A1A18] flex items-center justify-between">
          <div className="text-xs font-mono text-[#666562] dark:text-[#9A9893] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
            <span>Active: <strong className="text-[#111110] dark:text-[#F4F3EF]">{selectedModel}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer"
          >
            Confirm &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
};
