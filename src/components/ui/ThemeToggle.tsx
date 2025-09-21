"use client";
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        "inline-flex items-center gap-x-2 px-3 py-2 rounded-md border border-neutral-200 text-sm transition-colors " +
        "bg-white text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 " +
        (className || "")
      }
      aria-pressed={isDark}
      aria-label={isDark ? "Växla till ljust läge" : "Växla till mörkt läge"}
      title={isDark ? "Växla till ljust läge" : "Växla till mörkt läge"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{isDark ? "Ljust läge" : "Mörkt läge"}</span>
    </button>
  );
}
