"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border hover:bg-[var(--bg-panel-alt)] hover:text-[var(--text-primary)] transition-all cursor-pointer font-mono text-[10px] tracking-wider font-bold shadow-sm"
      style={{
        borderColor: "var(--card-border)",
        backgroundColor: "var(--card)",
        color: "var(--text-secondary)",
      }}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-3.5 h-3.5 text-cyan-400" />
          <span>LIGHT MODE</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-indigo-500" />
          <span>DARK MODE</span>
        </>
      )}
    </button>
  );
}
