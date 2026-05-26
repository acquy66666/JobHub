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
        // JobHub backgrounds
        "bg-0": "#07070D",
        "bg-1": "#0E0E18",
        "bg-2": "#13131E",
        "bg-3": "#1A1A28",
        // Text
        t0: "#F5F5FF",
        t1: "#9494B0",
        t2: "#55556A",
        // Brand
        primary: "#7C3AED",
        accent: "#3B82F6",
        "border-dark": "#252538",
        // Status
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        pink: "#F472B6",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED, #3B82F6)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
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
