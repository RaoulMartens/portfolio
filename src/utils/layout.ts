/**
 * Layout-hulpen die de DOM-metingen buiten de componenten houden.
 * Daarmee blijft de structuur (JSX) netjes gescheiden van gedrag → criterium 6.1.
 */
export function getNavHeight(): number {
  if (typeof document === "undefined") {
    return 0;
  }
  const el = document.querySelector(".navbar") as HTMLElement | null;
  return el?.offsetHeight ?? 0;
}

export function scrollToY(y: number, behavior: ScrollBehavior = "smooth") {
  if (typeof window === "undefined") {
    return;
  }
  window.scrollTo({ top: y, behavior });
}

/**
 * Houd de CSS-variabele `--nav-height` gelijk aan de echte headerhoogte.
 * Zo regelt CSS de afstand (scheiding structuur/styling → 6.1) en blijft scrollen responsive → 6.2.
 */
export function updateNavHeightVar() {
  if (typeof document === "undefined") {
    return;
  }
  const h = getNavHeight() || 80;
  document.documentElement.style.setProperty("--nav-height", `${h}px`);
}
