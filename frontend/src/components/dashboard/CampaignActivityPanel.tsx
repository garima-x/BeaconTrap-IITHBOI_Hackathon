"use client";

import React from "react";
import SocPanel from "./SocPanel";
import { CampaignActivity } from "@/types/dashboard";

interface CampaignActivityPanelProps {
  campaigns: CampaignActivity[];
}

export default function CampaignActivityPanel({ campaigns }: CampaignActivityPanelProps) {
  return (
    <SocPanel
      title="CAMPAIGN INTEL OPERATIONS"
      subtitle="Tracked trojan campaigns & shared infrastructure overlap"
      badge={`${campaigns.filter((c) => c.status === "active").length} ACTIVE`}
    >
      <div className="space-y-3 font-mono text-xs">
        {campaigns.map((camp) => {
          let statusBadge = "bg-[var(--severity-low)]/10 text-[var(--severity-low)] border-[var(--severity-low)]/30";
          if (camp.status === "active") statusBadge = "bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] border-[var(--severity-critical)]/30";
          else if (camp.status === "monitoring") statusBadge = "bg-[var(--severity-medium)]/10 text-[var(--severity-medium)] border-[var(--severity-medium)]/30";

          return (
            <div
              key={camp.id}
              className="bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[var(--text-primary)] text-xs font-mono">{camp.label}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{camp.threatFamily}</div>
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-2xl border ${statusBadge}`}>
                  {camp.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-[var(--border)] text-[10px]">
                <div>
                  <span className="text-[var(--text-muted)] uppercase block">CASES</span>
                  <span className="text-[var(--text-primary)] font-bold text-xs">{camp.caseCount}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] uppercase block">AVG RISK</span>
                  <span className={`font-bold text-xs ${camp.avgRisk >= 80 ? "text-[var(--accent)]" : "text-[var(--severity-medium)]"}`}>
                    {camp.avgRisk}/100
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[var(--text-muted)] uppercase block">LAST SEEN</span>
                  <span className="text-[var(--text-primary)]">
                    {new Date(camp.lastSeen).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>

              {camp.sharedInfrastructure.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase self-center mr-1">INFRA:</span>
                  {camp.sharedInfrastructure.map((infra) => (
                    <span
                      key={infra}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)]"
                    >
                      {infra}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SocPanel>
  );
}
