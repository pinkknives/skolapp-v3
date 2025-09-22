"use client";
import React, { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === "dark" : undefined;

  const label = !mounted
    ? 'Växla tema'
    : isDark
    ? 'Växla till ljust läge'
    : 'Växla till mörkt läge';

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={toggleTheme}
      className={
        "inline-flex items-center gap-x-2 px-3 py-2 rounded-md border border-neutral-200 text-sm transition-colors " +
        "bg-white text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-50 " +
        "dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:focus:ring-offset-neutral-900 " +
        (className || "")
      }
      aria-pressed={mounted ? !!isDark : undefined}
      aria-label={label}
      title={label}
    >
      {/* Neutral ikon vid SSR; riktig ikon efter mount */}
      {!mounted ? (
        <SunMoon className="h-4 w-4" aria-hidden="true" />
      ) : isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">
        {!mounted ? "Tema" : isDark ? "Ljust läge" : "Mörkt läge"}
      </span>
    </button>
  );
}
