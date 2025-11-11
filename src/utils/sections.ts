// src/utils/sections.ts
/**
 * Sync van actieve home-sectie via CustomEvent.
 * - emitSection(): emit alleen bij verandering
 * - readSectionFromWindow(): huidige sectie (SSR-safe)
 * - onSectionChange(): typede listener met unsubscribe
 */

export type Section = "home" | "work";
export const SECTION_EVENT = "sectionchange" as const;

export interface SectionChangeDetail {
  section: Section;
}
export type SectionEvent = CustomEvent<SectionChangeDetail>;

declare global {
  interface Window {
    __section?: Section;
  }
}

let lastSection: Section | undefined;

/** Interne guard tegen ongeldige waarden in dynamische aanroepen. */
function isValidSection(x: unknown): x is Section {
  return x === "home" || x === "work";
}

/** Lees de huidige sectie. Valt terug op "home" (SSR-safe). */
export function readSectionFromWindow(): Section {
  if (typeof window === "undefined") return "home";
  return window.__section ?? lastSection ?? "home";
}

/** Emit een sectiewijziging. Emit alleen als de waarde verandert. */
export function emitSection(section: Section): void {
  if (!isValidSection(section)) return;

  // SSR
  if (typeof window === "undefined") {
    lastSection = section;
    return;
  }

  const current = window.__section ?? lastSection ?? "home";
  if (current === section) return; // ruis voorkomen

  window.__section = section;
  lastSection = section;

  // Typede CustomEvent payload
  const evt = new CustomEvent<SectionChangeDetail>(SECTION_EVENT, {
    detail: { section },
  });
  window.dispatchEvent(evt);
}

/**
 * Luister op sectiewijzigingen. Retourneert een cleanup-functie.
 * Voorbeeld:
 *   const off = onSectionChange(({ section }) => { ... });
 *   // later: off();
 */
export function onSectionChange(
  handler: (detail: SectionChangeDetail, ev: SectionEvent) => void
): () => void {
  if (typeof window === "undefined") return () => { };

  const wrapped = (ev: Event) => {
    const e = ev as SectionEvent;
    const d = e.detail;
    if (d && isValidSection(d.section)) handler(d, e);
  };

  window.addEventListener(SECTION_EVENT, wrapped as EventListener);
  return () => window.removeEventListener(SECTION_EVENT, wrapped as EventListener);
}
