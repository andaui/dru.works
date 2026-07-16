"use client";

import { useTheme } from "@/components/ThemeProvider";

type ThemeLabelToggleProps = {
  className?: string;
};

/** Dark mode is disabled site-wide; flip to true to bring the toggle back. */
const DARK_MODE_ENABLED = false;

export default function ThemeLabelToggle({ className = "" }: ThemeLabelToggleProps) {
  const { theme, setTheme } = useTheme();

  if (!DARK_MODE_ENABLED) return null;

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={`bg-transparent border-0 p-0 m-0 cursor-pointer font-inter font-normal text-[14px] leading-[19px] text-[#989898] dark:text-muted hover:text-foreground transition-colors shrink-0 ${className}`}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
