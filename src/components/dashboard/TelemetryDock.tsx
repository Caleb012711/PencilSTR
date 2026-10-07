import React, { useState, useEffect, useRef } from 'react';
import { useDealStore } from '../../store/useDealStore';
import { SunIcon, MoonIcon } from './SidebarIcons';

export const TelemetryDock: React.FC = () => {
  const {
    theme,
    toggleTheme,
    setModelSelectorOpen,
    setCurrentView,
    setIngestModalOpen,
    setLenderMemoModalOpen,
    setLaunchVideoOpen,
  } = useDealStore();

  const [soundFx, setSoundFx] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('pencilstr_sfx');
      return stored !== 'false';
    }
    return true;
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Synthesize tactile audio click on action
  const playTactileClick = () => {
    if (!soundFx || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(840, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio playback fails safely if uninitialized
    }
  };

  const handleToggleSound = () => {
    const next = !soundFx;
    setSoundFx(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pencilstr_sfx', String(next));
    }
    if (next) playTactileClick();
  };

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setCommandQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Command Palette Options
  const commands = [
    {
      id: 'studio',
      title: 'Open Studio Underwriter',
      category: 'Navigation',
      icon: '📊',
      shortcut: 'G S',
      action: () => setCurrentView('underwriter'),
    },
    {
      id: 'chat',
      title: 'Deal Analyst Intelligence Chat',
      category: 'AI Assistant',
      icon: '💬',
      shortcut: 'G C',
      action: () => setCurrentView('chat'),
    },
    {
      id: 'agents',
      title: 'Agent Team & Scribes Mesh',
      category: 'Autonomous Agents',
      icon: '🐾',
      shortcut: 'G A',
      action: () => setCurrentView('agents'),
    },
    {
      id: 'drafting',
      title: 'The Drafting Table & Artifacts Vault',
      category: 'Deliverables',
      icon: '📐',
      shortcut: 'G D',
      action: () => setCurrentView('drafting'),
    },
    {
      id: 'radar',
      title: 'Autonomous Market Radar',
      category: 'Navigation',
      icon: '📡',
      shortcut: 'G R',
      action: () => setCurrentView('radar'),
    },
    {
      id: 'crm',
      title: 'Pipeline CRM Kanban Board',
      category: 'Navigation',
      icon: '📋',
      shortcut: 'G P',
      action: () => setCurrentView('crm'),
    },
    {
      id: 'audit',
      title: 'HOA & CC&R Legal Covenants Audit',
      category: 'Legal Audit',
      icon: '⚖️',
      shortcut: 'G H',
      action: () => setCurrentView('audit'),
    },
    {
      id: 'overview',
      title: 'Executive Portfolio Overview',
      category: 'Navigation',
      icon: '🏛️',
      shortcut: 'G O',
      action: () => setCurrentView('overview'),
    },
    {
      id: 'ingest',
      title: 'Ingest New STR Property Listing',
      category: 'Action',
      icon: '➕',
      shortcut: '⌘ I',
      action: () => setIngestModalOpen(true),
    },
    {
      id: 'model',
      title: 'Switch Active AI Model / OpenRouter',
      category: 'System',
      icon: '🤖',
      shortcut: '⌘ M',
      action: () => setModelSelectorOpen(true),
    },
    {
      id: 'memo',
      title: 'Export Institutional Lender Memo PDF',
      category: 'Action',
      icon: '📄',
      shortcut: '⌘ E',
      action: () => setLenderMemoModalOpen(true),
    },
    {
      id: 'theme',
      title: theme === 'dark' ? 'Switch to Alabaster Light Mode' : 'Switch to Obsidian Dark Mode',
      category: 'Appearance',
      icon: theme === 'dark' ? '☀️' : '🌙',
      shortcut: '⌘ T',
      action: () => toggleTheme(),
    },
    {
      id: 'sfx',
      title: soundFx ? 'Mute Sound FX' : 'Enable Sound FX Audio',
      category: 'Audio',
      icon: soundFx ? '🔇' : '🔊',
      shortcut: '⌘ S',
      action: () => handleToggleSound(),
    },
    {
      id: 'video',
      title: 'Watch 1-Minute Launch Video (5 Styles)',
      category: 'Media',
      icon: '🎬',
      shortcut: '⌘ V',
      action: () => setLaunchVideoOpen(true),
    },
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(commandQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(commandQuery.toLowerCase())
  );

  const handleExecute = (action: () => void) => {
    playTactileClick();
    setCommandPaletteOpen(false);
    action();
  };

  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleExecute(filteredCommands[selectedIndex].action);
      }
    }
  };

  return (
    <>
      {/* Persistent Institutional Telemetry Dock */}
      <footer
        aria-label="Institutional Telemetry Dock"
        className="w-full bg-white/95 dark:bg-[#121211]/95 backdrop-blur-md border-t border-[#E5E4DF] dark:border-[#222220] text-[#111110] dark:text-[#F4F3EF] px-3 sm:px-5 py-2 sm:py-2.5 z-30 shrink-0 select-none shadow-xs mb-16 md:mb-0 transition-colors duration-200"
      >
        <div className="max-w-full mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar text-xs font-mono">
          {/* Left Cluster: Model, Latency, Token throughput */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Active AI Model with [Switch] action */}
            <div className="flex items-center gap-1.5 text-[11px] shrink-0">
              <span className="text-[#8F8D88] dark:text-[#787570] uppercase font-bold tracking-wider text-[10px]">
                Model:
              </span>
              <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">
                Gemini 2.5 Flash
              </span>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setModelSelectorOpen(true);
                }}
                className="text-[#D97706] dark:text-[#FBBF24] hover:underline font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none rounded px-0.5"
                title="Switch AI Underwriting Model"
              >
                [Switch]
              </button>
            </div>

            <span className="text-[#E5E4DF] dark:text-[#282825] hidden sm:inline">|</span>

            {/* Latency: 182ms TTFT */}
            <div className="flex items-center gap-1.5 text-[11px] shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
              </span>
              <span className="text-[#059669] dark:text-[#34D399] font-bold">
                182ms TTFT
              </span>
            </div>

            <span className="text-[#E5E4DF] dark:text-[#282825] hidden sm:inline">|</span>

            {/* Token throughput gauge: 14.8k tokens */}
            <div className="flex items-center gap-2 text-[11px] shrink-0">
              <span className="text-[#8F8D88] dark:text-[#787570] uppercase font-bold tracking-wider text-[10px] hidden lg:inline">
                Throughput:
              </span>
              <div className="flex items-center gap-1.5 bg-[#FAF9F6] dark:bg-[#1A1A18] px-2 py-0.5 rounded-md border border-[#E5E4DF] dark:border-[#282825]">
                <div
                  className="w-10 h-1.5 bg-[#E5E4DF] dark:border-[#282825] dark:bg-[#282825] rounded-full overflow-hidden"
                  title="Token Throughput Capacity Gauge"
                >
                  <div className="w-[74%] h-full bg-[#D97706] rounded-full"></div>
                </div>
                <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">
                  14.8k tokens
                </span>
              </div>
            </div>
          </div>

          {/* Right Cluster: Agent Mesh, Firestore status, Sound FX, Theme, ⌘K trigger */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Agent Mesh Heartbeat: 4 Scribes Active */}
            <div className="flex items-center gap-1.5 text-[11px] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
              <span className="text-[#8B5CF6] dark:text-[#A78BFA] font-semibold">
                4 Scribes Active
              </span>
            </div>

            <span className="text-[#E5E4DF] dark:text-[#282825] hidden md:inline">|</span>

            {/* Firestore sync status: Connected */}
            <div className="flex items-center gap-1.5 text-[11px] shrink-0">
              <span className="text-[#8F8D88] dark:text-[#787570] uppercase font-bold tracking-wider text-[10px] hidden sm:inline">
                Firestore:
              </span>
              <span className="inline-flex items-center gap-1 text-[#059669] dark:text-[#34D399] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                Connected
              </span>
            </div>

            <span className="text-[#E5E4DF] dark:text-[#282825] hidden md:inline">|</span>

            {/* Sound FX Toggle Button */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#78716C] dark:text-[#A8A29E] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1C1C1A] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none shrink-0"
              aria-label={soundFx ? 'Disable sound effects' : 'Enable sound effects'}
              title={soundFx ? 'Sound FX: ON (Click to mute)' : 'Sound FX: OFF (Click to unmute)'}
            >
              {soundFx ? (
                <svg className="w-3.5 h-3.5 text-[#059669]" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
                  <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
                  <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A1.5 1.5 0 0 1 0 9V7a1.5 1.5 0 0 1 1.5-1.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-[#8F8D88]" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A1.5 1.5 0 0 1 0 9V7a1.5 1.5 0 0 1 1.5-1.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z" />
                </svg>
              )}
              <span className="text-[11px] font-semibold hidden lg:inline">
                SFX: {soundFx ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* 1-Minute Launch Video Reel Studio Button */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setLaunchVideoOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#B45309] dark:text-[#FBBF24] bg-[#FEF3C7]/70 dark:bg-[#D97706]/15 hover:bg-[#FEF3C7] dark:hover:bg-[#D97706]/25 border border-[#D97706]/35 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none shrink-0 shadow-2xs"
              title="Watch 1-Minute Light Mode Video Reel (5 Alternate Styles)"
            >
              <span className="text-[12px]">🎬</span>
              <span className="text-[11px] font-semibold hidden sm:inline">1-Min Video</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                toggleTheme();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#78716C] dark:text-[#A8A29E] hover:text-[#111110] dark:hover:text-[#F4F3EF] hover:bg-[#FAF9F5] dark:hover:bg-[#1C1C1A] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none shrink-0"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-3.5 h-3.5 text-[#D97706]" />
              ) : (
                <MoonIcon className="w-3.5 h-3.5 text-[#D97706]" />
              )}
              <span className="text-[11px] font-semibold uppercase hidden xl:inline">
                {theme}
              </span>
            </button>

            {/* ⌘K Command Trigger Button */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setCommandPaletteOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] hover:bg-black dark:hover:bg-white transition-all shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:outline-none text-[11px] font-semibold shrink-0 active:scale-98"
              title="Open Command Palette (⌘K)"
              aria-label="Open Command Palette"
            >
              <kbd className="font-mono text-[10px] bg-white/20 dark:bg-black/20 px-1 py-0.2 rounded font-bold">
                ⌘K
              </kbd>
              <span>Command</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Global ⌘K Command Palette Modal */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#141413] rounded-2xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xl overflow-hidden flex flex-col text-[#111110] dark:text-[#F4F3EF] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handlePaletteKeyDown}
          >
            {/* Command Input Strip */}
            <div className="relative flex items-center border-b border-[#E5E4DF] dark:border-[#262624] px-4 py-3 bg-[#FAF9F6] dark:bg-[#1A1A18]">
              <svg
                className="w-4 h-4 text-[#8F8D88] dark:text-[#787570] mr-2 shrink-0"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
                <path d="M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command, jump to a view, or execute underwriting action..."
                value={commandQuery}
                onChange={(e) => {
                  setCommandQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-xs font-sans placeholder-[#8F8D88] dark:placeholder-[#787570] text-[#111110] dark:text-[#F4F3EF] focus:outline-none"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EBEAE6] dark:bg-[#282825] text-[#78716C] dark:text-[#A8A29E] border border-[#E5E4DF] dark:border-[#2E2E2B] shrink-0 ml-2">
                ESC
              </kbd>
            </div>

            {/* Command Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#8F8D88] dark:text-[#787570]">
                  No matching terminal commands found for "{commandQuery}"
                </div>
              ) : (
                filteredCommands.map((command, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      onClick={() => handleExecute(command.action)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#111110] text-white dark:bg-[#F4F3EF] dark:text-[#111110] font-semibold'
                          : 'hover:bg-[#FAF9F5] dark:hover:bg-[#1E1E1C] text-[#111110] dark:text-[#F4F3EF]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{command.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{command.title}</span>
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected
                                ? 'text-[#D97706] dark:text-[#D97706]'
                                : 'text-[#8F8D88] dark:text-[#787570]'
                            }`}
                          >
                            {command.category}
                          </span>
                        </div>
                      </div>

                      <kbd
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ml-2 ${
                          isSelected
                            ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                            : 'bg-[#FAF9F6] dark:bg-[#20201D] text-[#8F8D88] dark:text-[#787570] border border-[#E5E4DF] dark:border-[#282825]'
                        }`}
                      >
                        {command.shortcut}
                      </kbd>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer helper strip */}
            <div className="px-4 py-2 border-t border-[#E5E4DF] dark:border-[#262624] bg-[#FAF9F6] dark:bg-[#1A1A18] flex items-center justify-between text-[10px] font-mono text-[#8F8D88] dark:text-[#787570]">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>•</span>
                <span>↵ Select</span>
                <span>•</span>
                <span>ESC Close</span>
              </div>
              <span className="text-[#D97706] font-semibold">PencilSTR Core Terminal</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
