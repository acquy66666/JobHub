import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces — driven by CSS vars (dark default + light @media)
        "bg-0": "var(--bg-0)",
        "bg-1": "var(--bg-1)",
        "bg-2": "var(--bg-2)",
        "bg-3": "var(--bg-3)",
        // Text
        t0: "var(--t0)",
        t1: "var(--t1)",
        t2: "var(--t2)",
        // Brand — single amber accent (legacy keys repointed)
        primary: "var(--accent)",
        accent: "var(--accent)",
        pink: "var(--accent)", // DEPRECATED
        "border-dark": "var(--border)",
        // Status
        success: "var(--green)",
        warning: "var(--yellow)",
        danger: "var(--red)",
      },
      backgroundImage: {
        // DEPRECATED — single amber, migrate callers to bg-accent
        "brand-gradient": "linear-gradient(135deg, var(--accent), var(--accent-hover))",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        wrap: "1180px",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        blink: "blink 2s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
