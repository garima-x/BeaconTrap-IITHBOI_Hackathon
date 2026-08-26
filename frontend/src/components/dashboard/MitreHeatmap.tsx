"use client";

import React from "react";
import SocPanel from "./SocPanel";
import { MitreHeatmapCell } from "@/types/dashboard";

interface MitreHeatmapProps {
  cells: MitreHeatmapCell[];
}

const SEVERITY_STYLE: Record<MitreHeatmapCell["severity"], { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-[var(--severity-critical)]/15", text: "text-[var(--severity-critical)]", border: "border-[var(--severity-critical)]/35" },
  high: { bg: "bg-[var(--severity-high)]/15", text: "text-[var(--severity-high)]", border: "border-[var(--severity-high)]/35" },
  medium: { bg: "bg-[var(--severity-medium)]/15", text: "text-[var(--severity-medium)]", border: "border-[var(--severity-medium)]/35" },
  low: { bg: "bg-[var(--severity-low)]/15", text: "text-[var(--severity-low)]", border: "border-[var(--severity-low)]/35" },
};

const TACTICS = [
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Credential Access",
  "Defense Evasion",
  "Command & Control",
];

export default function MitreHeatmap({ cells }: MitreHeatmapProps) {
  return (
    <SocPanel
      title="MITRE ATT&CK HEATMAP MATRIX"
      subtitle="Mobile Framework v14 · Technique density mapping"
      badge="LIVE MATRIX"
    >
      <div className="space-y-3 font-mono text-xs">
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] uppercase">
          {(["critical", "high", "medium", "low"] as const).map((sev) => (
            <div key={sev} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full border ${SEVERITY_STYLE[sev].bg} ${SEVERITY_STYLE[sev].border}`} />
              <span className="text-[var(--text-muted)]">{sev}</span>
            </div>
          ))}
          <span className="ml-auto text-[var(--text-muted)]">{cells.length} techniques mapped</span>
        </div>

        {/* Tactic rows */}
        <div className="space-y-3">
          {TACTICS.map((tactic) => {
            const tacticCells = cells.filter((c) => c.tactic === tactic);
            if (tacticCells.length === 0) return null;

            return (
              <div key={tactic} className="space-y-1">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  {tactic}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tacticCells.map((cell) => {
                    const style = SEVERITY_STYLE[cell.severity];

                    return (
                      <div
                        key={cell.techniqueId}
                        title={`${cell.techniqueName} — ${cell.count} detections (${cell.confidence}% conf.)`}
                        className={`px-3 py-1.5 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-between gap-3 min-w-[140px]`}
                      >
                        <div>
                          <div className={`text-xs font-mono font-bold ${style.text}`}>
                            {cell.techniqueId}
                          </div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-[110px]">
                            {cell.techniqueName}
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-primary)]">
                          {cell.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SocPanel>
  );
}
