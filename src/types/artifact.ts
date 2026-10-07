export type ArtifactType = 'document' | 'spreadsheet' | 'html' | 'audit_memo';

export interface SpreadsheetRow {
  id: string;
  category: string;
  item: string;
  frequency: string;
  monthly: number;
  annual: number;
  notes?: string;
}

export interface ProjectArtifact {
  id: string;
  title: string;
  type: ArtifactType;
  dealId?: string;
  dealTitle?: string;
  authorAgentId: string;
  authorAgentName: string;
  authorAgentColor: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  // Content based on type:
  // - document / audit_memo: markdown string
  // - html: raw HTML/JS/CSS code string
  // - spreadsheet: JSON serialized table or CSV string
  content: string;
  spreadsheetData?: {
    columns: string[];
    rows: SpreadsheetRow[];
    summaryMetric?: { label: string; value: string };
  };
  tags: string[];
  isPinned?: boolean;
}
