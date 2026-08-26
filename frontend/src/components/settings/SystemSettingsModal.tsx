import React, { useState } from "react";
import { Settings, Cpu, ShieldCheck, Database, Volume2, Save, X, CheckCircle2, Sliders } from "lucide-react";

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"AI" | "HEURISTICS" | "BLOCKCHAIN" | "ALERTS">("AI");
  const [geminiModel, setGeminiModel] = useState("gemini-1.5-pro");
  const [temp, setTemp] = useState(0.2);
  const [heuristicThreshold, setHeuristicThreshold] = useState(75);
  const [rpcUrl, setRpcUrl] = useState("http://127.0.0.1:8545");
  const [contractAddr, setContractAddr] = useState("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const [autoBlock, setAutoBlock] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-card-border bg-card p-6 shadow-2xl space-y-6 font-sans text-text-primary">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono uppercase tracking-wider text-text-primary">
                System & Telemetry Settings
              </h3>
              <p className="text-xs text-text-muted font-mono">
                Configure Heuristics, AI Engine, Ethereum Node & Alert Thresholds
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

        {savedStatus && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully! Updating telemetry pipeline configuration...</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-card-border gap-2 font-mono text-xs overflow-x-auto pb-1">
          {[
            { id: "AI", label: "AI Copilot Engine", icon: Cpu },
            { id: "HEURISTICS", label: "Threat Thresholds", icon: Sliders },
            { id: "BLOCKCHAIN", label: "Ethereum Anchor", icon: Database },
            { id: "ALERTS", label: "Audio & Alerts", icon: Volume2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl border font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                    : "bg-transparent border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="p-4 rounded-xl border border-card-border bg-card-bg-secondary space-y-4 font-mono text-xs">
          
          {/* AI Settings */}
          {activeTab === "AI" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px]">Active Gemini LLM Model</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full bg-background border border-card-border rounded p-2 text-text-primary focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (High Precision Cyber Analysis)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra-Fast Fallback)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-text-muted uppercase text-[10px]">
                  <span>LLM Temperature (Creativity vs Determinism)</span>
                  <span className="text-cyan-400 font-bold">{temp}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Heuristics Settings */}
          {activeTab === "HEURISTICS" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-text-muted uppercase text-[10px]">
                  <span>Minimum Threat Index Threshold for Critical Alerts</span>
                  <span className="text-rose-400 font-bold">{heuristicThreshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="5"
                  value={heuristicThreshold}
                  onChange={(e) => setHeuristicThreshold(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-background border border-card-border">
                <span className="text-text-primary font-sans text-xs">Automated IP & Domain C2 Blocklist Generation</span>
                <input
                  type="checkbox"
                  checked={autoBlock}
                  onChange={(e) => setAutoBlock(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Blockchain Settings */}
          {activeTab === "BLOCKCHAIN" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px]">Ethereum Web3 RPC Endpoint</label>
                <input
                  type="text"
                  value={rpcUrl}
                  onChange={(e) => setRpcUrl(e.target.value)}
                  className="w-full bg-background border border-card-border rounded p-2 text-text-primary font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px]">Smart Contract Contract Address (EvidenceAnchor.sol)</label>
                <input
                  type="text"
                  value={contractAddr}
                  onChange={(e) => setContractAddr(e.target.value)}
                  className="w-full bg-background border border-card-border rounded p-2 text-text-primary font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          )}

          {/* Audio & Alert Settings */}
          {activeTab === "ALERTS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded bg-background border border-card-border">
                <span className="text-text-primary font-sans text-xs">Enable Sound Chimes for Critical Malware Alerts</span>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-card-bg-secondary hover:bg-card-border text-text-primary font-bold border border-card-border cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};
