import React from "react";
import { Server, Activity, CheckCircle2, RefreshCw, X, Database, Cpu, HardDrive } from "lucide-react";

interface ServerTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerTelemetryModal: React.FC<ServerTelemetryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const nodes = [
    { name: "FastAPI Cyber Core Service", port: "8000", status: "HEALTHY", latency: "18 ms", group: "Backend API" },
    { name: "Gemini 1.5 LLM Gateway", port: "443", status: "ONLINE", latency: "142 ms", group: "AI Engine" },
    { name: "SQLite / PostgreSQL Relational DB", port: "5432", status: "HEALTHY", latency: "4 ms", group: "Database" },
    { name: "Neo4j Malware DNA Graph Engine", port: "7687", status: "HEALTHY", latency: "12 ms", group: "Graph Engine" },
    { name: "Ethereum EVM Smart Contract Node", port: "8545", status: "ANCHORED", latency: "2 ms", group: "Blockchain" }
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-card-border bg-card p-6 shadow-2xl space-y-6 font-sans text-text-primary">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono uppercase tracking-wider text-text-primary">
                C2 & Infrastructure Telemetry
              </h3>
              <p className="text-xs text-text-muted font-mono">
                Real-Time Node Health, Database Connections & Pipeline Metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-2xl border border-card-border hover:bg-card-bg-secondary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* System Load Cards */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-card-bg-secondary border border-card-border flex flex-col items-center">
            <span className="text-[10px] text-text-muted uppercase mb-1">CPU Load</span>
            <span className="text-lg font-bold text-cyan-400">14%</span>
          </div>
          <div className="p-3 rounded-xl bg-card-bg-secondary border border-card-border flex flex-col items-center">
            <span className="text-[10px] text-text-muted uppercase mb-1">RAM Allocated</span>
            <span className="text-lg font-bold text-emerald-400">3.8 GB</span>
          </div>
          <div className="p-3 rounded-xl bg-card-bg-secondary border border-card-border flex flex-col items-center">
            <span className="text-[10px] text-text-muted uppercase mb-1">Avg Latency</span>
            <span className="text-lg font-bold text-indigo-400">24 ms</span>
          </div>
        </div>

        {/* Node Health List */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted block">
            Infrastructure Node Health Matrix
          </span>
          <div className="space-y-2 font-mono text-xs">
            {nodes.map((node, i) => (
              <div key={i} className="p-3 rounded-xl border border-card-border bg-card-bg-secondary flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <div>
                    <span className="font-bold text-text-primary block">{node.name}</span>
                    <span className="text-[10px] text-text-muted">Port {node.port} // {node.group}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {node.status}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-0.5">{node.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-card-bg-secondary hover:bg-card-border text-text-primary font-bold border border-card-border cursor-pointer transition-all"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
