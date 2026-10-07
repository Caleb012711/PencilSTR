export interface AIModelOption {
  id: string;
  name: string;
  provider: 'NVIDIA' | 'MiniMax' | 'Meta' | 'DeepSeek' | 'Google' | 'Qwen' | 'Mistral' | 'Anthropic' | 'OpenAI' | 'Custom';
  isFree: boolean;
  contextLength: string;
  description: string;
  recommendedFor: 'Financial Underwriting' | 'HOA CC&R Legal Audit' | 'Speed & Web Scraping' | 'Deep Reasoning';
  tag: string;
}

export const OPENROUTER_MODELS: AIModelOption[] = [
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
    name: 'NVIDIA Nemotron 3 / 70B Ultra',
    provider: 'NVIDIA',
    isFree: true,
    contextLength: '128k',
    description: 'NVIDIA fine-tuned flagship with state-of-the-art mathematical logic and structured financial underwriting.',
    recommendedFor: 'Financial Underwriting',
    tag: 'FREE // INSTITUTIONAL MATH',
  },
  {
    id: 'minimax/minimax-01:free',
    name: 'MiniMax 01 (Free)',
    provider: 'MiniMax',
    isFree: true,
    contextLength: '1M tokens',
    description: 'Massive 456B parameter MoE architecture with ultra-long context window, ideal for 100+ page HOA CC&R legal audits.',
    recommendedFor: 'HOA CC&R Legal Audit',
    tag: 'FREE // 1M CONTEXT CC&R',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Meta Llama 3.3 70B Instruct',
    provider: 'Meta',
    isFree: true,
    contextLength: '128k',
    description: 'Open-weights standard for high-fidelity reasoning, rental valuation benchmarks, and underwriting synthesis.',
    recommendedFor: 'Financial Underwriting',
    tag: 'FREE // GENERAL REASONING',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 Reasoning',
    provider: 'DeepSeek',
    isFree: true,
    contextLength: '64k',
    description: 'Deep chain-of-thought mathematical reasoning model for stress-testing multi-scenario DSCR coverage.',
    recommendedFor: 'Deep Reasoning',
    tag: 'FREE // CHAIN-OF-THOUGHT',
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Google Gemini 2.0 Flash (Free)',
    provider: 'Google',
    isFree: true,
    contextLength: '1M tokens',
    description: 'Next-generation low latency speed engine for real-time web URL scraping and autonomous market scanning.',
    recommendedFor: 'Speed & Web Scraping',
    tag: 'FREE // SUB-SECOND RADAR',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'Qwen',
    isFree: true,
    contextLength: '128k',
    description: 'Premier multilingual and complex JSON extraction engine for unstructured real estate listing pages.',
    recommendedFor: 'Financial Underwriting',
    tag: 'FREE // JSON PARSING',
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501:free',
    name: 'Mistral Small 24B',
    provider: 'Mistral',
    isFree: true,
    contextLength: '32k',
    description: 'Efficient, highly deterministic model for rapid rule validation and covenant risk classifications.',
    recommendedFor: 'HOA CC&R Legal Audit',
    tag: 'FREE // FAST AUDIT',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Google Gemini 2.5 Flash',
    provider: 'Google',
    isFree: false,
    contextLength: '1M tokens',
    description: 'Native PencilSTR cloud backend model with native multimodal image and document intelligence.',
    recommendedFor: 'Speed & Web Scraping',
    tag: 'DEFAULT HOSTED BACKEND',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic',
    isFree: false,
    contextLength: '200k',
    description: 'Tier-1 legal and financial drafting intelligence for institutional credit memorandums.',
    recommendedFor: 'HOA CC&R Legal Audit',
    tag: 'PAID // TIER-1 CREDIT MEMO',
  },
];
