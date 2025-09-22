"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme";
const LIGHT_COLOR = "#377b7b"; // matches primary light
const DARK_COLOR = "#2f6767";  // matches primary dark

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    if (initialTheme === 'light' || initialTheme === 'dark') return initialTheme;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? "dark" : "light";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { window.localStorage.setItem(STORAGE_KEY, t); } catch {}
  };

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  // Apply to <html> class and meta theme-color
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    let meta = document.querySelector<HTMLMetaElement>('meta#theme-color');
    if (!meta) {
      meta = document.createElement('meta');
      meta.id = 'theme-color';
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = theme === "dark" ? DARK_COLOR : LIGHT_COLOR;
    // sync cookie for SSR
    try {
      document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {}
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
