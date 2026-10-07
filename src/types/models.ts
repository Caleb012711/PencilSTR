export interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
  contextWindow: string;
  badge?: string;
  description: string;
}

export const OPENROUTER_MODELS: AIModelOption[] = [
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
    name: 'NVIDIA Nemotron 3 / 70B',
    provider: 'NVIDIA',
    isFree: true,
    contextWindow: '128k',
    badge: 'FREE • POPULAR',
    description: 'NVIDIA-aligned high precision model with superior reasoning for financial & legal covenants.',
  },
  {
    id: 'nvidia/nemotron-4-340b-instruct:free',
    name: 'NVIDIA Nemotron 4 340B',
    provider: 'NVIDIA',
    isFree: true,
    contextWindow: '4k',
    badge: 'FREE • 340B',
    description: 'Massive synthetic data & reasoning giant for complex CC&R constraint decomposition.',
  },
  {
    id: 'minimax/minimax-01',
    name: 'MiniMax-01 Flagship',
    provider: 'MiniMax',
    isFree: false,
    contextWindow: '1M tokens',
    badge: '1M CONTEXT',
    description: 'Lightning-fast 1,000,000 token context window, parses 100+ page HOA binders in seconds.',
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    isFree: true,
    contextWindow: '1M tokens',
    badge: 'FREE • FAST',
    description: 'Next-gen Google multimodal speedster with high-throughput structured JSON output.',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 Reasoning',
    provider: 'DeepSeek',
    isFree: true,
    contextWindow: '64k',
    badge: 'FREE • REASONING',
    description: 'Chain-of-thought open weights model for complex debt covenants and stress testing.',
  },
  {
    id: 'deepseek/deepseek-chat:free',
    name: 'DeepSeek V3 (Chat)',
    provider: 'DeepSeek',
    isFree: true,
    contextWindow: '64k',
    badge: 'FREE • TOP BENCHMARK',
    description: 'Ultra-fast general intelligence rivaling closed frontier models.',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Meta Llama 3.3 70B',
    provider: 'Meta',
    isFree: true,
    contextWindow: '128k',
    badge: 'FREE • ROBUST',
    description: 'Industry standard open-weights foundation model for real estate and data extraction.',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'Alibaba',
    isFree: true,
    contextWindow: '128k',
    badge: 'FREE • MULTILINGUAL',
    description: 'Elite mathematics and code synthesis capability with 128k context.',
  },
  {
    id: 'built-in-gemini',
    name: 'PencilSTR Native Edge AI',
    provider: 'PencilSTR / Google',
    isFree: true,
    contextWindow: '1M tokens',
    badge: 'BUILT-IN ZERO SETUP',
    description: 'Default server-side engine running without requiring your own OpenRouter key.',
  },
];
