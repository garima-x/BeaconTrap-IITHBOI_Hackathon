"use client";

import React, { useEffect, useRef, useState } from "react";

// ─── Mercator helpers (1000×520 viewbox) ─────────────────────────────────────
const W = 1000, H = 520;
function mx(lon: number) { return ((lon + 180) / 360) * W; }
function my(lat: number) { return ((90 - lat) / 180) * H; }

// ─── Simplified continent SVG paths ──────────────────────────────────────────
const CONTINENTS = [
  // North America
  "M 160,62 L 188,52 L 232,58 L 270,72 L 294,96 L 310,128 L 296,164 L 272,182 L 252,178 L 238,192 L 212,200 L 206,182 L 218,158 L 228,132 L 210,112 L 180,100 L 158,86 Z",
  // South America
  "M 234,218 L 264,212 L 292,222 L 308,254 L 312,292 L 298,334 L 282,358 L 260,352 L 244,328 L 238,294 L 232,262 L 228,238 Z",
  // Europe
  "M 478,80 L 512,72 L 548,78 L 562,98 L 558,118 L 540,124 L 516,120 L 497,128 L 482,118 L 476,102 Z",
  // Africa
  "M 490,142 L 532,136 L 566,148 L 582,176 L 588,218 L 578,262 L 558,302 L 532,322 L 510,312 L 492,282 L 486,242 L 490,192 L 486,166 Z",
  // Asia (combined Russia + Asia)
  "M 558,38 L 652,28 L 752,33 L 824,44 L 862,62 L 866,98 L 858,148 L 832,164 L 800,170 L 762,172 L 718,158 L 678,154 L 640,162 L 602,158 L 564,142 L 553,116 L 556,72 L 554,52 Z",
  // India peninsula
  "M 714,162 L 734,162 L 750,185 L 742,218 L 724,232 L 710,218 L 704,195 Z",
  // SE Asia / Indochina
  "M 780,155 L 808,148 L 820,165 L 816,188 L 800,196 L 782,182 Z",
  // Australia
  "M 832,298 L 880,286 L 922,296 L 938,322 L 924,352 L 886,362 L 854,352 L 834,326 Z",
  // Greenland
  "M 348,28 L 382,22 L 408,36 L 404,62 L 382,70 L 356,60 Z",
  // Japan
  "M 862,110 L 876,102 L 888,116 L 878,132 L 866,128 Z",
  // UK
  "M 468,84 L 478,80 L 482,96 L 472,100 Z",
];

