import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  FileText,
  Sliders,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { BrandLogoIcon } from '../dashboard/SidebarIcons';

export type VideoStyleId = 'institutional' | 'tech_keynote' | 'editorial' | 'quant_analyst' | 'tactile_craft';

interface StyleMeta {
  id: VideoStyleId;
  name: string;
  subtitle: string;
  tagline: string;
  voice: string;
  badge: string;
  icon: string;
  audioFile: string;
  subtitleFile: string;
  videoFile?: string;
}

const VIDEO_STYLES: StyleMeta[] = [
  {
    id: 'institutional',
    name: 'Sovereign Creditor',
    subtitle: 'Private Equity & Debt Fund',
    tagline: 'Private Equity Grade Debt Modeling & Verbatim Covenants',
    voice: 'OpenRouter onyx (Institutional)',
    badge: 'Institutional',
    icon: '🏛️',
    audioFile: '/video/styles/full_voiceover_institutional.mp3',
    subtitleFile: '/video/styles/subtitles_institutional.vtt',
    videoFile: '/video/styles/video_institutional.mp4',
  },
  {
    id: 'tech_keynote',
    name: 'Autonomous Copilot',
    subtitle: 'Silicon Valley Keynote',
    tagline: 'Real-Time Multi-Agent Underwriting at 120 FPS',
    voice: 'OpenRouter nova (Tech Keynote)',
    badge: 'Kinetic Tech',
    icon: '⚡',
    audioFile: '/video/styles/full_voiceover_tech_keynote.mp3',
    subtitleFile: '/video/styles/subtitles_tech_keynote.vtt',
    videoFile: '/video/styles/video_tech_keynote.mp4',
  },
  {
    id: 'editorial',
    name: 'Curated Comp',
    subtitle: 'Hospitality & Architecture',
    tagline: 'Boutique Hospitality Underwriting & Visual Comp Provenance',
    voice: 'OpenRouter shimmer (Curated Comp)',
    badge: 'Architectural',
    icon: '🏡',
    audioFile: '/video/styles/full_voiceover_editorial.mp3',
    subtitleFile: '/video/styles/subtitles_editorial.vtt',
    videoFile: '/video/styles/video_editorial.mp4',
  },
  {
    id: 'quant_analyst',
    name: 'The Stress Test',
    subtitle: 'Quantitative Risk Terminal',
    tagline: 'Stochastic Sensitivity Matrices & Non-QM Debt Shocks',
    voice: 'OpenRouter echo (London Quant)',
    badge: 'Stochastic Quant',
    icon: '📈',
    audioFile: '/video/styles/full_voiceover_quant_analyst.mp3',
    subtitleFile: '/video/styles/subtitles_quant_analyst.vtt',
    videoFile: '/video/styles/video_institutional.mp4',
  },
  {
    id: 'tactile_craft',
    name: 'Tactile Engine',
    subtitle: 'Industrial Minimalist Craft',
    tagline: 'Handcrafted Software for Discerning Real Estate Underwriters',
    voice: 'OpenRouter alloy (Calm Craft)',
    badge: 'Dieter Rams Craft',
    icon: '✏️',
    audioFile: '/video/styles/full_voiceover_tactile_craft.mp3',
    subtitleFile: '/video/styles/subtitles_tactile_craft.vtt',
    videoFile: '/video/styles/video_editorial.mp4',
  },
];

interface ChapterData {
  id: string;
  index: number;
  timecode: string;
  startSec: number;
  durationSec: number;
  title: string;
  text: string;
  screenKey: 'scanner_hero' | 'autonomous_radar' | 'muse_comps' | 'underwriter_studio' | 'agent_team' | 'lender_memo';
  caption: string;
}

