export type AgentStatus = 'idle' | 'working' | 'collaborating' | 'completed';

export interface AgentPencil {
  id: string;
  name: string;
  callsign: string;
  role: string;
  description: string;
  avatarColor: string;
  isLead: boolean;
  status: AgentStatus;
  currentTask?: string;
  model: string;
  tasksCompleted: number;
  createdAt: string;
  isCustom?: boolean;
  systemPrompt: string;
  memoryContext?: string[];
  artifactsAuthored?: number;
  petType?: string;
}

// Scribe is the brand-native term for PencilSTR autonomous agents
export type PencilScribe = AgentPencil;
export type AgentDot = AgentPencil; // backwards compatibility

export interface AgentMeshMessage {
  id: string;
  senderId: string; // 'user' or agent id
  senderName: string;
  senderRole?: string;
  senderColor?: string;
  targetAgentId?: string; // agent id or 'all'
  targetAgentName?: string;
  content: string;
  timestamp: string;
  type: 'directive' | 'delegation' | 'finding' | 'spawn' | 'synthesis' | 'chat';
  spawnedAgent?: AgentPencil;
  metrics?: Record<string, string | number>;
  artifactCreatedId?: string;
  artifactCreatedTitle?: string;
}
