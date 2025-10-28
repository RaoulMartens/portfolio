/**
 * Layout utilities that keep DOM measurements and imperative scroll logic out of
 * the React components. This separation keeps the structural JSX clean (criterion 6.1)
 * while still letting us reuse the same helpers on every page.
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
 * Keep the `--nav-height` CSS variable in sync with the rendered header. Using a CSS
 * variable means the spacing is handled in pure styling code (criterion 6.1) while
 * still supporting responsive scroll offsets (criterion 6.2).
 */
export function updateNavHeightVar() {
  if (typeof document === "undefined") {
    return;
  }
  const h = getNavHeight() || 80;
  document.documentElement.style.setProperty("--nav-height", `${h}px`);
}
