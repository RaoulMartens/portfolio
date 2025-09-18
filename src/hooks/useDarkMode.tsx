// src/hooks/useDarkMode.tsx
import { useEffect, useState } from "react";

type ThemeChoice = "light" | "dark" | "system";

declare global {
  interface Window {
    __setTheme?: (choice: ThemeChoice) => void;
  }
}

const KEY: "theme" = "theme";

function isDarkFrom(choice: ThemeChoice): boolean {
  if (choice === "dark") return true;
  if (choice === "light") return false;
  const mq = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)");
  return !!mq && !!mq.matches;
}

export const useDarkMode = (): { isDark: boolean; toggleDarkMode: () => void } => {
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    if (typeof window === "undefined") return "light";
    const saved = (localStorage.getItem(KEY) as ThemeChoice) || "system";
    return saved;
  });

  const isDark = isDarkFrom(choice);

  // Apply whenever our resolved state changes (mirror the bootstrap)
  useEffect(() => {
    const next: ThemeChoice = isDark ? "dark" : "light";

    if (window.__setTheme) {
      window.__setTheme(next);
    } else {
      // Fallback if bootstrap isn't present for some reason
      const root = document.documentElement;
      const body = document.body;
      root.classList.toggle("dark", next === "dark");
      root.classList.toggle("light", next === "light");
      body.classList.toggle("dark", next === "dark");
      body.classList.toggle("light", next === "light");
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      try {
        root.style.colorScheme = next;
      } catch {}
      // Let other mounted components know
      window.dispatchEvent(new CustomEvent("themechange", { detail: { mode: next } }));
    }
  }, [isDark]);

  // Stay in sync with other parts of the app / tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setChoice(e.newValue as ThemeChoice);
    };

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMq = () => {
      if (choice === "system") setChoice("system"); // recompute isDark
    };

    const onThemeChange = (e: Event) => {
      const mode = (e as CustomEvent).detail?.mode as ThemeChoice | undefined;
      if (mode) setChoice(mode);
      else {
        const saved = (localStorage.getItem(KEY) as ThemeChoice) || "system";
        setChoice(saved);
      }
    };

    window.addEventListener("storage", onStorage);
    mq?.addEventListener?.("change", onMq);
    window.addEventListener("themechange", onThemeChange as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      mq?.removeEventListener?.("change", onMq);
      window.removeEventListener("themechange", onThemeChange as EventListener);
    };
  }, [choice]);

  const toggleDarkMode = () => {
    const next: ThemeChoice = isDark ? "light" : "dark";
    setChoice(next);
    // Optimistically inform others immediately
    if (window.__setTheme) window.__setTheme(next);
    else {
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      window.dispatchEvent(new CustomEvent("themechange", { detail: { mode: next } }));
    }
  };

  return { isDark, toggleDarkMode };
};
