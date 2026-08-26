"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  X,
  Minimize2,
  Send,
  Loader2,
  FileText,
  Shield,
  Target,
  AlertTriangle,
  Terminal,
  Activity,
} from "lucide-react";
import ChatMessage from "./ChatMessage";
import { CopilotAction, CopilotCaseContext, CopilotMessage } from "@/types/copilot";

interface ChatPanelProps {
  isOpen: boolean;
  isMinimized: boolean;
  messages: CopilotMessage[];
  input: string;
  loading: boolean;
  context: CopilotCaseContext;
  suggestedPrompts: string[];
  onClose: () => void;
  onMinimize: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onAction: (action: CopilotAction) => void;
  onSuggestedPrompt: (prompt: string) => void;
}

const QUICK_ACTIONS: { action: CopilotAction; label: string; icon: React.ElementType }[] = [
  { action: "executive_summary", label: "Executive Dossier", icon: FileText },
  { action: "analyst_summary", label: "Forensic Synthesis", icon: Shield },
  { action: "explain_mitre", label: "MITRE ATT&CK Matrix", icon: Target },
  { action: "explain_iocs", label: "IOC Indicators", icon: AlertTriangle },
  { action: "explain_risk", label: "Risk Score Heuristics", icon: Activity },
  { action: "mitigation", label: "IR Action Plan", icon: Shield },
];

export default function ChatPanel({
  isOpen,
  isMinimized,
  messages,
  input,
  loading,
  context,
  suggestedPrompts,
  onClose,
  onMinimize,
  onInputChange,
  onSend,
  onAction,
  onSuggestedPrompt,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"CONSOLE" | "QUICK_ACTIONS">("CONSOLE");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`fixed top-12 bottom-0 right-0 z-[100] w-[420px] max-w-full flex flex-col bg-[var(--bg-panel)] border-l border-[var(--border)] ${
        isMinimized ? "h-12 border-t border-[var(--border)]" : "h-[calc(100vh-3rem)]"
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--border)] bg-[var(--bg-base)] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-mono font-bold text-[var(--text-primary)] tracking-wider uppercase">
              ANALYST CONSOLE
            </span>
          </div>

          <div className="flex gap-3 text-xs font-mono">
            <button
              onClick={() => setActiveTab("CONSOLE")}
              className={`py-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === "CONSOLE"
                  ? "border-[var(--accent)] text-[var(--text-primary)] font-bold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              QUERY CONSOLE
            </button>
            <button
              onClick={() => setActiveTab("QUICK_ACTIONS")}
              className={`py-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === "QUICK_ACTIONS"
                  ? "border-[var(--accent)] text-[var(--text-primary)] font-bold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              QUICK INTEL
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-1 rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)] transition-colors"
            title="Minimize Console"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-alt)] transition-colors"
            title="Close Console"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {activeTab === "QUICK_ACTIONS" && (
            <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-panel-alt)] space-y-2 shrink-0">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                SELECT SYNTHESIS ACTION
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map(({ action, label, icon: Icon }) => (
                  <button
                    key={action}
                    onClick={() => {
                      onAction(action);
                      setActiveTab("CONSOLE");
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--accent)]/50 text-xs font-mono text-[var(--text-primary)] transition-colors text-left disabled:opacity-50 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Output */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-[var(--bg-base)]">
            {messages.length === 0 && (
              <div className="py-6 space-y-4">
                <div className="border-l-2 border-[var(--accent)] bg-[var(--bg-panel)] p-3 text-xs font-mono text-[var(--text-muted)] space-y-1">
                  <div className="text-[var(--text-primary)] font-bold">&gt; ANALYST ASSISTANT READY</div>
                  <div>Ask telemetry questions, request risk breakdowns, or synthesize incident response documentation.</div>
                  {context.fileName && (
                    <div className="text-[var(--accent)] text-[11px] font-mono mt-1">
                      TARGET: {context.fileName} ({context.packageName || "N/A"})
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1">
                    SUGGESTED QUERIES
                  </div>
                  {suggestedPrompts.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => onSuggestedPrompt(prompt)}
                      className="w-full text-left border-l-2 border-[var(--accent)] bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-alt)] px-3 py-2 font-mono text-xs text-[var(--text-primary)] transition-colors rounded-r-2xl cursor-pointer block"
                    >
                      &gt; {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-mono p-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing forensic queries & AI graph heuristics...</span>
              </div>
            )}
          </div>

          {/* Left-Bordered List of Suggested Follow-ups */}
          {messages.length > 0 && suggestedPrompts.length > 0 && !loading && (
            <div className="p-2 border-t border-[var(--border)] bg-[var(--bg-panel)] space-y-1 shrink-0">
              <div className="text-[9px] font-mono font-semibold uppercase text-[var(--text-muted)] px-1">
                FOLLOW-UP QUERIES
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {suggestedPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onSuggestedPrompt(prompt)}
                    className="w-full text-left border-l-2 border-[var(--accent)] bg-[var(--bg-panel-alt)] hover:bg-[var(--border)] px-2.5 py-1 font-mono text-[11px] text-[var(--text-primary)] transition-colors rounded-r-2xl truncate cursor-pointer block"
                  >
                    &gt; {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plain Bordered Input Field */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-base)] shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter forensic query or command..."
                disabled={loading}
                className="flex-1 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/60 disabled:opacity-50"
              />
              <button
                onClick={onSend}
                disabled={loading || !input.trim()}
                className="bg-[var(--accent)] hover:bg-[var(--primary-hover)] text-[var(--btn-copilot-text)] px-3 py-2 rounded-2xl text-xs font-mono font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>RUN</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
