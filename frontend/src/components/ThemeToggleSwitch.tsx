import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleSwitch: React.FC = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsLight(true);
      document.documentElement.classList.add("light");
    } else {
      setIsLight(false);
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setIsLight(false);
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsLight(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer flex items-center justify-center font-mono text-xs"
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label="Toggle Light/Dark Theme"
    >
      {isLight ? (
        <Sun className="h-4 w-4 text-[var(--accent)]" />
      ) : (
        <Moon className="h-4 w-4 text-[var(--text-primary)]" />
      )}
    </button>
  );
};
