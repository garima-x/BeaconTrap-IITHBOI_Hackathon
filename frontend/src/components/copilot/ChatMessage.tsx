"use client";

import React from "react";
import { Terminal, User } from "lucide-react";
import { CopilotMessage } from "@/types/copilot";
import { MultiSpeakerNarrator } from "./MultiSpeakerNarrator";

interface ChatMessageProps {
  message: CopilotMessage;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-[var(--text-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-[var(--bg-base)] px-1 py-0.5 rounded-2xl text-[var(--accent)] font-mono text-[10px] border border-[var(--border)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="list-disc ml-4 space-y-1 my-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="text-[var(--text-muted)] text-xs font-mono leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuffer.push(line.slice(2));
      return;
    }
    flushList();

    if (line.startsWith("## ")) {
      elements.push(
        <h4 key={idx} className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider font-mono mt-2 mb-1">
          {line.slice(3)}
        </h4>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h3 key={idx} className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono mt-2 mb-1">
          {line.slice(2)}
        </h3>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={idx} className="h-1" />);
    } else {
      elements.push(
        <p key={idx} className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
          {renderInline(line)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-6 h-6 rounded-2xl flex items-center justify-center shrink-0 border text-xs font-mono ${
          isUser
            ? "bg-[var(--bg-panel-alt)] border-[var(--border)] text-[var(--text-muted)]"
            : "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
      </div>

      <div
        className={`max-w-[88%] rounded-2xl px-3 py-2 border ${
          isUser
            ? "bg-[var(--bg-panel-alt)] border-[var(--border)] text-[var(--text-primary)]"
            : "bg-[var(--bg-panel)] border-[var(--border)]"
        }`}
      >
        {!isUser && (
          <div className="flex items-center justify-between text-[9px] font-mono text-[var(--accent)] uppercase tracking-wider font-bold mb-1 border-b border-[var(--border)] pb-1">
            <span>ANALYST COPILOT</span>
            <MultiSpeakerNarrator textToRead={message.content} />
          </div>
        )}
        <div className="space-y-0.5">{renderContent(message.content)}</div>
        <div className="text-[9px] font-mono text-[var(--text-muted)] mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
