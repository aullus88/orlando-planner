"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "orlando-theme";

export function useTheme() {
  const [mode, setMode] = useState("dark"); // "light" | "dark" | "system"

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      setMode(saved);
    }
  }, []);

  // Apply class to <html> whenever mode changes
  useEffect(() => {
    const root = document.documentElement;
    let isDark;

    if (mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = mode === "dark";
    }

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);

    // Listen for system theme changes when mode is "system"
    if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e) => {
        root.classList.toggle("dark", e.matches);
        root.classList.toggle("light", !e.matches);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [mode]);

  const setTheme = useCallback((newMode) => {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  const cycle = useCallback(() => {
    const next = mode === "dark" ? "light" : mode === "light" ? "system" : "dark";
    setTheme(next);
  }, [mode, setTheme]);

  return { mode, setTheme, cycle };
}
