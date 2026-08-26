"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Radio, Map, BarChart3, Database } from "lucide-react";
import { SocDashboardPayload } from "@/types/dashboard";
import AiIntelligenceBriefing from "@/components/AiIntelligenceBriefing";
import WorldThreatMap from "@/components/WorldThreatMap";
import LiveThreatFeed from "@/components/LiveThreatFeed";
import SocMetricsStrip from "./SocMetricsStrip";
import MitreHeatmap from "./MitreHeatmap";
import ThreatCorrelationFlow from "./ThreatCorrelationFlow";
import CampaignActivityPanel from "./CampaignActivityPanel";
import RiskTrendAnalytics from "./RiskTrendAnalytics";
import TopThreatFamilies from "./TopThreatFamilies";
import IocIntelligenceTable from "./IocIntelligenceTable";
import { useTranslation } from "react-i18next";

interface SocCommandCenterProps {
  data: SocDashboardPayload;
  onNavigateToUpload: () => void;
}

type LensType = "ALL" | "GLOBAL" | "TACTICAL";

export default function SocCommandCenter({ data, onNavigateToUpload }: SocCommandCenterProps) {
  const [dashboardLens, setDashboardLens] = useState<LensType>("ALL");
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Command header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border)] pb-5"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-[var(--severity-critical)] animate-pulse" />
            <span className="text-[9px] font-mono text-[var(--severity-critical)] uppercase tracking-widest font-bold">
              {t('cmd_active') || "COMMAND CENTER ACTIVE"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold font-mono tracking-tight text-[var(--text-primary)]">
            {(t('soc_command_center') || "SOC COMMAND CENTER").toUpperCase()}
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
            {t('node_ind') || "NODE IND: LEAP-205_BOI // THREAT INTELLIGENCE OPERATIONS // LIVE TELEMETRY"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Lens Filter Switcher */}
          <div className="flex gap-1 bg-[var(--bg-panel-alt)] p-1 rounded-2xl border border-[var(--border)] font-mono">
            {[
              { id: "ALL", label: t('all_analytics') || "All Analytics", icon: Database },
              { id: "GLOBAL", label: t('global_map') || "Global Map", icon: Map },
              { id: "TACTICAL", label: t('tactical') || "Tactical Matrices", icon: BarChart3 }
            ].map((lens) => {
              const Icon = lens.icon;
              const isSelected = dashboardLens === lens.id;
              return (
                <button
                  key={lens.id}
                  onClick={() => setDashboardLens(lens.id as LensType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--accent)] text-[var(--btn-copilot-text)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{lens.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onNavigateToUpload}
            className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--primary-hover)] text-[var(--btn-copilot-text)] font-mono text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            {t('upload_new') || "UPLOAD NEW APK"}
          </button>
        </div>
      </motion.div>

      {/* AI Briefing strip */}
      <AiIntelligenceBriefing />

      {/* KPI metrics */}
      <SocMetricsStrip metrics={data.metrics} />

      <AnimatePresence mode="wait">
        <motion.div
          key={dashboardLens}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="space-y-6"
        >
          {dashboardLens === "GLOBAL" && (
            <div className="space-y-6">
              <div className="w-full">
                <WorldThreatMap />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <IocIntelligenceTable iocs={data.iocIntel} />
                </div>
                <div>
                  <LiveThreatFeed />
                </div>
              </div>
            </div>
          )}

          {dashboardLens === "TACTICAL" && (
            <div className="space-y-6">
              <div className="w-full">
                <ThreatCorrelationFlow
                  nodes={data.correlationGraph.nodes}
                  edges={data.correlationGraph.edges}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MitreHeatmap cells={data.mitreHeatmap} />
                <RiskTrendAnalytics data={data.riskTrend} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopThreatFamilies families={data.threatFamilies} />
                <CampaignActivityPanel campaigns={data.campaigns} />
              </div>
            </div>
          )}

          {dashboardLens === "ALL" && (
            <>
              <WorldThreatMap />

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8">
                  <ThreatCorrelationFlow
                    nodes={data.correlationGraph.nodes}
                    edges={data.correlationGraph.edges}
                  />
                </div>
                <div className="xl:col-span-4">
                  <div className="sticky top-0">
                    <LiveThreatFeed />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MitreHeatmap cells={data.mitreHeatmap} />
                <RiskTrendAnalytics data={data.riskTrend} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopThreatFamilies families={data.threatFamilies} />
                <CampaignActivityPanel campaigns={data.campaigns} />
              </div>

              <IocIntelligenceTable iocs={data.iocIntel} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
