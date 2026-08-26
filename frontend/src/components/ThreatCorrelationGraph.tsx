"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface ThreatNode {
  id: string;
  label: string;
  sublabel?: string;
  group: "center" | "domain" | "ip" | "family" | "mitre" | "sample";
  confidence: number;
  x: number;
  y: number;
}

interface ThreatEdge {
  source: string;
  target: string;
  label: string;
  animated?: boolean;
}

interface Props {
  fileName: string;
  threatFamily: string | null;
  riskScore: number;
  mitreTags: { id: string; name: string }[];
  iocs: { type: string; value: string; severity: string }[];
}

// ─── Colour palette per group ──────────────────────────────────────────────
const GROUP_STYLE: Record<
  ThreatNode["group"],
  { stroke: string; fill: string; glow: string; label: string }
> = {
  center:  { stroke: "var(--node-center-stroke)", fill: "var(--node-center-fill)",  glow: "var(--node-center-glow)",  label: "Target APK"     },
  domain:  { stroke: "var(--node-domain-stroke)", fill: "var(--node-domain-fill)",  glow: "var(--node-domain-glow)",  label: "Malicious Domain"},
  ip:      { stroke: "var(--node-ip-stroke)", fill: "var(--node-ip-fill)",  glow: "var(--node-ip-glow)",   label: "C2 IP Address"  },
  family:  { stroke: "var(--node-family-stroke)", fill: "var(--node-family-fill)",  glow: "var(--node-family-glow)",  label: "Threat Family"  },
  mitre:   { stroke: "var(--node-mitre-stroke)", fill: "var(--node-mitre-fill)",  glow: "var(--node-mitre-glow)",  label: "MITRE Technique" },
  sample:  { stroke: "var(--node-sample-stroke)", fill: "var(--node-sample-fill)",  glow: "var(--node-sample-glow)", label: "Similar Sample" },
};

// ─── Static graph layout ───────────────────────────────────────────────────
const buildNodes = (
  fileName: string,
  threatFamily: string | null,
  mitreTags: { id: string; name: string }[],
  iocs: { type: string; value: string; severity: string }[]
): ThreatNode[] => {
  const cx = 500, cy = 340;

  // Center
  const nodes: ThreatNode[] = [
    { id: "center", label: fileName || "Suspicious_KYC_Update.apk", group: "center", confidence: 100, x: cx, y: cy },
  ];

  // Domain IOC (real or fallback)
  const domainIoc = iocs.find(i => i.type === "Domain" || i.type === "domain");
  nodes.push({
    id: "domain-1",
    label: domainIoc?.value ?? "kyc-verification-gateway.net",
    sublabel: "Malicious Domain",
    group: "domain",
    confidence: 94,
    x: cx - 270,
    y: cy - 120,
  });

  // C2 IP (real or fallback)
  const ipIoc = iocs.find(i => i.type === "IP" || i.type === "ip");
  nodes.push({
    id: "ip-1",
    label: ipIoc?.value ?? "91.202.17.44",
    sublabel: "C2 Server",
    group: "ip",
    confidence: 97,
    x: cx + 270,
    y: cy - 120,
  });

  // Threat family
  nodes.push({
    id: "family-1",
    label: threatFamily ?? "Banking Trojan",
    sublabel: "Threat Family",
    group: "family",
    confidence: 91,
    x: cx,
    y: cy - 220,
  });

  // MITRE techniques (up to 3)
  const tags = mitreTags.length > 0
    ? mitreTags.slice(0, 3)
    : [
        { id: "T1412", name: "Capture SMS Messages" },
        { id: "T1082", name: "System Info Discovery" },
        { id: "T1043", name: "Commonly Used Port"   },
      ];
  const mitreAngles = [-30, -90, -150]; // degrees along bottom
  tags.forEach((t, i) => {
    const angle = ((mitreAngles[i] ?? -90 + i * 40) * Math.PI) / 180;
    nodes.push({
      id: `mitre-${i}`,
      label: t.id,
      sublabel: t.name,
      group: "mitre",
      confidence: 85 - i * 3,
      x: cx + 240 * Math.cos(angle),
      y: cy + 240 * Math.sin(angle + Math.PI / 2) * -1 + 180,
    });
  });

  // Similar samples (hardcoded + any extra IP iocs)
  const samples = ["sbi_secure_token.apk", "whatsapp_gold_helper.apk"];
  samples.forEach((s, i) => {
    nodes.push({
      id: `sample-${i}`,
      label: s,
      sublabel: "Similar Sample",
      group: "sample",
      confidence: 78 - i * 5,
      x: cx + (i === 0 ? -260 : 260),
      y: cy + 200,
    });
  });

  return nodes;
};

