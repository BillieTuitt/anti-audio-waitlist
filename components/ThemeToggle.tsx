"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "aa-theme";
const THEME_COLOR: Record<Theme, string> = { light: "#EEEEEE", dark: "#15161B" };

// A LIGHT | DARK switch. The saved choice is applied before first paint by the
// inline script in app/layout.tsx; this just reads it back and changes it.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[next]);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice just won't persist.
    }
    setTheme(next);
  }

  const option = (value: Theme, label: string) => (
    <span
      className={[
        "px-2.5 py-1.5 transition-colors duration-300",
        theme === value ? "bg-ink text-bg" : "text-ink/60",
      ].join(" ")}
    >
      {label}
    </span>
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Dark theme"
      onClick={toggle}
      className="fixed right-3 top-3 z-[60] flex items-stretch border border-ink/40 bg-bg/70 font-mono text-[11px] tracking-wide backdrop-blur-md transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:right-5 sm:top-5"
    >
      {option("light", "Light")}
      {option("dark", "Dark")}
    </button>
  );
}
