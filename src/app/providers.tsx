"use client";
import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <HeroUIProvider>{children}</HeroUIProvider>
    </ThemeProvider>
  );
}