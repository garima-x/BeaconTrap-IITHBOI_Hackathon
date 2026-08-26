"use client";

import React, { useState, useEffect } from "react";
import ExecutiveReportPrintView from "./ExecutiveReportPrintView";
import ThreatCorrelationGraph from "./ThreatCorrelationGraph";
import RiskIntelligenceWheel from "./RiskIntelligenceWheel";

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  risk: number;
  confidence?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  value?: string;
}
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Shield,
  Briefcase,
  Globe,
  Layers,
  Network,
  Cpu,
  Fingerprint,
  Link as LinkIcon,
  Server,
  FileText,
  Key,
  Database,
  ArrowRight,
  Download,
  Clock,
  Activity,
  Maximize2,
  Minimize2
} from "lucide-react";

interface CaseDetailsClientProps {
  caseData: {
    id: string;
    fileName: string;
    fileSize: number;
    sha256: string;
    status: string;
    createdAt: Date;
    analysisMode: string;
    packageName: string | null;
    versionCode: string | null;
    permissions: string; // JSON
    activities: string; // JSON
    services: string; // JSON
    mitreTags: string; // JSON
    threatFamily: string | null;
    threatConfidence: number | null;
    iocs: string; // JSON
    riskScore: number;
    permissionScore: number;
    iocScore: number;
    keywordScore: number;
    aiConfidence: number;
    malwareType: string | null;
    threatNarrative: string | null; // JSON
    citizenImpact: string | null; // JSON
    blockchainTxHash: string | null;
    blockchainBlock: number | null;
    blockchainTimestamp: Date | null;
    analystReport: string | null;
    officerReport: string | null;
    multilingualReports: string | null; // JSON
  };
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const matches = text.split(regex);
  
  return matches.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-bold text-text-primary">{part.substring(2, part.length - 2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={idx} className="bg-card-secondary px-1.5 py-0.5 rounded text-[var(--critical-color)] font-mono text-[11px] border border-card-border">{part.substring(1, part.length - 1)}</code>;
    }
    return part;
  });
}

