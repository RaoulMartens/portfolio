// src/utils/layout.ts
/**
 * Layout-hulpen die DOM-metingen centreren buiten componenten.
 * - getNavHeight(): veilige hoogtebepaling
 * - scrollToY(): consistente scroll
 * - updateNavHeightVar(): schrijft --nav-height (idempotent)
 * - startNavHeightAutoSync(): houdt var automatisch in sync; geeft cleanup terug
 */

let lastNavHeightPx = ""; // idempotent schrijven

export function getNavHeight(): number {
  if (typeof document === "undefined") return 0;

  const el = document.querySelector(".navbar") as HTMLElement | null;
  if (el && el.offsetHeight) return el.offsetHeight;

  // Fallback: probeer huidige CSS-var te lezen
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--nav-height");
    const n = parseFloat(v);
    if (Number.isFinite(n)) return n;
  } catch { }

  // Hard fallback
  return 80;
}

export function scrollToY(y: number, behavior: ScrollBehavior = "smooth") {
  if (typeof window === "undefined") return;
  // Clamp en cast
  const top = Math.max(0, Math.floor(y));
  try {
    window.scrollTo({ top, behavior });
  } catch {
    // Safari kan soms crashen op 'smooth' bij edge-cases
    window.scrollTo(0, top);
  }
}

/**
 * Schrijf CSS var --nav-height alleen als deze wijzigt.
 */
export function updateNavHeightVar() {
  if (typeof document === "undefined") return;
  const h = Math.max(0, Math.floor(getNavHeight()));
  const next = `${h}px`;
  if (next === lastNavHeightPx) return;
  document.documentElement.style.setProperty("--nav-height", next);
  lastNavHeightPx = next;
}

/**
 * Start automatische synchronisatie van --nav-height.
 * - Luistert naar ResizeObserver op .navbar
 * - Vangt window resize/orientationchange
 * - Wacht op font-load (layout shift)
 * Retourneert een cleanup() om listeners te verwijderen.
 */
export function startNavHeightAutoSync(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => { };
  }

  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateNavHeightVar();
    });
  };

  // Initieel zetten
  schedule();

  // ResizeObserver op .navbar
  const navEl = document.querySelector(".navbar") as HTMLElement | null;
  const ro =
    (window as any).ResizeObserver && navEl
      ? new ResizeObserver(() => schedule())
      : null;
  ro?.observe(navEl!);

  // Window events
  const onResize = () => schedule();
  const onOrient = () => schedule();
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onOrient);

  // Font layout shifts
  const onFontsReady = () => schedule();
  let fontsDone = false;
  try {
    // @ts-ignore
    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(() => {
        fontsDone = true;
        onFontsReady();
      });
    }
  } catch { }

  // MutationObserver: class changes op .navbar die height kunnen beïnvloeden
  const mo =
    navEl && (window as any).MutationObserver
      ? new MutationObserver(schedule)
      : null;
  mo?.observe(navEl as Node, { attributes: true, attributeFilter: ["class", "style"] });

  // Safety: nog een late tick na 300ms (images, async CSS)
  const lateTimer = window.setTimeout(schedule, 300);

  return () => {
    if (raf) cancelAnimationFrame(raf);
    ro?.disconnect();
    mo?.disconnect();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onOrient);
    if (!fontsDone) {
      // niets te verwijderen van fonts.ready promise
    }
    clearTimeout(lateTimer);
  };
}
