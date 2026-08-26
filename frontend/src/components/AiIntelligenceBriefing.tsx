"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAnalysis } from "@/context/AnalysisContext";

interface BriefingData {
  copilotBriefing: Record<string, string>;
  confidence: number;
  exposure: string;
  priority: string;
  metrics?: {
    totalCases: number;
    criticalCasesCount: number;
    averageRiskScore: number;
    citizenExposure: string;
  };
}

const DEFAULT_BRIEFING: BriefingData = {
  copilotBriefing: {
    en: "Active campaigns detected targeting mobile banking applications via OTP interception and accessibility abuse. Immediate review of high-risk cases recommended.",
    hi: "ओटीपी इंटरसेप्शन और एक्सेसिबिलिटी दुरुपयोग के माध्यम से बैंकिंग अनुप्रयोगों को लक्षित करने वाले सक्रिय अभियानों का पता चला है। उच्च जोखिम वाले मामलों की तत्काल समीक्षा की सिफारिश की जाती है।",
    te: "OTP అంతరాయం మరియు యాక్సెసిబిలిటీ దుర్వినియోగం ద్వారా బ్యాంకింగ్ అప్లికేషన్‌లను లక్ష్యంగా చేసుకునే క్రియాశీల ప్రచారాలు కనుగొనబడ్డాయి. అధిక ప్రమాదం ఉన్న కేసుల తక్షణ సమీక్ష సిఫార్సు చేయబడింది.",
    kn: "OTP ಪ್ರತಿಬಂಧ ಮತ್ತು ಪ್ರವೇಶಿಸುವಿಕೆ ದುರುಪಯೋಗದ ಮೂಲಕ ಬ್ಯಾಂಕಿಂಗ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಳನ್ನು ಗುರಿಯಾಗಿಸುವ ಸಕ್ರಿಯ ಪ್ರಚಾರಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗಿದೆ. ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರಕರಣಗಳ ತಕ್ಷಣದ ಪರಿಶೀಲನೆಯನ್ನು ಶಿಫारಸು ಮಾಡಲಾಗಿದೆ.",
    ta: "OTP இடைமறிப்பு மற்றும் அணுகல் துஷ்பிரயோகம் மூலம் வங்கி பயன்பாடுகளை இலக்காகக் கொண்ட செயலில் உள்ள பிரச்சாரங்கள் கண்டறியப்பட்டுள்ளன. அதிக ஆபத்துள்ள வழக்குகளை உடனடியாக மதிப்பாய்வு செய்ய பரிந்துரைக்கப்படுகிறது."
  },
  confidence: 94,
  exposure: "High Exposure",
  priority: "Immediate Action",
  metrics: {
    totalCases: 143,
    criticalCasesCount: 18,
    averageRiskScore: 74,
    citizenExposure: "High"
  }
};

export default function AiIntelligenceBriefing() {
  const { language } = useAnalysis();
  const { t } = useTranslation();
  const [data, setData] = useState<BriefingData>(DEFAULT_BRIEFING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = () => {
    fetch("/api/admin/executive-summary")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load briefing");
        return res.json();
      })
      .then((resData: BriefingData) => {
        if (resData && resData.copilotBriefing) {
          setData(resData);
        }
      })
      .catch(() => {
        setData(DEFAULT_BRIEFING);
      });
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  const getPriorityStyle = (priority: string) => {
    const text = priority.toLowerCase();
    if (text.includes("immediate") || text.includes("critical")) {
      return "text-[var(--severity-critical)] bg-[var(--severity-critical)]/10 border-[var(--severity-critical)]/30";
    }
    if (text.includes("high") || text.includes("warning")) {
      return "text-[var(--severity-high)] bg-[var(--severity-high)]/10 border-[var(--severity-high)]/30";
    }
    if (text.includes("watchlist") || text.includes("moderate")) {
      return "text-[var(--severity-medium)] bg-[var(--severity-medium)]/10 border-[var(--severity-medium)]/30";
    }
    return "text-[var(--severity-low)] bg-[var(--severity-low)]/10 border-[var(--severity-low)]/30";
  };

  return (
    <div className="relative overflow-hidden border border-[var(--border)] rounded-2xl p-5 md:p-6 bg-[var(--bg-panel)] transition-colors font-mono">
      {loading ? (
        <div className="flex items-center gap-3 py-4 font-mono">
          <Sparkles className="w-5 h-5 text-[var(--accent)] animate-spin" />
          <span className="text-xs text-[var(--accent)] uppercase tracking-widest animate-pulse">
            AI Copilot is synthesizing threat matrix briefings...
          </span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-[var(--severity-critical)]">
            <AlertCircle className="w-4 h-4" />
            <span>AI intelligence offline: {error}</span>
          </div>
          <button
            onClick={fetchBriefing}
            className="flex items-center gap-1 text-[var(--accent)] border border-[var(--accent)]/30 rounded-2xl px-2 py-1 bg-[var(--bg-panel-alt)] uppercase text-[10px]"
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-xs font-bold font-mono tracking-wider text-[var(--text-primary)] uppercase">
                {t('beacontrap_ai') || "BEACONTRAP AI INTELLIGENCE BRIEFING"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 rounded-2xl font-bold tracking-wider">
                {t('copilot_active') || "COPILOT ACTIVE"}
              </span>
            </div>
          </div>

          {/* Briefing Content */}
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 justify-between">
            {/* Primary message */}
            <div className="flex-1 space-y-2">
              <p className="text-xs md:text-sm leading-relaxed font-sans text-[var(--text-primary)]">
                <span className="font-mono text-base font-bold text-[var(--accent)] mr-1">A</span>
                {data.copilotBriefing[language] || data.copilotBriefing.en}
              </p>
            </div>

            {/* Structured Telemetry KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0 font-mono text-xs w-full md:w-auto">
              {/* Confidence Score */}
              <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  {t('confidence') || "CONFIDENCE"}
                </span>
                <span className="text-xl font-bold font-mono text-[var(--accent)]">
                  {data.confidence}%
                </span>
              </div>

              {/* Exposure */}
              <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  {t('potential_exposure') || "POTENTIAL EXPOSURE"}
                </span>
                <span className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase">
                  {data.exposure}
                </span>
              </div>

              {/* Priority Action */}
              <div className="bg-[var(--bg-panel-alt)] border border-[var(--border)] rounded-2xl p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  {t('recommended_priority') || "RECOMMENDED PRIORITY"}
                </span>
                <span className={`text-[10px] font-bold font-mono uppercase px-2 py-1 rounded-2xl border ${getPriorityStyle(data.priority)}`}>
                  {data.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
