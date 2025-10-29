import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Globale scroll-manager:
 * - Scrolt naar boven bij elke routewissel
 * - BEHALVE als je naar de "Work" sectie op home navigeert
 *   (hash === "#work" of location.state?.scrollTo === "work").
 */
const ScrollToTop: React.FC = () => {
  // In RRv6 is de state type-onbekend; we specificeren hem hier zelf.
  const { pathname, hash, state } = useLocation() as {
    pathname: string;
    hash: string;
    state?: { scrollTo?: "work" } | null;
  };

  useEffect(() => {
    const goingToWork = hash === "#work" || state?.scrollTo === "work";
    if (goingToWork) return;

    // Scroll nadat de nieuwe route getekend is.
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname, hash, state]);

  return null;
};

export default ScrollToTop;
