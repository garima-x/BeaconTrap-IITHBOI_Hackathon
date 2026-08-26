import React, { useState } from "react";
import { 
  Activity, 
  ShieldCheck, 
  FileText, 
  Cpu, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Clock, 
  Globe, 
  Network, 
  CheckCircle2, 
  Share2, 
  Radio
} from "lucide-react";
import { 
  mockCriticalCaseData, 
  mockCampaignGraphData, 
  mockTimelineData, 
  mockExecutiveSummaryData 
} from "../../context/AnalysisContext";

interface DemoWalkthroughProps {
  onGoToLiveLab: () => void;
}

export const DemoWalkthroughPage: React.FC<DemoWalkthroughProps> = ({ onGoToLiveLab }) => {
  const [activeDemoTab, setActiveDemoTab] = useState<"ANALYSIS" | "GRC" | "CITIZEN" | "CAMPAIGN" | "TIMELINE" | "LEDGER">("ANALYSIS");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Header Banner */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 rounded-2xl">
              PRE-COMPILED DEMO GALLERY
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              FULL END-TO-END SYSTEM WALKTHROUGH MOCKUPS
            </span>
          </div>

          <button
            onClick={onGoToLiveLab}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--btn-copilot-text)] text-xs font-bold uppercase tracking-wider rounded-2xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>Switch to Live Analysis Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            End-to-End Banking Trojan Forensics Walkthrough
          </h2>
          <p className="text-xs text-[var(--text-muted)] max-w-4xl leading-relaxed font-sans pt-1">
            This workspace provides a full, unconstrained view of BeaconTrap's investigation features for a pre-analyzed Banking Trojan sample (<code className="text-[var(--accent)]">boi_safe.apk</code>, Risk Index: 92/100). Browse all 6 forensic panels below.
          </p>
        </div>

        {/* Dynamic Demo Navigation Bar */}
        <div className="flex border-b border-[var(--border)] pt-2 gap-1 overflow-x-auto">
          {[
            { id: "ANALYSIS", label: "Forensic Analysis", icon: Cpu },
            { id: "GRC", label: "GRC Compliance", icon: FileText },
            { id: "CITIZEN", label: "Citizen Exposure", icon: Globe },
            { id: "CAMPAIGN", label: "Campaign DNA", icon: Network },
            { id: "TIMELINE", label: "Event Timeline", icon: Clock },
            { id: "LEDGER", label: "Evidence Ledger", icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeDemoTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDemoTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium uppercase tracking-wider border-b-2 transition-colors shrink-0 cursor-pointer ${
                  isSelected
                    ? "border-[var(--accent)] text-[var(--text-primary)] bg-[var(--bg-panel-alt)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Render */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
        {/* TAB 1: FORENSIC ANALYSIS */}
        {activeDemoTab === "ANALYSIS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-base font-bold uppercase text-[var(--text-primary)]">Static & Dynamic Forensic Findings</h3>
              </div>
              <span className="text-xs font-bold text-[var(--severity-critical)] bg-[var(--severity-critical)]/10 px-2.5 py-1 border border-[var(--severity-critical)]/30 rounded-2xl">
                TROJAN RISK: 92/100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-2">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Binary Identity</span>
                <div className="text-sm font-bold text-[var(--text-primary)]">{mockCriticalCaseData.fileName}</div>
                <div className="text-xs text-[var(--accent)]">PKG: {mockCriticalCaseData.packageName}</div>
                <div className="text-[10px] text-[var(--text-muted)] break-all pt-2">SHA256: {mockCriticalCaseData.sha256}</div>
              </div>

              <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-2 col-span-2">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Extracted Dangerous Permissions</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {JSON.parse(mockCriticalCaseData.permissions).map((perm: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 text-xs bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] border border-[var(--severity-critical)]/20 rounded-full">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block">AI Threat Narrative & De-Obfuscation Analysis</span>
              <p className="text-xs leading-relaxed text-[var(--text-primary)] font-sans">
                {JSON.parse(mockCriticalCaseData.threatNarrative || "{}").behavior}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: GRC COMPLIANCE */}
        {activeDemoTab === "GRC" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--severity-high)]" />
                <h3 className="text-base font-bold uppercase text-[var(--text-primary)]">GRC Compliance & Regulatory Directives</h3>
              </div>
              <span className="text-xs font-bold text-[var(--accent)]">RBI / CERT-In / DPDP Act 2023</span>
            </div>

            <div className="p-5 bg-[var(--severity-critical)]/10 border border-[var(--severity-critical)]/30 rounded-2xl space-y-2">
              <h4 className="text-sm font-bold text-[var(--severity-critical)] uppercase">DPDP Act 2023 — Section 8 Breach Notice</h4>
              <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                Direct violation of consumer personal data protections due to unauthorized SMS interception and background overlay injection targeting banking credentials.
              </p>
            </div>

            <div className="p-5 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)]">Mandatory Executive Action Plan</h4>
              <ul className="text-xs space-y-2 font-sans text-[var(--text-primary)]">
                {mockExecutiveSummaryData.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-cool)] shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: CITIZEN EXPOSURE */}
        {activeDemoTab === "CITIZEN" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--accent-cool)]" />
                <h3 className="text-base font-bold uppercase text-[var(--text-primary)]">Citizen Impact & Risk Exposure Assessment</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Estimated Population Exposure</span>
                <span className="text-base font-bold text-[var(--severity-critical)]">5,000+ Active Mobile Devices</span>
              </div>
              <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Estimated Financial Exposure</span>
                <span className="text-base font-bold text-[var(--accent)]">₹1.5Cr - ₹3.0Cr</span>
              </div>
              <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Target Demographic</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">Retail Banking Consumers</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAMPAIGN DNA */}
        {activeDemoTab === "CAMPAIGN" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-base font-bold uppercase text-[var(--text-primary)]">Campaign DNA Relationship Graph</h3>
              </div>
              <span className="text-xs text-[var(--text-muted)]">Neo4j Cypher Engine</span>
            </div>

            <div className="p-5 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-3">
              <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Correlated Shared Infrastructure Nodes</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                {mockCampaignGraphData.nodes.map((node) => (
                  <div key={node.id} className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">{node.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">NODE TYPE: {node.group.toUpperCase()}</div>
                    </div>
                    <span className="text-xs font-bold text-[var(--accent)]">{node.risk}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EVENT TIMELINE */}
        {activeDemoTab === "TIMELINE" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-base font-bold uppercase text-[var(--text-primary)]">Chronological Investigation Timeline</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {mockTimelineData.map((ev) => (
                <div key={ev.id} className="p-3.5 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[var(--text-primary)]">{ev.event}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{ev.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-sans">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EVIDENCE LEDGER */}
        {activeDemoTab === "LEDGER" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--accent-cool)]" />
                <h3 className="text-base font-bold uppercase text-[var(--text-primary)]">Blockchain Evidence Anchoring Receipt</h3>
              </div>
              <span className="text-xs text-[var(--accent-cool)] font-bold">Ethereum Sepolia Verified</span>
            </div>

            <div className="p-5 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block">VERIFIED CONTRACT ADDRESS</span>
                <span className="text-[var(--accent)] text-xs font-mono font-bold break-all">0xd9aa91a39248916D946C75Abf875F2b1660a8732</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block">SEPOLIA BLOCK INDEX</span>
                <span className="text-[var(--text-primary)] font-bold">Block #1782345</span>
              </div>
              <div className="p-3 bg-[var(--severity-critical)]/10 border border-[var(--severity-critical)]/30 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-[var(--severity-critical)] shrink-0" />
                <span className="text-[11px] text-[var(--text-muted)] font-sans">
                  Courtroom Chain-of-Custody Integrity Guaranteed via cryptographic hash anchoring.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
