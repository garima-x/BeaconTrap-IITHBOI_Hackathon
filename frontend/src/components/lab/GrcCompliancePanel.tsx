import React from "react";
import { Briefcase, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

export default function GrcCompliancePanel() {
  const { caseData } = useAnalysis();

  if (!caseData) {
    return (
      <div className="text-center py-10 text-xs font-mono text-[var(--text-muted)]">
        NO CASE DATA LOADED FOR GRC COMPLIANCE PANEL
      </div>
    );
  }

  // Parse JSON safe checks
  const permissions: string[] = JSON.parse(caseData.permissions || "[]");
  const iocs: any[] = JSON.parse(caseData.iocs || "[]");
  const citizenImpact = caseData.citizenImpact ? JSON.parse(caseData.citizenImpact) : {};

  // Formatted GRC mappings
  const hasSMS = permissions.some(p => p.toUpperCase().includes("SMS"));
  const hasAccessibility = permissions.some(p => p.toUpperCase().includes("ACCESSIBILITY"));

  const rbiStatus = hasSMS ? "Critical Violation" : "Review Required";
  const dpdpStatus = hasAccessibility ? "Non-Compliant (Data Breach)" : "Under Review";

  const complianceScore = Math.max(10, 100 - (caseData.riskScore || 75));

  const gaugeData = [
    {
      name: "Compliance Score",
      value: complianceScore,
      fill: complianceScore > 60 ? "var(--severity-low)" : complianceScore > 30 ? "var(--severity-medium)" : "var(--severity-critical)"
    }
  ];

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            Bank Officer Regulatory Compliance & Risk Dashboard
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-2xl bg-[var(--severity-medium)]/10 border border-[var(--severity-medium)]/30 text-[var(--severity-medium)] font-bold uppercase">
          AUDIT READY DOSSIER
        </span>
      </div>

      {/* Visual Header Grid: Compliance Meter + Action Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Meter */}
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-5 rounded-2xl flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider text-left mb-1">
              Regulatory Compliance Meter
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] font-mono text-left mb-2">
              Aggregate rating based on RBI Digital Payments & DPDP Act mandates.
            </p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={14}
                data={gaugeData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" cornerRadius={4} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-panel)",
                    borderColor: "var(--border)",
                    borderRadius: "4px",
                    fontSize: "11px",
                    color: "var(--text-primary)"
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className={`text-3xl font-bold font-mono ${complianceScore > 50 ? 'text-[var(--severity-low)]' : 'text-[var(--severity-critical)]'}`}>
                {complianceScore}%
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">COMPLIANT</span>
            </div>
          </div>

          <div className="w-full p-2.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--text-muted)]">Bank Risk Assessment:</span>
            <span className={`font-bold uppercase ${caseData.riskScore > 70 ? 'text-[var(--severity-critical)]' : 'text-[var(--severity-medium)]'}`}>
              {caseData.riskScore > 70 ? 'HIGH REGULATORY RISK' : 'MODERATE EXPOSURE'}
            </span>
          </div>
        </div>

        {/* CISO Executive Action Summary */}
        <div className="lg:col-span-2 bg-[var(--bg-panel-alt)] border border-[var(--border)] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider">
                CISO Statutory Action Plan & CERT-In SLA
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-2xl bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] font-bold border border-[var(--severity-critical)]/30">
                6-HOUR MANDATORY SLA WARNING
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs mb-4">
              <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Potential Financial Loss Exposure</span>
                <span className="text-sm font-bold text-[var(--severity-critical)] block">
                  {citizenImpact.fraudType || "UPI Exfiltration / Silent Banking Fraud"}
                </span>
                <p className="text-[10px] text-[var(--text-muted)] font-sans leading-relaxed pt-1">
                  Malware possesses credentials interception payload capable of unauthorized debit transactions.
                </p>
              </div>

              <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase block">Network Threat Footprints</span>
                <div className="max-h-16 overflow-y-auto space-y-1">
                  {iocs.map((ioc: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[10px] border-b border-[var(--border)] pb-0.5">
                      <span className="text-[var(--text-primary)] truncate">{ioc.value}</span>
                      <span className="text-[var(--severity-critical)] font-bold">{ioc.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--severity-critical)]/10 border border-[var(--severity-critical)]/30 rounded-2xl text-xs font-mono text-[var(--severity-critical)] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--severity-critical)] shrink-0" />
              <span>Recommended Action: Trigger automated ISP block domain rules for identified C2 IPs.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Regulatory Mandates Cards Visual Mapping */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[var(--severity-low)]" />
          <span>Statutory Compliance & Legal Framework Breakdown</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          {/* RBI Mandate Card */}
          <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[var(--text-primary)] font-mono">RBI Digital Payments Mandate</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-2xl bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] font-bold border border-[var(--severity-critical)]/30">
                  {rbiStatus}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] block mb-2">Section 3.1 & 3.2 Security Mandates</span>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Accessibility and SMS listening permissions bypass multi-factor authentication triggers. Direct violation of Section 3.1 regarding secure, tamper-proof mobile delivery pathways.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>Audit Action:</span>
              <span className="text-[var(--severity-critical)] font-bold">BLOCK PACKAGE</span>
            </div>
          </div>

          {/* DPDP Act Card */}
          <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[var(--text-primary)] font-mono">DPDP Act (2023) Compliance</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-2xl bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] font-bold border border-[var(--severity-critical)]/30">
                  {dpdpStatus}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] block mb-2">Section 6 & 8 Consent Obligations</span>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Abuse of accessibility keystroke hooks logs sensitive credential identifiers without explicit customer consent loops, presenting severe personal data processing risks under Section 8.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>Audit Action:</span>
              <span className="text-[var(--severity-critical)] font-bold">DATA EXFIL HAZARD</span>
            </div>
          </div>

          {/* IT Act Card */}
          <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[var(--text-primary)] font-mono">IT Act, 2000 Compliance</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-2xl bg-[var(--severity-medium)]/10 text-[var(--severity-medium)] font-bold border border-[var(--severity-medium)]/30">
                  Statutory Offence
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] block mb-2">Section 43A, 66C & 66D Identity Theft</span>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Spoofing official Bank of India branding layouts and package identifiers constitutes digital impersonation and credentials theft under Section 66D of the IT Act.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>Audit Action:</span>
              <span className="text-[var(--severity-medium)] font-bold">TAKEDOWN NOTICE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
