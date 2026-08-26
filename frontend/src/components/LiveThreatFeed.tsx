"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldAlert, Terminal, AlertTriangle, Info, Eye } from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";

interface AlertItem {
  id: string;
  caseId: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  resolved: boolean;
  createdAt: string;
  fileName?: string;
  riskScore?: number;
}

const MOCK_THREATS: AlertItem[] = [
  {
    id: "mock-1",
    caseId: "SBI-TROJAN-01",
    title: "Banking Trojan detected",
    severity: "CRITICAL",
    description: "SBI Secure Token binary matched heuristic signature for Anubis Banking Trojan family.",
    createdAt: new Date().toISOString(),
    fileName: "sbi_secure_token.apk",
    riskScore: 92,
    resolved: false
  },
  {
    id: "mock-2",
    caseId: "ACC-ABUSE-02",
    title: "Accessibility abuse identified",
    severity: "HIGH",
    description: "Request for BIND_ACCESSIBILITY_SERVICE permission detected in app manifest.",
    createdAt: new Date(Date.now() - 60000).toISOString(),
    fileName: "helper_service.apk",
    riskScore: 78,
    resolved: false
  },
  {
    id: "mock-3",
    caseId: "DOM-CORR-03",
    title: "Suspicious domain correlation found",
    severity: "MEDIUM",
    description: "Active threat intelligence match for connection to host blacklisted C2 proxy.",
    createdAt: new Date(Date.now() - 120000).toISOString(),
    fileName: "payment_update.apk",
    riskScore: 54,
    resolved: false
  },
  {
    id: "mock-4",
    caseId: "SMS-INT-04",
    title: "SMS interception indicators detected",
    severity: "CRITICAL",
    description: "Dangerous permission READ_SMS and RECEIVE_SMS abuse signature identified.",
    createdAt: new Date(Date.now() - 180000).toISOString(),
    fileName: "bank_advisor.apk",
    riskScore: 88,
    resolved: false
  }
];

export default function LiveThreatFeed() {
  const { feedList, setFeedList } = useAnalysis();
  const [dbAlerts, setDbAlerts] = useState<AlertItem[]>([]);
  const nextAlertIndex = useRef(0);
  const queueRef = useRef<AlertItem[]>([]);

  const fetchAlerts = () => {
    fetch("/api/alerts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch alerts");
        return res.json();
      })
      .then((data: AlertItem[]) => {
        const sorted = data.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setDbAlerts(sorted);
      })
      .catch((err) => {
        console.error("Error fetching live alerts:", err);
      });
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const allAlerts = [...dbAlerts];
    
    MOCK_THREATS.forEach(mock => {
      if (!allAlerts.some(a => a.title === mock.title)) {
        allAlerts.push(mock);
      }
    });

    queueRef.current = allAlerts;
    
    if (feedList.length === 0 && allAlerts.length > 0) {
      const initial = allAlerts.slice(0, 3).reverse();
      setFeedList(initial);
      nextAlertIndex.current = Math.min(3, allAlerts.length) % allAlerts.length;
    }
  }, [dbAlerts, feedList.length]);

  useEffect(() => {
    const tick = setInterval(() => {
      const queue = queueRef.current;
      if (queue.length === 0) return;

      const nextAlert = queue[nextAlertIndex.current];
      nextAlertIndex.current = (nextAlertIndex.current + 1) % queue.length;

      const alertWithNewId = {
        ...nextAlert,
        id: `${nextAlert.id}-t-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      setFeedList((prev) => {
        const filtered = prev.filter((item) => item.title !== nextAlert.title);
        return [alertWithNewId, ...filtered].slice(0, 5);
      });
    }, 4000);

    return () => clearInterval(tick);
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return {
          bg: "bg-[var(--severity-critical)]/10 border-[var(--severity-critical)]/30",
          text: "text-[var(--severity-critical)]",
          icon: ShieldAlert
        };
      case "HIGH":
        return {
          bg: "bg-[var(--severity-high)]/10 border-[var(--severity-high)]/30",
          text: "text-[var(--severity-high)]",
          icon: AlertTriangle
        };
      case "MEDIUM":
        return {
          bg: "bg-[var(--severity-medium)]/10 border-[var(--severity-medium)]/30",
          text: "text-[var(--severity-medium)]",
          icon: AlertTriangle
        };
      default:
        return {
          bg: "bg-[var(--severity-low)]/10 border-[var(--severity-low)]/30",
          text: "text-[var(--severity-low)]",
          icon: Info
        };
    }
  };

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-4 flex flex-col h-[400px] font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            LIVE THREAT STREAM
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--accent)] uppercase tracking-wider font-bold">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
          <span>LIVE FEED</span>
        </div>
      </div>

      {/* Events scrolling feed list container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0 select-none font-mono">
        {feedList.map((alert) => {
          const style = getSeverityStyle(alert.severity);
          const Icon = style.icon;
          const isMock = alert.id.startsWith("mock");

          return (
            <div
              key={alert.id}
              className="p-3 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl flex flex-col gap-1.5 transition-colors hover:border-[var(--accent)]/40"
            >
              {/* Severity & Timestamp Row */}
              <div className="flex items-center justify-between font-mono text-[9px]">
                <span className={`inline-flex items-center gap-1 font-bold border rounded-2xl px-1.5 py-0.5 uppercase ${style.text} ${style.bg}`}>
                  <Icon className="w-2.5 h-2.5" />
                  {alert.severity}
                </span>
                
                <span className="text-[var(--text-muted)]">
                  {new Date(alert.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}
                </span>
              </div>

              {/* Event Content Description */}
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono">
                  {alert.title}
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] font-sans leading-relaxed">
                  {alert.description}
                </p>
              </div>

              {/* Targets & Actions row */}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-1.5 mt-0.5 font-mono text-[9px]">
                <div className="text-[var(--text-muted)] truncate max-w-[160px]" title={alert.fileName}>
                  Target: <span className="text-[var(--text-primary)] font-semibold">{alert.fileName || "Unknown APK"}</span>
                </div>
                
                {!isMock ? (
                  <a
                    href={`/case/${alert.caseId}`}
                    className="text-[var(--accent)] hover:underline font-bold flex items-center gap-1 uppercase"
                  >
                    <Eye className="w-2.5 h-2.5" />
                    <span>Investigate</span>
                  </a>
                ) : (
                  <span className="text-[var(--text-muted)] italic uppercase">
                    Demo telemetry
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