// ─── Threat nodes ─────────────────────────────────────────────────────────────
interface ThreatLocation {
  id: string;
  label: string;
  sublabel: string;
  role: "origin" | "c2" | "victim";
  lon: number;
  lat: number;
  volume: number;       // attack volume 0-100
  confidence: number;   // 0-100
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

const LOCATIONS: ThreatLocation[] = [
  { id: "russia",      label: "Russia",       sublabel: "Moscow",          role: "origin",  lon: 37,   lat: 55.7, volume: 87, confidence: 94, severity: "CRITICAL" },
  { id: "netherlands", label: "Netherlands",  sublabel: "Amsterdam",       role: "c2",      lon: 4.9,  lat: 52.4, volume: 62, confidence: 88, severity: "HIGH"     },
  { id: "usa-c2",      label: "USA",          sublabel: "Bulletproof C2",  role: "c2",      lon: -77,  lat: 38.9, volume: 71, confidence: 82, severity: "HIGH"     },
  { id: "china",       label: "China",        sublabel: "Origin Infra",    role: "origin",  lon: 116,  lat: 39.9, volume: 91, confidence: 96, severity: "CRITICAL" },
  { id: "india",       label: "India",        sublabel: "Primary Target",  role: "victim",  lon: 78.9, lat: 20.6, volume: 96, confidence: 97, severity: "CRITICAL" },
  { id: "singapore",   label: "Singapore",    sublabel: "Transit Relay",   role: "c2",      lon: 103.8,lat: 1.3,  volume: 44, confidence: 78, severity: "MEDIUM"   },
];

// ─── Attack routes ────────────────────────────────────────────────────────────
interface AttackRoute {
  from: string;
  to: string;
  label: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

const ROUTES: AttackRoute[] = [
  { from: "russia",      to: "india",     label: "SMS Intercept Campaign", severity: "CRITICAL" },
  { from: "netherlands", to: "india",     label: "C2 Command Relay",       severity: "HIGH"     },
  { from: "usa-c2",      to: "india",     label: "Phishing Infrastructure",severity: "HIGH"     },
  { from: "china",       to: "india",     label: "Banking Trojan Payload", severity: "CRITICAL" },
  { from: "china",       to: "singapore", label: "Transit Routing",        severity: "MEDIUM"   },
  { from: "singapore",   to: "india",     label: "Relay Forward",          severity: "MEDIUM"   },
];

const SEVERITY_COLORS = {
  CRITICAL: { stroke: "var(--severity-critical)", glow: "rgba(229,72,77,0.3)", text: "var(--severity-critical)" },
  HIGH:     { stroke: "var(--severity-high)", glow: "rgba(240,136,62,0.3)", text: "var(--severity-high)" },
  MEDIUM:   { stroke: "var(--severity-medium)", glow: "rgba(232,197,71,0.3)", text: "var(--severity-medium)" },
};

const ROLE_COLORS = {
  origin:  { fill: "var(--severity-critical)", label: "Origin Infra",  icon: "⚠" },
  c2:      { fill: "var(--severity-high)", label: "C2 Server",     icon: "⚡" },
  victim:  { fill: "var(--accent)", label: "Victim Region", icon: "🎯" },
};

// ─── Quadratic bezier midpoint arc helper ────────────────────────────────────
function arcPath(x1: number, y1: number, x2: number, y2: number, bulge = 0.35): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const cx = mx - dy * bulge;
  const cy = my + dx * bulge - len * 0.08;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function pathLength(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.4;
}

// ─── Minibar ─────────────────────────────────────────────────────────────────
function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 h-1 bg-[var(--border)] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorldThreatMap() {
  const [tick, setTick] = useState(0);
  const [hoveredLoc, setHoveredLoc] = useState<ThreatLocation | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<AttackRoute | null>(null);
  const [activeEvents, setActiveEvents] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 40);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
      const key = `${route.from}-${route.to}`;
      setActiveEvents(prev => [...prev.filter(k => k !== key), key]);
      setTimeout(() => setActiveEvents(prev => prev.filter(k => k !== key)), 1800);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const locCoords = Object.fromEntries(
    LOCATIONS.map(l => [l.id, { x: mx(l.lon), y: my(l.lat) }])
  );

  const criticalCount = LOCATIONS.filter(l => l.severity === "CRITICAL").length;
  const avgConf = Math.round(LOCATIONS.reduce((a, l) => a + l.confidence, 0) / LOCATIONS.length);

