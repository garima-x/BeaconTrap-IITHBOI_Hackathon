/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        base: 'var(--bg-base)',
        panel: {
          DEFAULT: 'var(--bg-panel)',
          alt: 'var(--bg-panel-alt)',
        },
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          cool: 'var(--accent-cool)',
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--card-bg-secondary)",
        },
        card: {
          DEFAULT: "var(--card)",
          border: "var(--card-border)",
          secondary: "var(--card-bg-secondary)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        severity: {
          critical: "var(--severity-critical)",
          high: "var(--severity-high)",
          medium: "var(--severity-medium)",
          low: "var(--severity-low)",
        }
      }
    },
  },
  plugins: [],
}
