"use client";

import React from "react";
import { SocMetrics } from "@/types/dashboard";

interface SocMetricsStripProps {
  metrics: SocMetrics;
}

const METRICS_CONFIG = [
  { key: "totalCases", label: "CASES ANALYZED", subtext: "Telemetry Complete", isAccent: false },
  { key: "criticalThreats", label: "CRITICAL THREATS", subtext: "Immediate Action Required", isAccent: true, isCritical: true },
  { key: "highRiskApks", label: "HIGH RISK APKS", subtext: "Active Watchlist", isHigh: true },
  { key: "avgRisk", label: "AVG RISK SCORE", subtext: "Threshold Critical >80", suffix: "/100" },
  { key: "iocCount", label: "ACTIVE IOCS", subtext: "Live Intel Feed", isAccent: false },
  { key: "citizenExposure", label: "CITIZEN RISK EXPOSURE", subtext: "Vulnerability Index", isExposure: true },
] as const;

export default function SocMetricsStrip({ metrics }: SocMetricsStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono">
      {METRICS_CONFIG.map((card) => {
        const rawValue = metrics[card.key as keyof SocMetrics];
        const displayValue = String(rawValue);

        let valueStyle: React.CSSProperties = { color: "var(--text-primary)" };
        if ("isCritical" in card && card.isCritical) valueStyle = { color: "var(--severity-critical)" };
        else if ("isHigh" in card && card.isHigh) valueStyle = { color: "var(--severity-high)" };
        else if ("isExposure" in card && card.isExposure) {
          valueStyle = metrics.citizenExposure === "High" ? { color: "var(--severity-critical)" } : { color: "var(--severity-medium)" };
        }

        return (
          <div
            key={card.key}
            className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-3.5 space-y-1 hover:border-[var(--accent)]/40 transition-colors"
          >
            <div className="text-[10px] font-mono tracking-wider uppercase font-semibold" style={{ color: "var(--text-muted)" }}>
              {card.label}
            </div>
            <div className="text-2xl font-mono font-bold flex items-baseline gap-1" style={valueStyle}>
              {displayValue}
              {"suffix" in card && card.suffix && (
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{card.suffix}</span>
              )}
            </div>
            <div className="text-[9px] font-mono uppercase" style={{ color: "var(--text-muted)" }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
