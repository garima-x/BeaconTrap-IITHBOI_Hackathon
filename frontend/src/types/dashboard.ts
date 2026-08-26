export interface SocMetrics {
  totalCases: number;
  criticalThreats: number;
  highRiskApks: number;
  avgRisk: number;
  citizenExposure: "Low" | "Medium" | "High";
  activeCampaign: string;
  activeCampaignConfidence: number;
  iocCount: number;
  mitreTechniqueCount: number;
}

export interface MitreHeatmapCell {
  tactic: string;
  techniqueId: string;
  techniqueName: string;
  count: number;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
}

export interface ThreatFamilyStat {
  name: string;
  count: number;
  avgRisk: number;
  trend: "up" | "down" | "stable";
}

export interface IocIntelRow {
  id: string;
  type: string;
  value: string;
  severity: string;
  confidence: number;
  caseId: string;
  fileName: string;
  threatFamily: string;
  firstSeen: string;
}

export interface CampaignActivity {
  id: string;
  label: string;
  threatFamily: string;
  caseCount: number;
  avgRisk: number;
  sharedInfrastructure: string[];
  status: "active" | "contained" | "monitoring";
  lastSeen: string;
}

export interface RiskTrendPoint {
  date: string;
  score: number;
  file: string;
  caseId: string;
}

export interface CorrelationFlowNode {
  id: string;
  type: "apk" | "domain" | "ip" | "family" | "mitre" | "campaign";
  label: string;
  sublabel?: string;
  risk: number;
}

export interface CorrelationFlowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface SocDashboardPayload {
  metrics: SocMetrics;
  mitreHeatmap: MitreHeatmapCell[];
  threatFamilies: ThreatFamilyStat[];
  riskTrend: RiskTrendPoint[];
  iocIntel: IocIntelRow[];
  campaigns: CampaignActivity[];
  correlationGraph: {
    nodes: CorrelationFlowNode[];
    edges: CorrelationFlowEdge[];
  };
}
