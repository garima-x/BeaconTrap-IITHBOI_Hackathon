"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

interface ChartProps {
  threatData: { name: string; value: number }[];
  trendData: { date: string; score: number; file: string }[];
}

// ─── ATT&CK Kill Chain Stage Definitions ────────────────────────────────────
const KILL_CHAIN_STAGES = [
  {
    id: "initial-access",
    phase: "Initial Access",
    color: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.4)",
    icon: "⚡",
    techniques: [
      { id: "T1476", name: "Deliver Malicious App" },
      { id: "T1444", name: "Masquerade as Legit App" },
    ],
    detected: true,
    confidence: 92,
  },
  {
    id: "execution",
    phase: "Execution",
    color: "#f97316",
    glow: "rgba(249, 115, 22, 0.4)",
    icon: "▶",
    techniques: [
      { id: "T1082", name: "System Info Discovery" },
      { id: "T1624", name: "Event Triggered Exec" },
    ],
    detected: true,
    confidence: 88,
  },
  {
    id: "persistence",
    phase: "Persistence",
    color: "#eab308",
    glow: "rgba(234, 179, 8, 0.4)",
    icon: "🔒",
    techniques: [
      { id: "T1546", name: "Accessibility Svc Abuse" },
      { id: "T1624", name: "Boot Completed Receiver" },
    ],
    detected: true,
    confidence: 95,
  },
  {
    id: "credential-access",
    phase: "Credential Access",
    color: "#a855f7",
    glow: "rgba(168, 85, 247, 0.4)",
    icon: "🔑",
    techniques: [
      { id: "T1412", name: "Capture SMS Messages" },
      { id: "T1417", name: "Input Capture / Keylog" },
    ],
    detected: true,
    confidence: 97,
  },
  {
    id: "collection",
    phase: "Collection",
    color: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.4)",
    icon: "📡",
    techniques: [
      { id: "T1432", name: "Access Contact List" },
      { id: "T1533", name: "Data from Local Storage" },
    ],
    detected: false,
    confidence: 61,
  },
  {
    id: "command-control",
    phase: "Command & Control",
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
    icon: "🌐",
    techniques: [
      { id: "T1043", name: "Commonly Used Port" },
      { id: "T1437", name: "Standard App Layer Proto" },
    ],
    detected: true,
    confidence: 83,
  },
];

const detectedCount = KILL_CHAIN_STAGES.filter((s) => s.detected).length;
const coveragePct = Math.round((detectedCount / KILL_CHAIN_STAGES.length) * 100);
const avgConfidence = Math.round(
  KILL_CHAIN_STAGES.filter((s) => s.detected).reduce((acc, s) => acc + s.confidence, 0) /
    detectedCount
);

