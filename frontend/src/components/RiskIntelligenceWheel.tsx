"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Segment {
  label: string;
  sublabel: string;
  rawScore: number;   // 0-100 normalised score for this factor
  maxPts: number;     // max points this factor contributes to composite score
  color: string;
  glow: string;
  icon: string;
}

interface Props {
  riskScore: number;
  permissionScore: number;
  iocScore: number;
  keywordScore: number;
  aiConfidence: number;
  iocCount?: number;
  activityCount?: number;
  serviceCount?: number;
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function annularPath(
  cx: number, cy: number,
  r1: number, r2: number,
  a1: number, a2: number
): string {
  const p1 = polar(cx, cy, r1, a1);
  const p2 = polar(cx, cy, r2, a1);
  const p3 = polar(cx, cy, r2, a2);
  const p4 = polar(cx, cy, r1, a2);
  const large = a2 - a1 > 180 ? 1 : 0;
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `A ${r2} ${r2} 0 ${large} 1 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${large} 0 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

// ─── Risk meta ────────────────────────────────────────────────────────────────
function riskColor(score: number) {
  if (score >= 80) return "var(--critical)";
  if (score >= 60) return "var(--high)";
  if (score >= 40) return "var(--medium)";
  return "var(--low)";
}
function riskLabel(score: number) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

// ─── Easing ──────────────────────────────────────────────────────────────────
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }

// ─── Component ───────────────────────────────────────────────────────────────
export default function RiskIntelligenceWheel({
  riskScore,
  permissionScore,
  iocScore,
  keywordScore,
  aiConfidence,
  iocCount = 0,
  activityCount = 0,
  serviceCount = 0,
}: Props) {

  // Build segments with computed raw scores
  const segments: Segment[] = [
    {
      label: "Permissions Abuse",
      sublabel: "Dangerous API exploitation",
      rawScore: Math.min(100, (permissionScore / 40) * 100),
      maxPts: 40,
      color: "var(--wheel-0-color)",
      glow: "var(--wheel-0-glow)",
      icon: "🛡",
    },
    {
      label: "Threat Intel Match",
      sublabel: "IOC feed correlation",
      rawScore: Math.min(100, Math.max((iocScore / 20) * 100, iocCount * 12)),
      maxPts: 20,
      color: "var(--wheel-1-color)",
      glow: "var(--wheel-1-glow)",
      icon: "🌐",
    },
    {
      label: "Behavioral Indicators",
      sublabel: "Runtime activity risk",
      rawScore: Math.min(100, ((activityCount + serviceCount) / 22) * 100),
      maxPts: 15,
      color: "var(--wheel-2-color)",
      glow: "var(--wheel-2-glow)",
      icon: "⚡",
    },
    {
      label: "Brand Mimicry",
      sublabel: "Keyword & name spoofing",
      rawScore: Math.min(100, (keywordScore / 20) * 100),
      maxPts: 20,
      color: "var(--wheel-3-color)",
      glow: "var(--wheel-3-glow)",
      icon: "🎭",
    },
    {
      label: "C2 Infrastructure",
      sublabel: "Network IOC severity",
      rawScore: Math.min(100, iocCount * 18 + (iocScore / 20) * 40),
      maxPts: 15,
      color: "var(--wheel-4-color)",
      glow: "var(--wheel-4-glow)",
      icon: "📡",
    },
    {
      label: "AI Similarity Match",
      sublabel: "Malware family confidence",
      rawScore: Math.min(100, aiConfidence),
      maxPts: 20,
      color: "var(--wheel-5-color)",
      glow: "var(--wheel-5-glow)",
      icon: "🤖",
    },
  ];

  const totalMaxPts = segments.reduce((a, s) => a + s.maxPts, 0); // 130

  // ── Animation ──
  const [progress, setProgress] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const animRef = useRef<number | null>(null);
  const t0 = useRef<number | null>(null);
  const DURATION = 1600;

  useEffect(() => {
    const tick = (ts: number) => {
      if (!t0.current) t0.current = ts;
      const p = Math.min(1, (ts - t0.current) / DURATION);
      setProgress(easeOutCubic(p));
      if (p < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // ── SVG geometry ──
  const CX = 220, CY = 220;
  const INNER_R = 80;
  const MAX_EXT = 110;
  const N = segments.length;
  const GAP = 5;                          // degrees gap between segments
  const SEG_DEG = 360 / N - GAP;         // degrees each segment spans

  const rc = riskColor(riskScore);

  return (
    <div className="bg-card border rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-200"
      style={{ borderColor: "var(--card-border)", boxShadow: "var(--shadow-card)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b"
        style={{ backgroundColor: "var(--card-bg-secondary)", borderColor: "var(--card-border)" }}>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: rc }} />
          <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
            Risk Intelligence Wheel
          </span>
          <span className="text-[9px] font-mono border px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ color: "var(--text-muted)", borderColor: "var(--card-border)" }}>
            Weighted Multi-Factor Scoring
          </span>
        </div>
        <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
          {N} factors · {totalMaxPts} max pts
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">

        {/* ── SVG Wheel ── */}
        <div className="flex items-center justify-center p-4 flex-shrink-0">
          <svg viewBox="0 0 440 440" width="440" height="440">
            <defs>
              {/* Per-segment glow filters */}
              {segments.map((s, i) => (
                <filter key={i} id={`wglow-${i}`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              <filter id="center-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Tick line glow */}
              <filter id="tick-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Center radial gradient */}
              <radialGradient id="center-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={rc} stopOpacity="0.18" />
                <stop offset="60%" stopColor={rc} stopOpacity="0.06" />
                <stop offset="100%" stopColor={rc} stopOpacity="0" />
              </radialGradient>
              {/* Outer glow ring gradient */}
              <radialGradient id="outer-ring" cx="50%" cy="50%" r="50%">
                <stop offset="85%" stopColor="transparent" />
                <stop offset="100%" stopColor={rc} stopOpacity="0.05" />
              </radialGradient>
            </defs>

            {/* Background grid rings */}
            {[0.25, 0.5, 0.75, 1.0].map((f, i) => (
              <circle key={i}
                cx={CX} cy={CY}
                r={INNER_R + MAX_EXT * f}
                fill="none"
                stroke="rgba(30,41,59,0.5)"
                strokeWidth="0.6"
                strokeDasharray={i === 3 ? "none" : "2 8"}
              />
            ))}

            {/* Outer ambient ring */}
            <circle cx={CX} cy={CY} r={INNER_R + MAX_EXT + 22} fill="url(#outer-ring)" />

            {/* ── Segments ── */}
            {segments.map((seg, i) => {
              const startDeg = i * (SEG_DEG + GAP) - 90 + GAP / 2;
              const endDeg   = startDeg + SEG_DEG;
              const animScore = seg.rawScore * progress;
              const outerR    = INNER_R + (animScore / 100) * MAX_EXT;
              const trackR    = INNER_R + MAX_EXT;
              const isHov     = hoveredIdx === i;

              // Label position — beyond the full track radius
              const midDeg = startDeg + SEG_DEG / 2;
              const labelR = trackR + 26;
              const lp     = polar(CX, CY, labelR, midDeg);
              const anchor = lp.x > CX + 8 ? "start" : lp.x < CX - 8 ? "end" : "middle";

              // Contribution to composite score
              const pts = (seg.rawScore / 100) * seg.maxPts;
              const pct = riskScore > 0
                ? Math.round((pts / riskScore) * 100)
                : Math.round((pts / totalMaxPts) * 100);

              return (
                <g key={i} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}>

                  {/* Track ring (background) */}
                  <path
                    d={annularPath(CX, CY, INNER_R, trackR, startDeg, endDeg)}
                    fill={seg.color}
                    fillOpacity={0.07}
                    stroke={seg.color}
                    strokeOpacity={0.12}
                    strokeWidth="0.6"
                  />

                  {/* Active filled segment */}
                  <path
                    d={annularPath(CX, CY, INNER_R, Math.max(INNER_R + 1, outerR), startDeg, endDeg)}
                    fill={seg.color}
                    fillOpacity={isHov ? 0.95 : 0.78}
                    filter={isHov || animScore > 80 ? `url(#wglow-${i})` : undefined}
                    stroke={seg.color}
                    strokeWidth={isHov ? 1.5 : 0.5}
                    strokeOpacity="0.9"
                  />

                  {/* Outer tick marks at 25%/50%/75%/100% */}
                  {[0.25, 0.5, 0.75, 1.0].map((f, ti) => {
                    const tickDeg = startDeg + SEG_DEG * f;
                    const tp1 = polar(CX, CY, trackR - 2, tickDeg);
                    const tp2 = polar(CX, CY, trackR + 3, tickDeg);
                    return (
                      <line key={ti}
                        x1={tp1.x.toFixed(2)} y1={tp1.y.toFixed(2)}
                        x2={tp2.x.toFixed(2)} y2={tp2.y.toFixed(2)}
                        stroke={seg.color} strokeOpacity="0.4" strokeWidth="0.8"
                      />
                    );
                  })}

                  {/* Segment labels */}
                  <text x={lp.x} y={lp.y - 5}
                    textAnchor={anchor}
                    fill={isHov ? seg.color : "var(--text-secondary)"}
                    fontSize="8" fontFamily="monospace" fontWeight="700"
                    style={{ userSelect: "none", transition: "fill 0.15s" }}>
                    {seg.label}
                  </text>
                  <text x={lp.x} y={lp.y + 7}
                    textAnchor={anchor}
                    fill={isHov ? seg.color : "var(--text-muted)"}
                    fontSize="6.5" fontFamily="monospace"
                    style={{ userSelect: "none", transition: "fill 0.15s" }}>
                    {animScore.toFixed(0)}% · {pct}% share
                  </text>
                </g>
              );
            })}

            {/* ── Center ── */}
            {/* Glow disc */}
            <circle cx={CX} cy={CY} r={INNER_R + 6}
              fill="url(#center-bg)"
              filter="url(#center-glow)"
            />
            {/* Center border ring */}
            <circle cx={CX} cy={CY} r={INNER_R}
              fill="var(--background)"
              stroke={rc}
              strokeWidth="2.5"
              className="transition-all duration-200"
            />
            {/* Risk label */}
            <text x={CX} y={CY - 28}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="8" fontFamily="monospace" fontWeight="700"
              letterSpacing="2"
              style={{ userSelect: "none" }}>
              RISK SCORE
            </text>
            {/* Big score number */}
            <text x={CX} y={CY + 16}
              textAnchor="middle"
              fill={rc}
              fontSize="42" fontFamily="monospace" fontWeight="900"
              style={{ userSelect: "none" }}>
              {Math.round(riskScore * progress)}
            </text>
            {/* /100 */}
            <text x={CX} y={CY + 32}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="10" fontFamily="monospace"
              style={{ userSelect: "none" }}>
              / 100
            </text>
            {/* Severity label */}
            <text x={CX} y={CY + 52}
              textAnchor="middle"
              fill={rc}
              fontSize="10" fontFamily="monospace" fontWeight="800"
              letterSpacing="2"
              style={{ userSelect: "none" }}>
              {riskLabel(riskScore)}
            </text>

            {/* Center progress arc (thin ring inside INNER_R) */}
            {(() => {
              const r = INNER_R - 8;
              const circ = 2 * Math.PI * r;
              const dash = (riskScore / 100) * circ * progress;
              return (
                <circle cx={CX} cy={CY} r={r}
                  fill="none"
                  stroke={rc}
                  strokeWidth="2"
                  strokeOpacity="0.5"
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={circ * 0.25}
                  transform={`rotate(0 ${CX} ${CY})`}
                />
              );
            })()}
          </svg>
        </div>

        {/* ── Legend panel ── */}
        <div 
          className="flex-1 p-5 flex flex-col gap-3 justify-center border-l min-w-0 transition-all duration-200"
          style={{ backgroundColor: "var(--card-bg-secondary)", borderColor: "var(--card-border)" }}
        >
          <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            Factor Breakdown · Hover to inspect
          </div>

          {segments.map((seg, i) => {
            const animScore = seg.rawScore * progress;
            const pts       = (seg.rawScore / 100) * seg.maxPts;
            const pct       = riskScore > 0
              ? Math.round((pts / riskScore) * 100)
              : Math.round((pts / totalMaxPts) * 100);
            const isHov     = hoveredIdx === i;

            return (
              <div key={i}
                className="rounded-xl border p-3 transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isHov ? seg.color + "70" : "var(--card-border)",
                  background: isHov ? seg.color + "0d" : "var(--card)",
                  boxShadow: isHov ? `0 0 16px ${seg.glow}` : "none",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}>

                {/* Row 1: label + pts badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{seg.icon}</span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: "var(--text-primary)" }}>{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-[8px] font-mono border px-1.5 py-0.5 rounded"
                      style={{ color: "var(--text-muted)", borderColor: "var(--card-border)" }}
                    >
                      {pts.toFixed(1)}/{seg.maxPts}pts
                    </span>
                    <span className="text-[10px] font-mono font-black" style={{ color: seg.color }}>
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Row 2: sublabel */}
                <div className="text-[8px] font-mono mb-2" style={{ color: "var(--text-muted)" }}>{seg.sublabel}</div>

                {/* Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--card-bg-secondary)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${animScore}%`,
                        background: seg.color,
                        boxShadow: isHov ? `0 0 8px ${seg.color}` : "none",
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-mono w-8 text-right" style={{ color: seg.color }}>
                    {animScore.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* Total display */}
          <div 
            className="mt-1 p-3 rounded-xl border flex items-center justify-between transition-all duration-200"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--card-border)" }}
          >
            <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Composite Risk Score
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>{totalMaxPts} max pts</span>
              <span className="text-base font-black font-mono" style={{ color: rc }}>
                {Math.round(riskScore * progress)} / 100
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border"
                style={{ color: rc, borderColor: rc + "40", background: rc + "12" }}>
                {riskLabel(riskScore)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
