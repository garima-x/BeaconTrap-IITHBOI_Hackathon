export type CopilotMessageRole = "user" | "assistant" | "system";

export interface CopilotMessage {
  id: string;
  role: CopilotMessageRole;
  content: string;
  timestamp: string;
}

export type CopilotAction =
  | "explain_risk"
  | "explain_mitre"
  | "explain_iocs"
  | "executive_summary"
  | "analyst_summary"
  | "mitigation"
  | "summarize_case"
  | "generate_mitre"
  | "recommend_countermeasures";


export interface CopilotCaseContext {
  caseId: string | null;
  fileName?: string;
  packageName?: string;
  threatFamily?: string;
  riskScore?: number;
  permissionScore?: number;
  iocScore?: number;
  keywordScore?: number;
  aiConfidence?: number;
  mitreTags?: { id: string; name: string }[];
  iocs?: { type: string; value: string; severity: string }[];
  permissions?: string[];
  threatNarrative?: Record<string, string>;
  page: "dashboard" | "upload" | "case" | "other";
}

export interface CopilotChatRequest {
  message: string;
  history: CopilotMessage[];
  context: CopilotCaseContext;
  action?: CopilotAction;
}

export interface CopilotChatResponse {
  reply: string;
  suggestedPrompts: string[];
  usedGemini: boolean;
}
