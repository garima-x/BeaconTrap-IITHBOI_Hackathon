"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import SocPanel from "./SocPanel";
import { ThreatFamilyStat } from "@/types/dashboard";

interface TopThreatFamiliesProps {
  families: ThreatFamilyStat[];
}

const BAR_COLORS = ["var(--severity-critical)", "var(--severity-high)", "var(--severity-medium)", "var(--accent)", "var(--severity-low)"];

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export default function TopThreatFamilies({ families }: TopThreatFamiliesProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = families.slice(0, 6).map((f) => ({
    name: f.name.length > 16 ? f.name.slice(0, 14) + "…" : f.name,
    fullName: f.name,
    count: f.count,
    avgRisk: f.avgRisk,
  }));

  return (
    <SocPanel
      title="TOP THREAT FAMILIES"
      subtitle="Malware classification distribution & campaign density"
      badge={`${families.length} FAMILIES`}
    >
      <div className="space-y-4 font-mono text-xs">
        <div className="h-44">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={false} fontFamily="monospace" />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={9}
                  tickLine={false}
                  width={110}
                  fontFamily="monospace"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl p-2 text-xs font-mono">
                        <p className="font-bold text-[var(--text-primary)]">{d.fullName}</p>
                        <p className="text-[var(--text-muted)] text-[10px] mt-1">
                          {d.count} cases · Avg risk {d.avgRisk}/100
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={12}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[var(--text-muted)]">
              Loading threat distribution spectrum...
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          {families.slice(0, 5).map((f, idx) => {
            const TrendIcon = TREND_ICON[f.trend];
            return (
              <div
                key={f.name}
                className="flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: BAR_COLORS[idx % BAR_COLORS.length] }}
                  />
                  <span className="text-[var(--text-primary)] font-bold truncate max-w-[150px]">{f.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-muted)] text-[11px]">{f.count} cases</span>
                  <span className={f.avgRisk >= 80 ? "text-[var(--severity-critical)] font-bold" : "text-[var(--severity-medium)]"}>
                    {f.avgRisk}
                  </span>
                  <TrendIcon className={`w-3.5 h-3.5 ${f.trend === "up" ? "text-[var(--severity-critical)]" : f.trend === "down" ? "text-[var(--severity-low)]" : "text-[var(--text-muted)]"}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SocPanel>
  );
}
