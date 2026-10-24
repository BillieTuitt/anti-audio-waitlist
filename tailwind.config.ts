import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#EEEEEE",
        ink: "#15161B",
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
