"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SocPanel from "./SocPanel";
import { CorrelationFlowNode, CorrelationFlowEdge } from "@/types/dashboard";

interface ThreatCorrelationFlowProps {
  nodes: CorrelationFlowNode[];
  edges: CorrelationFlowEdge[];
}

const NODE_COLORS: Record<CorrelationFlowNode["type"], { border: string; bg: string; text: string }> = {
  apk: { border: "var(--severity-critical)", bg: "var(--bg-panel-alt)", text: "var(--severity-critical)" },
  domain: { border: "var(--severity-high)", bg: "var(--bg-panel-alt)", text: "var(--severity-high)" },
  ip: { border: "var(--severity-critical)", bg: "var(--bg-panel-alt)", text: "var(--severity-critical)" },
  family: { border: "var(--accent)", bg: "var(--bg-panel-alt)", text: "var(--accent)" },
  mitre: { border: "var(--accent-cool)", bg: "var(--bg-panel-alt)", text: "var(--accent-cool)" },
  campaign: { border: "var(--accent-cool)", bg: "var(--bg-panel-alt)", text: "var(--accent-cool)" },
};

function IntelNode({ data }: { data: { label: string; sublabel?: string; type: CorrelationFlowNode["type"]; risk: number } }) {
  const colors = NODE_COLORS[data.type] ?? NODE_COLORS.apk;

  return (
    <div
      className="rounded-2xl border px-3 py-2 min-w-[120px] max-w-[160px] transition-colors font-mono"
      style={{
        borderColor: colors.border,
        background: colors.bg,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--border)] !w-2 !h-2 !border-0" />
      <div className="text-[8px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-0.5 font-semibold">
        {data.type.replace("_", " ")}
      </div>
      <div className="text-[10px] font-mono font-bold truncate" style={{ color: colors.text }}>
        {data.label}
      </div>
      {data.sublabel && (
        <div className="text-[8px] font-mono text-[var(--text-muted)] truncate">{data.sublabel}</div>
      )}
      <div className="text-[8px] font-mono mt-1" style={{ color: colors.text }}>
        Risk: {data.risk}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--border)] !w-2 !h-2 !border-0" />
    </div>
  );
}

const nodeTypes = { intel: IntelNode };

export default function ThreatCorrelationFlow({ nodes: rawNodes, edges: rawEdges }: ThreatCorrelationFlowProps) {
  const { nodes, edges } = useMemo(() => {
    const radius = 180;
    const others = rawNodes.slice(1);

    const flowNodes: Node[] = rawNodes.map((n, i) => {
      let x = 250;
      let y = 200;

      if (i > 0) {
        const angle = ((i - 1) / Math.max(others.length, 1)) * 2 * Math.PI - Math.PI / 2;
        x = 250 + radius * Math.cos(angle);
        y = 200 + radius * Math.sin(angle);
      }

      return {
        id: n.id,
        type: "intel",
        position: { x, y },
        data: { label: n.label, sublabel: n.sublabel, type: n.type, risk: n.risk },
      };
    });

    const flowEdges: Edge[] = rawEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: "var(--accent)", strokeWidth: 1.5 },
      labelStyle: { fill: "var(--text-muted)", fontSize: 8, fontFamily: "monospace" },
      labelBgStyle: { fill: "var(--bg-panel)", fillOpacity: 0.85 },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [rawNodes, rawEdges]);

  return (
    <SocPanel
      title="Threat Correlation Graph"
      subtitle="IBM X-Force · Campaign infrastructure linkage"
      badge="CORRELATION ENGINE"
      noPadding
    >
      <div className="h-[380px] transition-colors" style={{ backgroundColor: "var(--bg-base)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.4}
          maxZoom={1.8}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
          <Controls className="!bg-[var(--bg-panel)] !border-[var(--border)] !rounded-2xl [&>button]:!bg-[var(--bg-panel)] [&>button]:!border-[var(--border)] [&>button]:!text-[var(--text-muted)] [&>button:hover]:!text-[var(--accent)] transition-all" />
          <MiniMap
            nodeColor={(n) => NODE_COLORS[(n.data as { type: CorrelationFlowNode["type"] }).type]?.border ?? "var(--text-muted)"}
            maskColor="rgba(0, 0, 0, 0.4)"
            bgColor="var(--bg-panel)"
            className="!border-[var(--border)] !rounded-2xl transition-all"
          />
        </ReactFlow>
      </div>
    </SocPanel>
  );
}