// ─── Kill Chain Component ────────────────────────────────────────────────────
function ATTACKKillChain() {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header KPIs */}
      <div className="flex items-center justify-between gap-4 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
            Chain Coverage
          </span>
          <span className="text-sm font-black font-mono text-rose-400">{coveragePct}%</span>
        </div>
        {/* Coverage bar */}
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[120px]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${coveragePct}%`,
              background: `linear-gradient(90deg, #f43f5e, #f97316, #eab308)`,
              boxShadow: "0 0 8px rgba(244,63,94,0.5)",
            }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
            Progression Score
          </span>
          <span className="text-sm font-black font-mono text-amber-400">{avgConfidence}%</span>
        </div>
      </div>

      {/* Kill Chain Stages — horizontal scroll on small, wrap layout */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-start gap-0 min-w-max">
          {KILL_CHAIN_STAGES.map((stage, idx) => {
            const isHovered = hoveredStage === stage.id;
            const isLast = idx === KILL_CHAIN_STAGES.length - 1;

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Card */}
                <div
                  className="relative flex flex-col items-center cursor-pointer group"
                  onMouseEnter={() => setHoveredStage(stage.id)}
                  onMouseLeave={() => setHoveredStage(null)}
                  style={{ minWidth: 120 }}
                >
                  {/* Detection badge */}
                  <div
                    className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border mb-2 tracking-widest uppercase"
                    style={
                      stage.detected
                        ? {
                            color: stage.color,
                            borderColor: stage.color + "55",
                            background: stage.color + "15",
                          }
                        : {
                            color: "#64748b",
                            borderColor: "#334155",
                            background: "#0f172a",
                          }
                    }
                  >
                    {stage.detected ? "DETECTED" : "UNCONFIRMED"}
                  </div>

                  {/* Phase Header */}
                  <div
                    className="relative w-full rounded-2xl border p-2.5 text-center transition-all duration-200"
                    style={{
                      borderColor: isHovered ? stage.color : stage.color + "40",
                      background: isHovered
                        ? stage.color + "20"
                        : stage.detected
                        ? stage.color + "0d"
                        : "#0c1524",
                      boxShadow: isHovered ? `0 0 18px ${stage.glow}` : "none",
                    }}
                  >
                    <div className="text-base mb-1">{stage.icon}</div>
                    <div
                      className="text-[9px] font-mono font-bold uppercase tracking-wider leading-tight"
                      style={{ color: stage.color }}
                    >
                      {stage.phase}
                    </div>
                    {/* Confidence bar inside card */}
                    <div className="mt-1.5 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${stage.confidence}%`,
                          background: stage.color,
                          boxShadow: `0 0 5px ${stage.color}`,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                    <div className="text-[8px] font-mono text-[var(--text-muted)] mt-0.5">
                      {stage.confidence}% conf.
                    </div>

                    {/* Techniques dropdown on hover */}
                    {isHovered && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-44 rounded-2xl border p-2 space-y-1 shadow-2xl"
                        style={{
                          borderColor: stage.color + "40",
                          background: "#07111f",
                          boxShadow: `0 8px 32px ${stage.glow}`,
                        }}
                      >
                        {stage.techniques.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2 text-[9px] font-mono"
                          >
                            <span
                              className="font-bold shrink-0"
                              style={{ color: stage.color }}
                            >
                              {t.id}
                            </span>
                            <span className="text-[var(--text-primary)] truncate">{t.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Technique pills (always visible, compact) */}
                  <div className="flex flex-col gap-1 mt-2 w-full px-0.5">
                    {stage.techniques.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded px-2 py-1"
                      >
                        <span
                          className="text-[8px] font-mono font-bold shrink-0"
                          style={{ color: stage.color }}
                        >
                          {t.id}
                        </span>
                        <span className="text-[8px] font-mono text-[var(--text-secondary)] truncate">
                          {t.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Glowing Arrow Connector */}
                {!isLast && (
                  <div className="flex items-start pt-10 px-1 shrink-0">
                    <svg width="28" height="20" viewBox="0 0 28 20">
                      <defs>
                        <linearGradient
                          id={`arrow-grad-${idx}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor={stage.color} stopOpacity="0.8" />
                          <stop
                            offset="100%"
                            stopColor={KILL_CHAIN_STAGES[idx + 1].color}
                            stopOpacity="0.8"
                          />
                        </linearGradient>
                        <filter id={`glow-${idx}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Arrow line */}
                      <line
                        x1="0"
                        y1="10"
                        x2="20"
                        y2="10"
                        stroke={`url(#arrow-grad-${idx})`}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        filter={`url(#glow-${idx})`}
                      />
                      {/* Arrowhead */}
                      <polygon
                        points="20,6 28,10 20,14"
                        fill={KILL_CHAIN_STAGES[idx + 1].color}
                        opacity="0.85"
                        filter={`url(#glow-${idx})`}
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Footer legend */}
      <div className="flex items-center gap-4 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Detected Stage</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-700" />
          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Unconfirmed</span>
        </div>
        <div className="ml-auto text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
          MITRE ATT&CK Mobile v14
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function DashboardCharts({ threatData, trendData }: ChartProps) {
  const hasTrend = trendData && trendData.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Chart 1: ATT&CK Kill Chain */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-[var(--text-secondary)] font-mono">
            ATT&CK Kill Chain Analysis
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
              Hover stages for techniques
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          </div>
        </div>
        <ATTACKKillChain />
      </div>

      {/* Chart 2: Risk Scoring Trend */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-[var(--text-secondary)] mb-4">
          Risk Assessment Timeline
        </h3>
        <div className="h-64">
          {hasTrend ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-lg">
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">{data.date}</p>
                          <p className="text-xs font-semibold text-cyan-400 mt-1">{data.file}</p>
                          <p className="text-xs text-[var(--text-primary)] mt-0.5">
                            Risk Level:{" "}
                            <span className="font-bold text-rose-400">{data.score}/100</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">No logs found.</span>
          )}
        </div>
      </div>
    </div>
  );
}

