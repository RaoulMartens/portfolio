import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Globale scroll-manager:
 * - Scrolt naar boven bij routewissel.
 * - Slaat 'work'-navigatie over (hash === "#work" of state.scrollTo === "work").
 * - Laat andere hashes hun werk doen (browser scrollt zelf naar het element).
 * - Zet history.scrollRestoration op 'manual' voor consistente SPA-ervaring.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash, state } = useLocation() as {
    pathname: string;
    hash: string;
    state?: { scrollTo?: "work" | "top" } | null;
  };

  // Beheer scrollRestoration voor betrouwbaarder gedrag bij SPA navigatie
  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    const prev = (window.history as any).scrollRestoration;
    (window.history as any).scrollRestoration = "manual";
    return () => {
      (window.history as any).scrollRestoration = prev ?? "auto";
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const goingToWork = hash === "#work" || state?.scrollTo === "work";
    if (goingToWork) return; // Navigatie component handelt smooth scroll/offset af

    // Laat alle andere hashes het standaard browser-gedrag volgen
    if (hash && hash !== "#work") return;

    // Scroll naar top na render-kader om layout-shifts te vermijden
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname, hash, state]);

  return null;
};

export default ScrollToTop;
