"use client";

import React from "react";

interface SocPanelProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

export default function SocPanel({
  title,
  subtitle,
  badge,
  badgeColor = "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/30",
  children,
  className = "",
  headerRight,
  noPadding = false,
}: SocPanelProps) {
  return (
    <div className={`bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-panel-alt)]">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-2xl border uppercase tracking-wider font-bold ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        {headerRight}
      </div>
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </div>
  );
}
