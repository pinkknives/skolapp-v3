"use client";
import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ 
  children,
  initialTheme,
}: { 
  children: React.ReactNode,
  initialTheme?: "light" | "dark"
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </ThemeProvider>
  );
}