// Chapter timings for each style (approximated from generated audio manifests)
const CHAPTERS_BY_STYLE: Record<VideoStyleId, ChapterData[]> = {
  institutional: [
    {
      id: 'ch1',
      index: 1,
      timecode: '0:00 - 0:14',
      startSec: 0,
      durationSec: 14.4,
      title: 'The Fallacy of Retail Pro Formas',
      text: 'Every private equity sponsor has reviewed a retail pro-forma and realized the numbers were sheer fiction. Unverified occupancy projections, zero allowance for seasonality, and debt covenants modeled on optimism rather than sovereign underwriting.',
      screenKey: 'scanner_hero',
      caption: 'Unverified occupancy projections and retail optimism fail institutional audits.',
    },
    {
      id: 'ch2',
      index: 2,
      timecode: '0:14 - 0:30',
      startSec: 14.4,
      durationSec: 15.9,
      title: 'Autonomous Market Sweeps',
      text: 'This is PencilSTR. The institutional short-term rental underwriting terminal. Our autonomous market sweeps crawl unseasoned mountain cabins and luxury desert villas, applying an immediate institutional discount haircut before evaluating loan terms.',
      screenKey: 'autonomous_radar',
      caption: 'Autonomous market sweeps apply an immediate institutional discount haircut before evaluating loans.',
    },
    {
      id: 'ch3',
      index: 3,
      timecode: '0:30 - 0:45',
      startSec: 30.3,
      durationSec: 15.1,
      title: 'Spatial Comps & Verbatim Deed Covenants',
      text: 'Inspect assets through Muse-inspired spatial comp cards with multi-angle photography scrubbing and corner debt indicators. Beneath the imagery lies our legal engine, parsing deed restrictions and county bed-tax resolutions with verbatim legal citations.',
      screenKey: 'muse_comps',
      caption: 'Muse-inspired comp cards paired with verbatim deed restrictions and bed-tax legal citations.',
    },
    {
      id: 'ch4',
      index: 4,
      timecode: '0:45 - 1:02',
      startSec: 45.4,
      durationSec: 17.3,
      title: 'Deterministic Dual DSCR Modeling',
      text: 'Calculate debt service coverage in sub-millisecond client time. Toggle between residential Non-QM guidelines and commercial fund net operating income. Stress-test two hundred basis point interest shocks and solve for the exact equity required to preserve a one-point-two-five DSCR.',
      screenKey: 'underwriter_studio',
      caption: 'Sub-millisecond Dual DSCR: residential Non-QM vs commercial fund NOI with +200bps rate shocks.',
    },
    {
      id: 'ch5',
      index: 5,
      timecode: '1:02 - 1:20',
      startSec: 62.7,
      durationSec: 17.7,
      title: 'The Scribe Multi-Agent War Room',
      text: 'Behind every valuation is a collaborative mesh of specialized agent scribes. Astra synthesizes committee theses. Scout monitors trailing comps. Cipher models bonus depreciation. And Lex audits zoning compliance. Controlled instantly via the universal Command Palette.',
      screenKey: 'agent_team',
      caption: 'Scribe Multi-Agent War Room: Astra, Scout, Cipher, and Lex collaborating under universal Cmd+K.',
    },
    {
      id: 'ch6',
      index: 6,
      timecode: '1:20 - 1:34',
      startSec: 80.4,
      durationSec: 12.9,
      title: 'The Bankable Credit Memorandum',
      text: 'With a single click, export a fully formatted, investment-committee-grade credit memorandum ready for debt syndicate signoff. Stop relying on spreadsheets built on hope. Underwrite the truth with PencilSTR.',
      screenKey: 'lender_memo',
      caption: 'Export a bankable, investment-committee-grade credit memo ready for debt syndicate signoff.',
    },
  ],
  tech_keynote: [
    {
      id: 'ch1',
      index: 1,
      timecode: '0:00 - 0:11',
      startSec: 0,
      durationSec: 10.7,
      title: 'The Speed of STR Underwriting',
      text: "Real estate underwriting hasn't evolved in twenty years. Analysts still copy-paste Airbnb links into broken spreadsheets, waiting hours for stale estimates while the best deals get snatched off the market in minutes.",
      screenKey: 'scanner_hero',
      caption: "Real estate underwriting hasn't evolved in twenty years. Stale spreadsheets lose deals.",
    },
    {
      id: 'ch2',
      index: 2,
      timecode: '0:11 - 0:23',
      startSec: 10.7,
      durationSec: 12.0,
      title: 'Autonomous Radar & Instant Ingest',
      text: 'Meet PencilSTR. Paste any MLS URL, Zillow link, or Airbnb listing, and our autonomous ingestion pipeline parses tax records, spatial coordinates, and comps in under four hundred milliseconds.',
      screenKey: 'autonomous_radar',
      caption: 'Paste any MLS or Airbnb link — parsed tax records and spatial coords in under 400ms.',
    },
    {
      id: 'ch3',
      index: 3,
      timecode: '0:23 - 0:34',
      startSec: 22.7,
      durationSec: 11.7,
      title: 'Pinterest-Grade Visual Comps',
      text: 'Browse comps with Muse-grade full-bleed gallery cards. Scrub multi-angle photography, inspect corner DSCR pills, and review automated HOA audit checks that scan municipal ordinances for short-term rental permits.',
      screenKey: 'muse_comps',
      caption: 'Browse full-bleed Muse gallery cards with photo scrubbing and automated municipal HOA checks.',
    },
    {
      id: 'ch4',
      index: 4,
      timecode: '0:34 - 0:45',
      startSec: 34.4,
      durationSec: 10.4,
      title: 'Dual Engine Financial Modeling',
      text: 'Underwrite with deterministic dual engines. Switch instantly between residential debt service coverage and commercial net operating income. Run live interest rate sliders with sub-millisecond recalculations.',
      screenKey: 'underwriter_studio',
      caption: 'Deterministic dual engines: Residential DSCR vs Commercial NOI with live reactive rate sliders.',
    },
    {
      id: 'ch5',
      index: 5,
      timecode: '0:45 - 0:57',
      startSec: 44.8,
      durationSec: 12.0,
      title: 'Multi-Agent Scribe Mesh',
      text: 'Four autonomous AI agents work together in parallel. Astra drafts the memo, Scout tracks market comps, Cipher runs tax depreciation, and Lex reviews zoning bylaws, all orchestrated through a native command palette.',
      screenKey: 'agent_team',
      caption: 'Astra, Scout, Cipher, and Lex working in parallel, orchestrated via universal Command Palette.',
    },
    {
      id: 'ch6',
      index: 6,
      timecode: '0:57 - 1:07',
      startSec: 56.8,
      durationSec: 9.7,
      title: 'Instant Bankable Memorandums',
      text: 'One click exports a lender-ready credit memorandum that gets your term sheet approved before the competition even opens Excel. Welcome to the future of underwriting. Welcome to PencilSTR.',
      screenKey: 'lender_memo',
      caption: 'One click exports a lender-ready credit memo. Welcome to PencilSTR.',
    },
  ],
  editorial: [
    {
      id: 'ch1',
      index: 1,
      timecode: '0:00 - 0:13',
      startSec: 0,
      durationSec: 13.6,
      title: 'Aesthetics Meet Underwriting',
      text: 'True short-term rental performance is driven by spatial beauty, bespoke finishes, and hospitality provenance. Yet traditional real estate underwriting treats million-dollar architectural cabins like generic single-family rentals.',
      screenKey: 'scanner_hero',
      caption: 'Short-term rental performance is driven by spatial beauty, finishes, and hospitality provenance.',
    },
    {
      id: 'ch2',
      index: 2,
      timecode: '0:13 - 0:26',
      startSec: 13.6,
      durationSec: 12.4,
      title: 'Curated Market Discovery',
      text: 'PencilSTR bridges architectural distinction with rigorous credit underwriting. Our autonomous radar uncovers unheralded gems across top destination markets, pairing imagery with verified revenue comps.',
      screenKey: 'autonomous_radar',
      caption: 'Bridging architectural distinction with rigorous credit underwriting across destination markets.',
    },
    {
      id: 'ch3',
      index: 3,
      timecode: '0:26 - 0:39',
      startSec: 26.0,
      durationSec: 13.5,
      title: 'The Visual Comp Gallery',
      text: 'Explore comps through an editorial lens inspired by Pinterest and Muse. High-resolution photo galleries let you evaluate interior volume, designer lighting, and outdoor living areas alongside debt service coverage ratios.',
      screenKey: 'muse_comps',
      caption: 'Evaluate interior volume, designer lighting, and outdoor amenities alongside debt coverage.',
    },
    {
      id: 'ch4',
      index: 4,
      timecode: '0:39 - 0:52',
      startSec: 39.5,
      durationSec: 12.5,
      title: 'Sensible Financial Discipline',
      text: 'Behind the refined design lies uncompromising financial math. Model seasonality across twelve peak and shoulder months, account for linen turnover and local tax resolutions, and benchmark your true debt yield.',
      screenKey: 'underwriter_studio',
      caption: 'Uncompromising financial math: 12-month seasonality, turnover costs, and verified debt yield.',
    },
    {
      id: 'ch5',
      index: 5,
      timecode: '0:52 - 1:04',
      startSec: 52.0,
      durationSec: 12.4,
      title: 'Autonomous Curators at Work',
      text: 'Our multi-agent scribe team acts as your boutique hospitality advisory board. They examine local short-term rental bylaws, identify regulatory risks, and refine investment theses in real time.',
      screenKey: 'agent_team',
      caption: 'A boutique hospitality advisory board examining local bylaws and refining investment theses.',
    },
    {
      id: 'ch6',
      index: 6,
      timecode: '1:04 - 1:15',
      startSec: 64.4,
      durationSec: 10.1,
      title: 'The Editorial Credit Package',
      text: 'Deliver an impeccably curated credit package that delights lenders and capital partners alike. Experience the art and science of short-term rental investing with PencilSTR.',
      screenKey: 'lender_memo',
      caption: 'An impeccably curated credit package that delights lenders and capital partners alike.',
    },
  ],
  quant_analyst: [
    {
      id: 'ch1',
      index: 1,
      timecode: '0:00 - 0:10',
      startSec: 0,
      durationSec: 10.4,
      title: 'Zero Margin for Error',
      text: 'In a fluctuating interest rate environment, an eighty basis point shift obliterates unhedged short-term rental equity. Traditional underwriting uses static assumptions that fail the first month a tourism trough hits.',
      screenKey: 'scanner_hero',
      caption: 'An eighty basis point rate shift obliterates unhedged equity without stochastic modeling.',
    },
    {
      id: 'ch2',
      index: 2,
      timecode: '0:10 - 0:22',
      startSec: 10.4,
      durationSec: 11.4,
      title: 'Algorithmic Pipeline Filtration',
      text: 'PencilSTR subjects every listing to automated statistical filtration. It evaluates historical seasonality variance, standard deviations of daily rates, and trailing revenue distribution across competing clusters.',
      screenKey: 'autonomous_radar',
      caption: 'Automated statistical filtration across historical seasonality variance and rate deviation.',
    },
    {
      id: 'ch3',
      index: 3,
      timecode: '0:22 - 0:33',
      startSec: 21.8,
      durationSec: 11.0,
      title: 'Multi-Factor Comp Normalization',
      text: 'Inspect visual comps with algorithmic normalization. Compare square footage, bedroom count, and revenue percentiles side-by-side in our unified drawer, while screening out properties with restrictive HOA deed covenants.',
      screenKey: 'muse_comps',
      caption: 'Algorithmic comp normalization screening out restrictive HOA deed covenants.',
    },
    {
      id: 'ch4',
      index: 4,
      timecode: '0:33 - 0:43',
      startSec: 32.8,
      durationSec: 10.3,
      title: 'Stochastic Sensitivity & Debt Stress',
      text: 'Execute multi-variable sensitivity analysis. Test twenty percent revenue degradation against three hundred basis point interest shocks. Solve immediately for break-even occupancy and required debt yield.',
      screenKey: 'underwriter_studio',
      caption: 'Execute multi-variable sensitivity: -20% revenue vs +300bps shocks and break-even occupancy.',
    },
    {
      id: 'ch5',
      index: 5,
      timecode: '0:43 - 0:54',
      startSec: 43.1,
      durationSec: 10.7,
      title: 'Autonomous Scribe Calculations',
      text: 'Our multi-agent consensus engine reconciles financial models across four distinct perspectives, verifying debt covenants and validating tax depreciation assumptions before outputting final committee recommendations.',
      screenKey: 'agent_team',
      caption: 'Consensus engine reconciling financial models across four distinct algorithmic perspectives.',
    },
    {
      id: 'ch6',
      index: 6,
      timecode: '0:54 - 1:03',
      startSec: 53.8,
      durationSec: 8.8,
      title: 'Deterministic Institutional Output',
      text: 'Export audit-proof credit packages designed for institutional investment committees and non-bank lenders. Eliminate guesswork. Quantify every variable with PencilSTR.',
      screenKey: 'lender_memo',
      caption: 'Audit-proof credit packages for institutional investment committees. Quantify every variable.',
    },
  ],
  tactile_craft: [
    {
      id: 'ch1',
      index: 1,
      timecode: '0:00 - 0:12',
      startSec: 0,
      durationSec: 12.4,
      title: 'The Joy of Crafted Software',
      text: 'Great financial tools should feel like precision instruments. Clean typography, tactile feedback, and instant responsiveness turn complex underwriting into a seamless creative experience.',
      screenKey: 'scanner_hero',
      caption: 'Great financial tools feel like precision instruments: clean typography and tactile feedback.',
    },
    {
      id: 'ch2',
      index: 2,
      timecode: '0:12 - 0:23',
      startSec: 12.4,
      durationSec: 10.5,
      title: 'Intentional Discovery',
      text: 'Every deal on PencilSTR is rendered with spatial clarity. Discover high-yielding mountain chalets and coastal retreats without visual clutter or unnecessary noise.',
      screenKey: 'autonomous_radar',
      caption: 'Rendered with spatial clarity: high-yielding mountain chalets and coastal retreats.',
    },
    {
      id: 'ch3',
      index: 3,
      timecode: '0:23 - 0:35',
      startSec: 22.9,
      durationSec: 12.0,
      title: 'Tactile Photographic Comps',
      text: 'Slide effortlessly through property photography. Compare spatial volumes, architectural materials, and neighborhood comps with intuitive gesture navigation and corner debt health seals.',
      screenKey: 'muse_comps',
      caption: 'Compare spatial volumes and architectural materials with intuitive gesture navigation.',
    },
    {
      id: 'ch4',
      index: 4,
      timecode: '0:35 - 0:47',
      startSec: 34.9,
      durationSec: 11.7,
      title: 'Responsive Financial Modeling',
      text: 'Interact with dynamic financial models where every slider feels weighted and deliberate. Adjust occupancy assumptions or debt terms and watch cash flow waterfalls recalculate in real time.',
      screenKey: 'underwriter_studio',
      caption: 'Weighted and deliberate sliders: watch cash flow waterfalls recalculate in real time.',
    },
    {
      id: 'ch5',
      index: 5,
      timecode: '0:47 - 0:58',
      startSec: 46.6,
      durationSec: 10.9,
      title: 'Quiet Autonomous Intelligence',
      text: 'Intelligent agent scribes work quietly in the background, conducting legal checks and tax modeling without intrusive interruptions, surfaced whenever you invoke the command palette.',
      screenKey: 'agent_team',
      caption: 'Quiet autonomous intelligence conducting legal checks without intrusive interruptions.',
    },
    {
      id: 'ch6',
      index: 6,
      timecode: '0:58 - 1:08',
      startSec: 57.5,
      durationSec: 10.1,
      title: 'A Masterpiece of Underwriting',
      text: 'Transform chaotic real estate data into an elegant, institutional-grade memorandum. This is underwriting elevated to craft. This is PencilSTR.',
      screenKey: 'lender_memo',
      caption: 'Transform chaotic real estate data into an elegant memorandum. Underwriting elevated to craft.',
    },
  ],
};

