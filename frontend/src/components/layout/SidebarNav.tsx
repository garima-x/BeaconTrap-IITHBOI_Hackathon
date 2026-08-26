"use client";

import React from "react";
import { LayoutDashboard, Upload, FlaskConical, Terminal, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SidebarNavProps {
  activeView: "LANDING" | "DASHBOARD" | "UPLOAD" | "ANALYSIS_LAB" | "DEMO_WALKTHROUGH";
  onViewChange: (view: "LANDING" | "DASHBOARD" | "UPLOAD" | "ANALYSIS_LAB" | "DEMO_WALKTHROUGH") => void;
}

export default function SidebarNav({ activeView, onViewChange }: SidebarNavProps) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: "LANDING" as const,
      label: "Platform Overview",
      icon: Terminal,
    },
    {
      id: "DASHBOARD" as const,
      label: t('soc_dashboard') || "SOC Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "DEMO_WALKTHROUGH" as const,
      label: "Demo Walkthrough",
      icon: Activity,
      badge: "MOCK",
    },
    {
      id: "UPLOAD" as const,
      label: t('upload_apk') || "Upload APK",
      icon: Upload,
    },
    {
      id: "ANALYSIS_LAB" as const,
      label: t('analysis_lab') || "Analysis Lab",
      icon: FlaskConical,
      badge: "LIVE",
    },
  ];


  return (
    <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto bg-[var(--sidebar-bg)]">
      <div>
        <div className="px-2 mb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--sidebar-text)]">
          OPERATIONS
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors border-l-2 text-left rounded-r-2xl ${
                  isActive
                    ? "border-[var(--sidebar-active-border)] bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text-active)] font-semibold"
                    : "border-transparent text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-[var(--sidebar-item-hover)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[var(--sidebar-active-border)]" : "text-[var(--sidebar-text)]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-[rgba(255,255,255,0.15)] text-[var(--sidebar-active-border)] border border-[rgba(255,255,255,0.25)] rounded-2xl">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--sidebar-border)]">
        <div className="px-2 mb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--sidebar-text)]">
          THREAT INTEL STATUS
        </div>
        <div className="space-y-2 px-2 py-1 text-xs">
          <div className="flex items-center justify-between border-b border-[var(--sidebar-border)] pb-2 text-xs">
            <span className="text-[var(--sidebar-text)]">MITRE Coverage</span>
            <span className="text-[var(--sidebar-text-active)] font-mono font-semibold">100%</span>
          </div>
          <div className="flex items-center justify-between border-b border-[var(--sidebar-border)] pb-2 text-xs">
            <span className="text-[var(--sidebar-text)]">C2 Engine</span>
            <span className="text-[var(--sidebar-active-border)] font-mono font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--sidebar-active-border)]"></span> ACTIVE
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-[var(--sidebar-text)]">YARA Signatures</span>
            <span className="text-[var(--sidebar-text-active)] font-mono font-semibold">12,408</span>
          </div>
        </div>
      </div>

      {/* Forensic Log Stream Ticker */}
      <div className="pt-2 border-t border-[var(--sidebar-border)]">
        <div className="px-2 mb-1.5 flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--sidebar-text)]">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-[var(--sidebar-active-border)]" /> TELEMETRY STREAM
          </span>
        </div>
        <div className="bg-[rgba(255,255,255,0.08)] border border-[var(--sidebar-border)] rounded-2xl p-2 font-mono text-[10px] text-[var(--sidebar-text)] space-y-1 overflow-hidden h-28">
          <div className="text-[var(--sidebar-active-border)] truncate">&gt; DETECTED: READ_SMS</div>
          <div className="truncate">&gt; IOC: 185.220.101.5</div>
          <div className="truncate">&gt; C2: /api/v1/exfil</div>
          <div className="text-[var(--sidebar-active-border)] truncate">&gt; STACK: BankingTrojan</div>
          <div className="truncate">&gt; SHA: a4f8e2190...</div>
          <div className="truncate">&gt; EV: RECEIVE_SMS</div>
        </div>
      </div>
    </nav>
  );
}
