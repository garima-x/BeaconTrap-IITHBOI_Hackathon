import React, { useState } from "react";
import { Shield, Key, LogOut, CheckCircle2, UserCheck, Lock, X, RefreshCw, BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose }) => {
  const { user, updateRole, logout, login, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToken = () => {
    navigator.clipboard.writeText(user.jwtToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoleChange = (role: "ANALYST" | "BANK_OFFICER" | "AUDITOR" | "ADMIN") => {
    updateRole(role);
    setAuthStatus(`Operational Persona switched to ${role}!`);
    setTimeout(() => setAuthStatus(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-card-border bg-card p-6 shadow-2xl space-y-6 font-sans text-text-primary">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono uppercase tracking-wider text-text-primary">
                User Authentication & Session
              </h3>
              <p className="text-xs text-text-muted font-mono">
                BeaconTrap Identity & Access Management (IAM)
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

        {/* Auth Status Notification Toast */}
        {authStatus && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{authStatus}</span>
          </div>
        )}

        {/* User Identity Card */}
        <div className="p-4 rounded-xl border border-card-border bg-card-bg-secondary space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center font-mono text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-text-primary flex items-center gap-1.5">
                  {user.name}
                  <BadgeCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                </h4>
                <p className="text-xs text-text-muted font-sans">{user.organization}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
              isAuthenticated ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}>
              {isAuthenticated ? "Session Active" : "Guest Mode"}
            </span>
          </div>

          <div className="pt-2 border-t border-card-border text-xs font-mono space-y-1">
            <div className="flex justify-between text-text-muted text-[11px]">
              <span>Security Clearance:</span>
              <span className="text-cyan-300 font-bold">{user.clearanceLevel}</span>
            </div>
            <div className="flex justify-between text-text-muted text-[11px]">
              <span>Session Logged At:</span>
              <span className="text-text-secondary">{user.lastLogin}</span>
            </div>
          </div>
        </div>

        {/* Operational Persona / Role Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-text-muted block">
            Select Active Security Persona (RBAC Scope)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "ANALYST", label: "SOC Analyst", desc: "Technical APK Decompilation & Forensics" },
              { id: "BANK_OFFICER", label: "Bank Officer", desc: "GRC Compliance & Risk Management" },
              { id: "CITIZEN", label: "Citizen / Public", desc: "Threat Advisory & Safety Summary" },
              { id: "AUDITOR", label: "Legal Auditor", desc: "Blockchain Chain of Custody Proofs" },
              { id: "ADMIN", label: "Sys Administrator", desc: "Heuristics & C2 System Config" }
            ].map((roleSpec) => {
              const isSelected = user.role === roleSpec.id;
              return (
                <button
                  key={roleSpec.id}
                  onClick={() => handleRoleChange(roleSpec.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold"
                      : "bg-card-bg-secondary border-card-border hover:border-cyan-500/40 text-text-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono uppercase">{roleSpec.label}</span>
                    {isSelected && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-text-muted font-sans leading-tight">
                    {roleSpec.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* JWT Token Hash Display */}
        <div className="p-3 rounded-xl border border-card-border bg-card-bg-secondary space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1"><Key className="w-3 h-3 text-cyan-400" /> JWT Session Token Digest</span>
            <button 
              onClick={copyToken}
              className="text-cyan-400 hover:underline uppercase text-[10px] font-bold cursor-pointer"
            >
              {copied ? "Copied!" : "Copy JWT"}
            </button>
          </div>
          <p className="text-[10px] font-mono text-text-muted break-all line-clamp-2 bg-background p-2 rounded border border-card-border">
            {user.jwtToken}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                setAuthStatus("Signed out. Switched to Guest Investigator mode.");
              }}
              className="px-4 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out Session
            </button>
          ) : (
            <button
              onClick={() => {
                login("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYXJzaGl0YWEiLCJyb2xlIjoiQU5BTFlTVCIsImlhdCI6MTc4MjM5MH0.signature", "ANALYST", "Officer Harshitaa");

                setAuthStatus("Authenticated successfully as Lead Analyst!");
              }}
              className="px-4 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Re-authenticate Session
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-card-bg-secondary hover:bg-card-border text-text-primary text-xs font-mono font-bold border border-card-border cursor-pointer transition-all"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