const buildEdges = (nodes: ThreatNode[]): ThreatEdge[] => [
  { source: "center",   target: "domain-1",  label: "RESOLVES TO",       animated: true  },
  { source: "center",   target: "ip-1",      label: "C2 BEACON",         animated: true  },
  { source: "center",   target: "family-1",  label: "CLASSIFIED AS",     animated: false },
  { source: "center",   target: "mitre-0",   label: "USES TECHNIQUE",    animated: false },
  { source: "center",   target: "mitre-1",   label: "USES TECHNIQUE",    animated: false },
  { source: "center",   target: "mitre-2",   label: "USES TECHNIQUE",    animated: false },
  { source: "center",   target: "sample-0",  label: "SHARES SIGNATURE",  animated: true  },
  { source: "center",   target: "sample-1",  label: "SHARES SIGNATURE",  animated: true  },
  { source: "domain-1", target: "ip-1",      label: "RESOLVES TO",       animated: true  },
  { source: "family-1", target: "sample-0",  label: "SAME FAMILY",       animated: false },
  { source: "family-1", target: "sample-1",  label: "SAME FAMILY",       animated: false },
];

// ─── Component ─────────────────────────────────────────────────────────────
export default function ThreatCorrelationGraph({
  fileName,
  threatFamily,
  riskScore,
  mitreTags,
  iocs,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes]  = useState<ThreatNode[]>(() => buildNodes(fileName, threatFamily, mitreTags, iocs));
  const [edges]  = useState<ThreatEdge[]>(() => buildEdges(buildNodes(fileName, threatFamily, mitreTags, iocs)));
  const [hovered, setHovered] = useState<ThreatNode | null>(null);
  const [selected, setSelected] = useState<ThreatNode | null>(null);

  // Pan & zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const lastPos  = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest(".node-group")) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.min(2.5, Math.max(0.35, t.scale * delta)) }));
  }, []);

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // Animation tick for dash offset
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const VIEWBOX_W = 1000;
  const VIEWBOX_H = 680;

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="flex flex-col h-full gap-3 select-none">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--critical)", boxShadow: "0 0 6px var(--critical)" }} />
            <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Live Correlation</span>
          </div>
          <div className="h-3 w-px" style={{ backgroundColor: "var(--card-border)" }} />
          {Object.entries(GROUP_STYLE).map(([key, s]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: s.stroke, boxShadow: `0 0 4px ${s.stroke}` }} />
              <span className="text-[8px] font-mono" style={{ color: "var(--text-muted)" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider">
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.min(2.5, t.scale * 1.2) }))}
            className="w-6 h-6 flex items-center justify-center rounded border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-xs transition-colors">+</button>
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.35, t.scale * 0.8) }))}
            className="w-6 h-6 flex items-center justify-center rounded border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-xs transition-colors">−</button>
          <button onClick={resetView}
            className="px-2 h-6 flex items-center justify-center rounded border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[9px] transition-colors uppercase tracking-wider">Reset</button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div 
        className="relative flex-1 min-h-[460px] rounded-xl border overflow-hidden transition-all duration-200"
        style={{ cursor: dragging.current ? "grabbing" : "grab", backgroundColor: "var(--graph-bg)", borderColor: "var(--card-border)" }}
      >

        {/* Animated grid bg */}
        <div className="absolute inset-0 pointer-events-none transition-all duration-200"
          style={{
            backgroundImage: "linear-gradient(var(--graph-grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--graph-grid-line) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        {/* Corner labels */}
        <div className="absolute top-3 left-3 text-[9px] font-mono uppercase tracking-widest pointer-events-none" style={{ color: "var(--text-muted)" }}>
          THREAT CORRELATION MATRIX
        </div>
        <div className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-widest pointer-events-none" style={{ color: "var(--text-muted)" }}>
          IBM X-FORCE INTELLIGENCE LAYER
        </div>
        <div className="absolute bottom-3 left-3 text-[9px] font-mono pointer-events-none" style={{ color: "var(--text-muted)" }}>
          Scroll to zoom · Drag canvas to pan · Click node to inspect
        </div>
        <div className="absolute bottom-3 right-3 text-[9px] font-mono pointer-events-none"
          style={{ color: riskScore >= 80 ? "var(--critical)" : riskScore >= 60 ? "var(--high)" : "var(--medium)" }}>
          RISK SCORE: {riskScore}/100
        </div>

        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        >
          <defs>
            {/* Glow filters per group */}
            {Object.entries(GROUP_STYLE).map(([key, s]) => (
              <filter key={key} id={`glow-${key}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor={s.stroke} floodOpacity="0.8" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
            {/* Animated dash marker */}
            <marker id="arrowCyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--primary)" opacity="0.8" />
            </marker>
            <marker id="arrowRose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--critical)" opacity="0.8" />
            </marker>
          </defs>

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>

            {/* ── Edges ── */}
            {edges.map((edge, i) => {
              const src = getNodeById(edge.source);
              const tgt = getNodeById(edge.target);
              if (!src || !tgt) return null;

              const srcStyle = GROUP_STYLE[src.group];
              const tgtStyle = GROUP_STYLE[tgt.group];

              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              // shorten line so it starts/ends at node border
              const srcR = src.group === "center" ? 42 : 32;
              const tgtR = tgt.group === "center" ? 42 : 32;
              const x1 = src.x + (dx / len) * srcR;
              const y1 = src.y + (dy / len) * srcR;
              const x2 = tgt.x - (dx / len) * tgtR;
              const y2 = tgt.y - (dy / len) * tgtR;

              // midpoint for label
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              const gradId = `grad-edge-${i}`;
              const dashOffset = edge.animated ? -(tick * 1.4) % 24 : 0;

              return (
                <g key={i}>
                  <defs>
                    <linearGradient id={gradId}
                      gradientUnits="userSpaceOnUse"
                      x1={x1} y1={y1} x2={x2} y2={y2}>
                      <stop offset="0%"   stopColor={srcStyle.stroke} stopOpacity="0.7" />
                      <stop offset="100%" stopColor={tgtStyle.stroke} stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  {/* Glow backing */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={srcStyle.stroke} strokeWidth={edge.animated ? 3 : 1.5}
                    strokeOpacity="0.12" />
                  {/* Main line */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={`url(#${gradId})`}
                    strokeWidth={edge.animated ? 1.5 : 1}
                    strokeDasharray={edge.animated ? "8 4" : "4 3"}
                    strokeDashoffset={dashOffset}
                    markerEnd="url(#arrowCyan)"
                  />
                  {/* Edge label */}
                  <text x={mx} y={my - 5} textAnchor="middle"
                    fill="var(--text-muted)" fontSize="7" fontFamily="monospace"
                    style={{ userSelect: "none" }}>
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {nodes.map(node => {
              const s = GROUP_STYLE[node.group];
              const isCenter = node.group === "center";
              const r = isCenter ? 42 : 32;
              const isHov = hovered?.id === node.id;
              const isSel = selected?.id === node.id;

              return (
                <g
                  key={node.id}
                  className="node-group"
                  transform={`translate(${node.x},${node.y})`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(node)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(prev => prev?.id === node.id ? null : node)}
                >
                  {/* Outer glow pulse ring for center & animated edges */}
                  {(isCenter || isHov) && (
                    <circle r={r + 10} fill="none" stroke={s.stroke}
                      strokeWidth="1" strokeOpacity={isHov ? "0.35" : "0.18"}
                      strokeDasharray="3 4" />
                  )}
                  {isSel && (
                    <circle r={r + 16} fill="none" stroke={s.stroke}
                      strokeWidth="1.5" strokeOpacity="0.5"
                      strokeDasharray="2 3"
                      style={{ animation: "spin 6s linear infinite", transformOrigin: "center" }} />
                  )}

                  {/* Node body */}
                  <circle r={r} fill={s.fill} stroke={s.stroke}
                    strokeWidth={isHov || isSel ? 2.5 : 1.5}
                    filter={isHov || isSel || isCenter ? `url(#glow-${node.group})` : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Confidence arc */}
                  {(() => {
                    const circ = 2 * Math.PI * r;
                    const dash = (node.confidence / 100) * circ;
                    return (
                      <circle r={r} fill="none" stroke={s.stroke}
                        strokeWidth="2.5" strokeOpacity="0.5"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={circ * 0.25}
                        transform="rotate(-90)"
                      />
                    );
                  })()}

                  {/* Label */}
                  <text textAnchor="middle" dominantBaseline="middle"
                    fill={s.stroke} fontSize={isCenter ? "8" : "7"}
                    fontFamily="monospace" fontWeight="bold"
                    style={{ userSelect: "none" }}>
                    {node.label.length > 18 ? node.label.substring(0, 16) + "…" : node.label}
                  </text>

                  {/* Sublabel below node */}
                  {node.sublabel && (
                    <text x="0" y={r + 12} textAnchor="middle"
                      fill="var(--text-muted)" fontSize="6.5" fontFamily="monospace"
                      style={{ userSelect: "none" }}>
                      {node.sublabel}
                    </text>
                  )}

                  {/* Confidence badge */}
                  <text x={r - 2} y={-r + 2} textAnchor="middle"
                    fill={s.stroke} fontSize="6" fontFamily="monospace" fontWeight="bold"
                    style={{ userSelect: "none" }}>
                    {node.confidence}%
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ── Node Inspector Panel ── */}
        {selected && (() => {
          const s = GROUP_STYLE[selected.group];
          return (
            <div className="absolute top-3 right-3 w-56 rounded-xl border p-4 space-y-3 backdrop-blur-md z-30"
              style={{ borderColor: s.stroke + "55", background: "var(--card)", boxShadow: `0 4px 20px rgba(124,58,237,.12)` }}>
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--card-border)" }}>
                <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: s.stroke }}>
                  {s.label}
                </span>
                <button onClick={() => setSelected(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs leading-none">✕</button>
              </div>
              <div className="space-y-2 text-[10px] font-mono" style={{ color: "var(--text-secondary)" }}>
                <div>
                  <span className="text-[var(--text-muted)] text-[8px] block uppercase tracking-wider">Entity</span>
                  <span className="font-semibold break-all" style={{ color: "var(--text-primary)" }}>{selected.label}</span>
                </div>
                {selected.sublabel && (
                  <div>
                    <span className="text-[var(--text-muted)] text-[8px] block uppercase tracking-wider">Type</span>
                    <span>{selected.sublabel}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[var(--text-muted)] text-[8px] block uppercase tracking-wider">Confidence</span>
                    <span className="font-bold" style={{ color: s.stroke }}>{selected.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] text-[8px] block uppercase tracking-wider">Group</span>
                    <span className="capitalize">{selected.group}</span>
                  </div>
                </div>
                <div className="h-0.5 w-full rounded-full overflow-hidden bg-slate-900">
                  <div className="h-full rounded-full" style={{ width: `${selected.confidence}%`, background: s.stroke, boxShadow: `0 0 6px ${s.stroke}` }} />
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