interface LaunchVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToSection?: (section: string) => void;
}

export const LaunchVideoModal: React.FC<LaunchVideoModalProps> = ({
  isOpen,
  onClose,
  onJumpToSection,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<VideoStyleId>('institutional');
  const [viewMode, setViewMode] = useState<'video' | 'interactive'>('video');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentStyleMeta = VIDEO_STYLES.find((s) => s.id === selectedStyle) || VIDEO_STYLES[0];
  const chapters = CHAPTERS_BY_STYLE[selectedStyle] || CHAPTERS_BY_STYLE.institutional;

  // Find active chapter based on currentTime
  const activeChapterIndex = chapters.findIndex(
    (ch, idx) => {
      const nextCh = chapters[idx + 1];
      return currentTime >= ch.startSec && (nextCh ? currentTime < nextCh.startSec : true);
    }
  );
  const currentChapter = chapters[activeChapterIndex >= 0 ? activeChapterIndex : 0];

  // Auto-pause when modal closes
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Handle style switch
  const handleStyleChange = (styleId: VideoStyleId) => {
    setSelectedStyle(styleId);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio playback blocked or failed:', err);
          setIsPlaying(true); // Fallback: simulate timer progression even if audio device blocked
        });
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlaying(true));
    }
    setCurrentTime(0);
  };

  const handleJumpToChapter = (startSec: number) => {
    setCurrentTime(startSec);
    if (audioRef.current) {
      audioRef.current.currentTime = startSec;
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
  };

  const handleCopyShareCopy = () => {
    const copyText = `Introducing PencilSTR — The Autonomous STR Underwriting & DSCR Engine 🏡📊\n\nExperience institutional-grade debt coverage modeling, sub-millisecond dual DSCR calculations, Muse-inspired spatial comps, and a 4-agent Scribe mesh.\n\nWatch our 60-second Light Mode video: "${currentStyleMeta.name}" (${currentStyleMeta.tagline})\n\n🔗 https://pencilstr.app #PropTech #RealEstate #DSCR #Fintech`;
    navigator.clipboard.writeText(copyText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md transition-opacity">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentStyleMeta.audioFile}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        muted={isMuted}
        preload="auto"
      />

      {/* Main Light-Mode Cinema Studio Window */}
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#F9F8F5] text-[#111110] rounded-2xl border border-[#E5E4DF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Window Top Chrome */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#E5E4DF] bg-[#F1EFEB]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/80"></div>
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80"></div>
              <div className="w-3 h-3 rounded-full bg-[#10B981]/80"></div>
            </div>
            <div className="h-4 w-px bg-[#D6D4CD]"></div>
            <div className="flex items-center gap-2">
              <BrandLogoIcon className="w-5 h-5 text-[#D97706]" />
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-[#111110]">
                PENCIL<span className="text-[#D97706]">STR</span> CINEMA STUDIO
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#059669]/10 text-[#059669] border border-[#059669]/20">
                Light Mode 60s Reel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium bg-white hover:bg-[#F9F8F5] text-[#111110] border border-[#D6D4CD] rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Copy launch announcement"
            >
              {copiedShare ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span className="text-[#059669]">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#666562]" />
                  <span className="hidden md:inline">Share</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#666562] hover:text-[#111110] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Style Selector Navigation Bar (5 Alternate Styles) + Mode Switch */}
        <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-[#E5E4DF] flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#666562] uppercase tracking-wider whitespace-nowrap mr-1">
              5 Styles:
            </span>
            {VIDEO_STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#111110] text-white shadow-xs font-semibold'
                      : 'bg-[#F1EFEB] text-[#444340] hover:bg-[#E8E6E0] hover:text-[#111110] border border-transparent'
                  }`}
                >
                  <span className="text-sm">{style.icon}</span>
                  <span className="tracking-tight">{style.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#666562]'
                    }`}
                  >
                    {style.voice.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mode Switch: 1080p MP4 Video vs Interactive Simulation */}
          <div className="flex items-center gap-1 bg-[#F1EFEB] p-1 rounded-xl border border-[#E5E4DF] shrink-0">
            <button
              onClick={() => setViewMode('video')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === 'video'
                  ? 'bg-white text-[#111110] font-bold shadow-2xs'
                  : 'text-[#666562] hover:text-[#111110]'
              }`}
            >
              🎬 1080p MP4
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-white text-[#111110] font-bold shadow-2xs'
                  : 'text-[#666562] hover:text-[#111110]'
              }`}
            >
              ⚡ Interactive
            </button>
          </div>
        </div>

        {/* Studio Content Area: Split View (Interactive Screen Stage + Dynamic Overlay) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F9F8F5]">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Screen Simulator Box or Native 1080p Video Player */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl bg-black border border-[#E5E4DF] shadow-md overflow-hidden flex flex-col">
              {viewMode === 'video' ? (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    key={currentStyleMeta.videoFile}
                    src={currentStyleMeta.videoFile}
                    poster={`/video/styles/poster_${currentStyleMeta.id}.jpg`}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <>
                  {/* Simulated Inner App Header Bar */}
                  <div className="h-8 bg-[#F1EFEB] border-b border-[#E5E4DF] px-3 flex items-center justify-between text-[11px] font-mono text-[#666562]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#111110] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                    PENCILSTR // LIGHT MODE
                  </span>
                  <span>•</span>
                  <span className="text-[#D97706] font-medium">{currentChapter.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-white px-2 py-0.5 rounded border border-[#E5E4DF] text-[10px]">
                    {currentChapter.timecode}
                  </span>
                  <span className="font-sans text-[10px] text-[#888680]">
                    Chapter {currentChapter.index} of 6
                  </span>
                </div>
              </div>

              {/* Dynamic Screen Viewport based on current chapter */}
              <div className="flex-1 relative overflow-hidden bg-[#FAF9F6] p-4 sm:p-6 flex flex-col justify-center">
                {/* 1. Chapter 1: Scanner Hero Screen */}
                {currentChapter.screenKey === 'scanner_hero' && (
                  <div className="space-y-4 max-w-xl mx-auto w-full animate-in fade-in duration-300">
                    <div className="text-center space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AUTONOMOUS STR UNDERWRITING</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111110] font-serif">
                        Pencil Any STR in 3 Seconds.
                      </h2>
                      <p className="text-xs sm:text-sm text-[#666562]">
                        Paste an Airbnb, VRBO, or MLS link. Autonomous Scribe agents extract tax data & comps.
                      </p>
                    </div>

                    {/* Interactive Simulated Search Input */}
                    <div className="relative bg-white rounded-2xl border-2 border-[#111110] shadow-md p-2 flex items-center gap-3">
                      <span className="text-[#D97706] pl-2 font-mono text-sm">✦</span>
                      <div className="flex-1 text-xs sm:text-sm font-mono text-[#111110] truncate">
                        https://www.airbnb.com/rooms/1084291823/luxury-smoky-chalet
                      </div>
                      <button className="bg-[#111110] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs">
                        <span>Pencil Deal</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#D97706]" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-[#666562]">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#059669]" /> Dual DSCR (1.38x)
                      </span>
                      <span>•</span>
                      <span>4 Scribe Agents Active</span>
                      <span>•</span>
                      <span>14.8k Tokens / Sec</span>
                    </div>
                  </div>
                )}

                {/* 2. Chapter 2: Autonomous Radar Screen */}
                {currentChapter.screenKey === 'autonomous_radar' && (
                  <div className="space-y-3 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DF]">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#D97706] animate-spin" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111110]">
                          Autonomous Radar Sweeps
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669] font-bold">
                        3 MARKETS ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-[#E5E4DF] shadow-xs">
                        <div className="text-[10px] font-mono text-[#666562]">MARKET // SEVIER CO, TN</div>
                        <div className="font-bold text-sm text-[#111110] mt-0.5">Smoky Chalet Cluster</div>
                        <div className="flex items-center justify-between mt-2 text-[11px]">
                          <span className="text-[#059669] font-mono font-bold">1.42x DSCR</span>
                          <span className="text-[#666562] font-mono">$842k Avg</span>
                        </div>
                        <div className="w-full bg-[#E5E4DF] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-[#059669] h-full w-[78%]"></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#E5E4DF] shadow-xs">
                        <div className="text-[10px] font-mono text-[#666562]">MARKET // SCOTTSDALE, AZ</div>
                        <div className="font-bold text-sm text-[#111110] mt-0.5">Desert Estate Cluster</div>
                        <div className="flex items-center justify-between mt-2 text-[11px]">
                          <span className="text-[#059669] font-mono font-bold">1.34x DSCR</span>
                          <span className="text-[#666562] font-mono">$1.45M Avg</span>
                        </div>
                        <div className="w-full bg-[#E5E4DF] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-[#D97706] h-full w-[65%]"></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#E5E4DF] shadow-xs">
                        <div className="text-[10px] font-mono text-[#666562]">MARKET // GULF SHORES, AL</div>
                        <div className="font-bold text-sm text-[#111110] mt-0.5">Coastal Beachfront</div>
                        <div className="flex items-center justify-between mt-2 text-[11px]">
                          <span className="text-[#059669] font-mono font-bold">1.28x DSCR</span>
                          <span className="text-[#666562] font-mono">$1.12M Avg</span>
                        </div>
                        <div className="w-full bg-[#E5E4DF] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-[#059669] h-full w-[82%]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-[#E5E4DF] text-center font-mono text-[11px] text-[#666562]">
                      <span className="text-[#111110] font-semibold">Institutional Discount Haircut:</span> 15% applied to unseasoned occupancy projections.
                    </div>
                  </div>
                )}

                {/* 3. Chapter 3: Muse Comps Screen */}
                {currentChapter.screenKey === 'muse_comps' && (
                  <div className="space-y-3 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DF]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#D97706]" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111110]">
                          Muse Spatial Comps & CC&R Citations
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111110] text-white">
                        Full-Bleed 16:10 Cards
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative rounded-xl overflow-hidden border border-[#E5E4DF] bg-stone-100 group shadow-sm">
                        <div className="h-32 bg-stone-200 relative overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"
                            alt="Luxury Chalet"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-black/75 backdrop-blur-md text-emerald-400 rounded-md border border-white/20">
                              DSCR 1.38x
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-mono bg-black/75 backdrop-blur-md text-white rounded-md border border-white/20">
                              $485/nt
                            </span>
                          </div>
                          <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-mono bg-emerald-600/90 text-white font-bold rounded-md">
                            PERMIT VERIFIED
                          </span>
                        </div>
                        <div className="p-2.5 bg-white">
                          <div className="font-bold text-xs text-[#111110]">Smoky Mountain Vista Chalet</div>
                          <div className="text-[10px] text-[#666562]">Gatlinburg, TN • 4 Bed • 4 Bath</div>
                          <div className="mt-1 text-[9px] font-mono text-[#059669] bg-emerald-50 p-1 rounded border border-emerald-100">
                            Deed: Res. 2021-08 allows STR w/ zero occupancy caps.
                          </div>
                        </div>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-[#E5E4DF] bg-stone-100 group shadow-sm">
                        <div className="h-32 bg-stone-200 relative overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                            alt="Desert Villa"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-black/75 backdrop-blur-md text-emerald-400 rounded-md border border-white/20">
                              DSCR 1.29x
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-mono bg-black/75 backdrop-blur-md text-white rounded-md border border-white/20">
                              $620/nt
                            </span>
                          </div>
                          <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-mono bg-amber-600/90 text-white font-bold rounded-md">
                            CONDITIONAL
                          </span>
                        </div>
                        <div className="p-2.5 bg-white">
                          <div className="font-bold text-xs text-[#111110]">Scottsdale Oasis Retreat</div>
                          <div className="text-[10px] text-[#666562]">Scottsdale, AZ • 5 Bed • 4.5 Bath</div>
                          <div className="mt-1 text-[9px] font-mono text-[#D97706] bg-amber-50 p-1 rounded border border-amber-100">
                            HOA Art. IV: 30-day min unless certified bed-tax permit.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Chapter 4: Underwriter Studio Screen */}
                {currentChapter.screenKey === 'underwriter_studio' && (
                  <div className="space-y-3 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DF]">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#D97706]" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111110]">
                          Deterministic Dual DSCR Engine
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#111110] text-white">Residential Non-QM</span>
                        <span className="px-2 py-0.5 rounded bg-[#E5E4DF] text-[#666562]">Commercial Fund</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-[#E5E4DF] text-center">
                        <div className="text-[10px] font-mono text-[#666562]">ANNUAL NOI</div>
                        <div className="text-lg font-bold font-mono text-[#111110] mt-1">$72,400</div>
                        <div className="text-[10px] text-[#059669] font-medium">+14.2% vs Pro Forma</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E5E4DF] text-center">
                        <div className="text-[10px] font-mono text-[#666562]">DEBT SERVICE (P&I)</div>
                        <div className="text-lg font-bold font-mono text-[#111110] mt-1">$52,460</div>
                        <div className="text-[10px] text-[#666562] font-mono">6.85% / 30-Yr Fixed</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border-2 border-[#059669] text-center shadow-xs">
                        <div className="text-[10px] font-mono text-[#059669] font-bold">DSCR RATIO</div>
                        <div className="text-2xl font-black font-mono text-[#059669] mt-0.5">1.38x</div>
                        <div className="text-[10px] text-[#059669] font-bold">APPROVED (&gt; 1.25x)</div>
                      </div>
                    </div>

                    {/* Sensitivity Stress Test Matrix Snippet */}
                    <div className="bg-white p-2.5 rounded-xl border border-[#E5E4DF]">
                      <div className="text-[10px] font-mono text-[#666562] mb-1.5 flex justify-between">
                        <span>2D SENSITIVITY STRESS MATRIX (RATE SHOCK VS OCCUPANCY)</span>
                        <span className="text-[#059669] font-bold">+200bps Resilient</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                        <div className="bg-emerald-50 text-[#059669] p-1.5 rounded font-bold">Base: 1.38x</div>
                        <div className="bg-emerald-50 text-[#059669] p-1.5 rounded font-bold">+100bps: 1.31x</div>
                        <div className="bg-amber-50 text-[#D97706] p-1.5 rounded font-bold">+200bps: 1.25x</div>
                        <div className="bg-rose-50 text-[#DC2626] p-1.5 rounded font-bold">+300bps: 1.19x</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Chapter 5: Agent Team Scribe Mesh Screen */}
                {currentChapter.screenKey === 'agent_team' && (
                  <div className="space-y-3 max-w-2xl mx-auto w-full animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DF]">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#D97706]" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111110]">
                          Scribe Multi-Agent War Room
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669] font-bold">
                        4 AGENTS STREAMING
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-white p-2.5 rounded-xl border border-[#E5E4DF] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#111110]">ASTRA // Lead Scribe</span>
                          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
                        </div>
                        <p className="text-[10px] text-[#666562] font-mono">
                          "Underwriting thesis affirmed: debt yield 8.6%, robust shoulder season demand."
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-[#E5E4DF] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#111110]">SCOUT // Comp Verifier</span>
                          <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                        </div>
                        <p className="text-[10px] text-[#666562] font-mono">
                          "Verified 4 architectural comps within 1.2 miles. Mean ADR $485."
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-[#E5E4DF] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#111110]">CIPHER // Tax & CapEx</span>
                          <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                        </div>
                        <p className="text-[10px] text-[#666562] font-mono">
                          "Bonus depreciation scheduled: $42,500 year-one cost seg deduction."
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-[#E5E4DF] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#111110]">LEX // Legal & CC&R</span>
                          <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                        </div>
                        <p className="text-[10px] text-[#666562] font-mono">
                          "County bed-tax permit verified. No deed covenant limitations found."
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#111110] text-white p-2 rounded-xl flex items-center justify-between text-xs font-mono px-3">
                      <span>⌘K Universal Command Palette</span>
                      <span className="text-[#D97706] text-[10px]">Jump to any deal, agent, or memo</span>
                    </div>
                  </div>
                )}

                {/* 6. Chapter 6: Lender Memo Screen */}
                {currentChapter.screenKey === 'lender_memo' && (
                  <div className="space-y-3 max-w-xl mx-auto w-full animate-in fade-in duration-300">
                    <div className="bg-white p-4 rounded-xl border-2 border-[#111110] shadow-md space-y-3">
                      <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-2">
                        <div>
                          <div className="text-[9px] font-mono text-[#666562] tracking-wider uppercase">
                            INVESTMENT COMMITTEE MEMORANDUM
                          </div>
                          <div className="font-serif font-black text-base text-[#111110]">
                            Credit Facility Recommendation
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#059669]/10 border border-[#059669]/20 text-[#059669] text-xs font-mono font-bold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>APPROVED</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[#666562] text-[10px]">ASSET:</span>
                          <div className="font-semibold text-[#111110]">Smoky Mountain Chalet</div>
                        </div>
                        <div>
                          <span className="text-[#666562] text-[10px]">LOAN AMOUNT:</span>
                          <div className="font-semibold text-[#111110]">$630,000 (75% LTV)</div>
                        </div>
                        <div>
                          <span className="text-[#666562] text-[10px]">MODELED DSCR:</span>
                          <div className="font-bold text-[#059669]">1.38x (Min: 1.25x)</div>
                        </div>
                        <div>
                          <span className="text-[#666562] text-[10px]">DEBT YIELD:</span>
                          <div className="font-bold text-[#111110]">8.62% Net</div>
                        </div>
                      </div>

                      <div className="p-2 bg-[#F9F8F5] rounded border border-[#E5E4DF] text-[10px] text-[#444340] leading-relaxed">
                        "Borrower credit profile satisfies Non-QM Tier 1 guidelines. Property shows 68% stabilized occupancy with strong repeat bookings."
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#666562]">
                        <span>SIGN-OFF: PencilSTR Sovereign Mesh</span>
                        <span>EXPORT: PDF &amp; syndicate XLS</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Synchronized Subtitle Overlay (Floating Glass Bar) */}
                <div className="absolute bottom-3 left-4 right-4 bg-white/95 backdrop-blur-md border border-[#E5E4DF] shadow-md rounded-xl p-3 text-center pointer-events-none transition-all">
                  <div className="text-[10px] font-mono text-[#D97706] font-bold uppercase tracking-wider mb-0.5">
                    {currentStyleMeta.name} // {currentChapter.title}
                  </div>
                  <p className="text-xs sm:text-sm font-sans font-medium text-[#111110] leading-snug">
                    "{currentChapter.text}"
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

            {/* Playback Controls & Chapter Scrubbing Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E4DF] shadow-xs space-y-3">
              {/* Timeline Scrub Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 60}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-[#E5E4DF] rounded-lg appearance-none cursor-pointer accent-[#111110]"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#666562]">
                  <span>{formatSeconds(currentTime)}</span>
                  <span className="text-[#D97706] font-semibold">{currentChapter.title}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
              </div>

              {/* Control Buttons & Chapter Markers */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Media Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111110] text-white hover:bg-black transition-colors font-medium text-xs shadow-xs cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-2 text-[#666562] hover:text-[#111110] hover:bg-[#F1EFEB] rounded-xl transition-colors cursor-pointer"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 text-[#666562] hover:text-[#111110] hover:bg-[#F1EFEB] rounded-xl transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Chapter Fast-Jump Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {chapters.map((ch, idx) => {
                    const isActive = activeChapterIndex === idx;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => handleJumpToChapter(ch.startSec)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#D97706] text-white font-bold shadow-2xs'
                            : 'bg-[#F1EFEB] text-[#666562] hover:text-[#111110] hover:bg-[#E5E4DF]'
                        }`}
                        title={ch.title}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Direct Asset Downloads */}
                <div className="flex items-center gap-2">
                  {currentStyleMeta.videoFile && (
                    <a
                      href={currentStyleMeta.videoFile}
                      download={`PencilSTR_Launch_1080p_${currentStyleMeta.id}.mp4`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#111110] text-white hover:bg-black text-[11px] font-mono transition-colors shadow-2xs"
                      title="Download full 1080p MP4 launch video"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>1080p MP4</span>
                    </a>
                  )}

                  <a
                    href={currentStyleMeta.audioFile}
                    download={`PencilSTR_Launch_${currentStyleMeta.id}.mp3`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E5E4DF] text-[11px] font-mono text-[#444340] hover:bg-[#F9F8F5] transition-colors"
                    title="Download mastered MP3 voiceover stem"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>MP3 Audio</span>
                  </a>

                  <a
                    href={currentStyleMeta.subtitleFile}
                    download={`PencilSTR_Captions_${currentStyleMeta.id}.vtt`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E5E4DF] text-[11px] font-mono text-[#444340] hover:bg-[#F9F8F5] transition-colors"
                    title="Download timed VTT subtitles"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>VTT Captions</span>
                  </a>

                  {onJumpToSection && (
                    <button
                      onClick={() => {
                        onClose();
                        onJumpToSection('underwriter');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#059669] text-white text-[11px] font-semibold hover:bg-[#047857] transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>Open Studio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Style Narrative Card & Technical Profile */}
            <div className="bg-[#F1EFEB] p-4 rounded-2xl border border-[#E5E4DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#111110] text-sm flex items-center gap-1.5">
                    <span>{currentStyleMeta.icon}</span>
                    <span>Style {VIDEO_STYLES.findIndex((s) => s.id === selectedStyle) + 1}: {currentStyleMeta.name}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-[#111110] border border-[#D6D4CD]">
                    {currentStyleMeta.badge}
                  </span>
                </div>
                <p className="text-[#666562] font-mono text-[11px]">
                  {currentStyleMeta.tagline} • Spoken by {currentStyleMeta.voice}
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-[#666562]">
                <span>Mastering: -16 LUFS Stereo</span>
                <span>•</span>
                <span>Sub-millisecond Reactivity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
