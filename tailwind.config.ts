import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial palette -- warm neutrals + focused accents
        paper: {
          DEFAULT: "var(--paper)",
          warm: "var(--paper-warm)",
          soft: "var(--paper-soft)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        rule: "var(--rule)",
        // Semantic accents
        ember: {
          DEFAULT: "var(--ember)",
          soft: "var(--ember-soft)",
          faint: "var(--ember-faint)",
        },
        moss: {
          DEFAULT: "var(--moss)",
          soft: "var(--moss-soft)",
          faint: "var(--moss-faint)",
        },
        slate: {
          DEFAULT: "var(--slate)",
          soft: "var(--slate-soft)",
          faint: "var(--slate-faint)",
        },
        ochre: {
          DEFAULT: "var(--ochre)",
          soft: "var(--ochre-soft)",
          faint: "var(--ochre-faint)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
      },
      boxShadow: {
        editorial: "0 1px 0 0 var(--rule), 0 0 0 0 transparent",
        panel: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 0 0 1px var(--rule)",
        lift: "0 8px 24px -12px rgb(15 23 42 / 0.18), 0 0 0 1px var(--rule)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "caret-blink": {
          "0%, 70%, 100%": { opacity: "1" },
          "20%, 50%": { opacity: "0" },
        },
        "drawer-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "drawer-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(184, 129, 43, 0.6)" },
          "100%": { boxShadow: "0 0 0 8px rgba(184, 129, 43, 0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "caret-blink": "caret-blink 1s ease-in-out infinite",
        "drawer-in": "drawer-in 220ms cubic-bezier(0.22, 0.61, 0.36, 1)",
        "drawer-out": "drawer-out 180ms cubic-bezier(0.55, 0.06, 0.68, 0.19)",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