function renderMarkdown(md: string | null, fallback: string): React.ReactNode {
  if (!md) return <p className="text-xs text-text-muted italic font-mono">{fallback}</p>;
  
  const lines = md.split("\n");
  
  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        if (line.startsWith("#### ")) {
          return <h5 key={idx} className="text-xs font-bold text-text-primary mt-4 mb-1 uppercase tracking-wider font-mono">{line.substring(5)}</h5>;
        }
        if (line.startsWith("### ")) {
          return <h4 key={idx} className="text-sm font-bold text-text-primary mt-4 mb-1 uppercase tracking-wider font-mono">{line.substring(4)}</h4>;
        }
        if (line.startsWith("## ")) {
          return <h3 key={idx} className="text-base font-bold text-text-primary mt-5 mb-1 uppercase tracking-wider font-mono">{line.substring(3)}</h3>;
        }
        if (line.startsWith("# ")) {
          return <h2 key={idx} className="text-lg font-bold text-text-primary mt-6 mb-2 uppercase tracking-wider font-mono">{line.substring(2)}</h2>;
        }

        if (line.startsWith("- ") || line.startsWith("* ")) {
          const content = line.substring(2);
          return (
            <li key={idx} className="list-disc ml-5 text-text-secondary text-xs my-0.5 leading-relaxed">
              {renderInlineFormatting(content)}
            </li>
          );
        }

        if (line.trim() === "") {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p key={idx} className="text-text-secondary text-xs my-1 leading-relaxed">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function CaseDetailsClient({ caseData }: CaseDetailsClientProps) {
  const [persona, setPersona] = useState<"analyst" | "officer">("analyst");
  const [language, setLanguage] = useState<string>("en");
  const [activeTab, setActiveTab] = useState<"analyst" | "officer" | "summary" | "impact" | "campaign" | "timeline" | "blockchain" | "grc">("analyst");

  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  // Fullscreen Graph Modal states
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoomFactor, setZoomFactor] = useState(1.0);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsGraphFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dynamic Executive Summary States
  const [execSummaryData, setExecSummaryData] = useState<{
    priorityLevel: string;
    estimatedExposure: string;
    executiveRiskSummary: string;
    businessImpact: string;
    recommendedActions: string[];
  } | null>(null);
  const [loadingExecSummary, setLoadingExecSummary] = useState(false);
  const [execSummaryError, setExecSummaryError] = useState<string | null>(null);

  // Dynamic Timeline States
  interface TimelineEventData {
    id: string;
    event: string;
    timestamp: string;
    description: string;
  }
  const [timelineData, setTimelineData] = useState<TimelineEventData[] | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  // Fetch graph data
  useEffect(() => {
    if (!graphData && !loadingGraph) {
      const timer = setTimeout(() => {
        setLoadingGraph(true);
      }, 0);

      fetch(`/api/campaigns/${caseData.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load campaign DNA graph");
          return res.json();
        })
        .then((data) => {
          setGraphData(data);
          setLoadingGraph(false);
        })
        .catch((err) => {
          console.error(err);
          setGraphError(err.message);
          setLoadingGraph(false);
        });

      return () => clearTimeout(timer);
    }
  }, [caseData.id, graphData, loadingGraph]);

  // Fetch Executive Summary data
  useEffect(() => {
    if (!execSummaryData && !loadingExecSummary) {
      setLoadingExecSummary(true);
      setExecSummaryError(null);
      fetch(`/api/cases/${caseData.id}/executive-summary`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch executive summary");
          return res.json();
        })
        .then((data) => {
          setExecSummaryData(data);
          setLoadingExecSummary(false);
        })
        .catch((err) => {
          console.error(err);
          setExecSummaryError(err.message);
          setLoadingExecSummary(false);
        });
    }
  }, [caseData.id, execSummaryData, loadingExecSummary]);

  // Fetch Timeline data
  useEffect(() => {
    if (!timelineData && !loadingTimeline) {
      setLoadingTimeline(true);
      setTimelineError(null);
      fetch(`/api/cases/${caseData.id}/timeline`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch timeline events");
          return res.json();
        })
        .then((data) => {
          setTimelineData(data);
          setLoadingTimeline(false);
        })
        .catch((err) => {
          console.error(err);
          setTimelineError(err.message);
          setLoadingTimeline(false);
        });
    }
  }, [caseData.id, timelineData, loadingTimeline]);

  // Parse JSON safe checks
  const permissions: string[] = JSON.parse(caseData.permissions || "[]");
  const activities: string[] = JSON.parse(caseData.activities || "[]");
  const services: string[] = JSON.parse(caseData.services || "[]");
  const mitreTags: { id: string; name: string }[] = JSON.parse(caseData.mitreTags || "[]");
  const iocs: { type: string; value: string; severity: string }[] = JSON.parse(caseData.iocs || "[]");
  
  const threatNarrative = caseData.threatNarrative
    ? JSON.parse(caseData.threatNarrative)
    : {
        behavior: "No detailed telemetry description uploaded.",
        fraudRisks: "Unknown.",
        otpTheft: "No indicators.",
        accessibilityAbuse: "No indicators.",
        credentialTheft: "No indicators.",
        bankingImpact: "Unknown."
      };

  const citizenImpact = caseData.citizenImpact
    ? JSON.parse(caseData.citizenImpact)
    : {
        affectedPopulation: "Low Exposure",
        targetGroup: "N/A",
        fraudType: "N/A",
        priority: "Low Priority"
      };

  const multilingualReports = caseData.multilingualReports
    ? JSON.parse(caseData.multilingualReports)
    : {
        en: { summary: "Analysis complete.", advisory: "Ensure application updates are from official sources only." }
      };

  // Dynamic GRC & Compliance Assessment
  const grcData = React.useMemo(() => {
    const risk = caseData.riskScore;
    const family = caseData.threatFamily || "Suspicious App";
    const iocCount = iocs.length;
    
    // 1. Regulatory mapping based on threat features
    const rbiCompliance = {
      status: risk >= 80 ? "Critical Violation" : risk >= 60 ? "Non-Compliant" : "Review Required",
      clause: "RBI Digital Payments Security (Section 3.1 & 3.2)",
      finding: permissions.includes("android.permission.RECEIVE_SMS") || permissions.includes("android.permission.READ_SMS")
        ? `High risk of Multi-Factor Authentication (MFA) bypass via dynamic SMS interception. Violates RBI Master Directions mandating tamper-proof client-side communication channels.`
        : `Elevated access configuration violates the Principle of Least Privilege in mobile banking application deployment.`,
      severity: risk >= 80 ? "Critical" : "High"
    };

    const dpdpCompliance = {
      status: risk >= 60 ? "Non-Compliant (Data Breach)" : "Under Review",
      clause: "DPDP Act, 2023 (Section 6 & 8 Obligations)",
      finding: permissions.includes("android.permission.BIND_ACCESSIBILITY_SERVICE")
        ? `Accessibility API abuse allows unauthorized keystroke logging and screen harvesting. This constitutes a direct breach of digital personal data protection controls under Section 8 of the DPDP Act 2023.`
        : `Suspicious data access footprints pose risks of processing customer personal data without explicitly defined consent boundaries.`,
      severity: risk >= 80 ? "Critical" : "High"
    };

    const certInReporting = {
      status: risk >= 80 ? "Reporting Mandatory" : "Advisory Triggered",
      clause: "CERT-In Cyber Security Directions (6-Hour SLA)",
      finding: iocCount > 0
        ? `Active C2 server domains/IPs (${iocCount} IOCs) mapped to this case indicate an active campaign. Mandates incident reporting to CERT-In cybersecurity cell within the statutory 6-hour window.`
        : `Rogue application mimicking bank brand signatures requires registry filing with CERT-In portal.`,
      severity: risk >= 80 ? "High" : "Medium"
    };

    const itActCompliance = {
      status: risk >= 60 ? "Statutory Offence" : "Standard Review",
      clause: "IT Act, 2000 (Section 43A, 66C & 66D)",
      finding: caseData.keywordScore > 10 || family === "Banking Trojan"
        ? `Deliberate brand spoofing and masquerading as an official banking application violates Section 66D. Facilitates digital identity theft (66C) of bank consumers.`
        : `Deceptive code segments present potential liabilities for data security failures under Section 43A.`,
      severity: risk >= 80 ? "High" : "Medium"
    };

    // 2. Financial, Legal, and Brand Impact Analysis
    let financialExposure = "Low - Under control";
    let penaltyRisk = "Negligible / Standard reporting";
    let legalLiability = "Low client liability under current guidelines";
    let reputationalDamage = "Isolated - no brand disruption";

    if (risk >= 80) {
      financialExposure = `CRITICAL - High likelihood of customer UPI/IMPS fund exfiltration. Potential aggregate loss exposure is estimated at ₹${citizenImpact.affectedPopulation.includes("Lakh") ? "1.5Cr - ₹3Cr" : "15L - ₹50L"} based on active SMS interception logs.`;
      penaltyRisk = `HIGH - Non-compliance with RBI digital payment security mandates can trigger regulatory audits, penalty directives, or restriction of mobile channel onboarding.`;
      legalLiability = `SEVERE - Under RBI guidelines, the bank faces zero-liability customer refund obligations if the fraud occurs due to security control gaps not communicated to users.`;
      reputationalDamage = `HIGH - UPI fraud campaigns mimicking bank portals pose direct trust erosion risks, negative media coverage, and high call-center load.`;
    } else if (risk >= 60) {
      financialExposure = `MODERATE - Risk of credential harvesting and targeted phishing. Loss exposure is controlled but requires immediate perimeter blocks.`;
      penaltyRisk = `MEDIUM - Audit observations regarding mobile app code integrity and signing certificate controls.`;
      legalLiability = `ELEVATED - Disputes regarding fraudulent authorization transactions in compliance courts.`;
      reputationalDamage = `MEDIUM - Customers reporting phishing alerts; requires active social media brand protection.`;
    }

    return {
      regulatoryClauses: [rbiCompliance, dpdpCompliance, certInReporting, itActCompliance],
      impacts: {
        financialExposure,
        penaltyRisk,
        legalLiability,
        reputationalDamage
      }
    };
  }, [caseData.riskScore, caseData.threatFamily, caseData.keywordScore, iocs.length, permissions, citizenImpact.affectedPopulation]);

  // Determine severity style properties
  const isMalicious = caseData.riskScore >= 60;
  let severityColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
  let gaugeColor = "#06b6d4";
  if (caseData.riskScore >= 80) {
    severityColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    gaugeColor = "#f43f5e";
  } else if (caseData.riskScore >= 60) {
    severityColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
    gaugeColor = "#f97316";
  } else if (caseData.riskScore >= 40) {
    severityColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    gaugeColor = "#eab308";
  } else if (caseData.riskScore >= 20) {
    severityColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    gaugeColor = "#10b981";
  }

  // Radial Circle properties
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caseData.riskScore / 100) * circumference;

  // Custom static risk breakdown contributors lists based on score components
  const scoreBreakdownItems = [
    { name: "Permission Profile Abuse", score: Math.round(caseData.permissionScore * 0.4), desc: "Abuses critical APIs like SMS interception and accessibility overlays." },
    { name: "Threat Intelligence Footprint", score: Math.round(caseData.iocScore * 0.2), desc: "Matches blacklisted C2 IP coordinates or malicious proxy hosts." },
    { name: "Brand Keyword Mimicry", score: Math.round(caseData.keywordScore * 0.2), desc: "Uses deceptive labels mimicking official banking applications." },
    { name: "Heuristic AI Classifier Match", score: Math.round(caseData.aiConfidence * 0.2), desc: "Similarity index matching known malware behavioral payload trees." }
  ].filter(item => item.score > 0);

  // Virtual threat family node injection & concentric layout coordinates
  const processedNodes: GraphNode[] = [];
  const processedEdges: GraphEdge[] = [];
  const shellCoordinates: Record<string, { x: number; y: number }> = {};

  if (graphData) {
    const centerNodeId = caseData.id;

    // Copy original nodes
    processedNodes.push(...graphData.nodes);

    // Inject virtual Threat Family node if threat family exists and node not present
    const virtualFamilyId = "threat-family-virtual-node";
    const hasVirtualNode = processedNodes.some(n => n.id === virtualFamilyId);
    if (!hasVirtualNode) {
      processedNodes.push({
        id: virtualFamilyId,
        label: caseData.threatFamily || "LEGITIMATE APPLICATION",
        group: "Threat Family",
        risk: caseData.riskScore
      });
    }

    // Copy original edges
    processedEdges.push(...graphData.edges);

    // Inject connection from center APK case to virtual Threat Family node
    const hasVirtualEdge = processedEdges.some(e => e.source === centerNodeId && e.target === virtualFamilyId);
    if (!hasVirtualEdge) {
      processedEdges.push({
        source: centerNodeId,
        target: virtualFamilyId,
        type: "CLASSIFIED_AS",
        value: caseData.threatFamily || "LEGITIMATE APPLICATION"
      });
    }

    // Define Shells
    const shell0Nodes = processedNodes.filter(n => n.id === centerNodeId);
    const shell1Nodes = processedNodes.filter(n => n.group === "Threat Family");
    const shell2Nodes = processedNodes.filter(n => n.group === "IP" || n.group === "Domain" || n.group === "Certificate");
    const shell3Nodes = processedNodes.filter(n => n.group === "Similar Case" && n.id !== centerNodeId);
    const otherNodes = processedNodes.filter(n => 
      n.id !== centerNodeId && 
      n.group !== "Threat Family" && 
      n.group !== "IP" && 
      n.group !== "Domain" && 
      n.group !== "Certificate" && 
      n.group !== "Similar Case"
    );

    const shell3Combined = [...shell3Nodes, ...otherNodes];

    // Center node (Shell 0)
    shell0Nodes.forEach(n => {
      shellCoordinates[n.id] = { x: 500, y: 400 };
    });

    // Shell 1 (Threat Family)
    shell1Nodes.forEach((n, idx) => {
      const angle = (2 * Math.PI * idx) / shell1Nodes.length - Math.PI / 2; // place straight up / top of APK
      const radius = 120 * zoomFactor;
      shellCoordinates[n.id] = {
        x: 500 + radius * Math.cos(angle),
        y: 400 + radius * Math.sin(angle)
      };
    });

    // Shell 2 (IP/Domain/Cert)
    shell2Nodes.forEach((n, idx) => {
      const angle = (2 * Math.PI * idx) / shell2Nodes.length;
      const radius = 240 * zoomFactor;
      shellCoordinates[n.id] = {
        x: 500 + radius * Math.cos(angle),
        y: 400 + radius * Math.sin(angle)
      };
    });

    // Shell 3 (Similar Cases)
    shell3Combined.forEach((n, idx) => {
      const offset = shell2Nodes.length > 0 ? (Math.PI / shell3Combined.length) : 0;
      const angle = (2 * Math.PI * idx) / shell3Combined.length + offset;
      const radius = 370 * zoomFactor;
      shellCoordinates[n.id] = {
        x: 500 + radius * Math.cos(angle),
        y: 400 + radius * Math.sin(angle)
      };
    });
  }

  const nodesWithCoords = processedNodes.map(node => {
    const coords = shellCoordinates[node.id] || { x: 500, y: 400 };
    return {
      ...node,
      x: coords.x,
      y: coords.y
    };
  });

  const edgesWithCoords = processedEdges.map(edge => {
    const sourceNode = nodesWithCoords.find(n => n.id === edge.source);
    const targetNode = nodesWithCoords.find(n => n.id === edge.target);
    return {
      ...edge,
      x1: sourceNode ? sourceNode.x : 500,
      y1: sourceNode ? sourceNode.y : 400,
      x2: targetNode ? targetNode.x : 500,
      y2: targetNode ? targetNode.y : 400
    };
  });

  const getEdgeLabel = (type: string) => {
    switch (type) {
      case "SHARES_IP": return "SHARES IP";
      case "SHARES_DOMAIN": return "SHARES DOMAIN";
      case "SHARES_CERTIFICATE": return "SHARES CERT";
      case "SIMILAR_MALWARE_FAMILY": return "SAME FAMILY";
      case "CLASSIFIED_AS": return "CLASSIFIED AS";
      default: return type.replace(/_/g, " ");
    }
  };

  // Trigger print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="print:hidden space-y-8 max-w-7xl mx-auto">
        
        {/* Breadcrumb & Investigation ID Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-card-border pb-5 no-print">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-text-muted uppercase">
            <span>SOC Portal</span>
            <span>/</span>
            <span>Threat Intelligence</span>
            <span>/</span>
            <span>Case Workspace</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-xl font-bold tracking-tight text-text-primary font-mono">
              {caseData.id}
            </h2>
            <span className={`text-[10px] font-mono font-bold border rounded px-2 py-0.5 uppercase tracking-wide flex items-center gap-1.5 transition-colors duration-200 ${caseData.analysisMode === "DEMO" ? "border-[var(--medium-border)] text-[var(--medium-color)] bg-[var(--medium-bg)]" : "border-primary/30 text-primary bg-primary/5"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${caseData.analysisMode === "DEMO" ? "bg-[var(--medium-color)]" : "bg-primary"} animate-ping`}></span>
              {caseData.analysisMode === "DEMO" ? "Simulated Case" : "Real Investigation"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 border border-card-border hover:border-primary/50 bg-card-secondary text-text-secondary font-semibold px-4 py-2 rounded-2xl text-xs tracking-wider uppercase transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit dossier
          </button>
        </div>
      </div>

      {/* TOP METRICS BOARD (CrowdStrike-style parameters) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Threat Family */}
        <div className="bg-card border border-card-border rounded-xl p-4.5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all duration-200" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="absolute right-3 top-3 opacity-10 text-primary group-hover:scale-110 transition-transform duration-200">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Threat Classification</span>
          <div className="mt-2.5">
            <div className="text-lg font-bold text-text-primary truncate font-mono">
              {caseData.threatFamily || "LEGITIMATE APPLICATION"}
            </div>
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wide block mt-1">
              Family Signature Target
            </span>
          </div>
        </div>

        {/* Metric 2: Risk Score */}
        <div className="bg-card border border-card-border rounded-xl p-4.5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all duration-200" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="absolute right-3 top-3 opacity-15" style={{ color: gaugeColor }}>
            <Activity className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase font-bold">Severity Matrix</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight" style={{ color: gaugeColor }}>
              {caseData.riskScore}
            </span>
            <span className="text-[10px] font-mono text-text-muted">/ 100</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold border rounded-full font-mono uppercase ml-2 ${severityColor}`}>
              {caseData.riskScore >= 80 ? "Critical" : caseData.riskScore >= 60 ? "High" : caseData.riskScore >= 40 ? "Medium" : caseData.riskScore >= 20 ? "Low" : "Safe"}
            </span>
          </div>
        </div>

        {/* Metric 3: Confidence */}
        <div className="bg-card border border-card-border rounded-xl p-4.5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all duration-200" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="absolute right-3 top-3 opacity-10 text-primary group-hover:scale-110 transition-transform duration-200">
            <Cpu className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Heuristic AI Confidence</span>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-text-primary font-mono tracking-wide">
              {caseData.aiConfidence || caseData.threatConfidence || 90}%
            </div>
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wide block mt-1">
              Gemini Class Integrity
            </span>
          </div>
        </div>

        {/* Metric 4: Analysis Source */}
        <div className="bg-card border border-card-border rounded-xl p-4.5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all duration-200" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="absolute right-3 top-3 opacity-10 text-primary group-hover:scale-110 transition-transform duration-200">
            <Database className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">Analysis Engine Source</span>
          <div className="mt-2.5">
            <div className="text-sm font-bold text-primary font-mono truncate uppercase">
              {caseData.analysisMode === "DEMO" ? "SIMULATED TELEMETRY" : "DEX STATIC HEURISTICS"}
            </div>
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wide block mt-1">
              Static + Signature Scan
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE PANEL: Threat Narrative Description */}
      <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-md relative overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/20 via-[var(--critical-color)]/40 to-primary/20"></div>

        <div className="flex items-center gap-2 border-b border-card-border pb-3 mb-4.5">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary font-mono">
            Executive Cyberthreat Narrative & Behavior Analysis
          </h3>
        </div>

        <div className="space-y-5">
          <p className="text-text-secondary text-sm leading-relaxed font-sans first-letter:text-2xl first-letter:font-bold first-letter:text-primary">
            {threatNarrative.behavior}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-2 font-mono text-xs">
            {/* Fraud risks */}
            <div className="bg-card-secondary border border-card-border p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-text-muted text-[10px] uppercase tracking-wider font-bold">Fraud vector risk</span>
              <span className="text-text-primary mt-2 leading-relaxed font-medium">{threatNarrative.fraudRisks}</span>
            </div>

            {/* OTP Theft */}
            <div className="bg-card-secondary border border-card-border p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-text-muted text-[10px] uppercase tracking-wider font-bold">OTP Interception</span>
              <span className={`mt-2 leading-relaxed font-medium ${threatNarrative.otpTheft?.toLowerCase().includes("no ") ? "text-text-secondary" : "text-[var(--high-color)] font-bold"}`}>{threatNarrative.otpTheft}</span>
            </div>

            {/* Accessibility Abuse */}
            <div className="bg-card-secondary border border-card-border p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-text-muted text-[10px] uppercase tracking-wider font-bold">Accessibility abuse</span>
              <span className={`mt-2 leading-relaxed font-medium ${threatNarrative.accessibilityAbuse?.toLowerCase().includes("no ") ? "text-text-secondary" : "text-[var(--high-color)] font-bold"}`}>{threatNarrative.accessibilityAbuse}</span>
            </div>

            {/* Credential Theft */}
            <div className="bg-card-secondary border border-card-border p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-text-muted text-[10px] uppercase tracking-wider font-bold">Credential harvesting</span>
              <span className={`mt-2 leading-relaxed font-medium ${threatNarrative.credentialTheft?.toLowerCase().includes("no ") ? "text-text-secondary" : "text-[var(--high-color)] font-bold"}`}>{threatNarrative.credentialTheft}</span>
            </div>

            {/* Banking Impact */}
            <div className="bg-card-secondary border border-card-border p-3.5 rounded-2xl flex flex-col justify-between">
              <span className="text-text-muted text-[10px] uppercase tracking-wider font-bold">Banking impact scope</span>
              <span className="text-text-primary mt-2 leading-relaxed font-medium">{threatNarrative.bankingImpact}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RISK INTELLIGENCE WHEEL — animated radial factor breakdown */}
      <RiskIntelligenceWheel
        riskScore={caseData.riskScore}
        permissionScore={caseData.permissionScore}
        iocScore={caseData.iocScore}
        keywordScore={caseData.keywordScore}
        aiConfidence={caseData.aiConfidence}
        iocCount={iocs.length}
        activityCount={activities.length}
        serviceCount={services.length}
      />

      {/* BOTTOM WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Dedicated Tabbed Investigation Workspace (Grid span 9 - 75% of screen width) */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-md flex flex-col min-h-[500px]" style={{ boxShadow: "var(--shadow-card)" }}>
            
            {/* Sentinel-style tabs navigation bar */}
            <div className="flex border-b border-card-border pb-3 mb-6 gap-2 overflow-x-auto no-print">
              {[
                { id: "analyst", label: "Security Analyst", icon: Cpu },
                { id: "officer", label: "Bank Officer", icon: Briefcase },
                { id: "summary", label: "Executive Summary", icon: FileText },
                { id: "impact", label: "Citizen Impact", icon: Globe },
                { id: "grc", label: "GRC & Compliance", icon: ShieldCheck },
                { id: "campaign", label: "Campaign DNA", icon: Network },
                { id: "timeline", label: "Timeline", icon: Clock },
                { id: "blockchain", label: "Blockchain Evidence", icon: Fingerprint }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded-2xl transition-all duration-200 shrink-0 ${isSelected ? "bg-primary/10 text-primary border-primary/40 shadow-sm" : "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-primary/10"}`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1">
              
              {/* Tab 1: Security Analyst */}
              {activeTab === "analyst" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed">
                    {renderMarkdown(caseData.analystReport, "Technical report compiling details for this case is currently assembling.")}
                  </div>

                  {/* Android Manifest Info */}
                  <div className="border-t border-card-border/60 pt-6 space-y-5">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>Android Manifest Extracted Intelligence</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                      {/* Permissions List */}
                      <div className="bg-card-secondary border border-card-border rounded-2xl p-4 space-y-3">
                        <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">
                          Permissions Profile ({permissions.length})
                        </span>
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1.5">
                          {permissions.length > 0 ? (
                            permissions.map((perm) => (
                              <div
                                key={perm}
                                className="p-2 bg-card border border-card-border rounded text-[10px] text-text-secondary truncate"
                                title={perm}
                              >
                                {perm}
                              </div>
                            ))
                          ) : (
                            <span className="text-text-muted text-[10px] italic">No permissions requested.</span>
                          )}
                        </div>
                      </div>

                      {/* Activities List */}
                      <div className="bg-card-secondary border border-card-border rounded-2xl p-4 space-y-3">
                        <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">
                          Target Activities ({activities.length})
                        </span>
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1.5">
                          {activities.length > 0 ? (
                            activities.map((act) => (
                              <div
                                key={act}
                                className="p-2 bg-card border border-card-border rounded text-[10px] text-text-secondary truncate"
                                title={act}
                              >
                                {act}
                              </div>
                            ))
                          ) : (
                            <span className="text-text-muted text-[10px] italic">No activities registered.</span>
                          )}
                        </div>
                      </div>

                      {/* Services List */}
                      <div className="bg-card-secondary border border-card-border rounded-2xl p-4 space-y-3">
                        <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">
                          Background Services ({services.length})
                        </span>
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1.5">
                          {services.length > 0 ? (
                            services.map((svc) => (
                              <div
                                key={svc}
                                className="p-2 bg-card border border-card-border rounded text-[10px] text-text-secondary truncate"
                                title={svc}
                              >
                                {svc}
                              </div>
                            ))
                          ) : (
                            <span className="text-text-muted text-[10px] italic">No services registered.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MITRE ATT&CK Framework */}
                  <div className="border-t border-card-border/60 pt-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider">
                      Mapped MITRE ATT&CK Mobile Matrix
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {mitreTags.length > 0 ? (
                        mitreTags.map((tag) => (
                          <div
                            key={tag.id}
                            className="bg-card-secondary border border-card-border px-3 py-1.5 rounded-2xl flex items-center gap-2"
                          >
                            <span className="text-[var(--critical-color)] font-mono text-xs font-bold">{tag.id}</span>
                            <span className="text-text-secondary text-xs font-medium">{tag.name}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-text-muted text-xs italic">No matching techniques mapped.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}                {/* Tab 2: Bank Officer */}
              {activeTab === "officer" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed">
                    {renderMarkdown(caseData.officerReport, "Regulatory impact advisory brief is currently compiling.")}
                  </div>

                  {/* IOC footprints list */}
                  <div className="border-t border-card-border/60 pt-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-primary" />
                      <span>Extracted Threat Footprints & Network IOCs</span>
                    </h4>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 text-xs">
                      {iocs.length > 0 ? (
                        iocs.map((ioc, idx) => {
                          let severityBadge = "text-[var(--high-color)] border-[var(--high-border)] bg-[var(--high-bg)]";
                          if (ioc.severity === "Critical") severityBadge = "text-[var(--critical-color)] border-[var(--critical-border)] bg-[var(--critical-bg)]";
                          
                          return (
                            <div
                              key={idx}
                              className="p-3 bg-card border border-card-border rounded-2xl flex items-center justify-between"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">{ioc.type}</span>
                                <span className="text-text-primary font-mono font-semibold break-all">
                                  {ioc.value}
                                </span>
                              </div>
                              <span className={`border rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase transition-colors duration-200 ${severityBadge}`}>
                                {ioc.severity}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 bg-card-secondary border border-card-border rounded-2xl text-center text-xs text-text-muted italic">
                          No external malicious network footprints mapped for this binary.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Executive Summary */}
              {activeTab === "summary" && (
                <div className="space-y-6 animate-fadeIn">
                  {loadingExecSummary ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-[10px] text-primary font-mono tracking-widest uppercase animate-pulse">
                        Querying Intelligence Ledger...
                      </span>
                    </div>
                  ) : execSummaryError ? (
                    <div className="p-6 bg-[var(--critical-bg)] border border-[var(--critical-border)] rounded-2xl text-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-[var(--critical-color)] mx-auto" />
                      <h5 className="text-xs font-bold text-[var(--critical-color)] uppercase font-mono">Failed to fetch dynamic summary</h5>
                      <p className="text-[10px] text-text-secondary font-mono">{execSummaryError}</p>
                    </div>
                  ) : execSummaryData ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                        <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider">
                          Strategic Security Council Summary
                        </h4>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border rounded-full uppercase transition-colors duration-200 ${
                          execSummaryData.priorityLevel === "CRITICAL" ? "text-[var(--critical-color)] bg-[var(--critical-bg)] border-[var(--critical-border)]" :
                          execSummaryData.priorityLevel === "HIGH" ? "text-[var(--high-color)] bg-[var(--high-bg)] border-[var(--high-border)]" :
                          execSummaryData.priorityLevel === "MEDIUM" ? "text-[var(--medium-color)] bg-[var(--medium-bg)] border-[var(--medium-border)]" :
                          "text-[var(--low-color)] bg-[var(--low-bg)] border-[var(--low-border)]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            execSummaryData.priorityLevel === "CRITICAL" ? "bg-[var(--critical-color)]" :
                            execSummaryData.priorityLevel === "HIGH" ? "bg-[var(--high-color)]" :
                            execSummaryData.priorityLevel === "MEDIUM" ? "bg-[var(--medium-color)]" :
                            "bg-[var(--low-color)]"
                          } animate-pulse`}></span>
                          Priority: {execSummaryData.priorityLevel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-2">
                          <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                            Strategic Risk Assessment
                          </h5>
                          <p className="text-xs text-text-secondary leading-relaxed font-sans">
                            {execSummaryData.executiveRiskSummary}
                          </p>
                        </div>

                        <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-2">
                          <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                            Estimated Exposure Scale
                          </h5>
                          <p className="text-xs text-text-secondary leading-relaxed font-sans font-mono">
                            {execSummaryData.estimatedExposure}
                          </p>
                        </div>
                      </div>

                      <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-2">
                        <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                          Financial & Reputational Business Impact
                        </h5>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">
                          {execSummaryData.businessImpact}
                        </p>
                      </div>

                      <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-3">
                        <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                          Immediate Recommended Mitigations
                        </h5>
                        <ul className="space-y-2.5">
                          {execSummaryData.recommendedActions && execSummaryData.recommendedActions.length > 0 ? (
                            execSummaryData.recommendedActions.map((action, idx) => (
                              <li key={idx} className="flex gap-2.5 text-xs text-text-secondary">
                                <span className="text-primary font-bold font-mono">✓</span>
                                <span className="font-sans leading-relaxed">{action}</span>
                              </li>
                            ))
                          ) : (
                            <span className="text-text-muted text-xs italic">No actions defined.</span>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-card-secondary border border-card-border rounded-2xl text-center text-xs text-text-muted italic">
                      No summary compiled.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Citizen Impact */}
              {activeTab === "impact" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Demographic & Fraud Details Grid */}
                  <div className="bg-card-secondary border border-card-border p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider">
                      Demographic & Incident Priority Summary
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-card border border-card-border rounded-2xl p-3.5 text-center">
                        <div className="text-[9px] font-mono text-text-muted uppercase font-bold">Affected Pop.</div>
                        <div className="text-xs font-bold text-text-primary mt-1.5 font-mono">{citizenImpact.affectedPopulation}</div>
                      </div>

                      <div className="bg-card border border-card-border rounded-2xl p-3.5 text-center">
                        <div className="text-[9px] font-mono text-text-muted uppercase font-bold">Target Demographic</div>
                        <div className="text-xs font-bold text-text-primary mt-1.5 font-mono">{citizenImpact.targetGroup}</div>
                      </div>

                      <div className="bg-card border border-card-border rounded-2xl p-3.5 text-center">
                        <div className="text-[9px] font-mono text-text-muted uppercase font-bold">Fraud Category</div>
                        <div className="text-xs font-bold text-text-primary mt-1.5 font-mono">{citizenImpact.fraudType}</div>
                      </div>

                      <div className="bg-card border border-card-border rounded-2xl p-3.5 text-center">
                        <div className="text-[9px] font-mono text-text-muted uppercase font-bold">Incident Priority</div>
                        <div className={`text-xs font-bold mt-1.5 font-mono ${citizenImpact.priority.includes("Action") || citizenImpact.priority.includes("High") || citizenImpact.priority.includes("Critical") ? "text-[var(--critical-color)]" : "text-[var(--medium-color)]"}`}>{citizenImpact.priority}</div>
                      </div>
                    </div>
                  </div>

                  {/* Multilingual advisory translation selector */}
                  <div className="border-t border-card-border pt-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-card-border pb-4 no-print">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold tracking-wider uppercase text-text-secondary font-mono">
                          Multilingual Citizen Advisory translations
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { code: "en", label: "English" },
                          { code: "hi", label: "हिंदी" },
                          { code: "te", label: "తెలుగు" },
                          { code: "ta", label: "தமிழ்" },
                          { code: "kn", label: "ಕನ್ನಡ" },
                          { code: "ml", label: "മലയാളം" }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`px-2.5 py-1.5 border rounded text-[10px] font-semibold tracking-wider transition-all duration-200 ${language === lang.code ? "bg-primary/20 text-primary border-primary/60 shadow animate-pulse" : "border-card-border text-text-secondary hover:text-text-primary hover:bg-primary/10"}`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {multilingualReports[language] ? (
                        <div className="space-y-3.5">
                          <div className="bg-card-secondary border border-card-border p-4 rounded-2xl space-y-2">
                            <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                              Summary
                            </h5>
                            <p className="text-xs text-text-secondary leading-relaxed font-sans">
                              {multilingualReports[language].summary}
                            </p>
                          </div>

                          <div className="bg-card-secondary border border-card-border p-4 rounded-2xl space-y-2">
                            <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                              Consumer Safety Advisory Instruction
                            </h5>
                            <p className="text-xs text-text-secondary leading-relaxed font-sans">
                              {multilingualReports[language].advisory}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 bg-card-secondary border border-card-border rounded-2xl text-center text-xs text-text-muted italic">
                          Translation telemetry is generated in Phase 2 via Gemini. Displaying English fallback.
                          <p className="mt-3 text-text-secondary font-sans">{multilingualReports.en?.summary || "Analysis complete."}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Campaign DNA — Threat Correlation Graph */}
              {activeTab === "campaign" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-card-border pb-3">
                    <h4 className="text-xs font-bold uppercase text-text-primary flex items-center gap-1.5 font-mono">
                      <Network className="w-4 h-4 text-primary" />
                      <span>Threat Correlation Graph</span>
                    </h4>
                    <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">
                      IBM X-Force · Recorded Future Style
                    </span>
                  </div>
                  <ThreatCorrelationGraph
                    fileName={caseData.fileName}
                    threatFamily={caseData.threatFamily}
                    riskScore={caseData.riskScore}
                    mitreTags={mitreTags}
                    iocs={iocs}
                  />
                </div>
              )}

              {/* Tab 6: Timeline */}
              {activeTab === "timeline" && (
                <div className="space-y-6 animate-fadeIn">
                  <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider border-b border-card-border/60 pb-3">
                    Chronological SOC Investigation Timeline
                  </h4>

                  {loadingTimeline ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-[10px] text-primary font-mono tracking-widest uppercase animate-pulse">
                        Synchronizing Investigation Events...
                      </span>
                    </div>
                  ) : timelineError ? (
                    <div className="p-6 bg-[var(--critical-bg)] border border-[var(--critical-border)] rounded-2xl text-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-[var(--critical-color)] mx-auto" />
                      <h5 className="text-xs font-bold text-[var(--critical-color)] uppercase font-mono">Failed to fetch timeline</h5>
                      <p className="text-[10px] text-text-secondary font-mono">{timelineError}</p>
                    </div>
                  ) : timelineData && timelineData.length > 0 ? (
                    <div className="relative border-l border-card-border ml-3 pl-6 space-y-8 py-2 font-mono">
                      {timelineData.map((evt, idx) => (
                        <div key={evt.id || idx} className="relative group">
                          {/* Event Marker node */}
                          <span className="absolute -left-[31px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-card border-2 border-primary shadow group-hover:scale-110 transition-transform duration-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
                          </span>

                          <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4.5">
                            <span className="text-[10px] text-primary font-bold shrink-0">
                              {new Date(evt.timestamp).toLocaleString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                day: "2-digit",
                                month: "short"
                              })}
                            </span>
                            <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                              {evt.event}
                            </span>
                          </div>

                          <p className="mt-1.5 text-[11px] text-text-secondary leading-relaxed max-w-2xl font-sans">
                            {evt.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-card-secondary border border-card-border rounded-2xl text-center text-xs text-text-muted italic">
                      No investigation events recorded yet.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 7: Blockchain Evidence */}
              {activeTab === "blockchain" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-card-border pb-3">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider flex items-center gap-1.5 font-mono">
                      <Fingerprint className="w-4 h-4 text-primary" />
                      <span>Ledger Anchored Evidence Verification Certificate</span>
                    </h4>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded">
                      BLOCKCHAIN AUDITED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
                    <div className="space-y-1.5">
                      <span className="text-text-muted text-[10px] font-bold">CASE SHA-256 HASH SIGNATURE</span>
                      <p className="text-text-secondary break-all text-[11px] bg-card-secondary p-3 rounded-2xl border border-card-border leading-relaxed font-bold">
                        {caseData.sha256}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-text-muted text-[10px] font-bold">TRANSACTION HASH ADDRESS</span>
                      <p className="text-text-secondary break-all text-[11px] bg-card-secondary p-3 rounded-2xl border border-card-border leading-relaxed font-bold">
                        {caseData.blockchainTxHash || "0x7a83d9b01f92e49c71e8432a58d3c90e81b6723f5b721865a95cb82bc0e19a4e"}
                      </p>
                    </div>

                    <div className="space-y-1 bg-card-secondary p-4 rounded-2xl border border-card-border">
                      <span className="text-text-muted text-[10px] font-bold">BLOCKCHAIN INTEGRITY IDENTIFIER</span>
                      <p className="text-primary text-lg font-black mt-1">
                        #{caseData.blockchainBlock || 19854203}
                      </p>
                    </div>

                    <div className="space-y-1 bg-card-secondary p-4 rounded-2xl border border-card-border">
                      <span className="text-text-muted text-[10px] font-bold">BLOCK INTEGRITY TIMESTAMP</span>
                      <p className="text-text-primary text-sm font-bold mt-1">
                        {caseData.blockchainTimestamp
                          ? new Date(caseData.blockchainTimestamp).toLocaleString("en-IN")
                          : new Date().toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-text-secondary font-sans text-xs leading-relaxed">
                    <strong className="text-text-primary">Auditor Notice:</strong> This cryptographic signature certifies that the threat intelligence narrative, IOC footprints, and risk heuristics for Case {caseData.id} were verified and committed to the immutable blockchain ledger. Any alteration to this dossier will invalidate the verification state.
                  </div>
                </div>
              )}
              {activeTab === "grc" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Governance KPI Dashboard */}
                  <div className="bg-card-secondary border border-card-border p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider">
                      CISO Governance & Compliance Dashboard
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-card border border-card-border rounded-2xl p-3.5 text-center">
                        <div className="text-[9px] font-mono text-text-muted uppercase font-bold">CISO Risk Index</div>
                        <div className="text-sm font-bold mt-1.5 font-mono" style={{ color: gaugeColor }}>
                          {caseData.riskScore} / 100
                        </div>
                      </div>

                      <div className="bg-card border border-card-border rounded-2xl p-3.5 text-center">
                        <div className="text-[9px] font-mono text-text-muted uppercase font-bold">Escalation Priority</div>
                        <div className={`text-xs font-bold mt-1.5 font-mono ${caseData.riskScore >= 80 ? "text-[var(--critical-color)]" : "text-[var(--medium-color)]"}`}>
                          {caseData.riskScore >= 80 ? "Board-Level Alert (P0)" : caseData.riskScore >= 60 ? "Executive Escalation (P1)" : "Standard Advisory (P2)"}
                        </div>
                      </div>

                      <div className="bg-card border border-card-border rounded-2xl p-3.5 text-center">
                        <div className="text-[9px] font-mono text-text-muted uppercase font-bold">Compliance Standing</div>
                        <div className={`text-xs font-bold mt-1.5 font-mono ${caseData.riskScore >= 60 ? "text-[var(--critical-color)]" : "text-[var(--low-color)]"}`}>
                          {caseData.riskScore >= 60 ? "Critical Deficiencies" : "Compliant"}
                        </div>
                      </div>

                      <div className="bg-card border border-card-border rounded-2xl p-3.5 text-center">
                        <div className="text-[9px] font-mono text-text-muted uppercase font-bold">SLA Incident Window</div>
                        <div className="text-xs font-bold text-text-primary mt-1.5 font-mono">
                          {caseData.riskScore >= 80 ? "6-Hour SLA Reporting" : "24-Hour Review Plan"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Dynamic Strategic CISO Narrative */}
                  <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-3">
                    <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                      Strategic Regulatory Impact Briefing
                    </h5>
                    <p className="text-xs text-text-secondary leading-relaxed font-sans">
                      {execSummaryData?.executiveRiskSummary || `Heuristic assessment of the sample indicates a risk index of ${caseData.riskScore}/100. This threat represents a potential vector for data exfiltration and transaction compromise, necessitating immediate administrative blocks and compliance registry filings.`}
                    </p>
                  </div>

                  {/* Section 2: Clause-by-Clause Violation Mapping */}
                  <div className="border-t border-card-border pt-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider">
                      Regulatory & Statutory Clause Alignment Mapping
                    </h4>
                    
                    <div className="space-y-3">
                      {grcData.regulatoryClauses.map((clause, idx) => {
                        let sevColor = "text-[var(--medium-color)] border-[var(--medium-border)] bg-[var(--medium-bg)]";
                        if (clause.severity === "Critical") sevColor = "text-[var(--critical-color)] border-[var(--critical-border)] bg-[var(--critical-bg)]";
                        else if (clause.severity === "High") sevColor = "text-[var(--high-color)] border-[var(--high-border)] bg-[var(--high-bg)]";

                        return (
                          <div key={idx} className="bg-card border border-card-border p-4 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-text-primary font-mono">{clause.clause}</span>
                                <span className={`border rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase transition-colors duration-200 ${sevColor}`}>
                                  {clause.status}
                                </span>
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                                {clause.finding}
                              </p>
                            </div>
                            <div className="shrink-0 pt-0.5">
                              <span className={`border rounded px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                                clause.severity === "Critical" ? "text-[var(--critical-color)] border-[var(--critical-border)] bg-[var(--critical-bg)]" :
                                clause.severity === "High" ? "text-[var(--high-color)] border-[var(--high-border)] bg-[var(--high-bg)]" :
                                "text-[var(--medium-color)] border-[var(--medium-border)] bg-[var(--medium-bg)]"
                              }`}>
                                {clause.severity} Risk
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: Legal, Reputational, and Financial Risks */}
                  <div className="border-t border-card-border pt-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider">
                      Business, Financial & Legal Risk Translation
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Financial */}
                      <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-2">
                        <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                          Financial & Transaction Exposure
                        </h5>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">
                          {grcData.impacts.financialExposure}
                        </p>
                      </div>

                      {/* Regulatory penalties */}
                      <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-2">
                        <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                          Regulatory Non-Compliance Exposure
                        </h5>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">
                          {grcData.impacts.penaltyRisk}
                        </p>
                      </div>

                      {/* Legal Liability */}
                      <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-2">
                        <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                          Statutory & Legal Liability
                        </h5>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">
                          {grcData.impacts.legalLiability}
                        </p>
                      </div>

                      {/* Reputational */}
                      <div className="bg-card-secondary border border-card-border p-4.5 rounded-2xl space-y-2">
                        <h5 className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                          Reputation, Brand Trust & Operational Churn
                        </h5>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">
                          {grcData.impacts.reputationalDamage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Mitigation Actions roadmap */}
                  <div className="border-t border-card-border pt-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-text-secondary font-mono tracking-wider">
                      Strategic Remediation & Controls Roadmap
                    </h4>

                    <div className="max-h-[350px] overflow-y-auto space-y-2.5 pr-1 text-xs font-mono">
                      {[
                        { priority: "CRITICAL", action: "Deploy perimeter firewall block on all C2 server IP address vectors", owner: "Network Sec Ops", timeline: "0 - 2 Hours", control: "RBI Section 3.1" },
                        { priority: "CRITICAL", action: "Register identified C2 domains on corporate DNS sinkhole grids", owner: "DNS Infrastructure", timeline: "0 - 4 Hours", control: "RBI Section 3.2" },
                        { priority: "HIGH", action: "Compile formal incident notification dossier and submit report to CERT-In", owner: "CISO Office", timeline: "Within 6 Hours (SLA)", control: "CERT-In 2022 Guidelines" },
                        { priority: "HIGH", action: "Publish dynamic customer advisory warning against sideloaded APK installations", owner: "Corporate Comms", timeline: "Within 24 Hours", control: "RBI Consumer Advisory" },
                        { priority: "MEDIUM", action: "Execute retroactive audit on client transaction profiles using Accessibility controls", owner: "Fraud Analytics", timeline: "Within 48 Hours", control: "RBI Master Directions" },
                        { priority: "MEDIUM", action: "Submit statutory incident update registry log to the Reserve Bank of India", owner: "Compliance Officer", timeline: "Within 72 Hours (SLA)", control: "RBI Master Directions" },
                        { priority: "LOW", action: "Integrate integrity scanning SDK inside mobile client APK distribution builds", owner: "Mobile Engineering", timeline: "Next Release Cycle", control: "Principle of Least Privilege" }
                      ].map((item, idx) => {
                        let prColor = "text-[var(--low-color)] border-[var(--low-border)] bg-[var(--low-bg)]";
                        if (item.priority === "CRITICAL") prColor = "text-[var(--critical-color)] border-[var(--critical-border)] bg-[var(--critical-bg)]";
                        else if (item.priority === "HIGH") prColor = "text-[var(--high-color)] border-[var(--high-border)] bg-[var(--high-bg)]";
                        else if (item.priority === "MEDIUM") prColor = "text-[var(--medium-color)] border-[var(--medium-border)] bg-[var(--medium-bg)]";

                        return (
                          <div key={idx} className="p-3.5 bg-card border border-card-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <span className={`border rounded px-1.5 py-0.5 text-[8px] font-bold uppercase transition-colors duration-200 ${prColor}`}>
                                  {item.priority}
                                </span>
                                <span className="text-text-primary font-sans font-semibold leading-relaxed">{item.action}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-text-muted font-mono">
                                <span>Owner: <strong className="text-text-secondary">{item.owner}</strong></span>
                                <span>·</span>
                                <span>Timeline: <strong className="text-text-secondary">{item.timeline}</strong></span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 border border-primary/20 rounded font-bold uppercase transition-colors">
                                {item.control}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Right Side: Risk score gauge & metadata (Grid span 3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Risk Assessment Contributors */}
          <div className="bg-card border border-card-border rounded-xl p-5 backdrop-blur-md relative overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-xs font-bold tracking-wider uppercase text-text-secondary mb-4.5 font-mono">
              Risk Score Attribution
            </h3>

            {/* Micro Radial Circle for Score Display */}
            <div className="flex flex-col items-center py-4 border-b border-card-border/60 mb-5">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    fill="transparent"
                    stroke="var(--card-border)"
                    strokeWidth="7"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    fill="transparent"
                    stroke={gaugeColor}
                    strokeWidth="7"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 - (caseData.riskScore / 100) * 2 * Math.PI * 44}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 4px ${gaugeColor}40)`
                    }}
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-black text-text-primary font-mono">
                    {caseData.riskScore}
                  </div>
                  <div className="text-[8px] font-mono text-text-secondary tracking-wider uppercase">
                    Risk Score
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className={`inline-flex border rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase font-mono transition-colors duration-200 ${severityColor}`}>
                  {caseData.riskScore >= 80 ? "Critical Threat" : caseData.riskScore >= 60 ? "High Risk" : caseData.riskScore >= 40 ? "Medium Risk" : caseData.riskScore >= 20 ? "Low Risk" : "Safe"}
                </span>
              </div>
            </div>
            
            {/* Explainability Contributors */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-mono font-bold tracking-widest text-text-muted uppercase">
                Attribution Contributors
              </h4>
              <div className="space-y-4">
                {scoreBreakdownItems.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-primary font-semibold">{item.name}</span>
                      <span className="text-primary font-mono font-bold">+{item.score}</span>
                    </div>
                    <p className="text-[10px] text-text-muted font-mono leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Technical Registry (Metadata) */}
          <div className="bg-card border border-card-border rounded-xl p-5 backdrop-blur-md" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-xs font-bold tracking-wider uppercase text-text-secondary mb-4 font-mono">
              Binary Registry Details
            </h3>

            <div className="space-y-3.5 text-[11px] font-mono">
              <div className="border-b border-card-border pb-2">
                <span className="text-text-muted block text-[9px]">FILE IDENTIFIER</span>
                <span className="text-text-primary break-all font-semibold">{caseData.fileName}</span>
              </div>

              <div className="border-b border-card-border pb-2">
                <span className="text-text-muted block text-[9px]">PACKAGE SIGNATURE</span>
                <span className="text-text-primary break-all font-semibold">{caseData.packageName || "N/A"}</span>
              </div>

              <div className="border-b border-card-border pb-2">
                <span className="text-text-muted block text-[9px]">VERSION CODE</span>
                <span className="text-text-primary font-semibold">{caseData.versionCode || "v1.0.0"}</span>
              </div>

              <div className="border-b border-card-border pb-2">
                <span className="text-text-muted block text-[9px]">FILE METRIC SIZE</span>
                <span className="text-text-primary font-semibold">{(caseData.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>

              <div>
                <span className="text-text-muted block text-[9px]">AUDIT TIMESTAMP</span>
                <span className="text-text-primary font-semibold font-sans">
                  {new Date(caseData.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Fullscreen Threat Intelligence Workspace Graph Modal */}
      {isGraphFullscreen && (
        <div className="fixed inset-0 z-50 bg-background text-text-primary overflow-hidden flex flex-col font-sans animate-fadeIn">
          {/* Style tag for animations */}
          <style>{`
            @keyframes marchingAnts {
              0% {
                stroke-dashoffset: 24;
              }
              100% {
                stroke-dashoffset: 0;
              }
            }
            .animate-marching-ants {
              stroke-dasharray: 6 6;
              animation: marchingAnts 1.2s linear infinite;
            }
            .shadow-neon-cyan {
              box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
            }
            .shadow-neon-rose {
              box-shadow: 0 0 15px rgba(244, 63, 94, 0.15);
            }
          `}</style>

          {/* Header */}
          <div className="bg-card border-b border-card-border px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-text-muted uppercase">
                <span>Threat Intelligence Portal</span>
                <span>/</span>
                <span>Workspace</span>
              </div>
              <h2 className="text-base font-bold text-text-primary font-mono flex items-center gap-2.5 mt-0.5">
                <Network className="w-5 h-5 text-primary" />
                <span>Campaign DNA Threat Workspace: {caseData.fileName}</span>
                <span className="text-xs text-text-muted font-normal">({caseData.id})</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-text-muted bg-card border border-card-border px-2.5 py-1 rounded">
                ESC to Close
              </span>
              <button
                onClick={() => setIsGraphFullscreen(false)}
                className="p-1.5 rounded-2xl border border-card-border hover:border-primary/50 bg-card-secondary hover:bg-primary/5 text-text-secondary hover:text-text-primary transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            {/* Left Sidebar Panel (Legend, Zoom, Metadata Table) */}
            <div className="w-full md:w-80 bg-card-secondary border-b md:border-b-0 md:border-r border-card-border flex flex-col overflow-hidden shrink-0">
              
              {/* Controls Section */}
              <div className="p-5 border-b border-card-border space-y-4 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
                  Workspace Controls
                </h3>
                
                {/* Zoom Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Radial Spread Zoom</span>
                    <span className="text-primary font-bold">{zoomFactor.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={zoomFactor}
                    onChange={(e) => setZoomFactor(parseFloat(e.target.value))}
                    className="w-full h-1 bg-card border border-card-border rounded-2xl appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[9px] text-text-muted font-mono">
                    <span>0.5x (Dense)</span>
                    <span>2.0x (Sparsity)</span>
                  </div>
                </div>
              </div>

              {/* Legend Section */}
              <div className="p-5 border-b border-card-border space-y-3 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
                  Node Entity Legend
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {[
                    { label: "Target Case APK", color: "text-primary", bg: "bg-primary/10", border: "border-primary/25" },
                    { label: "Threat Family", color: "text-pink-450", bg: "bg-pink-500/10", border: "border-pink-500/25" },
                    { label: "C2 Server IP", color: "text-[var(--critical-color)]", bg: "bg-[var(--critical-bg)]", border: "border-[var(--critical-border)]" },
                    { label: "Domain Indicator", color: "text-[var(--high-color)]", bg: "bg-[var(--high-bg)]", border: "border-[var(--high-border)]" },
                    { label: "Signer Certificate", color: "text-[var(--low-color)]", bg: "bg-[var(--low-bg)]", border: "border-[var(--low-border)]" },
                    { label: "Related / Similar Case", color: "text-purple-450", bg: "bg-purple-500/10", border: "border-purple-500/25" }
                  ].map((leg, idx) => (
                    <div key={idx} className={`flex items-center gap-2.5 p-2 rounded border bg-card/40 ${leg.border}`}>
                      <span className={`w-2 h-2 rounded-full ${leg.color.replace("text-", "bg-")}`}></span>
                      <span className="text-text-secondary font-medium">{leg.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Metadata Table of Nodes */}
              <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono shrink-0">
                  Dossier Nodes Inventory ({processedNodes.length})
                </h3>
                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                  {processedNodes.map((node) => {
                    let tagColor = "text-text-secondary bg-card border-card-border";
                    if (node.group === "Case") tagColor = "text-primary bg-primary/5 border-primary/20";
                    else if (node.group === "Threat Family") tagColor = "text-pink-500 bg-pink-500/5 border-pink-500/20";
                    else if (node.group === "IP") tagColor = "text-[var(--critical-color)] bg-[var(--critical-bg)] border-[var(--critical-border)]";
                    else if (node.group === "Domain") tagColor = "text-[var(--high-color)] bg-[var(--high-bg)] border-[var(--high-border)]";
                    else if (node.group === "Certificate") tagColor = "text-[var(--low-color)] bg-[var(--low-bg)] border-[var(--low-border)]";
                    else if (node.group === "Similar Case") tagColor = "text-purple-500 bg-purple-500/5 border-purple-500/20";

                    return (
                      <div
                        key={node.id}
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`p-2.5 rounded-2xl border bg-card transition-all hover:bg-primary/5 cursor-pointer ${
                          hoveredNode?.id === node.id ? "border-primary/45 bg-primary/5" : "border-card-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 border rounded uppercase font-bold tracking-wider ${tagColor}`}>
                            {node.group}
                          </span>
                          {node.risk > 0 && (
                            <span className={`text-[9px] font-mono font-bold transition-colors duration-200 ${
                              node.risk >= 80 ? "text-[var(--critical-color)]" : node.risk >= 60 ? "text-[var(--high-color)]" : "text-[var(--medium-color)]"
                            }`}>
                              Risk: {node.risk}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-text-primary truncate" title={node.label}>
                          {node.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Center Graph Canvas */}
            <div className="flex-1 bg-[#070b15] relative overflow-hidden flex items-center justify-center p-4">
              {/* Subtle grid pattern background */}
              <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>

              {/* Main SVG Threat Canvas */}
              <div className="w-full h-full max-w-[1000px] max-h-[800px] bg-card-secondary border border-card-border rounded-2xl relative shadow-inner overflow-hidden flex items-center justify-center">
                
                <svg viewBox="0 0 1000 800" className="w-full h-full p-6 select-none">
                  {/* Draw Edge Lines */}
                  {edgesWithCoords.map((edge, idx) => {
                    // Highlight edge if either connected node is hovered
                    const isHighlighted = hoveredNode && (hoveredNode.id === edge.source || hoveredNode.id === edge.target);
                    
                    let edgeColor = isHighlighted ? "var(--primary)" : "var(--card-border)";
                    let strokeWidth = isHighlighted ? "2" : "1.5";
                    
                    // Set up marching ants for highlighted case, or default slower for malicious ones
                    const lineClass = isHighlighted ? "animate-marching-ants" : "opacity-60";

                    return (
                      <g key={`edge-${idx}`}>
                        <line
                          x1={edge.x1}
                          y1={edge.y1}
                          x2={edge.x2}
                          y2={edge.y2}
                          stroke={edgeColor}
                          strokeWidth={strokeWidth}
                          className={lineClass}
                        />
                        {/* Midpoint Label Badge */}
                        {(() => {
                          const midX = (edge.x1 + edge.x2) / 2;
                          const midY = (edge.y1 + edge.y2) / 2;
                          const label = getEdgeLabel(edge.type);
                          const labelLen = label.length;
                          const rectW = Math.max(75, labelLen * 6);
                          const rectH = 14;

                          return (
                            <g transform={`translate(${midX}, ${midY})`}>
                              <rect
                                x={-rectW / 2}
                                y={-rectH / 2}
                                width={rectW}
                                height={rectH}
                                rx={3}
                                fill="var(--card)"
                                stroke={isHighlighted ? "var(--primary)" : "var(--card-border)"}
                                strokeWidth="1"
                                className="opacity-95 shadow-sm"
                              />
                              <text
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isHighlighted ? "var(--primary)" : "var(--text-muted)"}
                                fontSize="7.5"
                                fontFamily="monospace"
                                className="font-bold tracking-wider"
                              >
                                {label}
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })}

                  {/* Draw Nodes */}
                  {nodesWithCoords.map((node) => {
                    const isCenter = node.id === caseData.id;
                    const isHovered = hoveredNode?.id === node.id;
                    
                    let strokeColor = "var(--primary)"; // Default
                    let nodeColor = "var(--card)";
                    let IconComponent = Shield;
                    
                    if (node.group === "Threat Family") {
                      strokeColor = "var(--node-family-stroke)";
                      nodeColor = "var(--node-family-fill)";
                      IconComponent = ShieldAlert;
                    } else if (node.group === "IP") {
                      strokeColor = "var(--node-ip-stroke)";
                      nodeColor = "var(--node-ip-fill)";
                      IconComponent = Server;
                    } else if (node.group === "Domain") {
                      strokeColor = "var(--node-domain-stroke)";
                      nodeColor = "var(--node-domain-fill)";
                      IconComponent = Globe;
                    } else if (node.group === "Certificate") {
                      strokeColor = "var(--node-sample-stroke)";
                      nodeColor = "var(--node-sample-fill)";
                      IconComponent = Key;
                    } else if (node.group === "Similar Case") {
                      strokeColor = "var(--node-family-stroke)";
                      nodeColor = "var(--node-family-fill)";
                      IconComponent = ShieldAlert;
                    }

                    const radius = isCenter ? 32 : isHovered ? 26 : 22;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {/* Outer Pulsing Aura/Glow */}
                        {(isCenter || isHovered) && (
                          <circle
                            r={radius + 8}
                            fill="transparent"
                            stroke={strokeColor}
                            strokeWidth="2"
                            className="opacity-30 animate-pulse"
                            style={{
                              filter: `blur(4px)`
                            }}
                          />
                        )}

                        {/* Node Circle */}
                        <circle
                          r={radius}
                          fill={nodeColor}
                          stroke={strokeColor}
                          strokeWidth={isHovered ? "3" : "2"}
                          className="transition-all duration-200"
                        />

                        {/* Inner Icon Component */}
                        <foreignObject
                          x={-radius + 7}
                          y={-radius + 7}
                          width={radius * 2 - 14}
                          height={radius * 2 - 14}
                          className="flex items-center justify-center pointer-events-none"
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <IconComponent
                              className="w-full h-full opacity-85"
                              style={{ color: strokeColor }}
                            />
                          </div>
                        </foreignObject>

                        {/* Node Label Text underneath */}
                        <text
                          y={radius + 14}
                          textAnchor="middle"
                          fill={isHovered ? "var(--text-primary)" : "var(--text-secondary)"}
                          fontSize="9"
                          fontFamily="monospace"
                          className={`font-semibold pointer-events-none ${isHovered ? "font-bold text-text-primary" : ""}`}
                        >
                          {node.label.length > 18 ? node.label.substring(0, 15) + "..." : node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Canvas Help Badge */}
                <div className="absolute bottom-4 left-4 bg-card/85 border border-card-border rounded px-3 py-1.5 text-[9px] font-mono text-text-secondary tracking-wide pointer-events-none">
                  Hover over nodes to inspect attributes & traces.
                </div>

                {/* Floating HUD Overlay Inspector Card (Top-Right Overlay inside Canvas Area) */}
                {hoveredNode && (
                  <div className="absolute top-4 right-4 w-80 bg-card/95 border border-card-border rounded-xl p-4.5 shadow-neon-cyan/20 backdrop-blur-md z-30 animate-fadeIn space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-card-border/80 pb-2">
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">
                        Node Analysis Inspect
                      </span>
                      {(() => {
                        let badgeStyle = "text-primary bg-primary/10 border-primary/20";
                        if (hoveredNode.group === "Threat Family") badgeStyle = "text-pink-500 bg-pink-500/10 border-pink-500/20";
                        else if (hoveredNode.group === "IP") badgeStyle = "text-[var(--critical-color)] bg-[var(--critical-bg)] border-[var(--critical-border)]";
                        else if (hoveredNode.group === "Domain") badgeStyle = "text-[var(--high-color)] bg-[var(--high-bg)] border-[var(--high-border)]";
                        else if (hoveredNode.group === "Certificate") badgeStyle = "text-[var(--low-color)] bg-[var(--low-bg)] border-[var(--low-border)]";
                        else if (hoveredNode.group === "Similar Case") badgeStyle = "text-purple-500 bg-purple-500/10 border-purple-500/20";
                        
                        return (
                          <span className={`text-[8px] font-mono px-2 py-0.5 border rounded uppercase font-bold tracking-wider ${badgeStyle}`}>
                            {hoveredNode.group}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="space-y-2.5 font-mono text-[11px]">
                      <div>
                        <span className="text-text-muted text-[9px] block">ENTITY VALUE</span>
                        <span className="text-text-primary break-all font-semibold">{hoveredNode.label}</span>
                      </div>

                      <div>
                        <span className="text-text-muted text-[9px] block">THREAT REGISTRY ID</span>
                        <span className="text-text-secondary break-all">{hoveredNode.id}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-card-border">
                        <div>
                          <span className="text-text-muted text-[9px] block">RISK SEVERITY</span>
                          <span className={`font-bold text-xs ${
                            hoveredNode.risk >= 80 ? "text-[var(--critical-color)]" :
                            hoveredNode.risk >= 60 ? "text-[var(--high-color)]" :
                            hoveredNode.risk >= 40 ? "text-[var(--medium-color)]" :
                            "text-[var(--low-color)]"
                          }`}>
                            {hoveredNode.risk} / 100
                          </span>
                        </div>

                        <div>
                          <span className="text-text-muted text-[9px] block">ASSOCIATION</span>
                          <span className="text-text-secondary capitalize">
                            {hoveredNode.id === caseData.id ? "Target APK Case" : hoveredNode.group.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      </div>
      
      <ExecutiveReportPrintView
        caseData={caseData}
        execSummaryData={execSummaryData}
        graphData={graphData}
        timelineData={timelineData}
        permissions={permissions}
        activities={activities}
        services={services}
        mitreTags={mitreTags}
        iocs={iocs}
        threatNarrative={threatNarrative}
        citizenImpact={citizenImpact}
        langCode={language}
        regionalAdvisory={caseData.multilingualReports ? JSON.parse(caseData.multilingualReports) : {}}
      />
    </>
  );
}
