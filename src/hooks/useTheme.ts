import { useState, useEffect } from "react";

export type ThemeMode = "dark" | "light" | "system";

function getStoredMode(): ThemeMode {
  const stored = localStorage.getItem("mannymap_theme");
  if (stored === "dark" || stored === "light" || stored === "system") return stored;
  return "dark"; // default
}

function applyMode(mode: ThemeMode) {
  if (mode === "system") {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", systemDark);
  } else {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }
  localStorage.setItem("mannymap_theme", mode);
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(getStoredMode);

  const setMode = (newMode: ThemeMode) => {
    applyMode(newMode);
    setModeState(newMode);
  };

  // Keep in sync if something else changes the class or localStorage
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setModeState(getStoredMode());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Re-apply system preference if mode is "system" and OS preference changes
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  return { mode, setMode };
}
