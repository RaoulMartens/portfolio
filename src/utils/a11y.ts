/**
 * Accessibility utilities — shared across pages.
 */

/** Whether the user prefers reduced motion (evaluated once at load time). */
export const prefersReducedMotion =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
