import React, { useState } from "react";
import { 
  Cpu, 
  Lock, 
  Share2, 
  FileCode2, 
  ArrowRight, 
  Activity, 
  Terminal, 
  Play
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onUploadApk: () => void;
  onSelectSampleApk?: (apkName: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onUploadApk,
  onSelectSampleApk
}) => {
  const { t } = useTranslation();
  const [selectedDemoApk, setSelectedDemoApk] = useState<string>("08_Anubis_Overlay_Trojan.apk");

  const demoApkData: Record<string, {
    name: string;
    pkg: string;
    risk: number;
    malwareType: string;
    permissions: string[];
    summary: string;
    status: "CLEAN" | "SUSPICIOUS" | "CRITICAL";
  }> = {
    "01_Official_BOI_Mobile.apk": {
      name: "01_Official_BOI_Mobile.apk",
      pkg: "com.bankofindia.mobile.official",
      risk: 18,
      malwareType: "Clean Mobile Application",
      permissions: ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE", "android.permission.VIBRATE"],
      summary: "Verified Bank of India application. Clean heuristic score with standard mobile banking permissions.",
      status: "CLEAN"
    },
    "04_Game_Mod_Booster.apk": {
      name: "04_Game_Mod_Booster.apk",
      pkg: "com.speed.gamebooster.mod",
      risk: 48,
      malwareType: "Potentially Unwanted Application (PUA)",
      permissions: ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE", "android.permission.WAKE_LOCK", "android.permission.RECEIVE_BOOT_COMPLETED"],
      summary: "Adware and performance mod requesting persistent background wake locks and boot receivers.",
      status: "SUSPICIOUS"
    },
    "08_Anubis_Overlay_Trojan.apk": {
      name: "08_Anubis_Overlay_Trojan.apk",
      pkg: "com.sbi.secure.token.anubis",
      risk: 88,
      malwareType: "Banking Trojan / Overlay Hijacker",
      permissions: ["android.permission.INTERNET", "android.permission.READ_SMS", "android.permission.RECEIVE_SMS", "android.permission.BIND_ACCESSIBILITY_SERVICE", "android.permission.SYSTEM_ALERT_WINDOW"],
      summary: "Anubis variant requesting accessibility abuse and SMS interception to steal OTP tokens.",
      status: "CRITICAL"
    },
    "10_SpyNote_RAT_Injector.apk": {
      name: "10_SpyNote_RAT_Injector.apk",
      pkg: "com.spynote.rat.remote.access",
      risk: 98,
      malwareType: "Remote Access Trojan (RAT)",
      permissions: ["android.permission.INTERNET", "android.permission.READ_SMS", "android.permission.RECEIVE_SMS", "android.permission.BIND_ACCESSIBILITY_SERVICE", "android.permission.RECORD_AUDIO", "android.permission.CAMERA", "android.permission.ACCESS_FINE_LOCATION"],
      summary: "Full Remote Access Trojan with keylogger, audio recording, camera hijacking, and SMS exfiltration.",
      status: "CRITICAL"
    }
  };

  const activeDemo = demoApkData[selectedDemoApk] || demoApkData["08_Anubis_Overlay_Trojan.apk"];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans space-y-8 max-w-7xl mx-auto">
      {/* Top operational banner band */}
      <div className="border border-[var(--border)] bg-[var(--bg-panel)] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-cool)]"></span>
          <span>IITH BOI CYBER SECURITY FORENSICS CONSOLE // NODE v3.8.26</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight left-aligned" style={{ color: "var(--text-primary)" }}>
              BeaconTrap Forensics Console — Android Malware & Banking Trojan Intelligence
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Operational malware analysis platform for security analysts and fraud investigation officers. Decompiles Android APKs, calculates trojan risk indices, extracts IOC signatures, and maps ATT&CK matrix techniques.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0 font-mono">
            <button
              onClick={onLaunchDashboard}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[var(--accent)] hover:bg-[var(--primary-hover)] text-[var(--btn-copilot-text)] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>SOC COMMAND CENTER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onUploadApk}
              className="px-4 py-2.5 rounded-2xl text-xs font-medium bg-[var(--bg-panel-alt)] border border-[var(--border)] transition-colors flex items-center gap-2 cursor-pointer"
              style={{ color: "var(--text-primary)" }}
            >
              <FileCode2 className="w-4 h-4 text-[var(--accent)]" />
              <span>UPLOAD APK</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Bar with High Contrast Text */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[var(--border)] font-mono text-xs">
          <div className="p-3 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl">
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>YARA SIGNATURE ENGINE</div>
            <div className="text-base font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>12,408 Signatures</div>
          </div>
          <div className="p-3 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl">
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>MITRE ATT&CK MATRIX</div>
            <div className="text-base font-bold mt-0.5" style={{ color: "var(--accent-cool)" }}>100% Coverage</div>
          </div>
          <div className="p-3 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl">
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>CHAIN OF CUSTODY</div>
            <div className="text-base font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>Ethereum Smart Contract</div>
          </div>
          <div className="p-3 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl">
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>ADVISORY LANGUAGES</div>
            <div className="text-base font-bold mt-0.5" style={{ color: "var(--accent)" }}>5 Regional Dialects</div>
          </div>
        </div>
      </div>

      {/* Forensic Sample Telemetry Sandbox Panel */}
      <div className="border border-[var(--border)] bg-[var(--bg-panel)] rounded-2xl p-5 space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent)] font-mono text-[10px] uppercase tracking-wider font-bold">
              <Terminal className="w-3.5 h-3.5" /> SAMPLE BINARY TELEMETRY MATRIX
            </div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Forensic Sample Telemetry Sandbox
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {Object.keys(demoApkData).map((apkKey) => (
              <button
                key={apkKey}
                onClick={() => setSelectedDemoApk(apkKey)}
                className={`px-3 py-1.5 rounded-2xl transition-colors cursor-pointer ${
                  selectedDemoApk === apkKey
                    ? "bg-[var(--accent)] text-[var(--btn-copilot-text)] font-bold"
                    : "bg-[var(--bg-panel-alt)] border border-[var(--border)]"
                }`}
                style={{ color: selectedDemoApk === apkKey ? "var(--btn-copilot-text)" : "var(--text-muted)" }}
              >
                {apkKey.split('_')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
          {/* Left Risk Rating Card */}
          <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>THREAT SCORE INDEX</span>
              <span className={`px-2 py-0.5 rounded-2xl text-[10px] font-bold uppercase ${
                activeDemo.status === "CLEAN" ? "bg-[var(--severity-low)]/15 text-[var(--severity-low)] border border-[var(--severity-low)]/30" :
                activeDemo.status === "SUSPICIOUS" ? "bg-[var(--severity-medium)]/15 text-[var(--severity-medium)] border border-[var(--severity-medium)]/30" :
                "bg-[var(--severity-critical)]/15 text-[var(--severity-critical)] border border-[var(--severity-critical)]/30"
              }`}>
                {activeDemo.status}
              </span>
            </div>

            <div className="text-center py-2 space-y-2">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-mono font-bold text-[var(--accent)]">
                  {activeDemo.risk}
                </span>
                <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>/100</span>
              </div>

              {/* Horizontal Segmented Bar Gauge */}
              <div className="flex gap-1 justify-center max-w-[160px] mx-auto pt-1">
                {[20, 40, 60, 80, 100].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full ${
                      activeDemo.risk >= step
                        ? step >= 80
                          ? "bg-[var(--severity-critical)]"
                          : step >= 50
                          ? "bg-[var(--severity-high)]"
                          : "bg-[var(--severity-low)]"
                        : "bg-[var(--border)]"
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs font-sans font-semibold pt-1" style={{ color: "var(--text-primary)" }}>
                {activeDemo.malwareType}
              </p>
            </div>

            <button
              onClick={() => {
                if (onSelectSampleApk) onSelectSampleApk(activeDemo.name);
                onLaunchDashboard();
              }}
              className="w-full py-2 bg-[var(--bg-panel)] border border-[var(--border)] transition-colors font-mono font-medium text-xs flex items-center justify-center gap-2 cursor-pointer rounded-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              <Play className="w-3 h-3 text-[var(--accent)]" />
              <span>OPEN ANALYSIS LAB</span>
            </button>
          </div>

          {/* Right Details */}
          <div className="lg:col-span-2 space-y-3">
            <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>
                <span>TARGET PACKAGE NAME</span>
                <span>FILE: {activeDemo.name}</span>
              </div>
              <div className="text-xs font-mono font-bold text-[var(--accent)] break-all">
                {activeDemo.pkg}
              </div>
              <p className="text-xs font-sans leading-relaxed pt-1" style={{ color: "var(--text-muted)" }}>
                {activeDemo.summary}
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                EXTRACTED MANIFEST PERMISSIONS ({activeDemo.permissions.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeDemo.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-2xl text-[10px] font-mono border ${
                      perm.includes("ACCESSIBILITY") || perm.includes("SMS") || perm.includes("ALERT")
                        ? "bg-[var(--severity-critical)]/10 text-[var(--severity-critical)] border-[var(--severity-critical)]/30 font-bold"
                        : "bg-[var(--bg-panel)] border-[var(--border)]"
                    }`}
                    style={
                      !perm.includes("ACCESSIBILITY") && !perm.includes("SMS") && !perm.includes("ALERT")
                        ? { color: "var(--text-muted)" }
                        : {}
                    }
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forensics Feature Modules */}
      <div className="space-y-3 font-mono">
        <div className="text-[10px] font-mono font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          FORENSIC ENGINE CAPABILITIES
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl space-y-2">
            <Cpu className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>Static & Dynamic Decompilation</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: "var(--text-muted)" }}>
              Automated binary XML manifest parsing, DEX string extraction, obfuscation index calculation, and dangerous permission flag checks.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl space-y-2">
            <Lock className="w-5 h-5 text-[var(--accent-cool)]" />
            <h3 className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>Ethereum Evidence Ledger</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: "var(--text-muted)" }}>
              Immutable SHA-256 digest hashing anchored onto Ethereum smart contracts (`EvidenceAnchor.sol`), ensuring courtroom chain-of-custody admissibility.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl space-y-2">
            <Share2 className="w-5 h-5 text-[var(--severity-high)]" />
            <h3 className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>Graph DNA & C2 Topology</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: "var(--text-muted)" }}>
              Interactive network topology graph mapping connections between malware samples, C2 IP addresses, exfiltration domains, and trojan clusters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
