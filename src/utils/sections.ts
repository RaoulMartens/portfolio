/**
 * Hulpfuncties om bij te houden welke sectie van de homepage actief is.
 * Via een custom event blijft de navigatie gesynchroniseerd met het scrollgedrag.
 * Dit houdt de verantwoordelijkheid gescheiden (structuur → 6.1) en blijft responsief → 6.2.
 */
export type Section = "home" | "work";
export const SECTION_EVENT = "sectionchange";

export interface SectionChangeDetail {
  section: Section;
}

declare global {
  interface Window {
    __section?: Section;
  }
}

export function emitSection(section: Section) {
  if (typeof window === "undefined") {
    return;
  }
  window.__section = section;
  window.dispatchEvent(
    new CustomEvent<SectionChangeDetail>(SECTION_EVENT, { detail: { section } })
  );
}

export function readSectionFromWindow(): Section {
  if (typeof window === "undefined") {
    return "home";
  }
  return window.__section ?? "home";
}
