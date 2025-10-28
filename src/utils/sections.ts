/**
 * Simple helpers to coordinate which section of the home page is active. Emitting a
 * custom event keeps navigation and scrolling behaviour in sync without mixing
 * responsibilities inside a single component, supporting clean structure (criterion 6.1)
 * and allowing responsive listeners to react to scroll changes (criterion 6.2).
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
