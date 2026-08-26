import React, { useMemo } from "react";
import { Cpu, Eye, PhoneCall, Smartphone, Key, Info } from "lucide-react";
import { useAnalysis } from "../../context/AnalysisContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PermissionCategory {
  title: string;
  count: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: any;
  items: Array<{ name: string; impact: string }>;
}

export default function SecurityAnalystPanel() {
  const { caseData } = useAnalysis();

  if (!caseData) {
    return (
      <div className="text-center py-10 text-xs font-mono text-[var(--text-muted)]">
        NO CASE DATA LOADED FOR SECURITY ANALYST PANEL
      </div>
    );
  }

  const permissions: string[] = useMemo(() => {
    try {
      return JSON.parse(caseData.permissions || "[]");
    } catch {
      return [];
    }
  }, [caseData.permissions]);

  const activities: string[] = useMemo(() => {
    try {
      return JSON.parse(caseData.activities || "[]");
    } catch {
      return [];
    }
  }, [caseData.activities]);

  const services: string[] = useMemo(() => {
    try {
      return JSON.parse(caseData.services || "[]");
    } catch {
      return [];
    }
  }, [caseData.services]);

  const mitreTags: { id: string; name: string }[] = useMemo(() => {
    try {
      return JSON.parse(caseData.mitreTags || "[]");
    } catch {
      return [];
    }
  }, [caseData.mitreTags]);

  const categories = useMemo(() => {
    const buckets: Record<string, { name: string; impact: string }[]> = {
      sms_otp: [],
      accessibility: [],
      overlay_system: [],
      contacts_privacy: [],
      other: []
    };

    permissions.forEach((perm) => {
      const pUpper = perm.toUpperCase();
      if (pUpper.includes("SMS") || pUpper.includes("RECEIVE_MMS") || pUpper.includes("READ_SMS")) {
        buckets.sms_otp.push({
          name: perm,
          impact: "Intercepts SMS messages containing 2FA OTP codes to automate unauthorized bank transfers."
        });
      } else if (pUpper.includes("ACCESSIBILITY") || pUpper.includes("BIND_ACCESSIBILITY")) {
        buckets.accessibility.push({
          name: perm,
          impact: "Grants full device control, recording user keystrokes & auto-clicking banking approvals."
        });
      } else if (pUpper.includes("SYSTEM_ALERT_WINDOW") || pUpper.includes("OVERLAY") || pUpper.includes("DRAW")) {
        buckets.overlay_system.push({
          name: perm,
          impact: "Displays fake banking login screen overlays on top of legitimate apps to steal PINs."
        });
      } else if (pUpper.includes("CONTACTS") || pUpper.includes("LOCATION") || pUpper.includes("CALL_LOG") || pUpper.includes("RECORD_AUDIO")) {
        buckets.contacts_privacy.push({
          name: perm,
          impact: "Exfiltrates personal contact lists and sensitive device telemetry to remote C2 servers."
        });
      } else {
        buckets.other.push({
          name: perm,
          impact: "Standard or secondary Android application permission requirement."
        });
      }
    });

    const result: PermissionCategory[] = [
      {
        title: "SMS & OTP Interception",
        count: buckets.sms_otp.length,
        color: "var(--severity-critical)",
        badgeBg: "bg-[var(--severity-critical)]/10",
        badgeBorder: "border-[var(--severity-critical)]/30",
        badgeText: "text-[var(--severity-critical)]",
        icon: Key,
        items: buckets.sms_otp
      },
      {
        title: "Accessibility Keylogging Abuse",
        count: buckets.accessibility.length,
        color: "var(--accent)",
        badgeBg: "bg-[var(--accent)]/10",
        badgeBorder: "border-[var(--accent)]/30",
        badgeText: "text-[var(--accent)]",
        icon: Eye,
        items: buckets.accessibility
      },
      {
        title: "Screen Overlay & Hijack",
        count: buckets.overlay_system.length,
        color: "var(--severity-high)",
        badgeBg: "bg-[var(--severity-high)]/10",
        badgeBorder: "border-[var(--severity-high)]/30",
        badgeText: "text-[var(--severity-high)]",
        icon: Smartphone,
        items: buckets.overlay_system
      },
      {
        title: "Privacy & Data Exfiltration",
        count: buckets.contacts_privacy.length,
        color: "var(--severity-medium)",
        badgeBg: "bg-[var(--severity-medium)]/10",
        badgeBorder: "border-[var(--severity-medium)]/30",
        badgeText: "text-[var(--severity-medium)]",
        icon: PhoneCall,
        items: buckets.contacts_privacy
      },
      {
        title: "Standard Operational Permissions",
        count: buckets.other.length,
        color: "var(--text-muted)",
        badgeBg: "bg-[var(--text-muted)]/10",
        badgeBorder: "border-[var(--text-muted)]/30",
        badgeText: "text-[var(--text-muted)]",
        icon: Info,
        items: buckets.other
      }
    ];

    return result;
  }, [permissions]);

  const pieData = useMemo(() => {
    return categories
      .filter((cat) => cat.count > 0)
      .map((cat) => ({
        name: cat.title,
        value: cat.count,
        color: cat.color
      }));
  }, [categories]);

  const highRiskCount = permissions.filter((p) => {
    const u = p.toUpperCase();
    return u.includes("SMS") || u.includes("ACCESSIBILITY") || u.includes("OVERLAY") || u.includes("SYSTEM_ALERT_WINDOW");
  }).length;

  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            Security Analyst Forensics & Threat Visualizer
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-2xl border font-bold uppercase ${
            highRiskCount > 0
              ? "bg-[var(--severity-critical)]/10 border-[var(--severity-critical)]/30 text-[var(--severity-critical)]"
              : "bg-[var(--accent-cool)]/10 border-[var(--accent-cool)]/30 text-[var(--accent-cool)]"
          }`}>
            {highRiskCount > 0 ? `${highRiskCount} HIGH RISK PERMISSIONS DETECTED` : "NO HIGH RISK PERMISSIONS DETECTED"}
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Permission Threat Distribution Pie Chart */}
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-4 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider mb-1">
              Permission Risk Breakdown
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] font-mono mb-2">
              Proportion of banking exploit vectors vs standard app permissions.
            </p>
          </div>

          {pieData.length > 0 ? (
            <div className="space-y-3">
              {/* Donut chart SVG container with zero clipping */}
              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-panel-alt)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-panel)",
                        borderColor: "var(--border)",
                        borderRadius: "4px",
                        fontSize: "11px",
                        color: "var(--text-primary)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Non-overlapping center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xl font-bold font-mono text-[var(--text-primary)] leading-none">{permissions.length}</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider leading-none mt-1">PERMISSIONS</span>
                </div>
              </div>

              {/* Clean HTML Legend below donut chart */}
              <div className="space-y-1.5 pt-3 border-t border-[var(--border)]">
                {categories.filter(c => c.count > 0).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-[var(--text-primary)] font-medium truncate">{cat.title}</span>
                    </div>
                    <span className="text-[var(--text-muted)] font-bold">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-[var(--text-muted)]">
              No permission data available.
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
            <span>Primary Exploitation Vector:</span>
            <span className="font-bold text-[var(--accent)]">
              {permissions.some(p => p.includes("BIND_ACCESSIBILITY_SERVICE")) ? "ACCESSIBILITY ABUSE" : "SMS INTERCEPTION"}
            </span>
          </div>
        </div>

        {/* Categorized Risk Analysis */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider">
            Permission Risk Vectors & Exploit Technical Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat, idx) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl p-3.5 space-y-2 ${
                    cat.count > 0 ? "bg-[var(--bg-panel-alt)] border-[var(--border)]" : "bg-[var(--bg-panel)] border-[var(--border)] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-2xl ${cat.badgeBg} ${cat.badgeText}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{cat.title}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-2xl border ${cat.badgeBg} ${cat.badgeBorder} ${cat.badgeText}`}>
                      {cat.count}
                    </span>
                  </div>

                  {cat.count > 0 ? (
                    <div className="space-y-2 mt-2">
                      {cat.items.map((item, iIdx) => (
                        <div key={iIdx} className="p-2 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)] space-y-1">
                          <div className="text-[11px] font-mono font-bold text-[var(--text-primary)] truncate flex items-center justify-between">
                            <code>{item.name}</code>
                            <span className="text-[9px] text-[var(--severity-critical)] font-mono">DANGER</span>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] font-sans leading-relaxed">
                            <span className="font-mono text-[var(--text-muted)]">Impact:</span> {item.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-mono text-[var(--text-muted)] italic">
                      No permissions requested matching vector.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Component Registry & MITRE ATT&CK Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-3.5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider">
              Background Services ({services.length})
            </span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
            {services.length > 0 ? (
              services.map((s, idx) => (
                <div key={idx} className="p-1.5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] truncate">
                  <code>{s}</code>
                </div>
              ))
            ) : (
              <span className="text-[var(--text-muted)] text-xs italic">No background services detected.</span>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-3.5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider">
              UI Entrypoints & Activities ({activities.length})
            </span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
            {activities.length > 0 ? (
              activities.map((act, idx) => (
                <div key={idx} className="p-1.5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] truncate">
                  <code>{act}</code>
                </div>
              ))
            ) : (
              <span className="text-[var(--text-muted)] text-xs italic">No activities registered.</span>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] p-3.5 rounded-2xl space-y-2">
          <span className="text-xs font-bold uppercase text-[var(--text-muted)] font-mono tracking-wider block">
            MITRE ATT&CK Mobile Technique Mapping
          </span>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {mitreTags.length > 0 ? (
              mitreTags.map((tag) => (
                <div key={tag.id} className="p-1.5 bg-[var(--severity-critical)]/10 border border-[var(--severity-critical)]/25 rounded-2xl flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[var(--severity-critical)] uppercase">{tag.id}</span>
                  <span className="text-[10px] font-mono text-[var(--text-primary)] truncate max-w-[150px]">{tag.name}</span>
                </div>
              ))
            ) : (
              <span className="text-[var(--text-muted)] text-xs italic">No matching techniques mapped.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
