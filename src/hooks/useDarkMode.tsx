// src/hooks/useDarkMode.tsx
import { useEffect, useMemo, useState } from "react";

type ThemeChoice = "light" | "dark" | "system";

declare global {
  interface Window {
    __setTheme?: (choice: ThemeChoice) => void;
  }
}

const KEY = "theme" as const;

function resolveDark(choice: ThemeChoice): boolean {
  if (choice === "dark") return true;
  if (choice === "light") return false;
  // system
  const mq = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)");
  return !!mq && !!mq.matches;
}

export const useDarkMode = (): { isDark: boolean; toggleDarkMode: () => void } => {
  // 1) Keuze laden (default: 'system' als er niets staat)
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    if (typeof window === "undefined") return "system";
    const saved = (localStorage.getItem(KEY) as ThemeChoice) || "system";
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  });

  // 2) Opgeloste modus berekenen op basis van keuze + systeem
  const isDark = useMemo(() => resolveDark(choice), [choice]);

  // 3) Toepassen op DOM bij iedere verandering van de OPGELOSTE modus
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const body = document.body;

    // classes
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    body.classList.toggle("dark", isDark);
    body.classList.toggle("light", !isDark);

    // color-scheme hint
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  // 4) Externe sync: storage-events, system-wijzigingen, custom 'themechange'
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        const next = e.newValue as ThemeChoice;
        if (next === "light" || next === "dark" || next === "system") setChoice(next);
      }
    };

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMqChange = () => {
      // Alleen herberekenen als gebruiker op 'system' staat
      if (choice === "system") {
        // Trigger re-render door dezelfde keuze te zetten
        setChoice("system");
      }
    };

    const onThemeChange = (e: Event) => {
      const mode = (e as CustomEvent).detail?.mode as ThemeChoice | undefined;
      if (mode === "light" || mode === "dark" || mode === "system") {
        setChoice(mode);
      } else {
        const saved = (localStorage.getItem(KEY) as ThemeChoice) || "system";
        setChoice(saved);
      }
    };

    window.addEventListener("storage", onStorage);
    mq?.addEventListener?.("change", onMqChange);
    window.addEventListener("themechange", onThemeChange as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      mq?.removeEventListener?.("change", onMqChange);
      window.removeEventListener("themechange", onThemeChange as EventListener);
    };
  }, [choice]);

  // 5) Persist de KEUZE bij iedere wijziging van choice
  useEffect(() => {
    try {
      localStorage.setItem(KEY, choice);
    } catch { }
    // Informeer eventuele luisteraars (andere tabs / onderdelen)
    if (window.__setTheme) {
      // Belangrijk: stuur de KEUZE (light/dark/system), niet de opgeloste modus
      window.__setTheme(choice);
    } else {
      window.dispatchEvent(new CustomEvent("themechange", { detail: { mode: choice } }));
    }
  }, [choice]);

  // 6) Toggle: vanuit 'system' flippen we t.o.v. de HUIDIGE opgeloste modus
  const toggleDarkMode = () => {
    const next: ThemeChoice =
      choice === "system" ? (isDark ? "light" : "dark") : (choice === "dark" ? "light" : "dark");
    setChoice(next);
  };

  return { isDark, toggleDarkMode };
};
