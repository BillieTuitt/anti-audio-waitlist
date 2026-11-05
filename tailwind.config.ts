import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme colours come from CSS variables (see app/globals.css) so opacity modifiers still work.
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        accent: "#F6C944",
      },
      fontFamily: {
        // Owners comes from the Adobe Fonts kit linked in app/layout.tsx.
        display: ["owners", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
