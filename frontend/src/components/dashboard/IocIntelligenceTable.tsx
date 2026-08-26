"use client";

import React, { useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import SocPanel from "./SocPanel";
import { IocIntelRow } from "@/types/dashboard";

interface IocIntelligenceTableProps {
  iocs: IocIntelRow[];
}

export default function IocIntelligenceTable({ iocs }: IocIntelligenceTableProps) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const filtered = iocs.filter((ioc) => {
    const matchSearch =
      !search ||
      ioc.value.toLowerCase().includes(search.toLowerCase()) ||
      ioc.fileName.toLowerCase().includes(search.toLowerCase()) ||
      ioc.threatFamily.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "ALL" || ioc.severity.toUpperCase() === severityFilter.toUpperCase();
    return matchSearch && matchSeverity;
  });

  return (
    <SocPanel
      title="INDICATOR OF COMPROMISE (IOC) DATABASE"
      subtitle="Extracted forensic indicators & network signature correlation"
      badge={`${iocs.length} IOCS`}
      headerRight={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search IOC value or APK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl pl-7 pr-2 py-1 text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 w-44 transition-colors"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl px-2 py-1 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
          </select>
        </div>
      }
      noPadding
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-panel-alt)] text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-4 font-semibold">TYPE</th>
              <th className="py-2.5 px-4 font-semibold">INDICATOR VALUE</th>
              <th className="py-2.5 px-4 font-semibold">SEVERITY</th>
              <th className="py-2.5 px-4 font-semibold text-right">CONFIDENCE</th>
              <th className="py-2.5 px-4 font-semibold">THREAT FAMILY</th>
              <th className="py-2.5 px-4 font-semibold">SOURCE APK</th>
              <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--bg-panel)]">
            {filtered.map((ioc) => {
              const sevUpper = ioc.severity.toUpperCase();
              let badgeColor = "bg-[var(--severity-low)]/10 text-[var(--severity-low)] border-[var(--severity-low)]/30";
              if (sevUpper === "CRITICAL") badgeColor = "bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] border-[var(--severity-critical)]/30";
              else if (sevUpper === "HIGH") badgeColor = "bg-[var(--severity-high)]/10 text-[var(--severity-high)] border-[var(--severity-high)]/30";
              else if (sevUpper === "MEDIUM") badgeColor = "bg-[var(--severity-medium)]/10 text-[var(--severity-medium)] border-[var(--severity-medium)]/30";

              return (
                <tr key={ioc.id} className="hover:bg-[var(--bg-panel-alt)] transition-colors">
                  <td className="py-2.5 px-4 text-[var(--accent)] font-bold">{ioc.type}</td>
                  <td className="py-2.5 px-4 text-[var(--text-primary)] max-w-[220px] truncate" title={ioc.value}>
                    <code>{ioc.value}</code>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex border rounded-2xl px-1.5 py-0.5 text-[10px] font-bold uppercase ${badgeColor}`}>
                      {ioc.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[var(--text-primary)] text-right font-mono">{ioc.confidence}%</td>
                  <td className="py-2.5 px-4 text-[var(--text-primary)] font-mono">{ioc.threatFamily}</td>
                  <td className="py-2.5 px-4 text-[var(--text-muted)] truncate max-w-[130px]">{ioc.fileName}</td>
                  <td className="py-2.5 px-4 text-right">
                    {ioc.caseId !== "SIM" ? (
                      <a
                        href={`/case/${ioc.caseId}`}
                        className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline text-xs font-bold uppercase transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        INVESTIGATE
                      </a>
                    ) : (
                      <span className="text-[var(--text-muted)] text-xs">SIMULATED</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-[var(--text-muted)] font-mono text-xs">
                  No indicators match active search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SocPanel>
  );
}
