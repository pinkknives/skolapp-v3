"use client";
import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";

export default function Providers({ 
  children,
  initialTheme,
}: { 
  children: React.ReactNode,
  initialTheme?: "light" | "dark"
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <HeroUIProvider>
        <TooltipProvider>
          <ToastProvider />
          {children}
        </TooltipProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}