  return (
    <div 
      className="w-full border border-[var(--border)] rounded-2xl overflow-hidden transition-all bg-[var(--bg-panel)] font-mono"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-panel-alt)]"
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[var(--severity-critical)] animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Global Threat Intelligence Map
          </span>
          <span className="text-[9px] font-mono border border-[var(--border)] px-2 py-0.5 rounded-2xl uppercase tracking-wider text-[var(--text-muted)]">
            LIVE · NODE IND LEAP-205
          </span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS.origin.fill }} />
            <span className="text-[var(--text-muted)] uppercase">Origin Infra</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS.c2.fill }} />
            <span className="text-[var(--text-muted)] uppercase">C2 Server</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS.victim.fill }} />
            <span className="text-[var(--text-muted)] uppercase">Victim Region</span>
          </div>
        </div>
      </div>

      {/* Map + Sidebar layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Map Canvas */}
        <div className="relative flex-1 min-h-[440px] bg-[var(--bg-base)]">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ display: "block" }}>
            <defs>
              {(["CRITICAL","HIGH","MEDIUM"] as const).map(sev => (
                <marker key={sev} id={`arrow-${sev}`}
                  markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                  <path d="M0,0 L5,2.5 L0,5 Z" fill={SEVERITY_COLORS[sev].stroke} opacity="0.9" />
                </marker>
              ))}
            </defs>

            {/* Continents */}
            {CONTINENTS.map((d, i) => (
              <path key={i} d={d}
                fill="var(--bg-panel-alt)"
                stroke="var(--border)"
                strokeWidth="0.8"
                className="transition-all"
              />
            ))}

            {/* Latitude / Longitude graticule lines */}
            {[-60,-30,0,30,60].map(lat => (
              <line key={`lat${lat}`}
                x1={0} y1={my(lat)} x2={W} y2={my(lat)}
                stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.5" />
            ))}
            {[-120,-60,0,60,120].map(lon => (
              <line key={`lon${lon}`}
                x1={mx(lon)} y1={0} x2={mx(lon)} y2={H}
                stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.5" />
            ))}

            {/* Attack arcs */}
            {ROUTES.map((route) => {
              const src = locCoords[route.from];
              const dst = locCoords[route.to];
              if (!src || !dst) return null;

              const sc = SEVERITY_COLORS[route.severity];
              const key = `${route.from}-${route.to}`;
              const isActive = activeEvents.includes(key);
              const isHov = hoveredRoute?.from === route.from && hoveredRoute?.to === route.to;
              const pLen = pathLength(src.x, src.y, dst.x, dst.y);
              const dashLen = 20, gapLen = pLen - dashLen;
              const offset = -((tick * 2.5) % pLen);

              const d = arcPath(src.x, src.y, dst.x, dst.y);

              return (
                <g key={key} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredRoute(route)}
                  onMouseLeave={() => setHoveredRoute(null)}>
                  <path d={d} fill="none"
                    stroke={sc.stroke} strokeWidth={isActive || isHov ? 5 : 2.5}
                    strokeOpacity={isActive ? 0.35 : isHov ? 0.25 : 0.12} />
                  <path d={d} fill="none"
                    stroke={sc.stroke}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeOpacity={isActive ? 1 : isHov ? 0.85 : 0.6}
                    strokeDasharray={`${dashLen} ${gapLen}`}
                    strokeDashoffset={offset}
                    markerEnd={`url(#arrow-${route.severity})`}
                  />
                </g>
              );
            })}

            {/* Threat nodes */}
            {LOCATIONS.map(loc => {
              const c = locCoords[loc.id];
              const rc = ROLE_COLORS[loc.role];
              const isHov = hoveredLoc?.id === loc.id;
              const r = loc.role === "victim" ? 10 : 7;
              const blink = loc.role !== "victim" && (tick % 30) < 8;

              return (
                <g key={loc.id} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredLoc(loc)}
                  onMouseLeave={() => setHoveredLoc(null)}>
                  {isHov && (
                    <circle cx={c.x} cy={c.y} r={r + 12}
                      fill="none" stroke={rc.fill}
                      strokeWidth="1" strokeOpacity="0.4"
                      strokeDasharray="3 4" />
                  )}
                  <circle cx={c.x} cy={c.y} r={r}
                    fill="var(--bg-panel)" stroke={rc.fill}
                    strokeWidth={isHov ? 2.5 : 1.8}
                    opacity={blink ? 1 : 0.85}
                  />
                  <circle cx={c.x} cy={c.y} r={r * 0.4}
                    fill={rc.fill} opacity={blink ? 1 : 0.7} />
                  <text x={c.x} y={c.y + r + 11}
                    textAnchor="middle"
                    fill={rc.fill} fontSize="8" fontFamily="monospace" fontWeight="bold"
                    style={{ userSelect: "none" }}>
                    {loc.label.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip for hovered location */}
          {hoveredLoc && (() => {
            const c = locCoords[hoveredLoc.id];
            const rc = ROLE_COLORS[hoveredLoc.role];
            const sc = SEVERITY_COLORS[hoveredLoc.severity];
            const px = (c.x / W) * 100;
            const py = (c.y / H) * 100;
            return (
              <div className="absolute z-30 pointer-events-none w-48 rounded-2xl border border-[var(--border)] p-3 space-y-2 font-mono bg-[var(--bg-panel)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: rc.fill }}>
                    {rc.label}
                  </span>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-2xl border font-bold uppercase"
                    style={{ color: sc.text, borderColor: sc.stroke, background: "transparent" }}>
                    {hoveredLoc.severity}
                  </span>
                </div>
                <div className="space-y-1 text-[9px] font-mono text-[var(--text-muted)]">
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="font-bold text-[var(--text-primary)]">{hoveredLoc.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Node</span>
                    <span>{hoveredLoc.sublabel}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span>Volume</span>
                    <Bar value={hoveredLoc.volume} color={rc.fill} />
                    <span style={{ color: rc.fill }} className="font-bold">{hoveredLoc.volume}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span>Conf.</span>
                    <Bar value={hoveredLoc.confidence} color={sc.stroke} />
                    <span style={{ color: sc.stroke }} className="font-bold">{hoveredLoc.confidence}%</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-[var(--border)] flex flex-col shrink-0 bg-[var(--bg-panel-alt)] font-mono">
          {/* Live KPIs */}
          <div className="p-4 border-b border-[var(--border)] space-y-3">
            <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Global Threat Status</div>

            <div className="grid grid-cols-3 gap-2 text-mono">
              <div className="rounded-2xl p-2 text-center border border-[var(--border)] bg-[var(--bg-panel)]">
                <div className="text-[var(--severity-critical)] text-lg font-bold font-mono">{criticalCount}</div>
                <div className="text-[8px] font-mono uppercase text-[var(--text-muted)]">Critical</div>
              </div>
              <div className="rounded-2xl p-2 text-center border border-[var(--border)] bg-[var(--bg-panel)]">
                <div className="text-[var(--severity-high)] text-lg font-bold font-mono">{ROUTES.length}</div>
                <div className="text-[8px] font-mono uppercase text-[var(--text-muted)]">Routes</div>
              </div>
              <div className="rounded-2xl p-2 text-center border border-[var(--border)] bg-[var(--bg-panel)]">
                <div className="text-[var(--accent)] text-lg font-bold font-mono">{avgConf}%</div>
                <div className="text-[8px] font-mono uppercase text-[var(--text-muted)]">Conf.</div>
              </div>
            </div>
          </div>

          {/* Threat node list */}
          <div className="p-3 border-b border-[var(--border)] space-y-2">
            <div className="text-[9px] font-mono uppercase tracking-wider mb-2 text-[var(--text-muted)] font-semibold">Node Directory</div>
            {LOCATIONS.map(loc => {
              const rc = ROLE_COLORS[loc.role];
              const sc = SEVERITY_COLORS[loc.severity];
              return (
                <div key={loc.id}
                  className="flex items-center gap-2 rounded-2xl px-2.5 py-1.5 border border-[var(--border)] bg-[var(--bg-panel)] cursor-pointer transition-colors hover:border-[var(--accent)]/40"
                  onMouseEnter={() => setHoveredLoc(loc)}
                  onMouseLeave={() => setHoveredLoc(null)}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: rc.fill }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono font-bold truncate text-[var(--text-primary)]">{loc.label}</div>
                    <div className="text-[8px] font-mono truncate text-[var(--text-muted)]">{loc.sublabel}</div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[8px] font-mono font-bold" style={{ color: sc.text }}>{loc.severity}</span>
                    <span className="text-[7px] font-mono text-[var(--text-muted)]">VOL {loc.volume}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-[var(--border)]">
            <div className="text-[8px] font-mono text-center uppercase tracking-wider text-[var(--text-muted)]">
              BeaconTrap · Global Intel Layer · Live
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
